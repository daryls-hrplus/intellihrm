import { 
  Shield, 
  Users, 
  Briefcase, 
  Clock, 
  Calendar,
  DollarSign,
  Gift,
  GraduationCap,
  Target,
  TrendingUp,
  Heart,
  Scale,
  Box,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Layers,
  Globe,
  Brain,
  UserPlus,
  UserMinus,
  Building2,
  MessageSquare,
  BarChart3,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ActSummary {
  id: string;
  act: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  capabilities: number;
  modules: { name: string; count: number; icon: LucideIcon }[];
  keyOutcomes: string[];
}

const ACTS: ActSummary[] = [
  {
    id: "prologue",
    act: "Prologue",
    title: "Setting the Stage",
    subtitle: "Foundation & Governance",
    icon: Shield,
    color: "text-slate-600",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    capabilities: 150,
    modules: [
      { name: "Admin & Security", count: 80, icon: Shield },
      { name: "HR Hub", count: 70, icon: Building2 },
    ],
    keyOutcomes: [
      "Enterprise-grade security",
      "Complete audit trails",
      "Zero-trust architecture",
    ],
  },
  {
    id: "act1",
    act: "Act 1",
    title: "Attract, Onboard & Transition",
    subtitle: "Talent Lifecycle",
    icon: UserPlus,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    capabilities: 245,
    modules: [
      { name: "Recruitment", count: 75, icon: Briefcase },
      { name: "Onboarding", count: 55, icon: UserPlus },
      { name: "Offboarding", count: 55, icon: UserMinus },
      { name: "Workforce", count: 60, icon: Users },
    ],
    keyOutcomes: [
      "50% faster time-to-hire",
      "Day-one readiness",
      "98%+ asset recovery",
    ],
  },
  {
    id: "act2",
    act: "Act 2",
    title: "Enable & Engage",
    subtitle: "Self-Service & Time",
    icon: Users,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    capabilities: 180,
    modules: [
      { name: "ESS", count: 45, icon: Users },
      { name: "MSS", count: 50, icon: Users },
      { name: "Time & Attendance", count: 45, icon: Clock },
      { name: "Leave", count: 40, icon: Calendar },
    ],
    keyOutcomes: [
      "80% fewer HR inquiries",
      "99.9% time accuracy",
      "Zero compliance violations",
    ],
  },
  {
    id: "act3",
    act: "Act 3",
    title: "Pay & Reward",
    subtitle: "Compensation & Benefits",
    icon: DollarSign,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    capabilities: 150,
    modules: [
      { name: "Payroll", count: 60, icon: DollarSign },
      { name: "Compensation", count: 50, icon: TrendingUp },
      { name: "Benefits", count: 40, icon: Gift },
    ],
    keyOutcomes: [
      "99.99% payroll accuracy",
      "Pay equity analysis",
      "Real-time GL integration",
    ],
  },
  {
    id: "act4",
    act: "Act 4",
    title: "Develop & Grow",
    subtitle: "Performance & Talent",
    icon: GraduationCap,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    capabilities: 410,
    modules: [
      { name: "Learning & LMS", count: 130, icon: GraduationCap },
      { name: "Goals", count: 45, icon: Target },
      { name: "Appraisals", count: 50, icon: BarChart3 },
      { name: "360 Feedback", count: 35, icon: MessageSquare },
      { name: "Continuous Performance", count: 55, icon: Zap },
      { name: "Succession", count: 95, icon: TrendingUp },
    ],
    keyOutcomes: [
      "85%+ training completion",
      "90%+ successor coverage",
      "Flight risk detection",
    ],
  },
  {
    id: "act5",
    act: "Act 5",
    title: "Protect & Support",
    subtitle: "Safety & Relations",
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    capabilities: 280,
    modules: [
      { name: "Health & Safety", count: 120, icon: Heart },
      { name: "Employee Relations", count: 95, icon: Scale },
      { name: "Company Property", count: 65, icon: Box },
    ],
    keyOutcomes: [
      "60%+ incident reduction",
      "70%+ grievance resolution",
      "Complete asset tracking",
    ],
  },
  {
    id: "epilogue",
    act: "Epilogue",
    title: "Continuous Excellence",
    subtitle: "Support & Knowledge",
    icon: HelpCircle,
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    capabilities: 85,
    modules: [
      { name: "Help Center", count: 85, icon: HelpCircle },
    ],
    keyOutcomes: [
      "70%+ ticket deflection",
      "24/7 AI assistance",
      "Version-controlled KB",
    ],
  },
];

const CROSS_CUTTING = {
  title: "Cross-Cutting Capabilities",
  capabilities: 175,
  modules: [
    { name: "Platform Features", count: 70, icon: Layers },
    { name: "Regional Compliance", count: 50, icon: Globe },
    { name: "AI Intelligence", count: 55, icon: Brain },
  ],
};

export function PlatformAtGlance() {
  const totalActCapabilities = ACTS.reduce((sum, a) => sum + a.capabilities, 0);
  const totalCapabilities = totalActCapabilities + CROSS_CUTTING.capabilities;
  const totalModules = ACTS.reduce((sum, a) => sum + a.modules.length, 0) + CROSS_CUTTING.modules.length;

  const navigateToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-8" id="platform-at-glance">
      {/* Header with Total Stats */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border border-primary/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                Platform at a Glance
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-First
                </Badge>
              </h2>
              <p className="text-muted-foreground mt-1">
                The complete HR operating system for Caribbean, Latin America, Africa, and global operations
              </p>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-background/50 rounded-lg p-4 border">
              <div className="text-3xl font-bold text-primary">{totalCapabilities.toLocaleString()}+</div>
              <div className="text-sm text-muted-foreground">Total Capabilities</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4 border">
              <div className="text-3xl font-bold text-primary">{totalModules}</div>
              <div className="text-sm text-muted-foreground">Integrated Modules</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4 border">
              <div className="text-3xl font-bold text-primary">7</div>
              <div className="text-sm text-muted-foreground">Lifecycle Acts</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4 border">
              <div className="text-3xl font-bold text-primary">20+</div>
              <div className="text-sm text-muted-foreground">Countries Supported</div>
            </div>
          </div>
        </div>
      </div>

      {/* Act Summary Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Employee Lifecycle Acts</h3>
        
        <div className="grid gap-4">
          {ACTS.map((act) => {
            const Icon = act.icon;
            const capabilityPercentage = (act.capabilities / totalCapabilities) * 100;
            
            return (
              <Card 
                key={act.id}
                className={cn(
                  "hover:shadow-md transition-all cursor-pointer group border-l-4",
                  act.borderColor
                )}
                onClick={() => navigateToSection(act.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Act Info */}
                    <div className="flex items-center gap-4 lg:w-1/4">
                      <div className={cn("p-3 rounded-xl", act.bgColor)}>
                        <Icon className={cn("h-6 w-6", act.color)} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn("text-xs", act.bgColor, act.color)}>
                            {act.act}
                          </Badge>
                          <span className="font-semibold text-sm">{act.capabilities}+ capabilities</span>
                        </div>
                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                          {act.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">{act.subtitle}</p>
                      </div>
                    </div>

                    {/* Modules */}
                    <div className="flex-1 lg:border-l lg:border-r lg:px-4">
                      <div className="text-xs text-muted-foreground mb-2">Modules</div>
                      <div className="flex flex-wrap gap-2">
                        {act.modules.map((module) => {
                          const ModuleIcon = module.icon;
                          return (
                            <div 
                              key={module.name}
                              className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs",
                                act.bgColor
                              )}
                            >
                              <ModuleIcon className={cn("h-3 w-3", act.color)} />
                              <span>{module.name}</span>
                              <span className="text-muted-foreground">({module.count})</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Key Outcomes */}
                    <div className="lg:w-1/4">
                      <div className="text-xs text-muted-foreground mb-2">Key Outcomes</div>
                      <div className="space-y-1">
                        {act.keyOutcomes.map((outcome, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <CheckCircle2 className={cn("h-3 w-3 shrink-0", act.color)} />
                            <span>{outcome}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Navigate Arrow */}
                    <div className="hidden lg:flex items-center">
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  {/* Capability Progress Bar */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground w-32">Share of Platform</div>
                      <Progress 
                        value={capabilityPercentage} 
                        className="h-1.5 flex-1"
                      />
                      <div className="text-xs text-muted-foreground w-12 text-right">
                        {capabilityPercentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Cross-Cutting Capabilities */}
      <Card 
        className="border-l-4 border-teal-500/50 hover:shadow-md transition-all cursor-pointer group"
        onClick={() => navigateToSection("platform-features")}
      >
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-4 lg:w-1/4">
              <div className="p-3 rounded-xl bg-teal-500/10">
                <Layers className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <Badge variant="outline" className="text-xs bg-teal-500/10 text-teal-600 mb-1">
                  Cross-Cutting
                </Badge>
                <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                  {CROSS_CUTTING.title}
                </h4>
                <span className="font-semibold text-sm">{CROSS_CUTTING.capabilities}+ capabilities</span>
              </div>
            </div>

            <div className="flex-1 lg:border-l lg:px-4">
              <div className="text-xs text-muted-foreground mb-2">Platform-Wide Features</div>
              <div className="flex flex-wrap gap-2">
                {CROSS_CUTTING.modules.map((module) => {
                  const ModuleIcon = module.icon;
                  return (
                    <div 
                      key={module.name}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-teal-500/10"
                    >
                      <ModuleIcon className="h-3 w-3 text-teal-600" />
                      <span>{module.name}</span>
                      <span className="text-muted-foreground">({module.count})</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:w-1/4">
              <div className="text-xs text-muted-foreground mb-2">Foundation Benefits</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-teal-600" />
                  <span>Enterprise security & audit</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-teal-600" />
                  <span>Multi-country compliance</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-teal-600" />
                  <span>AI at every decision point</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center">
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Summary Bar */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Capability Distribution</h3>
        <div className="h-8 rounded-lg overflow-hidden flex">
          {ACTS.map((act) => {
            const percentage = (act.capabilities / totalCapabilities) * 100;
            return (
              <div
                key={act.id}
                className={cn(
                  "h-full flex items-center justify-center text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity",
                  act.bgColor.replace("/10", "/30"),
                  act.color
                )}
                style={{ width: `${percentage}%` }}
                onClick={() => navigateToSection(act.id)}
                title={`${act.act}: ${act.capabilities} capabilities`}
              >
                {percentage > 8 && act.act}
              </div>
            );
          })}
          <div
            className="h-full flex items-center justify-center text-xs font-medium cursor-pointer bg-teal-500/30 text-teal-600 hover:opacity-80 transition-opacity"
            style={{ width: `${(CROSS_CUTTING.capabilities / totalCapabilities) * 100}%` }}
            onClick={() => navigateToSection("platform-features")}
            title={`Cross-Cutting: ${CROSS_CUTTING.capabilities} capabilities`}
          >
            {(CROSS_CUTTING.capabilities / totalCapabilities) * 100 > 8 && "X-Cut"}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          {ACTS.map((act) => (
            <div key={act.id} className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded", act.bgColor.replace("/10", "/40"))} />
              <span className="text-muted-foreground">{act.act}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-teal-500/40" />
            <span className="text-muted-foreground">Cross-Cutting</span>
          </div>
        </div>
      </div>

      {/* AI Differentiator */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600/10 via-purple-500/10 to-fuchsia-500/10 p-6 border border-violet-500/20">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-violet-500/10 rounded-full blur-2xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="p-4 rounded-xl bg-violet-600/20 w-fit">
            <Brain className="h-8 w-8 text-violet-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-violet-700 dark:text-violet-400">
              AI Intelligence Embedded Throughout
            </h3>
            <p className="text-muted-foreground mt-1">
              Every module includes predictive insights, prescriptive recommendations, and intelligent automation—
              with explainability, human oversight, and bias detection built in.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:w-64">
            <div className="text-center p-3 bg-background/50 rounded-lg border">
              <div className="text-2xl font-bold text-violet-600">40%+</div>
              <div className="text-xs text-muted-foreground">Faster Decisions</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg border">
              <div className="text-2xl font-bold text-violet-600">85%+</div>
              <div className="text-xs text-muted-foreground">Prediction Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
