import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Statuses that indicate a payroll run is actively being processed
 * and should block other runs for the same pay group
 */
const ACTIVE_PROCESSING_STATUSES = ['calculating', 'processing', 'pending_approval'];

/**
 * Check if any payroll run is currently being processed for the given pay group.
 * This prevents concurrent execution of regular and off-cycle payroll runs.
 */
export async function checkPayrollExecutionLock(
  payGroupId: string, 
  excludeRunId?: string
): Promise<{
  isLocked: boolean;
  lockingRun: {
    id: string;
    run_number: string;
    run_type: string;
    status: string;
  } | null;
}> {
  try {
    let query = supabase
      .from('payroll_runs')
      .select('id, run_number, run_type, status')
      .eq('pay_group_id', payGroupId)
      .in('status', ACTIVE_PROCESSING_STATUSES)
      .limit(1);
    
    // Exclude current run when checking (to allow recalculating same run)
    if (excludeRunId) {
      query = query.neq('id', excludeRunId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error checking payroll execution lock:', error);
      return { isLocked: false, lockingRun: null };
    }
    
    if (data && data.length > 0) {
      return { 
        isLocked: true, 
        lockingRun: data[0] as {
          id: string;
          run_number: string;
          run_type: string;
          status: string;
        }
      };
    }
    
    return { isLocked: false, lockingRun: null };
  } catch (error) {
    console.error('Error checking payroll execution lock:', error);
    return { isLocked: false, lockingRun: null };
  }
}

/**
 * Display a toast message indicating another payroll run is blocking execution
 */
export function showPayrollLockMessage(lockingRun: {
  run_number: string;
  run_type: string;
  status: string;
}) {
  const runTypeLabel = lockingRun.run_type === 'regular' 
    ? 'Regular payroll' 
    : `${formatRunType(lockingRun.run_type)} run`;
    
  toast.error(
    `Cannot proceed: ${runTypeLabel} ${lockingRun.run_number} is currently ${lockingRun.status}. Please wait for it to complete before processing another payroll for this pay group.`,
    { duration: 6000 }
  );
}

function formatRunType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Hook helper to use payroll execution lock checking
 */
export function usePayrollExecutionLock() {
  return {
    checkLock: checkPayrollExecutionLock,
    showLockMessage: showPayrollLockMessage,
  };
}
