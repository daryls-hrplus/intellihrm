import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { VendorSession, VendorSessionFormInput } from "@/types/vendor";

export function useVendorSessions(vendorId: string | undefined, vendorCourseIds?: string[]) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sessions for a vendor (via its courses)
  const {
    data: sessions = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vendor-sessions', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];

      // First get all course IDs for this vendor
      const { data: courses, error: coursesError } = await supabase
        .from('training_vendor_courses')
        .select('id')
        .eq('vendor_id', vendorId);

      if (coursesError) throw coursesError;
      if (!courses || courses.length === 0) return [];

      const courseIds = courses.map(c => c.id);

      const { data, error } = await supabase
        .from('training_vendor_sessions')
        .select(`
          *,
          vendor_course:training_vendor_courses(id, course_name, course_code)
        `)
        .in('vendor_course_id', courseIds)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as VendorSession[];
    },
    enabled: !!vendorId,
  });

  // Create session mutation
  const createSession = useMutation({
    mutationFn: async (input: VendorSessionFormInput) => {
      const { data, error } = await supabase
        .from('training_vendor_sessions')
        .insert({
          ...input,
          registered_count: 0,
          waitlist_count: 0,
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-sessions', vendorId] });
      toast({
        title: "Session created",
        description: "The training session has been scheduled.",
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

  // Update session mutation
  const updateSession = useMutation({
    mutationFn: async ({ id, ...input }: Partial<VendorSessionFormInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('training_vendor_sessions')
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
      queryClient.invalidateQueries({ queryKey: ['vendor-sessions', vendorId] });
      toast({
        title: "Session updated",
        description: "The session has been updated successfully.",
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

  // Update session status
  const updateSessionStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('training_vendor_sessions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-sessions', vendorId] });
      toast({
        title: "Status updated",
        description: `Session status changed to ${variables.status}.`,
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

  // Delete session mutation
  const deleteSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('training_vendor_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-sessions', vendorId] });
      toast({
        title: "Session deleted",
        description: "The session has been removed.",
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
    sessions,
    isLoading,
    error,
    refetch,
    createSession,
    updateSession,
    updateSessionStatus,
    deleteSession,
  };
}
