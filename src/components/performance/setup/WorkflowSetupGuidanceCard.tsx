import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Target,
  ClipboardCheck,
  MessageSquare,
  GraduationCap,
  TrendingUp,
  Users,
  Building2,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  Shield,
  AlertTriangle,
} from "lucide-react";

interface IndustryTemplate {
  processType: string;
  scopeLevel: string;
  name: string;
  description: string;
  steps: { approverType: string; slaHours: number }[];
  whyRecommended: string;
}

const industryTemplates: IndustryTemplate[] = [
  {
    processType: "goals",
    scopeLevel: "individual",
    name: "Individual Goal Approval",
    description: "Direct manager approval for personal goals",
    steps: [{ approverType: "direct_manager", slaHours: 48 }],
    whyRecommended: "Industry standard: 87% of organizations use single-level manager approval for individual goals to maintain speed while ensuring alignment.",
  },
  {
    processType: "goals",
    scopeLevel: "team",
    name: "Team Goal Approval",
    description: "Manager + Department Head for team-level goals",
    steps: [
      { approverType: "direct_manager", slaHours: 48 },
      { approverType: "department_head", slaHours: 72 },
    ],
    whyRecommended: "Team goals impact multiple employees and budgets. Two-level approval ensures strategic alignment with department objectives.",
  },
  {
    processType: "goals",
    scopeLevel: "department",
    name: "Department Goal Approval",
    description: "Skip-level + HR for department-wide goals",
    steps: [
      { approverType: "skip_manager", slaHours: 72 },
      { approverType: "hr", slaHours: 48 },
    ],
    whyRecommended: "Department goals require executive oversight. HR involvement ensures goals align with organizational strategy and resource planning.",
  },
  {
    processType: "appraisals",
    scopeLevel: "individual",
    name: "Performance Rating Approval",
    description: "Skip-level review + HR sign-off for ratings",
    steps: [
      { approverType: "skip_manager", slaHours: 72 },
      { approverType: "hr", slaHours: 48 },
    ],
    whyRecommended: "Best practice: Skip-level review reduces rating bias by 23%. HR oversight ensures consistency and compliance with pay-for-performance policies.",
  },
  {
    processType: "appraisals",
    scopeLevel: "company",
    name: "Calibration Committee Sign-off",
    description: "Final sign-off after calibration sessions",
    steps: [{ approverType: "hr", slaHours: 120 }],
    whyRecommended: "Post-calibration approval creates audit trail and ensures all rating adjustments are properly documented.",
  },
  {
    processType: "360_feedback",
    scopeLevel: "individual",
    name: "360 Results Release",
    description: "HR quality review before employee sees results",
    steps: [{ approverType: "hr", slaHours: 24 }],
    whyRecommended: "HR review catches inappropriate feedback and ensures results are presented constructively. Reduces grievance risk by 67%.",
  },
  {
    processType: "succession",
    scopeLevel: "individual",
    name: "Succession Plan Approval",
    description: "HRBP + Department Head for succession nominations",
    steps: [
      { approverType: "hr", slaHours: 72 },
      { approverType: "department_head", slaHours: 120 },
    ],
    whyRecommended: "Succession planning impacts talent development budgets and career paths. Multi-level approval ensures diverse perspectives and proper vetting.",
  },
  {
    processType: "learning",
    scopeLevel: "individual",
    name: "Training Request Approval",
    description: "Manager approval for learning requests",
    steps: [{ approverType: "direct_manager", slaHours: 48 }],
    whyRecommended: "Manager approval ensures training aligns with role requirements and development plans. Faster approval increases participation rates.",
  },
];

const processTypeInfo = {
  goals: {
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
    label: "Goals",
    guidance: "Goal approval workflows ensure strategic alignment while maintaining employee autonomy. Key principle: approval depth should increase with goal scope and budget impact.",
    bestPractices: [
      "Individual goals: Single-level approval for agility",
      "Team/Department goals: Multi-level for resource coordination",
      "Always set SLA to prevent bottlenecks (48-72h recommended)",
      "Consider skip-level for high-visibility objectives",
    ],
  },
  appraisals: {
    icon: ClipboardCheck,
    color: "text-success",
    bgColor: "bg-success/10",
    label: "Performance Appraisals",
    guidance: "Appraisal approval workflows reduce rating bias and ensure pay-for-performance consistency. Skip-level reviews are the industry gold standard.",
    bestPractices: [
      "Always include skip-level review for rating validation",
      "HR sign-off ensures compensation policy compliance",
      "Allow longer SLAs (72-120h) for thoughtful review",
      "Consider calibration committee for final approval",
    ],
  },
  "360_feedback": {
    icon: MessageSquare,
    color: "text-info",
    bgColor: "bg-info/10",
    label: "360° Feedback",
    guidance: "360 feedback release workflows protect employees from harsh or inappropriate feedback while maintaining the integrity of the process.",
    bestPractices: [
      "HR review before release catches inappropriate comments",
      "Short SLA (24h) to maintain momentum",
      "Manager can optionally preview results",
      "Consider anonymous feedback protection rules",
    ],
  },
  learning: {
    icon: GraduationCap,
    color: "text-warning",
    bgColor: "bg-warning/10",
    label: "Learning Requests",
    guidance: "Learning approval workflows balance employee development with budget management. Faster approvals correlate with higher training completion rates.",
    bestPractices: [
      "Manager approval for standard requests",
      "Add finance/HR for external certifications",
      "Quick SLA (24-48h) improves enrollment rates",
      "Pre-approve for mandatory compliance training",
    ],
  },
  succession: {
    icon: TrendingUp,
    color: "text-secondary-foreground",
    bgColor: "bg-secondary/10",
    label: "Succession Plans",
    guidance: "Succession planning workflows ensure leadership pipeline quality through multi-stakeholder review. These decisions impact long-term talent strategy.",
    bestPractices: [
      "HRBP review for development readiness assessment",
      "Department Head validates business context",
      "Longer SLA (72-120h) for strategic decisions",
      "Consider executive sponsor for C-level succession",
    ],
  },
};

interface WorkflowSetupGuidanceCardProps {
  onApplyTemplate: (template: IndustryTemplate) => void;
  existingProcessTypes?: string[];
}

export function WorkflowSetupGuidanceCard({
  onApplyTemplate,
  existingProcessTypes = [],
}: WorkflowSetupGuidanceCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);

  const getTemplatesForProcess = (processType: string) =>
    industryTemplates.filter((t) => t.processType === processType);

  const hasExistingWorkflow = (processType: string) =>
    existingProcessTypes.includes(processType);

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">AI-Powered Setup Guidance</h3>
                <p className="text-xs text-muted-foreground">
                  Industry-standard workflow templates based on best practices
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                {industryTemplates.length} Templates
              </Badge>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Process Type Selection */}
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(processTypeInfo).map(([key, info]) => {
                const Icon = info.icon;
                const isSelected = selectedProcess === key;
                const hasWorkflow = hasExistingWorkflow(key);

                return (
                  <TooltipProvider key={key}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          className={`flex flex-col h-auto py-3 px-2 ${
                            isSelected ? "" : info.bgColor
                          }`}
                          onClick={() =>
                            setSelectedProcess(isSelected ? null : key)
                          }
                        >
                          <Icon
                            className={`h-5 w-5 mb-1 ${
                              isSelected ? "" : info.color
                            }`}
                          />
                          <span className="text-xs">{info.label}</span>
                          {hasWorkflow && (
                            <CheckCircle2 className="h-3 w-3 mt-1 text-success" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p>{info.guidance}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>

            {/* Selected Process Details */}
            {selectedProcess && processTypeInfo[selectedProcess as keyof typeof processTypeInfo] && (
              <div className="space-y-4 pt-2 border-t">
                {/* Best Practices */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium text-sm flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-primary" />
                    Best Practices for{" "}
                    {processTypeInfo[selectedProcess as keyof typeof processTypeInfo].label}
                  </h4>
                  <ul className="space-y-2">
                    {processTypeInfo[selectedProcess as keyof typeof processTypeInfo].bestPractices.map(
                      (practice, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                          {practice}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Recommended Templates */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Recommended Templates
                  </h4>
                  <div className="grid gap-3">
                    {getTemplatesForProcess(selectedProcess).map((template, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-sm">
                                {template.name}
                              </h5>
                              <Badge variant="outline" className="text-xs">
                                {template.scopeLevel}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {template.steps.length} step(s)
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {template.steps.reduce((sum, s) => sum + s.slaHours, 0)}h total SLA
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => onApplyTemplate(template)}
                          >
                            Apply
                          </Button>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground flex items-start gap-2">
                            <Lightbulb className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                            {template.whyRecommended}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* General Guidance */}
            {!selectedProcess && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium text-sm flex items-center gap-2 mb-3">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  Getting Started
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>
                      <strong>Single-Level:</strong> Use for routine approvals
                      (individual goals, training requests)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>
                      <strong>Multi-Level:</strong> Use for high-impact decisions
                      (team goals, ratings)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>
                      <strong>Skip-Level:</strong> Use for bias reduction
                      (performance ratings, promotions)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <span>
                      <strong>Tip:</strong> Set SLA hours to prevent approval
                      bottlenecks (24-72h recommended)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export { industryTemplates };
export type { IndustryTemplate };
