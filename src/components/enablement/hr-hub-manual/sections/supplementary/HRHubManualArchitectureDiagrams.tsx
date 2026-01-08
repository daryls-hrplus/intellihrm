import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Network, Workflow, Bell, ArrowRightLeft, Layers } from 'lucide-react';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';

export const HRHubManualArchitectureDiagrams = () => {
  const moduleArchitectureDiagram = `flowchart TB
    subgraph Foundation["Foundation Layer"]
        Companies[Companies]
        Departments[Departments]
        Employees[Employees]
        Jobs[Jobs & Positions]
    end
    
    subgraph Core["HR Hub Core"]
        HelpDesk[Help Desk]
        KB[Knowledge Base]
        Docs[Documents]
        Compliance[Compliance]
        SOPs[SOPs]
    end
    
    subgraph Automation["Automation Layer"]
        Workflows[Workflows]
        Tasks[HR Tasks]
        Reminders[Reminders]
        ESS[ESS Policies]
    end
    
    subgraph Insights["Insights Layer"]
        Sentiment[Sentiment]
        Recognition[Recognition]
        Dashboards[Dashboards]
        Audit[Audit Logs]
    end
    
    Foundation --> Core
    Core --> Automation
    Automation --> Insights`;

  const helpDeskFlowDiagram = `flowchart TD
    A[Ticket Created] --> B{Auto-Assign?}
    B -->|Yes| C[Assigned to Agent]
    B -->|No| D[Unassigned Queue]
    D --> C
    C --> E[In Progress]
    E --> F{Needs Info?}
    F -->|Yes| G[Pending - Awaiting Response]
    F -->|No| H{Resolved?}
    G -->|Response| E
    G -->|Timeout| I{SLA Breach?}
    I -->|Yes| J[Escalate]
    J --> E
    H -->|Yes| K[Resolved]
    H -->|No| E
    K --> L{Satisfied?}
    L -->|Yes| M[Closed]
    L -->|No| N[Reopened]
    N --> E`;

  const workflowEngineDiagram = `flowchart LR
    subgraph Trigger["Trigger Events"]
        ESS[ESS Request]
        Trans[Transaction]
        Doc[Document]
    end
    
    subgraph Engine["Approval Engine"]
        Match[Match Policy]
        Route[Determine Route]
        Notify[Send Notifications]
    end
    
    subgraph Approvers["Approver Actions"]
        Approve[Approve]
        Reject[Reject]
        Delegate[Delegate]
    end
    
    subgraph Outcome["Outcomes"]
        Apply[Apply Changes]
        Deny[Deny with Reason]
        Escalate[Escalate]
    end
    
    Trigger --> Match
    Match --> Route
    Route --> Notify
    Notify --> Approvers
    Approve --> Apply
    Reject --> Deny
    Delegate --> Route`;

  const essChangeFlowDiagram = `flowchart TD
    A[Employee Submits] --> B[Request Created]
    B --> C{Risk Level}
    C -->|Low| D{Auto-Approve?}
    C -->|Medium| E[HR Review]
    C -->|High| F[Senior HR + Docs]
    D -->|Yes| G[Auto-Approved]
    D -->|No| E
    E --> H{Decision}
    F --> H
    H -->|Approve| I[Update Record]
    H -->|Reject| J[Notify - Rejected]
    H -->|Info Needed| K[Request Info]
    K --> E
    G --> I
    I --> L[Notify - Approved]`;

  const notificationSystemDiagram = `flowchart TD
    A[Event Triggered] --> B{Rule Match?}
    B -->|No| C[No Action]
    B -->|Yes| D[Load Template]
    D --> E[Resolve Recipients]
    E --> F[Populate Variables]
    F --> G{Channel}
    G -->|Email| H[Send Email]
    G -->|In-App| I[Push Alert]
    G -->|SMS| J[Send SMS]
    H --> K{Delivered?}
    I --> L[Track Read]
    J --> K
    K -->|Yes| M[Log Success]
    K -->|No| N{Retry?}
    N -->|Yes| O[Queue Retry]
    N -->|No| P[Log Failure]
    O --> G`;

  const crossModuleIntegrationDiagram = `flowchart LR
    subgraph HRHub["HR Hub"]
        Compliance2[Compliance]
        Milestones2[Milestones]
        KB2[Knowledge Base]
    end
    
    subgraph Workforce["Workforce"]
        OrgStructure[Org Structure]
        EmpData[Employee Data]
        Certs[Certifications]
    end
    
    subgraph Appraisals["Appraisals"]
        Reviews[Performance Reviews]
        Goals[Goals]
    end
    
    subgraph Learning["Learning"]
        Training[Training Assignment]
        Courses[Courses]
    end
    
    Workforce -->|Org Data| HRHub
    HRHub -->|Compliance Training| Learning
    HRHub -->|Milestone Events| Appraisals
    Appraisals -->|IDP| Learning
    Workforce -->|Cert Expiry| Compliance2`;

  return (
    <div className="space-y-8">
      <div data-manual-anchor="diagrams" id="diagrams">
        <h2 className="text-2xl font-bold mb-4">Architecture Diagrams</h2>
        <p className="text-muted-foreground mb-6">
          Visual representations of HR Hub's system architecture, data flows, and integration patterns.
          Click any diagram to view in full-screen mode with zoom controls.
        </p>
      </div>

      {/* Module Architecture */}
      <WorkflowDiagram
        title="HR Hub Module Architecture"
        description="Four-layer architecture showing how foundation data flows through core services, automation, and insights layers."
        diagram={moduleArchitectureDiagram}
      />

      {/* Help Desk Flow */}
      <WorkflowDiagram
        title="Help Desk Ticket Lifecycle"
        description="Complete ticket lifecycle from creation through resolution, including SLA escalation paths and satisfaction feedback loops."
        diagram={helpDeskFlowDiagram}
      />

      {/* Workflow Engine */}
      <WorkflowDiagram
        title="Workflow & Approval Engine"
        description="How approval policies route requests through the engine, including delegation handling and escalation rules."
        diagram={workflowEngineDiagram}
      />

      {/* ESS Change Flow */}
      <WorkflowDiagram
        title="ESS Change Request Flow"
        description="Employee Self-Service request processing based on risk level, from submission through approval and system update."
        diagram={essChangeFlowDiagram}
      />

      {/* Notification System */}
      <WorkflowDiagram
        title="Notification & Reminder System"
        description="Event-driven notification flow including rule matching, template selection, multi-channel delivery, and tracking."
        diagram={notificationSystemDiagram}
      />

      {/* Cross-Module Integration */}
      <WorkflowDiagram
        title="Cross-Module Data Integration"
        description="Data flows between HR Hub and connected modules including Workforce, Appraisals, and Learning."
        diagram={crossModuleIntegrationDiagram}
      />

      {/* Diagram Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Diagram Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Shape Meanings</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 border-2 border-primary rounded" />
                  <span>Process / Action</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 border-2 border-primary transform rotate-45 scale-75" />
                  <span>Decision Point</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 border-2 border-dashed border-muted-foreground rounded" />
                  <span>Subgraph / Group</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Flow Indicators</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Yes/No</Badge>
                  <span>Conditional paths</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">→</Badge>
                  <span>Data/process flow</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">|Label|</Badge>
                  <span>Labeled connection</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Layer Colors</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-500" />
                  <span>Foundation Layer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-purple-500" />
                  <span>Core Services</span>
                </div>
                <div className="flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-green-500" />
                  <span>Automation Layer</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
