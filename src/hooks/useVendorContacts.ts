import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { VendorContact, VendorContactFormInput } from "@/types/vendor";

export function useVendorContacts(vendorId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contacts for a vendor
  const {
    data: contacts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vendor-contacts', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];

      const { data, error } = await supabase
        .from('training_vendor_contacts')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('is_primary', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as VendorContact[];
    },
    enabled: !!vendorId,
  });

  // Create contact mutation
  const createContact = useMutation({
    mutationFn: async (input: VendorContactFormInput & { vendor_id: string }) => {
      // If setting as primary, unset other primaries first
      if (input.is_primary) {
        await supabase
          .from('training_vendor_contacts')
          .update({ is_primary: false })
          .eq('vendor_id', input.vendor_id)
          .eq('is_primary', true);
      }

      const { data, error } = await supabase
        .from('training_vendor_contacts')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contacts', vendorId] });
      toast({
        title: "Contact added",
        description: "The contact has been added successfully.",
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

  // Update contact mutation
  const updateContact = useMutation({
    mutationFn: async ({ id, vendor_id, ...input }: Partial<VendorContactFormInput> & { id: string; vendor_id: string }) => {
      // If setting as primary, unset other primaries first
      if (input.is_primary) {
        await supabase
          .from('training_vendor_contacts')
          .update({ is_primary: false })
          .eq('vendor_id', vendor_id)
          .eq('is_primary', true)
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('training_vendor_contacts')
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
      queryClient.invalidateQueries({ queryKey: ['vendor-contacts', vendorId] });
      toast({
        title: "Contact updated",
        description: "The contact has been updated successfully.",
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

  // Delete contact mutation
  const deleteContact = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('training_vendor_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contacts', vendorId] });
      toast({
        title: "Contact removed",
        description: "The contact has been removed.",
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

  // Set primary contact
  const setPrimaryContact = useMutation({
    mutationFn: async ({ id, vendor_id }: { id: string; vendor_id: string }) => {
      // Unset current primary
      await supabase
        .from('training_vendor_contacts')
        .update({ is_primary: false })
        .eq('vendor_id', vendor_id)
        .eq('is_primary', true);

      // Set new primary
      const { data, error } = await supabase
        .from('training_vendor_contacts')
        .update({ is_primary: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contacts', vendorId] });
      toast({
        title: "Primary contact updated",
        description: "The primary contact has been set.",
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
    contacts,
    isLoading,
    error,
    refetch,
    createContact,
    updateContact,
    deleteContact,
    setPrimaryContact,
  };
}
