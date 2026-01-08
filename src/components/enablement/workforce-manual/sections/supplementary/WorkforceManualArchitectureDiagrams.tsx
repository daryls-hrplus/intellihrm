import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Network, Workflow } from 'lucide-react';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';

export const WorkforceManualArchitectureDiagrams = () => {
  const workforceDataModelDiagram = `flowchart TB
    subgraph Foundation["Organization Foundation"]
        Territory[Territory]
        Company[Company]
        Division[Division]
        Department[Department]
        Section[Section]
        Branch[Branch]
    end
    
    subgraph JobArch["Job Architecture"]
        JobFamily[Job Family]
        Job[Job Definition]
        Grade[Grade/Level]
        Position[Position]
    end
    
    subgraph Employee["Employee Data"]
        Profile[Employee Profile]
        Assignment[Position Assignment]
        Employment[Employment Record]
    end
    
    Territory --> Company
    Company --> Division
    Division --> Department
    Department --> Section
    Company --> Branch
    
    JobFamily --> Job
    Job --> Grade
    Job --> Position
    Position --> Department
    
    Profile --> Assignment
    Assignment --> Position
    Profile --> Employment`;

  const employeeLifecycleDiagram = `flowchart TD
    A[Candidate] --> B{Hired?}
    B -->|Yes| C[Pre-Hire]
    B -->|No| Z[Not Hired]
    C --> D[Active - Probation]
    D --> E{Probation Pass?}
    E -->|Yes| F[Active - Confirmed]
    E -->|No| G[Separated - Failed Probation]
    E -->|Extend| H[Active - Extended Probation]
    H --> E
    F --> I{Transaction?}
    I -->|Transfer| J[Process Transfer]
    I -->|Promotion| K[Process Promotion]
    I -->|Demotion| L[Process Demotion]
    I -->|Leave| M[On Leave]
    I -->|Separation| N[Separation Process]
    J --> F
    K --> F
    L --> F
    M --> F
    N --> O[Separated]
    O --> P{Rehire?}
    P -->|Yes| C
    P -->|No| Q[Archived]`;

  const positionControlFlowDiagram = `flowchart LR
    subgraph Planning["Workforce Planning"]
        Budget[Budget Allocation]
        Headcount[Headcount Plan]
        Forecast[Demand Forecast]
    end
    
    subgraph Creation["Position Creation"]
        Request[Position Request]
        Approval[Budget Approval]
        Create[Create Position]
    end
    
    subgraph Filling["Position Filling"]
        Vacancy[Vacancy Created]
        Requisition[Job Requisition]
        Hire[Hire/Transfer]
        Assign[Assignment]
    end
    
    subgraph Management["Ongoing Management"]
        Monitor[Monitor FTE]
        Reorg[Reorganization]
        Close[Close Position]
    end
    
    Budget --> Headcount
    Headcount --> Forecast
    Forecast --> Request
    Request --> Approval
    Approval --> Create
    Create --> Vacancy
    Vacancy --> Requisition
    Requisition --> Hire
    Hire --> Assign
    Assign --> Monitor
    Monitor --> Reorg
    Reorg --> Close`;

  const orgHierarchyDiagram = `flowchart TB
    subgraph Territory["Territory Level"]
        T1[Territory: Caribbean]
        T2[Territory: Africa]
    end
    
    subgraph Company["Company Level"]
        C1[Company: Jamaica Ltd]
        C2[Company: Trinidad Ltd]
        C3[Company: Ghana Ltd]
    end
    
    subgraph Dept["Department Level"]
        D1[HR Department]
        D2[Finance Department]
        D3[Operations]
    end
    
    subgraph Positions["Position Level"]
        P1[HR Manager]
        P2[HR Officer]
        P3[Finance Director]
    end
    
    T1 --> C1
    T1 --> C2
    T2 --> C3
    C1 --> D1
    C1 --> D2
    C2 --> D3
    D1 --> P1
    D1 --> P2
    D2 --> P3`;

  const crossModuleIntegrationDiagram = `flowchart LR
    subgraph Workforce["Workforce Module"]
        OrgData[Org Structure]
        EmpData[Employee Data]
        PositionData[Positions]
        Transactions[Transactions]
    end
    
    subgraph Downstream["Downstream Modules"]
        Payroll[Payroll]
        Benefits[Benefits]
        TnA[Time & Attendance]
        Performance[Performance]
        Succession[Succession]
        Learning[Learning]
    end
    
    OrgData -->|Cost Centers| Payroll
    OrgData -->|Departments| TnA
    EmpData -->|Demographics| Benefits
    EmpData -->|Profile| Performance
    PositionData -->|Job Family| Learning
    PositionData -->|Grade| Payroll
    Transactions -->|Hire| Payroll
    Transactions -->|Promotion| Succession
    EmpData -->|Competencies| Succession`;

  const transactionProcessingDiagram = `flowchart TD
    A[Transaction Initiated] --> B{Transaction Type}
    B -->|Hire| C[New Hire Process]
    B -->|Transfer| D[Transfer Process]
    B -->|Promotion| E[Promotion Process]
    B -->|Separation| F[Separation Process]
    
    C --> G[Create Employee Record]
    D --> H[Update Position Assignment]
    E --> I[Update Grade & Salary]
    F --> J[Initiate Offboarding]
    
    G --> K{Approval Required?}
    H --> K
    I --> K
    J --> K
    
    K -->|Yes| L[Route for Approval]
    K -->|No| M[Auto-Process]
    
    L --> N{Approved?}
    N -->|Yes| M
    N -->|No| O[Rejected - Notify]
    
    M --> P[Update Core Records]
    P --> Q[Trigger Workflows]
    Q --> R[Sync to Downstream]
    R --> S[Send Notifications]
    S --> T[Complete]`;

  return (
    <div className="space-y-8">
      <div data-manual-anchor="diagrams" id="diagrams">
        <h2 className="text-2xl font-bold mb-4">Architecture Diagrams</h2>
        <p className="text-muted-foreground mb-6">
          Visual representations of the Workforce module's data structures, workflows, and integration patterns.
          Click any diagram to view in full-screen mode with zoom controls.
        </p>
      </div>

      {/* Workforce Data Model */}
      <WorkflowDiagram
        title="Workforce Data Model"
        description="Entity relationships showing the hierarchy from Territory through to Employee Assignments."
        diagram={workforceDataModelDiagram}
      />

      {/* Employee Lifecycle */}
      <WorkflowDiagram
        title="Employee Lifecycle State Machine"
        description="Complete employee status transitions from candidate through separation, including probation, transactions, and rehire paths."
        diagram={employeeLifecycleDiagram}
      />

      {/* Position Control Flow */}
      <WorkflowDiagram
        title="Position Control Workflow"
        description="End-to-end position management from budget planning through position creation, filling, and ongoing management."
        diagram={positionControlFlowDiagram}
      />

      {/* Org Hierarchy */}
      <WorkflowDiagram
        title="Organization Hierarchy Tree"
        description="Multi-level organizational structure from Territory down to Position assignments across regions."
        diagram={orgHierarchyDiagram}
      />

      {/* Cross-Module Integration */}
      <WorkflowDiagram
        title="Cross-Module Data Integration"
        description="Data flows from Workforce to downstream modules including Payroll, Benefits, Time & Attendance, Performance, and Succession."
        diagram={crossModuleIntegrationDiagram}
      />

      {/* Transaction Processing */}
      <WorkflowDiagram
        title="Transaction Processing Flow"
        description="How employee transactions (hire, transfer, promotion, separation) flow through the system with approval routing and downstream sync."
        diagram={transactionProcessingDiagram}
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
                  <span>Entity / Process</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 border-2 border-primary transform rotate-45 scale-75" />
                  <span>Decision Point</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 border-2 border-dashed border-muted-foreground rounded" />
                  <span>Subgraph / Module</span>
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
                  <span>Core Entities</span>
                </div>
                <div className="flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-green-500" />
                  <span>Process Flow</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
