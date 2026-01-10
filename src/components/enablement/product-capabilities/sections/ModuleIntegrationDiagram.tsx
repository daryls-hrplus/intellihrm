import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkflowDiagram } from "@/components/enablement/manual/components/WorkflowDiagram";
import { PrintableIntegrationDiagram } from "../components/PrintableIntegrationDiagram";
import { 
  Network, 
  ArrowRight, 
  ArrowLeftRight, 
  Sparkles,
  Users,
  DollarSign,
  Clock,
  GraduationCap,
  Shield,
  HeartHandshake,
  Printer,
  FileText
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const INTEGRATION_DIAGRAM = `flowchart TB
    %% Foundation Layer - Governance to All
    subgraph FOUNDATION["🔒 FOUNDATION LAYER"]
        direction LR
        ADMIN["Admin & Security<br/>70+ capabilities"]
        HRHUB["HR Hub<br/>65+ capabilities"]
    end

    %% Act 1: Attract & Onboard
    subgraph ACT1["🎯 ACT 1: ATTRACT, ONBOARD & TRANSITION"]
        RECRUIT["Recruitment<br/>75+ capabilities"]
        ONBOARD["Onboarding<br/>55+ capabilities"]
        WORKFORCE["Workforce Admin<br/>60+ capabilities"]
        OFFBOARD["Offboarding<br/>55+ capabilities"]
    end

    %% Act 2: Enable & Engage
    subgraph ACT2["⚡ ACT 2: ENABLE & ENGAGE"]
        ESS["Employee Self-Service<br/>45+ capabilities"]
        MSS["Manager Self-Service<br/>60+ capabilities"]
        TIME["Time & Attendance<br/>55+ capabilities"]
        LEAVE["Leave Management<br/>50+ capabilities"]
    end

    %% Act 3: Pay & Reward
    subgraph ACT3["💰 ACT 3: PAY & REWARD"]
        PAYROLL["Payroll<br/>85+ capabilities"]
        COMP["Compensation<br/>55+ capabilities"]
        BENEFITS["Benefits<br/>60+ capabilities"]
    end

    %% Act 4: Develop & Grow
    subgraph ACT4["📈 ACT 4: DEVELOP & GROW"]
        LEARNING["Learning & LMS<br/>130+ capabilities"]
        GOALS["Goals & OKRs<br/>45+ capabilities"]
        APPRAISALS["Appraisals<br/>50+ capabilities"]
        FEEDBACK360["360 Feedback<br/>35+ capabilities"]
        CONTPERF["Continuous Performance<br/>55+ capabilities"]
        SUCCESSION["Succession Planning<br/>50+ capabilities"]
    end

    %% Act 5: Protect & Support
    subgraph ACT5["🛡️ ACT 5: PROTECT & SUPPORT"]
        HSE["Health & Safety<br/>120+ capabilities"]
        ER["Employee Relations<br/>95+ capabilities"]
        PROPERTY["Company Property<br/>65+ capabilities"]
    end

    %% Epilogue
    subgraph EPILOGUE["✨ CONTINUOUS EXCELLENCE"]
        HELP["Help Center<br/>85+ capabilities"]
    end

    %% Foundation Governance (dashed - applies to all)
    ADMIN -.->|"Security & Audit"| WORKFORCE
    ADMIN -.->|"Access Control"| PAYROLL
    HRHUB -.->|"Policies"| ESS
    HRHUB -.->|"Documents"| MSS

    %% Act 1 Flows
    RECRUIT -->|"Hired Candidates"| ONBOARD
    ONBOARD -->|"New Employees"| WORKFORCE
    RECRUIT -->|"Salary Benchmarking"| COMP
    RECRUIT -->|"Onboarding Courses"| LEARNING
    WORKFORCE -->|"Employee Records"| ESS
    WORKFORCE -->|"Team Data"| MSS
    WORKFORCE <-->|"Compensation Data"| PAYROLL
    WORKFORCE -->|"Schedule Assignments"| TIME
    WORKFORCE -->|"Manager Relationships"| GOALS
    WORKFORCE -->|"Career History"| SUCCESSION
    WORKFORCE -->|"Skills Data"| LEARNING
    WORKFORCE -->|"Eligibility Data"| BENEFITS
    WORKFORCE -->|"Job & Location"| HSE
    WORKFORCE -->|"Employee Data"| ER
    WORKFORCE -->|"Department Data"| PROPERTY
    OFFBOARD -->|"Exit Processing"| PAYROLL
    OFFBOARD <-->|"Asset Returns"| PROPERTY

    %% Act 2 Flows
    ESS -->|"Clock In/Out"| TIME
    ESS -->|"Leave Requests"| LEAVE
    ESS -->|"Enrollment"| BENEFITS
    ESS -->|"Training Enrollment"| LEARNING
    ESS -->|"Goals & Feedback"| GOALS
    MSS -->|"Approvals"| TIME
    MSS -->|"Approvals"| LEAVE
    MSS -->|"Reviews & Calibration"| APPRAISALS
    MSS -->|"Change Requests"| COMP
    TIME <-->|"Hours & Overtime"| PAYROLL
    TIME -->|"Absence Sync"| LEAVE
    TIME -->|"Work Hours"| HSE
    LEAVE -->|"Leave Pay"| PAYROLL
    LEAVE -->|"Coverage Data"| WORKFORCE

    %% Act 3 Flows
    COMP -->|"Salary Changes"| PAYROLL
    COMP <-->|"Rating-Based Guidelines"| APPRAISALS
    COMP -->|"Offer Benchmarks"| RECRUIT
    COMP -->|"Leadership Pay Data"| SUCCESSION
    BENEFITS -->|"Deductions"| PAYROLL
    BENEFITS -->|"Self-Service"| ESS
    PAYROLL -->|"Journal Entries"| FINANCE["Finance/GL"]
    PAYROLL -->|"Final Settlement"| ER

    %% Act 4 Flows
    GOALS <-->|"Goal Achievement"| APPRAISALS
    FEEDBACK360 -->|"Multi-Rater Input"| APPRAISALS
    CONTPERF -->|"Check-in Data"| APPRAISALS
    APPRAISALS -->|"Pay Recommendations"| COMP
    APPRAISALS -->|"High Potentials"| SUCCESSION
    LEARNING <-->|"Development Gaps"| APPRAISALS
    LEARNING -->|"Leadership Dev"| SUCCESSION
    LEARNING -->|"Onboarding"| RECRUIT
    LEARNING -->|"Safety Training"| HSE
    SUCCESSION -->|"Position Data"| WORKFORCE

    %% Act 5 Flows
    HSE -->|"Incidents"| WORKFORCE
    HSE -->|"Compliance Training"| LEARNING
    ER -->|"Final Settlement"| PAYROLL
    ER <-->|"Asset Returns"| PROPERTY
    PROPERTY -->|"Deductions"| PAYROLL

    %% Epilogue Flows
    HELP -.->|"Policy Access"| HRHUB
    HELP -.->|"Training Recs"| LEARNING
    HELP -.->|"Context Help"| ESS

    %% Styling
    classDef foundation fill:#1e293b,stroke:#475569,color:#f8fafc
    classDef act1 fill:#1e40af,stroke:#3b82f6,color:#f8fafc
    classDef act2 fill:#047857,stroke:#10b981,color:#f8fafc
    classDef act3 fill:#b45309,stroke:#f59e0b,color:#f8fafc
    classDef act4 fill:#7c3aed,stroke:#a78bfa,color:#f8fafc
    classDef act5 fill:#dc2626,stroke:#f87171,color:#f8fafc
    classDef epilogue fill:#4338ca,stroke:#818cf8,color:#f8fafc
    classDef external fill:#6b7280,stroke:#9ca3af,color:#f8fafc

    class ADMIN,HRHUB foundation
    class RECRUIT,ONBOARD,WORKFORCE,OFFBOARD act1
    class ESS,MSS,TIME,LEAVE act2
    class PAYROLL,COMP,BENEFITS act3
    class LEARNING,GOALS,APPRAISALS,FEEDBACK360,CONTPERF,SUCCESSION act4
    class HSE,ER,PROPERTY act5
    class HELP epilogue
    class FINANCE external
`;

interface IntegrationHighlight {
  icon: React.ElementType;
  title: string;
  flow: string;
  description: string;
  color: string;
}

const integrationHighlights: IntegrationHighlight[] = [
  {
    icon: Users,
    title: "Hire-to-Pay Pipeline",
    flow: "Recruitment → Onboarding → Workforce → Payroll",
    description: "New hires flow seamlessly from offer acceptance to first paycheck with zero re-entry",
    color: "text-blue-500",
  },
  {
    icon: DollarSign,
    title: "Performance-to-Pay Link",
    flow: "Goals ↔ Appraisals ↔ Compensation → Payroll",
    description: "Performance ratings automatically inform merit increases and bonus calculations",
    color: "text-amber-500",
  },
  {
    icon: Clock,
    title: "Time-to-Pay Automation",
    flow: "Time & Attendance ↔ Payroll",
    description: "Hours worked, overtime, and shift differentials flow directly to pay calculations",
    color: "text-emerald-500",
  },
  {
    icon: GraduationCap,
    title: "Development-to-Succession",
    flow: "Learning ↔ Goals → Appraisals → Succession",
    description: "High potentials identified, developed, and tracked for leadership pipeline",
    color: "text-purple-500",
  },
  {
    icon: HeartHandshake,
    title: "Self-Service Hub",
    flow: "ESS ↔ (Time, Leave, Benefits, Learning, Goals)",
    description: "Employees manage their complete work life from one unified portal",
    color: "text-teal-500",
  },
  {
    icon: Shield,
    title: "Compliance Thread",
    flow: "Admin & Security → All Modules → Finance/GL",
    description: "Complete audit trail from every action to financial impact with full governance",
    color: "text-slate-500",
  },
];

function IntegrationHighlightCard({ icon: Icon, title, flow, description, color }: IntegrationHighlight) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-muted ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-xs font-mono text-muted-foreground">{flow}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ModuleIntegrationDiagram() {
  const [showPrintable, setShowPrintable] = useState(false);

  return (
    <div className="space-y-6" id="integration-diagram">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            Unified Platform Integration
          </h2>
          <p className="text-muted-foreground">
            See how all 25 modules share data and intelligence seamlessly across the employee lifecycle
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showPrintable} onOpenChange={setShowPrintable}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                View Print-Friendly
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Print-Friendly Integration Diagram</DialogTitle>
              </DialogHeader>
              <PrintableIntegrationDiagram />
            </DialogContent>
          </Dialog>
          <Badge className="bg-primary/10 text-primary">
            <Sparkles className="h-3 w-3 mr-1" />
            Cross-Module AI Intelligence
          </Badge>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-blue-600">25</div>
            <div className="text-xs text-muted-foreground">Integrated Modules</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-emerald-600">100+</div>
            <div className="text-xs text-muted-foreground">Direct Integrations</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-purple-600">12</div>
            <div className="text-xs text-muted-foreground">Bidirectional Flows</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-amber-600">0</div>
            <div className="text-xs text-muted-foreground">Manual Re-Entry</div>
          </CardContent>
        </Card>
      </div>

      {/* Mermaid Diagram */}
      <WorkflowDiagram
        title="Module Integration Map"
        description="Click to expand. Solid lines show data flow, dashed lines show governance. Bidirectional arrows (↔) indicate two-way data sync."
        diagram={INTEGRATION_DIAGRAM}
      />

      {/* Legend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Connection Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <ArrowRight className="h-4 w-4 text-blue-500" />
              <div className="flex items-center gap-1">
                <div className="w-8 h-0.5 bg-blue-500" />
                <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-blue-500" />
              </div>
              <span>One-Way Data Flow</span>
            </div>
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="h-4 w-4 text-emerald-500" />
              <div className="flex items-center gap-1">
                <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-emerald-500" />
                <div className="w-8 h-0.5 bg-emerald-500" />
                <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-emerald-500" />
              </div>
              <span>Bidirectional Sync</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-slate-500" />
              <div className="w-12 h-0.5 border-t-2 border-dashed border-slate-500" />
              <span>Governance / Intelligence</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Integration Highlights */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Key Integration Value Propositions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrationHighlights.map((highlight, idx) => (
            <IntegrationHighlightCard key={idx} {...highlight} />
          ))}
        </div>
      </div>
    </div>
  );
}
