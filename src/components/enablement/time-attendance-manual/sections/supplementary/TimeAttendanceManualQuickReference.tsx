import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Timer, AlertCircle, DollarSign } from 'lucide-react';
import { TIME_ATTENDANCE_QUICK_REFERENCE } from '@/types/timeAttendanceManual';

export function TimeAttendanceManualQuickReference() {
  return (
    <div className="space-y-6">
      <Card id="quick-ref" data-manual-anchor="quick-ref" className="scroll-mt-32">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <CardTitle>Quick Reference Cards</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  {TIME_ATTENDANCE_QUICK_REFERENCE.clockInMethods.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {TIME_ATTENDANCE_QUICK_REFERENCE.clockInMethods.items.map((item, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="font-medium">{item.method}</span>
                      <span className="text-muted-foreground text-xs">{item.description}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {TIME_ATTENDANCE_QUICK_REFERENCE.overtimeTypes.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {TIME_ATTENDANCE_QUICK_REFERENCE.overtimeTypes.items.map((item, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="font-medium">{item.type}</span>
                      <span className="text-muted-foreground text-xs">{item.description}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {TIME_ATTENDANCE_QUICK_REFERENCE.commonExceptions.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {TIME_ATTENDANCE_QUICK_REFERENCE.commonExceptions.items.map((item, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="font-medium">{item.exception}</span>
                      <span className="text-muted-foreground text-xs">{item.action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {TIME_ATTENDANCE_QUICK_REFERENCE.payrollIntegration.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {TIME_ATTENDANCE_QUICK_REFERENCE.payrollIntegration.items.map((item, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="font-medium">{item.dataPoint}</span>
                      <span className="text-muted-foreground text-xs">{item.timing}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
