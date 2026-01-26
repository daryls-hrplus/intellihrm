import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Activity, Bell, Target, CheckCircle2, Info, Clock } from 'lucide-react';
import { FieldReferenceTable, type FieldDefinition } from '@/components/enablement/manual/components/FieldReferenceTable';

const responseTrackingFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Response record identifier' },
  { name: 'assignment_id', required: true, type: 'UUID', description: 'Link to feedback_360_assignments' },
  { name: 'rater_id', required: true, type: 'UUID', description: 'Profile ID of the rater' },
  { name: 'status', required: true, type: 'text', description: 'Current response status', validation: 'pending | in_progress | submitted | declined' },
  { name: 'started_at', required: false, type: 'timestamptz', description: 'When rater began the survey' },
  { name: 'submitted_at', required: false, type: 'timestamptz', description: 'When rater completed submission' },
  { name: 'last_reminder_sent', required: false, type: 'timestamptz', description: 'Most recent reminder timestamp' },
  { name: 'reminder_count', required: true, type: 'integer', description: 'Number of reminders sent', defaultValue: '0' },
  { name: 'time_spent_seconds', required: false, type: 'integer', description: 'Total time on survey (for quality metrics)' },
];

const monitoringMetrics = [
  { label: 'Overall Completion', target: '85%+', description: 'Target response rate for statistical validity' },
  { label: 'Manager Category', target: '100%', description: 'Critical for performance calibration' },
  { label: 'Peer Category', target: '80%+', description: 'Minimum for reliable peer feedback' },
  { label: 'Direct Report', target: '75%+', description: 'Threshold for upward feedback validity' },
];

export function AnalyticsResponseMonitoring() {
  return (
    <section id="sec-6-5" data-manual-anchor="sec-6-5" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            6.5 Response Monitoring Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Admin</Badge>
            <span>→</span>
            <Badge variant="outline">Performance</Badge>
            <span>→</span>
            <Badge variant="outline">360 Feedback</Badge>
            <span>→</span>
            <Badge variant="secondary">Cycles</Badge>
            <span>→</span>
            <Badge variant="secondary">Response Monitoring</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Monitor real-time completion rates across the feedback cycle</li>
                <li>Identify participation gaps by rater category</li>
                <li>Configure and send targeted reminder communications</li>
                <li>Apply bulk actions to manage non-responders</li>
                <li>Track response quality metrics (time spent, completion patterns)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Overview */}
          <div className="prose prose-sm max-w-none">
            <h4 className="text-base font-semibold">Real-Time Completion Tracking</h4>
            <p className="text-muted-foreground">
              The Response Monitoring Dashboard provides administrators with real-time visibility into 
              feedback cycle participation. Track overall and per-category completion rates, identify 
              non-responders, and take action to improve participation before deadlines.
            </p>
          </div>

          {/* Response Rate Targets */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Response Rate Targets (SHRM Benchmarks)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {monitoringMetrics.map((metric) => (
                  <div key={metric.label} className="p-3 bg-background rounded border text-center">
                    <p className="text-2xl font-bold text-primary">{metric.target}</p>
                    <p className="text-sm font-medium">{metric.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Features */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Dashboard Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted/30 rounded border">
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Progress Overview
                  </h5>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Overall completion percentage with progress bar</li>
                    <li>• Breakdown by rater category (Self, Manager, Peer, etc.)</li>
                    <li>• Daily completion trend chart</li>
                    <li>• Days remaining countdown</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/30 rounded border">
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Reminder Management
                  </h5>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Send bulk reminders to non-responders</li>
                    <li>• Category-specific reminder targeting</li>
                    <li>• Reminder history and count tracking</li>
                    <li>• Escalation to managers for low participation</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/30 rounded border">
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Quality Metrics
                  </h5>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Average time spent per response</li>
                    <li>• Rushed response detection (&lt;2 min)</li>
                    <li>• Straight-line response patterns</li>
                    <li>• Comment length and quality indicators</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/30 rounded border">
                  <h5 className="font-medium mb-2">Bulk Actions</h5>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Send reminders to selected participants</li>
                    <li>• Extend deadline for specific raters</li>
                    <li>• Reassign feedback to alternate raters</li>
                    <li>• Export non-responder list to CSV</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Reference */}
          <FieldReferenceTable 
            title="feedback_360_responses Tracking Fields" 
            fields={responseTrackingFields} 
          />

          {/* Business Rules */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Response Monitoring Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="shrink-0">System</Badge>
                  <span>Maximum 3 automated reminders per rater per cycle</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="shrink-0">System</Badge>
                  <span>Responses under 2 minutes flagged for quality review</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="shrink-0">Policy</Badge>
                  <span>Manager escalation triggered at 50% completion with 3 days remaining</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="shrink-0">Policy</Badge>
                  <span>Declined responses count against participation but not against target</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0">Advisory</Badge>
                  <span>Target 80%+ response rate for statistical validity (SHRM benchmark)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industry Context */}
          <Alert>
            <Target className="h-4 w-4" />
            <AlertTitle>Industry Benchmark: Response Rates</AlertTitle>
            <AlertDescription>
              <p className="text-sm mt-1">
                According to SHRM research, 360 feedback programs should target:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>80-85% overall response rate</strong> for reliable aggregate data</li>
                <li><strong>3+ raters per category</strong> to maintain anonymity</li>
                <li><strong>5-7 minutes average completion time</strong> for thoughtful responses</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Troubleshooting */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Troubleshooting</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>Low response rate:</strong> Send targeted reminders; check email delivery</li>
                <li><strong>High decline rate:</strong> Review rater selection criteria</li>
                <li><strong>Rushed responses:</strong> Communicate survey importance; consider extending deadline</li>
                <li><strong>Category imbalance:</strong> Focus reminders on underperforming categories</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}
