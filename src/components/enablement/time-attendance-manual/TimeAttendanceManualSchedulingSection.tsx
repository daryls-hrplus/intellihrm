import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Brain, Users, Shield } from 'lucide-react';

export function TimeAttendanceManualSchedulingSection() {
  return (
    <div className="space-y-8">
      <Card id="ta-sec-5-1" data-manual-anchor="ta-sec-5-1" className="scroll-mt-32">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Part 5</Badge>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>65 min read</span>
          </div>
          <CardTitle className="text-2xl">Advanced Scheduling</CardTitle>
          <CardDescription>AI scheduler, open shifts, bidding, coverage, and fatigue management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-primary/20">
              <CardContent className="pt-4">
                <Brain className="h-5 w-5 text-primary mb-2" />
                <h4 className="font-medium">AI Scheduler</h4>
                <p className="text-sm text-muted-foreground">Automated schedule optimization with constraint handling.</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/20">
              <CardContent className="pt-4">
                <Users className="h-5 w-5 text-blue-500 mb-2" />
                <h4 className="font-medium">Shift Bidding</h4>
                <p className="text-sm text-muted-foreground">Employee preferences and swap requests with approvals.</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/20">
              <CardContent className="pt-4">
                <Users className="h-5 w-5 text-green-500 mb-2" />
                <h4 className="font-medium">Coverage Management</h4>
                <p className="text-sm text-muted-foreground">Minimum staffing and coverage gap alerts.</p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/20">
              <CardContent className="pt-4">
                <Shield className="h-5 w-5 text-amber-500 mb-2" />
                <h4 className="font-medium">Fatigue Management</h4>
                <p className="text-sm text-muted-foreground">Rest period enforcement and maximum hours limits.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
