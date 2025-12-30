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
  includeCompetencies?: boolean;
}

const BATCH_SIZE = 5; // Process 5 items at a time to avoid timeout

export function BatchGenerateIndicatorsButton({
  companyId,
  onComplete,
  includeCompetencies = true,
}: BatchGenerateIndicatorsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [skillCount, setSkillCount] = useState<number>(0);
  const [competencyCount, setCompetencyCount] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

  const missingCount = skillCount + (includeCompetencies ? competencyCount : 0);

  useEffect(() => {
    fetchMissingCounts();
  }, [companyId, includeCompetencies]);

  const fetchMissingCounts = async () => {
    // Count skills without indicators
    let skillQuery = supabase
      .from("skills_competencies")
      .select("id", { count: "exact", head: true })
      .eq("type", "SKILL")
      .eq("status", "active")
      .is("proficiency_indicators", null);

    if (companyId) {
      skillQuery = skillQuery.or(`company_id.eq.${companyId},company_id.is.null`);
    }

    const { count: skills } = await skillQuery;
    setSkillCount(skills ?? 0);

    // Count competencies without indicators
    if (includeCompetencies) {
      let compQuery = supabase
        .from("skills_competencies")
        .select("id", { count: "exact", head: true })
        .eq("type", "COMPETENCY")
        .eq("status", "active")
        .is("proficiency_indicators", null);

      if (companyId) {
        compQuery = compQuery.or(`company_id.eq.${companyId},company_id.is.null`);
      }

      const { count: comps } = await compQuery;
      setCompetencyCount(comps ?? 0);
    }
  };

  const handleBatchGenerate = async () => {
    if (missingCount === 0) {
      toast.info("All items already have proficiency indicators");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setProcessedCount(0);

    try {
      // Build types to process
      const typesToProcess: ('SKILL' | 'COMPETENCY')[] = ['SKILL'];
      if (includeCompetencies && competencyCount > 0) {
        typesToProcess.push('COMPETENCY');
      }

      let totalProcessed = 0;
      let totalSucceeded = 0;
      let totalFailed = 0;

      for (const type of typesToProcess) {
        // Fetch items that need indicators
        let query = supabase
          .from("skills_competencies")
          .select("id, name, description, code, type, category")
          .eq("type", type)
          .eq("status", "active")
          .is("proficiency_indicators", null)
          .limit(50);

        if (companyId) {
          query = query.or(`company_id.eq.${companyId},company_id.is.null`);
        }

        const { data: items, error: fetchError } = await query;
        if (fetchError) throw fetchError;

        if (!items || items.length === 0) continue;

        // Process in small batches
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
          const batch = items.slice(i, i + BATCH_SIZE);
          
          // Process batch in parallel
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
          setProgress((totalProcessed / missingCount) * 100);
        }
      }

      await fetchMissingCounts();
      onComplete?.();

      if (totalSucceeded > 0) {
        toast.success(`Generated indicators for ${totalSucceeded} items`);
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
              {!isGenerating && missingCount > 0 && (
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
              ? `Processing ${processedCount} of ${missingCount} items...`
              : missingCount
              ? `Generate AI proficiency indicators for ${skillCount > 0 ? `${skillCount} skills` : ''}${skillCount > 0 && competencyCount > 0 ? ' + ' : ''}${competencyCount > 0 ? `${competencyCount} competencies` : ''}`
              : "All items have proficiency indicators"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
