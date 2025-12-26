import { useCallback } from 'react';
import type { AutoCalcRules, GoalRatingConfiguration } from '@/types/goalRatings';

interface RatingScaleLevel {
  value: number;
  label: string;
  minScore?: number;
  maxScore?: number;
}

export function useRatingCalculator() {
  /**
   * Calculate rating from progress percentage using configurable thresholds
   */
  const calculateFromProgress = useCallback((
    progressPercentage: number,
    rules?: AutoCalcRules,
    maxRating: number = 5
  ): number => {
    // Default mapping if no rules provided
    const defaultMap: Record<string, number> = {
      '0-50': 1,
      '51-70': 2,
      '71-90': 3,
      '91-100': 4,
      '101+': 5,
    };

    const ratingMap = rules?.progress_rating_map || defaultMap;

    for (const [range, rating] of Object.entries(ratingMap)) {
      if (range.includes('+')) {
        const min = parseInt(range.replace('+', ''));
        if (progressPercentage >= min) {
          return Math.min(rating, maxRating);
        }
      } else {
        const [min, max] = range.split('-').map(Number);
        if (progressPercentage >= min && progressPercentage <= max) {
          return Math.min(rating, maxRating);
        }
      }
    }

    return 1; // Default to lowest rating
  }, []);

  /**
   * Calculate weighted average of self-rating, manager rating, and progress
   */
  const calculateWeightedAverage = useCallback((
    selfRating: number | null,
    managerRating: number | null,
    progressScore: number | null,
    weights: { self: number; manager: number; progress: number }
  ): number => {
    let totalWeight = 0;
    let weightedSum = 0;

    if (selfRating !== null && weights.self > 0) {
      weightedSum += selfRating * weights.self;
      totalWeight += weights.self;
    }

    if (managerRating !== null && weights.manager > 0) {
      weightedSum += managerRating * weights.manager;
      totalWeight += weights.manager;
    }

    if (progressScore !== null && weights.progress > 0) {
      weightedSum += progressScore * weights.progress;
      totalWeight += weights.progress;
    }

    if (totalWeight === 0) return 0;

    return Math.round((weightedSum / totalWeight) * 100) / 100;
  }, []);

  /**
   * Apply rating scale bounds and round to valid value
   */
  const applyRatingScale = useCallback((
    rawScore: number,
    minRating: number = 1,
    maxRating: number = 5,
    step: number = 0.5
  ): number => {
    // Clamp to bounds
    const bounded = Math.max(minRating, Math.min(maxRating, rawScore));
    
    // Round to nearest step
    return Math.round(bounded / step) * step;
  }, []);

  /**
   * Get weight-adjusted contribution to overall score
   */
  const getWeightAdjustedScore = useCallback((
    finalScore: number,
    goalWeight: number,
    maxRating: number = 5
  ): number => {
    // Returns the contribution of this goal to overall score
    // e.g., if goal is rated 4/5 with 20% weight, contribution = (4/5) * 20 = 16
    return (finalScore / maxRating) * goalWeight;
  }, []);

  /**
   * Calculate team-level aggregated score from multiple goal ratings
   */
  const calculateTeamRollup = useCallback((
    goalRatings: Array<{ finalScore: number; weight: number }>,
    maxRating: number = 5
  ): { averageRating: number; totalWeightedScore: number; contributionPercentage: number } => {
    if (goalRatings.length === 0) {
      return { averageRating: 0, totalWeightedScore: 0, contributionPercentage: 0 };
    }

    let totalWeight = 0;
    let weightedSum = 0;

    for (const goal of goalRatings) {
      const contribution = getWeightAdjustedScore(goal.finalScore, goal.weight, maxRating);
      weightedSum += contribution;
      totalWeight += goal.weight;
    }

    const averageRating = totalWeight > 0
      ? (weightedSum / totalWeight) * maxRating
      : 0;

    return {
      averageRating: Math.round(averageRating * 100) / 100,
      totalWeightedScore: Math.round(weightedSum * 100) / 100,
      contributionPercentage: totalWeight,
    };
  }, [getWeightAdjustedScore]);

  /**
   * Map numeric score to rating scale level
   */
  const mapToScaleLevel = useCallback((
    score: number,
    levels: RatingScaleLevel[]
  ): RatingScaleLevel | null => {
    // Sort levels by value ascending
    const sortedLevels = [...levels].sort((a, b) => a.value - b.value);

    for (const level of sortedLevels) {
      if (level.minScore !== undefined && level.maxScore !== undefined) {
        if (score >= level.minScore && score <= level.maxScore) {
          return level;
        }
      } else {
        // If no min/max, match by closest value
        if (Math.abs(level.value - score) < 0.5) {
          return level;
        }
      }
    }

    // Return closest level if no exact match
    return sortedLevels.reduce((prev, curr) => 
      Math.abs(curr.value - score) < Math.abs(prev.value - score) ? curr : prev
    );
  }, []);

  /**
   * Calculate final score based on configuration method
   */
  const calculateFinalScore = useCallback((
    config: GoalRatingConfiguration,
    selfRating: number | null,
    managerRating: number | null,
    progressPercentage: number | null,
    maxRating: number = 5
  ): number | null => {
    switch (config.calculation_method) {
      case 'auto_calculated':
        if (progressPercentage === null) return null;
        return calculateFromProgress(progressPercentage, config.auto_calc_rules, maxRating);

      case 'manager_entered':
        return managerRating;

      case 'weighted_average':
        const progressScore = progressPercentage !== null
          ? calculateFromProgress(progressPercentage, config.auto_calc_rules, maxRating)
          : null;
        
        return calculateWeightedAverage(
          selfRating,
          managerRating,
          progressScore,
          {
            self: config.self_rating_weight,
            manager: config.manager_rating_weight,
            progress: config.progress_weight,
          }
        );

      case 'calibrated':
        // For calibrated, return weighted average but mark as pending calibration
        const calibrationScore = calculateWeightedAverage(
          selfRating,
          managerRating,
          null,
          {
            self: config.self_rating_weight,
            manager: config.manager_rating_weight,
            progress: 0,
          }
        );
        return calibrationScore;

      default:
        return managerRating;
    }
  }, [calculateFromProgress, calculateWeightedAverage]);

  return {
    calculateFromProgress,
    calculateWeightedAverage,
    applyRatingScale,
    getWeightAdjustedScore,
    calculateTeamRollup,
    mapToScaleLevel,
    calculateFinalScore,
  };
}
