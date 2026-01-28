import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserMinus, AlertTriangle, CheckCircle, Archive, FileText, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndVendorOffboarding() {
  return (
    <section className="space-y-6" id="sec-3-16" data-manual-anchor="sec-3-16">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <UserMinus className="h-6 w-6 text-emerald-600" />
          3.16 Vendor Offboarding
        </h2>
        <p className="text-muted-foreground">
          Manage vendor relationship termination including contract closure, data retention,
          historical record preservation, and knowledge transfer to replacement vendors.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Identify offboarding triggers and criteria</li>
            <li>Execute vendor deactivation process</li>
            <li>Manage pending enrollments and sessions</li>
            <li>Preserve historical training records</li>
            <li>Transfer knowledge to replacement vendors</li>
            <li>Maintain compliance with data retention policies</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Offboarding Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trigger</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Lead Time</TableHead>
                <TableHead>Approval Required</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="outline">Contract End</Badge></TableCell>
                <TableCell>Contract expires without renewal</TableCell>
                <TableCell>90 days</TableCell>
                <TableCell>L&D Manager</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-red-100 text-red-800">Performance</Badge></TableCell>
                <TableCell>Consistent poor performance (score &lt; 50)</TableCell>
                <TableCell>30 days</TableCell>
                <TableCell>HR Director + L&D Manager</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-orange-100 text-orange-800">Business Decision</Badge></TableCell>
                <TableCell>Strategic change, budget cuts, consolidation</TableCell>
                <TableCell>60 days</TableCell>
                <TableCell>VP/Director</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="destructive">Compliance</Badge></TableCell>
                <TableCell>Regulatory violation, license revoked</TableCell>
                <TableCell>Immediate</TableCell>
                <TableCell>Legal + HR Director</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-purple-100 text-purple-800">Vendor Request</Badge></TableCell>
                <TableCell>Vendor discontinues service</TableCell>
                <TableCell>Per contract</TableCell>
                <TableCell>L&D Manager</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Offboarding Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
VENDOR OFFBOARDING PROCESS
══════════════════════════

Offboarding Decision Made
         │
         ▼
┌─────────────────────────────┐
│ 1. APPROVAL & DOCUMENTATION │
│ ─────────────────────────── │
│ • Obtain required approvals │
│ • Document reason for exit  │
│ • Set target end date       │
│ • Notify vendor formally    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ 2. PENDING COMMITMENTS      │
│ ─────────────────────────── │
│ • Review pending requests   │
│ • Cancel future sessions    │
│ • Migrate in-progress to    │
│   alternative vendor        │
│ • Process refunds if due    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ 3. KNOWLEDGE TRANSFER       │
│ ─────────────────────────── │
│ • Map courses to alternates │
│ • Update competency links   │
│ • Transfer course materials │
│   (if owned/licensed)       │
│ • Document specialized info │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ 4. DATA RETENTION           │
│ ─────────────────────────── │
│ • Archive vendor profile    │
│ • Preserve training records │
│ • Maintain audit trail      │
│ • Remove from active lists  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ 5. DEACTIVATION             │
│ ─────────────────────────── │
│ • Set is_active = false     │
│ • Set terminated_at         │
│ • Set termination_reason    │
│ • Final contract settlement │
└─────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Enrollment Handling</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enrollment Status</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Employee Communication</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="outline">registered</Badge></TableCell>
                <TableCell>Cancel and offer alternative</TableCell>
                <TableCell>Email with alternative options</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-blue-100 text-blue-800">confirmed</Badge></TableCell>
                <TableCell>Cancel with priority re-enrollment</TableCell>
                <TableCell>Personal call + email</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-yellow-100 text-yellow-800">waitlisted</Badge></TableCell>
                <TableCell>Cancel and redirect to alternative</TableCell>
                <TableCell>Email notification</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-green-100 text-green-800">in_progress</Badge></TableCell>
                <TableCell>Complete if possible, else transfer</TableCell>
                <TableCell>Direct contact by L&D</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Data Retention Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data Type</TableHead>
                <TableHead>Retention Period</TableHead>
                <TableHead>Storage Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Vendor Profile</TableCell>
                <TableCell>Permanent (archived)</TableCell>
                <TableCell>training_vendors (is_active=false)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Training Records</TableCell>
                <TableCell>7 years (regulatory)</TableCell>
                <TableCell>external_training_records</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Certificates Issued</TableCell>
                <TableCell>Permanent</TableCell>
                <TableCell>external_training_records</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Session History</TableCell>
                <TableCell>7 years</TableCell>
                <TableCell>training_vendor_sessions</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Performance Reviews</TableCell>
                <TableCell>5 years</TableCell>
                <TableCell>training_vendor_reviews</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Contract Documents</TableCell>
                <TableCell>Contract term + 7 years</TableCell>
                <TableCell>Document storage</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Financial Transactions</TableCell>
                <TableCell>7 years</TableCell>
                <TableCell>training_vendor_costs + accounting</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Offboarding Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Approval Documentation</p>
                <p className="text-sm text-muted-foreground">Written approval from required stakeholders with reason documented</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Vendor Notification</p>
                <p className="text-sm text-muted-foreground">Formal notice sent per contract terms</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Pending Session Review</p>
                <p className="text-sm text-muted-foreground">All future sessions cancelled or transferred</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Employee Communications</p>
                <p className="text-sm text-muted-foreground">All affected employees notified with alternatives</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Course Mapping Update</p>
                <p className="text-sm text-muted-foreground">Competency-course mappings redirected to alternatives</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Financial Settlement</p>
                <p className="text-sm text-muted-foreground">Outstanding invoices paid, refunds processed</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Materials Return/Archive</p>
                <p className="text-sm text-muted-foreground">Licensed materials returned or archived per agreement</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">System Deactivation</p>
                <p className="text-sm text-muted-foreground">Vendor marked inactive, removed from active catalogs</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Knowledge Transfer Complete</p>
                <p className="text-sm text-muted-foreground">Handover notes documented for replacement vendor</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Record After Deactivation</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
DEACTIVATED VENDOR RECORD
═════════════════════════

training_vendors:
├── id: "abc-123-..."
├── vendor_name: "TechSkills Academy"
├── is_active: FALSE ← Hidden from active lists
├── status: "terminated"
├── terminated_at: "2026-03-31T00:00:00Z"
├── termination_reason: "contract_end"
├── termination_notes: "Contract not renewed due to budget..."
└── ... (all other fields preserved)

VISIBILITY RULES:
├── Active Vendor Lists: Hidden
├── Course Catalog: Hidden (vendor courses not shown)
├── Training Request Form: Not selectable
├── Historical Reports: Visible (with "Inactive" label)
├── Employee Training History: Visible (records preserved)
└── Compliance Reports: Visible (audit trail maintained)
          `}</pre>
        </CardContent>
      </Card>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Compliance Warning</AlertTitle>
        <AlertDescription>
          Never delete vendor records or associated training history. Regulatory requirements 
          mandate retention of training records for 7+ years in most jurisdictions. Vendor 
          deactivation archives the relationship while preserving all historical data for 
          compliance audits and employee career records.
        </AlertDescription>
      </Alert>
    </section>
  );
}
