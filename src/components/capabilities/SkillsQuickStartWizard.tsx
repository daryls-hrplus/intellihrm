import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Rocket,
  AlertCircle,
  Zap,
  Globe,
  XCircle,
} from "lucide-react";
import { IndustrySelector } from "./IndustrySelector";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SkillsQuickStartWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onComplete: () => void;
}

type WizardStep = "welcome" | "industry" | "importing" | "complete";

interface ImportProgress {
  current: number;
  total: number;
  currentOccupation: string;
  imported: number;
  skipped: number;
  errors: string[];
}

export function SkillsQuickStartWizard({
  open,
  onOpenChange,
  companyId,
  onComplete,
}: SkillsQuickStartWizardProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<WizardStep>("welcome");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedOccupations, setSelectedOccupations] = useState<string[]>([]);
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  const handleOccupationToggle = (occupationUri: string) => {
    setSelectedOccupations((prev) =>
      prev.includes(occupationUri)
        ? prev.filter((uri) => uri !== occupationUri)
        : [...prev, occupationUri]
    );
  };

  const handleSelectAllOccupations = (occupationUris: string[]) => {
    setSelectedOccupations(occupationUris);
  };

  const handleStartImport = async () => {
    if (!user || selectedOccupations.length === 0) return;

    setStep("importing");
    setProgress({
      current: 0,
      total: selectedOccupations.length,
      currentOccupation: "",
      imported: 0,
      skipped: 0,
      errors: [],
    });

    let totalImported = 0;
    let totalSkipped = 0;
    const allErrors: string[] = [];

    for (let i = 0; i < selectedOccupations.length; i++) {
      const occupationUri = selectedOccupations[i];

      // Get occupation label from mapping
      const { data: mapping } = await supabase
        .from("industry_occupation_mappings")
        .select("occupation_label")
        .eq("occupation_uri", occupationUri)
        .single();

      const occupationLabel = mapping?.occupation_label || "Unknown";

      setProgress((prev) =>
        prev
          ? {
              ...prev,
              current: i + 1,
              currentOccupation: occupationLabel,
            }
          : null
      );

      try {
        // Call edge function to bulk import
        const { data, error } = await supabase.functions.invoke(
          "esco-skills-import",
          {
            body: {
              action: "bulk_import_occupation",
              occupationUri,
              companyId,
              userId: user.id,
              language: "en",
              sourceOccupation: {
                uri: occupationUri,
                label: occupationLabel,
              },
            },
          }
        );

        if (error) throw error;

        if (data?.error) {
          allErrors.push(`${occupationLabel}: ${data.error}`);
        } else {
          totalImported += data?.imported || 0;
          totalSkipped += data?.skipped || 0;
          if (data?.errors?.length) {
            allErrors.push(...data.errors);
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        allErrors.push(`${occupationLabel}: ${msg}`);
      }

      setProgress((prev) =>
        prev
          ? {
              ...prev,
              imported: totalImported,
              skipped: totalSkipped,
              errors: allErrors,
            }
          : null
      );

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setStep("complete");
  };

  const handleClose = () => {
    setStep("welcome");
    setSelectedIndustry(null);
    setSelectedOccupations([]);
    setProgress(null);
    onOpenChange(false);
    if (step === "complete") {
      onComplete();
    }
  };

  const estimatedSkills = selectedOccupations.length * 40;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Skills Quick Start Wizard
          </DialogTitle>
          <DialogDescription>
            Quickly populate your skills library with industry-standard skills
            from ESCO
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === "welcome" && (
            <div className="py-8 text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Rocket className="h-10 w-10 text-primary" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                  Welcome to Skills Quick Start
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Get started in under 2 minutes by importing pre-curated skills
                  for your industry from the European Skills, Competences,
                  Qualifications and Occupations (ESCO) framework.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                <div className="p-4 rounded-lg bg-muted/50">
                  <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">50-200 Skills</p>
                  <p className="text-xs text-muted-foreground">
                    Industry relevant
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <Globe className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">ESCO Standard</p>
                  <p className="text-xs text-muted-foreground">EU recognized</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <Check className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Ready to Use</p>
                  <p className="text-xs text-muted-foreground">
                    No manual entry
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={handleClose}>
                  I'll add skills manually
                </Button>
                <Button onClick={() => setStep("industry")}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "industry" && (
            <div className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <IndustrySelector
                  selectedIndustry={selectedIndustry}
                  selectedOccupations={selectedOccupations}
                  onIndustrySelect={setSelectedIndustry}
                  onOccupationToggle={handleOccupationToggle}
                  onSelectAllOccupations={handleSelectAllOccupations}
                />
              </ScrollArea>

              {selectedOccupations.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{selectedOccupations.length}</strong> occupations
                    selected - approximately{" "}
                    <strong>~{estimatedSkills}</strong> skills will be imported.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setStep("welcome")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleStartImport}
                  disabled={selectedOccupations.length === 0}
                >
                  Import Skills
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "importing" && progress && (
            <div className="py-8 space-y-6">
              <div className="text-center space-y-2">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <h2 className="text-xl font-bold">Importing Skills...</h2>
                <p className="text-muted-foreground">
                  Please wait while we fetch and import skills from ESCO
                </p>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Occupation {progress.current} of {progress.total}
                    </span>
                    <span>
                      {Math.round((progress.current / progress.total) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(progress.current / progress.total) * 100}
                    className="h-2"
                  />
                </div>

                {progress.currentOccupation && (
                  <p className="text-sm text-center text-muted-foreground">
                    Processing: {progress.currentOccupation}
                  </p>
                )}

                <div className="flex justify-center gap-4 text-sm">
                  <Badge variant="secondary" className="gap-1">
                    <Check className="h-3 w-3" />
                    {progress.imported} imported
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    {progress.skipped} skipped
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {step === "complete" && progress && (
            <div className="py-8 text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Import Complete!</h2>
                <p className="text-muted-foreground">
                  Your skills library is now ready to use
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {progress.imported}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Skills Imported
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-2xl font-bold">{progress.skipped}</p>
                  <p className="text-sm text-muted-foreground">
                    Already Existed
                  </p>
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

              <Button onClick={handleClose} size="lg">
                <Check className="mr-2 h-4 w-4" />
                View My Skills
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
