import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, TrendingUp, BarChart3, Users, ArrowRight,
  CheckCircle, AlertCircle, Target
} from 'lucide-react';
import { FeatureCard } from '@/components/enablement/manual/components/FeatureCard';
import { InfoCallout, TipCallout, WarningCallout, IntegrationCallout } from '@/components/enablement/manual/components/Callout';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

const compensationFlowDiagram = `
graph LR
    subgraph WORKFORCE["Workforce Data"]
        POS[Position]
        GRADE[Job Grade]
        EMP[Employee Salary]
        PERF[Performance Rating]
    end
    
    subgraph COMP_SETUP["Compensation Structure"]
        BAND[Salary Bands]
        RANGE[Pay Ranges]
        MARKET[Market Data]
    end
    
    subgraph ANALYSIS["Compensation Analysis"]
        COMPA[Compa-Ratio]
        EQUITY[Equity Analysis]
        BUDGET[Budget Planning]
    end
    
    subgraph ACTIONS["Compensation Actions"]
        MERIT[Merit Increases]
        ADJUST[Equity Adjustments]
        PROMO[Promotion Increases]
    end
    
    GRADE --> BAND
    POS --> RANGE
    EMP --> COMPA
    BAND --> COMPA
    
    COMPA --> EQUITY
    MARKET --> EQUITY
    EQUITY --> BUDGET
    
    PERF --> MERIT
    EQUITY --> ADJUST
    BUDGET --> MERIT
    
    MERIT -.-> EMP
    ADJUST -.-> EMP
    PROMO -.-> EMP
    
    style WORKFORCE fill:#e0f2fe,stroke:#0284c7
    style COMP_SETUP fill:#fef3c7,stroke:#d97706
    style ANALYSIS fill:#f0fdf4,stroke:#16a34a
    style ACTIONS fill:#fce7f3,stroke:#db2777
`;

const dataFlowItems = [
  {
    source: 'Job Grade',
    target: 'Salary Band',
    data: 'Grade level determines applicable salary band (min/mid/max)',
    direction: 'Outbound'
  },
  {
    source: 'Employee Salary',
    target: 'Compa-Ratio',
    data: 'Current salary vs. band midpoint = compa-ratio calculation',
    direction: 'Calculated'
  },
  {
    source: 'Performance Rating',
    target: 'Merit Matrix',
    data: 'Rating determines merit increase percentage eligibility',
    direction: 'Outbound'
  },
  {
    source: 'Merit Increase',
    target: 'Employee Salary',
    data: 'Approved merit updates employee base salary',
    direction: 'Inbound'
  },
  {
    source: 'Promotion',
    target: 'Salary Adjustment',
    data: 'Grade change triggers salary review against new band',
    direction: 'Bidirectional'
  }
];

const compaRatioRanges = [
  { range: '< 80%', status: 'Below Range', risk: 'High', action: 'Priority equity adjustment' },
  { range: '80-90%', status: 'Below Midpoint', risk: 'Medium', action: 'Targeted increase' },
  { range: '90-110%', status: 'At Market', risk: 'Low', action: 'Standard merit' },
  { range: '110-120%', status: 'Above Midpoint', risk: 'Low', action: 'Monitor position' },
  { range: '> 120%', status: 'Above Range', risk: 'Medium', action: 'Review for promotion or role change' }
];

export function CompensationIntegration() {
  return (
    <div className="space-y-8" data-manual-anchor="wf-sec-9-8">
      {/* Section Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">9.8 Compensation Integration</h2>
            <p className="text-muted-foreground">
              Position grades, salary bands, and compa-ratio calculations for merit reviews
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Grade-Based Compensation Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Compensation decisions are anchored in the job architecture defined in Workforce. 
            Each job grade maps to a salary band with minimum, midpoint, and maximum pay ranges. 
            Employee salaries are compared against these bands to calculate compa-ratios.
          </p>
          <p className="text-muted-foreground">
            Performance ratings flow from the Performance module to determine merit increase 
            eligibility, while compa-ratio analysis identifies equity adjustment needs.
          </p>
        </CardContent>
      </Card>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-4">
        <FeatureCard
          variant="primary"
          icon={BarChart3}
          title="Compa-Ratio Analysis"
          description="Automatic calculation of employee salary position within their grade's band"
        />
        <FeatureCard
          variant="info"
          icon={Target}
          title="Merit Matrix Integration"
          description="Performance ratings map to merit increase percentages via configurable matrix"
        />
        <FeatureCard
          variant="warning"
          icon={AlertCircle}
          title="Equity Alerts"
          description="Flags employees significantly below or above their salary band range"
        />
      </div>

      {/* Workflow Diagram */}
      <WorkflowDiagram
        title="Compensation Data Flow"
        description="How workforce and performance data drive compensation decisions"
        diagram={compensationFlowDiagram}
      />

      {/* Data Flow Table */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle>Data Exchange Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Source</th>
                  <th className="text-left py-3 px-4 font-medium">Target</th>
                  <th className="text-left py-3 px-4 font-medium">Data/Calculation</th>
                  <th className="text-left py-3 px-4 font-medium">Flow</th>
                </tr>
              </thead>
              <tbody>
                {dataFlowItems.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{item.source}</td>
                    <td className="py-3 px-4">{item.target}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.data}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">{item.direction}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Compa-Ratio Ranges */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Compa-Ratio Analysis Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Compa-ratio = (Employee Salary ÷ Band Midpoint) × 100. This metric guides compensation decisions:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Compa-Ratio</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Risk Level</th>
                  <th className="text-left py-3 px-4 font-medium">Recommended Action</th>
                </tr>
              </thead>
              <tbody>
                {compaRatioRanges.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 font-mono font-medium">{item.range}</td>
                    <td className="py-3 px-4">{item.status}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant="outline" 
                        className={
                          item.risk === 'High' ? 'border-red-500 text-red-600' :
                          item.risk === 'Medium' ? 'border-amber-500 text-amber-600' :
                          'border-green-500 text-green-600'
                        }
                      >
                        {item.risk}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{item.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Screenshot */}
      <ScreenshotPlaceholder
        caption="Compensation Dashboard - Compa-ratio distribution view showing employees by band position"
      />

      {/* Merit-Performance Link */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Performance → Merit Increase Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2">Matrix Configuration</h4>
              <p className="text-sm text-muted-foreground">
                The merit matrix defines increase percentages based on two dimensions: 
                performance rating and current compa-ratio position. Higher performers 
                below midpoint receive larger increases.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2">Budget Constraints</h4>
              <p className="text-sm text-muted-foreground">
                Merit budgets can be set at company, department, or manager level. 
                The system ensures proposed increases stay within allocated budgets.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Callouts */}
      <IntegrationCallout title="Position Control Budget Link">
        Compensation budget planning integrates with Position Control headcount budgets. 
        Authorized positions include allocated compensation budget for workforce planning.
      </IntegrationCallout>

      <TipCallout title="Promotion Salary Guidance">
        When an employee is promoted to a higher grade, the system provides guidance on the 
        new salary range. Typical practice is to bring the employee to at least the minimum 
        of the new band or provide a standard promotional increase.
      </TipCallout>

      <WarningCallout title="Pay Equity Compliance">
        Compa-ratio analysis can reveal pay equity issues. Use the equity analysis tools to 
        compare pay across demographic groups and identify potential disparities requiring attention.
      </WarningCallout>
    </div>
  );
}
