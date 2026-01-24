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
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Rocket,
  Users,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  Printer,
  RotateCcw,
  Link2,
  BarChart3,
  GitBranch,
  Play,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import type { QuickStartData } from "@/types/quickstart";

interface QuickStartTemplateProps {
  data: QuickStartData;
}

export function QuickStartTemplate({ data }: QuickStartTemplateProps) {
  const navigate = useNavigate();
  const storageKeyPrefix = `${data.moduleCode.toLowerCase()}-quickstart`;
  
  // Persisted state using localStorage
  const [completedPrereqs, setCompletedPrereqs] = useLocalStorage<string[]>(`${storageKeyPrefix}-prereqs`, []);
  const [completedSteps, setCompletedSteps] = useLocalStorage<string[]>(`${storageKeyPrefix}-steps`, []);
  const [completedVerifications, setCompletedVerifications] = useLocalStorage<string[]>(`${storageKeyPrefix}-verifications`, []);
  const [completedIntegrations, setCompletedIntegrations] = useLocalStorage<string[]>(`${storageKeyPrefix}-integrations`, []);
  const [selectedRollout, setSelectedRollout] = useLocalStorage<string>(`${storageKeyPrefix}-rollout`, '');
  const [expandedSteps, setExpandedSteps] = useLocalStorage<string[]>(`${storageKeyPrefix}-expanded`, ['step-1']);

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

  const requiredPrereqs = data.prerequisites.filter((p) => p.required);
  const requiredComplete = requiredPrereqs.filter((p) =>
    completedPrereqs.includes(p.id)
  ).length;
  const allRequiredComplete = requiredComplete === requiredPrereqs.length;

  const totalItems = data.prerequisites.length + data.setupSteps.length + data.verificationChecks.length + data.integrationChecklist.length;
  const completedItems = completedPrereqs.length + completedSteps.length + completedVerifications.length + completedIntegrations.length;
  const totalProgress = (completedItems / totalItems) * 100;

  const totalEstimatedTime = data.setupSteps.reduce((acc, step) => {
    const minutes = parseInt(step.estimatedTime);
    return acc + (isNaN(minutes) ? 0 : minutes);
  }, 0);

  // Dynamic color classes based on module
  const colorClasses = {
    iconBg: `bg-${data.colorClass}-500/10`,
    iconText: `text-${data.colorClass}-600`,
  };

  const IconComponent = data.icon;

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6 max-w-4xl print:max-w-none">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Quick Start Guides", href: "/enablement/quickstarts" },
            { label: data.breadcrumbLabel },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${colorClasses.iconBg} print:hidden`}>
              <IconComponent className={`h-8 w-8 ${colorClasses.iconText}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight">
                  {data.title}
                </h1>
                <Badge variant="secondary" className="print:hidden">
                  <Clock className="h-3 w-3 mr-1" />
                  ~{totalEstimatedTime} min setup
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {data.subtitle}
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
              Roles and responsibilities for implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {data.roles.map((role) => (
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
                <strong>Quick Setup:</strong> {data.quickSetupTime} • <strong>Full Configuration:</strong> {data.fullConfigTime}
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
              {data.pitfalls.map((pitfall, idx) => (
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
            {data.prerequisites.map((prereq) => (
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
        {data.contentStrategyQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Before You Begin: Content Strategy
              </CardTitle>
              <CardDescription>
                Answer these questions before proceeding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.contentStrategyQuestions.map((question, idx) => (
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
        )}

        {/* Setup Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Setup Steps
            </CardTitle>
            <CardDescription>
              Follow these steps (~{totalEstimatedTime} min total)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.setupSteps.map((step, index) => (
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
        {data.rolloutOptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                Choose Your Rollout Strategy
              </CardTitle>
              <CardDescription>
                Select how you'll introduce this to your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedRollout} onValueChange={setSelectedRollout}>
                <div className="space-y-3">
                  {data.rolloutOptions.map((option) => (
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
              {data.rolloutRecommendation && (
                <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm">
                    <strong className="text-blue-700 dark:text-blue-400">Recommended:</strong>{" "}
                    <span className="text-muted-foreground">
                      {data.rolloutRecommendation}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
            {data.verificationChecks.map((check, idx) => (
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
        {data.integrationChecklist.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Integration Checklist
              </CardTitle>
              <CardDescription>
                Configure these integrations for full functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.integrationChecklist.map((item) => (
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
        )}

        {/* Success Metrics */}
        {data.successMetrics.length > 0 && (
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
                    {data.successMetrics.map((metric, idx) => (
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
        )}

        {/* Next Steps */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 print:hidden">
            {data.nextSteps.map((nextStep, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(nextStep.href)}
              >
                <nextStep.icon className="h-4 w-4 mr-2" />
                {nextStep.label}
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
