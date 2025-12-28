import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, Target } from "lucide-react";
import { ImportProgress } from "./types";

interface WizardStepImportingProps {
  progress: ImportProgress;
}

export function WizardStepImporting({ progress }: WizardStepImportingProps) {
  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="py-8 space-y-6">
      <div className="text-center space-y-2">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <h2 className="text-xl font-bold">Importing Capabilities...</h2>
        <p className="text-muted-foreground">
          Please wait while we import your selected skills and competencies
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              Item {progress.current} of {progress.total}
            </span>
            <span>{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        {progress.currentItem && (
          <p className="text-sm text-center text-muted-foreground">
            Processing: {progress.currentItem}
          </p>
        )}

        <div className="flex justify-center gap-4 text-sm">
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            {progress.importedSkills} skills
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Target className="h-3 w-3" />
            {progress.importedCompetencies} competencies
          </Badge>
          <Badge variant="outline" className="gap-1">
            {progress.skipped} skipped
          </Badge>
        </div>
      </div>
    </div>
  );
}
