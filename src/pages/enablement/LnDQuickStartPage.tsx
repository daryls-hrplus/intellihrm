import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  AlertTriangle,
  Target,
  Lightbulb,
  Printer,
  RotateCcw,
  Briefcase,
  UserCog,
  MonitorCog,
  Link2,
  BarChart3,
  GitBranch,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

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
  estimatedTime: string;
  substeps?: string[];
  expectedResult?: string;
  href?: string;
}

interface Pitfall {
  issue: string;
  prevention: string;
}

interface SuccessMetric {
  metric: string;
  target: string;
  howToMeasure: string;
}

// Role definitions for who should complete this guide
const ROLES = [
  {
    role: "Primary Owner",
    title: "HR Administrator or L&D Manager",
    icon: UserCog,
    responsibility: "Completes all setup steps, configures courses",
  },
  {
    role: "Supporting Role",
    title: "IT Administrator",
    icon: MonitorCog,
    responsibility: "Assists with SSO, integrations, technical setup",
  },
  {
    role: "Content Creator",
    title: "Subject Matter Expert",
    icon: Briefcase,
    responsibility: "Provides course content, reviews materials",
  },
];

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
    estimatedTime: "2 min",
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
    estimatedTime: "5 min",
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
    estimatedTime: "10 min",
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
    estimatedTime: "8 min",
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
    estimatedTime: "5 min",
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

const COMMON_PITFALLS: Pitfall[] = [
  {
    issue: "Publishing before testing",
    prevention: "Always use draft mode first and enroll yourself as a test learner before making courses available",
  },
  {
    issue: "Skipping competency mapping",
    prevention: "Courses without skill links won't feed AI recommendations or appear in development plans",
  },
  {
    issue: "No manager hierarchy set",
    prevention: "Manager-assigned training workflows will fail; verify org chart is complete first",
  },
  {
    issue: "Missing course prerequisites",
    prevention: "Define learning path sequences before creating dependent courses",
  },
];

const CONTENT_STRATEGY_QUESTIONS = [
  "Will you use external content providers (LinkedIn Learning, Udemy for Business)?",
  "What mix of video vs. document vs. instructor-led training (ILT)?",
  "Will you create learning paths or standalone courses?",
  "How will you handle compliance training vs. professional development?",
];

const VERIFICATION_CHECKS = [
  "Course appears in Training Dashboard catalog",
  "Employees can self-enroll (if enabled)",
  "Progress tracking shows lesson completion",
  "Quiz scores are recorded correctly",
  "Certificates generate upon completion (if configured)",
  "Manager can view team training status",
];

const INTEGRATION_CHECKLIST = [
  { id: "sso", label: "SSO/Authentication configured", required: true },
  { id: "hris", label: "HR System sync enabled (employee data)", required: true },
  { id: "content", label: "External content providers connected", required: false },
  { id: "notifications", label: "Email notifications configured", required: true },
  { id: "calendar", label: "Calendar integration for ILT sessions", required: false },
];

const SUCCESS_METRICS: SuccessMetric[] = [
  { metric: "Course Enrollment Rate", target: "50% in first month", howToMeasure: "LMS Analytics Dashboard" },
  { metric: "Completion Rate", target: "70%+", howToMeasure: "Course Reports" },
  { metric: "Learner Satisfaction", target: "4/5 stars", howToMeasure: "Post-course surveys" },
  { metric: "Time to First Completion", target: "< 7 days", howToMeasure: "Enrollment-to-completion tracking" },
];

const ROLLOUT_OPTIONS = [
  { id: "soft", label: "Soft Launch", description: "Start with 5-10 pilot users, gather feedback, iterate" },
  { id: "department", label: "Department Rollout", description: "Launch to one department first, then expand" },
  { id: "full", label: "Full Launch", description: "Open to all employees immediately" },
];

export default function LnDQuickStartPage() {
  const navigate = useNavigate();
  
  // Persisted state using localStorage
  const [completedPrereqs, setCompletedPrereqs] = useLocalStorage<string[]>('lnd-quickstart-prereqs', []);
  const [completedSteps, setCompletedSteps] = useLocalStorage<string[]>('lnd-quickstart-steps', []);
  const [completedVerifications, setCompletedVerifications] = useLocalStorage<string[]>('lnd-quickstart-verifications', []);
  const [completedIntegrations, setCompletedIntegrations] = useLocalStorage<string[]>('lnd-quickstart-integrations', []);
  const [selectedRollout, setSelectedRollout] = useLocalStorage<string>('lnd-quickstart-rollout', '');
  const [expandedSteps, setExpandedSteps] = useLocalStorage<string[]>('lnd-quickstart-expanded', ['step-1']);

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

  const toggleIntegration = (id: string) => {
    setCompletedIntegrations((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedSteps((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setCompletedPrereqs([]);
    setCompletedSteps([]);
    setCompletedVerifications([]);
    setCompletedIntegrations([]);
    setSelectedRollout('');
    setExpandedSteps(['step-1']);
    toast({
      title: "Progress Reset",
      description: "All checklist progress has been cleared.",
    });
  };

  const requiredPrereqs = PREREQUISITES.filter((p) => p.required);
  const requiredComplete = requiredPrereqs.filter((p) =>
    completedPrereqs.includes(p.id)
  ).length;
  const allRequiredComplete = requiredComplete === requiredPrereqs.length;

  const totalItems = PREREQUISITES.length + SETUP_STEPS.length + VERIFICATION_CHECKS.length + INTEGRATION_CHECKLIST.length;
  const completedItems = completedPrereqs.length + completedSteps.length + completedVerifications.length + completedIntegrations.length;
  const totalProgress = (completedItems / totalItems) * 100;

  const totalEstimatedTime = SETUP_STEPS.reduce((acc, step) => {
    const minutes = parseInt(step.estimatedTime);
    return acc + (isNaN(minutes) ? 0 : minutes);
  }, 0);

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6 max-w-4xl print:max-w-none">
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
            <div className="p-3 rounded-lg bg-emerald-500/10 print:hidden">
              <GraduationCap className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight">
                  L&D Quick Start Guide
                </h1>
                <Badge variant="secondary" className="print:hidden">
                  <Clock className="h-3 w-3 mr-1" />
                  ~{totalEstimatedTime} min setup
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Get your Learning Management System up and running with your first course
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Progress */}
          <Card className="print:hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(totalProgress)}% complete ({completedItems}/{totalItems} items)
                </span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Who Should Complete This */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Who Should Complete This
            </CardTitle>
            <CardDescription>
              Roles and responsibilities for LMS implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {ROLES.map((role) => (
                <div key={role.role} className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <role.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium text-sm">{role.role}</span>
                  </div>
                  <p className="font-semibold text-sm">{role.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{role.responsibility}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Time Investment</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>First Course:</strong> 15-30 minutes • <strong>Full Configuration:</strong> 2-4 hours
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Common Pitfalls Alert */}
        <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10 text-foreground">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-700 dark:text-amber-400">Common Pitfalls to Avoid</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {COMMON_PITFALLS.map((pitfall, idx) => (
                <div key={idx} className="flex gap-2 text-sm">
                  <span className="font-medium text-amber-700 dark:text-amber-400 min-w-[180px]">
                    ❌ {pitfall.issue}
                  </span>
                  <span className="text-muted-foreground">→ {pitfall.prevention}</span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>

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
                  className="mt-1 print:hidden"
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
                      className="h-auto p-0 mt-1 text-xs print:hidden"
                      onClick={() => navigate(prereq.href!)}
                    >
                      Go to {prereq.module} →
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {!allRequiredComplete && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 print:hidden">
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

        {/* Content Strategy Decision Point */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Before You Begin: Content Strategy
            </CardTitle>
            <CardDescription>
              Answer these questions before creating your first course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {CONTENT_STRATEGY_QUESTIONS.map((question, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
                  <Checkbox id={`strategy-${idx}`} className="mt-0.5" />
                  <label htmlFor={`strategy-${idx}`} className="text-sm cursor-pointer">
                    {question}
                  </label>
                </div>
              ))}
            </div>
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
              Follow these steps to create your first course (~{totalEstimatedTime} min total)
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
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{step.title}</p>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {step.estimatedTime}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                      {expandedSteps.includes(step.id) ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground print:hidden" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground print:hidden" />
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
                          <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Expected Result
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {step.expectedResult}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2 print:hidden">
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

        {/* Rollout Strategy Decision */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Choose Your Rollout Strategy
            </CardTitle>
            <CardDescription>
              Select how you'll introduce the LMS to your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedRollout} onValueChange={setSelectedRollout}>
              <div className="space-y-3">
                {ROLLOUT_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRollout === option.id
                        ? "bg-primary/5 border-primary/30"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem value={option.id} id={option.id} className="mt-0.5" />
                    <Label htmlFor={option.id} className="cursor-pointer flex-1">
                      <span className="font-medium">{option.label}</span>
                      <p className="text-sm text-muted-foreground mt-0.5">{option.description}</p>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm">
                <strong className="text-blue-700 dark:text-blue-400">Recommended:</strong>{" "}
                <span className="text-muted-foreground">
                  Start with Soft Launch to gather feedback before expanding organization-wide.
                </span>
              </p>
            </div>
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
                  className="print:hidden"
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

        {/* Integration Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Integration Checklist
            </CardTitle>
            <CardDescription>
              Configure these integrations for full LMS functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {INTEGRATION_CHECKLIST.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
              >
                <Checkbox
                  id={`integration-${item.id}`}
                  checked={completedIntegrations.includes(item.id)}
                  onCheckedChange={() => toggleIntegration(item.id)}
                  className="print:hidden"
                />
                <label
                  htmlFor={`integration-${item.id}`}
                  className={`text-sm cursor-pointer flex-1 ${
                    completedIntegrations.includes(item.id)
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {item.label}
                </label>
                {item.required && (
                  <Badge variant="outline" className="text-xs">Required</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Success Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Success Metrics
            </CardTitle>
            <CardDescription>
              Track these KPIs after launch to measure success
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Metric</th>
                    <th className="text-left py-2 font-medium">Target</th>
                    <th className="text-left py-2 font-medium">How to Measure</th>
                  </tr>
                </thead>
                <tbody>
                  {SUCCESS_METRICS.map((metric, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-2 font-medium">{metric.metric}</td>
                      <td className="py-2 text-muted-foreground">{metric.target}</td>
                      <td className="py-2 text-muted-foreground">{metric.howToMeasure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 print:hidden">
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
