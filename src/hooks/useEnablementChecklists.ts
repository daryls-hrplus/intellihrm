import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface StageChecklistItem {
  id: string;
  stage: string;
  task_order: number;
  task_name: string;
  task_description: string | null;
  is_required: boolean;
}

export interface ChecklistProgress {
  id: string;
  content_status_id: string;
  checklist_item_id: string;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  notes: string | null;
}

export function useEnablementChecklists(stage?: string) {
  const [checklists, setChecklists] = useState<StageChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChecklists = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("enablement_stage_checklists")
        .select("*")
        .order("task_order", { ascending: true });

      if (stage) {
        query = query.eq("stage", stage);
      }

      const { data, error } = await query;
      if (error) throw error;
      setChecklists((data as StageChecklistItem[]) || []);
    } catch (error) {
      console.error("Error fetching checklists:", error);
      toast.error("Failed to load checklists");
    } finally {
      setIsLoading(false);
    }
  }, [stage]);

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  return { checklists, isLoading, refetch: fetchChecklists };
}

export function useContentChecklistProgress(contentStatusId?: string) {
  const [progress, setProgress] = useState<ChecklistProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!contentStatusId) {
      setProgress([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("enablement_content_checklist_progress")
        .select("*")
        .eq("content_status_id", contentStatusId);

      if (error) throw error;
      setProgress((data as ChecklistProgress[]) || []);
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setIsLoading(false);
    }
  }, [contentStatusId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const toggleTaskCompletion = async (checklistItemId: string, currentlyCompleted: boolean) => {
    if (!contentStatusId) return;

    try {
      const existingProgress = progress.find(p => p.checklist_item_id === checklistItemId);

      if (existingProgress) {
        const { error } = await supabase
          .from("enablement_content_checklist_progress")
          .update({
            is_completed: !currentlyCompleted,
            completed_at: !currentlyCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProgress.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("enablement_content_checklist_progress")
          .insert({
            content_status_id: contentStatusId,
            checklist_item_id: checklistItemId,
            is_completed: true,
            completed_at: new Date().toISOString(),
          });

        if (error) throw error;
      }

      await fetchProgress();
      toast.success(currentlyCompleted ? "Task unchecked" : "Task completed!");
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Failed to update task");
    }
  };

  const getCompletionStats = (checklistItems: StageChecklistItem[]) => {
    const total = checklistItems.length;
    const requiredTotal = checklistItems.filter(c => c.is_required).length;
    const completed = checklistItems.filter(c => 
      progress.find(p => p.checklist_item_id === c.id && p.is_completed)
    ).length;
    const requiredCompleted = checklistItems.filter(c => 
      c.is_required && progress.find(p => p.checklist_item_id === c.id && p.is_completed)
    ).length;

    return {
      total,
      completed,
      requiredTotal,
      requiredCompleted,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      requiredPercent: requiredTotal > 0 ? Math.round((requiredCompleted / requiredTotal) * 100) : 0,
      allRequiredComplete: requiredCompleted === requiredTotal,
    };
  };

  return {
    progress,
    isLoading,
    toggleTaskCompletion,
    getCompletionStats,
    refetch: fetchProgress,
  };
}
