import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ValueSuggestion {
  name: string;
  description: string;
  behavioral_levels: Record<string, string[]>;
  is_promotion_factor: boolean;
  category?: string;
}

interface RelatedValue {
  name: string;
  reason: string;
}

interface ValueAIAnalysis {
  confidence_score: number;
  improvements: string[];
  related_values: RelatedValue[];
  classification: 'core' | 'aspirational' | 'leadership';
}

// Common organizational value templates for quick start
export const VALUE_TEMPLATES: ValueSuggestion[] = [
  {
    name: "Integrity",
    description: "Acting with honesty, transparency, and ethical behavior in all interactions and decisions.",
    behavioral_levels: {
      "1": ["Follows basic ethical guidelines when prompted", "Asks for guidance on ethical matters"],
      "2": ["Consistently acts honestly in routine situations", "Reports concerns when they arise"],
      "3": ["Models ethical behavior independently", "Addresses ethical issues proactively"],
      "4": ["Guides others through ethical dilemmas", "Champions transparency across teams"],
      "5": ["Shapes organizational ethics culture", "Sets standards for industry practices"],
    },
    is_promotion_factor: true,
    category: "core",
  },
  {
    name: "Innovation",
    description: "Embracing creativity, continuous improvement, and the courage to challenge the status quo.",
    behavioral_levels: {
      "1": ["Open to new ideas suggested by others", "Tries new approaches when encouraged"],
      "2": ["Proposes small improvements to processes", "Experiments with better ways of working"],
      "3": ["Initiates innovative solutions", "Leads improvement projects"],
      "4": ["Drives innovation across multiple teams", "Mentors others in creative thinking"],
      "5": ["Transforms organizational approaches", "Creates industry-leading innovations"],
    },
    is_promotion_factor: false,
    category: "core",
  },
  {
    name: "Customer Focus",
    description: "Prioritizing customer needs and delivering exceptional experiences that create lasting value.",
    behavioral_levels: {
      "1": ["Responds to customer requests", "Follows customer service protocols"],
      "2": ["Anticipates basic customer needs", "Resolves issues proactively"],
      "3": ["Designs solutions with customer in mind", "Gathers and acts on feedback"],
      "4": ["Transforms customer experience", "Drives customer-centric initiatives"],
      "5": ["Shapes customer strategy", "Creates industry-leading customer experiences"],
    },
    is_promotion_factor: true,
    category: "core",
  },
  {
    name: "Collaboration",
    description: "Working effectively with others, sharing knowledge, and building strong relationships across teams.",
    behavioral_levels: {
      "1": ["Participates in team activities", "Shares information when asked"],
      "2": ["Actively contributes to team goals", "Seeks input from colleagues"],
      "3": ["Builds partnerships across teams", "Facilitates effective teamwork"],
      "4": ["Creates collaborative culture", "Bridges gaps between departments"],
      "5": ["Transforms organizational collaboration", "Builds strategic partnerships"],
    },
    is_promotion_factor: true,
    category: "core",
  },
  {
    name: "Excellence",
    description: "Pursuing the highest standards of quality, continuous learning, and exceptional performance.",
    behavioral_levels: {
      "1": ["Meets basic quality standards", "Follows established procedures"],
      "2": ["Exceeds expectations consistently", "Self-corrects to improve quality"],
      "3": ["Sets high standards for work", "Coaches others on quality"],
      "4": ["Drives excellence initiatives", "Establishes quality benchmarks"],
      "5": ["Defines excellence standards", "Creates culture of high performance"],
    },
    is_promotion_factor: true,
    category: "core",
  },
  {
    name: "Accountability",
    description: "Taking ownership of actions and outcomes, delivering on commitments, and learning from mistakes.",
    behavioral_levels: {
      "1": ["Completes assigned tasks", "Acknowledges mistakes when pointed out"],
      "2": ["Takes responsibility for own work", "Proactively addresses issues"],
      "3": ["Owns outcomes beyond immediate scope", "Holds self to high standards"],
      "4": ["Creates accountability culture", "Helps others develop ownership"],
      "5": ["Models accountability at highest level", "Shapes organizational accountability"],
    },
    is_promotion_factor: true,
    category: "core",
  },
];

// Level definitions specific to values (different from competency terminology)
export const VALUE_LEVEL_DEFINITIONS = [
  {
    level: 1,
    name: "Learning",
    description: "Developing awareness and beginning to understand the value",
    icon: "🌱",
  },
  {
    level: 2,
    name: "Applying",
    description: "Consistently demonstrating the value in routine situations",
    icon: "📚",
  },
  {
    level: 3,
    name: "Modeling",
    description: "Actively exemplifying the value and influencing others",
    icon: "⭐",
  },
  {
    level: 4,
    name: "Championing",
    description: "Advocating for the value and driving its adoption",
    icon: "🏅",
  },
  {
    level: 5,
    name: "Embodying",
    description: "Living the value as a core part of identity and leadership",
    icon: "💎",
  },
];

export function useValueAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateValueDescription = async (valueName: string): Promise<string | null> => {
    if (!valueName.trim()) {
      toast.error("Please enter a value name first");
      return null;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("capability-ai-analyzer", {
        body: {
          action: "generate_value_description",
          valueName: valueName.trim(),
        },
      });

      if (error) throw error;

      if (data?.description) {
        return data.description;
      }
      return null;
    } catch (error) {
      console.error("Error generating value description:", error);
      toast.error("Failed to generate description");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBehavioralLevels = async (
    valueName: string,
    valueDescription?: string
  ): Promise<Record<string, string[]> | null> => {
    if (!valueName.trim()) {
      toast.error("Please enter a value name first");
      return null;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("capability-ai-analyzer", {
        body: {
          action: "generate_value_behavioral_levels",
          valueName: valueName.trim(),
          valueDescription: valueDescription || "",
        },
      });

      if (error) throw error;

      if (data?.behavioral_levels) {
        return data.behavioral_levels;
      }
      return null;
    } catch (error) {
      console.error("Error generating behavioral levels:", error);
      toast.error("Failed to generate behavioral levels");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeValue = async (
    valueName: string,
    valueDescription?: string
  ): Promise<ValueAIAnalysis | null> => {
    if (!valueName.trim()) {
      return null;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("capability-ai-analyzer", {
        body: {
          action: "analyze_value",
          valueName: valueName.trim(),
          valueDescription: valueDescription || "",
        },
      });

      if (error) throw error;

      if (data) {
        return {
          confidence_score: data.confidence_score ?? 0.7,
          improvements: data.improvements || [],
          related_values: data.related_values || [],
          classification: data.classification || "core",
        };
      }
      return null;
    } catch (error) {
      console.error("Error analyzing value:", error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTemplateByName = (name: string): ValueSuggestion | undefined => {
    return VALUE_TEMPLATES.find(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );
  };

  return {
    isGenerating,
    isAnalyzing,
    generateValueDescription,
    generateBehavioralLevels,
    analyzeValue,
    getTemplateByName,
    templates: VALUE_TEMPLATES,
    levelDefinitions: VALUE_LEVEL_DEFINITIONS,
  };
}
