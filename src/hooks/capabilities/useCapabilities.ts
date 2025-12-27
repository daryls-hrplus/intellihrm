import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type CapabilityRow = Database['public']['Tables']['capabilities']['Row'];
type CapabilityInsert = Database['public']['Tables']['capabilities']['Insert'];
type CapabilityUpdate = Database['public']['Tables']['capabilities']['Update'];
type EvidenceRow = Database['public']['Tables']['capability_evidence']['Row'];
type EvidenceInsert = Database['public']['Tables']['capability_evidence']['Insert'];

interface FetchCapabilitiesFilters {
  companyId?: string;
  type?: CapabilityRow['type'];
  category?: CapabilityRow['category'];
  status?: CapabilityRow['status'];
  search?: string;
}

export function useCapabilities() {
  const [capabilities, setCapabilities] = useState<CapabilityRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCapabilities = useCallback(async (filters?: FetchCapabilitiesFilters) => {
    setIsLoading(true);
    try {
      let query = supabase.from("capabilities").select("*");

      if (filters?.companyId) {
        query = query.or(`company_id.eq.${filters.companyId},company_id.is.null`);
      }
      if (filters?.type) {
        query = query.eq("type", filters.type);
      }
      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order("name");
      if (error) throw error;
      setCapabilities(data || []);
      return data || [];
    } catch (error) {
      console.error("Error fetching capabilities:", error);
      toast.error("Failed to load capabilities");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCapability = useCallback(async (capability: CapabilityInsert) => {
    try {
      const { data, error } = await supabase
        .from("capabilities")
        .insert(capability)
        .select()
        .single();
      if (error) throw error;
      toast.success("Capability created successfully");
      return data;
    } catch (error) {
      console.error("Error creating capability:", error);
      toast.error("Failed to create capability");
      return null;
    }
  }, []);

  const updateCapability = useCallback(async (id: string, updates: CapabilityUpdate) => {
    try {
      const { data, error } = await supabase
        .from("capabilities")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      toast.success("Capability updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating capability:", error);
      toast.error("Failed to update capability");
      return null;
    }
  }, []);

  return {
    capabilities,
    isLoading,
    fetchCapabilities,
    createCapability,
    updateCapability,
  };
}

export function useEmployeeCapabilities(employeeId?: string) {
  const [evidence, setEvidence] = useState<(EvidenceRow & { capability?: CapabilityRow })[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEmployeeCapabilities = useCallback(async () => {
    if (!employeeId) return [];
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("capability_evidence")
        .select(`
          *,
          capability:capabilities(*)
        `)
        .eq("employee_id", employeeId)
        .order("effective_from", { ascending: false });

      if (error) throw error;
      setEvidence(data || []);
      return data || [];
    } catch (error) {
      console.error("Error fetching employee capabilities:", error);
      toast.error("Failed to load employee capabilities");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  const addEvidence = useCallback(async (newEvidence: EvidenceInsert) => {
    try {
      const { data, error } = await supabase
        .from("capability_evidence")
        .insert(newEvidence)
        .select()
        .single();
      if (error) throw error;
      toast.success("Evidence recorded successfully");
      return data;
    } catch (error) {
      console.error("Error adding evidence:", error);
      toast.error("Failed to record evidence");
      return null;
    }
  }, []);

  return {
    evidence,
    isLoading,
    fetchEmployeeCapabilities,
    addEvidence,
  };
}
