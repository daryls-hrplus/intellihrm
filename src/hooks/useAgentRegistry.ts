import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AIAgent {
  id: string;
  agent_code: string;
  agent_name: string;
  description: string | null;
  agent_type: string;
  category: string;
  version: string | null;
  status: string;
  is_enabled: boolean | null;
  function_name: string | null;
  endpoint_url: string | null;
  capabilities: string[];
  input_schema: any;
  output_schema: any;
  dependencies: string[] | null;
  rate_limit_per_minute: number | null;
  timeout_seconds: number | null;
  retry_config: any;
  metadata: any;
  company_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentExecution {
  id: string;
  agent_id: string;
  execution_id: string;
  status: string;
  trigger_type: string | null;
  trigger_source: string | null;
  input_data: any;
  output_data: any;
  error_message: string | null;
  error_code: string | null;
  tokens_used: number | null;
  estimated_cost_usd: number | null;
  latency_ms: number | null;
  started_at: string;
  completed_at: string | null;
  company_id: string | null;
  user_id: string | null;
  session_id: string | null;
  metadata: any;
  agent?: AIAgent;
}

export interface AgentMetrics {
  id: string;
  agent_id: string;
  metric_date: string;
  metric_hour: number | null;
  total_executions: number | null;
  successful_executions: number | null;
  failed_executions: number | null;
  avg_latency_ms: number | null;
  p95_latency_ms: number | null;
  p99_latency_ms: number | null;
  total_tokens_used: number | null;
  total_cost_usd: number | null;
  error_rate: number | null;
}

export interface AgentAlert {
  id: string;
  agent_id: string | null;
  alert_type: string;
  severity: string;
  title: string;
  message: string | null;
  threshold_value: number | null;
  actual_value: number | null;
  is_resolved: boolean | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  agent?: AIAgent;
}

export interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  totalExecutions: number;
  successRate: number;
  avgLatency: number;
  totalCost: number;
  alertsCount: number;
}

export function useAgentRegistry() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [metrics, setMetrics] = useState<AgentMetrics[]>([]);
  const [alerts, setAlerts] = useState<AgentAlert[]>([]);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .order("category", { ascending: true })
        .order("agent_name", { ascending: true });

      if (error) throw error;
      
      // Parse capabilities from JSON
      const parsedAgents: AIAgent[] = (data || []).map(agent => ({
        ...agent,
        capabilities: Array.isArray(agent.capabilities) 
          ? agent.capabilities as string[]
          : typeof agent.capabilities === 'string' 
            ? JSON.parse(agent.capabilities) 
            : []
      }));
      
      setAgents(parsedAgents);
      return parsedAgents;
    } catch (error) {
      console.error("Error fetching agents:", error);
      return [];
    }
  }, []);

  const fetchExecutions = useCallback(async (agentId?: string, limit = 50) => {
    try {
      let query = supabase
        .from("ai_agent_executions")
        .select("*, agent:ai_agents(*)")
        .order("started_at", { ascending: false })
        .limit(limit);

      if (agentId) {
        query = query.eq("agent_id", agentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      const parsed = (data || []) as unknown as AgentExecution[];
      setExecutions(parsed);
      return parsed;
    } catch (error) {
      console.error("Error fetching executions:", error);
      return [];
    }
  }, []);

  const fetchMetrics = useCallback(async (agentId?: string, days = 7) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from("ai_agent_metrics")
        .select("*")
        .gte("metric_date", startDate.toISOString().split("T")[0])
        .order("metric_date", { ascending: false });

      if (agentId) {
        query = query.eq("agent_id", agentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMetrics(data || []);
      return data || [];
    } catch (error) {
      console.error("Error fetching metrics:", error);
      return [];
    }
  }, []);

  const fetchAlerts = useCallback(async (includeResolved = false) => {
    try {
      let query = supabase
        .from("ai_agent_alerts")
        .select("*, agent:ai_agents(*)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!includeResolved) {
        query = query.eq("is_resolved", false);
      }

      const { data, error } = await query;

      if (error) throw error;
      const parsed = (data || []) as unknown as AgentAlert[];
      setAlerts(parsed);
      return parsed;
    } catch (error) {
      console.error("Error fetching alerts:", error);
      return [];
    }
  }, []);

  const calculateStats = useCallback((
    agentsList: AIAgent[],
    executionsList: AgentExecution[],
    alertsList: AgentAlert[]
  ): AgentStats => {
    const totalExecutions = executionsList.length;
    const successfulExecutions = executionsList.filter(e => e.status === "completed").length;
    const totalLatency = executionsList.reduce((sum, e) => sum + (e.latency_ms || 0), 0);
    const totalCost = executionsList.reduce((sum, e) => sum + (Number(e.estimated_cost_usd) || 0), 0);

    return {
      totalAgents: agentsList.length,
      activeAgents: agentsList.filter(a => a.status === "active" && a.is_enabled).length,
      totalExecutions,
      successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 100,
      avgLatency: totalExecutions > 0 ? totalLatency / totalExecutions : 0,
      totalCost,
      alertsCount: alertsList.filter(a => !a.is_resolved).length
    };
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [agentsList, executionsList, alertsList] = await Promise.all([
        fetchAgents(),
        fetchExecutions(),
        fetchAlerts()
      ]);
      
      await fetchMetrics();
      
      const calculatedStats = calculateStats(agentsList, executionsList, alertsList);
      setStats(calculatedStats);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAgents, fetchExecutions, fetchAlerts, fetchMetrics, calculateStats]);

  const updateAgentStatus = useCallback(async (agentId: string, isEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from("ai_agents")
        .update({ is_enabled: isEnabled, updated_at: new Date().toISOString() })
        .eq("id", agentId);

      if (error) throw error;

      setAgents(prev => prev.map(a => 
        a.id === agentId ? { ...a, is_enabled: isEnabled } : a
      ));

      toast.success(`Agent ${isEnabled ? "enabled" : "disabled"} successfully`);
    } catch (error) {
      console.error("Error updating agent:", error);
      toast.error("Failed to update agent status");
    }
  }, []);

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("ai_agent_alerts")
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString()
        })
        .eq("id", alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, is_resolved: true, resolved_at: new Date().toISOString() } : a
      ));

      toast.success("Alert resolved");
    } catch (error) {
      console.error("Error resolving alert:", error);
      toast.error("Failed to resolve alert");
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    agents,
    executions,
    metrics,
    alerts,
    stats,
    isLoading,
    selectedAgent,
    setSelectedAgent,
    refreshAll,
    fetchExecutions,
    fetchMetrics,
    updateAgentStatus,
    resolveAlert
  };
}
