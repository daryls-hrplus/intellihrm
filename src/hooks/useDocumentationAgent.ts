import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRegistryFeatureCodes } from "./useRegistryFeatureCodes";

export interface CoverageAnalysis {
  totalFeatures: number;
  documented: number;
  undocumented: number;
  coveragePercentage: number;
  gapsByModule: Record<string, { total: number; gaps: number; features: string[] }>;
  priorityFeatures: { feature_code: string; feature_name: string; module_code: string }[];
}

export interface FeatureWithStatus {
  id: string;
  feature_code: string;
  feature_name: string;
  description: string | null;
  route_path: string | null;
  hasDocumentation: boolean;
  documentationStatus: string;
  workflowStatus: string;
  application_modules: {
    module_code: string;
    module_name: string;
  };
}

export interface CoverageAssessment {
  totalFeatures: number;
  documented: number;
  overallCoverage: number;
  publishedArticles: number;
  publishedQuickstarts: number;
  moduleBreakdown: Record<string, {
    total: number;
    documented: number;
    percentage: number;
  }>;
  readinessScore: number;
}

export interface GeneratedArticle {
  title: string;
  summary: string;
  content: string;
  keywords: string[];
  category: string;
}

export interface BulkCandidate {
  feature_code: string;
  feature_name: string;
  module_code: string;
  module_name: string;
}

export function useDocumentationAgent() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<CoverageAnalysis | null>(null);
  const [features, setFeatures] = useState<FeatureWithStatus[]>([]);
  const [coverageAssessment, setCoverageAssessment] = useState<CoverageAssessment | null>(null);
  const [bulkCandidates, setBulkCandidates] = useState<BulkCandidate[]>([]);

  // Get registry feature codes for consistent analysis
  const { allFeatureCodes: registryFeatureCodes, getModuleFeatureCodes } = useRegistryFeatureCodes();

  const analyzeSchema = useCallback(async (moduleCode?: string) => {
    setIsAnalyzing(true);
    try {
      // Use module-specific codes if filtering, otherwise all registry codes
      const featureCodesToUse = moduleCode 
        ? getModuleFeatureCodes(moduleCode).length > 0 
          ? getModuleFeatureCodes(moduleCode) 
          : registryFeatureCodes
        : registryFeatureCodes;

      const { data, error } = await supabase.functions.invoke('documentation-agent', {
        body: { 
          action: 'analyze_schema',
          context: { 
            moduleCode,
            registryFeatureCodes: featureCodesToUse,
          }
        }
      });

      if (error) throw error;
      if (data?.analysis) {
        setAnalysis(data.analysis);
        return data.analysis;
      }
    } catch (error) {
      console.error("Schema analysis failed:", error);
      toast.error("Failed to analyze schema");
    } finally {
      setIsAnalyzing(false);
    }
  }, [registryFeatureCodes, getModuleFeatureCodes]);

  const inspectFeatures = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('documentation-agent', {
        body: { action: 'inspect_features' }
      });

      if (error) throw error;
      if (data?.features) {
        setFeatures(data.features);
        return data.features;
      }
    } catch (error) {
      console.error("Feature inspection failed:", error);
      toast.error("Failed to inspect features");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const generateManualSection = useCallback(async (
    featureCode: string,
    sectionTitle: string,
    targetAudience?: string[]
  ) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('documentation-agent', {
        body: {
          action: 'generate_manual_section',
          context: { featureCode, sectionTitle, targetAudience }
        }
      });

      if (error) throw error;
      if (data?.content) {
        toast.success("Section generated successfully");
        return data;
      }
    } catch (error) {
      console.error("Section generation failed:", error);
      toast.error("Failed to generate section");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateKBArticle = useCallback(async (featureCode: string): Promise<{
    article: GeneratedArticle;
    feature_code: string;
  } | undefined> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('documentation-agent', {
        body: {
          action: 'generate_kb_article',
          context: { featureCode }
        }
      });

      if (error) throw error;
      if (data?.article) {
        toast.success("KB article generated");
        return data;
      }
    } catch (error) {
      console.error("KB article generation failed:", error);
      toast.error("Failed to generate KB article");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const assessCoverage = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('documentation-agent', {
        body: { action: 'assess_coverage' }
      });

      if (error) throw error;
      if (data?.coverage) {
        setCoverageAssessment(data.coverage);
        return data.coverage;
      }
    } catch (error) {
      console.error("Coverage assessment failed:", error);
      toast.error("Failed to assess coverage");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const syncRelease = useCallback(async (releaseId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('documentation-agent', {
        body: {
          action: 'sync_release',
          context: { releaseId }
        }
      });

      if (error) throw error;
      if (data?.syncResult) {
        toast.success("Release synced with documentation coverage");
        return data.syncResult;
      }
    } catch (error) {
      console.error("Release sync failed:", error);
      toast.error("Failed to sync release");
    }
  }, []);

  const getBulkCandidates = useCallback(async (moduleCode?: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('documentation-agent', {
        body: {
          action: 'bulk_generate',
          context: { moduleCode }
        }
      });

      if (error) throw error;
      if (data?.candidates) {
        setBulkCandidates(data.candidates);
        return {
          candidates: data.candidates,
          totalUndocumented: data.totalUndocumented
        };
      }
    } catch (error) {
      console.error("Failed to get bulk candidates:", error);
      toast.error("Failed to get undocumented features");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setFeatures([]);
    setCoverageAssessment(null);
    setBulkCandidates([]);
  }, []);

  return {
    // State
    isAnalyzing,
    isGenerating,
    analysis,
    features,
    coverageAssessment,
    bulkCandidates,
    
    // Actions
    analyzeSchema,
    inspectFeatures,
    generateManualSection,
    generateKBArticle,
    assessCoverage,
    syncRelease,
    getBulkCandidates,
    clearAnalysis,
  };
}
