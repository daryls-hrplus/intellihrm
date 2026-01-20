import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "./useSubscription";
import { toast } from "sonner";

export interface EssModuleConfig {
  id: string;
  company_id: string;
  module_code: string;
  feature_code: string | null;
  ess_enabled: boolean;
  ess_view_only: boolean;
  requires_approval: boolean;
  enabled_at: string | null;
  enabled_by: string | null;
  created_at: string;
  updated_at: string;
}

// Define all ESS-eligible modules with their categories
export const ESS_ELIGIBLE_MODULES = [
  // Profile & Personal Data
  { code: 'profile', name: 'My Profile', category: 'Profile & Personal Data' },
  { code: 'personal-info', name: 'Personal Information', category: 'Profile & Personal Data' },
  { code: 'dependents', name: 'Dependents', category: 'Profile & Personal Data' },
  { code: 'documents', name: 'Documents', category: 'Profile & Personal Data' },
  { code: 'letters', name: 'Letters', category: 'Profile & Personal Data' },
  { code: 'medical-info', name: 'Medical Information', category: 'Profile & Personal Data' },
  
  // Pay & Benefits
  { code: 'payslips', name: 'Payslips', category: 'Pay & Benefits' },
  { code: 'compensation', name: 'Compensation', category: 'Pay & Benefits' },
  { code: 'benefits', name: 'Benefits', category: 'Pay & Benefits' },
  { code: 'expenses', name: 'Expense Claims', category: 'Pay & Benefits' },
  { code: 'banking', name: 'Banking', category: 'Pay & Benefits' },
  { code: 'government-ids', name: 'Government IDs', category: 'Pay & Benefits' },
  
  // Time & Absence
  { code: 'leave', name: 'Leave', category: 'Time & Absence' },
  { code: 'my-calendar', name: 'My Calendar', category: 'Time & Absence' },
  { code: 'team-calendar', name: 'Team Calendar', category: 'Time & Absence' },
  { code: 'time-attendance', name: 'Time & Attendance', category: 'Time & Absence' },
  { code: 'timesheets', name: 'Timesheets', category: 'Time & Absence' },
  
  // Skills & Competencies
  { code: 'competencies', name: 'Competencies', category: 'Skills & Competencies' },
  { code: 'qualifications', name: 'Qualifications', category: 'Skills & Competencies' },
  { code: 'skill-gaps', name: 'Skill Gaps', category: 'Skills & Competencies' },
  { code: 'interests', name: 'Interests', category: 'Skills & Competencies' },
  
  // Performance
  { code: 'my-appraisals', name: 'My Appraisals', category: 'Performance' },
  { code: 'goals', name: 'Goals', category: 'Performance' },
  { code: 'evidence-portfolio', name: 'Evidence Portfolio', category: 'Performance' },
  { code: 'feedback', name: 'Feedback', category: 'Performance' },
  { code: 'recognition', name: 'Recognition', category: 'Performance' },
  
  // Career
  { code: 'professional-info', name: 'Professional Info', category: 'Career' },
  { code: 'career-plan', name: 'Career Plan', category: 'Career' },
  { code: 'career-paths', name: 'Career Paths', category: 'Career' },
  { code: 'mentorship', name: 'Mentorship', category: 'Career' },
  { code: 'jobs', name: 'Jobs', category: 'Career' },
  { code: 'milestones', name: 'Milestones', category: 'Career' },
  { code: 'transactions', name: 'Transactions', category: 'Career' },
  
  // Learning & Development
  { code: 'development', name: 'Development Plan', category: 'Learning & Development' },
  { code: 'development-themes', name: 'Development Themes', category: 'Learning & Development' },
  { code: 'training', name: 'Training', category: 'Learning & Development' },
  
  // Employee Lifecycle
  { code: 'onboarding', name: 'Onboarding', category: 'Employee Lifecycle' },
  { code: 'offboarding', name: 'Offboarding', category: 'Employee Lifecycle' },
  
  // Workplace
  { code: 'property', name: 'Property', category: 'Workplace' },
  { code: 'relations', name: 'Relations', category: 'Workplace' },
  { code: 'hse', name: 'Health & Safety', category: 'Workplace' },
  { code: 'immigration', name: 'Immigration', category: 'Workplace' },
];

export function useEssEntitlement(overrideCompanyId?: string | null) {
  const { company, user } = useAuth();
  const { hasModuleAccess } = useSubscription();
  const queryClient = useQueryClient();
  
  // Use override company ID if provided, otherwise fall back to auth company
  const targetCompanyId = overrideCompanyId || company?.id;
  
  // Fetch ESS module configurations
  const { data: essConfigs = [], isLoading: isLoadingConfigs } = useQuery({
    queryKey: ['ess-module-config', targetCompanyId],
    queryFn: async () => {
      if (!targetCompanyId) return [];
      const { data, error } = await supabase
        .from('ess_module_config')
        .select('*')
        .eq('company_id', targetCompanyId);
      if (error) throw error;
      return data as EssModuleConfig[];
    },
    enabled: !!targetCompanyId,
  });
  
  // Fetch module implementations
  const { data: implementations = [], isLoading: isLoadingImplementations } = useQuery({
    queryKey: ['module-implementations', targetCompanyId],
    queryFn: async () => {
      if (!targetCompanyId) return [];
      const { data, error } = await supabase
        .from('module_implementations')
        .select('*, application_modules(module_code)')
        .eq('company_id', targetCompanyId);
      if (error) throw error;
      return data;
    },
    enabled: !!targetCompanyId,
  });

  // Mutation to update ESS config
  const updateConfigMutation = useMutation({
    mutationFn: async (updates: { 
      module_code: string; 
      ess_enabled?: boolean; 
      ess_view_only?: boolean; 
      requires_approval?: boolean 
    }) => {
      if (!targetCompanyId) throw new Error("No company selected");
      
      const existingConfig = essConfigs.find(c => c.module_code === updates.module_code);
      
      if (existingConfig) {
        // Update existing
        const { error } = await supabase
          .from('ess_module_config')
          .update({
            ...updates,
            enabled_at: updates.ess_enabled ? new Date().toISOString() : existingConfig.enabled_at,
            enabled_by: updates.ess_enabled ? user?.id : existingConfig.enabled_by,
          })
          .eq('id', existingConfig.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('ess_module_config')
          .insert({
            company_id: targetCompanyId,
            module_code: updates.module_code,
            ess_enabled: updates.ess_enabled ?? false,
            ess_view_only: updates.ess_view_only ?? false,
            requires_approval: updates.requires_approval ?? true,
            enabled_at: updates.ess_enabled ? new Date().toISOString() : null,
            enabled_by: updates.ess_enabled ? user?.id : null,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ess-module-config', targetCompanyId] });
      toast.success("ESS configuration updated");
    },
    onError: (error) => {
      toast.error(`Failed to update ESS configuration: ${error.message}`);
    },
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async (updates: { module_codes: string[]; ess_enabled: boolean }) => {
      if (!targetCompanyId) throw new Error("No company selected");
      
      const promises = updates.module_codes.map(async (module_code) => {
        const existingConfig = essConfigs.find(c => c.module_code === module_code);
        
        if (existingConfig) {
          return supabase
            .from('ess_module_config')
            .update({
              ess_enabled: updates.ess_enabled,
              enabled_at: updates.ess_enabled ? new Date().toISOString() : existingConfig.enabled_at,
              enabled_by: updates.ess_enabled ? user?.id : existingConfig.enabled_by,
            })
            .eq('id', existingConfig.id);
        } else {
          return supabase
            .from('ess_module_config')
            .insert({
              company_id: targetCompanyId,
              module_code,
              ess_enabled: updates.ess_enabled,
              ess_view_only: false,
              requires_approval: true,
              enabled_at: updates.ess_enabled ? new Date().toISOString() : null,
              enabled_by: updates.ess_enabled ? user?.id : null,
            });
        }
      });
      
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ess-module-config', targetCompanyId] });
      toast.success("ESS configurations updated");
    },
    onError: (error) => {
      toast.error(`Failed to update ESS configurations: ${error.message}`);
    },
  });
  
  // Check if module is implemented
  const isModuleImplemented = (moduleCode: string): boolean => {
    return implementations.some(
      impl => impl.application_modules?.module_code === moduleCode && impl.status === 'completed'
    );
  };
  
  // Get implementation status
  const getImplementationStatus = (moduleCode: string): string => {
    const impl = implementations.find(i => i.application_modules?.module_code === moduleCode);
    return impl?.status || 'not_started';
  };
  
  // Get ESS config for a module
  const getEssConfig = (moduleCode: string): EssModuleConfig | null => {
    return essConfigs.find(c => c.module_code === moduleCode) || null;
  };
  
  // Check if module has ESS access (three-layer check)
  const hasEssAccess = (moduleCode: string): boolean => {
    // Check 1: Module in subscription
    if (!hasModuleAccess(moduleCode)) return false;
    
    // Check 2: ESS is enabled for this module
    const config = getEssConfig(moduleCode);
    if (!config?.ess_enabled) return false;
    
    return true;
  };
  
  // Check if module is view-only
  const isViewOnly = (moduleCode: string): boolean => {
    const config = getEssConfig(moduleCode);
    return config?.ess_view_only ?? false;
  };
  
  // Check if module requires approval
  const requiresApproval = (moduleCode: string): boolean => {
    const config = getEssConfig(moduleCode);
    return config?.requires_approval ?? true;
  };
  
  // Get module readiness status
  const getModuleReadiness = (moduleCode: string): {
    isLicensed: boolean;
    isImplemented: boolean;
    implementationStatus: string;
    isEssEnabled: boolean;
    isReady: boolean;
  } => {
    const isLicensed = hasModuleAccess(moduleCode);
    const implementationStatus = getImplementationStatus(moduleCode);
    const isImplemented = implementationStatus === 'completed';
    const config = getEssConfig(moduleCode);
    const isEssEnabled = config?.ess_enabled ?? false;
    
    return {
      isLicensed,
      isImplemented,
      implementationStatus,
      isEssEnabled,
      isReady: isLicensed && isImplemented && isEssEnabled,
    };
  };
  
  return {
    // Access checks
    hasEssAccess,
    isViewOnly,
    requiresApproval,
    
    // Config access
    getEssConfig,
    essConfigs,
    
    // Implementation checks
    isModuleImplemented,
    getImplementationStatus,
    getModuleReadiness,
    
    // Mutations
    updateConfig: updateConfigMutation.mutate,
    bulkUpdateConfig: bulkUpdateMutation.mutate,
    isUpdating: updateConfigMutation.isPending || bulkUpdateMutation.isPending,
    
    // Loading state
    isLoading: isLoadingConfigs || isLoadingImplementations,
  };
}
