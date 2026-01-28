import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  TrendingUp, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  UserCheck,
  DollarSign,
  Calendar
} from 'lucide-react';

export function LndWorkflowBehavioralImpact() {
  return (
    <section className="space-y-6" id="sec-4-15" data-manual-anchor="sec-4-15">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-green-600" />
          4.15 Behavioral Impact Surveys (Kirkpatrick L3-L4)
        </h2>
        <p className="text-muted-foreground">
          Measure long-term training impact through behavior change assessments 
          (Level 3) and business results tracking (Level 4).
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure delayed behavioral impact surveys</li>
            <li>Collect manager observations on behavior change</li>
            <li>Link training outcomes to business metrics</li>
            <li>Calculate training ROI using Level 4 data</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Kirkpatrick Levels 3-4 Framework</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    KIRKPATRICK LEVELS 3-4 EVALUATION                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Level 3: BEHAVIOR (Measured 30-90 Days After)                                  │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                  │
│   "Are learners applying what they learned on the job?"                          │
│                                                                                  │
│   Data Sources:                                                                  │
│   ├── Learner Self-Assessment                                                    │
│   │   "How often do you apply [skill] in your daily work?"                       │
│   │   Scale: Never → Sometimes → Often → Always                                  │
│   │                                                                              │
│   ├── Manager Observation                                                        │
│   │   "Have you observed [employee] applying [skill]?"                           │
│   │   Evidence examples required                                                 │
│   │                                                                              │
│   └── Peer Feedback (360°)                                                       │
│       "Has [employee]'s [skill area] improved?"                                  │
│                                                                                  │
│   Timing: 30, 60, 90 days post-completion                                        │
│   ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│   Level 4: RESULTS (Measured 6-12 Months After)                                  │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                   │
│   "What business impact resulted from the training?"                             │
│                                                                                  │
│   Metrics Categories:                                                            │
│   ├── Productivity: Output per employee, cycle time                              │
│   ├── Quality: Error rates, customer satisfaction                                │
│   ├── Safety: Incident rates, near-misses                                        │
│   ├── Revenue: Sales performance, conversion rates                               │
│   └── Cost: Waste reduction, efficiency gains                                    │
│                                                                                  │
│   Timing: 6-month and 12-month post-completion                                   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Manager Impact Survey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Managers receive automated surveys 30-90 days after their direct reports 
              complete training, asking for observable behavior change evidence.
            </p>

            <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Manager Survey for: John Doe's "Conflict Resolution" Training
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Training Completed: 45 days ago

Q1: Have you observed John applying conflict resolution techniques?
    ○ Not yet observed  ○ Occasionally  ● Frequently  ○ Consistently

Q2: Please provide a specific example of behavior change:
    ┌────────────────────────────────────────────────────────────────┐
    │ Last week, John facilitated a disagreement between two team   │
    │ members using the "active listening" framework from the       │
    │ course. He helped them reach a mutual agreement without       │
    │ escalation to HR.                                             │
    └────────────────────────────────────────────────────────────────┘

Q3: What barriers (if any) are preventing full application?
    ☑ Time constraints  ☐ Lack of opportunity  ☐ Need more practice
    ☐ Unsupportive environment  ☐ Other: ___________

Q4: Would you recommend this training for other team members?
    ○ No  ● Yes  ○ Already enrolled

[Submit Observation]
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            ROI Calculation Framework
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Training ROI Calculation (Level 4):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Formula:
ROI% = ((Monetary Benefits - Training Costs) / Training Costs) × 100

Example: Sales Training Program
─────────────────────────────────

Training Costs:
├── Development costs:        $25,000
├── Delivery costs:           $15,000
├── Employee time (50 ppl):   $30,000
└── Total Investment:         $70,000

Measured Benefits (6 months post):
├── Revenue increase:         $180,000  (attributed to training)
├── Reduced turnover savings: $45,000   (2 fewer departures)
├── Efficiency gains:         $25,000   (process improvement)
└── Total Benefits:           $250,000

ROI Calculation:
ROI = (($250,000 - $70,000) / $70,000) × 100
ROI = 257%

Confidence Adjustment:
├── Attribution factor: 60% (training vs other factors)
├── Adjusted Benefits: $150,000
└── Adjusted ROI: 114%
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Evaluation Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timing</TableHead>
                <TableHead>Evaluation Type</TableHead>
                <TableHead>Respondent</TableHead>
                <TableHead>Auto-Triggered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Immediately</TableCell>
                <TableCell>Level 1 - Reaction</TableCell>
                <TableCell>Learner</TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">Yes</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>End of course</TableCell>
                <TableCell>Level 2 - Learning</TableCell>
                <TableCell>Quiz/Assessment</TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">Yes</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>30 days</TableCell>
                <TableCell>Level 3 - Behavior (Self)</TableCell>
                <TableCell>Learner</TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">Yes</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>45 days</TableCell>
                <TableCell>Level 3 - Behavior (Manager)</TableCell>
                <TableCell>Direct Manager</TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">Yes</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>90 days</TableCell>
                <TableCell>Level 3 - Follow-up</TableCell>
                <TableCell>Learner + Manager</TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">Yes</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>6 months</TableCell>
                <TableCell>Level 4 - Results</TableCell>
                <TableCell>HR/Business Analyst</TableCell>
                <TableCell><Badge variant="outline">Manual</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>12 months</TableCell>
                <TableCell>Level 4 - ROI</TableCell>
                <TableCell>Finance/L&D Leader</TableCell>
                <TableCell><Badge variant="outline">Manual</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Business Rules</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Level 3 surveys are optional but strongly recommended for leadership programs</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Manager observations require at least one specific behavioral example</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Level 4 metrics must be defined before training begins (baseline required)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Attribution adjustments should be made for external factors</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Control groups recommended for high-investment programs</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Phillips ROI Methodology</AlertTitle>
        <AlertDescription>
          For Level 4 calculations, we recommend the Phillips ROI Methodology which 
          adds a fifth level (ROI) with isolation techniques and conservative 
          adjustments. This approach is accepted by CFOs for training investment decisions.
        </AlertDescription>
      </Alert>
    </section>
  );
}
