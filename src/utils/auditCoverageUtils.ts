import { moduleMapping, getModuleFromEntityType } from './auditModuleMapping';
import { 
  auditedEntityTypes, 
  getRegisteredModules, 
  getRegisteredEntityTypesForModule,
  isEntityTypeRegistered,
  getTotalRegisteredEntityTypes
} from './auditEntityRegistry';

export interface ModuleCoverage {
  module: string;
  implementedEntityTypes: string[];  // From registry (code-based)
  activeEntityTypes: string[];       // From database (data-based)
  implementationCoverage: number;    // Always 100% if in registry
  activityLevel: number;             // % of implemented types with logs
  lastActivity?: string;
  totalLogs: number;
}

export interface CoverageGap {
  entityType: string;
  module: string;
  status: 'pending_activation' | 'orphaned' | 'not_implemented';
  recommendation: string;
}

export interface AuditCoverageMetrics {
  // Implementation metrics (code-based)
  totalModules: number;
  totalImplementedTypes: number;
  implementationCoverage: number;     // Always 100% when registry matches code
  
  // Activity metrics (data-based)
  activeEntityTypes: number;
  overallActivityLevel: number;
  modulesWithActivity: number;
  
  // Legacy compatibility
  totalEntityTypes: number;
  coveredEntityTypes: number;
  overallCoverage: number;
  modulesWithCoverage: number;
  
  moduleCoverages: ModuleCoverage[];
  coverageGaps: CoverageGap[];
}

/**
 * Get all unique modules from the entity registry
 */
export function getAllModules(): string[] {
  return getRegisteredModules();
}

/**
 * Calculate coverage metrics using registry-first approach
 * Implementation = based on code registry (static)
 * Activity = based on database logs (dynamic)
 */
export function calculateCoverageMetrics(
  auditedFromDB: Map<string, { count: number; lastActivity: string }>,
  orphanedEntityTypes: string[] = []
): AuditCoverageMetrics {
  const allModules = getRegisteredModules();
  const moduleCoverages: ModuleCoverage[] = [];
  const coverageGaps: CoverageGap[] = [];
  
  let totalImplemented = getTotalRegisteredEntityTypes();
  let totalActive = 0;
  let modulesWithActivity = 0;

  // Calculate per module
  for (const module of allModules) {
    const implementedTypes = getRegisteredEntityTypesForModule(module);
    const activeTypes = implementedTypes.filter(type => auditedFromDB.has(type));
    
    // Get activity metrics
    let lastActivity: string | undefined;
    let totalLogs = 0;
    
    for (const type of activeTypes) {
      const data = auditedFromDB.get(type);
      if (data) {
        totalLogs += data.count;
        if (!lastActivity || data.lastActivity > lastActivity) {
          lastActivity = data.lastActivity;
        }
      }
    }

    const activityLevel = implementedTypes.length > 0 
      ? Math.round((activeTypes.length / implementedTypes.length) * 100)
      : 0;

    moduleCoverages.push({
      module,
      implementedEntityTypes: implementedTypes,
      activeEntityTypes: activeTypes,
      implementationCoverage: 100, // Always 100% if in registry
      activityLevel,
      lastActivity,
      totalLogs,
    });

    totalActive += activeTypes.length;
    if (activeTypes.length > 0) {
      modulesWithActivity++;
    }

    // Find pending activation (implemented but no logs yet)
    for (const type of implementedTypes) {
      if (!auditedFromDB.has(type)) {
        coverageGaps.push({
          entityType: type,
          module,
          status: 'pending_activation',
          recommendation: `Visit the ${formatEntityType(type)} page to activate logging`,
        });
      }
    }
  }

  // Find orphaned entity types (in audit logs but not in registry)
  for (const type of orphanedEntityTypes) {
    if (!isEntityTypeRegistered(type)) {
      const module = getModuleFromEntityType(type);
      coverageGaps.push({
        entityType: type,
        module: module === 'Other' ? 'Unknown' : module,
        status: 'orphaned',
        recommendation: `Add "${type}" to auditEntityRegistry.ts`,
      });
    }
  }

  const overallActivityLevel = totalImplemented > 0 
    ? Math.round((totalActive / totalImplemented) * 100)
    : 0;

  return {
    // Implementation metrics
    totalModules: allModules.length,
    totalImplementedTypes: totalImplemented,
    implementationCoverage: 100, // Registry = code = 100% implemented
    
    // Activity metrics  
    activeEntityTypes: totalActive,
    overallActivityLevel,
    modulesWithActivity,
    
    // Legacy compatibility (map to new names)
    totalEntityTypes: totalImplemented,
    coveredEntityTypes: totalActive,
    overallCoverage: overallActivityLevel,
    modulesWithCoverage: modulesWithActivity,
    
    moduleCoverages: moduleCoverages.sort((a, b) => b.activityLevel - a.activityLevel),
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
 * Get activity status color (0% is info/blue, not destructive)
 */
export function getCoverageColor(coverage: number): string {
  if (coverage >= 90) return 'text-success';
  if (coverage >= 50) return 'text-warning';
  if (coverage > 0) return 'text-muted-foreground';
  return 'text-info';
}

/**
 * Get activity badge variant (0% is outline/info, not destructive)
 */
export function getCoverageBadgeVariant(coverage: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (coverage >= 90) return 'default';
  if (coverage >= 50) return 'secondary';
  return 'outline';
}

/**
 * Get status label for activity (not "coverage")
 */
export function getCoverageStatusLabel(coverage: number): string {
  if (coverage >= 90) return 'Active';
  if (coverage >= 50) return 'Partial';
  if (coverage > 0) return 'Low Activity';
  return 'Pending';
}
