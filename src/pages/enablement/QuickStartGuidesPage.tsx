import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Rocket,
  BookOpen,
  Target,
  Users,
  Clock,
  Heart,
  DollarSign,
  GraduationCap,
  Shield,
  Search,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface QuickStartGuide {
  id: string;
  moduleCode: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  estimatedMinutes: number;
  prerequisites: number;
  status: "available" | "coming-soon";
  href: string;
}

const QUICK_START_GUIDES: QuickStartGuide[] = [
  {
    id: "learning-development",
    moduleCode: "LND",
    title: "Learning & Development",
    description: "Set up courses, learning paths, and certifications in under 15 minutes",
    icon: GraduationCap,
    color: "bg-emerald-500/10 text-emerald-600",
    estimatedMinutes: 15,
    prerequisites: 5,
    status: "available",
    href: "/enablement/quickstart/learning-development",
  },
  {
    id: "performance",
    moduleCode: "PERF",
    title: "Performance Management",
    description: "Configure appraisal cycles, forms, and rating scales quickly",
    icon: Target,
    color: "bg-primary/10 text-primary",
    estimatedMinutes: 20,
    prerequisites: 6,
    status: "coming-soon",
    href: "/enablement/quickstart/performance",
  },
  {
    id: "goals",
    moduleCode: "GOALS",
    title: "Goals Management",
    description: "Set up goal cycles, templates, and OKR frameworks",
    icon: Target,
    color: "bg-green-500/10 text-green-600",
    estimatedMinutes: 10,
    prerequisites: 3,
    status: "coming-soon",
    href: "/enablement/quickstart/goals",
  },
  {
    id: "workforce",
    moduleCode: "WFM",
    title: "Workforce Management",
    description: "Configure org structure, positions, and employee records",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600",
    estimatedMinutes: 25,
    prerequisites: 8,
    status: "coming-soon",
    href: "/enablement/quickstart/workforce",
  },
  {
    id: "time-attendance",
    moduleCode: "TNA",
    title: "Time & Attendance",
    description: "Set up shifts, schedules, and attendance tracking",
    icon: Clock,
    color: "bg-amber-500/10 text-amber-600",
    estimatedMinutes: 20,
    prerequisites: 5,
    status: "coming-soon",
    href: "/enablement/quickstart/time-attendance",
  },
  {
    id: "benefits",
    moduleCode: "BEN",
    title: "Benefits Administration",
    description: "Configure benefit plans, enrollment periods, and eligibility",
    icon: Heart,
    color: "bg-rose-500/10 text-rose-600",
    estimatedMinutes: 15,
    prerequisites: 4,
    status: "coming-soon",
    href: "/enablement/quickstart/benefits",
  },
  {
    id: "compensation",
    moduleCode: "COMP",
    title: "Compensation Management",
    description: "Set up salary grades, pay structures, and compensation cycles",
    icon: DollarSign,
    color: "bg-violet-500/10 text-violet-600",
    estimatedMinutes: 20,
    prerequisites: 6,
    status: "coming-soon",
    href: "/enablement/quickstart/compensation",
  },
  {
    id: "admin-security",
    moduleCode: "ADMIN",
    title: "Admin & Security",
    description: "Configure roles, permissions, and security policies",
    icon: Shield,
    color: "bg-red-500/10 text-red-600",
    estimatedMinutes: 30,
    prerequisites: 4,
    status: "coming-soon",
    href: "/enablement/quickstart/admin-security",
  },
];

export default function QuickStartGuidesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return QUICK_START_GUIDES;
    const query = searchQuery.toLowerCase();
    return QUICK_START_GUIDES.filter(
      (guide) =>
        guide.title.toLowerCase().includes(query) ||
        guide.description.toLowerCase().includes(query) ||
        guide.moduleCode.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const availableCount = QUICK_START_GUIDES.filter((g) => g.status === "available").length;

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Quick Start Guides" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Rocket className="h-8 w-8 text-primary" />
              Quick Start Guides
            </h1>
            <p className="text-muted-foreground mt-1">
              Get modules up and running in 10-30 minutes with step-by-step setup guides
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            <Zap className="h-3 w-3 mr-1" />
            {availableCount} of {QUICK_START_GUIDES.length} Available
          </Badge>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quick start guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Info Banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">What are Quick Start Guides?</p>
                <p className="text-sm text-muted-foreground">
                  These are condensed setup guides that focus on the critical path to get a module working. 
                  They include prerequisites, essential configuration steps, and verification checks — 
                  everything you need for a minimal viable setup.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guides Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGuides.map((guide) => {
            const Icon = guide.icon;
            const isAvailable = guide.status === "available";

            return (
              <Card
                key={guide.id}
                className={`relative transition-all ${
                  isAvailable
                    ? "hover:shadow-md hover:border-primary/30 cursor-pointer"
                    : "opacity-60"
                }`}
                onClick={() => isAvailable && navigate(guide.href)}
              >
                {!isAvailable && (
                  <Badge
                    variant="secondary"
                    className="absolute top-3 right-3 text-xs"
                  >
                    Coming Soon
                  </Badge>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${guide.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{guide.title}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {guide.moduleCode}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <CardDescription className="text-sm">
                    {guide.description}
                  </CardDescription>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {guide.estimatedMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {guide.prerequisites} prerequisites
                    </span>
                  </div>
                  {isAvailable && (
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      Start Guide
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredGuides.length === 0 && (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No guides found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms
            </p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
