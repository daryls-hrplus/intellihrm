import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { 
  LearningObjectives,
  StepByStep,
  TipCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  WarningCallout,
  type Step
} from '../../../manual/components';

const budgetSetupSteps: Step[] = [
  {
    title: "Access Position Budgeting",
    description: "Navigate to Workforce → Positions or Workforce Planning → Headcount Budget",
    expectedResult: "Position list or budget planning interface displays"
  },
  {
    title: "Set Authorized Headcount",
    description: "For each position, define the authorized number of employees",
    substeps: [
      "Review current filled count vs. authorized",
      "Update authorized headcount based on approved budget",
      "Consider seasonal or project-based variations"
    ],
    expectedResult: "Headcount limits are established per position"
  },
  {
    title: "Link Compensation",
    description: "Ensure positions have appropriate compensation settings",
    substeps: [
      "Assign salary grade or pay spine",
      "Set min/max spinal points if using pay spine",
      "Configure entry point for new hires"
    ],
    expectedResult: "Cost can be calculated for each position"
  },
  {
    title: "Review Budget Impact",
    description: "Analyze the financial impact of headcount decisions",
    expectedResult: "Total salary cost is visible for planning purposes"
  }
];

const varianceTrackingSteps: Step[] = [
  {
    title: "View Headcount Report",
    description: "Navigate to Reports → Workforce → Headcount Analysis",
    expectedResult: "Headcount report with authorized vs. actual displays"
  },
  {
    title: "Identify Variances",
    description: "Review positions where actual differs from authorized",
    substeps: [
      "Over: More employees than authorized (red flag)",
      "Under: Vacancies to be filled (recruitment need)",
      "On Target: Filled to authorized level"
    ],
    expectedResult: "Variance issues are identified"
  },
  {
    title: "Analyze Trends",
    description: "Review historical headcount trends by department/company",
    expectedResult: "Patterns inform future budget planning"
  },
  {
    title: "Take Action",
    description: "Address variances through appropriate channels",
    substeps: [
      "Over-budget: Review for transfers, reorganization, or budget amendment",
      "Under-budget: Initiate recruitment or reallocate budget"
    ],
    expectedResult: "Variances are addressed or documented"
  }
];

const budgetMetrics = [
  { metric: 'Authorized FTE', description: 'Total approved full-time equivalent positions' },
  { metric: 'Filled FTE', description: 'Positions currently occupied by active employees' },
  { metric: 'Vacancy Rate', description: 'Percentage of positions currently unfilled' },
  { metric: 'Budget Utilization', description: 'Actual salary spend vs. budgeted amount' },
  { metric: 'Overage Count', description: 'Positions exceeding authorized headcount' },
  { metric: 'Pending Hires', description: 'Approved positions in active recruitment' },
];

export function JobArchitectureBudgeting() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Configure headcount budgets at the position level",
          "Track authorized vs. actual headcount",
          "Analyze budget variances and take corrective action",
          "Understand FTE planning and budget accountability"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Position Budgeting Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Position Budgeting connects workforce planning to financial accountability. 
            Each position has an authorized headcount that represents the approved 
            budget for that role. Tracking actual vs. authorized enables governance 
            and cost control.
          </p>
          
          <div className="grid gap-3 md:grid-cols-2">
            {budgetMetrics.map((item) => (
              <div key={item.metric} className="flex items-center gap-3 p-3 rounded-lg border">
                <Badge variant="outline" className="text-xs">{item.metric}</Badge>
                <span className="text-sm text-muted-foreground">{item.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Setting Up Position Budgets"
        steps={budgetSetupSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 3.8.1: Position list showing authorized headcount and filled count"
        alt="Positions table with columns for title, department, authorized, filled, and variance"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            FTE Calculation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Full-Time Equivalent (FTE) standardizes headcount across different 
            work arrangements:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <h5 className="font-medium mb-2">FTE Calculation</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Full-time (40 hrs/week) = 1.0 FTE</li>
                <li>• Part-time (20 hrs/week) = 0.5 FTE</li>
                <li>• Contract (varies) = based on scheduled hours</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h5 className="font-medium mb-2">Budget Impact</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Salary budget is pro-rated by FTE</li>
                <li>• Benefits may vary by FTE threshold</li>
                <li>• Headcount reports show both head count and FTE</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Tracking Headcount Variance"
        steps={varianceTrackingSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 3.8.2: Headcount variance report showing over/under positions"
        alt="Variance report with department breakdown and status indicators"
        aspectRatio="wide"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Budget Planning Cycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Position budgeting typically follows an annual cycle aligned with 
            fiscal planning:
          </p>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border-l-4 border-l-primary bg-muted/30">
              <h5 className="font-medium">Q3: Planning Phase</h5>
              <p className="text-sm text-muted-foreground">
                Departments submit headcount requests for the upcoming year.
              </p>
            </div>
            <div className="p-3 rounded-lg border-l-4 border-l-primary bg-muted/30">
              <h5 className="font-medium">Q4: Approval Phase</h5>
              <p className="text-sm text-muted-foreground">
                Finance and HR review, negotiate, and finalize authorized headcount.
              </p>
            </div>
            <div className="p-3 rounded-lg border-l-4 border-l-primary bg-muted/30">
              <h5 className="font-medium">Q1-Q4: Execution & Monitoring</h5>
              <p className="text-sm text-muted-foreground">
                Track actuals against budget; process amendment requests as needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <WarningCallout title="Budget Overage Alerts">
        When actual headcount exceeds authorized, the system generates alerts visible 
        in the HR dashboard and headcount reports. Continued overage should trigger 
        a budget amendment request or reorganization plan.
      </WarningCallout>

      <InfoCallout title="Workforce Planning Integration">
        Position budgeting data feeds into the Workforce Planning module where 
        scenario modeling and future-state planning can be performed.
      </InfoCallout>

      <TipCallout title="Budget Accountability">
        Assign budget owners to each department who are accountable for staying 
        within authorized headcount. Include headcount variance in manager 
        performance reviews for governance.
      </TipCallout>
    </div>
  );
}
