import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Target, Users, ArrowRight, Star,
  CheckCircle, LayoutGrid, Briefcase
} from 'lucide-react';
import { FeatureCard } from '@/components/enablement/manual/components/FeatureCard';
import { InfoCallout, TipCallout, IntegrationCallout } from '@/components/enablement/manual/components/Callout';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

const performanceFlowDiagram = `
graph LR
    subgraph WORKFORCE["Workforce Data"]
        JOB[Job Profile]
        POS[Position]
        EMP[Employee Record]
        COMP[Competencies]
    end
    
    subgraph PERFORMANCE["Performance Module"]
        FORM[Appraisal Form]
        GOALS[Goals]
        REVIEW[Performance Review]
        RATING[Final Rating]
    end
    
    subgraph FEEDBACK["Outcomes"]
        NINEBOX[Nine-Box Placement]
        SUC[Succession Readiness]
        MERIT[Merit Eligibility]
        DEV[Development Plans]
    end
    
    JOB --> FORM
    JOB --> COMP
    POS --> GOALS
    EMP --> REVIEW
    COMP --> FORM
    
    REVIEW --> RATING
    RATING --> NINEBOX
    RATING --> MERIT
    NINEBOX --> SUC
    RATING --> DEV
    
    SUC -.-> EMP
    RATING -.-> EMP
    
    style WORKFORCE fill:#e0f2fe,stroke:#0284c7
    style PERFORMANCE fill:#f0fdf4,stroke:#16a34a
    style FEEDBACK fill:#fef3c7,stroke:#d97706
`;

const dataFlowItems = [
  {
    source: 'Job Profile',
    target: 'Appraisal Form',
    data: 'Job-specific competencies, performance criteria',
    direction: 'Outbound'
  },
  {
    source: 'Position Goals',
    target: 'Employee Goals',
    data: 'Position-level objectives cascade to employees',
    direction: 'Outbound'
  },
  {
    source: 'Manager Hierarchy',
    target: 'Reviewer Assignment',
    data: 'Reporting relationship determines reviewers',
    direction: 'Outbound'
  },
  {
    source: 'Performance Rating',
    target: 'Employee Record',
    data: 'Final rating, Nine-Box placement',
    direction: 'Inbound'
  },
  {
    source: 'Succession Readiness',
    target: 'Position Successors',
    data: 'Readiness level updates from talent review',
    direction: 'Inbound'
  }
];

const nineBoxMapping = [
  { performance: 'High', potential: 'High', label: 'Star', action: 'Fast-track development' },
  { performance: 'High', potential: 'Medium', label: 'High Performer', action: 'Stretch assignments' },
  { performance: 'High', potential: 'Low', label: 'Solid Performer', action: 'Role expertise' },
  { performance: 'Medium', potential: 'High', label: 'Rising Star', action: 'Development focus' },
  { performance: 'Medium', potential: 'Medium', label: 'Core Player', action: 'Maintain engagement' },
  { performance: 'Low', potential: 'High', label: 'Enigma', action: 'Performance coaching' }
];

export function PerformanceIntegration() {
  return (
    <div className="space-y-8" data-manual-anchor="wf-sec-9-6">
      {/* Section Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">9.6 Performance Integration</h2>
            <p className="text-muted-foreground">
              Job competencies, appraisal forms, and rating feedback to workforce records
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Bidirectional Performance Data Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Workforce-Performance integration is <strong>bidirectional</strong>. Workforce provides 
            job competencies and position-based criteria to drive appraisal forms. Performance returns 
            ratings and Nine-Box placements that update employee records and feed succession planning.
          </p>
          <p className="text-muted-foreground">
            This closed loop ensures that performance outcomes directly inform talent decisions, 
            development planning, and compensation reviews.
          </p>
        </CardContent>
      </Card>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-4">
        <FeatureCard
          variant="primary"
          icon={Briefcase}
          title="Job-Based Appraisals"
          description="Appraisal forms automatically include competencies from the employee's job profile"
        />
        <FeatureCard
          variant="info"
          icon={LayoutGrid}
          title="Nine-Box Population"
          description="Performance + potential ratings automatically plot employees on the Nine-Box grid"
        />
        <FeatureCard
          variant="success"
          icon={Star}
          title="Rating History"
          description="Performance ratings are stored in the employee record for trend analysis"
        />
      </div>

      {/* Workflow Diagram */}
      <WorkflowDiagram
        title="Performance Integration Flow"
        description="How workforce data drives performance and how ratings feed back"
        diagram={performanceFlowDiagram}
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
                  <th className="text-left py-3 px-4 font-medium">Data Exchanged</th>
                  <th className="text-left py-3 px-4 font-medium">Direction</th>
                </tr>
              </thead>
              <tbody>
                {dataFlowItems.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{item.source}</td>
                    <td className="py-3 px-4">{item.target}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.data}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant="outline" 
                        className={item.direction === 'Inbound' ? 'border-green-500 text-green-600' : ''}
                      >
                        {item.direction}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Nine-Box Mapping */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Nine-Box Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Performance ratings combined with potential assessments automatically populate the Nine-Box grid:
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {nineBoxMapping.map((item, index) => (
              <div key={index} className="p-3 border rounded-lg bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    P: {item.performance} | Pot: {item.potential}
                  </Badge>
                </div>
                <h4 className="font-semibold text-sm">{item.label}</h4>
                <p className="text-xs text-muted-foreground">{item.action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Screenshot */}
      <ScreenshotPlaceholder
        caption="MSS Nine-Box View - Manager view showing team members plotted on the Nine-Box grid with succession insights"
      />

      {/* Competency Flow */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Job Competency → Appraisal Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2">Competency Definition</h4>
              <p className="text-sm text-muted-foreground">
                Job profiles in Workforce define required competencies with proficiency levels. 
                These are categorized as core, functional, and leadership competencies.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2">Appraisal Form Population</h4>
              <p className="text-sm text-muted-foreground">
                When an appraisal is initiated, the employee's job competencies automatically 
                populate the competency section of the appraisal form with expected proficiency levels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Callouts */}
      <TipCallout title="Rating Scale Alignment">
        Ensure the performance rating scale in the Performance module aligns with how ratings 
        are interpreted in Workforce for succession readiness and merit eligibility calculations.
      </TipCallout>

      <IntegrationCallout title="Performance-Compensation Link">
        Performance ratings can trigger merit increase eligibility. Configure the rating-to-merit 
        mapping in Compensation settings to automate merit review targeting.
      </IntegrationCallout>

      <InfoCallout title="Historical Ratings">
        All performance ratings are retained in the employee's performance history within Workforce. 
        This enables trend analysis and informs long-term talent decisions.
      </InfoCallout>
    </div>
  );
}
