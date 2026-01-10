import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Smartphone, Users, CheckSquare } from 'lucide-react';

export function TimeAttendanceManualESSMSSSection() {
  return (
    <div className="space-y-8">
      <Card id="ta-sec-9-1" data-manual-anchor="ta-sec-9-1" className="scroll-mt-32">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Part 9</Badge>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>55 min read</span>
          </div>
          <CardTitle className="text-2xl">ESS/MSS Self-Service</CardTitle>
          <CardDescription>Employee and manager self-service for time and attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-primary/20">
              <CardContent className="pt-4">
                <Smartphone className="h-5 w-5 text-primary mb-2" />
                <h4 className="font-medium">Mobile Clock-In</h4>
                <p className="text-sm text-muted-foreground">Mobile app clock-in with face/GPS verification.</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/20">
              <CardContent className="pt-4">
                <Clock className="h-5 w-5 text-blue-500 mb-2" />
                <h4 className="font-medium">My Timesheet</h4>
                <p className="text-sm text-muted-foreground">View and submit personal timesheets.</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/20">
              <CardContent className="pt-4">
                <Users className="h-5 w-5 text-green-500 mb-2" />
                <h4 className="font-medium">Team Dashboard</h4>
                <p className="text-sm text-muted-foreground">Manager view of team attendance and coverage.</p>
              </CardContent>
            </Card>
            <Card className="border-purple-500/20">
              <CardContent className="pt-4">
                <CheckSquare className="h-5 w-5 text-purple-500 mb-2" />
                <h4 className="font-medium">Approvals</h4>
                <p className="text-sm text-muted-foreground">Timesheet and overtime approval workflows.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
