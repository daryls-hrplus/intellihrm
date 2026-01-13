import { 
  Target, Users, Brain, Shield, Briefcase, 
  Heart, Zap, Award, Settings, Lightbulb,
  MessageSquare, TrendingUp, Clock, Scale,
  Compass, Sparkles, type LucideIcon
} from 'lucide-react';

export interface CategoryConfig {
  label: string;
  icon: LucideIcon;
  variants: string[];
}

export const COMPETENCY_CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  leadership: { 
    label: 'Leadership', 
    icon: Users,
    variants: ['leadership', 'management', 'executive', 'managerial']
  },
  behavioral: { 
    label: 'Behavioral', 
    icon: Heart,
    variants: ['behavioral', 'core', 'interpersonal']
  },
  functional: { 
    label: 'Functional', 
    icon: Briefcase,
    variants: ['functional', 'business', 'operational']
  },
  technical: { 
    label: 'Technical', 
    icon: Settings,
    variants: ['technical', 'it', 'technology']
  },
  analytical: { 
    label: 'Analytical', 
    icon: Brain,
    variants: ['analytical', 'thinking', 'cognitive', 'problem-solving']
  },
  communication: { 
    label: 'Communication', 
    icon: MessageSquare,
    variants: ['communication', 'verbal', 'written']
  },
  strategic: { 
    label: 'Strategic', 
    icon: Target,
    variants: ['strategic', 'planning', 'vision']
  },
  performance: { 
    label: 'Performance', 
    icon: TrendingUp,
    variants: ['performance', 'results', 'achievement']
  },
  compliance: { 
    label: 'Compliance', 
    icon: Shield,
    variants: ['compliance', 'regulatory', 'legal', 'ethics']
  },
  innovation: { 
    label: 'Innovation', 
    icon: Lightbulb,
    variants: ['innovation', 'creativity', 'creative']
  },
  adaptability: { 
    label: 'Adaptability', 
    icon: Zap,
    variants: ['adaptability', 'flexibility', 'agility', 'change']
  },
  excellence: { 
    label: 'Excellence', 
    icon: Award,
    variants: ['excellence', 'quality', 'standards']
  },
  time_management: { 
    label: 'Time Management', 
    icon: Clock,
    variants: ['time management', 'time-management', 'efficiency', 'productivity']
  },
  decision_making: { 
    label: 'Decision Making', 
    icon: Scale,
    variants: ['decision making', 'decision-making', 'judgment']
  },
  direction: { 
    label: 'Direction', 
    icon: Compass,
    variants: ['direction', 'guidance', 'mentoring']
  },
  other: { 
    label: 'Other', 
    icon: Sparkles,
    variants: ['other', 'general', 'miscellaneous']
  }
};

/**
 * Normalizes a category string to a canonical key
 */
export function normalizeCategory(raw: string | null | undefined): string {
  if (!raw) return 'other';
  
  const lower = raw.toLowerCase().trim();
  
  for (const [key, config] of Object.entries(COMPETENCY_CATEGORY_CONFIG)) {
    if (config.variants.some(v => v.toLowerCase() === lower)) {
      return key;
    }
  }
  
  return 'other';
}

/**
 * Gets the display label for a normalized category
 */
export function getCategoryLabel(normalizedKey: string): string {
  return COMPETENCY_CATEGORY_CONFIG[normalizedKey]?.label || 
    normalizedKey.charAt(0).toUpperCase() + normalizedKey.slice(1);
}

/**
 * Gets the icon component for a normalized category
 */
export function getCategoryIcon(normalizedKey: string): LucideIcon {
  return COMPETENCY_CATEGORY_CONFIG[normalizedKey]?.icon || Sparkles;
}
