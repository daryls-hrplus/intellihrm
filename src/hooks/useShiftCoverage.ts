import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CoverageSnapshot {
  id: string;
  company_id: string;
  snapshot_date: string;
  department_id: string | null;
  shift_id: string | null;
  required_headcount: number;
  scheduled_headcount: number;
  actual_headcount: number | null;
  coverage_percentage: number | null;
  understaffed_hours: number;
  overstaffed_hours: number;
  labor_cost_scheduled: number | null;
  labor_cost_actual: number | null;
  notes: string | null;
  created_at: string;
  department?: { name: string } | null;
  shift?: { name: string; code: string } | null;
}

export interface CostProjection {
  id: string;
  company_id: string;
  projection_date: string;
  shift_id: string | null;
  department_id: string | null;
  regular_hours: number;
  overtime_hours: number;
  premium_hours: number;
  regular_cost: number;
  overtime_cost: number;
  premium_cost: number;
  total_cost: number;
  headcount: number;
  currency: string;
  shift?: { name: string } | null;
  department?: { name: string } | null;
}

export interface DemandForecast {
  id: string;
  company_id: string;
  forecast_date: string;
  department_id: string | null;
  shift_id: string | null;
  predicted_demand: number;
  confidence_level: number | null;
  prediction_factors: Record<string, unknown> | null;
  actual_demand: number | null;
  variance: number | null;
  model_version: string | null;
  shift?: { name: string } | null;
  department?: { name: string } | null;
}

export function useShiftCoverage(companyId: string | null) {
  const [coverageSnapshots, setCoverageSnapshots] = useState<CoverageSnapshot[]>([]);
  const [costProjections, setCostProjections] = useState<CostProjection[]>([]);
  const [demandForecasts, setDemandForecasts] = useState<DemandForecast[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCoverageSnapshots = useCallback(async (startDate?: string, endDate?: string) => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from("shift_coverage_snapshots")
        .select(`
          *,
          department:departments(name),
          shift:shifts(name, code)
        `)
        .eq("company_id", companyId)
        .order("snapshot_date", { ascending: false })
        .limit(100);

      if (startDate) {
        query = query.gte("snapshot_date", startDate);
      }
      if (endDate) {
        query = query.lte("snapshot_date", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCoverageSnapshots(data || []);
    } catch (error) {
      console.error("Error fetching coverage:", error);
      toast.error("Failed to load coverage data");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  const fetchCostProjections = useCallback(async (startDate?: string, endDate?: string) => {
    if (!companyId) return;
    
    try {
      let query = supabase
        .from("shift_cost_projections")
        .select(`
          *,
          shift:shifts(name),
          department:departments(name)
        `)
        .eq("company_id", companyId)
        .order("projection_date", { ascending: false })
        .limit(100);

      if (startDate) {
        query = query.gte("projection_date", startDate);
      }
      if (endDate) {
        query = query.lte("projection_date", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCostProjections(data || []);
    } catch (error) {
      console.error("Error fetching cost projections:", error);
    }
  }, [companyId]);

  const fetchDemandForecasts = useCallback(async (startDate?: string, endDate?: string) => {
    if (!companyId) return;
    
    try {
      let query = supabase
        .from("shift_demand_forecasts")
        .select(`
          *,
          shift:shifts(name),
          department:departments(name)
        `)
        .eq("company_id", companyId)
        .order("forecast_date", { ascending: true })
        .limit(100);

      if (startDate) {
        query = query.gte("forecast_date", startDate);
      }
      if (endDate) {
        query = query.lte("forecast_date", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDemandForecasts(data || []);
    } catch (error) {
      console.error("Error fetching forecasts:", error);
    }
  }, [companyId]);

  useEffect(() => {
    fetchCoverageSnapshots();
    fetchCostProjections();
    fetchDemandForecasts();
  }, [fetchCoverageSnapshots, fetchCostProjections, fetchDemandForecasts]);

  const createCoverageSnapshot = async (data: {
    snapshot_date: string;
    department_id?: string;
    shift_id?: string;
    required_headcount: number;
    scheduled_headcount: number;
    actual_headcount?: number;
    labor_cost_scheduled?: number;
    labor_cost_actual?: number;
    notes?: string;
  }) => {
    if (!companyId) return null;

    try {
      // Calculate coverage percentage
      const coverage_percentage = data.required_headcount > 0
        ? (data.scheduled_headcount / data.required_headcount) * 100
        : 100;

      const understaffed_hours = data.required_headcount > data.scheduled_headcount
        ? (data.required_headcount - data.scheduled_headcount) * 8
        : 0;

      const overstaffed_hours = data.scheduled_headcount > data.required_headcount
        ? (data.scheduled_headcount - data.required_headcount) * 8
        : 0;

      const { data: snapshot, error } = await supabase
        .from("shift_coverage_snapshots")
        .insert({
          company_id: companyId,
          coverage_percentage,
          understaffed_hours,
          overstaffed_hours,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Coverage snapshot created");
      fetchCoverageSnapshots();
      return snapshot;
    } catch (error) {
      console.error("Error creating snapshot:", error);
      toast.error("Failed to create snapshot");
      return null;
    }
  };

  const createCostProjection = async (data: {
    projection_date: string;
    shift_id?: string;
    department_id?: string;
    regular_hours: number;
    overtime_hours: number;
    premium_hours: number;
    regular_cost: number;
    overtime_cost: number;
    premium_cost: number;
    headcount: number;
    currency?: string;
  }) => {
    if (!companyId) return null;

    try {
      const total_cost = data.regular_cost + data.overtime_cost + data.premium_cost;

      const { data: projection, error } = await supabase
        .from("shift_cost_projections")
        .insert({
          company_id: companyId,
          total_cost,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Cost projection created");
      fetchCostProjections();
      return projection;
    } catch (error) {
      console.error("Error creating projection:", error);
      toast.error("Failed to create projection");
      return null;
    }
  };

  const createDemandForecast = async (data: {
    forecast_date: string;
    department_id?: string;
    shift_id?: string;
    predicted_demand: number;
    confidence_level?: number;
    prediction_factors?: Record<string, unknown>;
    model_version?: string;
  }) => {
    if (!companyId) return null;

    try {
      const { data: forecast, error } = await supabase
        .from("shift_demand_forecasts")
        .insert({
          company_id: companyId,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      fetchDemandForecasts();
      return forecast;
    } catch (error) {
      console.error("Error creating forecast:", error);
      toast.error("Failed to create forecast");
      return null;
    }
  };

  // Calculate coverage metrics
  const getCoverageMetrics = () => {
    if (coverageSnapshots.length === 0) {
      return {
        avgCoverage: 0,
        understaffedDays: 0,
        overstaffedDays: 0,
        totalUnderstaffedHours: 0,
        totalOverstaffedHours: 0,
      };
    }

    const avgCoverage = coverageSnapshots.reduce((sum, s) => sum + (s.coverage_percentage || 0), 0) / coverageSnapshots.length;
    const understaffedDays = coverageSnapshots.filter(s => (s.coverage_percentage || 0) < 100).length;
    const overstaffedDays = coverageSnapshots.filter(s => (s.coverage_percentage || 0) > 110).length;
    const totalUnderstaffedHours = coverageSnapshots.reduce((sum, s) => sum + s.understaffed_hours, 0);
    const totalOverstaffedHours = coverageSnapshots.reduce((sum, s) => sum + s.overstaffed_hours, 0);

    return {
      avgCoverage,
      understaffedDays,
      overstaffedDays,
      totalUnderstaffedHours,
      totalOverstaffedHours,
    };
  };

  // Calculate cost metrics
  const getCostMetrics = () => {
    if (costProjections.length === 0) {
      return {
        totalProjectedCost: 0,
        avgDailyCost: 0,
        totalRegularHours: 0,
        totalOvertimeHours: 0,
        totalPremiumHours: 0,
        overtimePercentage: 0,
      };
    }

    const totalProjectedCost = costProjections.reduce((sum, p) => sum + p.total_cost, 0);
    const avgDailyCost = totalProjectedCost / costProjections.length;
    const totalRegularHours = costProjections.reduce((sum, p) => sum + p.regular_hours, 0);
    const totalOvertimeHours = costProjections.reduce((sum, p) => sum + p.overtime_hours, 0);
    const totalPremiumHours = costProjections.reduce((sum, p) => sum + p.premium_hours, 0);
    const totalHours = totalRegularHours + totalOvertimeHours + totalPremiumHours;
    const overtimePercentage = totalHours > 0 ? (totalOvertimeHours / totalHours) * 100 : 0;

    return {
      totalProjectedCost,
      avgDailyCost,
      totalRegularHours,
      totalOvertimeHours,
      totalPremiumHours,
      overtimePercentage,
    };
  };

  return {
    coverageSnapshots,
    costProjections,
    demandForecasts,
    isLoading,
    fetchCoverageSnapshots,
    fetchCostProjections,
    fetchDemandForecasts,
    createCoverageSnapshot,
    createCostProjection,
    createDemandForecast,
    getCoverageMetrics,
    getCostMetrics,
  };
}
