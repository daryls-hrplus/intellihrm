import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRegistryFeatureCodes } from "./useRegistryFeatureCodes";

// Types for the agent
export type Persona = 'ess' | 'mss' | 'hr' | 'admin' | 'all';

export interface ContextAnalysis {
  totalFeatures: number;
  documented: number;
  undocumented: number;
  coveragePercentage: number;
  moduleBreakdown: Record<string, {
    moduleName: string;
    total: number;
    documented: number;
    gaps: number;
    percentage: number;
    priorityFeatures: string[];
  }>;
  readinessScore: number;
  recommendations: string[];
  staleContent: Array<{ feature_code: string; lastUpdated: string; daysSinceUpdate: number }>;
}

export interface GeneratedManualSection {
  content: string;
  metadata: {
    sectionNumber: string;
    sectionTitle: string;
    featureCode: string;
    featureName: string;
    moduleCode: string;
    readingTime: number;
    wordCount: number;
  };
}

export interface GeneratedKBArticle {
  title: string;
  summary: string;
  persona: Persona;
  content: string;
  steps?: Array<{ step: number; action: string; tip?: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  keywords: string[];
  category?: string;
  related?: string[];
}

export interface GeneratedQuickStart {
  moduleName: string;
  moduleCode: string;
  estimatedSetupTime?: string;
  roles: Array<{ role: string; title: string; icon: string; responsibility: string }>;
  prerequisites: Array<{ id: string; title: string; description?: string; required: boolean }>;
  pitfalls: Array<{ issue: string; prevention: string; severity: 'high' | 'medium' | 'low' }>;
  setupSteps: Array<{ id: string; title: string; estimatedTime: string; description?: string; substeps: string[] }>;
  successMetrics: Array<{ metric: string; target: string; howToMeasure: string }>;
  nextSteps?: string[];
}

export interface GeneratedSOP {
  title: string;
  sopNumber: string;
  effectiveDate: string;
  purpose: string;
  scope: string;
  definitions: Array<{ term: string; definition: string }>;
  responsibilities: Array<{ role: string; duties: string[] }>;
  procedure: Array<{ step: number; action: string; details: string; screenshotMarker?: string }>;
  qualityChecks: string[];
  exceptions: string[];
  relatedDocuments?: string[];
  revisionHistory: Array<{ version: string; date: string; author?: string; changes: string }>;
}

export interface GapAnalysis {
  noDocumentation: Array<{ feature_code: string; feature_name: string; module_code: string; module_name: string }>;
  noKBArticle: Array<{ feature_code: string; feature_name: string }>;
  noQuickStart: Array<{ module_code: string; module_name: string }>;
  noSOP: Array<{ feature_code: string; feature_name: string }>;
  orphanedDocumentation?: Array<{
    section_number: string;
    section_title: string;
    manual_code: string;
    orphaned_codes: string[];
    action_required: string;
  }>;
}

export interface GapSummary {
  undocumentedFeatures: number;
  missingKBArticles: number;
  missingQuickStarts: number;
  missingSOPs: number;
  orphanedDocumentation: number;
}

export interface DocumentationValidationResult {
  totalSections: number;
  validMappings: number;
  orphanedDocumentation: Array<{
    section_id: string;
    section_number: string;
    section_title: string;
    manual_code: string;
    orphaned_codes: string[];
    valid_codes: string[];
    severity: 'critical' | 'warning';
  }>;
  unmappedSections: Array<{
    section_id: string;
    section_number: string;
    title: string;
    manual_code: string;
  }>;
  summary: {
    orphanedCount: number;
    unmappedCount: number;
    healthScore: number;
  };
}

export interface ActionSuggestion {
  action: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedActions?: string[];
}

export interface GeneratedArtifact {
  id: string;
  type: 'manual_section' | 'kb_article' | 'quickstart' | 'sop' | 'training';
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  generatedAt: Date;
}

export function useContentCreationAgent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [contextAnalysis, setContextAnalysis] = useState<ContextAnalysis | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [generatedArtifacts, setGeneratedArtifacts] = useState<GeneratedArtifact[]>([]);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  // Get registry feature codes for consistent analysis
  const { allFeatureCodes: registryFeatureCodes, getModuleFeatureCodes } = useRegistryFeatureCodes();

  // Helper to invoke the agent with registry codes
  const invokeAgent = useCallback(async (action: string, context: Record<string, unknown> = {}) => {
    try {
      // Determine which feature codes to use based on module filter
      const moduleCode = context.moduleCode as string | undefined;
      const featureCodesToUse = moduleCode 
        ? getModuleFeatureCodes(moduleCode).length > 0 
          ? getModuleFeatureCodes(moduleCode) 
          : registryFeatureCodes
        : registryFeatureCodes;

      const { data, error } = await supabase.functions.invoke('content-creation-agent', {
        body: { 
          action, 
          context: {
            ...context,
            registryFeatureCodes: featureCodesToUse,
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Agent action '${action}' failed:`, error);
      throw error;
    }
  }, [registryFeatureCodes, getModuleFeatureCodes]);

  // Analyze context and coverage
  const analyzeContext = useCallback(async (moduleCode?: string): Promise<ContextAnalysis | null> => {
    setIsLoading(true);
    setCurrentAction('analyze_context');
    try {
      const data = await invokeAgent('analyze_context', { moduleCode });
      if (data?.analysis) {
        setContextAnalysis(data.analysis);
        return data.analysis;
      }
      return null;
    } catch (error) {
      toast.error("Failed to analyze context");
      return null;
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  }, [invokeAgent]);

  // Generate manual section
  const generateManualSection = useCallback(async (params: {
    featureCode: string;
    sectionTitle?: string;
    sectionNumber?: string;
    targetAudience?: string[];
  }): Promise<GeneratedManualSection | null> => {
    setIsLoading(true);
    setCurrentAction('generate_manual_section');
    try {
      const data = await invokeAgent('generate_manual_section', params);
      if (data?.content) {
        const artifact: GeneratedArtifact = {
          id: `manual-${Date.now()}`,
          type: 'manual_section',
          title: data.metadata?.sectionTitle || params.sectionTitle || 'Manual Section',
          content: data.content,
          metadata: data.metadata || {},
          generatedAt: new Date(),
        };
        setGeneratedArtifacts(prev => [artifact, ...prev]);
        toast.success("Manual section generated");
        return { content: data.content, metadata: data.metadata };
      }
      return null;
    } catch (error) {
      toast.error("Failed to generate manual section");
      return null;
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  }, [invokeAgent]);

  // Generate KB article
  const generateKBArticle = useCallback(async (params: {
    featureCode: string;
    targetPersona?: Persona;
  }): Promise<GeneratedKBArticle | null> => {
    setIsLoading(true);
    setCurrentAction('generate_kb_article');
    try {
      const data = await invokeAgent('generate_kb_article', params);
      if (data?.article) {
        const artifact: GeneratedArtifact = {
          id: `kb-${Date.now()}`,
          type: 'kb_article',
          title: data.article.title || 'KB Article',
          content: data.article.content || JSON.stringify(data.article, null, 2),
          metadata: { ...data.article, featureCode: data.featureCode },
          generatedAt: new Date(),
        };
        setGeneratedArtifacts(prev => [artifact, ...prev]);
        toast.success("KB article generated");
        return data.article;
      }
      return null;
    } catch (error) {
      toast.error("Failed to generate KB article");
      return null;
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  }, [invokeAgent]);

  // Generate quick start
  const generateQuickStart = useCallback(async (moduleCode: string): Promise<GeneratedQuickStart | null> => {
    setIsLoading(true);
    setCurrentAction('generate_quickstart');
    try {
      const data = await invokeAgent('generate_quickstart', { moduleCode });
      if (data?.quickstart) {
        const artifact: GeneratedArtifact = {
          id: `qs-${Date.now()}`,
          type: 'quickstart',
          title: `Quick Start: ${data.quickstart.moduleName || moduleCode}`,
          content: JSON.stringify(data.quickstart, null, 2),
          metadata: data.quickstart,
          generatedAt: new Date(),
        };
        setGeneratedArtifacts(prev => [artifact, ...prev]);
        toast.success("Quick start guide generated");
        return data.quickstart;
      }
      return null;
    } catch (error) {
      toast.error("Failed to generate quick start");
      return null;
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  }, [invokeAgent]);

  // Generate SOP
  const generateSOP = useCallback(async (featureCode: string): Promise<GeneratedSOP | null> => {
    setIsLoading(true);
    setCurrentAction('generate_sop');
    try {
      const data = await invokeAgent('generate_sop', { featureCode });
      if (data?.sop) {
        const artifact: GeneratedArtifact = {
          id: `sop-${Date.now()}`,
          type: 'sop',
          title: data.sop.title || `SOP: ${featureCode}`,
          content: JSON.stringify(data.sop, null, 2),
          metadata: data.sop,
          generatedAt: new Date(),
        };
        setGeneratedArtifacts(prev => [artifact, ...prev]);
        toast.success("SOP document generated");
        return data.sop;
      }
      return null;
    } catch (error) {
      toast.error("Failed to generate SOP");
      return null;
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  }, [invokeAgent]);

  // Identify gaps (now includes orphaned documentation and module filter)
  const identifyGaps = useCallback(async (moduleCode?: string): Promise<{ gaps: GapAnalysis; summary: GapSummary } | null> => {
    setIsLoading(true);
    setCurrentAction('identify_gaps');
    try {
      const data = await invokeAgent('identify_gaps', { moduleCode });
      if (data?.gaps) {
        const orphanedCount = data.summary?.orphanedDocumentation || 0;
        const filterMsg = moduleCode ? ` in ${moduleCode}` : '';
        if (orphanedCount > 0) {
          toast.warning(`Found ${orphanedCount} orphaned documentation section(s)${filterMsg}`);
        } else {
          toast.success(`Found ${data.summary?.undocumentedFeatures || 0} undocumented features${filterMsg}`);
        }
        return { gaps: data.gaps, summary: data.summary };
      }
      return null;
    } catch (error) {
      toast.error("Failed to identify gaps");
      return null;
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  }, [invokeAgent]);

  // Validate documentation (bi-directional check)
  const validateDocumentation = useCallback(async (): Promise<DocumentationValidationResult | null> => {
    setIsLoading(true);
    setCurrentAction('validate_documentation');
    try {
      const data = await invokeAgent('validate_documentation', {});
      if (data?.validation) {
        const { orphanedCount, unmappedCount, healthScore } = data.validation.summary;
        if (orphanedCount > 0) {
          toast.warning(`Documentation health: ${healthScore}% - ${orphanedCount} orphaned reference(s) found`);
        } else {
          toast.success(`Documentation health: ${healthScore}%`);
        }
        return data.validation;
      }
      return null;
    } catch (error) {
      toast.error("Failed to validate documentation");
      return null;
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  }, [invokeAgent]);
  const suggestNextActions = useCallback(async (): Promise<ActionSuggestion[]> => {
    setIsLoading(true);
    setCurrentAction('suggest_next_actions');
    try {
      const data = await invokeAgent('suggest_next_actions', {});
      return data?.suggestions || [];
    } catch (error) {
      toast.error("Failed to get suggestions");
      return [];
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  }, [invokeAgent]);

  // Chat with agent
  const sendChatMessage = useCallback(async (message: string): Promise<string | null> => {
    setIsStreaming(true);
    setCurrentAction('chat');

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      const conversationHistory = chatMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const data = await invokeAgent('chat', {
        chatMessage: message,
        conversationHistory,
      });

      if (data?.reply) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
          suggestedActions: data.suggestedActions,
        };
        setChatMessages(prev => [...prev, assistantMessage]);
        return data.reply;
      }
      return null;
    } catch (error) {
      toast.error("Failed to send message");
      return null;
    } finally {
      setIsStreaming(false);
      setCurrentAction(null);
    }
  }, [invokeAgent, chatMessages]);

  // Save artifact to enablement_artifacts table
  const saveArtifact = useCallback(async (artifact: GeneratedArtifact): Promise<boolean> => {
    try {
      const artifactType = artifact.type === 'manual_section' ? 'manual_section' :
                          artifact.type === 'kb_article' ? 'kb_article' :
                          artifact.type === 'quickstart' ? 'quickstart' :
                          artifact.type === 'sop' ? 'sop' : 'training_guide';

      const { error } = await supabase.from("enablement_artifacts").insert({
        artifact_id: artifact.id,
        title: artifact.title,
        content: artifact.content,
        artifact_type: artifactType,
        feature_code: (artifact.metadata as any)?.featureCode,
        module_code: (artifact.metadata as any)?.moduleCode,
        status: "draft",
      });

      if (error) throw error;
      toast.success("Artifact saved to library");
      return true;
    } catch (error) {
      console.error("Failed to save artifact:", error);
      toast.error("Failed to save artifact");
      return false;
    }
  }, []);

  // Clear chat history
  const clearChat = useCallback(() => {
    setChatMessages([]);
  }, []);

  // Clear artifacts
  const clearArtifacts = useCallback(() => {
    setGeneratedArtifacts([]);
  }, []);

  // Remove specific artifact
  const removeArtifact = useCallback((artifactId: string) => {
    setGeneratedArtifacts(prev => prev.filter(a => a.id !== artifactId));
  }, []);

  return {
    // State
    isLoading,
    isStreaming,
    currentAction,
    contextAnalysis,
    chatMessages,
    generatedArtifacts,

    // Analysis Actions
    analyzeContext,
    identifyGaps,
    validateDocumentation,
    suggestNextActions,

    // Generation Actions
    generateManualSection,
    generateKBArticle,
    generateQuickStart,
    generateSOP,

    // Chat
    sendChatMessage,
    clearChat,

    // Artifact Management
    saveArtifact,
    clearArtifacts,
    removeArtifact,
  };
}
