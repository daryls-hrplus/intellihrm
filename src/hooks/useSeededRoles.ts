import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SeededRole {
  code: string;
  name: string;
  description: string | null;
  is_system: boolean;
}

/**
 * Hook to fetch all active roles from the database.
 * Used for role-based content targeting in tours and tooltips.
 */
export function useSeededRoles() {
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['seeded-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('code, name, description, is_system')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as SeededRole[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    roles,
    isLoading,
  };
}
