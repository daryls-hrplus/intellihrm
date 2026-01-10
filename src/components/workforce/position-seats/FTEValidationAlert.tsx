import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users } from 'lucide-react';
import type { EmployeeFTESummary } from './types';

interface FTEValidationAlertProps {
  overAllocatedEmployees: EmployeeFTESummary[];
  onViewEmployee?: (employeeId: string) => void;
}

export function FTEValidationAlert({ overAllocatedEmployees, onViewEmployee }: FTEValidationAlertProps) {
  if (overAllocatedEmployees.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        FTE Over-Allocation Warning
        <Badge variant="destructive">{overAllocatedEmployees.length}</Badge>
      </AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          The following employees have total FTE allocations exceeding 100%:
        </p>
        <div className="space-y-1">
          {overAllocatedEmployees.slice(0, 5).map((emp) => (
            <div 
              key={emp.employee_id}
              className="flex items-center justify-between p-2 bg-destructive/10 rounded cursor-pointer hover:bg-destructive/20"
              onClick={() => onViewEmployee?.(emp.employee_id)}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">{emp.full_name}</span>
                <span className="text-sm text-muted-foreground">
                  ({emp.active_seat_count} positions)
                </span>
              </div>
              <Badge variant="destructive">
                {emp.total_fte_percentage}% FTE
              </Badge>
            </div>
          ))}
          {overAllocatedEmployees.length > 5 && (
            <p className="text-sm text-muted-foreground mt-2">
              +{overAllocatedEmployees.length - 5} more employees
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}