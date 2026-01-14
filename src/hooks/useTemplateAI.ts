import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TemplateSuggestion {
  title: string;
  content: string;
  useCase: string;
}

export interface EmailTemplateSuggestion {
  title: string;
  subject: string;
  content: string;
  useCase: string;
}

export function useTemplateAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [suggestions, setSuggestions] = useState<TemplateSuggestion[]>([]);
  const [emailSuggestions, setEmailSuggestions] = useState<EmailTemplateSuggestion[]>([]);

  const suggestTemplates = async (categoryName: string, existingTemplates: string[]) => {
    setIsGenerating(true);
    setSuggestions([]);
    
    try {
      const { data, error } = await supabase.functions.invoke("template-ai-helper", {
        body: {
          action: "suggest_templates",
          categoryName,
          existingTemplates,
        },
      });

      if (error) throw error;
      
      if (data.error) {
        if (data.error.includes("Rate limit")) {
          toast.error("AI is busy, please try again in a moment");
        } else if (data.error.includes("credits")) {
          toast.error("AI credits needed");
        } else {
          toast.error(data.error);
        }
        return [];
      }

      const results = data.suggestions || [];
      setSuggestions(results);
      return results;
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
      toast.error("Failed to generate template suggestions");
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestEmailTemplates = async (
    categoryName: string, 
    existingTemplates: string[]
  ): Promise<EmailTemplateSuggestion[]> => {
    setIsGenerating(true);
    setEmailSuggestions([]);
    
    try {
      const { data, error } = await supabase.functions.invoke("template-ai-helper", {
        body: {
          action: "suggest_email_templates",
          categoryName,
          existingTemplates,
        },
      });

      if (error) throw error;
      
      if (data.error) {
        if (data.error.includes("Rate limit")) {
          toast.error("AI is busy, please try again in a moment");
        } else if (data.error.includes("credits")) {
          toast.error("AI credits needed");
        } else {
          toast.error(data.error);
        }
        return [];
      }

      const results = data.suggestions || [];
      setEmailSuggestions(results);
      return results;
    } catch (error) {
      console.error("Failed to generate email template suggestions:", error);
      toast.error("Failed to generate template suggestions");
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  const improveContent = async (content: string): Promise<string | null> => {
    setIsImproving(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("template-ai-helper", {
        body: {
          action: "improve_content",
          content,
        },
      });

      if (error) throw error;
      
      if (data.error) {
        if (data.error.includes("Rate limit")) {
          toast.error("AI is busy, please try again in a moment");
        } else if (data.error.includes("credits")) {
          toast.error("AI credits needed");
        } else {
          toast.error(data.error);
        }
        return null;
      }

      return data.improvedContent || null;
    } catch (error) {
      console.error("Failed to improve content:", error);
      toast.error("Failed to improve content");
      return null;
    } finally {
      setIsImproving(false);
    }
  };

  const improveEmailContent = async (content: string): Promise<string | null> => {
    setIsImproving(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("template-ai-helper", {
        body: {
          action: "improve_email_content",
          content,
        },
      });

      if (error) throw error;
      
      if (data.error) {
        if (data.error.includes("Rate limit")) {
          toast.error("AI is busy, please try again in a moment");
        } else if (data.error.includes("credits")) {
          toast.error("AI credits needed");
        } else {
          toast.error(data.error);
        }
        return null;
      }

      return data.improvedContent || null;
    } catch (error) {
      console.error("Failed to improve email content:", error);
      toast.error("Failed to improve content");
      return null;
    } finally {
      setIsImproving(false);
    }
  };

  const clearSuggestions = () => {
    setSuggestions([]);
    setEmailSuggestions([]);
  };

  return {
    isGenerating,
    isImproving,
    suggestions,
    emailSuggestions,
    suggestTemplates,
    suggestEmailTemplates,
    improveContent,
    improveEmailContent,
    clearSuggestions,
  };
}
