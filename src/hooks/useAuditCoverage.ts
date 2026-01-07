import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  calculateCoverageMetrics, 
  AuditCoverageMetrics,
  getAllModules
} from '@/utils/auditCoverageUtils';
import { moduleMapping } from '@/utils/auditModuleMapping';

interface AuditVolumeData {
  date: string;
  module: string;
  count: number;
}

interface UseAuditCoverageResult {
  metrics: AuditCoverageMetrics | null;
  volumeData: AuditVolumeData[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastRefresh: Date | null;
}

export function useAuditCoverage(): UseAuditCoverageResult {
  const [metrics, setMetrics] = useState<AuditCoverageMetrics | null>(null);
  const [volumeData, setVolumeData] = useState<AuditVolumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchCoverageData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all distinct entity types with their counts and last activity
      const { data: entityData, error: entityError } = await supabase
        .from('audit_logs')
        .select('entity_type, created_at')
        .order('created_at', { ascending: false });

      if (entityError) throw entityError;

      // Process entity data
      const entityMap = new Map<string, { count: number; lastActivity: string }>();
      const orphanedTypes: string[] = [];

      for (const log of entityData || []) {
        const type = log.entity_type;
        const existing = entityMap.get(type);
        
        if (existing) {
          existing.count++;
        } else {
          entityMap.set(type, { 
            count: 1, 
            lastActivity: log.created_at 
          });
          
          // Check if this type is in our mapping
          if (!moduleMapping[type]) {
            orphanedTypes.push(type);
          }
        }
      }

      // Calculate coverage metrics
      const calculatedMetrics = calculateCoverageMetrics(entityMap, orphanedTypes);
      setMetrics(calculatedMetrics);

      // Fetch volume data for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: volumeLogs, error: volumeError } = await supabase
        .from('audit_logs')
        .select('entity_type, created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (volumeError) throw volumeError;

      // Group by date and module
      const volumeMap = new Map<string, Map<string, number>>();

      for (const log of volumeLogs || []) {
        const date = log.created_at.split('T')[0];
        const module = moduleMapping[log.entity_type] || 'Unknown';

        if (!volumeMap.has(date)) {
          volumeMap.set(date, new Map());
        }

        const dateMap = volumeMap.get(date)!;
        dateMap.set(module, (dateMap.get(module) || 0) + 1);
      }

      // Convert to array format
      const volumeArray: AuditVolumeData[] = [];
      for (const [date, moduleMap] of volumeMap) {
        for (const [module, count] of moduleMap) {
          volumeArray.push({ date, module, count });
        }
      }

      setVolumeData(volumeArray.sort((a, b) => a.date.localeCompare(b.date)));
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching audit coverage:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch coverage data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoverageData();
  }, [fetchCoverageData]);

  return {
    metrics,
    volumeData,
    loading,
    error,
    refresh: fetchCoverageData,
    lastRefresh,
  };
}
