import type { GoalAchievement, GoalExtendedAttributes, AchievementLevel } from '@/types/goalEnhancements';

/**
 * Calculate goal achievement percentage with threshold/target/stretch logic
 */
export function calculateGoalAchievement(
  currentValue: number | null,
  targetValue: number | null,
  extendedAttrs?: GoalExtendedAttributes
): GoalAchievement {
  const defaultResult: GoalAchievement = {
    percentage: 0,
    achievementLevel: 'not_started',
    thresholdMet: false,
    targetMet: false,
    stretchMet: false,
  };

  if (targetValue === null || targetValue === 0) {
    return defaultResult;
  }

  const current = currentValue ?? 0;
  const target = targetValue;
  const thresholdPct = extendedAttrs?.thresholdPercentage ?? 80;
  const stretchPct = extendedAttrs?.stretchPercentage ?? 120;
  const isInverse = extendedAttrs?.isInverse ?? false;

  // Calculate effective threshold and stretch values
  const effectiveThreshold = extendedAttrs?.thresholdValue ?? (target * thresholdPct / 100);
  const effectiveStretch = extendedAttrs?.stretchValue ?? (target * stretchPct / 100);

  let percentage: number;
  let achievementLevel: AchievementLevel;
  let thresholdMet: boolean;
  let targetMet: boolean;
  let stretchMet: boolean;

  if (isInverse) {
    // For inverse goals (lower is better)
    if (current <= effectiveStretch) {
      percentage = 100 + ((effectiveStretch - current) / effectiveStretch) * 50;
      achievementLevel = 'exceeds';
      thresholdMet = true;
      targetMet = true;
      stretchMet = true;
    } else if (current <= target) {
      percentage = 100;
      achievementLevel = 'meets';
      thresholdMet = true;
      targetMet = true;
      stretchMet = false;
    } else if (current <= effectiveThreshold) {
      percentage = ((effectiveThreshold - current) / (effectiveThreshold - target)) * 100;
      achievementLevel = 'below';
      thresholdMet = true;
      targetMet = false;
      stretchMet = false;
    } else {
      percentage = Math.max(0, (1 - (current - effectiveThreshold) / effectiveThreshold) * 50);
      achievementLevel = 'not_met';
      thresholdMet = false;
      targetMet = false;
      stretchMet = false;
    }
  } else {
    // For normal goals (higher is better)
    percentage = (current / target) * 100;
    
    if (current >= effectiveStretch) {
      achievementLevel = 'exceeds';
      thresholdMet = true;
      targetMet = true;
      stretchMet = true;
    } else if (current >= target) {
      achievementLevel = 'meets';
      thresholdMet = true;
      targetMet = true;
      stretchMet = false;
    } else if (current >= effectiveThreshold) {
      achievementLevel = 'below';
      thresholdMet = true;
      targetMet = false;
      stretchMet = false;
    } else if (current > 0) {
      achievementLevel = 'not_met';
      thresholdMet = false;
      targetMet = false;
      stretchMet = false;
    } else {
      achievementLevel = 'not_started';
      thresholdMet = false;
      targetMet = false;
      stretchMet = false;
    }
  }

  return {
    percentage: Math.max(0, Math.min(150, percentage)),
    achievementLevel,
    thresholdMet,
    targetMet,
    stretchMet,
  };
}

/**
 * Calculate inherited weight from parent goal
 */
export function calculateInheritedWeight(
  parentWeight: number | null,
  inheritedPortion: number | null
): number | null {
  if (parentWeight === null || inheritedPortion === null) {
    return null;
  }
  return (parentWeight * inheritedPortion) / 100;
}

/**
 * Validate goal weights for a set of goals
 */
export function validateGoalWeights(
  goals: { weighting: number | null; isWeightRequired?: boolean }[]
): {
  totalWeight: number;
  optionalCount: number;
  isValid: boolean;
  message: string;
} {
  const requiredGoals = goals.filter(g => g.isWeightRequired !== false);
  const totalWeight = requiredGoals.reduce((sum, g) => sum + (g.weighting ?? 0), 0);
  const optionalCount = goals.length - requiredGoals.length;

  const isValid = totalWeight === 100;

  let message: string;
  if (totalWeight < 100) {
    message = `Total weight is ${totalWeight}% (below 100%). Add more goals or adjust weights.`;
  } else if (totalWeight > 100) {
    message = `Total weight is ${totalWeight}% (exceeds 100%). Reduce some goal weights.`;
  } else {
    message = 'Weight distribution is valid.';
  }

  return {
    totalWeight,
    optionalCount,
    isValid,
    message,
  };
}

/**
 * Parse extended attributes from category field (JSON stored in category)
 */
export function parseExtendedAttributes(category: string | null): GoalExtendedAttributes | null {
  if (!category) return null;
  
  // Check if category is a JSON string (starts with {)
  if (category.startsWith('{')) {
    try {
      return JSON.parse(category) as GoalExtendedAttributes;
    } catch {
      return null;
    }
  }
  
  // Legacy: category is just a plain string
  return null;
}

/**
 * Serialize extended attributes to store in category field
 */
export function serializeExtendedAttributes(
  attrs: GoalExtendedAttributes,
  legacyCategory?: string
): string {
  const data = {
    ...attrs,
    _category: legacyCategory, // Preserve legacy category as nested field
  };
  return JSON.stringify(data);
}

/**
 * Get display category from extended attributes or raw category
 */
export function getDisplayCategory(category: string | null): string | null {
  if (!category) return null;
  
  if (category.startsWith('{')) {
    try {
      const parsed = JSON.parse(category);
      return parsed._category || null;
    } catch {
      return null;
    }
  }
  
  return category;
}
