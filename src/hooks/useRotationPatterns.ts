import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RotationPattern {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  pattern_type: string;
  cycle_length_days: number;
  pattern_definition: PatternDay[];
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface PatternDay {
  day: number;
  shift_id: string | null;
  shift_name?: string;
  is_off: boolean;
}

export interface EmployeeRotationAssignment {
  id: string;
  company_id: string;
  employee_id: string;
  rotation_pattern_id: string;
  start_date: string;
  end_date: string | null;
  cycle_start_offset: number;
  is_active: boolean;
  notes: string | null;
  employee?: { full_name: string } | null;
  pattern?: { name: string; code: string } | null;
}

export function useRotationPatterns(companyId: string | null) {
  const [patterns, setPatterns] = useState<RotationPattern[]>([]);
  const [assignments, setAssignments] = useState<EmployeeRotationAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPatterns = useCallback(async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("shift_rotation_patterns")
        .select("*")
        .eq("company_id", companyId)
        .order("name");

      if (error) throw error;
      
      // Parse pattern_definition from JSON
      const parsedData = (data || []).map(p => ({
        ...p,
        pattern_definition: Array.isArray(p.pattern_definition) 
          ? (p.pattern_definition as unknown as PatternDay[])
          : []
      }));
      
      setPatterns(parsedData);
    } catch (error) {
      console.error("Error fetching patterns:", error);
      toast.error("Failed to load rotation patterns");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  const fetchAssignments = useCallback(async () => {
    if (!companyId) return;
    
    try {
      const { data, error } = await supabase
        .from("employee_rotation_assignments")
        .select(`
          *,
          employee:profiles(full_name),
          pattern:shift_rotation_patterns(name, code)
        `)
        .eq("company_id", companyId)
        .order("start_date", { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  }, [companyId]);

  useEffect(() => {
    fetchPatterns();
    fetchAssignments();
  }, [fetchPatterns, fetchAssignments]);

  const createPattern = async (data: {
    name: string;
    code: string;
    description?: string;
    pattern_type: string;
    cycle_length_days: number;
    pattern_definition: PatternDay[];
    color?: string;
  }) => {
    if (!companyId) return null;

    try {
      const { data: newPattern, error } = await supabase
        .from("shift_rotation_patterns")
        .insert({
          company_id: companyId,
          name: data.name,
          code: data.code,
          description: data.description,
          pattern_type: data.pattern_type,
          cycle_length_days: data.cycle_length_days,
          pattern_definition: data.pattern_definition as unknown as Record<string, unknown>[],
          color: data.color,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Rotation pattern created");
      fetchPatterns();
      return newPattern;
    } catch (error) {
      console.error("Error creating pattern:", error);
      toast.error("Failed to create pattern");
      return null;
    }
  };

  const updatePattern = async (id: string, data: Partial<RotationPattern>) => {
    try {
      const updateData: Record<string, unknown> = { ...data };
      if (data.pattern_definition) {
        updateData.pattern_definition = data.pattern_definition as unknown as Record<string, unknown>[];
      }
      
      const { error } = await supabase
        .from("shift_rotation_patterns")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
      toast.success("Pattern updated");
      fetchPatterns();
    } catch (error) {
      console.error("Error updating pattern:", error);
      toast.error("Failed to update pattern");
    }
  };

  const deletePattern = async (id: string) => {
    try {
      const { error } = await supabase
        .from("shift_rotation_patterns")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Pattern deleted");
      fetchPatterns();
    } catch (error) {
      console.error("Error deleting pattern:", error);
      toast.error("Failed to delete pattern");
    }
  };

  const assignEmployeeToPattern = async (data: {
    employee_id: string;
    rotation_pattern_id: string;
    start_date: string;
    end_date?: string;
    cycle_start_offset?: number;
    notes?: string;
  }) => {
    if (!companyId) return null;

    try {
      const { data: assignment, error } = await supabase
        .from("employee_rotation_assignments")
        .insert({
          company_id: companyId,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Employee assigned to rotation");
      fetchAssignments();
      return assignment;
    } catch (error) {
      console.error("Error assigning employee:", error);
      toast.error("Failed to assign employee");
      return null;
    }
  };

  const removeAssignment = async (id: string) => {
    try {
      const { error } = await supabase
        .from("employee_rotation_assignments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Assignment removed");
      fetchAssignments();
    } catch (error) {
      console.error("Error removing assignment:", error);
      toast.error("Failed to remove assignment");
    }
  };

  return {
    patterns,
    assignments,
    isLoading,
    fetchPatterns,
    fetchAssignments,
    createPattern,
    updatePattern,
    deletePattern,
    assignEmployeeToPattern,
    removeAssignment,
  };
}
