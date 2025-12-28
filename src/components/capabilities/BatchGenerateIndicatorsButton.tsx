import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface BatchGenerateIndicatorsButtonProps {
  companyId?: string;
  onComplete?: () => void;
}

const BATCH_SIZE = 5; // Process 5 skills at a time to avoid timeout

export function BatchGenerateIndicatorsButton({
  companyId,
  onComplete,
}: BatchGenerateIndicatorsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [missingCount, setMissingCount] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

  useEffect(() => {
    fetchMissingCount();
  }, [companyId]);

  const fetchMissingCount = async () => {
    let query = supabase
      .from("skills_competencies")
      .select("id", { count: "exact", head: true })
      .eq("type", "SKILL")
      .eq("status", "active")
      .is("proficiency_indicators", null);

    if (companyId) {
      query = query.or(`company_id.eq.${companyId},company_id.is.null`);
    }

    const { count } = await query;
    setMissingCount(count ?? 0);
  };

  const handleBatchGenerate = async () => {
    if (missingCount === 0) {
      toast.info("All skills already have proficiency indicators");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setProcessedCount(0);

    try {
      // Fetch skills that need indicators
      let query = supabase
        .from("skills_competencies")
        .select("id, name, description, code, type")
        .eq("type", "SKILL")
        .eq("status", "active")
        .is("proficiency_indicators", null)
        .limit(50); // Max 50 at a time

      if (companyId) {
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      }

      const { data: skills, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      if (!skills || skills.length === 0) {
        toast.info("No skills need indicators");
        return;
      }

      const total = skills.length;
      let succeeded = 0;
      let failed = 0;

      // Process in small batches
      for (let i = 0; i < skills.length; i += BATCH_SIZE) {
        const batch = skills.slice(i, i + BATCH_SIZE);
        
        // Process batch in parallel
        const results = await Promise.allSettled(
          batch.map(async (skill) => {
            const { data, error } = await supabase.functions.invoke(
              "capability-ai-analyzer",
              {
                body: {
                  action: "generate_proficiency_indicators",
                  capability: skill,
                },
              }
            );
            if (error) throw error;
            return data;
          })
        );

        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value?.saved) {
            succeeded++;
          } else {
            failed++;
          }
        });

        const processed = Math.min(i + BATCH_SIZE, total);
        setProcessedCount(processed);
        setProgress((processed / total) * 100);
      }

      await fetchMissingCount();
      onComplete?.();

      if (succeeded > 0) {
        toast.success(`Generated indicators for ${succeeded} skills`);
      }
      if (failed > 0) {
        toast.warning(`${failed} skills failed to generate`);
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

  if (missingCount === 0) {
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
              onClick={handleBatchGenerate}
              disabled={isGenerating || missingCount === 0}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {isGenerating 
                ? `Generating (${processedCount}/${missingCount})...` 
                : "Generate Indicators"}
              {!isGenerating && missingCount !== null && missingCount > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400">
                  {missingCount}
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
              ? `Processing ${processedCount} of ${missingCount} skills...`
              : missingCount
              ? `Generate AI proficiency indicators for ${missingCount} skills`
              : "All skills have proficiency indicators"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
