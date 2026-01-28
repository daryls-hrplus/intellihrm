import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { VendorCourse, VendorCourseFormInput } from "@/types/vendor";

export function useVendorCourses(vendorId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch courses for a vendor
  const {
    data: courses = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vendor-courses', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];

      const { data, error } = await supabase
        .from('training_vendor_courses')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('course_name', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as VendorCourse[];
    },
    enabled: !!vendorId,
  });

  // Create course mutation
  const createCourse = useMutation({
    mutationFn: async (input: VendorCourseFormInput & { vendor_id: string }) => {
      const { data, error } = await supabase
        .from('training_vendor_courses')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-courses', vendorId] });
      toast({
        title: "Course added",
        description: "The course has been added to the vendor catalog.",
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

  // Update course mutation
  const updateCourse = useMutation({
    mutationFn: async ({ id, ...input }: Partial<VendorCourseFormInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('training_vendor_courses')
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
      queryClient.invalidateQueries({ queryKey: ['vendor-courses', vendorId] });
      toast({
        title: "Course updated",
        description: "The course has been updated successfully.",
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

  // Delete course mutation
  const deleteCourse = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('training_vendor_courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-courses', vendorId] });
      toast({
        title: "Course removed",
        description: "The course has been removed from the vendor catalog.",
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

  // Toggle course active status
  const toggleCourseActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('training_vendor_courses')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-courses', vendorId] });
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
    courses,
    isLoading,
    error,
    refetch,
    createCourse,
    updateCourse,
    deleteCourse,
    toggleCourseActive,
  };
}
