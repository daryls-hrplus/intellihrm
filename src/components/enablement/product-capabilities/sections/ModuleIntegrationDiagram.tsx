import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrintableIntegrationDiagram } from "../components/PrintableIntegrationDiagram";
import { 
  Network, 
  Sparkles,
  Users,
  DollarSign,
  Clock,
  GraduationCap,
  Shield,
  HeartHandshake
} from "lucide-react";

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
        <Badge className="bg-primary/10 text-primary w-fit">
          <Sparkles className="h-3 w-3 mr-1" />
          Cross-Module AI Intelligence
        </Badge>
      </div>

      {/* Print-Friendly Integration Diagram */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <PrintableIntegrationDiagram />
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
