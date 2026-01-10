import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SeatBudgetEnriched {
  budget_item_id: string;
  scenario_id: string;
  position_id: string;
  seat_id: string | null;
  position_title: string;
  base_salary: number;
  total_compensation: number;
  fully_loaded_cost: number;
  annual_cost: number;
  budgeted_fte: number;
  budgeted_headcount: number;
  scenario_name: string;
  scenario_type: string;
  plan_name: string;
  fiscal_year: number;
  company_id: string;
  position_title_canonical: string;
  position_code: string;
  seat_code: string | null;
  seat_status: string | null;
  seat_budget: number | null;
  seat_currency: string | null;
  budget_funding_source: string | null;
  budget_cost_center_code: string | null;
  is_shared_seat: boolean;
  max_occupants: number;
  current_occupant_count: number;
  actual_fte_allocated: number;
  actual_budget_percentage_allocated: number;
  fte_variance: number | null;
  budget_variance: number | null;
}

export function useSeatBudgetReconciliation(scenarioId: string | null) {
  return useQuery({
    queryKey: ['seat-budget-reconciliation-view', scenarioId],
    queryFn: async () => {
      if (!scenarioId) return [];
      
      const { data, error } = await supabase
        .from('position_budget_seat_reconciliation')
        .select('*')
        .eq('scenario_id', scenarioId);
      
      if (error) throw error;
      return data as SeatBudgetEnriched[];
    },
    enabled: !!scenarioId,
  });
}

export function useSeatBudgetSummary(scenarioId: string | null) {
  return useQuery({
    queryKey: ['seat-budget-summary', scenarioId],
    queryFn: async () => {
      if (!scenarioId) return null;
      
      const { data, error } = await supabase
        .from('position_budget_seat_summary')
        .select('*')
        .eq('scenario_id', scenarioId);
      
      if (error) throw error;
      
      // Aggregate summary
      const summary = {
        totalBudgetedCost: data?.reduce((sum, r) => sum + (r.total_annual_cost || 0), 0) || 0,
        totalSeatBudget: data?.reduce((sum, r) => sum + (r.actual_seat_budget_allocation || 0), 0) || 0,
        totalBudgetedHeadcount: data?.reduce((sum, r) => sum + (r.total_budgeted_headcount || 0), 0) || 0,
        totalActualSeats: data?.reduce((sum, r) => sum + (r.actual_total_seats || 0), 0) || 0,
        totalFilledSeats: data?.reduce((sum, r) => sum + (r.actual_filled_seats || 0), 0) || 0,
        totalVacantSeats: data?.reduce((sum, r) => sum + (r.actual_vacant_seats || 0), 0) || 0,
        positionsWithVariance: data?.filter(r => 
          Math.abs(r.headcount_variance || 0) > 0 || 
          Math.abs(r.budget_variance || 0) > 1000
        ).length || 0,
        seatLinkageRate: (() => {
          const totalItems = data?.reduce((sum, r) => sum + (r.budget_line_items || 0), 0) || 0;
          const linkedItems = data?.reduce((sum, r) => sum + (r.seat_linked_items || 0), 0) || 0;
          return totalItems > 0 ? (linkedItems / totalItems) * 100 : 0;
        })(),
        byPosition: data || [],
      };
      
      return summary;
    },
    enabled: !!scenarioId,
  });
}

export function usePopulateBudgetFromSeats() {
  const populateFromSeats = async (scenarioId: string, positionIds?: string[]) => {
    const { data, error } = await supabase.rpc('populate_budget_from_seats', {
      p_scenario_id: scenarioId,
      p_position_ids: positionIds || null,
    });
    
    if (error) throw error;
    return data as number;
  };

  return { populateFromSeats };
}

// Get available seats for linking to budget items
export function useAvailableSeatsForBudget(companyId: string | null, positionId: string | null) {
  return useQuery({
    queryKey: ['available-seats-for-budget', companyId, positionId],
    queryFn: async () => {
      if (!companyId) return [];
      
      let query = supabase
        .from('position_seats')
        .select(`
          id,
          seat_code,
          status,
          budget_allocation_amount,
          budget_allocation_currency,
          budget_funding_source,
          budget_cost_center_code,
          is_shared_seat,
          max_occupants,
          position:positions!inner(
            id,
            title,
            code,
            company_id
          )
        `)
        .eq('positions.company_id', companyId)
        .not('status', 'in', '("ELIMINATED","PLANNED")');
      
      if (positionId) {
        query = query.eq('position_id', positionId);
      }
      
      const { data, error } = await query.order('seat_code');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });
}
