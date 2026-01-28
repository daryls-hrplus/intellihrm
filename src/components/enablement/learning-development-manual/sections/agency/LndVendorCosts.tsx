import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Database, Calculator, TrendingDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndVendorCosts() {
  return (
    <section className="space-y-6" id="sec-3-6" data-manual-anchor="sec-3-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-emerald-600" />
          3.6 Cost Management & Budgets
        </h2>
        <p className="text-muted-foreground">
          Configure vendor course costs, track budget consumption, and manage multi-currency pricing.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure itemized cost breakdowns for vendor training</li>
            <li>Distinguish between per-person and fixed costs</li>
            <li>Handle multi-currency pricing</li>
            <li>Integrate costs with training budgets</li>
            <li>Track estimated vs. actual costs</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Field Reference: training_vendor_costs
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
                <TableCell className="font-mono text-sm">vendor_course_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="outline">Conditional</Badge></TableCell>
                <TableCell>Course-level cost (one of course/session required)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">vendor_session_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="outline">Conditional</Badge></TableCell>
                <TableCell>Session-specific cost (overrides course cost)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">cost_type</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>tuition | materials | travel | accommodation | certification_fee</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">description</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Cost item description</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">amount</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Cost amount</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">currency</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>ISO currency code (default: USD)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_per_person</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>True = per attendee, False = fixed total</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_included</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>True = included in base price (informational)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">notes</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Additional notes (e.g., volume discounts)</TableCell>
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
          <CardTitle>Cost Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cost Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Typical Pricing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Badge className="bg-blue-100 text-blue-800">tuition</Badge>
                </TableCell>
                <TableCell>Course registration/enrollment fee</TableCell>
                <TableCell>Per person, core cost</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800">materials</Badge>
                </TableCell>
                <TableCell>Books, workbooks, online access</TableCell>
                <TableCell>Per person or included</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge className="bg-orange-100 text-orange-800">travel</Badge>
                </TableCell>
                <TableCell>Transportation to/from training venue</TableCell>
                <TableCell>Per person, estimated</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge className="bg-purple-100 text-purple-800">accommodation</Badge>
                </TableCell>
                <TableCell>Hotel/lodging for multi-day training</TableCell>
                <TableCell>Per person per night</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge className="bg-red-100 text-red-800">certification_fee</Badge>
                </TableCell>
                <TableCell>Exam registration, credential fees</TableCell>
                <TableCell>Per person, often fixed</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cost Calculation Example
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
COST ESTIMATE: PMP Certification - 5 Attendees
══════════════════════════════════════════════

Course: PMP Certification Preparation
Vendor: PMI Authorized Training Partner
Session: March 14-18, 2026 (In-Person, New York)

┌────────────────────┬───────────┬──────────┬──────────────┬────────────┐
│ Cost Type          │ Amount    │ Per/Fixed│ Included?    │ Subtotal   │
├────────────────────┼───────────┼──────────┼──────────────┼────────────┤
│ Tuition            │ $2,500.00 │ Per      │ No           │ $12,500.00 │
│ Materials (PMBOK)  │ $75.00    │ Per      │ Yes          │ $0.00      │
│ Certification Exam │ $555.00   │ Per      │ No           │ $2,775.00  │
│ Travel (Airfare)   │ $450.00   │ Per      │ No           │ $2,250.00  │
│ Accommodation      │ $200/night│ Per      │ No           │ $4,000.00  │
│                    │           │ × 4 nights               │            │
├────────────────────┼───────────┼──────────┼──────────────┼────────────┤
│ TOTAL (5 people)   │           │          │              │ $21,525.00 │
│ Cost Per Person    │           │          │              │ $4,305.00  │
└────────────────────┴───────────┴──────────┴──────────────┴────────────┘

Notes:
• Materials included in tuition - shown for transparency
• Accommodation = $200/night × 4 nights × 5 people = $4,000
• Travel estimated - actual may vary by departure city
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Budget Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
BUDGET DEDUCTION WORKFLOW
═════════════════════════

Training Request Created
         │
         ▼
┌─────────────────────────┐
│ Calculate Total Cost    │
│ (from vendor_costs +    │
│  session.cost_per_person│
│  + estimated expenses)  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Check Department Budget │
│ (training_budgets table)│
└───────────┬─────────────┘
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
┌─────────┐  ┌─────────────┐
│ Budget  │  │ Insufficient│
│ OK      │  │ Budget      │
└────┬────┘  └──────┬──────┘
     │              │
     ▼              ▼
┌─────────┐  ┌─────────────┐
│ Request │  │ Escalate to │
│ Proceeds│  │ Manager/HR  │
└─────────┘  └─────────────┘

BUDGET FIELDS IN training_budgets:
├── allocated_amount: Annual budget allocation
├── spent_amount: Year-to-date spend
├── committed_amount: Approved but not yet spent
└── available_amount: allocated - spent - committed
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Multi-Currency Handling</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Common Use Cases</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>USD</TableCell>
                <TableCell>$</TableCell>
                <TableCell>US-based vendors, international certifications</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TTD</TableCell>
                <TableCell>TT$</TableCell>
                <TableCell>Trinidad & Tobago local vendors</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>JMD</TableCell>
                <TableCell>J$</TableCell>
                <TableCell>Jamaica local vendors</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>BBD</TableCell>
                <TableCell>Bds$</TableCell>
                <TableCell>Barbados local vendors</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>GHS</TableCell>
                <TableCell>GH₵</TableCell>
                <TableCell>Ghana local vendors</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>NGN</TableCell>
                <TableCell>₦</TableCell>
                <TableCell>Nigeria local vendors</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Note:</strong> Currency conversion for reporting uses rates from the 
            company's configured exchange rate table. Actual costs are recorded in original 
            currency; budget impact calculated using reporting currency.
          </p>
        </CardContent>
      </Card>

      {/* Training Budgets Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Field Reference: training_budgets
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
                <TableCell className="font-mono text-sm">department_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Department scope (null = company-wide)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">fiscal_year</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Budget year (e.g., 2026)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">allocated_amount</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Total annual budget allocation</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">spent_amount</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Year-to-date actual spend</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">committed_amount</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Approved but not yet spent</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">currency</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Budget currency (default: company currency)</TableCell>
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
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono mt-4">{`
BUDGET AVAILABILITY CALCULATION
═══════════════════════════════
available_amount = allocated_amount - spent_amount - committed_amount

EXAMPLE:
Allocated: $100,000
Spent:      $45,000  (completed training)
Committed:  $15,000  (approved requests)
─────────────────────
Available:  $40,000  (for new requests)
          `}</pre>
        </CardContent>
      </Card>

      {/* Volume Discounts Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Field Reference: vendor_volume_discounts
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
                <TableCell className="font-mono text-sm">id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>Primary key</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">vendor_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>FK to training_vendors</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">tier_name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell>Tier label (e.g., "Gold", "Enterprise")</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">min_enrollments</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell>Minimum enrollments for this tier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">max_enrollments</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell>Maximum enrollments (null = unlimited)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">discount_percentage</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell>Discount percent (e.g., 15.00 = 15%)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">effective_from</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Discount start date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">effective_to</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Discount end date (null = ongoing)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_active</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell>Whether tier is currently active</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Alert>
        <DollarSign className="h-4 w-4" />
        <AlertTitle>Cost Tracking Best Practice</AlertTitle>
        <AlertDescription>
          Track both estimated and actual costs. Estimated costs (from vendor_costs) are used 
          for budget approval. Actual costs (recorded in external_training_records.actual_cost) 
          should be captured post-training for variance analysis and future budgeting accuracy.
          Volume discounts are automatically applied when enrollment thresholds are met.
        </AlertDescription>
      </Alert>
    </section>
  );
}
