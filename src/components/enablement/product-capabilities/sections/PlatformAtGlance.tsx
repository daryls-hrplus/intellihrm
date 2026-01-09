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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ModuleInfo {
  id: string;
  name: string;
  icon: typeof Shield;
  capabilities: number;
  act: string;
  actColor: string;
  description: string;
}

const MODULES: ModuleInfo[] = [
  // Prologue
  { id: "admin-security", name: "Admin & Security", icon: Shield, capabilities: 45, act: "Prologue", actColor: "bg-slate-500/10 text-slate-600", description: "Enterprise-grade security" },
  { id: "hr-hub", name: "HR Hub", icon: HelpCircle, capabilities: 40, act: "Prologue", actColor: "bg-slate-500/10 text-slate-600", description: "Central HR operations" },
  // Act 1
  { id: "recruitment", name: "Recruitment", icon: Briefcase, capabilities: 55, act: "Act 1", actColor: "bg-blue-500/10 text-blue-600", description: "Full ATS capabilities" },
  { id: "workforce", name: "Workforce", icon: Users, capabilities: 100, act: "Act 1", actColor: "bg-blue-500/10 text-blue-600", description: "Complete employee records" },
  // Act 2
  { id: "ess", name: "ESS", icon: Users, capabilities: 30, act: "Act 2", actColor: "bg-emerald-500/10 text-emerald-600", description: "Employee self-service" },
  { id: "mss", name: "MSS", icon: Users, capabilities: 35, act: "Act 2", actColor: "bg-emerald-500/10 text-emerald-600", description: "Manager self-service" },
  { id: "time-attendance", name: "Time & Attendance", icon: Clock, capabilities: 50, act: "Act 2", actColor: "bg-emerald-500/10 text-emerald-600", description: "Accurate time tracking" },
  { id: "leave", name: "Leave", icon: Calendar, capabilities: 35, act: "Act 2", actColor: "bg-emerald-500/10 text-emerald-600", description: "Flexible leave policies" },
  // Act 3
  { id: "payroll", name: "Payroll", icon: DollarSign, capabilities: 50, act: "Act 3", actColor: "bg-amber-500/10 text-amber-600", description: "Multi-country payroll" },
  { id: "compensation", name: "Compensation", icon: DollarSign, capabilities: 25, act: "Act 3", actColor: "bg-amber-500/10 text-amber-600", description: "Strategic planning" },
  { id: "benefits", name: "Benefits", icon: Gift, capabilities: 45, act: "Act 3", actColor: "bg-amber-500/10 text-amber-600", description: "Enrollment to claims" },
  // Act 4
  { id: "learning", name: "Learning", icon: GraduationCap, capabilities: 30, act: "Act 4", actColor: "bg-purple-500/10 text-purple-600", description: "Intelligent LMS" },
  { id: "talent", name: "Talent", icon: Target, capabilities: 55, act: "Act 4", actColor: "bg-purple-500/10 text-purple-600", description: "Goals, Appraisals, 360, Feedback" },
  { id: "succession", name: "Succession", icon: TrendingUp, capabilities: 25, act: "Act 4", actColor: "bg-purple-500/10 text-purple-600", description: "Leadership pipeline" },
  // Act 5
  { id: "hse", name: "Health & Safety", icon: Heart, capabilities: 45, act: "Act 5", actColor: "bg-red-500/10 text-red-600", description: "Proactive safety" },
  { id: "employee-relations", name: "Employee Relations", icon: Scale, capabilities: 30, act: "Act 5", actColor: "bg-red-500/10 text-red-600", description: "Fair & consistent" },
  { id: "company-property", name: "Company Property", icon: Box, capabilities: 15, act: "Act 5", actColor: "bg-red-500/10 text-red-600", description: "Asset management" },
  // Epilogue
  { id: "help-center", name: "Help Center", icon: HelpCircle, capabilities: 20, act: "Epilogue", actColor: "bg-indigo-500/10 text-indigo-600", description: "Self-service support" },
];

export function PlatformAtGlance() {
  const totalCapabilities = MODULES.reduce((sum, m) => sum + m.capabilities, 0);

  return (
    <div className="space-y-6" id="platform-at-glance">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform at a Glance</h2>
          <p className="text-muted-foreground">
            18 integrated modules with {totalCapabilities}+ capabilities
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20">
          <Sparkles className="h-3 w-3 mr-1" />
          AI in Every Module
        </Badge>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {MODULES.map((module) => {
          const Icon = module.icon;
          return (
            <Card 
              key={module.id} 
              className="hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => {
                const element = document.getElementById(module.id);
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            >
              <CardContent className="p-4">
                <div className={cn("p-2 rounded-lg w-fit mb-2", module.actColor)}>
                  <Icon className="h-4 w-4" />
                </div>
                <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                  {module.name}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {module.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className={cn("text-xs px-1.5", module.actColor)}>
                    {module.act}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {module.capabilities}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-500/30" />
          <span className="text-muted-foreground">Prologue: Foundation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500/30" />
          <span className="text-muted-foreground">Act 1: Attract & Onboard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500/30" />
          <span className="text-muted-foreground">Act 2: Enable & Engage</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500/30" />
          <span className="text-muted-foreground">Act 3: Pay & Reward</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500/30" />
          <span className="text-muted-foreground">Act 4: Develop & Grow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500/30" />
          <span className="text-muted-foreground">Act 5: Protect & Support</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-indigo-500/30" />
          <span className="text-muted-foreground">Epilogue: Excellence</span>
        </div>
      </div>
    </div>
  );
}
