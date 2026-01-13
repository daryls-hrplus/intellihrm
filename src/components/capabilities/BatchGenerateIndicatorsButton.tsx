import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
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

interface BatchGenerateIndicatorsButtonProps {
  companyId?: string;
  onComplete?: () => void;
  variant?: "default" | "dropdown";
  type?: "skill" | "competency";
}

const BATCH_SIZE = 5;

export function BatchGenerateIndicatorsButton({
  companyId,
  onComplete,
  variant = "default",
  type = "competency",
}: BatchGenerateIndicatorsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemCount, setItemCount] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

  const dbType = type === "skill" ? "SKILL" : "COMPETENCY";
  
  const labels = {
    skill: {
      title: "Generate AI Proficiency Descriptions",
      buttonText: "Generate Skill Proficiency",
      description: "Add proficiency level descriptions to skills",
      dialogTitle: "Generate AI Proficiency Descriptions",
      dialogDescription: `You are about to generate AI-powered proficiency level descriptions for ${itemCount} skills that don't have proficiency levels defined yet.`,
      dialogDetails: [
        "Create 5 proficiency levels for each skill",
        "Generate skill-specific proficiency descriptions",
        "Save the descriptions directly to each skill",
      ],
      confirmText: "Generate Descriptions",
      successMessage: (count: number) => `Generated proficiency descriptions for ${count} skills`,
    },
    competency: {
      title: "Generate AI Behavioral Indicators",
      buttonText: "Generate Competency Indicators",
      description: "Add behavioral indicators to competencies",
      dialogTitle: "Generate AI Behavioral Indicators",
      dialogDescription: `You are about to generate AI-powered behavioral indicators for ${itemCount} competencies that don't have indicators defined yet.`,
      dialogDetails: [
        "Create 5 proficiency levels for each competency",
        "Generate observable behavioral descriptions for each level",
        "Save the indicators directly to each competency",
      ],
      confirmText: "Generate Indicators",
      successMessage: (count: number) => `Generated behavioral indicators for ${count} competencies`,
    },
  };

  const currentLabels = labels[type];
  const estimatedMinutes = Math.max(1, Math.ceil(itemCount / 10));

  useEffect(() => {
    fetchMissingCount();
  }, [companyId, type]);

  const fetchMissingCount = async () => {
    let query = supabase
      .from("skills_competencies")
      .select("id", { count: "exact", head: true })
      .eq("type", dbType)
      .eq("status", "active")
      .is("proficiency_indicators", null);

    if (companyId) {
      query = query.or(`company_id.eq.${companyId},company_id.is.null`);
    }

    const { count } = await query;
    setItemCount(count ?? 0);
  };

  const handleOpenConfirmation = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (itemCount === 0) {
      toast.info(`All ${type === "skill" ? "skills" : "competencies"} already have proficiency indicators`);
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmGenerate = async () => {
    setShowConfirmation(false);
    setIsGenerating(true);
    setProgress(0);
    setProcessedCount(0);

    try {
      let query = supabase
        .from("skills_competencies")
        .select("id, name, description, code, type, category")
        .eq("type", dbType)
        .eq("status", "active")
        .is("proficiency_indicators", null)
        .limit(50);

      if (companyId) {
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      }

      const { data: items, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      if (!items || items.length === 0) {
        toast.info(`No ${type === "skill" ? "skills" : "competencies"} need indicators`);
        return;
      }

      let totalProcessed = 0;
      let totalSucceeded = 0;
      let totalFailed = 0;

      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
          batch.map(async (item) => {
            const { data, error } = await supabase.functions.invoke(
              "capability-ai-analyzer",
              {
                body: {
                  action: "generate_proficiency_indicators",
                  capability: item,
                },
              }
            );
            if (error) throw error;
            return data;
          })
        );

        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value?.saved) {
            totalSucceeded++;
          } else {
            totalFailed++;
          }
        });

        totalProcessed += batch.length;
        setProcessedCount(totalProcessed);
        setProgress((totalProcessed / itemCount) * 100);
      }

      await fetchMissingCount();
      onComplete?.();

      if (totalSucceeded > 0) {
        toast.success(currentLabels.successMessage(totalSucceeded));
      }
      if (totalFailed > 0) {
        toast.warning(`${totalFailed} items failed to generate`);
      }
    } catch (err) {
      console.error("Batch generation error:", err);
      toast.error("Failed to generate proficiency indicators");
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setProcessedCount(0);
    }
  };

  // Dropdown variant - render inline content for DropdownMenuItem
  if (variant === "dropdown") {
    return (
      <>
        <div
          className="flex flex-col items-start w-full cursor-pointer"
          onClick={handleOpenConfirmation}
        >
          <div className="flex items-center">
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
            )}
            <span className="font-medium">
              {isGenerating
                ? `Generating (${processedCount}/${itemCount})...`
                : currentLabels.buttonText}
            </span>
            {!isGenerating && itemCount > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground ml-6 mt-0.5">
            {currentLabels.description}
          </span>
          {isGenerating && (
            <Progress value={progress} className="h-1 w-full mt-2" />
          )}
        </div>

        <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                {currentLabels.dialogTitle}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>{currentLabels.dialogDescription}</p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="font-medium text-foreground text-sm">This will:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {currentLabels.dialogDetails.map((detail, idx) => (
                        <li key={idx}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Estimated time: ~{estimatedMinutes} minute{estimatedMinutes > 1 ? "s" : ""}
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmGenerate}>
                <Sparkles className="mr-2 h-4 w-4" />
                {currentLabels.confirmText}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  if (itemCount === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenConfirmation}
              disabled={isGenerating || itemCount === 0}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {isGenerating
                ? `Generating (${processedCount}/${itemCount})...`
                : currentLabels.buttonText}
              {!isGenerating && itemCount > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400">
                  {itemCount}
                </span>
              )}
            </Button>
            {isGenerating && (
              <Progress value={progress} className="h-1 w-full" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isGenerating
              ? `Processing ${processedCount} of ${itemCount} items...`
              : `Generate AI proficiency indicators for ${itemCount} ${type === "skill" ? "skills" : "competencies"}`}
          </p>
        </TooltipContent>
      </Tooltip>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              {currentLabels.dialogTitle}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>{currentLabels.dialogDescription}</p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-foreground text-sm">This will:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {currentLabels.dialogDetails.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground">
                  Estimated time: ~{estimatedMinutes} minute{estimatedMinutes > 1 ? "s" : ""}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmGenerate}>
              <Sparkles className="mr-2 h-4 w-4" />
              {currentLabels.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
