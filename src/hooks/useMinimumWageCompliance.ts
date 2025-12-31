import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MinimumWageRate {
  id: string;
  country: string;
  region: string | null;
  wage_type: string;
  rate: number;
  currency_id: string | null;
  effective_from: string;
  effective_to: string | null;
  applicable_to: Record<string, unknown> | null;
  source_reference: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  currency?: { code: string; symbol: string } | null;
}

export interface MinimumWageViolation {
  id: string;
  company_id: string;
  employee_id: string;
  position_id: string | null;
  minimum_wage_rate_id: string | null;
  current_hourly_rate: number | null;
  current_monthly_rate: number | null;
  required_hourly_rate: number | null;
  required_monthly_rate: number | null;
  shortfall_amount: number | null;
  shortfall_percentage: number | null;
  status: string;
  exemption_reason: string | null;
  resolution_notes: string | null;
  detected_at: string;
  reviewed_at: string | null;
  resolved_at: string | null;
  pay_period_start: string | null;
  pay_period_end: string | null;
  employee?: { 
    full_name: string; 
    company?: { name: string; country: string } | null;
  } | null;
  position?: { title: string } | null;
  minimum_wage_rate?: MinimumWageRate | null;
}

export interface ComplianceStats {
  totalMonitored: number;
  compliantCount: number;
  violationCount: number;
  pendingReviewCount: number;
  complianceRate: number;
  totalShortfall: number;
}

export function useMinimumWageCompliance(companyId?: string) {
  const [rates, setRates] = useState<MinimumWageRate[]>([]);
  const [violations, setViolations] = useState<MinimumWageViolation[]>([]);
  const [stats, setStats] = useState<ComplianceStats>({
    totalMonitored: 0,
    compliantCount: 0,
    violationCount: 0,
    pendingReviewCount: 0,
    complianceRate: 100,
    totalShortfall: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("minimum_wage_rates")
        .select(`
          *,
          currency:currencies(code, symbol)
        `)
        .eq("is_active", true)
        .order("country", { ascending: true });

      if (fetchError) throw fetchError;
      setRates((data || []) as MinimumWageRate[]);
    } catch (err) {
      console.error("Error fetching minimum wage rates:", err);
      setError("Failed to load minimum wage rates");
    }
  }, []);

  const fetchViolations = useCallback(async () => {
    try {
      let query = supabase
        .from("minimum_wage_violations")
        .select(`
          *,
          employee:profiles(full_name, company:companies(name, country)),
          position:positions(title),
          minimum_wage_rate:minimum_wage_rates(*)
        `)
        .order("detected_at", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      const typedViolations = (data || []) as unknown as MinimumWageViolation[];
      setViolations(typedViolations);

      // Calculate stats
      const activeViolations = typedViolations.filter(v => 
        v.status === "detected" || v.status === "under_review"
      );
      const pendingReview = typedViolations.filter(v => v.status === "under_review");
      const totalShortfall = activeViolations.reduce((sum, v) => 
        sum + (v.shortfall_amount || 0), 0
      );

      // Get total employees monitored
      const { count: employeeCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .eq(companyId ? "company_id" : "is_active", companyId || true);

      const totalMonitored = employeeCount || 0;
      const violationCount = activeViolations.length;
      const compliantCount = totalMonitored - violationCount;
      const complianceRate = totalMonitored > 0 
        ? Math.round((compliantCount / totalMonitored) * 100) 
        : 100;

      setStats({
        totalMonitored,
        compliantCount,
        violationCount,
        pendingReviewCount: pendingReview.length,
        complianceRate,
        totalShortfall,
      });
    } catch (err) {
      console.error("Error fetching violations:", err);
      setError("Failed to load compliance data");
    }
  }, [companyId]);

  const createRate = async (rate: Omit<MinimumWageRate, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error: createError } = await supabase
        .from("minimum_wage_rates")
        .insert(rate)
        .select()
        .single();

      if (createError) throw createError;
      
      toast.success("Minimum wage rate created successfully");
      await fetchRates();
      return data;
    } catch (err) {
      console.error("Error creating rate:", err);
      toast.error("Failed to create minimum wage rate");
      throw err;
    }
  };

  const updateRate = async (id: string, updates: Record<string, unknown>) => {
    try {
      const { error: updateError } = await supabase
        .from("minimum_wage_rates")
        .update(updates)
        .eq("id", id);

      if (updateError) throw updateError;
      
      toast.success("Minimum wage rate updated successfully");
      await fetchRates();
    } catch (err) {
      console.error("Error updating rate:", err);
      toast.error("Failed to update minimum wage rate");
      throw err;
    }
  };

  const deleteRate = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("minimum_wage_rates")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      
      toast.success("Minimum wage rate deleted successfully");
      await fetchRates();
    } catch (err) {
      console.error("Error deleting rate:", err);
      toast.error("Failed to delete minimum wage rate");
      throw err;
    }
  };

  const updateViolationStatus = async (
    id: string, 
    status: MinimumWageViolation["status"],
    notes?: string
  ) => {
    try {
      const updates: Record<string, unknown> = { status };
      
      if (status === "under_review") {
        updates.reviewed_at = new Date().toISOString();
      } else if (status === "resolved" || status === "exempted" || status === "false_positive") {
        updates.resolved_at = new Date().toISOString();
        if (notes) {
          updates.resolution_notes = notes;
        }
      }

      const { error: updateError } = await supabase
        .from("minimum_wage_violations")
        .update(updates)
        .eq("id", id);

      if (updateError) throw updateError;
      
      toast.success("Violation status updated");
      await fetchViolations();
    } catch (err) {
      console.error("Error updating violation:", err);
      toast.error("Failed to update violation status");
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchRates(), fetchViolations()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchRates, fetchViolations]);

  return {
    rates,
    violations,
    stats,
    isLoading,
    error,
    createRate,
    updateRate,
    deleteRate,
    updateViolationStatus,
    refreshData: () => Promise.all([fetchRates(), fetchViolations()]),
  };
}
