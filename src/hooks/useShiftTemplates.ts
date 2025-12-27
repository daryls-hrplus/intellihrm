import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ShiftTemplate {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  template_type: string;
  department_id: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  department?: { name: string } | null;
  entries?: ShiftTemplateEntry[];
}

export interface ShiftTemplateEntry {
  id: string;
  shift_id: string;
  day_offset: number;
  employee_count: number;
  notes: string | null;
  shift?: { name: string; code: string; color: string; start_time: string; end_time: string } | null;
}

export function useShiftTemplates(companyId: string | null) {
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("shift_templates")
        .select(`
          *,
          department:departments(name),
          entries:shift_template_entries(
            id,
            shift_id,
            day_offset,
            employee_count,
            notes,
            shift:shifts(name, code, color, start_time, end_time)
          )
        `)
        .eq("company_id", companyId)
        .order("name");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (data: {
    name: string;
    description?: string;
    template_type: string;
    department_id?: string;
  }) => {
    if (!companyId) return null;

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data: newTemplate, error } = await supabase
        .from("shift_templates")
        .insert({
          company_id: companyId,
          created_by: user?.user?.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Template created");
      fetchTemplates();
      return newTemplate;
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
      return null;
    }
  };

  const addTemplateEntry = async (data: {
    template_id: string;
    shift_id: string;
    day_offset: number;
    employee_count?: number;
    notes?: string;
  }) => {
    try {
      const { error } = await supabase
        .from("shift_template_entries")
        .insert(data);

      if (error) throw error;
      toast.success("Entry added");
      fetchTemplates();
    } catch (error) {
      console.error("Error adding entry:", error);
      toast.error("Failed to add entry");
    }
  };

  const removeTemplateEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from("shift_template_entries")
        .delete()
        .eq("id", entryId);

      if (error) throw error;
      toast.success("Entry removed");
      fetchTemplates();
    } catch (error) {
      console.error("Error removing entry:", error);
      toast.error("Failed to remove entry");
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("shift_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Template deleted");
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const toggleTemplateActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("shift_templates")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
      toast.success(isActive ? "Template activated" : "Template deactivated");
      fetchTemplates();
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template");
    }
  };

  return {
    templates,
    isLoading,
    fetchTemplates,
    createTemplate,
    addTemplateEntry,
    removeTemplateEntry,
    deleteTemplate,
    toggleTemplateActive,
  };
}
