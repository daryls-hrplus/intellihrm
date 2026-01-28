import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Database, Settings } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndVendorRegistry() {
  return (
    <section className="space-y-6" id="sec-3-2" data-manual-anchor="sec-3-2">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-emerald-600" />
          3.2 Vendor Registry & Classification
        </h2>
        <p className="text-muted-foreground">
          Create and manage the enterprise vendor registry with tiered classification and lifecycle status tracking.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Create vendor profiles with complete contact and contract information</li>
            <li>Apply vendor type classification (Strategic/Operational/Transactional)</li>
            <li>Configure preferred vendor status and designation criteria</li>
            <li>Manage vendor lifecycle status transitions</li>
            <li>Set up performance review schedules</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Field Reference: training_vendors
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
                <TableCell>Primary key, auto-generated</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">company_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Company scope (multi-tenant)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">code</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Unique vendor code (e.g., "VENDOR-001")</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Vendor display name</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">description</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Vendor description and capabilities</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">vendor_type</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>strategic | operational | transactional</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">website_url</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Vendor website URL</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">contact_name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Primary contact person</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">contact_email</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Primary contact email</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">contact_phone</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Primary contact phone</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">address</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Vendor physical address</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">specializations</TableCell>
                <TableCell>Text[]</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Array of specialization areas</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">accreditations</TableCell>
                <TableCell>Text[]</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Array of accreditations held</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_preferred</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Preferred vendor designation (default: false)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">contract_start_date</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Contract effective date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">contract_end_date</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Contract expiration date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">contract_value</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Total contract value</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">payment_terms</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Payment terms (e.g., "Net 30")</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">performance_score</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Composite score 0-100 from reviews</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">last_review_date</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Date of last performance review</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">next_review_date</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Scheduled next review date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">status</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>active | under_review | suspended | terminated</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">notes</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Internal notes and comments</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">created_by</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>User who created the record</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">created_at</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell><Badge variant="destructive">Auto</Badge></TableCell>
                <TableCell>Record creation timestamp</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Step-by-Step: Creating a Vendor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Badge className="shrink-0">1</Badge>
              <div>
                <p className="font-medium">Navigate to Vendor Management</p>
                <p className="text-sm text-muted-foreground">Training → Vendors (or Admin → L&D → Vendor Management)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">2</Badge>
              <div>
                <p className="font-medium">Click "Add Vendor" button</p>
                <p className="text-sm text-muted-foreground">Opens the new vendor form dialog</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">3</Badge>
              <div>
                <p className="font-medium">Enter Basic Information</p>
                <ul className="text-sm text-muted-foreground list-disc pl-4">
                  <li>Vendor Code: Unique identifier (e.g., "PMI-001")</li>
                  <li>Vendor Name: Display name (e.g., "Project Management Institute")</li>
                  <li>Description: Capabilities overview</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">4</Badge>
              <div>
                <p className="font-medium">Select Vendor Type</p>
                <ul className="text-sm text-muted-foreground list-disc pl-4">
                  <li><strong>Strategic</strong>: High spend, multi-year, executive sponsor</li>
                  <li><strong>Operational</strong>: Standard monitoring, L&D owner</li>
                  <li><strong>Transactional</strong>: Low spend, automated tracking</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">5</Badge>
              <div>
                <p className="font-medium">Add Contact Information</p>
                <p className="text-sm text-muted-foreground">Primary contact name, email, phone, and address</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">6</Badge>
              <div>
                <p className="font-medium">Configure Specializations & Accreditations</p>
                <p className="text-sm text-muted-foreground">Add tags for training areas (e.g., "Project Management", "Leadership")</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">7</Badge>
              <div>
                <p className="font-medium">Set Contract Details (if applicable)</p>
                <p className="text-sm text-muted-foreground">Start/end dates, contract value, payment terms</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">8</Badge>
              <div>
                <p className="font-medium">Save Vendor</p>
                <p className="text-sm text-muted-foreground">Vendor is created with status "active"</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Status Lifecycle</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
VENDOR STATUS TRANSITIONS
═════════════════════════

                    ┌─────────────┐
         ──────────▶│   ACTIVE    │◀──────────
        │           └──────┬──────┘           │
        │                  │                  │
        │ Reinstate        │ Review Triggered │ Issue Resolved
        │                  ▼                  │
        │           ┌─────────────┐           │
        │           │UNDER_REVIEW │───────────┤
        │           └──────┬──────┘           │
        │                  │                  │
        │                  │ Issues Found     │
        │                  ▼                  │
        │           ┌─────────────┐           │
        └───────────│  SUSPENDED  │───────────┘
                    └──────┬──────┘
                           │
                           │ Contract End / Termination
                           ▼
                    ┌─────────────┐
                    │ TERMINATED  │
                    └─────────────┘

STATUS DEFINITIONS:
├── ACTIVE: Vendor available for new training requests
├── UNDER_REVIEW: Performance or compliance review in progress
├── SUSPENDED: Temporarily unavailable, pending resolution
└── TERMINATED: Contract ended, historical records retained
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferred Vendor Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Criterion</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Weight</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Performance Score</TableCell>
                <TableCell>≥ 85/100</TableCell>
                <TableCell>30%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Active Contract</TableCell>
                <TableCell>Must have valid contract</TableCell>
                <TableCell>Required</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Learner Satisfaction</TableCell>
                <TableCell>≥ 4.0/5.0 average</TableCell>
                <TableCell>25%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Completion Rate</TableCell>
                <TableCell>≥ 90%</TableCell>
                <TableCell>20%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Cost Effectiveness</TableCell>
                <TableCell>Below market average</TableCell>
                <TableCell>15%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Responsiveness</TableCell>
                <TableCell>≤ 24hr response time</TableCell>
                <TableCell>10%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertTitle>Best Practice: Vendor Consolidation</AlertTitle>
        <AlertDescription>
          Maintain a curated panel of 10-15 preferred vendors to balance specialization 
          coverage with volume discount negotiation power. Review vendor panel annually 
          and sunset underperforming vendors to maintain quality standards.
        </AlertDescription>
      </Alert>
    </section>
  );
}
