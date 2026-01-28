import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, AlertTriangle, Database, Upload, Clock, Bell } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndExternalCertifications() {
  return (
    <section className="space-y-6" id="sec-3-10" data-manual-anchor="sec-3-10">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Award className="h-6 w-6 text-emerald-600" />
          3.10 Certifications & Credentials
        </h2>
        <p className="text-muted-foreground">
          Track external certifications, manage expiry dates, and configure renewal workflows.
          Integrates with compliance tracking for mandatory credential management.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Record external certifications with validity tracking</li>
            <li>Configure expiry reminder windows</li>
            <li>Automate recertification request generation</li>
            <li>Integrate with employee profiles and compliance</li>
            <li>Upload and verify certificate documents</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Certificate Fields in external_training_records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">certificate_received</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell>Whether certificate was issued for this training</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">certificate_url</TableCell>
                <TableCell>Text</TableCell>
                <TableCell>URL to uploaded certificate document</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">certificate_number</TableCell>
                <TableCell>Text</TableCell>
                <TableCell>Certificate/credential ID number</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">certificate_expiry_date</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Expiration date (null if non-expiring)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">accrediting_body_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>FK to accrediting_bodies table</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">credential_type</TableCell>
                <TableCell>Text</TableCell>
                <TableCell>certificate | license | certification | diploma</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">verification_status</TableCell>
                <TableCell>Text</TableCell>
                <TableCell>pending | verified | rejected</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">verified_by</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>User who verified the certificate</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">verified_at</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>When verification occurred</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Certificate Fields in training_vendor_courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">certification_name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell>Official certification title (e.g., "PMP")</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">certification_body</TableCell>
                <TableCell>Text</TableCell>
                <TableCell>Issuing organization (e.g., "PMI")</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">certification_validity_months</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell>Months until renewal required (null = non-expiring)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">provides_certification</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell>Whether course leads to certification</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">certification_level</TableCell>
                <TableCell>Text</TableCell>
                <TableCell>foundation | practitioner | advanced | expert</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">renewal_requirements</TableCell>
                <TableCell>Text</TableCell>
                <TableCell>Description of what's needed for renewal</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Certification Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
CERTIFICATION TRACKING WORKFLOW
═══════════════════════════════

Training Completed → Certificate Issued → Expiry Date Set
                                                │
                    ┌───────────────────────────┘
                    ▼
         ┌──────────────────────┐
         │  REMINDER WINDOWS    │
         │                      │
         │  90 days: Alert L&D  │
         │  60 days: Email Emp  │
         │  30 days: Manager    │
         │   7 days: Final      │
         │   0 days: EXPIRED    │
         └──────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Auto-Create Training │
         │ Recertification Req  │
         │ (source_type =       │
         │  'recertification')  │
         └──────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Step-by-Step: Upload & Verify Certificate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">1</Badge>
              <div>
                <p className="font-medium">Navigate to Training Record</p>
                <p className="text-sm text-muted-foreground">ESS → My Training → External Training → Select record</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">2</Badge>
              <div>
                <p className="font-medium">Toggle Certificate Received</p>
                <p className="text-sm text-muted-foreground">Enable "Certificate Received" to show certificate fields</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">3</Badge>
              <div>
                <p className="font-medium">Enter Certificate Details</p>
                <p className="text-sm text-muted-foreground">Certificate number, issuing body, expiry date</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">4</Badge>
              <div>
                <p className="font-medium">Upload Document</p>
                <p className="text-sm text-muted-foreground">Upload PDF or image of certificate (max 5MB)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">5</Badge>
              <div>
                <p className="font-medium">HR Verification (If Required)</p>
                <p className="text-sm text-muted-foreground">HR reviews and marks as verified/rejected</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Reminder Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Days Before Expiry</TableHead>
                <TableHead>Notification Type</TableHead>
                <TableHead>Recipients</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>90 days</TableCell>
                <TableCell><Badge variant="outline">Email</Badge></TableCell>
                <TableCell>L&D Administrator, Employee</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>60 days</TableCell>
                <TableCell><Badge variant="outline">Email + In-App</Badge></TableCell>
                <TableCell>Employee, Manager</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>30 days</TableCell>
                <TableCell><Badge className="bg-orange-100 text-orange-800">Escalation</Badge></TableCell>
                <TableCell>Manager, HR Partner</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>7 days</TableCell>
                <TableCell><Badge className="bg-red-100 text-red-800">Urgent</Badge></TableCell>
                <TableCell>All stakeholders</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>0 days (Expired)</TableCell>
                <TableCell><Badge variant="destructive">Critical</Badge></TableCell>
                <TableCell>Employee, Manager, HR, Compliance</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="text-sm text-muted-foreground mt-4">
            Reminder windows are configurable in <strong>Admin → Training Settings → 
            Recertification Reminders</strong>. Different reminder schedules can be set
            for compliance-critical vs. optional certifications.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recertification Automation</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
RECERTIFICATION REQUEST AUTO-GENERATION
═══════════════════════════════════════

Scheduled Job: recertification-reminders
Runs: Daily at 6:00 AM (weekdays)

FOR EACH certificate WHERE:
  expiry_date - TODAY() <= reminder_window_days
  AND no existing recertification request
  AND employee.status = 'active'

DO:
  1. Create training_request:
     ├── request_type: 'certification'
     ├── source_type: 'recertification'
     ├── source_reference_id: certificate.id
     ├── training_name: original course name
     ├── vendor_id: original vendor (if available)
     └── status: 'pending'

  2. Notify employee and manager

  3. Log activity for audit
          `}</pre>
        </CardContent>
      </Card>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Compliance Critical</AlertTitle>
        <AlertDescription>
          For compliance-required certifications (e.g., OSHA, industry licenses), expired 
          credentials may impact job eligibility. Configure mandatory recertification rules 
          in Compliance Settings to prevent lapses. The system can be configured to restrict
          access to certain job functions when required certifications expire.
        </AlertDescription>
      </Alert>
    </section>
  );
}
