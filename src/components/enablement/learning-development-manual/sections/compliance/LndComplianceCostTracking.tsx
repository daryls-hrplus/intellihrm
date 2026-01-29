import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Calculator, TrendingUp, PieChart, BarChart3, AlertTriangle } from 'lucide-react';

export function LndComplianceCostTracking() {
  return (
    <section id="sec-5-25" data-manual-anchor="sec-5-25" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-500/10">
          <DollarSign className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.25 Compliance Cost Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Budget impact analysis, cost allocation, and ROI measurement
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Configure cost elements for compliance training programs</li>
            <li>Allocate training costs by department, regulation, and employee</li>
            <li>Calculate non-compliance cost exposure and risk-adjusted budgets</li>
            <li>Generate cost impact reports for executives and auditors</li>
            <li>Compare internal vs external training cost-effectiveness</li>
          </ul>
        </CardContent>
      </Card>

      {/* Cost Elements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Compliance Training Cost Elements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cost Category</TableHead>
                <TableHead>Components</TableHead>
                <TableHead>Calculation Method</TableHead>
                <TableHead>Tracking Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Direct Training Costs</TableCell>
                <TableCell>Course fees, instructor costs, materials</TableCell>
                <TableCell>Per-enrollment</TableCell>
                <TableCell>Assignment</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Lost Productivity</TableCell>
                <TableCell>Time spent in training × hourly rate</TableCell>
                <TableCell>Duration × comp rate</TableCell>
                <TableCell>Employee</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Travel & Logistics</TableCell>
                <TableCell>Venue, travel, accommodation for in-person</TableCell>
                <TableCell>Event-based</TableCell>
                <TableCell>Session</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Technology Costs</TableCell>
                <TableCell>LMS licensing, content hosting, mobile apps</TableCell>
                <TableCell>Prorated per user</TableCell>
                <TableCell>Company</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Administration</TableCell>
                <TableCell>HR/L&D time for compliance management</TableCell>
                <TableCell>FTE allocation %</TableCell>
                <TableCell>Department</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">External Certification</TableCell>
                <TableCell>Third-party exam fees, renewal costs</TableCell>
                <TableCell>Per-certification</TableCell>
                <TableCell>Employee</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Non-Compliance Cost */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Non-Compliance Cost Exposure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The system calculates potential financial exposure from non-compliance to help
            justify training investments and prioritize high-risk areas.
          </p>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk Category</TableHead>
                <TableHead>Potential Costs</TableHead>
                <TableHead>Calculation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Regulatory Fines</TableCell>
                <TableCell>OSHA penalties, labor board fines</TableCell>
                <TableCell>Fine schedule × violation probability</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Legal Liability</TableCell>
                <TableCell>Lawsuits, settlements, legal fees</TableCell>
                <TableCell>Historical claim data × exposure factor</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Operational Disruption</TableCell>
                <TableCell>Work stoppage, project delays</TableCell>
                <TableCell>Daily revenue × expected downtime</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Reputational Damage</TableCell>
                <TableCell>Customer loss, recruitment difficulty</TableCell>
                <TableCell>Estimated impact score</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Insurance Impact</TableCell>
                <TableCell>Premium increases, coverage denial</TableCell>
                <TableCell>Actuarial risk adjustment</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Database Schema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cost Tracking Data Model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`compliance_training_costs
├── id: UUID PK
├── company_id: UUID FK
├── compliance_training_id: UUID FK → compliance_training.id
├── assignment_id: UUID FK → compliance_training_assignments.id (nullable)
├── cost_category: TEXT ('direct' | 'productivity' | 'travel' | 'technology' | 'admin' | 'certification')
├── amount: DECIMAL(12,2) NOT NULL
├── currency: TEXT DEFAULT 'USD'
├── cost_date: DATE NOT NULL
├── fiscal_period: TEXT (e.g., '2026-Q1')
├── cost_center_id: UUID FK → cost_centers.id
├── department_id: UUID FK → departments.id
├── employee_id: UUID FK → profiles.id (nullable for aggregate costs)
├── regulatory_body: TEXT (e.g., 'OSHA', 'GDPR')
├── external_vendor_id: UUID FK (nullable)
├── invoice_reference: TEXT
├── notes: TEXT
├── created_by: UUID FK → profiles.id
├── created_at: TIMESTAMPTZ DEFAULT now()
└── metadata: JSONB DEFAULT '{}'

compliance_cost_budgets
├── id: UUID PK
├── company_id: UUID FK
├── fiscal_year: INT NOT NULL
├── department_id: UUID FK → departments.id (nullable for company-wide)
├── regulatory_body: TEXT (nullable for all regulations)
├── budget_amount: DECIMAL(12,2) NOT NULL
├── currency: TEXT DEFAULT 'USD'
├── spent_to_date: DECIMAL(12,2) DEFAULT 0
├── forecasted_spend: DECIMAL(12,2)
├── variance: DECIMAL(12,2) GENERATED ALWAYS AS (budget_amount - spent_to_date) STORED
├── created_at: TIMESTAMPTZ DEFAULT now()
└── updated_at: TIMESTAMPTZ DEFAULT now()

non_compliance_exposure
├── id: UUID PK
├── company_id: UUID FK
├── compliance_training_id: UUID FK
├── exposure_category: TEXT ('fine' | 'legal' | 'operational' | 'reputational' | 'insurance')
├── estimated_low: DECIMAL(12,2)
├── estimated_high: DECIMAL(12,2)
├── probability_percent: INT
├── risk_adjusted_value: DECIMAL(12,2) GENERATED ALWAYS AS 
│     ((estimated_low + estimated_high) / 2 * probability_percent / 100) STORED
├── regulatory_reference: TEXT
├── last_reviewed: DATE
├── reviewed_by: UUID FK → profiles.id
└── notes: TEXT

-- View: Cost vs Exposure Analysis
CREATE VIEW compliance_cost_roi AS
SELECT 
  ct.id,
  ct.name,
  ct.regulatory_body,
  COALESCE(SUM(ctc.amount), 0) as total_training_cost,
  COALESCE(SUM(nce.risk_adjusted_value), 0) as risk_exposure,
  CASE 
    WHEN SUM(ctc.amount) > 0 
    THEN SUM(nce.risk_adjusted_value) / SUM(ctc.amount)
    ELSE 0 
  END as roi_ratio
FROM compliance_training ct
LEFT JOIN compliance_training_costs ctc ON ct.id = ctc.compliance_training_id
LEFT JOIN non_compliance_exposure nce ON ct.id = nce.compliance_training_id
GROUP BY ct.id, ct.name, ct.regulatory_body;`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Executive Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Cost Analysis Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Key Metrics</TableHead>
                <TableHead>Frequency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Compliance Budget Summary</TableCell>
                <TableCell>CFO, L&D Director</TableCell>
                <TableCell>Budget vs actual, variance, forecast</TableCell>
                <TableCell>Monthly</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cost per Employee</TableCell>
                <TableCell>HR, Finance</TableCell>
                <TableCell>Average training cost by role/department</TableCell>
                <TableCell>Quarterly</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Regulatory Cost Breakdown</TableCell>
                <TableCell>Compliance Officer</TableCell>
                <TableCell>Spend by regulation (OSHA, GDPR, etc.)</TableCell>
                <TableCell>Annual</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Risk Exposure vs Investment</TableCell>
                <TableCell>Executive, Audit</TableCell>
                <TableCell>ROI ratio, risk reduction achieved</TableCell>
                <TableCell>Annual</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Vendor Cost Comparison</TableCell>
                <TableCell>Procurement, L&D</TableCell>
                <TableCell>Internal vs external cost-effectiveness</TableCell>
                <TableCell>As needed</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Budget Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Budget Monitoring & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-600">Warning</Badge>
                <span className="font-medium">75% Budget Utilization</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Alert when department compliance training spend reaches 75% of annual budget.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Critical</Badge>
                <span className="font-medium">90% Budget Utilization</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Escalate to L&D Director and Finance when approaching budget ceiling.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-600">Forecast</Badge>
                <span className="font-medium">Projected Overrun</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Proactive alert when current run rate projects budget overrun by fiscal year end.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">UI Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg bg-muted/30">
              <p className="font-medium text-sm">Cost Entry</p>
              <code className="text-xs text-muted-foreground">
                Training → Compliance Training → Requirements → [Requirement] → Costs tab → Add Cost
              </code>
            </div>
            <div className="p-3 border rounded-lg bg-muted/30">
              <p className="font-medium text-sm">Budget Configuration</p>
              <code className="text-xs text-muted-foreground">
                Admin → L&D Settings → Compliance Budgets → [Add/Edit Budget]
              </code>
            </div>
            <div className="p-3 border rounded-lg bg-muted/30">
              <p className="font-medium text-sm">Cost Reports</p>
              <code className="text-xs text-muted-foreground">
                Training → Compliance Training → Executive Dashboard → Cost Analysis section
              </code>
            </div>
            <div className="p-3 border rounded-lg bg-muted/30">
              <p className="font-medium text-sm">Risk Exposure Setup</p>
              <code className="text-xs text-muted-foreground">
                Training → Compliance Training → Escalation Rules → Risk Exposure tab
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
