import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SuccessionAssessorType {
  id: string;
  company_id: string;
  type_code: string;
  type_label: string;
  is_required: boolean;
  is_enabled: boolean;
  applies_to_staff_types: string[] | null;
  sort_order: number;
  created_at: string;
}

export function useSuccessionAssessorTypes(companyId?: string) {
  const [loading, setLoading] = useState(false);
  const [assessorTypes, setAssessorTypes] = useState<SuccessionAssessorType[]>([]);

  const fetchAssessorTypes = async () => {
    if (!companyId) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('succession_assessor_types')
        .select('*')
        .eq('company_id', companyId)
        .order('sort_order');

      if (error) throw error;
      setAssessorTypes(data as SuccessionAssessorType[]);
      return data as SuccessionAssessorType[];
    } catch (error: any) {
      toast.error('Failed to fetch assessor types: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createAssessorType = async (type: Partial<SuccessionAssessorType>) => {
    if (!companyId) return null;
    try {
      const { data, error } = await supabase
        .from('succession_assessor_types')
        .insert({
          company_id: companyId,
          type_code: type.type_code!,
          type_label: type.type_label!,
          is_required: type.is_required ?? false,
          is_enabled: type.is_enabled ?? true,
          applies_to_staff_types: type.applies_to_staff_types,
          sort_order: type.sort_order ?? 0,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Assessor type created');
      await fetchAssessorTypes();
      return data as SuccessionAssessorType;
    } catch (error: any) {
      toast.error('Failed to create assessor type: ' + error.message);
      return null;
    }
  };

  const updateAssessorType = async (id: string, updates: Partial<SuccessionAssessorType>) => {
    try {
      const { data, error } = await supabase
        .from('succession_assessor_types')
        .update({
          type_label: updates.type_label,
          is_required: updates.is_required,
          is_enabled: updates.is_enabled,
          applies_to_staff_types: updates.applies_to_staff_types,
          sort_order: updates.sort_order,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Assessor type updated');
      await fetchAssessorTypes();
      return data as SuccessionAssessorType;
    } catch (error: any) {
      toast.error('Failed to update assessor type: ' + error.message);
      return null;
    }
  };

  const deleteAssessorType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('succession_assessor_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Assessor type deleted');
      await fetchAssessorTypes();
      return true;
    } catch (error: any) {
      toast.error('Failed to delete assessor type: ' + error.message);
      return false;
    }
  };

  // Seed default assessor types if none exist
  const seedDefaultTypes = async () => {
    if (!companyId) return false;
    
    const existing = await fetchAssessorTypes();
    if (existing.length > 0) return true;

    const defaults = [
      { type_code: 'manager', type_label: 'Direct Manager', is_required: true, is_enabled: true, sort_order: 1 },
      { type_code: 'hr', type_label: 'HR Partner', is_required: false, is_enabled: true, sort_order: 2 },
      { type_code: 'executive', type_label: 'Executive Reviewer', is_required: false, is_enabled: false, sort_order: 3 },
    ];

    try {
      const { error } = await supabase
        .from('succession_assessor_types')
        .insert(defaults.map(d => ({ ...d, company_id: companyId })));

      if (error) throw error;
      await fetchAssessorTypes();
      return true;
    } catch (error: any) {
      toast.error('Failed to seed default types: ' + error.message);
      return false;
    }
  };

  const getEnabledTypes = () => assessorTypes.filter(t => t.is_enabled);
  const getRequiredTypes = () => assessorTypes.filter(t => t.is_required && t.is_enabled);

  return {
    loading,
    assessorTypes,
    fetchAssessorTypes,
    createAssessorType,
    updateAssessorType,
    deleteAssessorType,
    seedDefaultTypes,
    getEnabledTypes,
    getRequiredTypes,
  };
}
