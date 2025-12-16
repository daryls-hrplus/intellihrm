import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PayslipTemplate {
  id: string;
  company_id: string;
  template_name: string;
  template_style: 'classic' | 'modern' | 'minimal';
  
  // Company branding
  company_logo_url: string | null;
  company_name_override: string | null;
  company_address: string | null;
  company_phone: string | null;
  company_email: string | null;
  company_website: string | null;
  company_registration_number: string | null;
  
  // Colors
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  
  // Content options
  show_company_logo: boolean;
  show_company_address: boolean;
  show_employee_address: boolean;
  show_employee_id: boolean;
  show_department: boolean;
  show_position: boolean;
  show_bank_details: boolean;
  show_ytd_totals: boolean;
  show_tax_breakdown: boolean;
  show_statutory_breakdown: boolean;
  
  // Custom text
  header_text: string | null;
  footer_text: string | null;
  confidentiality_notice: string | null;
  
  // Status
  is_active: boolean;
  is_default: boolean;
  
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export function usePayslipTemplates() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchTemplates = async (companyId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("payslip_templates")
        .select("*")
        .eq("company_id", companyId)
        .order("is_default", { ascending: false });
      
      if (error) throw error;
      return data as PayslipTemplate[];
    } catch (err: any) {
      toast.error("Failed to fetch payslip templates");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDefaultTemplate = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from("payslip_templates")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("is_default", { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as PayslipTemplate | null;
    } catch (err: any) {
      console.error("Failed to fetch default template:", err);
      return null;
    }
  };

  const createTemplate = async (template: Partial<PayslipTemplate>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("payslip_templates")
        .insert(template as any)
        .select()
        .single();
      
      if (error) throw error;
      toast.success("Payslip template created");
      return data as PayslipTemplate;
    } catch (err: any) {
      toast.error(err.message || "Failed to create template");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTemplate = async (id: string, updates: Partial<PayslipTemplate>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("payslip_templates")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      toast.success("Payslip template updated");
      return data as PayslipTemplate;
    } catch (err: any) {
      toast.error(err.message || "Failed to update template");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("payslip_templates")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Payslip template deleted");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to delete template");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultTemplate = async (companyId: string, templateId: string) => {
    setIsLoading(true);
    try {
      // First, unset all defaults for this company
      await supabase
        .from("payslip_templates")
        .update({ is_default: false } as any)
        .eq("company_id", companyId);
      
      // Then set the new default
      const { error } = await supabase
        .from("payslip_templates")
        .update({ is_default: true } as any)
        .eq("id", templateId);
      
      if (error) throw error;
      toast.success("Default template updated");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to set default template");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadLogo = async (companyId: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${companyId}/payslip-logo-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('company-assets')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (err: any) {
      toast.error("Failed to upload logo");
      return null;
    }
  };

  return {
    isLoading,
    fetchTemplates,
    fetchDefaultTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    uploadLogo,
  };
}
