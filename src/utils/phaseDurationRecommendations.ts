import type { AppraisalPhaseType, AppraisalCycleType } from "@/types/appraisalFormTemplates";
import { PHASE_TYPE_PRESETS } from "@/types/appraisalFormTemplates";

export type CompanySizeTier = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';

export function getCompanySizeTier(employeeCount: number): CompanySizeTier {
  if (employeeCount <= 50) return 'startup';
  if (employeeCount <= 200) return 'small';
  if (employeeCount <= 500) return 'medium';
  if (employeeCount <= 2000) return 'large';
  return 'enterprise';
}

export function getCompanySizeLabel(tier: CompanySizeTier): string {
  switch (tier) {
    case 'startup': return '1-50 employees';
    case 'small': return '51-200 employees';
    case 'medium': return '201-500 employees';
    case 'large': return '501-2000 employees';
    case 'enterprise': return '2000+ employees';
  }
}

// Multipliers for each phase type based on company size
// Base durations come from PHASE_TYPE_PRESETS.defaultDurationDays
const SIZE_MULTIPLIERS: Record<AppraisalPhaseType, Record<CompanySizeTier, number>> = {
  goal_setting: {
    startup: 0.7,
    small: 1.0,
    medium: 1.2,
    large: 1.4,
    enterprise: 1.6,
  },
  self_assessment: {
    startup: 0.8,
    small: 1.0,
    medium: 1.0,
    large: 1.2,
    enterprise: 1.3,
  },
  '360_collection': {
    startup: 0.7,
    small: 1.0,
    medium: 1.3,
    large: 1.5,
    enterprise: 1.8,
  },
  manager_review: {
    startup: 0.8,
    small: 1.0,
    medium: 1.2,
    large: 1.4,
    enterprise: 1.6,
  },
  calibration: {
    startup: 0.6,
    small: 1.0,
    medium: 1.5,
    large: 2.0,
    enterprise: 2.5,
  },
  hr_review: {
    startup: 0.5,
    small: 0.8,
    medium: 1.0,
    large: 1.3,
    enterprise: 1.5,
  },
  finalization: {
    startup: 0.8,
    small: 1.0,
    medium: 1.0,
    large: 1.2,
    enterprise: 1.4,
  },
  employee_acknowledgment: {
    startup: 0.8,
    small: 1.0,
    medium: 1.0,
    large: 1.2,
    enterprise: 1.3,
  },
};

// Cycle type adjustments (quarterly reviews are faster)
const CYCLE_TYPE_FACTORS: Record<AppraisalCycleType, number> = {
  annual: 1.0,
  mid_year: 0.7,
  quarterly: 0.5,
  probation: 0.6,
  project_based: 0.8,
  continuous: 0.4,
};

// Rationale explanations for each phase type
const PHASE_RATIONALES: Record<AppraisalPhaseType, Record<CompanySizeTier, string>> = {
  goal_setting: {
    startup: "Smaller teams can align goals quickly with direct communication",
    small: "Standard timing for goal cascading across teams",
    medium: "Additional time for cross-functional goal alignment",
    large: "Extended period for multi-level goal cascading",
    enterprise: "Complex goal hierarchy requires extended coordination",
  },
  self_assessment: {
    startup: "Employees can complete assessments with minimal complexity",
    small: "Standard reflection period for self-evaluation",
    medium: "Adequate time for comprehensive self-reflection",
    large: "Extra time for detailed achievement documentation",
    enterprise: "Extended period for thorough self-documentation",
  },
  '360_collection': {
    startup: "Fewer stakeholders means faster feedback collection",
    small: "Standard timeframe for peer feedback gathering",
    medium: "More stakeholders require additional collection time",
    large: "Extended period for cross-departmental feedback",
    enterprise: "Complex org structure needs maximum collection time",
  },
  manager_review: {
    startup: "Smaller teams enable faster manager assessments",
    small: "Standard review period for direct reports",
    medium: "Additional time for larger team reviews",
    large: "Extended period for multi-team coordination",
    enterprise: "Complex hierarchies require extended review time",
  },
  calibration: {
    startup: "Simple calibration with small team size",
    small: "Standard calibration sessions across teams",
    medium: "Multiple calibration rounds for consistency",
    large: "Extended calibration across business units",
    enterprise: "Enterprise-wide calibration requires maximum time",
  },
  hr_review: {
    startup: "Minimal HR oversight needed for small teams",
    small: "Standard HR review and compliance check",
    medium: "Thorough HR review for mid-size organizations",
    large: "Extended review for policy compliance",
    enterprise: "Comprehensive audit and compliance verification",
  },
  finalization: {
    startup: "Quick finalization with fewer approvals",
    small: "Standard finalization workflow",
    medium: "Additional approval layers",
    large: "Extended finalization for hierarchy",
    enterprise: "Complex approval chain requires more time",
  },
  employee_acknowledgment: {
    startup: "Fast acknowledgment with direct communication",
    small: "Standard acknowledgment period",
    medium: "Adequate time for review and discussion",
    large: "Extended period for manager discussions",
    enterprise: "Maximum time for comprehensive discussions",
  },
};

export interface DurationRecommendation {
  recommendedDays: number;
  minDays: number;
  maxDays: number;
  rationale: string;
  baseDays: number;
  companySizeTier: CompanySizeTier;
}

export function getRecommendedDuration(
  phaseType: AppraisalPhaseType,
  companySizeTier: CompanySizeTier,
  cycleType: AppraisalCycleType = 'annual'
): DurationRecommendation {
  const basePreset = PHASE_TYPE_PRESETS[phaseType];
  const baseDays = basePreset?.defaultDurationDays || 7;
  
  const sizeMultiplier = SIZE_MULTIPLIERS[phaseType]?.[companySizeTier] || 1.0;
  const cycleFactor = CYCLE_TYPE_FACTORS[cycleType] || 1.0;
  
  const recommendedDays = Math.round(baseDays * sizeMultiplier * cycleFactor);
  const minDays = Math.max(1, Math.round(recommendedDays * 0.7));
  const maxDays = Math.round(recommendedDays * 1.5);
  
  const rationale = PHASE_RATIONALES[phaseType]?.[companySizeTier] || 
    `Recommended duration based on ${companySizeTier} organization size`;
  
  return {
    recommendedDays: Math.max(1, recommendedDays),
    minDays,
    maxDays,
    rationale,
    baseDays,
    companySizeTier,
  };
}

export function getAllPhaseRecommendations(
  phaseTypes: AppraisalPhaseType[],
  companySizeTier: CompanySizeTier,
  cycleType: AppraisalCycleType = 'annual'
): Record<AppraisalPhaseType, DurationRecommendation> {
  const recommendations: Partial<Record<AppraisalPhaseType, DurationRecommendation>> = {};
  
  for (const phaseType of phaseTypes) {
    recommendations[phaseType] = getRecommendedDuration(phaseType, companySizeTier, cycleType);
  }
  
  return recommendations as Record<AppraisalPhaseType, DurationRecommendation>;
}

export function getTotalRecommendedDuration(
  phaseTypes: AppraisalPhaseType[],
  companySizeTier: CompanySizeTier,
  cycleType: AppraisalCycleType = 'annual'
): number {
  return phaseTypes.reduce((total, phaseType) => {
    const rec = getRecommendedDuration(phaseType, companySizeTier, cycleType);
    return total + rec.recommendedDays;
  }, 0);
}
