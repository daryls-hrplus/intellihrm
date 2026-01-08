import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GitBranch, Users, Target, TrendingUp, ArrowRight,
  CheckCircle, AlertCircle, Crown, Shield
} from 'lucide-react';
import { FeatureCardGrid, PrimaryFeatureCard, SecondaryFeatureCard, SuccessFeatureCard } from '@/components/enablement/manual/components/FeatureCard';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { SeeAlsoReference } from '@/components/enablement/shared/CrossModuleReference';

const successionFlowDiagram = `
graph LR
    subgraph WORKFORCE["Workforce Data"]
        POS[Critical Positions]
        EMP[Employee Pool]
        COMP[Competencies]
        HIST[Career History]
    end
    
    subgraph PERFORMANCE["Performance Inputs"]
        RATING[Performance Rating]
        POT[Potential Assessment]
        NINE[Nine-Box Placement]
    end
    
    subgraph SUCCESSION["Succession Planning"]
        CRIT[Criticality Assessment]
        POOL[Successor Pool]
        READY[Readiness Levels]
        PLAN[Succession Plan]
    end
    
    subgraph ACTIONS["Development Actions"]
        DEV[Development Plans]
        ASSIGN[Stretch Assignments]
        MENTOR[Mentoring]
    end
    
    POS --> CRIT
    EMP --> POOL
    COMP --> POOL
    HIST --> POOL
    
    RATING --> READY
    POT --> READY
    NINE --> POOL
    
    CRIT --> PLAN
    POOL --> PLAN
    READY --> PLAN
    
    PLAN --> DEV
    PLAN --> ASSIGN
    PLAN --> MENTOR
    
    READY -.-> EMP
    
    style WORKFORCE fill:#e0f2fe,stroke:#0284c7
    style PERFORMANCE fill:#fef3c7,stroke:#d97706
    style SUCCESSION fill:#f0fdf4,stroke:#16a34a
    style ACTIONS fill:#fce7f3,stroke:#db2777
`;

const criticalityFactors = [
  { factor: 'Strategic Impact', description: 'How central is this role to business strategy?', weight: 'High' },
  { factor: 'Difficulty to Fill', description: 'Time and cost to recruit externally for this role', weight: 'High' },
  { factor: 'Unique Knowledge', description: 'Specialized expertise concentrated in current incumbent', weight: 'Medium' },
  { factor: 'Revenue Impact', description: 'Direct or indirect impact on revenue if vacant', weight: 'Medium' },
  { factor: 'Risk Exposure', description: 'Regulatory or operational risk if position unfilled', weight: 'Medium' }
];

const readinessLevels = [
  { level: 'Ready Now', timeframe: '0-6 months', criteria: 'Meets all competencies, proven performance', action: 'Emergency succession' },
  { level: 'Ready Soon', timeframe: '6-12 months', criteria: 'Most competencies, needs targeted development', action: 'Accelerated development' },
  { level: 'Ready Later', timeframe: '1-2 years', criteria: 'High potential, significant development needed', action: 'Comprehensive development plan' },
  { level: 'Emerging Talent', timeframe: '2-3 years', criteria: 'Early career, shows promise', action: 'Long-term pipeline' }
];

const dataFlowItems = [
  { source: 'Position Criticality', target: 'Succession Priority', timing: 'On criticality assessment' },
  { source: 'Nine-Box Placement', target: 'Successor Pool', timing: 'After talent review' },
  { source: 'Competency Assessment', target: 'Readiness Calculation', timing: 'On assessment completion' },
  { source: 'Readiness Level', target: 'Employee Record', timing: 'On succession plan update' },
  { source: 'Development Progress', target: 'Readiness Update', timing: 'On milestone completion' }
];

export function SuccessionIntegration() {
  return (
    <div className="space-y-8" data-manual-anchor="wf-sec-9-9">
      {/* Section Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <GitBranch className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">9.9 Succession Planning Integration</h2>
            <p className="text-muted-foreground">
              Position criticality assessment and successor identification from workforce data
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Building the Leadership Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Succession planning integrates deeply with Workforce and Performance modules. Critical 
            positions are identified in Workforce, potential successors are drawn from the employee 
            pool, and readiness levels are calculated from competency assessments and performance ratings.
          </p>
          <p className="text-muted-foreground">
            This integration ensures that succession plans are data-driven, regularly updated, and 
            linked to actionable development activities.
          </p>
        </CardContent>
      </Card>

      {/* Key Features */}
      <FeatureCardGrid columns={3}>
        <PrimaryFeatureCard
          icon={Shield}
          title="Critical Position Tracking"
          description="Identify and prioritize positions that require succession coverage"
        />
        <SecondaryFeatureCard
          icon={Users}
          title="Successor Pool Management"
          description="Build pools of potential successors from Nine-Box high performers"
        />
        <SuccessFeatureCard
          icon={TrendingUp}
          title="Readiness Assessment"
          description="Track successor readiness with competency and experience gaps"
        />
      </FeatureCardGrid>

      {/* Workflow Diagram */}
      <WorkflowDiagram
        title="Succession Planning Data Flow"
        description="How workforce and performance data feed succession planning"
        diagram={successionFlowDiagram}
      />

      {/* Criticality Factors */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle>Position Criticality Assessment Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Factor</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-left py-3 px-4 font-medium">Weight</th>
                </tr>
              </thead>
              <tbody>
                {criticalityFactors.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{item.factor}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.description}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant="outline" 
                        className={item.weight === 'High' ? 'border-red-500 text-red-600' : 'border-amber-500 text-amber-600'}
                      >
                        {item.weight}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Readiness Levels */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Successor Readiness Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Readiness Level</th>
                  <th className="text-left py-3 px-4 font-medium">Timeframe</th>
                  <th className="text-left py-3 px-4 font-medium">Criteria</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {readinessLevels.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{item.level}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="text-xs">{item.timeframe}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{item.criteria}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Data Flow */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle>Data Synchronization Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Source</th>
                  <th className="text-left py-3 px-4 font-medium">Target</th>
                  <th className="text-left py-3 px-4 font-medium">Timing</th>
                </tr>
              </thead>
              <tbody>
                {dataFlowItems.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{item.source}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{item.target}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{item.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Screenshot */}
      <ScreenshotPlaceholder
        title="MSS Succession View"
        description="Manager view showing succession pipeline for their critical positions"
        height="h-64"
      />

      {/* MSS Integration */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Manager Self-Service Succession Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                View Succession Pipeline
              </h4>
              <p className="text-sm text-muted-foreground">
                Managers can view succession plans for critical positions in their org. 
                They see identified successors, readiness levels, and development progress.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Nominate Successors
              </h4>
              <p className="text-sm text-muted-foreground">
                Managers can nominate high-performing team members as potential successors 
                for positions, subject to HR review and talent calibration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Callouts */}
      <TipCallout title="Nine-Box Integration">
        Employees in the top-right quadrants of the Nine-Box (high performance + high potential) 
        are automatically flagged as succession candidates. Use the Nine-Box view to identify 
        potential successors.
      </TipCallout>

      <WarningCallout title="Succession Plan Gaps">
        Critical positions without at least one "Ready Now" or "Ready Soon" successor represent 
        succession risk. The system alerts HR when coverage gaps exist for high-criticality roles.
      </WarningCallout>

      <InfoCallout title="Development Plan Link">
        Successors identified in succession planning can have linked Individual Development Plans 
        (IDPs) that target the specific competency gaps needed to reach readiness.
      </InfoCallout>

      {/* Cross-References */}
      <SeeAlsoReference
        module="Workforce"
        section="ESS/MSS Succession View"
        description="Manager self-service succession pipeline visibility"
        manualPath="/enablement/manuals/workforce"
        anchor="wf-sec-8-4"
      />
    </div>
  );
}
