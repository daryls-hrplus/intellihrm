import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { VendorReview, VendorReviewFormInput } from "@/types/vendor";

export function useVendorReviews(vendorId: string | undefined) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reviews for a vendor
  const {
    data: reviews = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vendor-reviews', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];

      const { data, error } = await supabase
        .from('training_vendor_reviews')
        .select(`
          *,
          reviewer:profiles!training_vendor_reviews_reviewer_id_fkey(full_name, avatar_url)
        `)
        .eq('vendor_id', vendorId)
        .order('review_date', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as VendorReview[];
    },
    enabled: !!vendorId,
  });

  // Create review mutation
  const createReview = useMutation({
    mutationFn: async (input: VendorReviewFormInput & { vendor_id: string }) => {
      const { data, error } = await supabase
        .from('training_vendor_reviews')
        .insert({
          ...input,
          reviewer_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
      toast({
        title: "Review submitted",
        description: "The vendor review has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update review mutation
  const updateReview = useMutation({
    mutationFn: async ({ id, ...input }: Partial<VendorReviewFormInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('training_vendor_reviews')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
      toast({
        title: "Review updated",
        description: "The review has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete review mutation
  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('training_vendor_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
      toast({
        title: "Review deleted",
        description: "The review has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate average scores
  const approvedReviews = reviews.filter(r => r.status === 'approved');
  const averageScores = approvedReviews.length > 0
    ? {
        quality: approvedReviews.reduce((sum, r) => sum + (r.quality_score || 0), 0) / approvedReviews.filter(r => r.quality_score).length || 0,
        delivery: approvedReviews.reduce((sum, r) => sum + (r.delivery_score || 0), 0) / approvedReviews.filter(r => r.delivery_score).length || 0,
        value: approvedReviews.reduce((sum, r) => sum + (r.value_score || 0), 0) / approvedReviews.filter(r => r.value_score).length || 0,
        responsiveness: approvedReviews.reduce((sum, r) => sum + (r.responsiveness_score || 0), 0) / approvedReviews.filter(r => r.responsiveness_score).length || 0,
        overall: approvedReviews.reduce((sum, r) => sum + (r.overall_score || 0), 0) / approvedReviews.filter(r => r.overall_score).length || 0,
      }
    : null;

  return {
    reviews,
    isLoading,
    error,
    refetch,
    createReview,
    updateReview,
    deleteReview,
    averageScores,
  };
}
