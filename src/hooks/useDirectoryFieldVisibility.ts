import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DirectoryVisibilityConfig {
  id: string;
  field_name: string;
  field_label: string;
  visibility_mode: 'all' | 'role_based' | 'grade_based' | 'none';
  visible_to_all_hr: boolean;
  visible_to_managers: boolean;
  allow_employee_opt_out: boolean;
  opt_out_default: boolean;
  is_active: boolean;
}

export interface EmployeePrivacySettings {
  show_work_phone: boolean;
  show_work_mobile: boolean;
  show_extension: boolean;
  show_personal_email: boolean;
  directory_opt_out: boolean;
}

interface UseDirectoryFieldVisibilityResult {
  canView: (fieldName: string, targetEmployeeId?: string) => boolean;
  isOptedOut: (fieldName: string, employeePrivacySettings?: EmployeePrivacySettings | null) => boolean;
  getFieldConfig: (fieldName: string) => DirectoryVisibilityConfig | undefined;
  visibleFields: string[];
  isLoading: boolean;
  isHRorAdmin: boolean;
}

// Map field names to privacy setting keys
const FIELD_TO_PRIVACY_KEY: Record<string, keyof EmployeePrivacySettings> = {
  'work_phone': 'show_work_phone',
  'work_mobile': 'show_work_mobile',
  'extension': 'show_extension',
  'personal_email': 'show_personal_email',
};

export function useDirectoryFieldVisibility(): UseDirectoryFieldVisibilityResult {
  const { user, profile } = useAuth();

  // Fetch user's roles
  const { data: userRoles = [] } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (error) throw error;
      return data?.map(r => r.role) || [];
    },
    enabled: !!user?.id,
  });

  // Fetch directory visibility config
  const { data: visibilityConfigs = [], isLoading: configLoading } = useQuery({
    queryKey: ["directory-visibility-config", profile?.company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("directory_visibility_config")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return (data || []) as DirectoryVisibilityConfig[];
    },
    enabled: !!user?.id,
  });

  // Check if user is HR or Admin
  const isHRorAdmin = userRoles.some(role => 
    ['admin', 'hr_manager', 'hr_admin', 'super_admin'].includes(role as string)
  );

  // Check if user is a manager (simplified - in real implementation would check reporting relationships)
  const isManager = userRoles.some(role => 
    ['manager', 'hr_manager', 'department_head'].includes(role as string)
  );

  const getFieldConfig = (fieldName: string): DirectoryVisibilityConfig | undefined => {
    return visibilityConfigs.find(c => c.field_name === fieldName);
  };

  const canView = (fieldName: string, _targetEmployeeId?: string): boolean => {
    const config = getFieldConfig(fieldName);
    
    // If no config exists, default to visible
    if (!config) return true;
    
    // If field is inactive, don't show
    if (!config.is_active) return false;

    switch (config.visibility_mode) {
      case 'all':
        return true;
      
      case 'none':
        return false;
      
      case 'role_based':
        // HR can always see if visible_to_all_hr is true
        if (config.visible_to_all_hr && isHRorAdmin) return true;
        // Managers can see if visible_to_managers is true
        if (config.visible_to_managers && isManager) return true;
        // Otherwise, not visible
        return false;
      
      case 'grade_based':
        // For now, HR and managers can see grade-based fields
        // Full implementation would compare viewer's grade to min_visible_grade
        if (isHRorAdmin || isManager) return true;
        return false;
      
      default:
        return true;
    }
  };

  const isOptedOut = (
    fieldName: string, 
    employeePrivacySettings?: EmployeePrivacySettings | null
  ): boolean => {
    const config = getFieldConfig(fieldName);
    
    // If opt-out not allowed for this field, it's not opted out
    if (!config?.allow_employee_opt_out) return false;
    
    // If no privacy settings provided, use default
    if (!employeePrivacySettings) {
      return config.opt_out_default;
    }
    
    // Check the specific privacy setting for this field
    const privacyKey = FIELD_TO_PRIVACY_KEY[fieldName];
    if (privacyKey && privacyKey in employeePrivacySettings) {
      // If show_X is false, it means opted out
      return !employeePrivacySettings[privacyKey];
    }
    
    return false;
  };

  const visibleFields = visibilityConfigs
    .filter(config => config.is_active && canView(config.field_name))
    .map(config => config.field_name);

  return {
    canView,
    isOptedOut,
    getFieldConfig,
    visibleFields,
    isLoading: configLoading,
    isHRorAdmin,
  };
}
