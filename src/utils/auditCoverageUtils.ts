import { moduleMapping, getModuleFromEntityType, getEntityTypesForModule } from './auditModuleMapping';

export interface ModuleCoverage {
  module: string;
  expectedEntityTypes: string[];
  coveredEntityTypes: string[];
  coverage: number;
  lastActivity?: string;
  totalLogs: number;
}

export interface CoverageGap {
  entityType: string;
  module: string;
  status: 'missing_data' | 'orphaned';
  recommendation: string;
}

export interface AuditCoverageMetrics {
  totalModules: number;
  modulesWithCoverage: number;
  totalEntityTypes: number;
  coveredEntityTypes: number;
  overallCoverage: number;
  moduleCoverages: ModuleCoverage[];
  coverageGaps: CoverageGap[];
}

/**
 * Get all unique modules from the module mapping
 */
export function getAllModules(): string[] {
  const modules = new Set(Object.values(moduleMapping));
  return Array.from(modules).sort();
}

/**
 * Calculate coverage metrics for all modules
 */
export function calculateCoverageMetrics(
  auditedEntityTypes: Map<string, { count: number; lastActivity: string }>,
  orphanedEntityTypes: string[] = []
): AuditCoverageMetrics {
  const allModules = getAllModules();
  const moduleCoverages: ModuleCoverage[] = [];
  const coverageGaps: CoverageGap[] = [];
  
  let totalExpected = 0;
  let totalCovered = 0;
  let modulesWithCoverage = 0;

  // Calculate coverage per module
  for (const module of allModules) {
    const expectedTypes = getEntityTypesForModule(module);
    const coveredTypes = expectedTypes.filter(type => auditedEntityTypes.has(type));
    
    // Get last activity for this module
    let lastActivity: string | undefined;
    let totalLogs = 0;
    
    for (const type of coveredTypes) {
      const data = auditedEntityTypes.get(type);
      if (data) {
        totalLogs += data.count;
        if (!lastActivity || data.lastActivity > lastActivity) {
          lastActivity = data.lastActivity;
        }
      }
    }

    const coverage = expectedTypes.length > 0 
      ? Math.round((coveredTypes.length / expectedTypes.length) * 100)
      : 0;

    moduleCoverages.push({
      module,
      expectedEntityTypes: expectedTypes,
      coveredEntityTypes: coveredTypes,
      coverage,
      lastActivity,
      totalLogs,
    });

    totalExpected += expectedTypes.length;
    totalCovered += coveredTypes.length;
    if (coveredTypes.length > 0) {
      modulesWithCoverage++;
    }

    // Find gaps (expected but not covered)
    for (const type of expectedTypes) {
      if (!auditedEntityTypes.has(type)) {
        coverageGaps.push({
          entityType: type,
          module,
          status: 'missing_data',
          recommendation: `Add usePageAudit hook to the ${formatEntityType(type)} page`,
        });
      }
    }
  }

  // Find orphaned entity types (in audit logs but not in mapping)
  for (const type of orphanedEntityTypes) {
    const module = getModuleFromEntityType(type);
    if (module === 'Unknown') {
      coverageGaps.push({
        entityType: type,
        module: 'Unknown',
        status: 'orphaned',
        recommendation: `Add "${type}" to auditModuleMapping.ts`,
      });
    }
  }

  const overallCoverage = totalExpected > 0 
    ? Math.round((totalCovered / totalExpected) * 100)
    : 0;

  return {
    totalModules: allModules.length,
    modulesWithCoverage,
    totalEntityTypes: totalExpected,
    coveredEntityTypes: totalCovered,
    overallCoverage,
    moduleCoverages: moduleCoverages.sort((a, b) => b.coverage - a.coverage),
    coverageGaps: coverageGaps.sort((a, b) => a.module.localeCompare(b.module)),
  };
}

/**
 * Format entity type for display
 */
export function formatEntityType(entityType: string): string {
  return entityType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Get coverage status color
 */
export function getCoverageColor(coverage: number): string {
  if (coverage >= 90) return 'text-success';
  if (coverage >= 50) return 'text-warning';
  return 'text-destructive';
}

/**
 * Get coverage badge variant
 */
export function getCoverageBadgeVariant(coverage: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (coverage >= 90) return 'default';
  if (coverage >= 50) return 'secondary';
  if (coverage > 0) return 'outline';
  return 'destructive';
}

/**
 * Get status label for coverage
 */
export function getCoverageStatusLabel(coverage: number): string {
  if (coverage >= 90) return 'Full Coverage';
  if (coverage >= 50) return 'Partial';
  if (coverage > 0) return 'Low';
  return 'No Coverage';
}
