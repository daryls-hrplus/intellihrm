import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export interface ComplianceTemplate {
  id: string;
  code: string;
  name: string;
  category: string;
  jurisdiction: string;
  country_code: string | null;
  description: string | null;
  template_content: string;
  required_variables: string[];
  signature_requirements: unknown[];
  retention_period_years: number;
  legal_reference: string | null;
  is_active: boolean;
  version: number;
}

export interface ComplianceDocumentInstance {
  id: string;
  template_id: string;
  employee_id: string;
  company_id: string;
  source_type: string;
  source_id: string | null;
  workflow_instance_id: string | null;
  workflow_letter_id: string | null;
  generated_content: string;
  variable_values: Record<string, string>;
  status: string;
  retention_expires_at: string | null;
  created_by: string;
  created_at: string;
  completed_at: string | null;
  template?: ComplianceTemplate;
  employee?: { id: string; first_name: string; last_name: string };
}

export interface CreateDocumentParams {
  templateId: string;
  employeeId: string;
  companyId: string;
  sourceType: string;
  sourceId?: string;
  variableValues: Record<string, string>;
  generatedContent: string;
}

export function useComplianceTemplates(options?: {
  jurisdiction?: string;
  countryCode?: string;
  category?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["compliance-templates", options?.jurisdiction, options?.countryCode, options?.category],
    queryFn: async () => {
      let query = supabase
        .from("compliance_document_templates")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (options?.jurisdiction) {
        query = query.or(`jurisdiction.eq.${options.jurisdiction},jurisdiction.eq.global`);
      }
      if (options?.countryCode) {
        query = query.or(`country_code.eq.${options.countryCode},country_code.is.null`);
      }
      if (options?.category) {
        query = query.eq("category", options.category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ComplianceTemplate[];
    },
    enabled: options?.enabled !== false,
  });
}

export function useComplianceTemplate(templateId: string | null) {
  return useQuery({
    queryKey: ["compliance-template", templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const { data, error } = await supabase
        .from("compliance_document_templates")
        .select("*")
        .eq("id", templateId)
        .single();
      if (error) throw error;
      return data as ComplianceTemplate;
    },
    enabled: !!templateId,
  });
}

export function useComplianceDocuments(options?: {
  employeeId?: string;
  companyId?: string;
  sourceType?: string;
  sourceId?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["compliance-documents", options],
    queryFn: async () => {
      let query = supabase
        .from("compliance_document_instances")
        .select(`
          *,
          template:compliance_document_templates(*)
        `)
        .order("created_at", { ascending: false });

      if (options?.employeeId) {
        query = query.eq("employee_id", options.employeeId);
      }
      if (options?.companyId) {
        query = query.eq("company_id", options.companyId);
      }
      if (options?.sourceType) {
        query = query.eq("source_type", options.sourceType);
      }
      if (options?.sourceId) {
        query = query.eq("source_id", options.sourceId);
      }
      if (options?.status) {
        query = query.eq("status", options.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as ComplianceDocumentInstance[];
    },
  });
}

export function useCreateComplianceDocument() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (params: CreateDocumentParams) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const template = await supabase
        .from("compliance_document_templates")
        .select("retention_period_years")
        .eq("id", params.templateId)
        .single();

      const retentionYears = template.data?.retention_period_years || 7;
      const retentionExpiresAt = new Date();
      retentionExpiresAt.setFullYear(retentionExpiresAt.getFullYear() + retentionYears);

      const { data, error } = await supabase
        .from("compliance_document_instances")
        .insert({
          template_id: params.templateId,
          employee_id: params.employeeId,
          company_id: params.companyId,
          source_type: params.sourceType,
          source_id: params.sourceId || null,
          variable_values: params.variableValues,
          generated_content: params.generatedContent,
          status: "draft",
          retention_expires_at: retentionExpiresAt.toISOString(),
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-documents"] });
      toast.success(t("compliance.documentCreated", "Document created successfully"));
    },
    onError: (error) => {
      toast.error(t("compliance.documentCreateError", "Failed to create document"));
      console.error("Create document error:", error);
    },
  });
}

export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === "signed") {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("compliance_document_instances")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-documents"] });
      toast.success(t("compliance.statusUpdated", "Document status updated"));
    },
    onError: (error) => {
      toast.error(t("compliance.statusUpdateError", "Failed to update status"));
      console.error("Update status error:", error);
    },
  });
}

export function useLinkDocumentToSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      sourceType,
      sourceId,
    }: {
      documentId: string;
      sourceType: "disciplinary" | "grievance";
      sourceId: string;
    }) => {
      if (sourceType === "disciplinary") {
        const { error } = await supabase
          .from("er_disciplinary_actions")
          .update({ compliance_document_id: documentId })
          .eq("id", sourceId);
        if (error) throw error;
      } else if (sourceType === "grievance") {
        const { error } = await supabase
          .from("grievances")
          .update({ resolution_document_id: documentId })
          .eq("id", sourceId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinary-actions"] });
      queryClient.invalidateQueries({ queryKey: ["grievances"] });
    },
  });
}

export function useComplianceDocumentStats(companyId: string | null) {
  return useQuery({
    queryKey: ["compliance-document-stats", companyId],
    queryFn: async () => {
      if (!companyId) return null;

      const { data, error } = await supabase
        .from("compliance_document_instances")
        .select("status")
        .eq("company_id", companyId);

      if (error) throw error;

      const stats = {
        total: data.length,
        draft: data.filter((d) => d.status === "draft").length,
        pending_signatures: data.filter((d) => d.status === "pending_signatures").length,
        signed: data.filter((d) => d.status === "signed").length,
        byCategory: {} as Record<string, number>,
      };

      return stats;
    },
    enabled: !!companyId,
  });
}

export function generateDocumentContent(
  templateContent: string,
  variables: Record<string, string>
): string {
  let content = templateContent;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    content = content.replace(regex, value || "");
  });
  return content;
}

export function extractTemplateVariables(templateContent: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables: string[] = [];
  let match;
  while ((match = regex.exec(templateContent)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  return variables;
}
