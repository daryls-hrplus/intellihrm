import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Users, Calendar, ShieldAlert } from "lucide-react";
import { useLeaveBlackouts, useLeaveConflictRules } from "@/hooks/useLeaveEnhancements";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface LeaveConflictWarningProps {
  startDate: string;
  endDate: string;
  leaveTypeId?: string;
  departmentId?: string;
}

interface ConflictCheck {
  type: 'blackout' | 'team_coverage';
  severity: 'warning' | 'error';
  title: string;
  message: string;
  details?: string;
}

export function LeaveConflictWarning({ startDate, endDate, leaveTypeId, departmentId }: LeaveConflictWarningProps) {
  const { company } = useAuth();
  const { checkBlackoutConflict, blackoutPeriods } = useLeaveBlackouts(company?.id);
  const { conflictRules } = useLeaveConflictRules(company?.id);
  const [conflicts, setConflicts] = useState<ConflictCheck[]>([]);
  const [teamOnLeave, setTeamOnLeave] = useState<number>(0);
  const [teamSize, setTeamSize] = useState<number>(0);

  useEffect(() => {
    if (!startDate || !endDate) {
      setConflicts([]);
      return;
    }

    const checkConflicts = async () => {
      const newConflicts: ConflictCheck[] = [];

      // Check blackout periods
      const blackouts = checkBlackoutConflict(startDate, endDate, leaveTypeId);
      blackouts.forEach(bp => {
        newConflicts.push({
          type: 'blackout',
          severity: bp.is_hard_block ? 'error' : 'warning',
          title: bp.is_hard_block ? 'Blackout Period' : 'Restricted Period',
          message: bp.name,
          details: `${formatDateForDisplay(bp.start_date)} - ${formatDateForDisplay(bp.end_date)}${bp.description ? `: ${bp.description}` : ''}`,
        });
      });

      // Check team coverage if department is known
      if (departmentId) {
        try {
          // Get team members in the department
          const { data: positions } = await supabase
            .from('positions')
            .select('id')
            .eq('department_id', departmentId);
          
          if (positions && positions.length > 0) {
            const { data: teamMembers } = await supabase
              .from('employee_positions')
              .select('employee_id')
              .in('position_id', positions.map(p => p.id))
              .eq('is_active', true);
            
            const teamMemberCount = teamMembers?.length || 0;
            setTeamSize(teamMemberCount);

            // Check who else is on leave during this period
            if (teamMembers && teamMembers.length > 0) {
              const { data: overlappingLeave } = await supabase
                .from('leave_requests')
                .select('employee_id')
                .in('employee_id', teamMembers.map(m => m.employee_id))
                .eq('status', 'approved')
                .lte('start_date', endDate)
                .gte('end_date', startDate);
              
              const onLeaveCount = new Set(overlappingLeave?.map(l => l.employee_id)).size;
              setTeamOnLeave(onLeaveCount);

              // Check conflict rules
              const applicableRules = conflictRules.filter(rule => 
                rule.is_active && (!rule.department_id || rule.department_id === departmentId)
              );

              applicableRules.forEach(rule => {
                const coveragePercentage = ((onLeaveCount + 1) / teamMemberCount) * 100;
                
                if (rule.rule_type === 'percentage') {
                  if (coveragePercentage >= (rule.block_threshold_percentage || 30)) {
                    newConflicts.push({
                      type: 'team_coverage',
                      severity: rule.is_warning_only ? 'warning' : 'error',
                      title: 'Team Coverage Alert',
                      message: `${Math.round(coveragePercentage)}% of team would be on leave`,
                      details: `${onLeaveCount + 1} of ${teamMemberCount} team members`,
                    });
                  } else if (coveragePercentage >= (rule.warning_threshold_percentage || 20)) {
                    newConflicts.push({
                      type: 'team_coverage',
                      severity: 'warning',
                      title: 'Coverage Warning',
                      message: `${Math.round(coveragePercentage)}% of team would be on leave`,
                      details: `${onLeaveCount + 1} of ${teamMemberCount} team members`,
                    });
                  }
                } else if (rule.rule_type === 'absolute') {
                  if (rule.max_concurrent_count && (onLeaveCount + 1) > rule.max_concurrent_count) {
                    newConflicts.push({
                      type: 'team_coverage',
                      severity: rule.is_warning_only ? 'warning' : 'error',
                      title: 'Maximum Concurrent Leave Exceeded',
                      message: `Only ${rule.max_concurrent_count} team members can be on leave at once`,
                      details: `${onLeaveCount} already on leave during this period`,
                    });
                  }
                }
              });
            }
          }
        } catch (error) {
          console.error('Error checking team coverage:', error);
        }
      }

      setConflicts(newConflicts);
    };

    checkConflicts();
  }, [startDate, endDate, leaveTypeId, departmentId, checkBlackoutConflict, conflictRules]);

  if (conflicts.length === 0) return null;

  return (
    <div className="space-y-2">
      {conflicts.map((conflict, index) => (
        <Alert 
          key={index} 
          variant={conflict.severity === 'error' ? 'destructive' : 'default'}
          className={conflict.severity === 'warning' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : ''}
        >
          {conflict.type === 'blackout' ? (
            <ShieldAlert className="h-4 w-4" />
          ) : (
            <Users className="h-4 w-4" />
          )}
          <AlertTitle className="flex items-center gap-2">
            {conflict.title}
            <Badge variant={conflict.severity === 'error' ? 'destructive' : 'outline'} className="text-xs">
              {conflict.severity === 'error' ? 'Blocked' : 'Warning'}
            </Badge>
          </AlertTitle>
          <AlertDescription>
            <p>{conflict.message}</p>
            {conflict.details && (
              <p className="text-xs mt-1 opacity-80">{conflict.details}</p>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
