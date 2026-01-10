import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowRightLeft, Calendar, AlertTriangle, Clock, Building2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSecondmentTracking } from './hooks/useMultiOccupancy';

export function SecondmentTrackingPanel() {
  const { secondments, overdueSecondments, endingSoonSecondments, isLoading } = useSecondmentTracking();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  if (secondments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowRightLeft className="h-5 w-5" />
            Secondment Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No active secondments found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowRightLeft className="h-5 w-5" />
              Secondment Tracking
            </CardTitle>
            <CardDescription>
              {secondments.length} active secondment{secondments.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {overdueSecondments.length > 0 && (
              <Badge variant="destructive">{overdueSecondments.length} Overdue</Badge>
            )}
            {endingSoonSecondments.length > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {endingSoonSecondments.length} Ending Soon
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alerts */}
        {overdueSecondments.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Overdue Secondments</AlertTitle>
            <AlertDescription>
              {overdueSecondments.length} secondment{overdueSecondments.length !== 1 ? 's have' : ' has'} passed the expected return date.
            </AlertDescription>
          </Alert>
        )}

        {/* Secondment List */}
        <div className="space-y-3">
          {secondments.map((sec) => {
            const daysRemaining = sec.secondment_return_date 
              ? differenceInDays(new Date(sec.secondment_return_date), new Date())
              : null;

            return (
              <div 
                key={sec.current_seat_id}
                className={cn(
                  "p-4 rounded-lg border",
                  sec.secondment_status === 'OVERDUE' && "border-destructive/50 bg-destructive/5",
                  sec.secondment_status === 'ENDING_SOON' && "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{sec.employee_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {sec.fte_percentage}% FTE
                    </p>
                  </div>
                  <Badge 
                    variant={sec.secondment_status === 'OVERDUE' ? 'destructive' : 
                             sec.secondment_status === 'ENDING_SOON' ? 'secondary' : 'outline'}
                    className={cn(
                      sec.secondment_status === 'ENDING_SOON' && "bg-amber-100 text-amber-800"
                    )}
                  >
                    {sec.secondment_status === 'OVERDUE' && 'Overdue'}
                    {sec.secondment_status === 'ENDING_SOON' && `${daysRemaining} days left`}
                    {sec.secondment_status === 'ACTIVE' && 'Active'}
                  </Badge>
                </div>

                {/* Flow visualization */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{sec.origin_department_name}</span>
                  </div>
                  <ArrowRightLeft className="h-4 w-4 text-cyan-500" />
                  <div className="flex items-center gap-1 font-medium">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{sec.current_department_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">From:</span>
                    <span>{sec.origin_position_title}</span>
                    <Badge variant="outline" className="text-xs ml-1">{sec.origin_seat_code}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">To:</span>
                    <span>{sec.current_position_title}</span>
                    <Badge variant="outline" className="text-xs ml-1">{sec.current_seat_code}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Started: {format(new Date(sec.secondment_start_date), 'MMM d, yyyy')}
                  </div>
                  {sec.secondment_return_date && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Return: {format(new Date(sec.secondment_return_date), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}