import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Vendor, VendorFormInput, VendorStatus } from "@/types/vendor";

interface UseVendorsOptions {
  companyId?: string;
  status?: VendorStatus | 'all';
  searchTerm?: string;
  includeShared?: boolean;
}

export function useVendors(options: UseVendorsOptions = {}) {
  const { companyId, status = 'all', searchTerm = '', includeShared = true } = options;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vendors list
  const {
    data: vendors = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vendors', companyId, status, searchTerm, includeShared],
    queryFn: async () => {
      if (!companyId) return [];

      let query = supabase
        .from('training_vendors')
        .select('*')
        .order('name', { ascending: true });

      // Company filter with shared vendor support
      if (includeShared) {
        query = query.or(`company_id.eq.${companyId},is_shared.eq.true`);
      } else {
        query = query.eq('company_id', companyId);
      }

      // Status filter
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      // Search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Vendor[];
    },
    enabled: !!companyId,
  });

  // Fetch single vendor
  const useVendor = (vendorId: string | undefined) => {
    return useQuery({
      queryKey: ['vendor', vendorId],
      queryFn: async () => {
        if (!vendorId) return null;

        const { data, error } = await supabase
          .from('training_vendors')
          .select('*')
          .eq('id', vendorId)
          .maybeSingle();

        if (error) throw error;
        return data as Vendor | null;
      },
      enabled: !!vendorId,
    });
  };

  // Create vendor mutation
  const createVendor = useMutation({
    mutationFn: async (input: VendorFormInput & { company_id: string }) => {
      const { data, error } = await supabase
        .from('training_vendors')
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({
        title: "Vendor created",
        description: "The vendor has been added successfully.",
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

  // Update vendor mutation
  const updateVendor = useMutation({
    mutationFn: async ({ id, ...input }: Partial<VendorFormInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('training_vendors')
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', variables.id] });
      toast({
        title: "Vendor updated",
        description: "The vendor has been updated successfully.",
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

  // Delete vendor mutation
  const deleteVendor = useMutation({
    mutationFn: async (vendorId: string) => {
      const { error } = await supabase
        .from('training_vendors')
        .delete()
        .eq('id', vendorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({
        title: "Vendor deleted",
        description: "The vendor has been removed.",
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

  // Toggle vendor status
  const toggleVendorStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: VendorStatus }) => {
      const { data, error } = await supabase
        .from('training_vendors')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', variables.id] });
      toast({
        title: "Status updated",
        description: `Vendor status changed to ${variables.status}.`,
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

  return {
    vendors,
    isLoading,
    error,
    refetch,
    useVendor,
    createVendor,
    updateVendor,
    deleteVendor,
    toggleVendorStatus,
  };
}

// Export standalone hook for single vendor
export function useVendor(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;

      const { data, error } = await supabase
        .from('training_vendors')
        .select('*')
        .eq('id', vendorId)
        .maybeSingle();

      if (error) throw error;
      return data as Vendor | null;
    },
    enabled: !!vendorId,
  });
}
