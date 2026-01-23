import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Search,
  ArrowRight,
  GraduationCap,
  Target,
  Users,
  Heart,
  Clock,
  Shield,
  DollarSign,
  HelpCircle,
  Rocket,
  ClipboardCheck,
  FolderTree,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface ModuleInfo {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  manualSections?: number;
  hasQuickStart: boolean;
  checklistCount: number;
}

const MODULES: ModuleInfo[] = [
  {
    id: "learning-development",
    title: "Learning & Development",
    description: "Training, courses, certifications, and learning paths",
    icon: GraduationCap,
    color: "bg-emerald-500/10 text-emerald-600",
    hasQuickStart: true,
    checklistCount: 2,
  },
  {
    id: "performance",
    title: "Performance Management",
    description: "Appraisals, reviews, evaluations, and performance tracking",
    icon: Target,
    color: "bg-primary/10 text-primary",
    manualSections: 48,
    hasQuickStart: false,
    checklistCount: 2,
  },
  {
    id: "goals",
    title: "Goals Management",
    description: "Goal cycles, OKRs, cascading objectives, and progress tracking",
    icon: Target,
    color: "bg-green-500/10 text-green-600",
    manualSections: 24,
    hasQuickStart: false,
    checklistCount: 1,
  },
  {
    id: "workforce",
    title: "Workforce Management",
    description: "Organization structure, positions, employees, and org charts",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600",
    manualSections: 80,
    hasQuickStart: false,
    checklistCount: 1,
  },
  {
    id: "time-attendance",
    title: "Time & Attendance",
    description: "Shifts, schedules, attendance tracking, and overtime management",
    icon: Clock,
    color: "bg-amber-500/10 text-amber-600",
    manualSections: 35,
    hasQuickStart: false,
    checklistCount: 0,
  },
  {
    id: "benefits",
    title: "Benefits Administration",
    description: "Benefit plans, enrollment, eligibility, and claims",
    icon: Heart,
    color: "bg-rose-500/10 text-rose-600",
    manualSections: 28,
    hasQuickStart: false,
    checklistCount: 0,
  },
  {
    id: "compensation",
    title: "Compensation Management",
    description: "Salary grades, pay structures, and compensation cycles",
    icon: DollarSign,
    color: "bg-violet-500/10 text-violet-600",
    hasQuickStart: false,
    checklistCount: 0,
  },
  {
    id: "admin-security",
    title: "Admin & Security",
    description: "User management, roles, permissions, and security policies",
    icon: Shield,
    color: "bg-red-500/10 text-red-600",
    manualSections: 55,
    hasQuickStart: false,
    checklistCount: 1,
  },
  {
    id: "hr-hub",
    title: "HR Hub",
    description: "Central HR operations, workflows, and employee services",
    icon: HelpCircle,
    color: "bg-purple-500/10 text-purple-600",
    manualSections: 32,
    hasQuickStart: false,
    checklistCount: 0,
  },
];

export default function ModulesIndexPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return MODULES;
    const query = searchQuery.toLowerCase();
    return MODULES.filter(
      (m) =>
        m.title.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const modulesWithManuals = MODULES.filter((m) => m.manualSections).length;
  const modulesWithQuickStart = MODULES.filter((m) => m.hasQuickStart).length;

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Module Documentation" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <FolderTree className="h-8 w-8 text-primary" />
              Module Documentation
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse all documentation by module — manuals, quick starts, and checklists
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-sm">
              <BookOpen className="h-3 w-3 mr-1" />
              {modulesWithManuals} Manuals
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Rocket className="h-3 w-3 mr-1" />
              {modulesWithQuickStart} Quick Starts
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Modules Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredModules.map((module) => {
            const Icon = module.icon;
            const hasContent =
              module.manualSections || module.hasQuickStart || module.checklistCount > 0;

            return (
              <Card
                key={module.id}
                className="relative transition-all hover:shadow-md hover:border-primary/30 cursor-pointer"
                onClick={() => navigate(`/enablement/modules/${module.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${module.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{module.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <CardDescription className="text-sm">
                    {module.description}
                  </CardDescription>

                  {/* Content Badges */}
                  <div className="flex flex-wrap gap-2">
                    {module.manualSections && (
                      <Badge variant="secondary" className="text-xs">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {module.manualSections} sections
                      </Badge>
                    )}
                    {module.hasQuickStart && (
                      <Badge className="text-xs bg-emerald-500">
                        <Rocket className="h-3 w-3 mr-1" />
                        Quick Start
                      </Badge>
                    )}
                    {module.checklistCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <ClipboardCheck className="h-3 w-3 mr-1" />
                        {module.checklistCount} checklists
                      </Badge>
                    )}
                    {!hasContent && (
                      <Badge variant="secondary" className="text-xs">
                        Coming Soon
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-primary pt-2">
                    View Documentation
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredModules.length === 0 && (
          <Card className="p-8 text-center">
            <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No modules found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms
            </p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
