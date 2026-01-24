import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GeneratedQuickStartContent {
  roles: Array<{
    role: string;
    title: string;
    icon: string;
    responsibility: string;
  }>;
  prerequisites: Array<{
    id: string;
    title: string;
    description: string;
    required: boolean;
    module?: string;
  }>;
  pitfalls: Array<{
    issue: string;
    prevention: string;
  }>;
  contentStrategyQuestions: string[];
  setupSteps: Array<{
    id: string;
    title: string;
    description: string;
    estimatedTime: string;
    substeps?: string[];
    expectedResult?: string;
  }>;
  rolloutOptions: Array<{
    id: string;
    label: string;
    description: string;
  }>;
  rolloutRecommendation: string;
  verificationChecks: string[];
  integrationChecklist: Array<{
    id: string;
    label: string;
    required: boolean;
  }>;
  successMetrics: Array<{
    metric: string;
    target: string;
    howToMeasure: string;
  }>;
}

export function useGenerateQuickStartContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async (moduleCode: string): Promise<GeneratedQuickStartContent | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-quickstart-content', {
        body: { moduleCode }
      });

      if (fnError) {
        throw fnError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.content) {
        throw new Error("No content generated");
      }

      toast.success(`Generated content for ${data.moduleName}`);
      return data.content as GeneratedQuickStartContent;

    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate content";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateContent,
    isGenerating,
    error
  };
}
