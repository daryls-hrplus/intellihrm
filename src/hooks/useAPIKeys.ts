import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface APIKey {
  id: string;
  company_id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  rate_limit_per_minute: number;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface APIRequestLog {
  id: string;
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  ip_address: string | null;
  user_agent: string | null;
  request_at: string;
  response_time_ms: number | null;
  error_message: string | null;
}

export interface CreateAPIKeyInput {
  name: string;
  scopes: string[];
  rate_limit_per_minute?: number;
  expires_at?: string | null;
}

// Generate secure API key
function generateAPIKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "igk_";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Hash API key using Web Crypto API
async function hashAPIKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function useAPIKeys(companyId?: string) {
  return useQuery({
    queryKey: ["api-keys", companyId],
    queryFn: async () => {
      let query = supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as APIKey[];
    },
    enabled: true,
  });
}

export function useAPIKeyLogs(apiKeyId?: string) {
  return useQuery({
    queryKey: ["api-key-logs", apiKeyId],
    queryFn: async () => {
      let query = supabase
        .from("api_request_logs")
        .select("*")
        .order("request_at", { ascending: false })
        .limit(100);

      if (apiKeyId) {
        query = query.eq("api_key_id", apiKeyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as APIRequestLog[];
    },
    enabled: true,
  });
}

export function useAPIKeyStats(apiKeyId?: string) {
  return useQuery({
    queryKey: ["api-key-stats", apiKeyId],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      let query = supabase
        .from("api_request_logs")
        .select("request_at, status_code, response_time_ms")
        .gte("request_at", sevenDaysAgo.toISOString());

      if (apiKeyId) {
        query = query.eq("api_key_id", apiKeyId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const logs = data || [];
      const totalRequests = logs.length;
      const successfulRequests = logs.filter((l) => l.status_code >= 200 && l.status_code < 300).length;
      const errorRequests = logs.filter((l) => l.status_code >= 400).length;
      const avgResponseTime = logs.length > 0
        ? Math.round(logs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / logs.length)
        : 0;

      // Group by day
      const dailyStats = logs.reduce((acc, log) => {
        const date = new Date(log.request_at).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = { date, requests: 0, errors: 0 };
        }
        acc[date].requests++;
        if (log.status_code >= 400) {
          acc[date].errors++;
        }
        return acc;
      }, {} as Record<string, { date: string; requests: number; errors: number }>);

      return {
        totalRequests,
        successfulRequests,
        errorRequests,
        avgResponseTime,
        successRate: totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 100,
        dailyStats: Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date)),
      };
    },
    enabled: true,
  });
}

export function useCreateAPIKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAPIKeyInput & { company_id: string }) => {
      const rawKey = generateAPIKey();
      const keyHash = await hashAPIKey(rawKey);
      const keyPrefix = rawKey.substring(0, 8) + "...";

      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("api_keys")
        .insert({
          company_id: input.company_id,
          name: input.name,
          key_prefix: keyPrefix,
          key_hash: keyHash,
          scopes: input.scopes,
          rate_limit_per_minute: input.rate_limit_per_minute || 60,
          expires_at: input.expires_at || null,
          created_by: userData.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Return both the created record and the raw key (shown once)
      return { ...data, rawKey };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create API key: ${error.message}`);
    },
  });
}

export function useUpdateAPIKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<APIKey> & { id: string }) => {
      const { data, error } = await supabase
        .from("api_keys")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update API key: ${error.message}`);
    },
  });
}

export function useRevokeAPIKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("api_keys")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key revoked successfully");
    },
    onError: (error) => {
      toast.error(`Failed to revoke API key: ${error.message}`);
    },
  });
}

export function useDeleteAPIKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete API key: ${error.message}`);
    },
  });
}
