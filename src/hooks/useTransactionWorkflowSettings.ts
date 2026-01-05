import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TransactionWorkflowSetting {
  id: string;
  company_id: string;
  transaction_type_id: string;
  workflow_enabled: boolean;
  workflow_template_id: string | null;
  requires_approval_before_effective: boolean;
  auto_start_workflow: boolean;
  effective_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  transaction_type?: {
    id: string;
    code: string;
    name: string;
  } | null;
  workflow_template?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface TransactionType {
  id: string;
  code: string;
  name: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  code: string;
  category: string | null;
}

type LookupValueRow = {
  id: string;
  code: string | null;
  name: string | null;
};

type WorkflowTemplateRow = {
  id: string;
  name: string;
  code: string;
  category: string | null;
};

export function useTransactionWorkflowSettings(companyId?: string) {
  const [settings, setSettings] = useState<TransactionWorkflowSetting[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactionTypes = useCallback(async () => {
    const { data, error } = await supabase
      .from("lookup_values")
      .select("id, code, name")
      .eq("category", "transaction_type" as never)
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching transaction types:", error);
      return;
    }
    const rows = data as unknown as LookupValueRow[];
    const typedData: TransactionType[] = (rows || []).map(item => ({
      id: item.id,
      code: item.code || '',
      name: item.name || '',
    }));
    setTransactionTypes(typedData);
  }, []);

  const fetchWorkflowTemplates = useCallback(async () => {
    let query = supabase
      .from("workflow_templates")
      .select("id, name, code, category")
      .eq("is_active", true);

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    const { data, error } = await query.order("name");

    if (error) {
      console.error("Error fetching workflow templates:", error);
      return;
    }
    const rows = data as unknown as WorkflowTemplateRow[];
    const typedData: WorkflowTemplate[] = (rows || []).map(item => ({
      id: item.id,
      name: item.name,
      code: item.code,
      category: item.category,
    }));
    setWorkflowTemplates(typedData);
  }, [companyId]);

  const fetchSettings = useCallback(async () => {
    if (!companyId) {
      setSettings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Fetch settings first
    const { data: settingsData, error: settingsError } = await supabase
      .from("company_transaction_workflow_settings")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at");

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      toast.error("Failed to load workflow settings");
      setLoading(false);
      return;
    }

    const rawSettings = settingsData as unknown as Array<{
      id: string;
      company_id: string;
      transaction_type_id: string;
      workflow_enabled: boolean;
      workflow_template_id: string | null;
      requires_approval_before_effective: boolean;
      auto_start_workflow: boolean;
      effective_date: string | null;
      end_date: string | null;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    }>;

    // Fetch related transaction types
    const transactionTypeIds = (rawSettings || []).map(s => s.transaction_type_id).filter(Boolean);
    const transactionTypesMap: Record<string, { id: string; code: string; name: string }> = {};
    
    if (transactionTypeIds.length > 0) {
      const { data: txTypes } = await supabase
        .from("lookup_values")
        .select("id, code, name")
        .in("id", transactionTypeIds);
      
      const txRows = txTypes as unknown as LookupValueRow[];
      (txRows || []).forEach(t => {
        transactionTypesMap[t.id] = { id: t.id, code: t.code || '', name: t.name || '' };
      });
    }

    // Fetch related workflow templates
    const templateIds = (rawSettings || []).map(s => s.workflow_template_id).filter(Boolean) as string[];
    const templatesMap: Record<string, { id: string; name: string; code: string }> = {};
    
    if (templateIds.length > 0) {
      const { data: templates } = await supabase
        .from("workflow_templates")
        .select("id, name, code")
        .in("id", templateIds);
      
      const templateRows = templates as unknown as Array<{ id: string; name: string; code: string }>;
      (templateRows || []).forEach(t => {
        templatesMap[t.id] = { id: t.id, name: t.name, code: t.code };
      });
    }

    // Combine the data
    const enrichedSettings: TransactionWorkflowSetting[] = (rawSettings || []).map(s => ({
      ...s,
      transaction_type: transactionTypesMap[s.transaction_type_id] || null,
      workflow_template: s.workflow_template_id ? templatesMap[s.workflow_template_id] || null : null,
    }));

    setSettings(enrichedSettings);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    fetchTransactionTypes();
    fetchWorkflowTemplates();
    fetchSettings();
  }, [fetchTransactionTypes, fetchWorkflowTemplates, fetchSettings]);

  const upsertSetting = async (
    transactionTypeId: string,
    updates: Partial<Omit<TransactionWorkflowSetting, "id" | "company_id" | "transaction_type_id" | "created_at" | "updated_at" | "transaction_type" | "workflow_template">>
  ) => {
    if (!companyId) {
      toast.error("Please select a company first");
      return null;
    }

    const existingSetting = settings.find(
      (s) => s.transaction_type_id === transactionTypeId
    );

    if (existingSetting) {
      const { data, error } = await supabase
        .from("company_transaction_workflow_settings")
        .update(updates)
        .eq("id", existingSetting.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating setting:", error);
        toast.error("Failed to update workflow setting");
        return null;
      }
      toast.success("Workflow setting updated");
      await fetchSettings();
      return data;
    } else {
      const { data, error } = await supabase
        .from("company_transaction_workflow_settings")
        .insert({
          company_id: companyId,
          transaction_type_id: transactionTypeId,
          ...updates,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating setting:", error);
        toast.error("Failed to create workflow setting");
        return null;
      }
      toast.success("Workflow setting created");
      await fetchSettings();
      return data;
    }
  };

  const getSettingForType = useCallback(
    (transactionTypeCode: string) => {
      const transactionType = transactionTypes.find(
        (t) => t.code === transactionTypeCode
      );
      if (!transactionType) return null;

      return settings.find(
        (s) =>
          s.transaction_type_id === transactionType.id &&
          s.is_active &&
          s.workflow_enabled
      );
    },
    [settings, transactionTypes]
  );

  const bulkEnableWorkflow = async (
    transactionTypeIds: string[],
    enabled: boolean
  ) => {
    if (!companyId) {
      toast.error("Please select a company first");
      return;
    }

    for (const typeId of transactionTypeIds) {
      await upsertSetting(typeId, { workflow_enabled: enabled });
    }
    toast.success(
      `Workflow ${enabled ? "enabled" : "disabled"} for ${transactionTypeIds.length} transaction types`
    );
  };

  return {
    settings,
    transactionTypes,
    workflowTemplates,
    loading,
    upsertSetting,
    getSettingForType,
    bulkEnableWorkflow,
    refetch: fetchSettings,
  };
}
