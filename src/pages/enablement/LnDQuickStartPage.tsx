import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Rocket,
  BookOpen,
  Users,
  FolderTree,
  Settings,
  Play,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  href?: string;
  module?: string;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  substeps?: string[];
  expectedResult?: string;
  href?: string;
}

const PREREQUISITES: ChecklistItem[] = [
  {
    id: "competency-library",
    title: "Competency Library Populated",
    description: "At least core competencies should be defined for course-to-skill mapping",
    required: true,
    href: "/performance/setup?tab=competencies",
    module: "Performance",
  },
  {
    id: "job-profiles",
    title: "Job Profiles Configured",
    description: "Job profiles enable role-based learning path recommendations",
    required: true,
    href: "/workforce/positions",
    module: "Workforce",
  },
  {
    id: "employee-records",
    title: "Employee Records Created",
    description: "Employees must exist to be enrolled in courses",
    required: true,
    href: "/workforce/employees",
    module: "Workforce",
  },
  {
    id: "manager-hierarchy",
    title: "Manager Hierarchy Established",
    description: "Required for manager-assigned training and approval workflows",
    required: true,
    href: "/workforce/org-chart",
    module: "Workforce",
  },
  {
    id: "departments",
    title: "Departments Defined",
    description: "Enables department-level training assignments and reporting",
    required: false,
    href: "/workforce/departments",
    module: "Workforce",
  },
];

const SETUP_STEPS: SetupStep[] = [
  {
    id: "step-1",
    title: "Navigate to LMS Admin",
    description: "Access the Learning Management System administration panel",
    substeps: [
      "Go to Admin Dashboard",
      "Click on 'LMS Management' under Platform Settings",
    ],
    href: "/admin/lms-management",
  },
  {
    id: "step-2",
    title: "Configure Course Categories",
    description: "Create logical groupings for your training content",
    substeps: [
      "Click 'Add Category'",
      "Enter category name (e.g., 'Compliance', 'Technical Skills', 'Leadership')",
      "Add description and icon",
      "Set display order",
    ],
    expectedResult: "At least 3 categories visible in the category list",
  },
  {
    id: "step-3",
    title: "Create Your First Course",
    description: "Set up a basic course with modules and lessons",
    substeps: [
      "Click 'Create Course' button",
      "Enter course title and description",
      "Select category and set difficulty level",
      "Add at least one module with 2-3 lessons",
      "Configure course duration estimate",
    ],
    expectedResult: "Course appears in the course catalog with 'Draft' status",
  },
  {
    id: "step-4",
    title: "Add Quiz or Assessment",
    description: "Create knowledge checks for your course",
    substeps: [
      "Open your created course",
      "Navigate to 'Assessments' tab",
      "Click 'Add Quiz'",
      "Add 3-5 multiple choice questions",
      "Set passing score (typically 70-80%)",
    ],
    expectedResult: "Quiz linked to course with questions visible",
  },
  {
    id: "step-5",
    title: "Publish and Test",
    description: "Make the course available and verify learner experience",
    substeps: [
      "Review course content and structure",
      "Click 'Publish' to make course available",
      "Enroll yourself as a test learner",
      "Complete the course and quiz",
      "Verify completion is recorded",
    ],
    expectedResult: "Course completion and quiz score recorded in your training history",
  },
];

const VERIFICATION_CHECKS = [
  "Course appears in Training Dashboard catalog",
  "Employees can self-enroll (if enabled)",
  "Progress tracking shows lesson completion",
  "Quiz scores are recorded correctly",
  "Certificates generate upon completion (if configured)",
  "Manager can view team training status",
];

export default function LnDQuickStartPage() {
  const navigate = useNavigate();
  const [completedPrereqs, setCompletedPrereqs] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [completedVerifications, setCompletedVerifications] = useState<string[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<string[]>(["step-1"]);

  const togglePrereq = (id: string) => {
    setCompletedPrereqs((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleStep = (id: string) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleVerification = (check: string) => {
    setCompletedVerifications((prev) =>
      prev.includes(check) ? prev.filter((v) => v !== check) : [...prev, check]
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedSteps((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const requiredPrereqs = PREREQUISITES.filter((p) => p.required);
  const requiredComplete = requiredPrereqs.filter((p) =>
    completedPrereqs.includes(p.id)
  ).length;
  const allRequiredComplete = requiredComplete === requiredPrereqs.length;

  const totalProgress =
    ((completedPrereqs.length + completedSteps.length + completedVerifications.length) /
      (PREREQUISITES.length + SETUP_STEPS.length + VERIFICATION_CHECKS.length)) *
    100;

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6 max-w-4xl">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Quick Start Guides", href: "/enablement/quickstarts" },
            { label: "Learning & Development" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10">
              <GraduationCap className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  L&D Quick Start Guide
                </h1>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  15 min
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Get your Learning Management System up and running with your first course
              </p>
            </div>
          </div>

          {/* Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(totalProgress)}% complete
                </span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Prerequisites Section */}
        <Card id="prerequisites">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Prerequisites
                </CardTitle>
                <CardDescription>
                  Complete these configurations in other modules first
                </CardDescription>
              </div>
              <Badge
                variant={allRequiredComplete ? "default" : "secondary"}
                className={allRequiredComplete ? "bg-green-500" : ""}
              >
                {requiredComplete}/{requiredPrereqs.length} Required
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {PREREQUISITES.map((prereq) => (
              <div
                key={prereq.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  completedPrereqs.includes(prereq.id)
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-muted/30"
                }`}
              >
                <Checkbox
                  id={prereq.id}
                  checked={completedPrereqs.includes(prereq.id)}
                  onCheckedChange={() => togglePrereq(prereq.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={prereq.id}
                      className={`font-medium cursor-pointer ${
                        completedPrereqs.includes(prereq.id)
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {prereq.title}
                    </label>
                    {prereq.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {prereq.description}
                  </p>
                  {prereq.href && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 mt-1 text-xs"
                      onClick={() => navigate(prereq.href!)}
                    >
                      Go to {prereq.module} →
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {!allRequiredComplete && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Complete required prerequisites</p>
                  <p className="text-xs text-muted-foreground">
                    You can proceed with setup, but some features may not work correctly
                    without these configurations.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Setup Steps
            </CardTitle>
            <CardDescription>
              Follow these steps to create your first course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {SETUP_STEPS.map((step, index) => (
              <Collapsible
                key={step.id}
                open={expandedSteps.includes(step.id)}
                onOpenChange={() => toggleExpand(step.id)}
              >
                <div
                  className={`rounded-lg border ${
                    completedSteps.includes(step.id)
                      ? "bg-green-500/5 border-green-500/20"
                      : "bg-background"
                  }`}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          completedSteps.includes(step.id)
                            ? "bg-green-500 text-white"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {completedSteps.includes(step.id) ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{step.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                      {expandedSteps.includes(step.id) ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3">
                      <Separator />
                      {step.substeps && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Steps:</p>
                          <ul className="space-y-1 ml-4">
                            {step.substeps.map((substep, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-muted-foreground flex items-start gap-2"
                              >
                                <Circle className="h-2 w-2 mt-1.5 fill-current" />
                                {substep}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {step.expectedResult && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Expected Result
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {step.expectedResult}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2">
                        {step.href && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(step.href!)}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in App
                          </Button>
                        )}
                        <Button
                          variant={completedSteps.includes(step.id) ? "secondary" : "default"}
                          size="sm"
                          onClick={() => toggleStep(step.id)}
                        >
                          {completedSteps.includes(step.id) ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Mark Complete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </CardContent>
        </Card>

        {/* Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Verification Checklist
            </CardTitle>
            <CardDescription>
              Confirm these items work correctly after setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {VERIFICATION_CHECKS.map((check, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
              >
                <Checkbox
                  id={`verify-${idx}`}
                  checked={completedVerifications.includes(check)}
                  onCheckedChange={() => toggleVerification(check)}
                />
                <label
                  htmlFor={`verify-${idx}`}
                  className={`text-sm cursor-pointer ${
                    completedVerifications.includes(check)
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {check}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/admin/lms-management")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure Advanced LMS Settings
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/training")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              View Training Dashboard (Learner View)
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/enablement/modules/learning-development")}
            >
              <FolderTree className="h-4 w-4 mr-2" />
              View Full L&D Documentation
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
