import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  ClipboardCheck,
  MessageSquare,
  GraduationCap,
  TrendingUp,
  Zap,
  ArrowRight,
  ExternalLink,
  Settings2,
} from "lucide-react";
import { Link } from "react-router-dom";

interface QuickStartTemplate {
  processType: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  templatesCount: number;
}

const quickStartOptions: QuickStartTemplate[] = [
  {
    processType: "goals",
    label: "Goal Approvals",
    description: "Individual, team, and department goal workflows",
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
    templatesCount: 3,
  },
  {
    processType: "appraisals",
    label: "Rating Approvals",
    description: "Performance rating review and calibration sign-off",
    icon: ClipboardCheck,
    color: "text-success",
    bgColor: "bg-success/10",
    templatesCount: 2,
  },
  {
    processType: "360_feedback",
    label: "360 Feedback Release",
    description: "Quality review before releasing feedback to employees",
    icon: MessageSquare,
    color: "text-info",
    bgColor: "bg-info/10",
    templatesCount: 1,
  },
  {
    processType: "succession",
    label: "Succession Planning",
    description: "Multi-level approval for succession nominations",
    icon: TrendingUp,
    color: "text-secondary-foreground",
    bgColor: "bg-secondary/10",
    templatesCount: 1,
  },
  {
    processType: "learning",
    label: "Learning Requests",
    description: "Training and certification request approvals",
    icon: GraduationCap,
    color: "text-warning",
    bgColor: "bg-warning/10",
    templatesCount: 1,
  },
];

interface WorkflowQuickStartSectionProps {
  onQuickSetup: (processType: string) => void;
  existingProcessTypes?: string[];
}

export function WorkflowQuickStartSection({
  onQuickSetup,
  existingProcessTypes = [],
}: WorkflowQuickStartSectionProps) {
  const hasWorkflow = (processType: string) =>
    existingProcessTypes.includes(processType);

  const configuredCount = quickStartOptions.filter((opt) =>
    hasWorkflow(opt.processType)
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Quick Setup</h3>
          <Badge variant="secondary" className="text-xs">
            {configuredCount}/{quickStartOptions.length} configured
          </Badge>
        </div>
        <Link to="/hr/workflow">
          <Button variant="ghost" size="sm" className="text-xs">
            <Settings2 className="h-3 w-3 mr-1" />
            Advanced Workflow Settings
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {quickStartOptions.map((option) => {
          const Icon = option.icon;
          const isConfigured = hasWorkflow(option.processType);

          return (
            <Card
              key={option.processType}
              className={`hover:border-primary/50 transition-colors cursor-pointer ${
                isConfigured ? "border-success/50 bg-success/5" : ""
              }`}
              onClick={() => onQuickSetup(option.processType)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`p-3 rounded-lg ${option.bgColor}`}>
                    <Icon className={`h-6 w-6 ${option.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{option.label}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                  <Badge
                    variant={isConfigured ? "default" : "secondary"}
                    className="text-xs mt-2"
                  >
                    {isConfigured ? "Configured" : `${option.templatesCount} template${option.templatesCount > 1 ? "s" : ""}`}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Link to core workflow module */}
      <div className="flex items-center justify-center pt-2">
        <Link to="/hr/workflow">
          <Button variant="outline" size="sm">
            View All Workflows in HR Hub
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
