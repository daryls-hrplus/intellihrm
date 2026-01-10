import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FolderKanban, DollarSign, CheckSquare } from 'lucide-react';

export function TimeAttendanceManualProjectTimeSection() {
  return (
    <div className="space-y-8">
      <Card id="ta-sec-6-1" data-manual-anchor="ta-sec-6-1" className="scroll-mt-32">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Part 6</Badge>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>55 min read</span>
          </div>
          <CardTitle className="text-2xl">Project Time Tracking</CardTitle>
          <CardDescription>Project setup, time entry, cost allocation, and approvals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-primary/20">
              <CardContent className="pt-4">
                <FolderKanban className="h-5 w-5 text-primary mb-2" />
                <h4 className="font-medium">Project Setup</h4>
                <p className="text-sm text-muted-foreground">Create projects, phases, tasks, and employee assignments.</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/20">
              <CardContent className="pt-4">
                <DollarSign className="h-5 w-5 text-blue-500 mb-2" />
                <h4 className="font-medium">Cost Configuration</h4>
                <p className="text-sm text-muted-foreground">Hourly rates, billing rates, and effective dates.</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/20">
              <CardContent className="pt-4">
                <CheckSquare className="h-5 w-5 text-green-500 mb-2" />
                <h4 className="font-medium">Timesheet Approvals</h4>
                <p className="text-sm text-muted-foreground">Manager and project manager approval workflow.</p>
              </CardContent>
            </Card>
            <Card className="border-purple-500/20">
              <CardContent className="pt-4">
                <DollarSign className="h-5 w-5 text-purple-500 mb-2" />
                <h4 className="font-medium">Cost Analytics</h4>
                <p className="text-sm text-muted-foreground">Budget vs actual and project profitability.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
