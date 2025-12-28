import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, Clock, Calendar, Phone, Mail } from "lucide-react";
import { ResumptionOfDuty } from "@/hooks/useResumptionOfDuty";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface RODOverdueAlertsProps {
  overdueRods: ResumptionOfDuty[];
  title?: string;
}

export function RODOverdueAlerts({ overdueRods, title = "Overdue Resumptions" }: RODOverdueAlertsProps) {
  if (overdueRods.length === 0) return null;

  const getDaysSinceExpected = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.floor((now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <Card className="border-destructive">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          {title}
          <Badge variant="destructive" className="ml-2">{overdueRods.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {overdueRods.map((rod) => {
          const daysSince = getDaysSinceExpected(rod.leave_end_date);
          const isNoShow = rod.status === 'no_show';
          
          return (
            <div 
              key={rod.id} 
              className={`p-4 rounded-lg border ${
                isNoShow 
                  ? 'bg-destructive/10 border-destructive' 
                  : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={rod.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {rod.profiles?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{rod.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {rod.leave_requests?.leave_types?.name} • {rod.leave_requests?.request_number}
                    </p>
                  </div>
                </div>
                <Badge variant={isNoShow ? 'destructive' : 'secondary'}>
                  {isNoShow ? 'NO SHOW' : 'OVERDUE'}
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Expected: {formatDateForDisplay(rod.leave_end_date)}</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-destructive">
                  <Clock className="h-4 w-4" />
                  <span>{daysSince} day(s) overdue</span>
                </div>
              </div>

              {rod.profiles?.email && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${rod.profiles.email}`} className="hover:underline">
                    {rod.profiles.email}
                  </a>
                </div>
              )}

              {isNoShow && (
                <div className="mt-3 p-2 bg-destructive/20 rounded text-sm text-destructive font-medium">
                  ⚠️ Employee has not returned after 48+ hours. HR action required.
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
