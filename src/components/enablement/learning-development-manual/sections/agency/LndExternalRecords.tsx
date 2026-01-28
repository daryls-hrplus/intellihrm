import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileCheck, Database, Settings, History } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndExternalRecords() {
  return (
    <section className="space-y-6" id="sec-3-8" data-manual-anchor="sec-3-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-emerald-600" />
          3.8 External Training Records
        </h2>
        <p className="text-muted-foreground">
          Record and track external training completed by employees, including certifications and skills acquired.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Record completed external training with full metadata</li>
            <li>Upload and manage training certificates</li>
            <li>Track skills acquired through external training</li>
            <li>Integrate external records with training history</li>
            <li>Configure certificate expiry tracking</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Field Reference: external_training_records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Auto</Badge></TableCell>
                <TableCell>Primary key</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">company_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Company scope</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">employee_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Employee who completed training</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">training_request_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Link to approved training request</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">training_name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Name of training completed</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">provider_name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>External training provider</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">training_type</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>workshop | seminar | conference | certification | online_course</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">description</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Training description</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">start_date</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Training start date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">end_date</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Training end date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">duration_hours</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Total training hours</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">location</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Training location</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">actual_cost</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Actual cost incurred</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">currency</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Cost currency (default: USD)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">certificate_received</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Was certificate issued?</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">certificate_url</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>URL to uploaded certificate file</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">certificate_expiry_date</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Certificate expiration date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">skills_acquired</TableCell>
                <TableCell>Text[]</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Array of skills gained</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">notes</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Additional notes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">created_at</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell><Badge variant="destructive">Auto</Badge></TableCell>
                <TableCell>Record creation timestamp</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">updated_at</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell><Badge variant="destructive">Auto</Badge></TableCell>
                <TableCell>Last update timestamp</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Step-by-Step: Recording External Training
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Badge className="shrink-0">1</Badge>
              <div>
                <p className="font-medium">Navigate to External Training</p>
                <p className="text-sm text-muted-foreground">Training → External Training (or ESS → My Training → External)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">2</Badge>
              <div>
                <p className="font-medium">Click "Add Record"</p>
                <p className="text-sm text-muted-foreground">Opens the external training form</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">3</Badge>
              <div>
                <p className="font-medium">Select Employee (Admin only)</p>
                <p className="text-sm text-muted-foreground">ESS: Auto-populated with logged-in user</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">4</Badge>
              <div>
                <p className="font-medium">Enter Training Details</p>
                <ul className="text-sm text-muted-foreground list-disc pl-4">
                  <li>Training Name: Official course/program name</li>
                  <li>Provider Name: Vendor or organization</li>
                  <li>Training Type: Workshop, Seminar, Conference, etc.</li>
                  <li>Description: Topics covered, learning objectives</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">5</Badge>
              <div>
                <p className="font-medium">Set Dates & Duration</p>
                <ul className="text-sm text-muted-foreground list-disc pl-4">
                  <li>Start Date: Training start date (required)</li>
                  <li>End Date: Training end date (for multi-day)</li>
                  <li>Duration Hours: Total contact hours</li>
                  <li>Location: Physical or Virtual</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">6</Badge>
              <div>
                <p className="font-medium">Record Cost (if applicable)</p>
                <p className="text-sm text-muted-foreground">Actual cost and currency for budget tracking</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">7</Badge>
              <div>
                <p className="font-medium">Add Certificate Details</p>
                <ul className="text-sm text-muted-foreground list-disc pl-4">
                  <li>Certificate Received: Yes/No toggle</li>
                  <li>Upload Certificate: PDF or image file</li>
                  <li>Expiry Date: For recertification tracking</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">8</Badge>
              <div>
                <p className="font-medium">Add Skills Acquired</p>
                <p className="text-sm text-muted-foreground">Tag skills gained (links to competency tracking)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">9</Badge>
              <div>
                <p className="font-medium">Save Record</p>
                <p className="text-sm text-muted-foreground">Record added to employee's training history</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training Type Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Typical Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="outline">conference</Badge></TableCell>
                <TableCell>Industry events, keynotes, networking</TableCell>
                <TableCell>1-3 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="outline">seminar</Badge></TableCell>
                <TableCell>Focused topic sessions, expert-led</TableCell>
                <TableCell>2-8 hours</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="outline">workshop</Badge></TableCell>
                <TableCell>Hands-on skill building, interactive</TableCell>
                <TableCell>1-2 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="outline">online_course</Badge></TableCell>
                <TableCell>Self-paced eLearning platform</TableCell>
                <TableCell>Variable</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="outline">certification</Badge></TableCell>
                <TableCell>Credential preparation and examination</TableCell>
                <TableCell>3-5 days</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Unified Training History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
EMPLOYEE TRAINING TRANSCRIPT (Unified View)
═══════════════════════════════════════════

Employee: John Smith
Department: Information Technology
As of: January 2026

┌───────────────────────────────────────────────────────────────────────────┐
│ INTERNAL LMS TRAINING (from lms_enrollments)                              │
├───────────────────────────────────────────────────────────────────────────┤
│ Date       │ Course               │ Type      │ Status    │ Score │ Hrs │
├────────────┼──────────────────────┼───────────┼───────────┼───────┼─────┤
│ 2025-12-15 │ Data Privacy 101     │ Mandatory │ Completed │ 92%   │ 2   │
│ 2025-11-20 │ Leadership Essentials│ Elective  │ Completed │ 88%   │ 8   │
│ 2025-10-05 │ Cybersecurity Basics │ Mandatory │ Completed │ 95%   │ 4   │
└────────────┴──────────────────────┴───────────┴───────────┴───────┴─────┘

┌───────────────────────────────────────────────────────────────────────────┐
│ EXTERNAL TRAINING (from external_training_records)                        │
├───────────────────────────────────────────────────────────────────────────┤
│ Date       │ Training             │ Provider  │ Type      │ Cert? │ Hrs │
├────────────┼──────────────────────┼───────────┼───────────┼───────┼─────┤
│ 2025-09-15 │ AWS Solutions Arch   │ AWS       │ Certif.   │ Yes   │ 40  │
│ 2025-06-10 │ Agile Conference     │ AgileAlliance│ Conf.  │ No    │ 16  │
│ 2025-03-22 │ PMP Prep Course      │ PMI       │ Workshop  │ Yes   │ 35  │
└────────────┴──────────────────────┴───────────┴───────────┴───────┴─────┘

TOTAL TRAINING HOURS (2025): 105 hours
├── Internal LMS: 14 hours
└── External: 91 hours
          `}</pre>
        </CardContent>
      </Card>

      <Alert>
        <FileCheck className="h-4 w-4" />
        <AlertTitle>Certificate Expiry Tracking</AlertTitle>
        <AlertDescription>
          When certificate_expiry_date is set, the system automatically tracks expiration 
          and can generate recertification training requests. Configure reminder windows 
          (e.g., 90, 60, 30 days before expiry) in Compliance Settings to ensure timely 
          renewal of critical certifications.
        </AlertDescription>
      </Alert>
    </section>
  );
}
