import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  GitBranch, 
  Users, 
  ChevronDown, 
  ChevronRight, 
  Lightbulb, 
  Scale, 
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  BookOpen
} from "lucide-react";

interface GuidanceSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  isRecommendation?: boolean;
}

interface ManagerRoleChangeGuidanceProps {
  hasRoleChange: boolean;
  hasMultiPosition: boolean;
  roleSegments?: Array<{
    position_title: string;
    contribution_percentage: number;
  }>;
  positions?: Array<{
    position_title: string;
    weight_percentage: number;
  }>;
  onRequestAIAssistance?: () => void;
}

export function ManagerRoleChangeGuidance({
  hasRoleChange,
  hasMultiPosition,
  roleSegments = [],
  positions = [],
  onRequestAIAssistance,
}: ManagerRoleChangeGuidanceProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["overview"]));

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!hasRoleChange && !hasMultiPosition) {
    return null;
  }

  const roleChangeGuidance: GuidanceSection[] = hasRoleChange
    ? [
        {
          id: "overview",
          title: "Understanding Role Change Evaluation",
          icon: <BookOpen className="h-4 w-4" />,
          content: (
            <div className="space-y-3 text-sm">
              <p>
                This employee changed roles during the appraisal period. Their performance
                should be evaluated proportionally based on time spent in each role.
              </p>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium mb-2">Role Segments:</p>
                <ul className="space-y-1">
                  {roleSegments.map((segment, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {segment.contribution_percentage}%
                      </Badge>
                      <span>{segment.position_title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ),
        },
        {
          id: "weighting",
          title: "How Weighting Works",
          icon: <Scale className="h-4 w-4" />,
          content: (
            <div className="space-y-3 text-sm">
              <p>Scores are automatically weighted based on the time spent in each role:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Each role segment has competencies, responsibilities, and goals</li>
                <li>You rate each segment separately</li>
                <li>Final scores are calculated using contribution percentages</li>
                <li>This ensures fair evaluation regardless of when the transition occurred</li>
              </ul>
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Pro Tip</AlertTitle>
                <AlertDescription>
                  Consider the learning curve when evaluating the new role. Initial months
                  may show lower performance as the employee adapts.
                </AlertDescription>
              </Alert>
            </div>
          ),
        },
        {
          id: "recommendations",
          title: "Evaluation Recommendations",
          icon: <CheckCircle className="h-4 w-4" />,
          isRecommendation: true,
          content: (
            <div className="space-y-3 text-sm">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                  <span>
                    <strong>Evaluate each role independently</strong> - Don't let
                    performance in one role influence ratings for another.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                  <span>
                    <strong>Consider transition context</strong> - Was it a promotion,
                    lateral move, or restructuring? Adjust expectations accordingly.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                  <span>
                    <strong>Document role-specific achievements</strong> - Capture wins
                    and challenges for each position separately.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                  <span>
                    <strong>Discuss career trajectory</strong> - Use this as an opportunity
                    to explore future growth based on performance in both roles.
                  </span>
                </li>
              </ul>
            </div>
          ),
        },
      ]
    : [];

  const multiPositionGuidance: GuidanceSection[] = hasMultiPosition
    ? [
        {
          id: "multi-overview",
          title: "Evaluating Multiple Concurrent Positions",
          icon: <Users className="h-4 w-4" />,
          content: (
            <div className="space-y-3 text-sm">
              <p>
                This employee holds multiple positions simultaneously. Each position
                contributes to their overall performance score based on assigned weights.
              </p>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium mb-2">Position Weights:</p>
                <ul className="space-y-1">
                  {positions.map((position, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {position.weight_percentage}%
                      </Badge>
                      <span>{position.position_title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ),
        },
        {
          id: "multi-weighting",
          title: "Weight Adjustment Considerations",
          icon: <Scale className="h-4 w-4" />,
          content: (
            <div className="space-y-3 text-sm">
              <p>Position weights can be adjusted if needed. Consider adjusting when:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Actual time allocation differs from planned FTE</li>
                <li>Business priorities shifted during the period</li>
                <li>One position became more critical than anticipated</li>
                <li>Employee took on additional responsibilities in one role</li>
              </ul>
              <Alert variant="default" className="border-warning/50 bg-warning/10">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Weight changes should be documented and discussed with the employee
                  before finalizing the appraisal.
                </AlertDescription>
              </Alert>
            </div>
          ),
        },
        {
          id: "multi-recommendations",
          title: "Best Practices for Multi-Position Evaluation",
          icon: <CheckCircle className="h-4 w-4" />,
          isRecommendation: true,
          content: (
            <div className="space-y-3 text-sm">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                  <span>
                    <strong>Rate positions independently</strong> - Avoid averaging
                    mentally; let the system calculate weighted scores.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                  <span>
                    <strong>Consider workload balance</strong> - High performance across
                    multiple positions deserves recognition.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                  <span>
                    <strong>Identify synergies</strong> - Note where skills in one position
                    benefit performance in another.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                  <span>
                    <strong>Discuss sustainability</strong> - Is the current multi-position
                    arrangement working well for the employee?
                  </span>
                </li>
              </ul>
            </div>
          ),
        },
      ]
    : [];

  const allGuidance = [...roleChangeGuidance, ...multiPositionGuidance];

  return (
    <Card className="border-info/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {hasRoleChange && <GitBranch className="h-4 w-4 text-info" />}
          {hasMultiPosition && <Users className="h-4 w-4 text-primary" />}
          Manager Guidance
        </CardTitle>
        <CardDescription>
          {hasRoleChange && hasMultiPosition
            ? "This employee has both role changes and multiple positions"
            : hasRoleChange
            ? "Tips for evaluating employees who changed roles"
            : "Tips for evaluating employees with multiple positions"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {allGuidance.map((section) => (
          <Collapsible
            key={section.id}
            open={expandedSections.has(section.id)}
            onOpenChange={() => toggleSection(section.id)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full justify-between p-3 h-auto ${
                  section.isRecommendation ? "bg-success/5 hover:bg-success/10" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span className="font-medium">{section.title}</span>
                  {section.isRecommendation && (
                    <Badge variant="outline" className="text-xs text-success border-success/30">
                      Recommended
                    </Badge>
                  )}
                </div>
                {expandedSections.has(section.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">{section.content}</CollapsibleContent>
          </Collapsible>
        ))}

        <Separator className="my-3" />

        {onRequestAIAssistance && (
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={onRequestAIAssistance}
          >
            <MessageSquare className="h-4 w-4" />
            Get AI Suggestions for This Evaluation
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
