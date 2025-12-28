import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface TimeClockEntry {
  id: string;
  employee_id: string;
  clock_in: string;
  clock_out: string | null;
  status: string;
  total_hours: number | null;
  employee?: {
    id: string;
    full_name: string;
    employee_id: string;
  };
}

interface TimesheetEntry {
  id: string;
  employee_id: string;
  work_date: string;
  hours_worked: number;
  project_id: string | null;
  task_description: string | null;
  status: string;
  employee?: {
    id: string;
    full_name: string;
    employee_id: string;
  };
}

interface OvertimeRequest {
  id: string;
  employee_id: string;
  request_date: string;
  requested_hours: number;
  approved_hours: number | null;
  status: string;
  overtime_type: string | null;
  employee?: {
    id: string;
    full_name: string;
    employee_id: string;
  };
}

interface SyncSummary {
  employeeId: string;
  employeeName: string;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  sourceCount: number;
  sources: string[];
}

interface SyncOptions {
  includeTimeClock: boolean;
  includeTimesheets: boolean;
  includeOvertimeRequests: boolean;
  overtimeThresholdPerDay: number;
  overtimeThresholdPerWeek: number;
  roundingRule: 'none' | 'nearest_15' | 'nearest_30' | 'up_15' | 'up_30';
}

interface SyncResult {
  success: boolean;
  syncLogId: string;
  employeesProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  summary: SyncSummary[];
}

export function useTimeClockPayrollSync() {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch pending time clock entries for a pay period
  const fetchPendingTimeClockEntries = useCallback(async (
    companyId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<TimeClockEntry[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("time_clock_entries")
        .select(`
          id,
          employee_id,
          clock_in,
          clock_out,
          status,
          total_hours,
          employee:profiles!time_clock_entries_employee_id_fkey(id, full_name)
        `)
        .eq("company_id", companyId)
        .gte("clock_in", periodStart)
        .lte("clock_in", periodEnd + "T23:59:59")
        .eq("status", "approved")
        .not("clock_out", "is", null);

      if (error) throw error;

      // Check which entries have already been synced
      const entryIds = (data || []).map((e: any) => e.id);
      const { data: existingRecords } = await supabase
        .from("employee_work_records")
        .select("time_clock_entry_id")
        .in("time_clock_entry_id", entryIds.length > 0 ? entryIds : ['__none__']);

      const syncedIds = new Set((existingRecords || []).map(r => r.time_clock_entry_id));
      
      return (data || []).filter((entry: any) => !syncedIds.has(entry.id)).map((e: any) => ({
        ...e,
        employee: e.employee ? { ...e.employee, employee_id: '' } : undefined
      })) as TimeClockEntry[];
    } catch (error) {
      console.error("Failed to fetch time clock entries:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch approved timesheets for a pay period
  const fetchApprovedTimesheets = useCallback(async (
    companyId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<TimesheetEntry[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("timesheet_entries")
        .select(`
          id,
          employee_id,
          entry_date,
          hours_worked,
          project_id,
          description,
          status,
          employee:profiles!timesheet_entries_employee_id_fkey(id, full_name)
        `)
        .eq("company_id", companyId)
        .gte("entry_date", periodStart)
        .lte("entry_date", periodEnd)
        .eq("status", "approved");

      if (error) throw error;

      // Check which entries have already been synced
      const entryIds = (data || []).map((e: any) => e.id);
      const { data: existingRecords } = await supabase
        .from("employee_work_records")
        .select("timesheet_entry_id")
        .in("timesheet_entry_id", entryIds.length > 0 ? entryIds : ['__none__']);

      const syncedIds = new Set((existingRecords || []).map(r => r.timesheet_entry_id));
      
      return (data || []).filter((entry: any) => !syncedIds.has(entry.id)).map((e: any) => ({
        id: e.id,
        employee_id: e.employee_id,
        work_date: e.entry_date,
        hours_worked: e.hours_worked,
        project_id: e.project_id,
        task_description: e.description,
        status: e.status,
        employee: e.employee ? { ...e.employee, employee_id: '' } : undefined
      })) as TimesheetEntry[];
    } catch (error) {
      console.error("Failed to fetch timesheet entries:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch approved overtime requests for a pay period
  const fetchApprovedOvertimeRequests = useCallback(async (
    companyId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<OvertimeRequest[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("overtime_requests")
        .select(`
          id,
          employee_id,
          overtime_date,
          hours_requested,
          hours_approved,
          status,
          overtime_type,
          employee:profiles!overtime_requests_employee_id_fkey(id, full_name)
        `)
        .eq("company_id", companyId)
        .gte("overtime_date", periodStart)
        .lte("overtime_date", periodEnd)
        .eq("status", "approved");

      if (error) throw error;

      // Check which entries have already been synced
      const entryIds = (data || []).map((e: any) => e.id);
      const { data: existingRecords } = await supabase
        .from("employee_work_records")
        .select("overtime_request_id")
        .in("overtime_request_id", entryIds.length > 0 ? entryIds : ['__none__']);

      const syncedIds = new Set((existingRecords || []).map(r => r.overtime_request_id));
      
      return (data || []).filter((entry: any) => !syncedIds.has(entry.id)).map((e: any) => ({
        id: e.id,
        employee_id: e.employee_id,
        request_date: e.overtime_date,
        requested_hours: e.hours_requested,
        approved_hours: e.hours_approved,
        status: e.status,
        overtime_type: e.overtime_type,
        employee: e.employee ? { ...e.employee, employee_id: '' } : undefined
      })) as OvertimeRequest[];
    } catch (error) {
      console.error("Failed to fetch overtime requests:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply rounding rules to hours
  const applyRounding = (hours: number, rule: SyncOptions['roundingRule']): number => {
    if (rule === 'none') return hours;
    
    const minutes = hours * 60;
    let roundedMinutes: number;
    
    switch (rule) {
      case 'nearest_15':
        roundedMinutes = Math.round(minutes / 15) * 15;
        break;
      case 'nearest_30':
        roundedMinutes = Math.round(minutes / 30) * 30;
        break;
      case 'up_15':
        roundedMinutes = Math.ceil(minutes / 15) * 15;
        break;
      case 'up_30':
        roundedMinutes = Math.ceil(minutes / 30) * 30;
        break;
      default:
        roundedMinutes = minutes;
    }
    
    return roundedMinutes / 60;
  };

  // Calculate hours from time clock entry
  const calculateHoursFromTimeClock = (clockIn: string, clockOut: string): number => {
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60); // Convert ms to hours
  };

  // Preview sync results before actually syncing
  const previewSync = useCallback(async (
    companyId: string,
    payPeriodId: string,
    periodStart: string,
    periodEnd: string,
    options: SyncOptions
  ): Promise<SyncSummary[]> => {
    setIsLoading(true);
    try {
      const summaryMap = new Map<string, SyncSummary>();

      // Fetch data based on options
      if (options.includeTimeClock) {
        const timeClockEntries = await fetchPendingTimeClockEntries(companyId, periodStart, periodEnd);
        
        for (const entry of timeClockEntries) {
          if (!entry.clock_out) continue;
          
          const employeeId = entry.employee_id;
          const employeeName = entry.employee?.full_name || 'Unknown';
          
          let hours = entry.total_hours || calculateHoursFromTimeClock(entry.clock_in, entry.clock_out);
          hours = applyRounding(hours, options.roundingRule);
          
          // Simple overtime check: hours over 8 per day are overtime
          const regularHours = Math.min(hours, options.overtimeThresholdPerDay);
          const overtimeHours = Math.max(0, hours - options.overtimeThresholdPerDay);
          
          const existing = summaryMap.get(employeeId) || {
            employeeId,
            employeeName,
            regularHours: 0,
            overtimeHours: 0,
            totalHours: 0,
            sourceCount: 0,
            sources: []
          };
          
          existing.regularHours += regularHours;
          existing.overtimeHours += overtimeHours;
          existing.totalHours += hours;
          existing.sourceCount++;
          if (!existing.sources.includes('Time Clock')) {
            existing.sources.push('Time Clock');
          }
          
          summaryMap.set(employeeId, existing);
        }
      }

      if (options.includeTimesheets) {
        const timesheetEntries = await fetchApprovedTimesheets(companyId, periodStart, periodEnd);
        
        for (const entry of timesheetEntries) {
          const employeeId = entry.employee_id;
          const employeeName = entry.employee?.full_name || 'Unknown';
          
          let hours = applyRounding(entry.hours_worked, options.roundingRule);
          
          const regularHours = Math.min(hours, options.overtimeThresholdPerDay);
          const overtimeHours = Math.max(0, hours - options.overtimeThresholdPerDay);
          
          const existing = summaryMap.get(employeeId) || {
            employeeId,
            employeeName,
            regularHours: 0,
            overtimeHours: 0,
            totalHours: 0,
            sourceCount: 0,
            sources: []
          };
          
          existing.regularHours += regularHours;
          existing.overtimeHours += overtimeHours;
          existing.totalHours += hours;
          existing.sourceCount++;
          if (!existing.sources.includes('Timesheet')) {
            existing.sources.push('Timesheet');
          }
          
          summaryMap.set(employeeId, existing);
        }
      }

      if (options.includeOvertimeRequests) {
        const overtimeRequests = await fetchApprovedOvertimeRequests(companyId, periodStart, periodEnd);
        
        for (const request of overtimeRequests) {
          const employeeId = request.employee_id;
          const employeeName = request.employee?.full_name || 'Unknown';
          
          const hours = request.approved_hours || request.requested_hours;
          
          const existing = summaryMap.get(employeeId) || {
            employeeId,
            employeeName,
            regularHours: 0,
            overtimeHours: 0,
            totalHours: 0,
            sourceCount: 0,
            sources: []
          };
          
          // Overtime requests are all overtime
          existing.overtimeHours += hours;
          existing.totalHours += hours;
          existing.sourceCount++;
          if (!existing.sources.includes('Overtime Request')) {
            existing.sources.push('Overtime Request');
          }
          
          summaryMap.set(employeeId, existing);
        }
      }

      return Array.from(summaryMap.values());
    } catch (error) {
      console.error("Failed to preview sync:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [fetchPendingTimeClockEntries, fetchApprovedTimesheets, fetchApprovedOvertimeRequests]);

  // Execute the sync
  const executeSync = useCallback(async (
    companyId: string,
    payPeriodId: string,
    periodStart: string,
    periodEnd: string,
    options: SyncOptions
  ): Promise<SyncResult | null> => {
    setIsSyncing(true);
    
    try {
      // Create sync log
      const syncOptionsJson = JSON.parse(JSON.stringify(options));
      const { data: syncLog, error: logError } = await supabase
        .from("payroll_time_sync_logs")
        .insert([{
          company_id: companyId,
          pay_period_id: payPeriodId,
          sync_type: 'full' as const,
          status: 'processing' as const,
          created_by: profile?.id,
          sync_options: syncOptionsJson
        }])
        .select()
        .single();

      if (logError) throw logError;

      let recordsCreated = 0;
      let recordsUpdated = 0;
      let totalRegularHours = 0;
      let totalOvertimeHours = 0;
      const processedEmployees = new Set<string>();
      const summary: SyncSummary[] = [];

      // Process time clock entries
      if (options.includeTimeClock) {
        const timeClockEntries = await fetchPendingTimeClockEntries(companyId, periodStart, periodEnd);
        
        for (const entry of timeClockEntries) {
          if (!entry.clock_out) continue;
          
          let hours = entry.total_hours || calculateHoursFromTimeClock(entry.clock_in, entry.clock_out);
          hours = applyRounding(hours, options.roundingRule);
          
          const regularHours = Math.min(hours, options.overtimeThresholdPerDay);
          const overtimeHours = Math.max(0, hours - options.overtimeThresholdPerDay);
          
          const workDate = entry.clock_in.split('T')[0];
          
          // Get employee's active position
          const { data: position } = await supabase
            .from("employee_positions")
            .select("id, position_id")
            .eq("employee_id", entry.employee_id)
            .eq("is_primary", true)
            .eq("is_active", true)
            .single();

          const { error: insertError } = await supabase
            .from("employee_work_records")
            .insert([{
              company_id: companyId,
              employee_id: entry.employee_id,
              employee_position_id: position?.id,
              work_date: workDate,
              regular_hours: regularHours,
              overtime_hours: overtimeHours,
              time_clock_entry_id: entry.id,
              source_type: 'time_clock' as const,
              day_type: 'regular' as const,
              notes: `Imported from time clock entry ${entry.id}`
            }]);

          if (!insertError) {
            recordsCreated++;
            totalRegularHours += regularHours;
            totalOvertimeHours += overtimeHours;
            processedEmployees.add(entry.employee_id);
          }
        }
      }

      // Process timesheet entries
      if (options.includeTimesheets) {
        const timesheetEntries = await fetchApprovedTimesheets(companyId, periodStart, periodEnd);
        
        for (const entry of timesheetEntries) {
          let hours = applyRounding(entry.hours_worked, options.roundingRule);
          
          const regularHours = Math.min(hours, options.overtimeThresholdPerDay);
          const overtimeHours = Math.max(0, hours - options.overtimeThresholdPerDay);
          
          // Get employee's active position
          const { data: position } = await supabase
            .from("employee_positions")
            .select("id, position_id")
            .eq("employee_id", entry.employee_id)
            .eq("is_primary", true)
            .eq("is_active", true)
            .single();

          const { error: insertError } = await supabase
            .from("employee_work_records")
            .insert([{
              company_id: companyId,
              employee_id: entry.employee_id,
              employee_position_id: position?.id,
              work_date: entry.work_date,
              regular_hours: regularHours,
              overtime_hours: overtimeHours,
              timesheet_entry_id: entry.id,
              source_type: 'timesheet' as const,
              day_type: 'regular' as const,
              notes: entry.task_description || `Imported from timesheet entry ${entry.id}`
            }]);

          if (!insertError) {
            recordsCreated++;
            totalRegularHours += regularHours;
            totalOvertimeHours += overtimeHours;
            processedEmployees.add(entry.employee_id);
          }
        }
      }

      // Process overtime requests
      if (options.includeOvertimeRequests) {
        const overtimeRequests = await fetchApprovedOvertimeRequests(companyId, periodStart, periodEnd);
        
        for (const request of overtimeRequests) {
          const hours = request.approved_hours || request.requested_hours;
          
          // Get employee's active position
          const { data: position } = await supabase
            .from("employee_positions")
            .select("id, position_id")
            .eq("employee_id", request.employee_id)
            .eq("is_primary", true)
            .eq("is_active", true)
            .single();

          const { error: insertError } = await supabase
            .from("employee_work_records")
            .insert([{
              company_id: companyId,
              employee_id: request.employee_id,
              employee_position_id: position?.id,
              work_date: request.request_date,
              regular_hours: 0,
              overtime_hours: hours,
              overtime_request_id: request.id,
              source_type: 'overtime_request' as const,
              day_type: 'regular' as const,
              notes: `Imported from approved overtime request - ${request.overtime_type || 'standard'}`
            }]);

          if (!insertError) {
            recordsCreated++;
            totalOvertimeHours += hours;
            processedEmployees.add(request.employee_id);
          }
        }
      }

      // Update sync log with results
      await supabase
        .from("payroll_time_sync_logs")
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          employees_processed: processedEmployees.size,
          records_created: recordsCreated,
          records_updated: recordsUpdated,
          total_regular_hours: totalRegularHours,
          total_overtime_hours: totalOvertimeHours
        })
        .eq("id", syncLog.id);

      toast.success(`Successfully synced ${recordsCreated} time records for ${processedEmployees.size} employees`);

      return {
        success: true,
        syncLogId: syncLog.id,
        employeesProcessed: processedEmployees.size,
        recordsCreated,
        recordsUpdated,
        totalRegularHours,
        totalOvertimeHours,
        summary
      };
    } catch (error) {
      console.error("Failed to execute sync:", error);
      toast.error("Failed to sync time data to payroll");
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [profile?.id, fetchPendingTimeClockEntries, fetchApprovedTimesheets, fetchApprovedOvertimeRequests]);

  // Fetch sync history
  const fetchSyncHistory = useCallback(async (
    companyId: string,
    limit: number = 10
  ) => {
    try {
      const { data, error } = await supabase
        .from("payroll_time_sync_logs")
        .select(`
          *,
          pay_period:pay_periods(period_number, period_start, period_end),
          created_by_user:profiles!payroll_time_sync_logs_created_by_fkey(full_name)
        `)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to fetch sync history:", error);
      return [];
    }
  }, []);

  // Reverse a sync operation
  const reverseSync = useCallback(async (syncLogId: string) => {
    try {
      // Get the sync log
      const { data: syncLog, error: logError } = await supabase
        .from("payroll_time_sync_logs")
        .select("*")
        .eq("id", syncLogId)
        .single();

      if (logError) throw logError;
      if (syncLog.status === 'reversed') {
        toast.error("This sync has already been reversed");
        return false;
      }

      // Delete work records created by this sync
      const { error: deleteError } = await supabase
        .from("employee_work_records")
        .delete()
        .or(`time_clock_entry_id.not.is.null,timesheet_entry_id.not.is.null,overtime_request_id.not.is.null`)
        .gte("created_at", syncLog.started_at)
        .lte("created_at", syncLog.completed_at || new Date().toISOString());

      if (deleteError) throw deleteError;

      // Update sync log
      await supabase
        .from("payroll_time_sync_logs")
        .update({
          status: 'reversed',
          reversed_at: new Date().toISOString(),
          reversed_by: profile?.id
        })
        .eq("id", syncLogId);

      toast.success("Sync reversed successfully");
      return true;
    } catch (error) {
      console.error("Failed to reverse sync:", error);
      toast.error("Failed to reverse sync");
      return false;
    }
  }, [profile?.id]);

  return {
    isLoading,
    isSyncing,
    fetchPendingTimeClockEntries,
    fetchApprovedTimesheets,
    fetchApprovedOvertimeRequests,
    previewSync,
    executeSync,
    fetchSyncHistory,
    reverseSync
  };
}
