import { supabase } from "@/integrations/supabase/client";

interface OverlapCheckOptions {
  table: 'appraisal_cycles' | 'goal_cycles' | 'review_cycles';
  companyId: string;
  cycleType: string;
  startDate: string;
  endDate: string;
  excludeId?: string;
}

interface OverlappingCycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  cycle_type: string;
}

interface OverlapResult {
  hasOverlap: boolean;
  overlappingCycles: OverlappingCycle[];
}

export async function checkCycleOverlap(options: OverlapCheckOptions): Promise<OverlapResult> {
  const { table, companyId, cycleType, startDate, endDate, excludeId } = options;

  if (!companyId || !cycleType || !startDate || !endDate) {
    return { hasOverlap: false, overlappingCycles: [] };
  }

  // Determine which status values to exclude based on table
  const excludedStatuses = table === 'goal_cycles' 
    ? ['closed', 'cancelled'] 
    : ['cancelled', 'completed'];

  let query = supabase
    .from(table)
    .select('id, name, start_date, end_date, cycle_type')
    .eq('company_id', companyId)
    .eq('cycle_type', cycleType)
    .not('status', 'in', `(${excludedStatuses.join(',')})`)
    // Check for date range overlap: new range overlaps if it starts before existing ends AND ends after existing starts
    .lte('start_date', endDate)
    .gte('end_date', startDate);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error checking cycle overlap:', error);
    return { hasOverlap: false, overlappingCycles: [] };
  }

  return {
    hasOverlap: (data?.length ?? 0) > 0,
    overlappingCycles: data ?? []
  };
}
