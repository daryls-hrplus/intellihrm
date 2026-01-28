import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  RefreshCw, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  Bell,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export function LndWorkflowRecertification() {
  return (
    <section className="space-y-6" id="sec-4-18" data-manual-anchor="sec-4-18">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <RefreshCw className="h-6 w-6 text-blue-600" />
          4.18 Recertification Workflows
        </h2>
        <p className="text-muted-foreground">
          Manage certificate expiration, renewal processes, and compliance tracking 
          for time-sensitive certifications.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure certificate validity periods and expiry rules</li>
            <li>Set up automated recertification reminders</li>
            <li>Process recertification enrollments and assessments</li>
            <li>Track compliance status across the organization</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recertification Lifecycle</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       RECERTIFICATION LIFECYCLE                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Certificate Issued                                                             │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────┐                                                            │
│   │ VALID           │  Certificate active                                        │
│   │                 │  Expiry date set based on validity_months                  │
│   └────────┬────────┘                                                            │
│            │                                                                     │
│            │ (Time passes...)                                                    │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                       REMINDER WINDOW                                    │   │
│   │                                                                          │   │
│   │   90 days before:  ───────▶  First reminder email                        │   │
│   │                              "Your certification expires in 90 days"     │   │
│   │                                                                          │   │
│   │   60 days before:  ───────▶  Second reminder + auto-enroll option        │   │
│   │                              Manager notified                            │   │
│   │                                                                          │   │
│   │   30 days before:  ───────▶  Urgent reminder                             │   │
│   │                              Escalation to HR                            │   │
│   │                                                                          │   │
│   │   14 days before:  ───────▶  Final warning                               │   │
│   │                              Red flag on profile                         │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────┐    OR    ┌─────────────────┐                              │
│   │ EXPIRED         │          │ RENEWED         │                              │
│   │                 │          │                 │                              │
│   │ Access revoked  │          │ New expiry set  │                              │
│   │ Compliance gap  │          │ Record updated  │                              │
│   └─────────────────┘          └─────────────────┘                              │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recertification Configuration</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Setting</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Options</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">validity_months</TableCell>
                <TableCell>lms_courses</TableCell>
                <TableCell>12, 24, 36, etc.</TableCell>
                <TableCell>How long certificate is valid</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">recertification_course_id</TableCell>
                <TableCell>lms_courses</TableCell>
                <TableCell>UUID (self or different)</TableCell>
                <TableCell>Course to complete for renewal</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">reminder_days_before</TableCell>
                <TableCell>Company Settings</TableCell>
                <TableCell>[90, 60, 30, 14]</TableCell>
                <TableCell>When to send expiry reminders</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">auto_enroll_on_expiry</TableCell>
                <TableCell>lms_courses</TableCell>
                <TableCell>true/false</TableCell>
                <TableCell>Auto-enroll when cert expires</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">grace_period_days</TableCell>
                <TableCell>lms_courses</TableCell>
                <TableCell>0, 7, 14, 30</TableCell>
                <TableCell>Days after expiry to complete renewal</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-blue-600" />
            Recertification Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            The following notification event types support recertification workflows:
          </p>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="font-medium">Event Code</TableHead>
                  <TableHead className="font-medium">Trigger</TableHead>
                  <TableHead className="font-medium">Recipients</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">LMS_CERTIFICATE_EXPIRING</code></TableCell>
                  <TableCell className="text-sm">Approaching expiry date</TableCell>
                  <TableCell className="text-sm">Employee, Manager</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">LMS_RECERTIFICATION_DUE</code></TableCell>
                  <TableCell className="text-sm">Certificate expired or expiring</TableCell>
                  <TableCell className="text-sm">Employee</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">LMS_CERTIFICATE_ISSUED</code></TableCell>
                  <TableCell className="text-sm">Recertification complete</TableCell>
                  <TableCell className="text-sm">Employee</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            The <strong>recertification-reminders</strong> scheduled job runs daily to process expiring certificates.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recertification Process Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Full Re-take</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Complete entire course again</li>
                <li>• Pass all quizzes</li>
                <li>• Recommended for significant content updates</li>
                <li>• recertification_course_id = original course</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Refresher Course</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Shorter version with key updates</li>
                <li>• Focus on changed content only</li>
                <li>• Assessment-only option available</li>
                <li>• recertification_course_id = refresher course</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Assessment Only</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Skip content, take quiz directly</li>
                <li>• For experienced practitioners</li>
                <li>• Higher passing score required</li>
                <li>• Fails redirect to full course</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">External Evidence</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Submit external certification proof</li>
                <li>• Continuing education credits</li>
                <li>• Conference attendance</li>
                <li>• Requires HR approval</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Compliance Dashboard Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Compliance Certification Status Report:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────────┐
│  Certification                    │ Total │ Valid │ Expiring │ Expired │
├───────────────────────────────────┼───────┼───────┼──────────┼─────────┤
│  Safety Orientation               │  450  │  398  │    42    │   10    │
│  Anti-Harassment Training         │  450  │  425  │    18    │    7    │
│  Data Privacy (GDPR)              │  280  │  251  │    23    │    6    │
│  Forklift Operator License        │   45  │   38  │     5    │    2    │
│  First Aid/CPR                    │  120  │  108  │    10    │    2    │
└─────────────────────────────────────────────────────────────────────┘

Risk Indicators:
├── 🔴 27 expired certifications requiring immediate action
├── 🟡 98 certificates expiring within 30 days
└── 🟢 1,220 current and compliant

Action Required:
├── Notify 27 employees with expired certifications
├── Auto-enroll 98 employees in recertification courses
└── Escalate 10 Safety Orientation gaps to EHS Manager
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Business Rules</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Expired certificates are flagged on employee profiles and in HR reports</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Grace period allows completion without compliance gap record</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Recertification inherits original enrollment source for tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Expiry date resets from recertification completion date, not original expiry</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Historical certificates maintained for audit trail</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Compliance Integration</AlertTitle>
        <AlertDescription>
          Recertification status integrates with the Compliance module's 
          compliance_training_assignments table. Expired certifications can 
          trigger automated compliance gap records and management escalations.
        </AlertDescription>
      </Alert>
    </section>
  );
}
