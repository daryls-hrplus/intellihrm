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

interface BatchGenerateIndicatorsButtonProps {
  companyId?: string;
  onComplete?: () => void;
}

export function BatchGenerateIndicatorsButton({
  companyId,
  onComplete,
}: BatchGenerateIndicatorsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [missingCount, setMissingCount] = useState<number | null>(null);

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
    try {
      const { data, error } = await supabase.functions.invoke(
        "capability-ai-analyzer",
        {
          body: {
            action: "batch_generate_indicators",
            companyId,
          },
        }
      );

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message || "Proficiency indicators generated");
        if (data.failed?.length > 0) {
          toast.warning(`${data.failed.length} skills failed to generate`);
        }
        await fetchMissingCount();
        onComplete?.();
      } else {
        toast.error(data?.error || "Failed to generate indicators");
      }
    } catch (err) {
      console.error("Batch generation error:", err);
      toast.error("Failed to generate proficiency indicators");
    } finally {
      setIsGenerating(false);
    }
  };

  if (missingCount === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
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
            Generate Indicators
            {missingCount !== null && missingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400">
                {missingCount}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {missingCount
              ? `Generate AI proficiency indicators for ${missingCount} skills`
              : "All skills have proficiency indicators"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
