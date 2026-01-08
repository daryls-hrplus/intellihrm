import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UserCheck, Briefcase, ArrowRight, FileText, Users,
  CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { FeatureCardGrid, PrimaryFeatureCard, SecondaryFeatureCard, SuccessFeatureCard } from '@/components/enablement/manual/components/FeatureCard';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';
import { SeeAlsoReference } from '@/components/enablement/shared/CrossModuleReference';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

const recruitmentFlowDiagram = `
graph LR
    subgraph WORKFORCE["Workforce Module"]
        VAC[Vacancy Created]
        POS[Position Data]
        JOB[Job Requirements]
    end
    
    subgraph RECRUITMENT["Recruitment Module"]
        REQ[Requisition]
        POST[Job Posting]
        APP[Applications]
        OFFER[Offer Made]
    end
    
    subgraph ONBOARD["Onboarding"]
        HIRE[New Hire Record]
        ASSIGN[Position Assignment]
        ACTIVE[Active Employee]
    end
    
    VAC --> REQ
    POS --> REQ
    JOB --> POST
    
    REQ --> POST
    POST --> APP
    APP --> OFFER
    
    OFFER --> HIRE
    HIRE --> ASSIGN
    ASSIGN --> ACTIVE
    
    ACTIVE -.-> POS
    
    style WORKFORCE fill:#e0f2fe,stroke:#0284c7
    style RECRUITMENT fill:#f0fdf4,stroke:#16a34a
    style ONBOARD fill:#fef3c7,stroke:#d97706
`;

const dataFlowItems = [
  {
    source: 'Position Vacancy',
    target: 'Requisition',
    data: 'Position ID, title, department, grade, salary range, hiring manager',
    timing: 'On vacancy creation'
  },
  {
    source: 'Job Profile',
    target: 'Job Posting',
    data: 'Job description, requirements, competencies, qualifications',
    timing: 'On requisition approval'
  },
  {
    source: 'Offer Acceptance',
    target: 'Employee Record',
    data: 'Candidate data, start date, agreed compensation, assigned position',
    timing: 'On offer acceptance'
  },
  {
    source: 'Onboarding Complete',
    target: 'Position Fill',
    data: 'Employee ID, position assignment, actual start date',
    timing: 'On first day check-in'
  }
];

export function RecruitmentIntegration() {
  return (
    <div className="space-y-8" data-manual-anchor="wf-sec-9-2">
      {/* Section Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <UserCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">9.2 Recruitment Integration</h2>
            <p className="text-muted-foreground">
              Position requisitions and new hire data flow between Workforce and Recruitment
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Vacancy-to-Hire Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Workforce-Recruitment integration creates a seamless pipeline from position vacancy 
            through candidate hire. When a position becomes vacant (or a new position is authorized), 
            it automatically triggers the recruitment process with all relevant job and position data.
          </p>
          <p className="text-muted-foreground">
            Upon offer acceptance, candidate data flows back to Workforce to create the employee 
            record and assign them to the designated position—eliminating manual re-entry and ensuring 
            data accuracy.
          </p>
        </CardContent>
      </Card>

      {/* Key Features */}
      <FeatureCardGrid columns={3}>
        <PrimaryFeatureCard
          icon={FileText}
          title="Auto-Requisition Creation"
          description="Vacancies automatically generate requisitions with position details pre-populated"
        />
        <SecondaryFeatureCard
          icon={ArrowRight}
          title="Seamless Onboarding"
          description="Accepted candidates convert to employees without duplicate data entry"
        />
        <SuccessFeatureCard
          icon={CheckCircle}
          title="Position Fill Tracking"
          description="Real-time visibility into vacancy fill status and time-to-hire metrics"
        />
      </FeatureCardGrid>

      {/* Workflow Diagram */}
      <WorkflowDiagram
        title="Recruitment Integration Flow"
        description="End-to-end data flow from vacancy to active employee"
        diagram={recruitmentFlowDiagram}
      />

      {/* Data Flow Table */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle>Data Flow Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Source</th>
                  <th className="text-left py-3 px-4 font-medium">Target</th>
                  <th className="text-left py-3 px-4 font-medium">Data Transferred</th>
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
                    <td className="py-3 px-4 text-muted-foreground">{item.data}</td>
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
        title="MSS Requisition View"
        description="Manager self-service view showing position vacancy with 'Create Requisition' action"
        height="h-64"
      />

      {/* Configuration Points */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Configuration Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Requisition Auto-Creation
              </h4>
              <p className="text-sm text-muted-foreground">
                Configure whether vacancies automatically create requisitions or require manual initiation. 
                Set by position type or department.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Approval Routing
              </h4>
              <p className="text-sm text-muted-foreground">
                Define requisition approval workflow. Can be based on position grade, department, 
                headcount budget status, or custom rules.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Candidate-to-Employee Mapping
              </h4>
              <p className="text-sm text-muted-foreground">
                Map recruitment candidate fields to workforce employee fields. Configure which data 
                transfers automatically vs. requires review.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                Document Handoff
              </h4>
              <p className="text-sm text-muted-foreground">
                Configure which recruitment documents (resume, offer letter, background check) 
                automatically attach to the new employee record.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Callouts */}
      <TipCallout title="MSS Hiring Dashboard">
        Managers can view all their open requisitions, candidate pipeline status, and pending 
        actions from the Manager Self-Service hiring dashboard without accessing the full Recruitment module.
      </TipCallout>

      <WarningCallout title="Position Budget Validation">
        Requisitions created from vacancies are validated against headcount budget. If the position 
        exceeds authorized headcount, the requisition requires additional approval from HR or Finance.
      </WarningCallout>

      {/* Cross-References */}
      <SeeAlsoReference
        module="Position Control"
        section="Vacancy Management"
        description="Configure vacancy triggers and headcount validation"
        manualPath="/enablement/manuals/workforce"
        anchor="wf-sec-6-2"
      />
    </div>
  );
}
