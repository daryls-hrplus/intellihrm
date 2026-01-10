import { 
  Network, 
  ArrowRight, 
  ArrowLeftRight, 
  Sparkles,
  Printer,
  Download,
  Shield,
  Users,
  Building2,
  Clock,
  Calendar,
  DollarSign,
  Award,
  GraduationCap,
  Target,
  MessageSquare,
  TrendingUp,
  Heart,
  AlertTriangle,
  Scale,
  Package,
  HelpCircle,
  Settings,
  FileText,
  Briefcase,
  UserMinus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import { useRef } from "react";

// Module definitions with all 25 modules
const MODULES = {
  // Prologue
  admin_security: { name: "Admin & Security", icon: Shield, capabilities: 70, act: "prologue" },
  hr_hub: { name: "HR Hub", icon: FileText, capabilities: 65, act: "prologue" },
  
  // Act 1
  recruitment: { name: "Recruitment", icon: Users, capabilities: 75, act: "act1" },
  onboarding: { name: "Onboarding", icon: Briefcase, capabilities: 55, act: "act1" },
  workforce: { name: "Workforce Admin", icon: Building2, capabilities: 60, act: "act1" },
  offboarding: { name: "Offboarding", icon: UserMinus, capabilities: 55, act: "act1" },
  
  // Act 2
  ess: { name: "Employee Self-Service", icon: Users, capabilities: 45, act: "act2" },
  mss: { name: "Manager Self-Service", icon: TrendingUp, capabilities: 60, act: "act2" },
  time: { name: "Time & Attendance", icon: Clock, capabilities: 55, act: "act2" },
  leave: { name: "Leave Management", icon: Calendar, capabilities: 50, act: "act2" },
  
  // Act 3
  payroll: { name: "Payroll", icon: DollarSign, capabilities: 85, act: "act3" },
  compensation: { name: "Compensation", icon: Award, capabilities: 55, act: "act3" },
  benefits: { name: "Benefits", icon: Heart, capabilities: 60, act: "act3" },
  
  // Act 4
  learning: { name: "Learning & LMS", icon: GraduationCap, capabilities: 130, act: "act4" },
  goals: { name: "Goals & OKRs", icon: Target, capabilities: 45, act: "act4" },
  appraisals: { name: "Appraisals", icon: Award, capabilities: 50, act: "act4" },
  feedback_360: { name: "360 Feedback", icon: MessageSquare, capabilities: 35, act: "act4" },
  continuous_perf: { name: "Continuous Performance", icon: TrendingUp, capabilities: 55, act: "act4" },
  succession: { name: "Succession Planning", icon: TrendingUp, capabilities: 50, act: "act4" },
  
  // Act 5
  health_safety: { name: "Health & Safety", icon: AlertTriangle, capabilities: 120, act: "act5" },
  employee_relations: { name: "Employee Relations", icon: Scale, capabilities: 95, act: "act5" },
  company_property: { name: "Company Property", icon: Package, capabilities: 65, act: "act5" },
  
  // Epilogue
  help_center: { name: "Help Center", icon: HelpCircle, capabilities: 85, act: "epilogue" },
  
  // Cross-cutting
  platform_features: { name: "Platform Features", icon: Settings, capabilities: 70, act: "cross" },
  regional_compliance: { name: "Regional Compliance", icon: Shield, capabilities: 50, act: "cross" },
} as const;

type ModuleKey = keyof typeof MODULES;

// Act configurations - using lighter pastel colors to match Act headings
const ACTS = {
  prologue: { name: "Prologue: Foundation", color: "bg-slate-500/15", textColor: "text-slate-700 dark:text-slate-300", borderColor: "border-slate-400/40", moduleColor: "bg-slate-500/20 border-slate-400/50" },
  act1: { name: "Act 1: Attract, Onboard & Transition", color: "bg-blue-500/15", textColor: "text-blue-700 dark:text-blue-300", borderColor: "border-blue-400/40", moduleColor: "bg-blue-500/20 border-blue-400/50" },
  act2: { name: "Act 2: Enable & Engage", color: "bg-emerald-500/15", textColor: "text-emerald-700 dark:text-emerald-300", borderColor: "border-emerald-400/40", moduleColor: "bg-emerald-500/20 border-emerald-400/50" },
  act3: { name: "Act 3: Pay & Reward", color: "bg-amber-500/15", textColor: "text-amber-700 dark:text-amber-300", borderColor: "border-amber-400/40", moduleColor: "bg-amber-500/20 border-amber-400/50" },
  act4: { name: "Act 4: Develop & Grow", color: "bg-purple-500/15", textColor: "text-purple-700 dark:text-purple-300", borderColor: "border-purple-400/40", moduleColor: "bg-purple-500/20 border-purple-400/50" },
  act5: { name: "Act 5: Protect & Support", color: "bg-red-500/15", textColor: "text-red-700 dark:text-red-300", borderColor: "border-red-400/40", moduleColor: "bg-red-500/20 border-red-400/50" },
  epilogue: { name: "Epilogue: Continuous Excellence", color: "bg-indigo-500/15", textColor: "text-indigo-700 dark:text-indigo-300", borderColor: "border-indigo-400/40", moduleColor: "bg-indigo-500/20 border-indigo-400/50" },
  cross: { name: "Cross-Cutting Intelligence", color: "bg-slate-700", textColor: "text-white", borderColor: "border-slate-500", moduleColor: "bg-slate-600 border-slate-400" },
};

// Key integration pipelines
const INTEGRATION_PIPELINES = [
  {
    name: "Hire-to-Pay",
    flow: ["recruitment", "onboarding", "workforce", "payroll"] as ModuleKey[],
    description: "Zero re-entry from offer acceptance to first paycheck",
    dataTypes: "Candidate data → Employee record → Bank details → Pay calculation"
  },
  {
    name: "Performance-to-Pay",
    flow: ["goals", "appraisals", "compensation", "payroll"] as ModuleKey[],
    description: "Ratings automatically inform merit increases and bonuses",
    dataTypes: "Objectives → Scores → Merit % → Salary update"
  },
  {
    name: "Time-to-Pay",
    flow: ["time", "leave", "payroll"] as ModuleKey[],
    description: "Hours worked and absences flow directly to pay",
    dataTypes: "Clock events → Leave balances → Gross pay"
  },
  {
    name: "Learning-to-Succession",
    flow: ["learning", "goals", "appraisals", "succession"] as ModuleKey[],
    description: "Development drives leadership pipeline",
    dataTypes: "Courses → Competencies → Ratings → Readiness"
  },
  {
    name: "Safety-to-Compliance",
    flow: ["health_safety", "learning", "workforce"] as ModuleKey[],
    description: "Incidents trigger training and record updates",
    dataTypes: "Incident → Required training → Completion → Employee file"
  },
  {
    name: "Self-Service Hub",
    flow: ["ess", "time", "leave", "benefits", "learning"] as ModuleKey[],
    description: "Single portal for complete work life management",
    dataTypes: "Requests → Approvals → Updates → Notifications"
  },
  {
    name: "Manager Intelligence",
    flow: ["mss", "goals", "appraisals", "compensation"] as ModuleKey[],
    description: "Real-time team insights and actions",
    dataTypes: "Team data → Analytics → Recommendations → Actions"
  },
  {
    name: "Exit-to-Settlement",
    flow: ["offboarding", "company_property", "payroll"] as ModuleKey[],
    description: "Complete offboarding with final settlement",
    dataTypes: "Exit request → Asset returns → Final pay"
  },
];

// Data flow matrix
const DATA_FLOW_MATRIX: { source: ModuleKey; target: ModuleKey; dataType: string; direction: "one-way" | "bidirectional" }[] = [
  { source: "recruitment", target: "onboarding", dataType: "Hired candidates", direction: "one-way" },
  { source: "onboarding", target: "workforce", dataType: "New employee records", direction: "one-way" },
  { source: "workforce", target: "payroll", dataType: "Employee & job data", direction: "bidirectional" },
  { source: "workforce", target: "time", dataType: "Schedule assignments", direction: "one-way" },
  { source: "time", target: "payroll", dataType: "Hours & overtime", direction: "bidirectional" },
  { source: "leave", target: "payroll", dataType: "Leave pay", direction: "one-way" },
  { source: "goals", target: "appraisals", dataType: "Goal achievement", direction: "bidirectional" },
  { source: "appraisals", target: "compensation", dataType: "Performance ratings", direction: "bidirectional" },
  { source: "compensation", target: "payroll", dataType: "Salary changes", direction: "one-way" },
  { source: "learning", target: "appraisals", dataType: "Competency data", direction: "bidirectional" },
  { source: "appraisals", target: "succession", dataType: "High potentials", direction: "one-way" },
  { source: "health_safety", target: "learning", dataType: "Compliance training", direction: "one-way" },
  { source: "employee_relations", target: "payroll", dataType: "Final settlement", direction: "one-way" },
  { source: "offboarding", target: "company_property", dataType: "Asset returns", direction: "bidirectional" },
  { source: "benefits", target: "payroll", dataType: "Deductions", direction: "one-way" },
  { source: "ess", target: "time", dataType: "Clock in/out", direction: "one-way" },
  { source: "ess", target: "leave", dataType: "Leave requests", direction: "one-way" },
  { source: "mss", target: "appraisals", dataType: "Reviews & calibration", direction: "one-way" },
  { source: "feedback_360", target: "appraisals", dataType: "Multi-rater feedback", direction: "one-way" },
  { source: "continuous_perf", target: "appraisals", dataType: "Check-in data", direction: "one-way" },
];

function ModuleBox({ moduleKey, className }: { moduleKey: ModuleKey; className?: string }) {
  const module = MODULES[moduleKey];
  const Icon = module.icon;
  
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg border print:border",
      "min-w-[140px]",
      className
    )}>
      <Icon className="h-4 w-4 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold truncate">{module.name}</div>
        <div className="text-[10px] opacity-70">{module.capabilities}+ capabilities</div>
      </div>
    </div>
  );
}

function ActSection({ actKey, modules }: { actKey: keyof typeof ACTS; modules: ModuleKey[] }) {
  const act = ACTS[actKey];
  const isDarkSection = actKey === "cross";
  
  return (
    <div className={cn(
      "rounded-xl p-4 print:p-3 border",
      act.color, 
      act.borderColor,
      "print:break-inside-avoid"
    )}>
      <h4 className={cn("text-sm font-bold mb-3", act.textColor)}>{act.name}</h4>
      <div className="flex flex-wrap gap-2">
        {modules.map(moduleKey => (
          <ModuleBox 
            key={moduleKey} 
            moduleKey={moduleKey} 
            className={cn(
              act.moduleColor,
              isDarkSection ? "text-white" : act.textColor
            )} 
          />
        ))}
      </div>
    </div>
  );
}

function PipelineCard({ pipeline }: { pipeline: typeof INTEGRATION_PIPELINES[0] }) {
  return (
    <div className="border rounded-lg p-3 bg-muted/30 print:break-inside-avoid">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="text-xs">{pipeline.name}</Badge>
      </div>
      <div className="flex items-center gap-1 flex-wrap mb-2">
        {pipeline.flow.map((moduleKey, idx) => (
          <div key={moduleKey} className="flex items-center gap-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/10">
              {MODULES[moduleKey].name}
            </span>
            {idx < pipeline.flow.length - 1 && (
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{pipeline.description}</p>
      <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono">{pipeline.dataTypes}</p>
    </div>
  );
}

export function PrintableIntegrationDiagram() {
  const diagramRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPNG = async () => {
    if (!diagramRef.current) return;
    
    const canvas = await html2canvas(diagramRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
    });
    
    const link = document.createElement("a");
    link.download = "intelli-hrm-integration-diagram.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const totalCapabilities = Object.values(MODULES).reduce((sum, m) => sum + m.capabilities, 0);
  const totalIntegrations = DATA_FLOW_MATRIX.length;
  const bidirectionalFlows = DATA_FLOW_MATRIX.filter(d => d.direction === "bidirectional").length;

  return (
    <div className="space-y-6">
      {/* Export Controls - Hidden in print */}
      <div className="flex items-center justify-end gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print PDF
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPNG}>
          <Download className="h-4 w-4 mr-2" />
          Export PNG
        </Button>
      </div>

      {/* Printable Content */}
      <div 
        ref={diagramRef} 
        className="bg-background p-6 print:p-0 space-y-6 print:space-y-4"
        style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      >
        {/* Header */}
        <div className="text-center border-b pb-4 print:pb-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Network className="h-8 w-8 text-primary print:text-slate-800" />
            <h1 className="text-2xl font-bold print:text-xl">Intelli HRM Platform Integration Architecture</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Complete Module Connectivity Across the Employee Lifecycle
          </p>
          
          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{Object.keys(MODULES).length}</div>
              <div className="text-xs text-muted-foreground">Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{totalCapabilities}+</div>
              <div className="text-xs text-muted-foreground">Capabilities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalIntegrations * 5}+</div>
              <div className="text-xs text-muted-foreground">Integrations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{bidirectionalFlows}</div>
              <div className="text-xs text-muted-foreground">Bidirectional</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-600">0</div>
              <div className="text-xs text-muted-foreground">Manual Re-Entry</div>
            </div>
          </div>
        </div>

        {/* Visual Diagram - Act Layers */}
        <div className="space-y-3 print:space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Module Architecture by Act
          </h3>
          
          {/* Foundation */}
          <ActSection actKey="prologue" modules={["admin_security", "hr_hub"]} />
          
          {/* Flow Arrow */}
          <div className="flex justify-center py-1 print:py-0">
            <div className="flex flex-col items-center text-muted-foreground">
              <div className="w-0.5 h-4 bg-muted-foreground/30" />
              <ArrowRight className="h-4 w-4 rotate-90" />
            </div>
          </div>
          
          {/* Act 1 */}
          <ActSection actKey="act1" modules={["recruitment", "onboarding", "workforce", "offboarding"]} />
          
          <div className="flex justify-center py-1 print:py-0">
            <div className="flex flex-col items-center text-muted-foreground">
              <div className="w-0.5 h-4 bg-muted-foreground/30" />
              <ArrowRight className="h-4 w-4 rotate-90" />
            </div>
          </div>
          
          {/* Act 2 */}
          <ActSection actKey="act2" modules={["ess", "mss", "time", "leave"]} />
          
          <div className="flex justify-center py-1 print:py-0">
            <div className="flex flex-col items-center text-muted-foreground">
              <div className="w-0.5 h-4 bg-muted-foreground/30" />
              <ArrowRight className="h-4 w-4 rotate-90" />
            </div>
          </div>
          
          {/* Act 3 */}
          <ActSection actKey="act3" modules={["payroll", "compensation", "benefits"]} />
          
          <div className="flex justify-center py-1 print:py-0">
            <div className="flex flex-col items-center text-muted-foreground">
              <div className="w-0.5 h-4 bg-muted-foreground/30" />
              <ArrowRight className="h-4 w-4 rotate-90" />
            </div>
          </div>
          
          {/* Act 4 */}
          <ActSection actKey="act4" modules={["learning", "goals", "appraisals", "feedback_360", "continuous_perf", "succession"]} />
          
          <div className="flex justify-center py-1 print:py-0">
            <div className="flex flex-col items-center text-muted-foreground">
              <div className="w-0.5 h-4 bg-muted-foreground/30" />
              <ArrowRight className="h-4 w-4 rotate-90" />
            </div>
          </div>
          
          {/* Act 5 */}
          <ActSection actKey="act5" modules={["health_safety", "employee_relations", "company_property"]} />
          
          <div className="flex justify-center py-1 print:py-0">
            <div className="flex flex-col items-center text-muted-foreground">
              <div className="w-0.5 h-4 bg-muted-foreground/30" />
              <ArrowRight className="h-4 w-4 rotate-90" />
            </div>
          </div>
          
          {/* Epilogue */}
          <ActSection actKey="epilogue" modules={["help_center"]} />
          
          <div className="flex justify-center py-1 print:py-0">
            <div className="flex flex-col items-center text-muted-foreground">
              <div className="w-0.5 h-4 bg-muted-foreground/30" />
              <ArrowRight className="h-4 w-4 rotate-90" />
            </div>
          </div>
          
          {/* Cross-Cutting */}
          <ActSection actKey="cross" modules={["platform_features", "regional_compliance"]} />
        </div>

        {/* Key Integration Pipelines */}
        <div className="print:break-before-page print:pt-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Key Integration Pipelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2">
            {INTEGRATION_PIPELINES.map((pipeline, idx) => (
              <PipelineCard key={idx} pipeline={pipeline} />
            ))}
          </div>
        </div>

        {/* Data Flow Matrix */}
        <div className="print:break-before-page print:pt-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            Data Flow Matrix
          </h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Source Module</TableHead>
                  <TableHead className="font-semibold">Target Module</TableHead>
                  <TableHead className="font-semibold">Data Exchanged</TableHead>
                  <TableHead className="font-semibold text-center">Direction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DATA_FLOW_MATRIX.map((flow, idx) => (
                  <TableRow key={idx} className="print:break-inside-avoid">
                    <TableCell className="font-medium text-sm">{MODULES[flow.source].name}</TableCell>
                    <TableCell className="text-sm">{MODULES[flow.target].name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{flow.dataType}</TableCell>
                    <TableCell className="text-center">
                      {flow.direction === "bidirectional" ? (
                        <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600">
                          <ArrowLeftRight className="h-3 w-3 mr-1" />
                          Bidirectional
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600">
                          <ArrowRight className="h-3 w-3 mr-1" />
                          One-Way
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Legend */}
        <div className="border-t pt-4 print:pt-2">
          <h4 className="text-sm font-semibold mb-3">Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-800" />
              <span>Foundation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-800" />
              <span>Act 1: Attract & Onboard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-800" />
              <span>Act 2: Enable & Engage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-700" />
              <span>Act 3: Pay & Reward</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-800" />
              <span>Act 4: Develop & Grow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-800" />
              <span>Act 5: Protect & Support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-indigo-800" />
              <span>Epilogue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-700" />
              <span>Cross-Cutting</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-blue-500" />
              <span className="text-xs">One-Way Data Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-emerald-500" />
              <span className="text-xs">Bidirectional Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-xs">AI Intelligence Layer</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground border-t pt-4 print:pt-2">
          <p>Intelli HRM Platform Integration Architecture • Generated {new Date().toLocaleDateString()}</p>
          <p className="mt-1">© Intelli HRM - AI-First Enterprise HRMS for Caribbean, Africa & Global Markets</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:break-before-page {
            break-before: page;
          }
          
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
