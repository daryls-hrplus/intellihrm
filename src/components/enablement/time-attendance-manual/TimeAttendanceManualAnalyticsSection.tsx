import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BarChart3, Heart, TrendingUp } from 'lucide-react';

export function TimeAttendanceManualAnalyticsSection() {
  return (
    <div className="space-y-8">
      <Card id="ta-sec-8-1" data-manual-anchor="ta-sec-8-1" className="scroll-mt-32">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Part 8</Badge>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>50 min read</span>
          </div>
          <CardTitle className="text-2xl">Analytics and Insights</CardTitle>
          <CardDescription>Attendance dashboards, absenteeism analysis, wellness monitoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-primary/20">
              <CardContent className="pt-4">
                <BarChart3 className="h-5 w-5 text-primary mb-2" />
                <h4 className="font-medium">Attendance Dashboard</h4>
                <p className="text-sm text-muted-foreground">Overview of attendance KPIs, trends, and patterns.</p>
              </CardContent>
            </Card>
            <Card className="border-red-500/20">
              <CardContent className="pt-4">
                <TrendingUp className="h-5 w-5 text-red-500 mb-2" />
                <h4 className="font-medium">Absenteeism Analysis</h4>
                <p className="text-sm text-muted-foreground">Bradford Factor and absenteeism cost modeling.</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/20">
              <CardContent className="pt-4">
                <Heart className="h-5 w-5 text-green-500 mb-2" />
                <h4 className="font-medium">Wellness Monitoring</h4>
                <p className="text-sm text-muted-foreground">AI burnout prediction and fatigue indicators.</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/20">
              <CardContent className="pt-4">
                <Clock className="h-5 w-5 text-blue-500 mb-2" />
                <h4 className="font-medium">Overtime Trends</h4>
                <p className="text-sm text-muted-foreground">Overtime patterns and department comparisons.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
