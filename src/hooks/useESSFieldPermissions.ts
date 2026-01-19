import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type FieldApprovalMode = 'auto_approve' | 'manager_review' | 'hr_review' | 'workflow';

export interface ESSFieldPermission {
  id: string;
  company_id: string;
  module_code: string;
  field_name: string;
  field_label: string;
  can_view: boolean;
  can_edit: boolean;
  requires_approval: boolean;
  approval_mode: FieldApprovalMode;
  created_at: string;
  updated_at: string;
}

export interface FieldPermissionFormData {
  module_code: string;
  field_name: string;
  field_label: string;
  can_view?: boolean;
  can_edit?: boolean;
  requires_approval?: boolean;
  approval_mode?: FieldApprovalMode;
}

// Default field definitions per module
export const DEFAULT_FIELD_DEFINITIONS: Record<string, { name: string; label: string; defaultEdit: boolean; defaultApproval: FieldApprovalMode }[]> = {
  'personal-info': [
    { name: 'first_name', label: 'First Name', defaultEdit: false, defaultApproval: 'hr_review' },
    { name: 'last_name', label: 'Last Name', defaultEdit: false, defaultApproval: 'hr_review' },
    { name: 'middle_name', label: 'Middle Name', defaultEdit: true, defaultApproval: 'auto_approve' },
    { name: 'date_of_birth', label: 'Date of Birth', defaultEdit: false, defaultApproval: 'hr_review' },
    { name: 'gender', label: 'Gender', defaultEdit: true, defaultApproval: 'hr_review' },
    { name: 'marital_status', label: 'Marital Status', defaultEdit: true, defaultApproval: 'hr_review' },
    { name: 'nationality', label: 'Nationality', defaultEdit: false, defaultApproval: 'hr_review' },
    { name: 'address', label: 'Address', defaultEdit: true, defaultApproval: 'auto_approve' },
    { name: 'phone', label: 'Phone Number', defaultEdit: true, defaultApproval: 'auto_approve' },
    { name: 'personal_email', label: 'Personal Email', defaultEdit: true, defaultApproval: 'auto_approve' },
    { name: 'emergency_contact', label: 'Emergency Contact', defaultEdit: true, defaultApproval: 'auto_approve' },
  ],
  'banking': [
    { name: 'bank_name', label: 'Bank Name', defaultEdit: true, defaultApproval: 'workflow' },
    { name: 'account_number', label: 'Account Number', defaultEdit: true, defaultApproval: 'workflow' },
    { name: 'routing_number', label: 'Routing Number', defaultEdit: true, defaultApproval: 'workflow' },
    { name: 'account_type', label: 'Account Type', defaultEdit: true, defaultApproval: 'workflow' },
  ],
  'dependents': [
    { name: 'dependent_name', label: 'Dependent Name', defaultEdit: true, defaultApproval: 'hr_review' },
    { name: 'relationship', label: 'Relationship', defaultEdit: true, defaultApproval: 'hr_review' },
    { name: 'date_of_birth', label: 'Date of Birth', defaultEdit: true, defaultApproval: 'hr_review' },
  ],
  'qualifications': [
    { name: 'qualification_name', label: 'Qualification Name', defaultEdit: true, defaultApproval: 'hr_review' },
    { name: 'institution', label: 'Institution', defaultEdit: true, defaultApproval: 'hr_review' },
    { name: 'completion_date', label: 'Completion Date', defaultEdit: true, defaultApproval: 'hr_review' },
    { name: 'expiry_date', label: 'Expiry Date', defaultEdit: true, defaultApproval: 'auto_approve' },
  ],
  'government-ids': [
    { name: 'id_type', label: 'ID Type', defaultEdit: true, defaultApproval: 'hr_review' },
    { name: 'id_number', label: 'ID Number', defaultEdit: true, defaultApproval: 'hr_review' },
    { name: 'issue_date', label: 'Issue Date', defaultEdit: true, defaultApproval: 'hr_review' },
    { name: 'expiry_date', label: 'Expiry Date', defaultEdit: true, defaultApproval: 'auto_approve' },
  ],
};

export function useESSFieldPermissions(moduleCode?: string) {
  const { company } = useAuth();
  const queryClient = useQueryClient();

  const { data: permissions = [], isLoading, error } = useQuery({
    queryKey: ["ess-field-permissions", company?.id, moduleCode],
    queryFn: async () => {
      let query = supabase
        .from("ess_field_permissions")
        .select("*")
        .eq("company_id", company?.id);
      
      if (moduleCode) {
        query = query.eq("module_code", moduleCode);
      }
      
      const { data, error } = await query.order("field_name", { ascending: true });
      
      if (error) throw error;
      return data as ESSFieldPermission[];
    },
    enabled: !!company?.id,
  });

  const createPermission = useMutation({
    mutationFn: async (permission: FieldPermissionFormData) => {
      const { data, error } = await supabase
        .from("ess_field_permissions")
        .insert({
          ...permission,
          company_id: company?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ess-field-permissions", company?.id] });
      toast.success("Field permission created");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create field permission");
    },
  });

  const updatePermission = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ESSFieldPermission> & { id: string }) => {
      const { data, error } = await supabase
        .from("ess_field_permissions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ess-field-permissions", company?.id] });
      toast.success("Field permission updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update field permission");
    },
  });

  const deletePermission = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ess_field_permissions")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ess-field-permissions", company?.id] });
      toast.success("Field permission deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete field permission");
    },
  });

  const seedDefaultPermissions = useMutation({
    mutationFn: async (targetModuleCode: string) => {
      const fields = DEFAULT_FIELD_DEFINITIONS[targetModuleCode];
      if (!fields) throw new Error("No default fields defined for this module");

      const permissionsToInsert = fields.map(field => ({
        company_id: company?.id,
        module_code: targetModuleCode,
        field_name: field.name,
        field_label: field.label,
        can_view: true,
        can_edit: field.defaultEdit,
        requires_approval: field.defaultApproval !== 'auto_approve',
        approval_mode: field.defaultApproval,
      }));

      const { data, error } = await supabase
        .from("ess_field_permissions")
        .insert(permissionsToInsert)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ess-field-permissions", company?.id] });
      toast.success("Default field permissions created");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create default permissions");
    },
  });

  // Get field permission for a specific field
  const getFieldPermission = (fieldModuleCode: string, fieldName: string): ESSFieldPermission | undefined => {
    return permissions.find(p => p.module_code === fieldModuleCode && p.field_name === fieldName);
  };

  // Check if a field can be edited
  const canEditField = (fieldModuleCode: string, fieldName: string): boolean => {
    const permission = getFieldPermission(fieldModuleCode, fieldName);
    return permission?.can_edit ?? false;
  };

  // Check if a field requires approval
  const fieldRequiresApproval = (fieldModuleCode: string, fieldName: string): boolean => {
    const permission = getFieldPermission(fieldModuleCode, fieldName);
    return permission?.requires_approval ?? true;
  };

  return {
    permissions,
    isLoading,
    error,
    createPermission,
    updatePermission,
    deletePermission,
    seedDefaultPermissions,
    getFieldPermission,
    canEditField,
    fieldRequiresApproval,
    hasNoPermissions: !isLoading && permissions.length === 0,
  };
}
