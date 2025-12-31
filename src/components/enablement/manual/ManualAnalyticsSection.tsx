import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';

export function ManualAnalyticsSection() {
  return (
    <div className="space-y-8">
      {/* Analytics Dashboard */}
      <Card id="sec-6-1">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 6.1</Badge>
          </div>
          <CardTitle className="text-2xl">Appraisal Analytics Dashboard</CardTitle>
          <CardDescription>Understanding and using the analytics interface</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Completion Rate', value: '95%', target: 'Target: 95%+', icon: Target },
              { label: 'On-Time Rate', value: '89%', target: 'Target: 90%+', icon: TrendingUp },
              { label: 'Avg. Rating', value: '3.4', target: 'Scale: 1-5', icon: BarChart3 },
              { label: 'Calibrated', value: '87%', target: 'Of reviews', icon: Users }
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-4 text-center">
                  <stat.icon className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm font-medium">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.target}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribution Analysis */}
      <Card id="sec-6-2">
        <CardHeader>
          <CardTitle className="text-2xl">Performance Distribution Analysis</CardTitle>
          <CardDescription>Monitor rating distributions post-calibration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { category: 'Exceptional', percent: 10, color: 'bg-green-500' },
              { category: 'Exceeds', percent: 20, color: 'bg-blue-500' },
              { category: 'Meets', percent: 45, color: 'bg-primary' },
              { category: 'Needs Improvement', percent: 18, color: 'bg-amber-500' },
              { category: 'Unsatisfactory', percent: 7, color: 'bg-red-500' }
            ].map((item) => (
              <div key={item.category} className="flex items-center gap-4">
                <span className="w-32 text-sm">{item.category}</span>
                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                </div>
                <span className="w-12 text-sm text-right">{item.percent}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
