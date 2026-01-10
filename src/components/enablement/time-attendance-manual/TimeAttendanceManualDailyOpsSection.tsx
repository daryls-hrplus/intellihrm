import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Timer, AlertCircle, Activity } from 'lucide-react';

export function TimeAttendanceManualDailyOpsSection() {
  return (
    <div className="space-y-8">
      <Card id="ta-sec-4-1" data-manual-anchor="ta-sec-4-1" className="scroll-mt-32">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Part 4</Badge>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>60 min read</span>
          </div>
          <CardTitle className="text-2xl">Daily Operations</CardTitle>
          <CardDescription>Time tracking, clock in/out, attendance records, and exceptions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-primary/20">
              <CardContent className="pt-4">
                <Timer className="h-5 w-5 text-primary mb-2" />
                <h4 className="font-medium">Clock In/Out</h4>
                <p className="text-sm text-muted-foreground">Multi-method clock-in procedures and validation rules.</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/20">
              <CardContent className="pt-4">
                <Activity className="h-5 w-5 text-blue-500 mb-2" />
                <h4 className="font-medium">Live Dashboard</h4>
                <p className="text-sm text-muted-foreground">Real-time attendance monitoring and late arrival tracking.</p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/20">
              <CardContent className="pt-4">
                <AlertCircle className="h-5 w-5 text-amber-500 mb-2" />
                <h4 className="font-medium">Exceptions</h4>
                <p className="text-sm text-muted-foreground">Handle missed punches, early departures, and OT alerts.</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/20">
              <CardContent className="pt-4">
                <Clock className="h-5 w-5 text-green-500 mb-2" />
                <h4 className="font-medium">Flex Time</h4>
                <p className="text-sm text-muted-foreground">Flexible work hours and balance tracking.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
