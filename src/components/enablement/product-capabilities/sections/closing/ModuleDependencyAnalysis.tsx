import { 
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  Layers,
  Network,
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Act color mapping with improved contrast
const ACT_COLORS = {
  prologue: {
    bg: "bg-slate-100 dark:bg-slate-800/50",
    text: "text-slate-800 dark:text-slate-100",
    border: "border-slate-400 dark:border-slate-500",
    badge: "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-400",
  },
  act1: {
    bg: "bg-blue-50 dark:bg-blue-900/40",
    text: "text-blue-800 dark:text-blue-100",
    border: "border-blue-400 dark:border-blue-500",
    badge: "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 border-blue-400",
  },
  act2: {
    bg: "bg-emerald-50 dark:bg-emerald-900/40",
    text: "text-emerald-800 dark:text-emerald-100",
    border: "border-emerald-400 dark:border-emerald-500",
    badge: "bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 border-emerald-400",
  },
  act3: {
    bg: "bg-amber-50 dark:bg-amber-900/40",
    text: "text-amber-800 dark:text-amber-100",
    border: "border-amber-400 dark:border-amber-500",
    badge: "bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-100 border-amber-400",
  },
  act4: {
    bg: "bg-purple-50 dark:bg-purple-900/40",
    text: "text-purple-800 dark:text-purple-100",
    border: "border-purple-400 dark:border-purple-500",
    badge: "bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 border-purple-400",
  },
  act5: {
    bg: "bg-rose-50 dark:bg-rose-900/40",
    text: "text-rose-800 dark:text-rose-100",
    border: "border-rose-400 dark:border-rose-500",
    badge: "bg-rose-100 dark:bg-rose-800 text-rose-800 dark:text-rose-100 border-rose-400",
  },
  epilogue: {
    bg: "bg-indigo-50 dark:bg-indigo-900/40",
    text: "text-indigo-800 dark:text-indigo-100",
    border: "border-indigo-400 dark:border-indigo-500",
    badge: "bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-100 border-indigo-400",
  },
};

type ActType = keyof typeof ACT_COLORS;
type RiskLevel = "critical" | "high" | "medium" | "low";

interface ModuleDependency {
  moduleId: string;
  moduleName: string;
  act: ActType;
  prerequisites: string[];
  enables: string[];
  phase: 1 | 2 | 3 | 4 | 5;
  criticalPath: boolean;
  parallelWith?: string[];
  riskLevel: RiskLevel;
  implementationNotes?: string;
}

const MODULE_DEPENDENCIES: ModuleDependency[] = [
  // Prologue
  {
    moduleId: "admin-security",
    moduleName: "Admin & Security",
    act: "prologue",
    prerequisites: [],
    enables: ["hr-hub"],
    phase: 1,
    criticalPath: true,
    riskLevel: "critical",
    implementationNotes: "Must be first. Security policies affect all other modules.",
  },
  {
    moduleId: "hr-hub",
    moduleName: "HR Hub",
    act: "prologue",
    prerequisites: ["admin-security"],
    enables: ["workforce", "recruitment", "learning", "payroll", "ess", "mss"],
    phase: 1,
    criticalPath: true,
    riskLevel: "critical",
    implementationNotes: "Central configuration hub. Org structure, locations, and positions defined here.",
  },
  // Act 1
  {
    moduleId: "workforce",
    moduleName: "Workforce Management",
    act: "act1",
    prerequisites: ["hr-hub"],
    enables: ["ess", "mss", "time-attendance", "leave", "payroll", "learning", "goals", "health-safety", "employee-relations", "company-property"],
    phase: 2,
    criticalPath: true,
    riskLevel: "critical",
    implementationNotes: "Employee master data hub. All employee-facing modules depend on this.",
  },
  {
    moduleId: "recruitment",
    moduleName: "Recruitment",
    act: "act1",
    prerequisites: ["hr-hub", "workforce"],
    enables: ["onboarding"],
    phase: 3,
    criticalPath: false,
    parallelWith: ["learning", "goals"],
    riskLevel: "medium",
    implementationNotes: "Can be deferred if not hiring. Connects to Onboarding for seamless transitions.",
  },
  {
    moduleId: "onboarding",
    moduleName: "Onboarding",
    act: "act1",
    prerequisites: ["recruitment", "workforce"],
    enables: ["learning", "company-property"],
    phase: 3,
    criticalPath: false,
    parallelWith: ["offboarding"],
    riskLevel: "medium",
    implementationNotes: "Workflow-driven. Can run in parallel with Offboarding setup.",
  },
  {
    moduleId: "offboarding",
    moduleName: "Offboarding",
    act: "act1",
    prerequisites: ["workforce", "company-property"],
    enables: [],
    phase: 3,
    criticalPath: false,
    parallelWith: ["onboarding"],
    riskLevel: "low",
    implementationNotes: "Asset recovery integration with Company Property. Can be deferred.",
  },
  // Act 2
  {
    moduleId: "ess",
    moduleName: "Employee Self-Service",
    act: "act2",
    prerequisites: ["workforce"],
    enables: ["leave", "time-attendance"],
    phase: 2,
    criticalPath: true,
    parallelWith: ["mss"],
    riskLevel: "high",
    implementationNotes: "Employee portal. Should launch with or before Time & Leave.",
  },
  {
    moduleId: "mss",
    moduleName: "Manager Self-Service",
    act: "act2",
    prerequisites: ["workforce", "ess"],
    enables: ["goals", "appraisals", "continuous-performance"],
    phase: 2,
    criticalPath: true,
    parallelWith: ["ess"],
    riskLevel: "high",
    implementationNotes: "Manager portal. Required for approval workflows and team management.",
  },
  {
    moduleId: "time-attendance",
    moduleName: "Time & Attendance",
    act: "act2",
    prerequisites: ["workforce", "ess"],
    enables: ["payroll"],
    phase: 3,
    criticalPath: true,
    parallelWith: ["leave"],
    riskLevel: "high",
    implementationNotes: "Required before Payroll. Geofencing and device setup needed.",
  },
  {
    moduleId: "leave",
    moduleName: "Leave Management",
    act: "act2",
    prerequisites: ["workforce", "ess"],
    enables: ["payroll"],
    phase: 3,
    criticalPath: true,
    parallelWith: ["time-attendance"],
    riskLevel: "high",
    implementationNotes: "Accrual rules and entitlements. Required before Payroll.",
  },
  // Act 3
  {
    moduleId: "payroll",
    moduleName: "Payroll",
    act: "act3",
    prerequisites: ["workforce", "time-attendance", "leave", "hr-hub"],
    enables: ["benefits", "compensation"],
    phase: 4,
    criticalPath: true,
    riskLevel: "critical",
    implementationNotes: "Highest complexity. Requires Time, Leave, and complete org structure.",
  },
  {
    moduleId: "compensation",
    moduleName: "Compensation",
    act: "act3",
    prerequisites: ["payroll", "workforce"],
    enables: ["recruitment", "succession"],
    phase: 4,
    criticalPath: false,
    parallelWith: ["benefits"],
    riskLevel: "medium",
    implementationNotes: "Salary structures and bands. Feeds Recruitment offers and Succession planning.",
  },
  {
    moduleId: "benefits",
    moduleName: "Benefits",
    act: "act3",
    prerequisites: ["payroll", "workforce"],
    enables: [],
    phase: 4,
    criticalPath: false,
    parallelWith: ["compensation"],
    riskLevel: "medium",
    implementationNotes: "Plan configuration and enrollment. Can launch with or after Payroll.",
  },
  // Act 4
  {
    moduleId: "learning",
    moduleName: "Learning & LMS",
    act: "act4",
    prerequisites: ["workforce"],
    enables: ["succession", "goals"],
    phase: 3,
    criticalPath: false,
    parallelWith: ["goals", "health-safety"],
    riskLevel: "medium",
    implementationNotes: "Content upload and course creation. Can run in parallel with Performance modules.",
  },
  {
    moduleId: "goals",
    moduleName: "Goals Management",
    act: "act4",
    prerequisites: ["workforce", "mss"],
    enables: ["appraisals", "continuous-performance"],
    phase: 3,
    criticalPath: false,
    parallelWith: ["learning"],
    riskLevel: "medium",
    implementationNotes: "OKR/KPI framework. Required before Appraisals for goal-based reviews.",
  },
  {
    moduleId: "appraisals",
    moduleName: "Appraisals",
    act: "act4",
    prerequisites: ["goals", "workforce", "mss"],
    enables: ["compensation", "succession"],
    phase: 4,
    criticalPath: false,
    riskLevel: "medium",
    implementationNotes: "Cycle configuration. Feeds Compensation decisions and Succession nominations.",
  },
  {
    moduleId: "feedback-360",
    moduleName: "360 Feedback",
    act: "act4",
    prerequisites: ["workforce", "mss"],
    enables: ["appraisals"],
    phase: 4,
    criticalPath: false,
    parallelWith: ["continuous-performance"],
    riskLevel: "low",
    implementationNotes: "Multi-rater feedback. Optional enhancement to Appraisals.",
  },
  {
    moduleId: "continuous-performance",
    moduleName: "Continuous Performance",
    act: "act4",
    prerequisites: ["workforce", "mss", "goals"],
    enables: ["appraisals"],
    phase: 4,
    criticalPath: false,
    parallelWith: ["feedback-360"],
    riskLevel: "low",
    implementationNotes: "Check-ins and real-time feedback. Complements formal Appraisals.",
  },
  {
    moduleId: "succession",
    moduleName: "Succession Planning",
    act: "act4",
    prerequisites: ["appraisals", "learning", "workforce"],
    enables: [],
    phase: 5,
    criticalPath: false,
    riskLevel: "medium",
    implementationNotes: "Requires complete Performance stack. Talent pools and 9-box analysis.",
  },
  // Act 5
  {
    moduleId: "health-safety",
    moduleName: "Health & Safety",
    act: "act5",
    prerequisites: ["workforce"],
    enables: [],
    phase: 3,
    criticalPath: false,
    parallelWith: ["learning", "employee-relations"],
    riskLevel: "medium",
    implementationNotes: "Incident tracking and compliance. Can launch early for high-risk industries.",
  },
  {
    moduleId: "employee-relations",
    moduleName: "Employee Relations",
    act: "act5",
    prerequisites: ["workforce"],
    enables: [],
    phase: 3,
    criticalPath: false,
    parallelWith: ["health-safety"],
    riskLevel: "medium",
    implementationNotes: "Grievance and disciplinary workflows. Important for HR governance.",
  },
  {
    moduleId: "company-property",
    moduleName: "Company Property",
    act: "act5",
    prerequisites: ["workforce"],
    enables: ["offboarding"],
    phase: 3,
    criticalPath: false,
    parallelWith: ["health-safety", "employee-relations"],
    riskLevel: "low",
    implementationNotes: "Asset tracking. Integrates with Offboarding for recovery workflows.",
  },
  // Epilogue
  {
    moduleId: "help-center",
    moduleName: "Help Center",
    act: "epilogue",
    prerequisites: ["workforce"],
    enables: [],
    phase: 5,
    criticalPath: false,
    riskLevel: "low",
    implementationNotes: "Knowledge base and ticketing. Can launch anytime after Workforce.",
  },
];

const IMPLEMENTATION_PHASES = [
  {
    phase: 1,
    title: "Foundation",
    weeks: "1-3",
    description: "Security, governance, and central configuration",
    modules: ["admin-security", "hr-hub"],
  },
  {
    phase: 2,
    title: "Core Structure",
    weeks: "2-4",
    description: "Employee data and self-service portals",
    modules: ["workforce", "ess", "mss"],
  },
  {
    phase: 3,
    title: "Operations",
    weeks: "3-6",
    description: "Time, leave, and operational modules",
    modules: ["time-attendance", "leave", "recruitment", "onboarding", "offboarding", "learning", "goals", "health-safety", "employee-relations", "company-property"],
  },
  {
    phase: 4,
    title: "Compensation & Performance",
    weeks: "5-8",
    description: "Payroll, benefits, and performance management",
    modules: ["payroll", "compensation", "benefits", "appraisals", "feedback-360", "continuous-performance"],
  },
  {
    phase: 5,
    title: "Strategic",
    weeks: "7+",
    description: "Advanced talent and optimization",
    modules: ["succession", "help-center"],
  },
];

const getRiskBadge = (riskLevel: RiskLevel) => {
  const config = {
    critical: { bg: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-100 border border-red-400", icon: "🔴" },
    high: { bg: "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-100 border border-orange-400", icon: "🟠" },
    medium: { bg: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-100 border border-yellow-500", icon: "🟡" },
    low: { bg: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-100 border border-green-400", icon: "🟢" },
  };
  return config[riskLevel];
};

interface PhaseCardProps {
  phase: typeof IMPLEMENTATION_PHASES[0];
}

const PhaseCard = ({ phase }: PhaseCardProps) => {
  const phaseModules = MODULE_DEPENDENCIES.filter(m => phase.modules.includes(m.moduleId));
  
  return (
    <div className="relative">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <span className="text-xl font-bold text-primary">{phase.phase}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{phase.title}</h4>
            <Badge variant="outline" className="text-xs">
              Weeks {phase.weeks}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
          <div className="flex flex-wrap gap-2">
            {phaseModules.map(module => {
              const colors = ACT_COLORS[module.act];
              return (
                <Badge 
                  key={module.moduleId} 
                  className={cn("text-xs border", colors.badge, colors.border)}
                >
                  {module.criticalPath && "⚡ "}
                  {module.moduleName}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ModuleImpactCardProps {
  module: ModuleDependency;
}

const ModuleImpactCard = ({ module }: ModuleImpactCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const colors = ACT_COLORS[module.act];
  const riskConfig = getRiskBadge(module.riskLevel);
  
  const prerequisiteModules = MODULE_DEPENDENCIES.filter(m => 
    module.prerequisites.includes(m.moduleId)
  );
  const enablesModules = MODULE_DEPENDENCIES.filter(m => 
    module.enables.includes(m.moduleId)
  );
  const parallelModules = module.parallelWith 
    ? MODULE_DEPENDENCIES.filter(m => module.parallelWith?.includes(m.moduleId))
    : [];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className={cn(
          "flex items-center justify-between p-3 rounded-lg border transition-colors",
          colors.bg, colors.border,
          "hover:bg-opacity-80"
        )}>
          <div className="flex items-center gap-3">
            <Badge className={cn("text-xs", riskConfig.bg)}>
              {riskConfig.icon}
            </Badge>
            <span className={cn("font-medium", colors.text)}>{module.moduleName}</span>
            {module.criticalPath && (
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                <Zap className="h-3 w-3 mr-1" />
                Critical Path
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {module.prerequisites.length} prereq → {module.enables.length} enables
            </span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={cn("p-4 mt-1 rounded-lg border space-y-4", colors.border, "bg-background/50")}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h5 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                Prerequisites ({prerequisiteModules.length})
              </h5>
              {prerequisiteModules.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {prerequisiteModules.map(m => (
                    <Badge key={m.moduleId} variant="secondary" className="text-xs">
                      {m.moduleName}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">None (Foundation module)</span>
              )}
            </div>
            <div>
              <h5 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                Enables ({enablesModules.length})
              </h5>
              {enablesModules.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {enablesModules.map(m => (
                    <Badge key={m.moduleId} variant="secondary" className="text-xs">
                      {m.moduleName}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Terminal module</span>
              )}
            </div>
          </div>
          
          {parallelModules.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <Layers className="h-3 w-3" />
                Can Run in Parallel With
              </h5>
              <div className="flex flex-wrap gap-1">
                {parallelModules.map(m => (
                  <Badge key={m.moduleId} variant="outline" className="text-xs">
                    {m.moduleName}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {module.implementationNotes && (
            <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
              <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">{module.implementationNotes}</p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const ModuleDependencyAnalysis = () => {
  const criticalPathModules = MODULE_DEPENDENCIES.filter(m => m.criticalPath);
  const bottleneckModules = MODULE_DEPENDENCIES.filter(m => m.enables.length >= 3);
  
  return (
    <section id="module-dependency-analysis" className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-600/20 via-teal-500/10 to-transparent p-8 border border-teal-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-teal-600/20">
              <Network className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-teal-600">Module Dependency Analysis</h2>
              <p className="text-muted-foreground">Implementation Sequencing for Success</p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            Understanding which modules must be configured first ensures smooth, efficient implementations.
            This analysis shows prerequisite relationships and downstream impact to help plan your rollout phases.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Implementation Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Implementation Phases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {IMPLEMENTATION_PHASES.map((phase, idx) => (
              <div key={phase.phase}>
                <PhaseCard phase={phase} />
                {idx < IMPLEMENTATION_PHASES.length - 1 && (
                  <div className="flex justify-center my-4">
                    <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Critical Path & Bottlenecks */}
        <div className="space-y-6">
          {/* Critical Path */}
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                <Zap className="h-5 w-5" />
                Critical Path Modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                These modules are on the critical path and delays will impact the entire timeline.
              </p>
              <div className="flex flex-wrap gap-2">
                {criticalPathModules.map(module => {
                  const colors = ACT_COLORS[module.act];
                  return (
                    <Badge key={module.moduleId} className={cn("text-xs border", colors.badge, colors.border)}>
                      <Zap className="h-3 w-3 mr-1" />
                      {module.moduleName}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Bottlenecks */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                High-Impact Modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                These modules enable 3+ downstream modules. Prioritize their completion to unblock parallel work.
              </p>
              <div className="space-y-2">
                {bottleneckModules.map(module => (
                  <div key={module.moduleId} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{module.moduleName}</span>
                    <Badge variant="outline" className="text-xs">
                      Enables {module.enables.length} modules
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Parallel Opportunities */}
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Parallel Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                These module pairs can be implemented simultaneously to accelerate deployment.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">ESS</Badge>
                  <span className="text-muted-foreground">+</span>
                  <Badge variant="secondary" className="text-xs">MSS</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Time & Attendance</Badge>
                  <span className="text-muted-foreground">+</span>
                  <Badge variant="secondary" className="text-xs">Leave Management</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Learning</Badge>
                  <span className="text-muted-foreground">+</span>
                  <Badge variant="secondary" className="text-xs">Goals</Badge>
                  <span className="text-muted-foreground">+</span>
                  <Badge variant="secondary" className="text-xs">H&S</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Compensation</Badge>
                  <span className="text-muted-foreground">+</span>
                  <Badge variant="secondary" className="text-xs">Benefits</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dependency Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Complete Dependency Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Module</TableHead>
                  <TableHead>Act</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead>Prerequisites</TableHead>
                  <TableHead>Enables</TableHead>
                  <TableHead className="text-center">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MODULE_DEPENDENCIES.map(module => {
                  const colors = ACT_COLORS[module.act];
                  const riskConfig = getRiskBadge(module.riskLevel);
                  const actLabel = module.act === "prologue" ? "Prologue" 
                    : module.act === "epilogue" ? "Epilogue" 
                    : `Act ${module.act.replace("act", "")}`;
                  
                  return (
                    <TableRow key={module.moduleId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {module.criticalPath && <Zap className="h-3 w-3 text-primary" />}
                          {module.moduleName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", colors.badge)}>{actLabel}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{module.phase}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {module.prerequisites.length > 0 
                          ? module.prerequisites.map(p => 
                              MODULE_DEPENDENCIES.find(m => m.moduleId === p)?.moduleName
                            ).join(", ")
                          : "—"
                        }
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {module.enables.length > 0 
                          ? module.enables.slice(0, 3).map(e => 
                              MODULE_DEPENDENCIES.find(m => m.moduleId === e)?.moduleName
                            ).join(", ") + (module.enables.length > 3 ? ` +${module.enables.length - 3} more` : "")
                          : "—"
                        }
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn("text-xs", riskConfig.bg)}>
                          {riskConfig.icon} {module.riskLevel}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Impact Analysis Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Module Impact Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {MODULE_DEPENDENCIES.map(module => (
            <ModuleImpactCard key={module.moduleId} module={module} />
          ))}
        </CardContent>
      </Card>
    </section>
  );
};
