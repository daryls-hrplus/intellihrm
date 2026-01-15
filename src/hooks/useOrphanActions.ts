import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  OrphanAction, 
  OrphanBulkAction, 
  OrphanActionResult,
  OrphanSource,
  OrphanRecommendation
} from "@/types/orphanTypes";

interface UndoState {
  token: string;
  archivedIds: string[];
  expiresAt: Date;
}

/**
 * Hook for performing actions on orphaned entries
 */
export function useOrphanActions() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<OrphanActionResult | null>(null);
  const [undoState, setUndoState] = useState<UndoState | null>(null);

  /**
   * Archive a single orphan (soft delete)
   */
  const archiveOrphan = useCallback(async (orphanId: string): Promise<OrphanActionResult> => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("application_features")
        .update({ is_active: false })
        .eq("id", orphanId);

      if (error) throw error;

      const undoToken = crypto.randomUUID();
      setUndoState({
        token: undoToken,
        archivedIds: [orphanId],
        expiresAt: new Date(Date.now() + 30000) // 30 seconds
      });

      const result: OrphanActionResult = {
        success: true,
        affectedCount: 1,
        errors: [],
        undoToken
      };

      setLastAction(result);
      toast.success("Feature archived", {
        action: {
          label: "Undo",
          onClick: () => undoArchive(undoToken)
        }
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to archive';
      toast.error(message);
      return { success: false, affectedCount: 0, errors: [message] };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Delete a single orphan (permanent)
   */
  const deleteOrphan = useCallback(async (orphanId: string): Promise<OrphanActionResult> => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("application_features")
        .delete()
        .eq("id", orphanId);

      if (error) throw error;

      const result: OrphanActionResult = {
        success: true,
        affectedCount: 1,
        errors: []
      };

      setLastAction(result);
      toast.success("Feature deleted permanently");

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      toast.error(message);
      return { success: false, affectedCount: 0, errors: [message] };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Archive multiple orphans
   */
  const archiveMultiple = useCallback(async (orphanIds: string[]): Promise<OrphanActionResult> => {
    if (orphanIds.length === 0) {
      return { success: true, affectedCount: 0, errors: [] };
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("application_features")
        .update({ is_active: false })
        .in("id", orphanIds);

      if (error) throw error;

      const undoToken = crypto.randomUUID();
      setUndoState({
        token: undoToken,
        archivedIds: orphanIds,
        expiresAt: new Date(Date.now() + 30000)
      });

      const result: OrphanActionResult = {
        success: true,
        affectedCount: orphanIds.length,
        errors: [],
        undoToken
      };

      setLastAction(result);
      toast.success(`${orphanIds.length} feature(s) archived`, {
        action: {
          label: "Undo",
          onClick: () => undoArchive(undoToken)
        }
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to archive';
      toast.error(message);
      return { success: false, affectedCount: 0, errors: [message] };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Delete multiple orphans
   */
  const deleteMultiple = useCallback(async (orphanIds: string[]): Promise<OrphanActionResult> => {
    if (orphanIds.length === 0) {
      return { success: true, affectedCount: 0, errors: [] };
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("application_features")
        .delete()
        .in("id", orphanIds);

      if (error) throw error;

      const result: OrphanActionResult = {
        success: true,
        affectedCount: orphanIds.length,
        errors: []
      };

      setLastAction(result);
      toast.success(`${orphanIds.length} feature(s) deleted permanently`);

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      toast.error(message);
      return { success: false, affectedCount: 0, errors: [message] };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Archive by source type
   */
  const archiveBySource = useCallback(async (source: OrphanSource, codeFeatureCodes: string[]): Promise<OrphanActionResult> => {
    setIsProcessing(true);
    try {
      // First, get the IDs that match the source and are orphans
      const { data: features, error: fetchError } = await supabase
        .from("application_features")
        .select("id, feature_code")
        .ilike("source", `%${source.replace('_', '%')}%`)
        .eq("is_active", true);

      if (fetchError) throw fetchError;

      // Filter to only orphans (not in code)
      const orphanIds = (features || [])
        .filter(f => !codeFeatureCodes.includes(f.feature_code))
        .map(f => f.id);

      if (orphanIds.length === 0) {
        toast.info("No matching orphans found");
        return { success: true, affectedCount: 0, errors: [] };
      }

      return archiveMultiple(orphanIds);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to archive by source';
      toast.error(message);
      return { success: false, affectedCount: 0, errors: [message] };
    } finally {
      setIsProcessing(false);
    }
  }, [archiveMultiple]);

  /**
   * Archive by module
   */
  const archiveByModule = useCallback(async (moduleCode: string, codeFeatureCodes: string[]): Promise<OrphanActionResult> => {
    setIsProcessing(true);
    try {
      const { data: features, error: fetchError } = await supabase
        .from("application_features")
        .select("id, feature_code")
        .eq("module_code", moduleCode)
        .eq("is_active", true);

      if (fetchError) throw fetchError;

      const orphanIds = (features || [])
        .filter(f => !codeFeatureCodes.includes(f.feature_code))
        .map(f => f.id);

      if (orphanIds.length === 0) {
        toast.info("No orphans in this module");
        return { success: true, affectedCount: 0, errors: [] };
      }

      return archiveMultiple(orphanIds);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to archive by module';
      toast.error(message);
      return { success: false, affectedCount: 0, errors: [message] };
    } finally {
      setIsProcessing(false);
    }
  }, [archiveMultiple]);

  /**
   * Delete by module
   */
  const deleteByModule = useCallback(async (moduleCode: string, codeFeatureCodes: string[]): Promise<OrphanActionResult> => {
    setIsProcessing(true);
    try {
      const { data: features, error: fetchError } = await supabase
        .from("application_features")
        .select("id, feature_code")
        .eq("module_code", moduleCode);

      if (fetchError) throw fetchError;

      const orphanIds = (features || [])
        .filter(f => !codeFeatureCodes.includes(f.feature_code))
        .map(f => f.id);

      if (orphanIds.length === 0) {
        toast.info("No orphans in this module");
        return { success: true, affectedCount: 0, errors: [] };
      }

      return deleteMultiple(orphanIds);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete by module';
      toast.error(message);
      return { success: false, affectedCount: 0, errors: [message] };
    } finally {
      setIsProcessing(false);
    }
  }, [deleteMultiple]);

  /**
   * Undo archive operation
   */
  const undoArchive = useCallback(async (token: string): Promise<boolean> => {
    if (!undoState || undoState.token !== token || new Date() > undoState.expiresAt) {
      toast.error("Undo expired or invalid");
      return false;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("application_features")
        .update({ is_active: true })
        .in("id", undoState.archivedIds);

      if (error) throw error;

      toast.success("Archive undone");
      setUndoState(null);
      return true;
    } catch (err) {
      toast.error("Failed to undo");
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [undoState]);

  /**
   * Export orphans to CSV
   */
  const exportToCsv = useCallback((orphans: Array<{
    featureCode: string;
    featureName: string;
    routePath: string | null;
    moduleCode: string | null;
    source: string;
    recommendation: string;
    recommendationReason: string;
    createdAt: Date;
  }>) => {
    const headers = [
      'Feature Code',
      'Feature Name',
      'Route Path',
      'Module',
      'Source',
      'Recommendation',
      'Reason',
      'Created At'
    ];

    const rows = orphans.map(o => [
      o.featureCode,
      o.featureName,
      o.routePath || '',
      o.moduleCode || '',
      o.source,
      o.recommendation,
      o.recommendationReason,
      o.createdAt.toISOString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orphan-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success("Report exported to CSV");
  }, []);

  return {
    // State
    isProcessing,
    lastAction,
    
    // Single actions
    archiveOrphan,
    deleteOrphan,
    
    // Bulk actions
    archiveMultiple,
    deleteMultiple,
    archiveBySource,
    archiveByModule,
    deleteByModule,
    
    // Utilities
    undoArchive,
    exportToCsv
  };
}
