import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Network, Database, ArrowRight, Users, Briefcase, 
  CreditCard, Calendar, Award, GraduationCap, TrendingUp,
  UserCheck, Bell, Building2, GitBranch
} from 'lucide-react';
import { FeatureCard } from '@/components/enablement/manual/components/FeatureCard';
import { InfoCallout, TipCallout } from '@/components/enablement/manual/components/Callout';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';

const integrationDiagram = `
graph TB
    subgraph WF["Workforce Module"]
        EMP[Employee Master]
        POS[Positions]
        JOB[Jobs & Grades]
        ORG[Org Structure]
    end
    
    subgraph MODULES["Integrated Modules"]
        PAY[Payroll]
        BEN[Benefits]
        LVE[Leave & Time]
        PRF[Performance]
        LRN[Learning]
        CMP[Compensation]
        SUC[Succession]
        REC[Recruitment]
    end
    
    subgraph ESS["Self-Service"]
        EMSS[Employee ESS]
        MGSS[Manager MSS]
    end
    
    EMP --> PAY
    EMP --> BEN
    EMP --> LVE
    EMP --> PRF
    EMP --> LRN
    
    POS --> CMP
    POS --> SUC
    POS --> REC
    
    JOB --> PRF
    JOB --> LRN
    JOB --> CMP
    
    ORG --> PAY
    ORG --> BEN
    
    EMP --> EMSS
    EMP --> MGSS
    POS --> MGSS
    
    PRF -.-> EMP
    SUC -.-> POS
    REC -.-> EMP
    
    style WF fill:#e0f2fe,stroke:#0284c7
    style MODULES fill:#f0fdf4,stroke:#16a34a
    style ESS fill:#fef3c7,stroke:#d97706
`;

const integrationPoints = [
  {
    module: 'Recruitment',
    icon: UserCheck,
    direction: 'Bidirectional',
    dataFlow: 'Position requisitions, new hire data',
    trigger: 'Vacancy created, offer accepted'
  },
  {
    module: 'Payroll',
    icon: CreditCard,
    direction: 'Outbound',
    dataFlow: 'Employee master, pay group, cost center',
    trigger: 'Hire, transfer, termination'
  },
  {
    module: 'Benefits',
    icon: Award,
    direction: 'Outbound',
    dataFlow: 'Eligibility, dependents, life events',
    trigger: 'Status change, life event'
  },
  {
    module: 'Leave & Time',
    icon: Calendar,
    direction: 'Bidirectional',
    dataFlow: 'Leave policies, shift assignments',
    trigger: 'Position assignment, schedule change'
  },
  {
    module: 'Performance',
    icon: TrendingUp,
    direction: 'Bidirectional',
    dataFlow: 'Job competencies, ratings',
    trigger: 'Appraisal cycle, rating finalized'
  },
  {
    module: 'Learning',
    icon: GraduationCap,
    direction: 'Outbound',
    dataFlow: 'Training requirements, competency gaps',
    trigger: 'Job assignment, gap identified'
  },
  {
    module: 'Compensation',
    icon: CreditCard,
    direction: 'Bidirectional',
    dataFlow: 'Salary bands, compa-ratio',
    trigger: 'Merit review, market adjustment'
  },
  {
    module: 'Succession',
    icon: GitBranch,
    direction: 'Bidirectional',
    dataFlow: 'Position criticality, readiness',
    trigger: 'Talent review, succession update'
  }
];

export function IntegrationOverview() {
  return (
    <div className="space-y-8" data-manual-anchor="wf-sec-9-1">
      {/* Section Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Network className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">9.1 Integration Overview</h2>
            <p className="text-muted-foreground">
              How workforce data flows to and from other HRplus modules
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Workforce as the Foundation Layer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Workforce module serves as the <strong>master data repository</strong> for the entire 
            HRplus ecosystem. Employee records, organizational structure, job architecture, and position 
            data originate here and flow to all downstream modules.
          </p>
          <p className="text-muted-foreground">
            This integration-first design ensures data consistency, eliminates duplicate entry, and 
            enables real-time synchronization across all HR processes—from recruitment through retirement.
          </p>
        </CardContent>
      </Card>

      {/* Key Concepts */}
      <div className="grid md:grid-cols-3 gap-4">
        <FeatureCard
          variant="primary"
          icon={Database}
          title="Master Data Source"
          description="Employee, position, and job data originate in Workforce and are consumed by all other modules"
        />
        <FeatureCard
          variant="info"
          icon={ArrowRight}
          title="Event-Driven Sync"
          description="Transactions trigger automatic updates to downstream systems without manual intervention"
        />
        <FeatureCard
          variant="success"
          icon={Network}
          title="Bidirectional Flow"
          description="Some modules feed data back to Workforce (e.g., performance ratings, succession readiness)"
        />
      </div>

      {/* Integration Architecture Diagram */}
      <WorkflowDiagram
        title="Workforce Integration Architecture"
        description="Data flow between Workforce and integrated modules"
        diagram={integrationDiagram}
      />

      {/* Integration Points Table */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle>Integration Points Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Module</th>
                  <th className="text-left py-3 px-4 font-medium">Direction</th>
                  <th className="text-left py-3 px-4 font-medium">Data Exchanged</th>
                  <th className="text-left py-3 px-4 font-medium">Trigger Events</th>
                </tr>
              </thead>
              <tbody>
                {integrationPoints.map((point, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <point.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{point.module}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">
                        {point.direction}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{point.dataFlow}</td>
                    <td className="py-3 px-4 text-muted-foreground">{point.trigger}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Callouts */}
      <TipCallout title="Integration Sequence">
        When implementing HRplus, configure the Workforce module first. All downstream modules 
        (Leave, Benefits, Payroll, Performance) depend on Workforce data being complete and accurate.
      </TipCallout>

      <InfoCallout title="Real-Time vs. Batch Sync">
        Most integrations are real-time (triggered immediately by transactions). Payroll integration 
        supports both real-time sync and batch export for pay period processing.
      </InfoCallout>

      {/* Core Integration Principles */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Core Integration Principles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2">Single Source of Truth</h4>
              <p className="text-sm text-muted-foreground">
                Employee personal data, job assignments, and organizational placement are maintained 
                only in Workforce. Other modules reference this data, never duplicate it.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2">Transaction-Based Updates</h4>
              <p className="text-sm text-muted-foreground">
                Every change (hire, transfer, promotion, termination) generates a transaction that 
                triggers updates to all affected downstream modules.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2">Effective Dating</h4>
              <p className="text-sm text-muted-foreground">
                Future-dated transactions allow preparation without immediate impact. On the effective 
                date, integrations activate automatically.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2">Audit Trail Preservation</h4>
              <p className="text-sm text-muted-foreground">
                All integration events are logged with source, target, timestamp, and data snapshot 
                for compliance and troubleshooting.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
