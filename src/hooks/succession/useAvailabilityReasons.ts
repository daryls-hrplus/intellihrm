import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SuccessionAvailabilityReason {
  id: string;
  company_id: string;
  code: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export function useAvailabilityReasons(companyId?: string) {
  const [loading, setLoading] = useState(false);
  const [reasons, setReasons] = useState<SuccessionAvailabilityReason[]>([]);

  const fetchReasons = async () => {
    if (!companyId) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('succession_availability_reasons')
        .select('*')
        .eq('company_id', companyId)
        .order('sort_order');

      if (error) throw error;
      setReasons(data as SuccessionAvailabilityReason[]);
      return data as SuccessionAvailabilityReason[];
    } catch (error: any) {
      toast.error('Failed to fetch availability reasons: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createReason = async (reason: Partial<SuccessionAvailabilityReason>) => {
    if (!companyId) return null;
    try {
      const { data, error } = await supabase
        .from('succession_availability_reasons')
        .insert({
          company_id: companyId,
          code: reason.code!,
          description: reason.description!,
          is_active: reason.is_active ?? true,
          sort_order: reason.sort_order ?? 0,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Availability reason created');
      await fetchReasons();
      return data as SuccessionAvailabilityReason;
    } catch (error: any) {
      toast.error('Failed to create reason: ' + error.message);
      return null;
    }
  };

  const updateReason = async (id: string, updates: Partial<SuccessionAvailabilityReason>) => {
    try {
      const { data, error } = await supabase
        .from('succession_availability_reasons')
        .update({
          code: updates.code,
          description: updates.description,
          is_active: updates.is_active,
          sort_order: updates.sort_order,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Availability reason updated');
      await fetchReasons();
      return data as SuccessionAvailabilityReason;
    } catch (error: any) {
      toast.error('Failed to update reason: ' + error.message);
      return null;
    }
  };

  const deleteReason = async (id: string) => {
    try {
      const { error } = await supabase
        .from('succession_availability_reasons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Availability reason deleted');
      await fetchReasons();
      return true;
    } catch (error: any) {
      toast.error('Failed to delete reason: ' + error.message);
      return false;
    }
  };

  // Seed default reasons if none exist
  const seedDefaultReasons = async () => {
    if (!companyId) return false;
    
    const existing = await fetchReasons();
    if (existing.length > 0) return true;

    const defaults = [
      { code: 'RET', description: 'Retirement', sort_order: 1 },
      { code: 'PRO', description: 'Promotion', sort_order: 2 },
      { code: 'RES', description: 'Resignation', sort_order: 3 },
      { code: 'TRM', description: 'Termination', sort_order: 4 },
      { code: 'REL', description: 'Relocation', sort_order: 5 },
      { code: 'REO', description: 'Reorganization', sort_order: 6 },
    ];

    try {
      const { error } = await supabase
        .from('succession_availability_reasons')
        .insert(defaults.map(d => ({ ...d, company_id: companyId, is_active: true })));

      if (error) throw error;
      await fetchReasons();
      return true;
    } catch (error: any) {
      toast.error('Failed to seed default reasons: ' + error.message);
      return false;
    }
  };

  const getActiveReasons = () => reasons.filter(r => r.is_active);

  return {
    loading,
    reasons,
    fetchReasons,
    createReason,
    updateReason,
    deleteReason,
    seedDefaultReasons,
    getActiveReasons,
  };
}
