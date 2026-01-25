import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardCheck,
  Search,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Target,
  GraduationCap,
  Heart,
  DollarSign,
  Shield,
  Settings,
  Rocket,
  FileCheck,
} from "lucide-react";
import { useMemo } from "react";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { useTabState } from "@/hooks/useTabState";

interface ChecklistItem {
  id: string;
  moduleCode: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  type: "prerequisites" | "go-live" | "data-migration" | "integration";
  totalSteps: number;
  completedSteps: number;
  estimatedHours: number;
  criticalItems: number;
  href: string;
}

const CHECKLISTS: ChecklistItem[] = [
  // Prerequisites Checklists
  {
    id: "lnd-prereqs",
    moduleCode: "LND",
    title: "L&D Prerequisites",
    description: "Required configurations before setting up Learning & Development",
    icon: GraduationCap,
    color: "bg-emerald-500/10 text-emerald-600",
    type: "prerequisites",
    totalSteps: 5,
    completedSteps: 0,
    estimatedHours: 2,
    criticalItems: 3,
    href: "/enablement/quickstart/learning-development#prerequisites",
  },
  {
    id: "perf-prereqs",
    moduleCode: "PERF",
    title: "Performance Prerequisites",
    description: "Required configurations before setting up Performance Management",
    icon: Target,
    color: "bg-primary/10 text-primary",
    type: "prerequisites",
    totalSteps: 8,
    completedSteps: 0,
    estimatedHours: 4,
    criticalItems: 5,
    href: "/enablement/manuals/appraisals#sec-2-1",
  },
  {
    id: "workforce-prereqs",
    moduleCode: "WFM",
    title: "Workforce Prerequisites",
    description: "Foundation setup for Workforce Management module",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600",
    type: "prerequisites",
    totalSteps: 10,
    completedSteps: 0,
    estimatedHours: 6,
    criticalItems: 7,
    href: "/enablement/manuals/workforce#sec-2-1",
  },
  {
    id: "benefits-prereqs",
    moduleCode: "BEN",
    title: "Benefits Prerequisites",
    description: "Required setup before configuring Benefits Administration",
    icon: Heart,
    color: "bg-rose-500/10 text-rose-600",
    type: "prerequisites",
    totalSteps: 6,
    completedSteps: 0,
    estimatedHours: 3,
    criticalItems: 4,
    href: "/enablement/manuals/benefits#sec-2-1",
  },
  // Go-Live Checklists
  {
    id: "lnd-golive",
    moduleCode: "LND",
    title: "L&D Go-Live Readiness",
    description: "Verify all configurations before launching Learning module",
    icon: Rocket,
    color: "bg-emerald-500/10 text-emerald-600",
    type: "go-live",
    totalSteps: 12,
    completedSteps: 0,
    estimatedHours: 4,
    criticalItems: 8,
    href: "/enablement/checklists/lnd-golive",
  },
  {
    id: "perf-golive",
    moduleCode: "PERF",
    title: "Performance Go-Live Readiness",
    description: "Pre-launch validation for Performance Management",
    icon: Rocket,
    color: "bg-primary/10 text-primary",
    type: "go-live",
    totalSteps: 15,
    completedSteps: 0,
    estimatedHours: 6,
    criticalItems: 10,
    href: "/enablement/checklists/perf-golive",
  },
  {
    id: "full-golive",
    moduleCode: "ALL",
    title: "Full Platform Go-Live",
    description: "Complete production readiness checklist across all modules",
    icon: FileCheck,
    color: "bg-violet-500/10 text-violet-600",
    type: "go-live",
    totalSteps: 50,
    completedSteps: 0,
    estimatedHours: 16,
    criticalItems: 25,
    href: "/enablement/client-provisioning/testing",
  },
  // Integration Checklists
  {
    id: "payroll-integration",
    moduleCode: "PAY",
    title: "Payroll Integration",
    description: "Validate payroll system integration and data flow",
    icon: DollarSign,
    color: "bg-amber-500/10 text-amber-600",
    type: "integration",
    totalSteps: 8,
    completedSteps: 0,
    estimatedHours: 4,
    criticalItems: 6,
    href: "/enablement/checklists/payroll-integration",
  },
  {
    id: "sso-integration",
    moduleCode: "ADMIN",
    title: "SSO & Identity Integration",
    description: "Configure and validate Single Sign-On setup",
    icon: Shield,
    color: "bg-red-500/10 text-red-600",
    type: "integration",
    totalSteps: 10,
    completedSteps: 0,
    estimatedHours: 5,
    criticalItems: 8,
    href: "/enablement/checklists/sso-integration",
  },
];

const CHECKLIST_TYPES = [
  { value: "all", label: "All Checklists" },
  { value: "prerequisites", label: "Prerequisites" },
  { value: "go-live", label: "Go-Live" },
  { value: "integration", label: "Integration" },
];

export default function ImplementationChecklistsPage() {
  const { navigateToList } = useWorkspaceNavigation();
  const [tabState, setTabState] = useTabState({
    defaultState: {
      searchQuery: "",
      activeType: "all",
    },
  });

  const filteredChecklists = useMemo(() => {
    let result = CHECKLISTS;

    if (tabState.activeType !== "all") {
      result = result.filter((c) => c.type === tabState.activeType);
    }

    if (tabState.searchQuery.trim()) {
      const query = tabState.searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.moduleCode.toLowerCase().includes(query)
      );
    }

    return result;
  }, [tabState.searchQuery, tabState.activeType]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "prerequisites":
        return "bg-blue-500/10 text-blue-600";
      case "go-live":
        return "bg-green-500/10 text-green-600";
      case "data-migration":
        return "bg-amber-500/10 text-amber-600";
      case "integration":
        return "bg-purple-500/10 text-purple-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Implementation Checklists" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <ClipboardCheck className="h-8 w-8 text-primary" />
              Implementation Checklists
            </h1>
            <p className="text-muted-foreground mt-1">
              Track prerequisites, go-live readiness, and integration validation
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {CHECKLISTS.length} Checklists
          </Badge>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search checklists..."
              value={tabState.searchQuery}
              onChange={(e) => setTabState({ searchQuery: e.target.value })}
              className="pl-10"
            />
          </div>
          <Tabs value={tabState.activeType} onValueChange={(v) => setTabState({ activeType: v })}>
            <TabsList>
              {CHECKLIST_TYPES.map((type) => (
                <TabsTrigger key={type.value} value={type.value}>
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Info Banner */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium">Implementation Best Practice</p>
                <p className="text-sm text-muted-foreground">
                  Complete <strong>prerequisites checklists</strong> before starting module setup. 
                  Run <strong>go-live checklists</strong> in a test environment before production deployment.
                  Track progress is saved automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklists Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredChecklists.map((checklist) => {
            const Icon = checklist.icon;
            const progressPercent =
              checklist.totalSteps > 0
                ? Math.round((checklist.completedSteps / checklist.totalSteps) * 100)
                : 0;

            return (
                <Card
                  key={checklist.id}
                  className="relative transition-all hover:shadow-md hover:border-primary/30 cursor-pointer"
                  onClick={() => navigateToList({
                    route: checklist.href,
                    title: checklist.title,
                    moduleCode: 'enablement',
                  })}
              >
                <Badge
                  className={`absolute top-3 right-3 text-xs ${getTypeColor(checklist.type)}`}
                >
                  {checklist.type.replace("-", " ")}
                </Badge>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${checklist.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base pr-20">{checklist.title}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {checklist.moduleCode}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <CardDescription className="text-sm">
                    {checklist.description}
                  </CardDescription>

                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {checklist.completedSteps}/{checklist.totalSteps} steps
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{checklist.estimatedHours}h
                    </span>
                    <span className="flex items-center gap-1 text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {checklist.criticalItems} critical
                    </span>
                  </div>

                  <Button variant="ghost" size="sm" className="w-full">
                    {progressPercent > 0 ? "Continue" : "Start"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredChecklists.length === 0 && (
          <Card className="p-8 text-center">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No checklists found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter
            </p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
