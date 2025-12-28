import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, XCircle } from "lucide-react";
import { ImportProgress } from "./types";

interface WizardStepCompleteProps {
  progress: ImportProgress;
  onClose: () => void;
}

export function WizardStepComplete({ progress, onClose }: WizardStepCompleteProps) {
  return (
    <div className="py-8 text-center space-y-6">
      <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
        <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Import Complete!</h2>
        <p className="text-muted-foreground">
          Your capability library is now ready to use
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {progress.importedSkills}
          </p>
          <p className="text-sm text-muted-foreground">Skills</p>
        </div>
        <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {progress.importedCompetencies}
          </p>
          <p className="text-sm text-muted-foreground">Competencies</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50 border">
          <p className="text-2xl font-bold">{progress.skipped}</p>
          <p className="text-sm text-muted-foreground">Skipped</p>
        </div>
      </div>

      {progress.errors.length > 0 && (
        <Alert variant="destructive" className="max-w-md mx-auto text-left">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">Some errors occurred:</p>
            <ul className="text-xs list-disc list-inside">
              {progress.errors.slice(0, 3).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {progress.errors.length > 3 && (
                <li>...and {progress.errors.length - 3} more</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Button onClick={onClose} size="lg">
        <Check className="mr-2 h-4 w-4" />
        View My Capability Library
      </Button>
    </div>
  );
}
