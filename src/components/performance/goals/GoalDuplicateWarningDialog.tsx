import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Link2, User } from "lucide-react";

interface SimilarGoal {
  title: string;
  similarity_percentage: number;
  reason: string;
  recommendation: string;
  owner_name?: string;
}

interface GoalDuplicateWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  similarGoals: SimilarGoal[];
  onProceed: () => void;
  onLinkAsDependency?: (goalTitle: string) => void;
}

export function GoalDuplicateWarningDialog({
  open,
  onOpenChange,
  similarGoals,
  onProceed,
  onLinkAsDependency,
}: GoalDuplicateWarningDialogProps) {
  const [selectedForLink, setSelectedForLink] = useState<string | null>(null);

  const getSeverityColor = (percentage: number) => {
    if (percentage >= 90) return "destructive";
    if (percentage >= 70) return "secondary";
    return "outline";
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Similar Goals Detected
          </AlertDialogTitle>
          <AlertDialogDescription>
            We found goals that appear similar to the one you're creating. This could indicate duplication.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {similarGoals.map((goal, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-colors ${
                selectedForLink === goal.title
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{goal.title}</p>
                  {goal.owner_name && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <User className="h-3 w-3" />
                      {goal.owner_name}
                    </p>
                  )}
                </div>
                <Badge variant={getSeverityColor(goal.similarity_percentage)}>
                  {goal.similarity_percentage}% match
                </Badge>
              </div>

              <div className="mt-2">
                <Progress value={goal.similarity_percentage} className="h-1.5" />
              </div>

              <p className="text-xs text-muted-foreground mt-2">{goal.reason}</p>

              {goal.recommendation && (
                <p className="text-xs text-primary mt-1 font-medium">
                  💡 {goal.recommendation}
                </p>
              )}

              {onLinkAsDependency && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                  onClick={() => setSelectedForLink(goal.title)}
                >
                  <Link2 className="h-3 w-3 mr-1" />
                  Link as dependency
                </Button>
              )}
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {selectedForLink && onLinkAsDependency ? (
            <AlertDialogAction
              onClick={() => onLinkAsDependency(selectedForLink)}
              className="bg-primary"
            >
              Link & Continue
            </AlertDialogAction>
          ) : (
            <AlertDialogAction onClick={onProceed}>
              Proceed Anyway
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
