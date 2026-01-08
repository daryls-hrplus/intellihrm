import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, Users, ArrowRight, Heart, Shield,
  CheckCircle, Clock, Baby, UserPlus
} from 'lucide-react';
import { FeatureCard } from '@/components/enablement/manual/components/FeatureCard';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

const benefitsFlowDiagram = `
graph LR
    subgraph WORKFORCE["Workforce Data"]
        EMP[Employee Record]
        POS[Position & Grade]
        TYPE[Employment Type]
        DEP[Dependents]
    end
    
    subgraph ELIGIBILITY["Eligibility Engine"]
        RULES[Eligibility Rules]
        EVAL[Rule Evaluation]
        QUAL[Qualified Plans]
    end
    
    subgraph BENEFITS["Benefits Module"]
        PLANS[Available Plans]
        ENROLL[Enrollment]
        COVER[Coverage]
    end
    
    EMP --> RULES
    POS --> RULES
    TYPE --> RULES
    
    RULES --> EVAL
    EVAL --> QUAL
    
    QUAL --> PLANS
    DEP --> ENROLL
    PLANS --> ENROLL
    ENROLL --> COVER
    
    style WORKFORCE fill:#e0f2fe,stroke:#0284c7
    style ELIGIBILITY fill:#fef3c7,stroke:#d97706
    style BENEFITS fill:#f0fdf4,stroke:#16a34a
`;

const eligibilityFactors = [
  {
    factor: 'Employment Type',
    example: 'Permanent, Contract, Temporary',
    impact: 'Contractors may be excluded from certain benefits'
  },
  {
    factor: 'Position Grade',
    example: 'Executive, Management, Staff',
    impact: 'Higher grades may have enhanced benefit tiers'
  },
  {
    factor: 'Service Length',
    example: '90 days, 1 year, 5 years',
    impact: 'Some benefits require minimum tenure'
  },
  {
    factor: 'Work Location',
    example: 'Country, State/Province',
    impact: 'Benefits vary by jurisdiction'
  },
  {
    factor: 'Hours Worked',
    example: 'Full-time (40+), Part-time',
    impact: 'Part-time may have prorated benefits'
  }
];

const lifeEvents = [
  { event: 'New Hire', trigger: 'Hire transaction', action: 'Open enrollment window' },
  { event: 'Marriage', trigger: 'Marital status change', action: 'Add spouse coverage option' },
  { event: 'Birth/Adoption', trigger: 'Dependent added', action: 'Add child coverage' },
  { event: 'Divorce', trigger: 'Marital status change', action: 'Remove spouse, update coverage' },
  { event: 'Termination', trigger: 'Termination transaction', action: 'End coverage, COBRA notification' }
];

export function BenefitsIntegration() {
  return (
    <div className="space-y-8" data-manual-anchor="wf-sec-9-4">
      {/* Section Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">9.4 Benefits Integration</h2>
            <p className="text-muted-foreground">
              Eligibility determination and life event triggers from workforce data
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Benefits Eligibility from Workforce Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Benefits module relies on workforce data to determine which employees are eligible 
            for which benefit plans. Employment type, position grade, location, and tenure all factor 
            into eligibility calculations.
          </p>
          <p className="text-muted-foreground">
            Life events recorded in the Workforce module (marriage, birth, adoption) automatically 
            trigger benefits enrollment windows, ensuring employees can update their coverage when 
            their circumstances change.
          </p>
        </CardContent>
      </Card>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-4">
        <FeatureCard
          variant="primary"
          icon={CheckCircle}
          title="Automatic Eligibility"
          description="Benefits eligibility calculated in real-time based on employee attributes"
        />
        <FeatureCard
          variant="info"
          icon={Baby}
          title="Life Event Triggers"
          description="Workforce changes automatically open special enrollment periods"
        />
        <FeatureCard
          variant="success"
          icon={Users}
          title="Dependent Sync"
          description="Dependent data flows to Benefits for coverage enrollment"
        />
      </div>

      {/* Workflow Diagram */}
      <WorkflowDiagram
        title="Benefits Eligibility Flow"
        description="How workforce data determines benefits eligibility"
        diagram={benefitsFlowDiagram}
      />

      {/* Eligibility Factors */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle>Eligibility Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Factor</th>
                  <th className="text-left py-3 px-4 font-medium">Examples</th>
                  <th className="text-left py-3 px-4 font-medium">Impact on Benefits</th>
                </tr>
              </thead>
              <tbody>
                {eligibilityFactors.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{item.factor}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.example}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Life Events */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Life Event Triggers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            When specific workforce changes occur, they automatically trigger benefits actions:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Life Event</th>
                  <th className="text-left py-3 px-4 font-medium">Workforce Trigger</th>
                  <th className="text-left py-3 px-4 font-medium">Benefits Action</th>
                </tr>
              </thead>
              <tbody>
                {lifeEvents.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{item.event}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">{item.trigger}</Badge>
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
        caption="ESS Benefits Enrollment - Employee self-service view showing available benefits based on eligibility"
      />

      {/* Dependent Data Flow */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Dependent Data Synchronization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2">Workforce → Benefits</h4>
              <p className="text-sm text-muted-foreground">
                Dependents added in Workforce (Part 4: Employee Management) automatically appear 
                as enrollment options in Benefits. Name, relationship, date of birth, and SSN 
                (where required) are synchronized.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2">Verification Requirements</h4>
              <p className="text-sm text-muted-foreground">
                Dependent verification documents (marriage certificate, birth certificate) uploaded 
                in Workforce are accessible to Benefits for enrollment approval.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Callouts */}
      <TipCallout title="Waiting Periods">
        Configure waiting periods (e.g., 90 days for new hires) in the Benefits module. 
        The eligibility engine uses the workforce hire date to calculate when employees 
        become eligible for enrollment.
      </TipCallout>

      <WarningCallout title="Retroactive Changes">
        Retroactive workforce changes (backdated hires, corrections to employment type) 
        may affect benefits eligibility. Review the benefits enrollment history when 
        processing retroactive transactions.
      </WarningCallout>

      <InfoCallout title="Annual Open Enrollment">
        During annual open enrollment, all eligible employees are presented with their 
        benefit options based on current workforce data. Ensure employee records are 
        accurate before open enrollment begins.
      </InfoCallout>
    </div>
  );
}
