import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TalentProfileEvidence {
  id: string;
  employee_id: string;
  company_id: string;
  evidence_type: string;
  source_snapshot_id: string | null;
  source_table: string | null;
  source_id: string | null;
  evidence_summary: string | null;
  confidence_score: number | null;
  valid_from: string | null;
  valid_until: string | null;
  is_current: boolean;
  created_at: string;
}

export interface EvidenceSummary {
  totalItems: number;
  byType: Record<string, number>;
  avgConfidence: number;
  strengths: Array<{ name: string; score: number; confidence: number }>;
  developmentAreas: Array<{ name: string; score: number; confidence: number }>;
  recentSignals: TalentProfileEvidence[];
}

export function useTalentProfileEvidence() {
  const [loading, setLoading] = useState(false);

  const fetchEvidenceForEmployee = async (employeeId: string): Promise<TalentProfileEvidence[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('talent_profile_evidence')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('is_current', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidenceSummary = async (employeeId: string): Promise<EvidenceSummary> => {
    setLoading(true);
    try {
      // Fetch current evidence
      const { data: evidence, error: eError } = await supabase
        .from('talent_profile_evidence')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('is_current', true);

      if (eError) throw eError;

      // Fetch talent signals for this employee
      const { data: signals, error: sError } = await supabase
        .from('talent_signal_snapshots')
        .select(`
          *,
          talent_signal_definitions(name, signal_category)
        `)
        .eq('employee_id', employeeId)
        .eq('is_current', true);

      if (sError) throw sError;

      // Build summary
      const items = evidence || [];
      const byType: Record<string, number> = {};
      let totalConfidence = 0;
      let confidenceCount = 0;

      items.forEach(item => {
        byType[item.evidence_type] = (byType[item.evidence_type] || 0) + 1;
        if (item.confidence_score) {
          totalConfidence += item.confidence_score;
          confidenceCount++;
        }
      });

      // Calculate strengths and development areas from signals
      const signalItems = signals || [];
      const strengths: Array<{ name: string; score: number; confidence: number }> = [];
      const developmentAreas: Array<{ name: string; score: number; confidence: number }> = [];

      signalItems.forEach(signal => {
        const signalValue = signal.signal_value || signal.normalized_score || 0;
        const confidence = signal.confidence_score || 0;
        const name = (signal.talent_signal_definitions as any)?.name || 'Unknown';

        if (signalValue >= 3.5) {
          strengths.push({ name, score: signalValue, confidence });
        } else if (signalValue < 2.5) {
          developmentAreas.push({ name, score: signalValue, confidence });
        }
      });

      // Sort by score
      strengths.sort((a, b) => b.score - a.score);
      developmentAreas.sort((a, b) => a.score - b.score);

      return {
        totalItems: items.length,
        byType,
        avgConfidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0,
        strengths: strengths.slice(0, 5),
        developmentAreas: developmentAreas.slice(0, 5),
        recentSignals: items.slice(0, 10),
      };
    } finally {
      setLoading(false);
    }
  };

  const addEvidence = async (
    evidence: Omit<TalentProfileEvidence, 'id' | 'created_at'>
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('talent_profile_evidence')
        .insert(evidence)
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error adding evidence:', error);
      toast.error('Failed to add evidence');
      return null;
    }
  };

  const updateEvidence = async (
    evidenceId: string,
    updates: Partial<TalentProfileEvidence>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('talent_profile_evidence')
        .update(updates)
        .eq('id', evidenceId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating evidence:', error);
      toast.error('Failed to update evidence');
      return false;
    }
  };

  const markEvidenceExpired = async (evidenceId: string): Promise<boolean> => {
    return updateEvidence(evidenceId, {
      is_current: false,
      valid_until: new Date().toISOString().split('T')[0],
    });
  };

  const createEvidenceFromSignal = async (
    employeeId: string,
    companyId: string,
    snapshotId: string,
    summary: string,
    confidenceScore: number
  ): Promise<string | null> => {
    return addEvidence({
      employee_id: employeeId,
      company_id: companyId,
      evidence_type: '360_signal',
      source_snapshot_id: snapshotId,
      source_table: 'talent_signal_snapshots',
      source_id: snapshotId,
      evidence_summary: summary,
      confidence_score: confidenceScore,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: null,
      is_current: true,
    });
  };

  return {
    loading,
    fetchEvidenceForEmployee,
    fetchEvidenceSummary,
    addEvidence,
    updateEvidence,
    markEvidenceExpired,
    createEvidenceFromSignal,
  };
}
