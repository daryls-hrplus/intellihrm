import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calculator } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndAgencyCourseCosts() {
  return (
    <section className="space-y-6" id="sec-3-5" data-manual-anchor="sec-3-5">
      <div>
        <h2 className="text-2xl font-bold mb-2">3.5 Course Costs</h2>
        <p className="text-muted-foreground">
          Configure pricing structures, currency handling, and budget integration for agency training.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Set up course pricing with multiple cost components</li>
            <li>Configure multi-currency support for regional pricing</li>
            <li>Understand cost types: registration, materials, travel</li>
            <li>Link costs to departmental budget tracking</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Field Reference: Course Cost Fields</CardTitle>
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
                <TableCell className="font-mono text-sm">base_cost</TableCell>
                <TableCell>Decimal</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Course registration fee</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">materials_cost</TableCell>
                <TableCell>Decimal</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Books, manuals, lab kits</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">exam_cost</TableCell>
                <TableCell>Decimal</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Certification exam fee</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">currency</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>ISO currency code (USD, EUR, GBP, JMD, TTD)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">early_bird_discount</TableCell>
                <TableCell>Decimal</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Percentage discount for early registration</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">group_discount_threshold</TableCell>
                <TableCell>Number</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Minimum attendees for group rate</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">group_discount_percent</TableCell>
                <TableCell>Decimal</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Group discount percentage</TableCell>
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
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-3">PMP Certification Course</h4>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Base Registration</TableCell>
                  <TableCell className="text-right">$2,500.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Materials (PMI Guide + Workbook)</TableCell>
                  <TableCell className="text-right">$150.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>PMP Exam Fee</TableCell>
                  <TableCell className="text-right">$555.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Subtotal</TableCell>
                  <TableCell className="text-right font-semibold">$3,205.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-green-600">Early Bird Discount (10%)</TableCell>
                  <TableCell className="text-right text-green-600">-$250.00</TableCell>
                </TableRow>
                <TableRow className="border-t-2">
                  <TableCell className="font-bold">Total Per Employee</TableCell>
                  <TableCell className="text-right font-bold">$2,955.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            When a training request is approved, costs are automatically deducted from the 
            appropriate departmental budget:
          </p>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
training_request.approved
    │
    ▼
┌──────────────────────────────────────┐
│         Check Budget Available        │
│   training_budgets.remaining_amount   │
└──────────────────┬───────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
   [Sufficient]          [Insufficient]
        │                     │
        ▼                     ▼
┌──────────────┐     ┌──────────────────┐
│ Deduct Cost  │     │ Escalate to HR   │
│ Update spent │     │ for budget review│
└──────────────┘     └──────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Alert>
        <DollarSign className="h-4 w-4" />
        <AlertTitle>Multi-Currency Handling</AlertTitle>
        <AlertDescription>
          Costs are stored in the agency's local currency. When displaying to users or 
          calculating budget impact, the system converts using configured exchange rates 
          to the employee's company base currency.
        </AlertDescription>
      </Alert>
    </section>
  );
}
