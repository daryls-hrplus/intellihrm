import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ReadinessRatingBand {
  id: string;
  company_id: string;
  rating_label: string;
  min_percentage: number;
  max_percentage: number;
  color_code: string | null;
  sort_order: number;
  created_at: string;
}

export function useReadinessRatingBands(companyId?: string) {
  const [loading, setLoading] = useState(false);
  const [bands, setBands] = useState<ReadinessRatingBand[]>([]);

  const fetchBands = async () => {
    if (!companyId) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('readiness_rating_bands')
        .select('*')
        .eq('company_id', companyId)
        .order('sort_order');

      if (error) throw error;
      setBands(data as ReadinessRatingBand[]);
      return data as ReadinessRatingBand[];
    } catch (error: any) {
      toast.error('Failed to fetch rating bands: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createBand = async (band: Partial<ReadinessRatingBand>) => {
    if (!companyId) return null;
    try {
      const { data, error } = await supabase
        .from('readiness_rating_bands')
        .insert({
          company_id: companyId,
          rating_label: band.rating_label!,
          min_percentage: band.min_percentage!,
          max_percentage: band.max_percentage!,
          color_code: band.color_code,
          sort_order: band.sort_order ?? 0,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Rating band created');
      await fetchBands();
      return data as ReadinessRatingBand;
    } catch (error: any) {
      toast.error('Failed to create rating band: ' + error.message);
      return null;
    }
  };

  const updateBand = async (id: string, updates: Partial<ReadinessRatingBand>) => {
    try {
      const { data, error } = await supabase
        .from('readiness_rating_bands')
        .update({
          rating_label: updates.rating_label,
          min_percentage: updates.min_percentage,
          max_percentage: updates.max_percentage,
          color_code: updates.color_code,
          sort_order: updates.sort_order,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Rating band updated');
      await fetchBands();
      return data as ReadinessRatingBand;
    } catch (error: any) {
      toast.error('Failed to update rating band: ' + error.message);
      return null;
    }
  };

  const deleteBand = async (id: string) => {
    try {
      const { error } = await supabase
        .from('readiness_rating_bands')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Rating band deleted');
      await fetchBands();
      return true;
    } catch (error: any) {
      toast.error('Failed to delete rating band: ' + error.message);
      return false;
    }
  };

  // Seed default bands if none exist
  const seedDefaultBands = async () => {
    if (!companyId) return false;
    
    const existing = await fetchBands();
    if (existing.length > 0) return true;

    const defaults = [
      { rating_label: 'Ready Now', min_percentage: 85, max_percentage: 100, color_code: '#22c55e', sort_order: 1 },
      { rating_label: 'Ready in 1-3 Years', min_percentage: 70, max_percentage: 84.99, color_code: '#3b82f6', sort_order: 2 },
      { rating_label: 'Ready in 3-5 Years', min_percentage: 55, max_percentage: 69.99, color_code: '#f59e0b', sort_order: 3 },
      { rating_label: 'Ready in Over 5 Years', min_percentage: 40, max_percentage: 54.99, color_code: '#f97316', sort_order: 4 },
      { rating_label: 'Not a Successor', min_percentage: 0, max_percentage: 39.99, color_code: '#ef4444', sort_order: 5 },
    ];

    try {
      const { error } = await supabase
        .from('readiness_rating_bands')
        .insert(defaults.map(d => ({ ...d, company_id: companyId })));

      if (error) throw error;
      await fetchBands();
      return true;
    } catch (error: any) {
      toast.error('Failed to seed default bands: ' + error.message);
      return false;
    }
  };

  const getBandForScore = (score: number): ReadinessRatingBand | undefined => {
    return bands.find(b => score >= b.min_percentage && score <= b.max_percentage);
  };

  return {
    loading,
    bands,
    fetchBands,
    createBand,
    updateBand,
    deleteBand,
    seedDefaultBands,
    getBandForScore,
  };
}
