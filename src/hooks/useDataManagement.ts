import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  PopulationConfig, 
  PurgeConfig, 
  PopulationResult, 
  PurgeResult,
  TableStatistics,
  TableDependency
} from '@/types/dataManagement';

export function useDataManagement() {
  const [isPopulating, setIsPopulating] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const { toast } = useToast();

  const getTableDependencies = async (): Promise<TableDependency[]> => {
    const { data, error } = await supabase
      .from('table_dependency_order')
      .select('*')
      .order('depth', { ascending: true });

    if (error) {
      console.error('Error fetching table dependencies:', error);
      return [];
    }
    return data || [];
  };

  const getPurgeStatistics = async (
    companyId?: string,
    purgeLevel: string = 'transactions_only'
  ): Promise<TableStatistics[]> => {
    setIsLoadingStats(true);
    try {
      const { data, error } = await supabase.rpc('get_purge_statistics', {
        p_company_id: companyId || null,
        p_purge_level: purgeLevel
      });

      if (error) {
        console.error('Error fetching purge statistics:', error);
        return [];
      }
      return data || [];
    } finally {
      setIsLoadingStats(false);
    }
  };

  const populateData = async (config: PopulationConfig): Promise<PopulationResult> => {
    setIsPopulating(true);
    try {
      const { data, error } = await supabase.functions.invoke('populate-demo-data', {
        body: config
      });

      if (error) {
        toast({
          title: 'Population Failed',
          description: error.message,
          variant: 'destructive'
        });
        return {
          success: false,
          tablesPopulated: 0,
          recordsCreated: 0,
          errors: [error.message],
          details: []
        };
      }

      toast({
        title: 'Data Populated',
        description: `Created ${data.recordsCreated} records across ${data.tablesPopulated} tables`
      });

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast({
        title: 'Population Failed',
        description: message,
        variant: 'destructive'
      });
      return {
        success: false,
        tablesPopulated: 0,
        recordsCreated: 0,
        errors: [message],
        details: []
      };
    } finally {
      setIsPopulating(false);
    }
  };

  const purgeData = async (config: PurgeConfig): Promise<PurgeResult> => {
    setIsPurging(true);
    try {
      const { data, error } = await supabase.functions.invoke('purge-transactional-data', {
        body: config
      });

      if (error) {
        toast({
          title: 'Purge Failed',
          description: error.message,
          variant: 'destructive'
        });
        return {
          success: false,
          tablesAffected: 0,
          recordsDeleted: 0,
          preservedRecords: 0,
          errors: [error.message],
          details: []
        };
      }

      if (!config.dryRun) {
        toast({
          title: 'Data Purged',
          description: `Deleted ${data.recordsDeleted} records, preserved ${data.preservedRecords}`
        });
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast({
        title: 'Purge Failed',
        description: message,
        variant: 'destructive'
      });
      return {
        success: false,
        tablesAffected: 0,
        recordsDeleted: 0,
        preservedRecords: 0,
        errors: [message],
        details: []
      };
    } finally {
      setIsPurging(false);
    }
  };

  return {
    isPopulating,
    isPurging,
    isLoadingStats,
    getTableDependencies,
    getPurgeStatistics,
    populateData,
    purgeData
  };
}
