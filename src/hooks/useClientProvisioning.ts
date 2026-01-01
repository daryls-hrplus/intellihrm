import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type DemoRegistrationStatus = 
  | "pending" 
  | "demo_active" 
  | "converting" 
  | "converted" 
  | "declined" 
  | "expired";

export type ProvisioningTaskStatus = 
  | "pending" 
  | "in_progress" 
  | "completed" 
  | "failed" 
  | "skipped";

export type ProvisioningTaskType =
  | "create_project"
  | "enable_cloud"
  | "run_seed_script"
  | "create_subdomain"
  | "connect_domain"
  | "verify_dns"
  | "create_admin_user"
  | "send_credentials";

export interface DemoRegistration {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  country: string;
  employee_count: number | null;
  industry: string | null;
  preferred_subdomain: string | null;
  status: DemoRegistrationStatus;
  demo_started_at: string | null;
  demo_expires_at: string | null;
  conversion_requested_at: string | null;
  converted_at: string | null;
  assigned_subdomain: string | null;
  lovable_project_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProvisioningTask {
  id: string;
  registration_id: string;
  task_type: ProvisioningTaskType;
  task_order: number;
  task_name: string;
  is_manual: boolean;
  status: ProvisioningTaskStatus;
  started_at: string | null;
  completed_at: string | null;
  completed_by: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const PROVISIONING_TASK_DEFINITIONS: Array<{
  type: ProvisioningTaskType;
  name: string;
  order: number;
  isManual: boolean;
}> = [
  { type: "create_project", name: "Create Lovable Project", order: 1, isManual: true },
  { type: "enable_cloud", name: "Enable Lovable Cloud", order: 2, isManual: true },
  { type: "run_seed_script", name: "Run Seed Data Script", order: 3, isManual: false },
  { type: "create_subdomain", name: "Create DNS Subdomain", order: 4, isManual: false },
  { type: "connect_domain", name: "Connect Custom Domain", order: 5, isManual: true },
  { type: "verify_dns", name: "Verify DNS Propagation", order: 6, isManual: false },
  { type: "create_admin_user", name: "Create Admin User", order: 7, isManual: false },
  { type: "send_credentials", name: "Send Client Credentials", order: 8, isManual: false },
];

export function useClientProvisioning() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<DemoRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("demo_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setRegistrations((data as unknown as DemoRegistration[]) || []);
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch registrations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const createRegistration = async (
    data: Omit<DemoRegistration, "id" | "created_at" | "updated_at" | "status" | "demo_started_at" | "demo_expires_at" | "conversion_requested_at" | "converted_at" | "assigned_subdomain" | "lovable_project_id">
  ) => {
    try {
      const { data: newReg, error: createError } = await supabase
        .from("demo_registrations")
        .insert(data)
        .select()
        .single();

      if (createError) throw createError;
      
      toast.success("Demo registration created successfully");
      await fetchRegistrations();
      return newReg as unknown as DemoRegistration;
    } catch (err) {
      console.error("Error creating registration:", err);
      toast.error("Failed to create registration");
      throw err;
    }
  };

  const updateRegistration = async (id: string, updates: Partial<DemoRegistration>) => {
    try {
      const { error: updateError } = await supabase
        .from("demo_registrations")
        .update(updates)
        .eq("id", id);

      if (updateError) throw updateError;
      
      toast.success("Registration updated");
      await fetchRegistrations();
    } catch (err) {
      console.error("Error updating registration:", err);
      toast.error("Failed to update registration");
      throw err;
    }
  };

  const startProvisioning = async (registrationId: string) => {
    try {
      // Create all provisioning tasks
      const tasks = PROVISIONING_TASK_DEFINITIONS.map(task => ({
        registration_id: registrationId,
        task_type: task.type,
        task_order: task.order,
        task_name: task.name,
        is_manual: task.isManual,
        status: "pending" as ProvisioningTaskStatus,
        metadata: {},
      }));

      const { error: insertError } = await supabase
        .from("client_provisioning_tasks")
        .insert(tasks);

      if (insertError) throw insertError;

      // Update registration status to converting
      await updateRegistration(registrationId, { 
        status: "converting",
        conversion_requested_at: new Date().toISOString()
      });

      toast.success("Provisioning workflow started");
    } catch (err) {
      console.error("Error starting provisioning:", err);
      toast.error("Failed to start provisioning");
      throw err;
    }
  };

  const getRegistrationById = async (id: string): Promise<DemoRegistration | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from("demo_registrations")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      return data as unknown as DemoRegistration;
    } catch (err) {
      console.error("Error fetching registration:", err);
      return null;
    }
  };

  return {
    registrations,
    isLoading,
    error,
    fetchRegistrations,
    createRegistration,
    updateRegistration,
    startProvisioning,
    getRegistrationById,
    taskDefinitions: PROVISIONING_TASK_DEFINITIONS,
  };
}

export function useProvisioningTasks(registrationId: string | undefined) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ProvisioningTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!registrationId) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("client_provisioning_tasks")
        .select("*")
        .eq("registration_id", registrationId)
        .order("task_order", { ascending: true });

      if (error) throw error;
      setTasks((data as unknown as ProvisioningTask[]) || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, [registrationId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateTaskStatus = async (
    taskId: string, 
    status: ProvisioningTaskStatus, 
    metadata?: Record<string, unknown>,
    errorMessage?: string
  ) => {
    try {
      const updates: Record<string, unknown> = { 
        status,
        ...(status === "in_progress" && { started_at: new Date().toISOString() }),
        ...(status === "completed" && { 
          completed_at: new Date().toISOString(),
          completed_by: user?.id
        }),
        ...(metadata && { metadata }),
        ...(errorMessage && { error_message: errorMessage }),
      };

      const { error } = await supabase
        .from("client_provisioning_tasks")
        .update(updates)
        .eq("id", taskId);

      if (error) throw error;
      
      await fetchTasks();
      toast.success(`Task ${status}`);
    } catch (err) {
      console.error("Error updating task:", err);
      toast.error("Failed to update task");
      throw err;
    }
  };

  const executeAutomatedTask = async (task: ProvisioningTask) => {
    try {
      await updateTaskStatus(task.id, "in_progress");

      // Call appropriate edge function based on task type
      let result: { success: boolean; error?: string; data?: unknown };

      switch (task.task_type) {
        case "create_subdomain":
          const { data: dnsData, error: dnsError } = await supabase.functions.invoke(
            "manage-client-dns",
            {
              body: {
                action: "create",
                registrationId: task.registration_id,
              },
            }
          );
          result = dnsError ? { success: false, error: dnsError.message } : { success: true, data: dnsData };
          break;

        case "verify_dns":
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
            "manage-client-dns",
            {
              body: {
                action: "verify",
                registrationId: task.registration_id,
              },
            }
          );
          result = verifyError ? { success: false, error: verifyError.message } : { success: true, data: verifyData };
          break;

        case "send_credentials":
          const { data: credData, error: credError } = await supabase.functions.invoke(
            "send-client-credentials",
            {
              body: {
                registrationId: task.registration_id,
              },
            }
          );
          result = credError ? { success: false, error: credError.message } : { success: true, data: credData };
          break;

        default:
          result = { success: false, error: "Task type not implemented for automation" };
      }

      if (result.success) {
        await updateTaskStatus(task.id, "completed", result.data as Record<string, unknown>);
      } else {
        await updateTaskStatus(task.id, "failed", undefined, result.error);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      await updateTaskStatus(task.id, "failed", undefined, errorMessage);
      throw err;
    }
  };

  const completeManualTask = async (taskId: string, notes?: string) => {
    await updateTaskStatus(taskId, "completed", notes ? { notes } : undefined);
  };

  const skipTask = async (taskId: string, reason: string) => {
    await updateTaskStatus(taskId, "skipped", { skip_reason: reason });
  };

  const getProgress = () => {
    if (tasks.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = tasks.filter(t => t.status === "completed" || t.status === "skipped").length;
    return {
      completed,
      total: tasks.length,
      percentage: Math.round((completed / tasks.length) * 100),
    };
  };

  return {
    tasks,
    isLoading,
    fetchTasks,
    updateTaskStatus,
    executeAutomatedTask,
    completeManualTask,
    skipTask,
    getProgress,
  };
}
