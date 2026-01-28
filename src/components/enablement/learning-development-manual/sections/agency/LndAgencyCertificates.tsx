import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Award, Clock, RefreshCw } from 'lucide-react';

export function LndAgencyCertificates() {
  return (
    <section className="space-y-6" id="sec-3-6" data-manual-anchor="sec-3-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">3.6 Agency Certificates</h2>
        <p className="text-muted-foreground">
          Track and manage industry certifications earned through external training agencies.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Record external certifications with credential details</li>
            <li>Configure certification expiry and renewal tracking</li>
            <li>Link certifications to employee profiles</li>
            <li>Set up recertification reminders</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Certificate Configuration Fields</CardTitle>
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
                <TableCell className="font-mono text-sm">certification_name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Official credential name</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">issuing_body</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Certifying organization (PMI, Cisco, etc.)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">credential_id</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>External certificate/credential number</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">valid_from</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Certification issue date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">valid_until</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Expiration date (null = no expiry)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">recertification_required</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Requires periodic renewal</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">recertification_months</TableCell>
                <TableCell>Number</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Renewal cycle (e.g., 36 months)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">verification_url</TableCell>
                <TableCell>URL</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Link to verify credential</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Common Industry Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certification</TableHead>
                <TableHead>Issuing Body</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Renewal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">PMP</TableCell>
                <TableCell>Project Management Institute</TableCell>
                <TableCell>3 years</TableCell>
                <TableCell>60 PDUs required</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">CISSP</TableCell>
                <TableCell>(ISC)²</TableCell>
                <TableCell>3 years</TableCell>
                <TableCell>40 CPE credits/year</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">AWS Solutions Architect</TableCell>
                <TableCell>Amazon Web Services</TableCell>
                <TableCell>3 years</TableCell>
                <TableCell>Recertification exam</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">CCNA</TableCell>
                <TableCell>Cisco</TableCell>
                <TableCell>3 years</TableCell>
                <TableCell>Exam or CE credits</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">SHRM-CP/SCP</TableCell>
                <TableCell>SHRM</TableCell>
                <TableCell>3 years</TableCell>
                <TableCell>60 PDCs required</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Recertification Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Certificate Expiry Timeline
────────────────────────────────────────────────────────────

│←── Active Period (e.g., 3 years) ──→│←─ Grace Period ─→│
│                                      │                   │
├──────────────────────────────────────┼───────────────────┤
Issue Date                          Expiry           Lapse
                                      │
                                      │
                         ┌────────────┴────────────┐
                         │    Reminder Triggers    │
                         ├─────────────────────────┤
                         │ 90 days: First reminder │
                         │ 60 days: Escalation     │
                         │ 30 days: Final warning  │
                         │ 0 days: Status → Expired│
                         └─────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}
