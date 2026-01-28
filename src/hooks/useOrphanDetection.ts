import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCodeRegistryScanner } from "./useCodeRegistryScanner";
import { 
  OrphanEntry, 
  OrphanSource, 
  OrphanStats,
  OrphanDuplicate,
  OrphanRouteConflict
} from "@/types/orphanTypes";

interface RawDbFeature {
  id: string;
  feature_code: string;
  feature_name: string;
  route_path: string | null;
  module_code: string | null;
  description: string | null;
  source: string | null;
  created_at: string;
  is_active: boolean | null;
  group_code: string | null;
  group_name: string | null;
  display_order: number | null;
}

// Known prefixes for detecting prefixed variants (e.g., admin_announcements = announcements)
const KNOWN_PREFIXES = [
  'admin_', 'ess_', 'mss_', 'emp_', 'payroll_', 'perf_', 
  'recruit_', 'succ_', 'ben_', 'comp_', 'lms_', 'hse_',
  'wf_', 'hub_', 'enbl_', 'onb_', 'er_', 'rpt_', 'prop_',
  'ta_', 'time_', 'leave_', 'train_', 'help_', 'ai_'
];

/**
 * Extract base code by removing known prefixes
 */
const getBaseCode = (code: string): string => {
  for (const prefix of KNOWN_PREFIXES) {
    if (code.startsWith(prefix)) {
      return code.slice(prefix.length);
    }
  }
  return code;
};

/**
 * Check if a code is a prefixed variant of another
 */
const isPrefixedVariant = (code1: string, code2: string): boolean => {
  if (code1 === code2) return false;
  const base1 = getBaseCode(code1);
  const base2 = getBaseCode(code2);
  return base1 === base2 || base1 === code2 || base2 === code1;
};

/**
 * Hook for detecting and fetching orphaned database entries
 */
export function useOrphanDetection() {
  const [isLoading, setIsLoading] = useState(false);
  const [orphans, setOrphans] = useState<OrphanEntry[]>([]);
  const [stats, setStats] = useState<OrphanStats | null>(null);
  const [duplicates, setDuplicates] = useState<OrphanDuplicate[]>([]);
  const [routeConflicts, setRouteConflicts] = useState<OrphanRouteConflict[]>([]);
  const [totalDbFeatures, setTotalDbFeatures] = useState(0);
  const [prefixedVariants, setPrefixedVariants] = useState<OrphanDuplicate[]>([]);
  const [migrationBatches, setMigrationBatches] = useState<{ timestamp: string; count: number; codes: string[] }[]>([]);
  const [registryCandidates, setRegistryCandidates] = useState<OrphanEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { codeRoutes } = useCodeRegistryScanner();

  /**
   * Parse source field to OrphanSource type
   */
  const parseSource = (source: string | null): OrphanSource => {
    if (!source) return 'unknown';
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes('migration') || lowerSource === 'auto_migration') return 'auto_migration';
    if (lowerSource.includes('manual') || lowerSource === 'manual_entry') return 'manual_entry';
    if (lowerSource.includes('registry')) return 'registry';
    return 'unknown';
  };

  /**
   * Get module name from module code
   */
  const getModuleName = (moduleCode: string | null): string | null => {
    if (!moduleCode) return null;
    const moduleNames: Record<string, string> = {
      admin: "Administration",
      workforce: "Workforce",
      payroll: "Payroll",
      performance: "Performance",
      recruitment: "Recruitment",
      compensation: "Compensation",
      benefits: "Benefits",
      leave: "Leave",
      training: "Training",
      succession: "Succession",
      ess: "Employee Self-Service",
      mss: "Manager Self-Service",
      time_attendance: "Time & Attendance",
      hse: "Health, Safety & Environment",
      employee_relations: "Employee Relations",
      property: "Property Management",
      reports: "Reports",
      enablement: "Enablement",
      ai: "AI Hub",
      help: "Help Center",
      dashboard: "Dashboard",
      auth: "Authentication"
    };
    return moduleNames[moduleCode] || moduleCode;
  };

  /**
   * Calculate Levenshtein distance for similarity detection
   */
  const levenshteinDistance = (a: string, b: string): number => {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  /**
   * Check if two feature names are similar (>70% match)
   */
  const isSimilar = (name1: string, name2: string): boolean => {
    const normalized1 = name1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalized2 = name2.toLowerCase().replace(/[^a-z0-9]/g, '');
    const maxLength = Math.max(normalized1.length, normalized2.length);
    if (maxLength === 0) return false;
    const distance = levenshteinDistance(normalized1, normalized2);
    const similarity = 1 - distance / maxLength;
    return similarity > 0.7;
  };

  /**
   * Detect orphaned entries from database
   */
  const detectOrphans = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all features from database
      const { data: dbFeatures, error: dbError } = await supabase
        .from("application_features")
        .select(`
          id,
          feature_code,
          feature_name,
          route_path,
          module_code,
          description,
          source,
          created_at,
          is_active,
          group_code,
          group_name,
          display_order
        `)
        .order("module_code")
        .order("feature_name");

      if (dbError) throw dbError;

      const allDbFeatures = (dbFeatures || []) as RawDbFeature[];
      setTotalDbFeatures(allDbFeatures.length);

      // Create set of code feature codes for fast lookup
      const codeFeatureSet = new Set(codeRoutes.map(r => r.featureCode));

      // Find orphans (in DB but not in code)
      const orphanFeatures = allDbFeatures.filter(f => !codeFeatureSet.has(f.feature_code));

      // Build feature name map for duplicate detection
      const nameMap = new Map<string, string[]>();
      const routeMap = new Map<string, string[]>();

      orphanFeatures.forEach(f => {
        const normalizedName = f.feature_name.toLowerCase().trim();
        if (!nameMap.has(normalizedName)) {
          nameMap.set(normalizedName, []);
        }
        nameMap.get(normalizedName)!.push(f.feature_code);

        if (f.route_path) {
          if (!routeMap.has(f.route_path)) {
            routeMap.set(f.route_path, []);
          }
          routeMap.get(f.route_path)!.push(f.feature_code);
        }
      });

      // Detect prefixed variants (e.g., admin_announcements vs announcements)
      const prefixedVariantMap = new Map<string, string[]>();
      orphanFeatures.forEach(f => {
        const baseCode = getBaseCode(f.feature_code);
        // Find other orphans that share the same base code
        orphanFeatures.forEach(other => {
          if (other.feature_code !== f.feature_code && isPrefixedVariant(f.feature_code, other.feature_code)) {
            if (!prefixedVariantMap.has(baseCode)) {
              prefixedVariantMap.set(baseCode, []);
            }
            const existing = prefixedVariantMap.get(baseCode)!;
            if (!existing.includes(f.feature_code)) existing.push(f.feature_code);
            if (!existing.includes(other.feature_code)) existing.push(other.feature_code);
          }
        });
      });

      // Detect batch-created entries (same timestamp = likely migration)
      const batchTimestamps = new Map<string, string[]>();
      orphanFeatures.forEach(f => {
        const timestamp = new Date(f.created_at).toISOString().slice(0, 19); // Truncate to second
        if (!batchTimestamps.has(timestamp)) {
          batchTimestamps.set(timestamp, []);
        }
        batchTimestamps.get(timestamp)!.push(f.feature_code);
      });

      // Mark entries from large batches (>10) as auto_migration candidates
      const autoMigratedCodes = new Set<string>();
      batchTimestamps.forEach((codes, _timestamp) => {
        if (codes.length > 10) {
          codes.forEach(code => autoMigratedCodes.add(code));
        }
      });

      // Transform to OrphanEntry with enhanced analysis
      const orphanEntries: OrphanEntry[] = orphanFeatures.map(f => {
        const normalizedName = f.feature_name.toLowerCase().trim();
        const duplicatesOfThis = (nameMap.get(normalizedName) || []).filter(code => code !== f.feature_code);
        
        // Find prefixed variants of this entry
        const baseCode = getBaseCode(f.feature_code);
        const prefixedVariantsOfThis = (prefixedVariantMap.get(baseCode) || []).filter(code => code !== f.feature_code);
        
        // Find similar entries (Levenshtein-based)
        const similarEntries: string[] = [];
        orphanFeatures.forEach(other => {
          if (other.feature_code !== f.feature_code && 
              !duplicatesOfThis.includes(other.feature_code) &&
              !prefixedVariantsOfThis.includes(other.feature_code) &&
              isSimilar(f.feature_name, other.feature_name)) {
            similarEntries.push(other.feature_code);
          }
        });

        // Determine recommendation with enhanced logic
        let recommendation: OrphanEntry['recommendation'] = 'review';
        let recommendationReason = 'Requires manual review';

        const source = parseSource(f.source);
        const hasRoute = !!f.route_path;
        const hasDuplicate = duplicatesOfThis.length > 0;
        const hasPrefixedVariant = prefixedVariantsOfThis.length > 0;
        const isFromBatch = autoMigratedCodes.has(f.feature_code);
        const isOld = new Date(f.created_at) < new Date(Date.now() - 180 * 24 * 60 * 60 * 1000); // 6 months
        const hasDescription = !!f.description && f.description.length > 10;

        // Priority-based recommendation
        if (hasDuplicate) {
          recommendation = 'merge';
          recommendationReason = `Exact duplicate name found: ${duplicatesOfThis.slice(0, 3).join(', ')}${duplicatesOfThis.length > 3 ? '...' : ''}`;
        } else if (hasPrefixedVariant) {
          recommendation = 'merge';
          recommendationReason = `Prefixed variant detected: ${prefixedVariantsOfThis.slice(0, 3).join(', ')}`;
        } else if (isFromBatch && !hasDescription) {
          recommendation = 'archive';
          recommendationReason = 'Part of batch migration (auto-created)';
        } else if (source === 'auto_migration' && !hasDescription) {
          recommendation = 'archive';
          recommendationReason = 'Auto-migrated entry with no description';
        } else if (!hasRoute) {
          recommendation = 'delete';
          recommendationReason = 'No route path defined - incomplete entry';
        } else if (isOld && source === 'manual_entry') {
          recommendation = 'archive';
          recommendationReason = 'Stale planned feature (>6 months old)';
        } else if (hasRoute && hasDescription) {
          recommendation = 'keep_as_planned';
          recommendationReason = 'Has route and description - likely a planned feature (registry candidate)';
        }

        return {
          id: f.id,
          featureCode: f.feature_code,
          featureName: f.feature_name,
          routePath: f.route_path,
          moduleCode: f.module_code,
          moduleName: getModuleName(f.module_code),
          description: f.description,
          source,
          createdAt: new Date(f.created_at),
          isActive: f.is_active ?? true,
          hasDuplicate: hasDuplicate || hasPrefixedVariant,
          duplicateOf: [...duplicatesOfThis, ...prefixedVariantsOfThis],
          similarTo: similarEntries.slice(0, 5), // Limit similar entries
          recommendation,
          recommendationReason,
          groupCode: f.group_code,
          groupName: f.group_name,
          displayOrder: f.display_order
        };
      });

      // Calculate stats
      const sourceStats: Record<OrphanSource, number> = {
        auto_migration: 0,
        manual_entry: 0,
        registry: 0,
        unknown: 0
      };

      const moduleStats: Record<string, number> = {};
      const recommendationStats: Record<OrphanEntry['recommendation'], number> = {
        keep_as_planned: 0,
        archive: 0,
        delete: 0,
        merge: 0,
        review: 0
      };

      orphanEntries.forEach(o => {
        sourceStats[o.source]++;
        const moduleKey = o.moduleCode || 'unassigned';
        moduleStats[moduleKey] = (moduleStats[moduleKey] || 0) + 1;
        recommendationStats[o.recommendation]++;
      });

      const stats: OrphanStats = {
        total: orphanEntries.length,
        bySource: sourceStats,
        byModule: moduleStats,
        byRecommendation: recommendationStats,
        duplicateClusters: Array.from(nameMap.values()).filter(arr => arr.length > 1).length + 
                          Array.from(prefixedVariantMap.values()).length,
        routeConflicts: Array.from(routeMap.values()).filter(arr => arr.length > 1).length,
        oldestOrphan: orphanEntries.length > 0 
          ? new Date(Math.min(...orphanEntries.map(o => o.createdAt.getTime())))
          : null,
        newestOrphan: orphanEntries.length > 0
          ? new Date(Math.max(...orphanEntries.map(o => o.createdAt.getTime())))
          : null
      };

      // Build duplicate clusters (exact name matches)
      const duplicateClusters: OrphanDuplicate[] = [];
      nameMap.forEach((codes, name) => {
        if (codes.length > 1) {
          const entries = codes.map(code => orphanEntries.find(o => o.featureCode === code)!).filter(Boolean);
          duplicateClusters.push({
            featureName: entries[0]?.featureName || name,
            entries,
            suggestedPrimary: entries[0]?.featureCode || null,
            mergeRecommendation: `Keep the entry with the most complete data, delete others`
          });
        }
      });

      // Build prefixed variant clusters
      const prefixedVariantClusters: OrphanDuplicate[] = [];
      prefixedVariantMap.forEach((codes, baseCode) => {
        if (codes.length > 1) {
          const entries = codes.map(code => orphanEntries.find(o => o.featureCode === code)!).filter(Boolean);
          // Suggest the shortest code (usually the base) as primary
          const sorted = entries.sort((a, b) => a.featureCode.length - b.featureCode.length);
          prefixedVariantClusters.push({
            featureName: `Variants of: ${baseCode}`,
            entries,
            suggestedPrimary: sorted[0]?.featureCode || null,
            mergeRecommendation: `Keep base code "${sorted[0]?.featureCode}", delete prefixed variants`
          });
        }
      });

      // Build migration batch list
      const migrationBatchList: { timestamp: string; count: number; codes: string[] }[] = [];
      batchTimestamps.forEach((codes, timestamp) => {
        if (codes.length > 10) {
          migrationBatchList.push({
            timestamp,
            count: codes.length,
            codes
          });
        }
      });
      migrationBatchList.sort((a, b) => b.count - a.count);

      // Identify registry candidates (orphans that could be added to registry)
      const candidates = orphanEntries.filter(o => 
        o.recommendation === 'keep_as_planned' && 
        o.routePath && 
        o.description
      );

      // Build route conflicts
      const conflicts: OrphanRouteConflict[] = [];
      routeMap.forEach((codes, route) => {
        if (codes.length > 1) {
          const entries = codes.map(code => orphanEntries.find(o => o.featureCode === code)!).filter(Boolean);
          conflicts.push({
            routePath: route,
            entries,
            conflictReason: `${codes.length} features share the same route path`
          });
        }
      });

      setOrphans(orphanEntries);
      setStats(stats);
      setDuplicates(duplicateClusters);
      setRouteConflicts(conflicts);
      setPrefixedVariants(prefixedVariantClusters);
      setMigrationBatches(migrationBatchList);
      setRegistryCandidates(candidates);

      return {
        orphans: orphanEntries,
        stats,
        duplicates: duplicateClusters,
        routeConflicts: conflicts,
        prefixedVariants: prefixedVariantClusters,
        migrationBatches: migrationBatchList,
        registryCandidates: candidates,
        totalDbFeatures: allDbFeatures.length
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to detect orphans';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [codeRoutes]);

  /**
   * Get orphans grouped by module
   */
  const getOrphansByModule = useCallback(() => {
    const moduleMap = new Map<string, OrphanEntry[]>();
    
    orphans.forEach(orphan => {
      const key = orphan.moduleCode || 'unassigned';
      if (!moduleMap.has(key)) {
        moduleMap.set(key, []);
      }
      moduleMap.get(key)!.push(orphan);
    });

    return Array.from(moduleMap.entries()).map(([moduleCode, entries]) => ({
      moduleCode,
      moduleName: entries[0]?.moduleName || moduleCode,
      orphans: entries,
      count: entries.length,
      recommendations: {
        keep: entries.filter(e => e.recommendation === 'keep_as_planned').length,
        archive: entries.filter(e => e.recommendation === 'archive').length,
        delete: entries.filter(e => e.recommendation === 'delete').length,
        merge: entries.filter(e => e.recommendation === 'merge').length,
        review: entries.filter(e => e.recommendation === 'review').length
      }
    })).sort((a, b) => b.count - a.count);
  }, [orphans]);

  /**
   * Get orphans grouped by source
   */
  const getOrphansBySource = useCallback(() => {
    const sourceMap = new Map<OrphanSource, OrphanEntry[]>();
    
    orphans.forEach(orphan => {
      if (!sourceMap.has(orphan.source)) {
        sourceMap.set(orphan.source, []);
      }
      sourceMap.get(orphan.source)!.push(orphan);
    });

    return Array.from(sourceMap.entries()).map(([source, entries]) => ({
      source,
      orphans: entries,
      count: entries.length
    })).sort((a, b) => b.count - a.count);
  }, [orphans]);

  return {
    // State
    isLoading,
    orphans,
    stats,
    duplicates,
    routeConflicts,
    totalDbFeatures,
    prefixedVariants,
    migrationBatches,
    registryCandidates,
    error,
    
    // Actions
    detectOrphans,
    
    // Getters
    getOrphansByModule,
    getOrphansBySource,
    
    // Stats
    orphanCount: orphans.length,
    codeRouteCount: codeRoutes.length,
    prefixedVariantCount: prefixedVariants.length,
    migrationBatchCount: migrationBatches.length,
    registryCandidateCount: registryCandidates.length
  };
}
