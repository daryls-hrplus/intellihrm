import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Rocket,
  ClipboardCheck,
  Video,
  FileText,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  GraduationCap,
  Target,
  Users,
  Heart,
  Clock,
  Shield,
  DollarSign,
  HelpCircle,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

interface ModuleDocConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  manual?: { title: string; href: string; sections: number };
  quickStart?: { title: string; href: string; minutes: number; available: boolean };
  checklists: { id: string; title: string; href: string; type: string }[];
  videos: { title: string; href: string; duration: string }[];
  kbArticles: { title: string; href: string }[];
}

const MODULE_CONFIGS: Record<string, ModuleDocConfig> = {
  "learning-development": {
    id: "learning-development",
    title: "Learning & Development",
    description: "Training, courses, certifications, and learning paths",
    icon: GraduationCap,
    color: "bg-emerald-500/10 text-emerald-600",
    quickStart: {
      title: "L&D Quick Start Guide",
      href: "/enablement/quickstart/learning-development",
      minutes: 15,
      available: true,
    },
    checklists: [
      { id: "lnd-prereqs", title: "Prerequisites Checklist", href: "/enablement/quickstart/learning-development#prerequisites", type: "prerequisites" },
      { id: "lnd-golive", title: "Go-Live Readiness", href: "/enablement/checklists/lnd-golive", type: "go-live" },
    ],
    videos: [],
    kbArticles: [],
  },
  performance: {
    id: "performance",
    title: "Performance Management",
    description: "Appraisals, reviews, evaluations, and performance tracking",
    icon: Target,
    color: "bg-primary/10 text-primary",
    manual: {
      title: "Performance Appraisals Manual",
      href: "/enablement/manuals/appraisals",
      sections: 48,
    },
    quickStart: {
      title: "Performance Quick Start",
      href: "/enablement/quickstart/performance",
      minutes: 20,
      available: false,
    },
    checklists: [
      { id: "perf-prereqs", title: "Prerequisites Checklist", href: "/enablement/manuals/appraisals#sec-2-1", type: "prerequisites" },
      { id: "perf-golive", title: "Go-Live Readiness", href: "/enablement/checklists/perf-golive", type: "go-live" },
    ],
    videos: [],
    kbArticles: [],
  },
  goals: {
    id: "goals",
    title: "Goals Management",
    description: "Goal cycles, OKRs, cascading objectives, and progress tracking",
    icon: Target,
    color: "bg-green-500/10 text-green-600",
    manual: {
      title: "Goals Management Manual",
      href: "/enablement/manuals/goals",
      sections: 24,
    },
    quickStart: {
      title: "Goals Quick Start",
      href: "/enablement/quickstart/goals",
      minutes: 10,
      available: false,
    },
    checklists: [
      { id: "goals-prereqs", title: "Prerequisites Checklist", href: "/enablement/manuals/goals#goal-sec-2-1", type: "prerequisites" },
    ],
    videos: [],
    kbArticles: [],
  },
  workforce: {
    id: "workforce",
    title: "Workforce Management",
    description: "Organization structure, positions, employees, and org charts",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600",
    manual: {
      title: "Workforce Management Manual",
      href: "/enablement/manuals/workforce",
      sections: 80,
    },
    quickStart: {
      title: "Workforce Quick Start",
      href: "/enablement/quickstart/workforce",
      minutes: 25,
      available: false,
    },
    checklists: [
      { id: "wfm-prereqs", title: "Prerequisites Checklist", href: "/enablement/manuals/workforce#sec-2-1", type: "prerequisites" },
    ],
    videos: [],
    kbArticles: [],
  },
  "time-attendance": {
    id: "time-attendance",
    title: "Time & Attendance",
    description: "Shifts, schedules, attendance tracking, and overtime management",
    icon: Clock,
    color: "bg-amber-500/10 text-amber-600",
    manual: {
      title: "Time & Attendance Manual",
      href: "/enablement/manuals/time-attendance",
      sections: 35,
    },
    quickStart: {
      title: "T&A Quick Start",
      href: "/enablement/quickstart/time-attendance",
      minutes: 20,
      available: false,
    },
    checklists: [],
    videos: [],
    kbArticles: [],
  },
  benefits: {
    id: "benefits",
    title: "Benefits Administration",
    description: "Benefit plans, enrollment, eligibility, and claims",
    icon: Heart,
    color: "bg-rose-500/10 text-rose-600",
    manual: {
      title: "Benefits Administration Manual",
      href: "/enablement/manuals/benefits",
      sections: 28,
    },
    quickStart: {
      title: "Benefits Quick Start",
      href: "/enablement/quickstart/benefits",
      minutes: 15,
      available: false,
    },
    checklists: [],
    videos: [],
    kbArticles: [],
  },
  "admin-security": {
    id: "admin-security",
    title: "Admin & Security",
    description: "User management, roles, permissions, and security policies",
    icon: Shield,
    color: "bg-red-500/10 text-red-600",
    manual: {
      title: "Admin & Security Manual",
      href: "/enablement/manuals/admin-security",
      sections: 55,
    },
    quickStart: {
      title: "Admin Quick Start",
      href: "/enablement/quickstart/admin-security",
      minutes: 30,
      available: false,
    },
    checklists: [
      { id: "sso-integration", title: "SSO Integration", href: "/enablement/checklists/sso-integration", type: "integration" },
    ],
    videos: [],
    kbArticles: [],
  },
  "hr-hub": {
    id: "hr-hub",
    title: "HR Hub",
    description: "Central HR operations, workflows, and employee services",
    icon: HelpCircle,
    color: "bg-purple-500/10 text-purple-600",
    manual: {
      title: "HR Hub Manual",
      href: "/enablement/manuals/hr-hub",
      sections: 32,
    },
    checklists: [],
    videos: [],
    kbArticles: [],
  },
};

export default function ModuleDocumentationPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();

  const moduleConfig = moduleId ? MODULE_CONFIGS[moduleId] : null;

  if (!moduleConfig) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Module not found</h3>
            <p className="text-muted-foreground mb-4">
              The requested module documentation doesn't exist.
            </p>
            <Button onClick={() => navigate("/enablement/modules")}>
              View All Modules
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const Icon = moduleConfig.icon;

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Module Documentation", href: "/enablement/modules" },
            { label: moduleConfig.title },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${moduleConfig.color}`}>
              <Icon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {moduleConfig.title}
              </h1>
              <p className="text-muted-foreground mt-1">
                {moduleConfig.description}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Quick Start */}
          {moduleConfig.quickStart && (
            <Card
              className={`transition-all ${
                moduleConfig.quickStart.available
                  ? "hover:shadow-md hover:border-primary/30 cursor-pointer"
                  : "opacity-60"
              }`}
              onClick={() =>
                moduleConfig.quickStart?.available &&
                navigate(moduleConfig.quickStart.href)
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Rocket className="h-5 w-5 text-primary" />
                  {!moduleConfig.quickStart.available && (
                    <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                  )}
                </div>
                <CardTitle className="text-base">Quick Start Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Get started in {moduleConfig.quickStart.minutes} minutes
                </p>
                {moduleConfig.quickStart.available && (
                  <Button variant="ghost" size="sm" className="w-full">
                    Start Guide <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Manual */}
          {moduleConfig.manual && (
            <Card
              className="hover:shadow-md hover:border-primary/30 cursor-pointer transition-all"
              onClick={() => navigate(moduleConfig.manual!.href)}
            >
              <CardHeader className="pb-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base">Administrator Manual</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {moduleConfig.manual.sections} sections of comprehensive guidance
                </p>
                <Button variant="ghost" size="sm" className="w-full">
                  Open Manual <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Checklists */}
          {moduleConfig.checklists.length > 0 && (
            <Card
              className="hover:shadow-md hover:border-primary/30 cursor-pointer transition-all"
              onClick={() => navigate("/enablement/checklists")}
            >
              <CardHeader className="pb-2">
                <ClipboardCheck className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-base">Implementation Checklists</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {moduleConfig.checklists.length} checklists available
                </p>
                <Button variant="ghost" size="sm" className="w-full">
                  View Checklists <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Content Sections */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="checklists">Checklists</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="articles">KB Articles</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Documentation</CardTitle>
                <CardDescription>
                  All content types for {moduleConfig.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Manual */}
                {moduleConfig.manual && (
                  <div
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(moduleConfig.manual!.href)}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{moduleConfig.manual.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {moduleConfig.manual.sections} sections
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Manual</Badge>
                  </div>
                )}

                {/* Quick Start */}
                {moduleConfig.quickStart && (
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      moduleConfig.quickStart.available
                        ? "hover:bg-muted/50 cursor-pointer"
                        : "opacity-60"
                    }`}
                    onClick={() =>
                      moduleConfig.quickStart?.available &&
                      navigate(moduleConfig.quickStart.href)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Rocket className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{moduleConfig.quickStart.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {moduleConfig.quickStart.minutes} minutes
                        </p>
                      </div>
                    </div>
                    <Badge variant={moduleConfig.quickStart.available ? "default" : "secondary"}>
                      {moduleConfig.quickStart.available ? "Quick Start" : "Coming Soon"}
                    </Badge>
                  </div>
                )}

                {/* Checklists */}
                {moduleConfig.checklists.map((checklist) => (
                  <div
                    key={checklist.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(checklist.href)}
                  >
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium">{checklist.title}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {checklist.type.replace("-", " ")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Checklist</Badge>
                  </div>
                ))}

                {!moduleConfig.manual &&
                  !moduleConfig.quickStart &&
                  moduleConfig.checklists.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No documentation available yet for this module.
                    </p>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklists">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Checklists</CardTitle>
              </CardHeader>
              <CardContent>
                {moduleConfig.checklists.length > 0 ? (
                  <div className="space-y-3">
                    {moduleConfig.checklists.map((checklist) => (
                      <div
                        key={checklist.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(checklist.href)}
                      >
                        <div className="flex items-center gap-3">
                          <ClipboardCheck className="h-5 w-5 text-amber-600" />
                          <div>
                            <p className="font-medium">{checklist.title}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {checklist.type.replace("-", " ")}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No checklists available for this module yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <CardTitle>Training Videos</CardTitle>
              </CardHeader>
              <CardContent>
                {moduleConfig.videos.length > 0 ? (
                  <div className="space-y-3">
                    {moduleConfig.videos.map((video, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Video className="h-5 w-5 text-rose-600" />
                          <div>
                            <p className="font-medium">{video.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {video.duration}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No training videos available for this module yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articles">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base Articles</CardTitle>
              </CardHeader>
              <CardContent>
                {moduleConfig.kbArticles.length > 0 ? (
                  <div className="space-y-3">
                    {moduleConfig.kbArticles.map((article, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-purple-600" />
                          <p className="font-medium">{article.title}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No KB articles published for this module yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
