import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  MaternityLeaveRequest,
  MaternityPaymentConfig,
  MaternityComplianceRule,
  MaternityReturnPlan,
  MaternityDocument,
  MaternityPayment,
  MaternityLeaveFormData,
} from "@/types/maternityLeave";

// Maternity Leave Requests
export function useMaternityLeaveRequests(companyId?: string) {
  return useQuery({
    queryKey: ["maternity-leave-requests", companyId],
    queryFn: async () => {
      let query = supabase
        .from("maternity_leave_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch employee data separately
      const employeeIds = [...new Set(data.map(r => r.employee_id))];
      const { data: employees } = await supabase
        .from("profiles")
        .select("id, first_name, email, employee_id")
        .in("id", employeeIds);
      
      const employeeMap = new Map(employees?.map(e => [e.id, e]) || []);
      
      return data.map(r => ({
        ...r,
        employee: employeeMap.get(r.employee_id) ? {
          ...employeeMap.get(r.employee_id),
          last_name: ""
        } : undefined
      })) as MaternityLeaveRequest[];
    },
    enabled: !!companyId,
  });
}

export function useMaternityLeaveRequest(id: string) {
  return useQuery({
    queryKey: ["maternity-leave-request", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maternity_leave_requests")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      // Fetch employee separately
      const { data: employee } = await supabase
        .from("profiles")
        .select("id, first_name, email, employee_id")
        .eq("id", data.employee_id)
        .single();
      
      return {
        ...data,
        employee: employee ? { ...employee, last_name: "" } : undefined
      } as MaternityLeaveRequest;
    },
    enabled: !!id,
  });
}

export function useCreateMaternityLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MaternityLeaveFormData & { company_id: string }) => {
      const { data: result, error } = await supabase
        .from("maternity_leave_requests")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maternity-leave-requests"] });
      toast.success("Maternity leave request created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create request: ${error.message}`);
    },
  });
}

export function useUpdateMaternityLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<MaternityLeaveRequest> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("maternity_leave_requests")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maternity-leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["maternity-leave-request"] });
      toast.success("Maternity leave request updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update request: ${error.message}`);
    },
  });
}

// Payment Configurations
export function useMaternityPaymentConfigs(companyId?: string) {
  return useQuery({
    queryKey: ["maternity-payment-configs", companyId],
    queryFn: async () => {
      let query = supabase
        .from("maternity_payment_configs")
        .select("*")
        .eq("is_active", true)
        .order("config_name");

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MaternityPaymentConfig[];
    },
    enabled: !!companyId,
  });
}

export function useCreatePaymentConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<MaternityPaymentConfig, "id" | "created_at" | "updated_at">) => {
      const { data: result, error } = await supabase
        .from("maternity_payment_configs")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maternity-payment-configs"] });
      toast.success("Payment configuration created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create configuration: ${error.message}`);
    },
  });
}

export function useUpdatePaymentConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<MaternityPaymentConfig> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("maternity_payment_configs")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maternity-payment-configs"] });
      toast.success("Payment configuration updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update configuration: ${error.message}`);
    },
  });
}

// Compliance Rules
export function useMaternityComplianceRules(region?: string) {
  return useQuery({
    queryKey: ["maternity-compliance-rules", region],
    queryFn: async () => {
      let query = supabase
        .from("maternity_compliance_rules")
        .select("*")
        .eq("is_active", true)
        .order("country_code");

      if (region) {
        query = query.eq("region", region);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MaternityComplianceRule[];
    },
  });
}

export function useMaternityComplianceRule(countryCode: string) {
  return useQuery({
    queryKey: ["maternity-compliance-rule", countryCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maternity_compliance_rules")
        .select("*")
        .eq("country_code", countryCode)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as MaternityComplianceRule | null;
    },
    enabled: !!countryCode,
  });
}

// Return Plans
export function useMaternityReturnPlans(maternityRequestId?: string) {
  return useQuery({
    queryKey: ["maternity-return-plans", maternityRequestId],
    queryFn: async () => {
      let query = supabase
        .from("maternity_return_plans")
        .select("*")
        .order("created_at", { ascending: false });

      if (maternityRequestId) {
        query = query.eq("maternity_request_id", maternityRequestId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MaternityReturnPlan[];
    },
    enabled: !!maternityRequestId,
  });
}

export function useCreateReturnPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<MaternityReturnPlan, "id" | "created_at" | "updated_at">) => {
      const { data: result, error } = await supabase
        .from("maternity_return_plans")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maternity-return-plans"] });
      toast.success("Return-to-work plan created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create plan: ${error.message}`);
    },
  });
}

export function useUpdateReturnPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<MaternityReturnPlan> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("maternity_return_plans")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maternity-return-plans"] });
      toast.success("Return-to-work plan updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update plan: ${error.message}`);
    },
  });
}

// Documents
export function useMaternityDocuments(maternityRequestId: string) {
  return useQuery({
    queryKey: ["maternity-documents", maternityRequestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maternity_documents")
        .select("*")
        .eq("maternity_request_id", maternityRequestId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MaternityDocument[];
    },
    enabled: !!maternityRequestId,
  });
}

export function useUploadMaternityDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      maternityRequestId,
      companyId,
      documentType,
      issueDate,
    }: {
      file: File;
      maternityRequestId: string;
      companyId: string;
      documentType: string;
      issueDate?: string;
    }) => {
      const filePath = `maternity/${companyId}/${maternityRequestId}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from("maternity_documents")
        .insert({
          maternity_request_id: maternityRequestId,
          company_id: companyId,
          document_type: documentType,
          document_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          issue_date: issueDate,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maternity-documents"] });
      toast.success("Document uploaded successfully");
    },
    onError: (error) => {
      toast.error(`Failed to upload document: ${error.message}`);
    },
  });
}

export function useDeleteMaternityDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, filePath }: { id: string; filePath: string }) => {
      await supabase.storage.from("documents").remove([filePath]);
      
      const { error } = await supabase
        .from("maternity_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maternity-documents"] });
      toast.success("Document deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });
}

// Payments
export function useMaternityPayments(maternityRequestId: string) {
  return useQuery({
    queryKey: ["maternity-payments", maternityRequestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maternity_payments")
        .select("*")
        .eq("maternity_request_id", maternityRequestId)
        .order("payment_period_start");

      if (error) throw error;
      return data as MaternityPayment[];
    },
    enabled: !!maternityRequestId,
  });
}

export function useGenerateMaternityPayments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      maternityRequestId,
      companyId,
      employeeId,
      payments,
    }: {
      maternityRequestId: string;
      companyId: string;
      employeeId: string;
      payments: Array<{
        payment_period_start: string;
        payment_period_end: string;
        statutory_amount: number;
        employer_topup_amount: number;
        total_amount: number;
        currency: string;
        payment_type: string;
        payment_source: string;
      }>;
    }) => {
      const paymentRecords = payments.map((p) => ({
        ...p,
        maternity_request_id: maternityRequestId,
        company_id: companyId,
        employee_id: employeeId,
      }));

      const { data, error } = await supabase
        .from("maternity_payments")
        .insert(paymentRecords)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maternity-payments"] });
      toast.success("Payment schedule generated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to generate payments: ${error.message}`);
    },
  });
}
