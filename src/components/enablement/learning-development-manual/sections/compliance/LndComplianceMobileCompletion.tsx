import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Smartphone, CheckCircle, Bell, Download, Wifi, WifiOff, Camera } from 'lucide-react';

export function LndComplianceMobileCompletion() {
  return (
    <section id="sec-5-24" data-manual-anchor="sec-5-24" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Smartphone className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.24 Mobile Compliance Completion</h2>
          <p className="text-sm text-muted-foreground">
            ESS mobile features for completing compliance training on any device
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Enable mobile-first compliance training completion for field workers</li>
            <li>Configure offline training download and sync capabilities</li>
            <li>Set up mobile push notifications for due date reminders</li>
            <li>Implement mobile-friendly assessment and quiz interfaces</li>
            <li>Track mobile completion analytics and device usage patterns</li>
          </ul>
        </CardContent>
      </Card>

      {/* Mobile Features Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mobile Compliance Features</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Configuration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Course Streaming</TableCell>
                <TableCell>Stream video content with adaptive quality</TableCell>
                <TableCell><Badge className="bg-green-600">Online</Badge></TableCell>
                <TableCell>Default enabled</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Offline Download</TableCell>
                <TableCell>Download courses for offline completion</TableCell>
                <TableCell><Badge variant="secondary">Offline</Badge></TableCell>
                <TableCell>Per-course setting</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Push Notifications</TableCell>
                <TableCell>Due date, escalation, and reminder alerts</TableCell>
                <TableCell><Badge className="bg-green-600">Online</Badge></TableCell>
                <TableCell>User opt-in</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Mobile Assessments</TableCell>
                <TableCell>Touch-optimized quizzes and knowledge checks</TableCell>
                <TableCell><Badge className="bg-green-600">Both</Badge></TableCell>
                <TableCell>Auto-responsive</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Photo Evidence</TableCell>
                <TableCell>Capture completion evidence (e.g., certificates)</TableCell>
                <TableCell><Badge className="bg-green-600">Online</Badge></TableCell>
                <TableCell>Per-requirement</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Offline Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            Offline Training Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Field workers, remote site employees, and offshore personnel can download compliance
            training for offline completion. Progress syncs automatically when connectivity is restored.
          </p>
          
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`mobile_offline_config
├── id: UUID PK
├── company_id: UUID FK
├── course_id: UUID FK → lms_courses.id
├── allow_offline_download: BOOLEAN DEFAULT true
├── max_offline_days: INT DEFAULT 30 -- Auto-expire after 30 days
├── require_sync_before_completion: BOOLEAN DEFAULT false
├── offline_quiz_mode: TEXT ('allow_all' | 'require_sync' | 'disabled')
├── media_quality_offline: TEXT ('high' | 'medium' | 'low')
├── max_download_size_mb: INT DEFAULT 500
└── created_at: TIMESTAMPTZ

mobile_offline_progress
├── id: UUID PK
├── employee_id: UUID FK → profiles.id
├── assignment_id: UUID FK → compliance_training_assignments.id
├── device_id: TEXT -- Unique device identifier
├── downloaded_at: TIMESTAMPTZ
├── last_progress_at: TIMESTAMPTZ
├── progress_percent: INT
├── quiz_answers_pending: JSONB -- Stored locally until sync
├── synced_at: TIMESTAMPTZ NULL -- NULL = pending sync
└── sync_status: TEXT ('pending' | 'synced' | 'conflict' | 'failed')

-- Query: Find employees with pending offline syncs
SELECT p.full_name, mop.assignment_id, mop.progress_percent
FROM mobile_offline_progress mop
JOIN profiles p ON mop.employee_id = p.id
WHERE mop.sync_status = 'pending'
  AND mop.last_progress_at > NOW() - INTERVAL '7 days';`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Mobile Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notification Type</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Default Timing</TableHead>
                <TableHead>Employee Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>New Assignment</TableCell>
                <TableCell>Training assigned</TableCell>
                <TableCell>Immediate</TableCell>
                <TableCell>Cannot disable</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Due Date Reminder</TableCell>
                <TableCell>Upcoming deadline</TableCell>
                <TableCell>7 days, 3 days, 1 day before</TableCell>
                <TableCell>Configurable frequency</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Overdue Alert</TableCell>
                <TableCell>Past due date</TableCell>
                <TableCell>Day of + daily until escalation</TableCell>
                <TableCell>Cannot disable</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Escalation Notice</TableCell>
                <TableCell>Manager/HR notified</TableCell>
                <TableCell>Immediate on tier change</TableCell>
                <TableCell>Cannot disable</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Completion Confirmation</TableCell>
                <TableCell>Training completed</TableCell>
                <TableCell>Immediate</TableCell>
                <TableCell>Can disable</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Recertification Coming</TableCell>
                <TableCell>Renewal approaching</TableCell>
                <TableCell>90, 60, 30 days before</TableCell>
                <TableCell>Configurable</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Photo Evidence Capture */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Photo Evidence Capture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            For compliance requirements that need documentary proof (e.g., physical certificate,
            on-site completion, equipment inspection), employees can capture and upload photos
            directly from the mobile app.
          </p>
          
          <div className="grid gap-3">
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Acceptable Evidence Types</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                <li>Physical training certificates</li>
                <li>Signed attendance sheets</li>
                <li>Completion badges from external providers</li>
                <li>On-site safety signage acknowledgment</li>
              </ul>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Photo Requirements</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                <li>Minimum resolution: 1024x768</li>
                <li>Geo-tagging optional (for site verification)</li>
                <li>Timestamp watermark automatic</li>
                <li>Max file size: 10MB per image</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mobile Completion Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Dashboard Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Mobile Completion Rate</TableCell>
                <TableCell>% of trainings completed on mobile vs desktop</TableCell>
                <TableCell>Executive Dashboard</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Offline Sync Latency</TableCell>
                <TableCell>Average time between offline completion and sync</TableCell>
                <TableCell>Risk Dashboard</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Device Distribution</TableCell>
                <TableCell>iOS vs Android vs tablet usage breakdown</TableCell>
                <TableCell>Executive Dashboard</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Push Notification Response</TableCell>
                <TableCell>% of reminders that led to completion within 24h</TableCell>
                <TableCell>Risk Dashboard</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Field Worker Coverage</TableCell>
                <TableCell>Compliance rate for employees without desktop access</TableCell>
                <TableCell>Manager Portal</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Configuration UI */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-4 w-4" />
            UI Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg bg-muted/30">
              <p className="font-medium text-sm">Employee Mobile Access</p>
              <code className="text-xs text-muted-foreground">
                ESS Mobile App → My Training → Compliance → [Course] → Download for Offline
              </code>
            </div>
            <div className="p-3 border rounded-lg bg-muted/30">
              <p className="font-medium text-sm">Admin Configuration</p>
              <code className="text-xs text-muted-foreground">
                Training → Compliance Training → Requirements → [Edit] → Mobile Settings tab
              </code>
            </div>
            <div className="p-3 border rounded-lg bg-muted/30">
              <p className="font-medium text-sm">Mobile Analytics</p>
              <code className="text-xs text-muted-foreground">
                Training → Compliance Training → Executive Dashboard → Device Analytics widget
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
