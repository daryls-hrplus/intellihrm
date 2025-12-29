import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ValidationConfidence = 'low' | 'medium' | 'high';
export type ValidationSourceType = 'self' | 'manager' | 'training' | 'assessment' | 'certification' | 'peer';

export interface SkillValidationSummary {
  capability_id: string;
  capability_name: string;
  total_evidence_count: number;
  validated_count: number;
  avg_proficiency_level: number;
  confidence_level: ValidationConfidence;
  validation_sources: ValidationSourceType[];
  last_validated_date: string | null;
  has_certification: boolean;
  has_formal_assessment: boolean;
}

export interface ConfidenceCalculationResult {
  confidence: ValidationConfidence;
  score: number;
  factors: {
    source_diversity: number;
    validation_rate: number;
    recency_score: number;
    formal_validation_bonus: number;
  };
  recommendations: string[];
}

const SOURCE_WEIGHTS: Record<string, number> = {
  self_assessment: 1,
  peer_review: 2,
  manager_assessment: 3,
  training_completion: 3,
  lms_completion: 3,
  project_outcome: 4,
  '360_feedback': 4,
  certification: 5,
  external_validation: 5,
  ai_inference: 2,
};

export function useSkillValidationConfidence() {
  const [loading, setLoading] = useState(false);

  const calculateConfidence = useCallback((
    evidenceList: Array<{
      evidence_source: string;
      validation_status: string;
      proficiency_level: number;
      validated_at: string | null;
    }>
  ): ConfidenceCalculationResult => {
    if (evidenceList.length === 0) {
      return {
        confidence: 'low',
        score: 0,
        factors: {
          source_diversity: 0,
          validation_rate: 0,
          recency_score: 0,
          formal_validation_bonus: 0,
        },
        recommendations: [
          "Add self-assessment to establish baseline",
          "Request manager validation for credibility",
          "Complete relevant training or certification",
        ],
      };
    }

    // 1. Source Diversity Score (0-25 points)
    const uniqueSources = new Set(evidenceList.map(e => e.evidence_source));
    const sourceDiversityScore = Math.min(25, uniqueSources.size * 5);

    // 2. Validation Rate Score (0-30 points)
    const validatedCount = evidenceList.filter(e => e.validation_status === 'validated').length;
    const validationRate = validatedCount / evidenceList.length;
    const validationRateScore = validationRate * 30;

    // 3. Recency Score (0-20 points)
    const now = new Date();
    const recentEvidence = evidenceList.filter(e => {
      if (!e.validated_at) return false;
      const validatedDate = new Date(e.validated_at);
      const monthsAgo = (now.getTime() - validatedDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsAgo <= 12;
    });
    const recencyScore = (recentEvidence.length / evidenceList.length) * 20;

    // 4. Formal Validation Bonus (0-25 points)
    const hasCertification = evidenceList.some(e => e.evidence_source === 'certification');
    const hasExternalValidation = evidenceList.some(e => e.evidence_source === 'external_validation');
    const hasAssessment = evidenceList.some(e => 
      e.evidence_source === 'manager_assessment' || e.evidence_source === '360_feedback'
    );
    
    let formalValidationBonus = 0;
    if (hasCertification) formalValidationBonus += 15;
    if (hasExternalValidation) formalValidationBonus += 10;
    if (hasAssessment && !hasCertification) formalValidationBonus += 5;
    formalValidationBonus = Math.min(25, formalValidationBonus);

    // Calculate total score
    const totalScore = sourceDiversityScore + validationRateScore + recencyScore + formalValidationBonus;

    // Determine confidence level
    let confidence: ValidationConfidence;
    if (totalScore >= 70) confidence = 'high';
    else if (totalScore >= 40) confidence = 'medium';
    else confidence = 'low';

    // Generate recommendations
    const recommendations: string[] = [];
    if (sourceDiversityScore < 15) {
      recommendations.push("Diversify evidence sources (training, projects, peer reviews)");
    }
    if (validationRate < 0.5) {
      recommendations.push("Request validation for pending evidence");
    }
    if (recencyScore < 10) {
      recommendations.push("Update with recent achievements or assessments");
    }
    if (formalValidationBonus < 10) {
      recommendations.push("Consider obtaining relevant certification");
    }

    return {
      confidence,
      score: Math.round(totalScore),
      factors: {
        source_diversity: Math.round(sourceDiversityScore),
        validation_rate: Math.round(validationRateScore),
        recency_score: Math.round(recencyScore),
        formal_validation_bonus: Math.round(formalValidationBonus),
      },
      recommendations,
    };
  }, []);

  const getValidationSummary = useCallback(async (
    capabilityId: string,
    employeeId: string
  ): Promise<SkillValidationSummary | null> => {
    setLoading(true);
    try {
      const { data: evidence, error } = await supabase
        .from("competency_evidence")
        .select(`
          id, competency_id, employee_id, evidence_source, proficiency_level, 
          validation_status, validated_at
        `)
        .eq("competency_id", capabilityId)
        .eq("employee_id", employeeId);

      if (error) throw error;
      if (!evidence || evidence.length === 0) return null;

      const validated = evidence.filter(e => e.validation_status === 'validated');
      const avgLevel = evidence.reduce((sum, e) => sum + e.proficiency_level, 0) / evidence.length;
      const sources = [...new Set(evidence.map(e => e.evidence_source))];
      const lastValidated = validated
        .filter(e => e.validated_at)
        .sort((a, b) => new Date(b.validated_at!).getTime() - new Date(a.validated_at!).getTime())[0];

      const hasCertification = evidence.some(e => e.evidence_source === 'certification');
      const hasFormalAssessment = evidence.some(e => 
        e.evidence_source === 'manager_assessment' || 
        e.evidence_source === 'formal_assessment'
      );

      // Calculate confidence
      const { confidence } = calculateConfidence(evidence.map(e => ({
        evidence_source: e.evidence_source,
        validation_status: e.validation_status,
        proficiency_level: e.proficiency_level,
        validated_at: e.validated_at,
      })));

      return {
        capability_id: capabilityId,
        capability_name: "Capability",
        total_evidence_count: evidence.length,
        validated_count: validated.length,
        avg_proficiency_level: Math.round(avgLevel * 10) / 10,
        confidence_level: confidence,
        validation_sources: sources as ValidationSourceType[],
        last_validated_date: lastValidated?.validated_at || null,
        has_certification: hasCertification,
        has_formal_assessment: hasFormalAssessment,
      };
    } catch (error: any) {
      console.error("Error getting validation summary:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [calculateConfidence]);

  const updateEvidenceConfidence = useCallback(async (
    evidenceId: string,
    confidence: ValidationConfidence,
    sourceType?: ValidationSourceType
  ): Promise<boolean> => {
    try {
      const updateData: any = {
        validation_confidence: confidence,
        last_validated_date: new Date().toISOString().split('T')[0],
      };
      
      if (sourceType) {
        updateData.validation_source_type = sourceType;
      }

      const { error } = await supabase
        .from("competency_evidence")
        .update(updateData)
        .eq("id", evidenceId);

      if (error) throw error;
      
      toast.success("Confidence level updated");
      return true;
    } catch (error: any) {
      console.error("Error updating confidence:", error);
      toast.error("Failed to update confidence level");
      return false;
    }
  }, []);

  const getConfidenceLabel = useCallback((confidence: ValidationConfidence): string => {
    switch (confidence) {
      case 'high': return 'High Confidence';
      case 'medium': return 'Medium Confidence';
      case 'low': return 'Low Confidence';
      default: return 'Unknown';
    }
  }, []);

  const getConfidenceColor = useCallback((confidence: ValidationConfidence): string => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-muted-foreground bg-muted';
    }
  }, []);

  return {
    loading,
    calculateConfidence,
    getValidationSummary,
    updateEvidenceConfidence,
    getConfidenceLabel,
    getConfidenceColor,
  };
}
