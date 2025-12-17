import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PermissionContext {
  userId: string | null;
  isAdmin: boolean;
  canViewPii: boolean;
  accessibleCompanyIds: string[];
  accessibleDepartmentIds: string[];
  isLoading: boolean;
}

export function useUserPermissionContext(): PermissionContext {
  const { user, roles } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [accessibleCompanyIds, setAccessibleCompanyIds] = useState<string[]>([]);
  const [accessibleDepartmentIds, setAccessibleDepartmentIds] = useState<string[]>([]);
  const [canViewPii, setCanViewPii] = useState(false);

  const isAdmin = roles.includes('admin');

  useEffect(() => {
    const fetchAccessibleOrgs = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Check PII permission from user roles
        const { data: userRolesData } = await supabase
          .from('user_roles')
          .select('role_id')
          .eq('user_id', user.id);

        if (userRolesData && userRolesData.length > 0) {
          const roleIds = userRolesData.map(r => r.role_id);
          const { data: rolesWithPii } = await supabase
            .from('roles')
            .select('can_view_pii')
            .in('id', roleIds);

          const hasPiiAccess = rolesWithPii?.some(r => r.can_view_pii) || false;
          setCanViewPii(isAdmin || hasPiiAccess);
        } else {
          setCanViewPii(isAdmin);
        }

        // If admin, they have access to all
        if (isAdmin) {
          // @ts-ignore - Supabase type instantiation issue
          const { data: companies } = await supabase
            .from('companies')
            .select('id');
          
          // @ts-ignore - Supabase type instantiation issue
          const { data: departments } = await supabase
            .from('departments')
            .select('id');

          setAccessibleCompanyIds(companies?.map((c: { id: string }) => c.id) || []);
          setAccessibleDepartmentIds(departments?.map((d: { id: string }) => d.id) || []);
        } else {
          // For non-admins, get company from their profile
          // @ts-ignore - Supabase type instantiation issue
          const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

          const companyIds = profile?.company_id ? [profile.company_id] : [];
          setAccessibleCompanyIds(companyIds);

          // Get departments for accessible companies
          if (companyIds.length > 0) {
            // @ts-ignore - Supabase type instantiation issue
            const { data: departments } = await supabase
              .from('departments')
              .select('id')
              .in('company_id', companyIds);
            
            setAccessibleDepartmentIds(departments?.map((d: { id: string }) => d.id) || []);
          }
        }
      } catch (error) {
        console.error('Error fetching accessible organizations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccessibleOrgs();
  }, [user?.id, isAdmin]);

  return {
    userId: user?.id || null,
    isAdmin,
    canViewPii,
    accessibleCompanyIds,
    accessibleDepartmentIds,
    isLoading
  };
}
