import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TalentPoolReviewPacket {
  id: string;
  talent_pool_id: string | null;
  member_id: string | null;
  employee_id: string | null;
  company_id: string | null;
  evidence_snapshot: any;
  signal_summary: any;
  leadership_indicators: any;
  review_status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface LeadershipIndicator {
  name: string;
  score: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SignalSummary {
  overallScore: number;
  signalCount: number;
  avgConfidence: number;
  topStrengths: string[];
  developmentAreas: string[];
  biasRiskLevel: 'low' | 'medium' | 'high';
}

export function useTalentPoolReviewPackets() {
  const [loading, setLoading] = useState(false);

  const fetchPacketsForPool = async (poolId: string): Promise<TalentPoolReviewPacket[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('talent_pool_review_packets')
        .select('*')
        .eq('talent_pool_id', poolId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as TalentPoolReviewPacket[];
    } finally {
      setLoading(false);
    }
  };

  const fetchPacketForMember = async (memberId: string): Promise<TalentPoolReviewPacket | null> => {
    const { data, error } = await supabase
      .from('talent_pool_review_packets')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching packet:', error);
      return null;
    }

    return data as TalentPoolReviewPacket | null;
  };

  const createReviewPacket = async (
    poolId: string,
    memberId: string,
    employeeId: string,
    companyId: string
  ): Promise<string | null> => {
    setLoading(true);
    try {
      // Gather evidence snapshot
      const { data: evidence } = await supabase
        .from('talent_profile_evidence')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('is_current', true);

      // Gather signal summary
      const { data: signals } = await supabase
        .from('talent_signal_snapshots')
        .select(`
          *,
          talent_signal_definitions(name, signal_category)
        `)
        .eq('employee_id', employeeId)
        .eq('is_current', true);

      // Calculate leadership indicators
      const leadershipSignals = (signals || []).filter(s => 
        (s.talent_signal_definitions as any)?.signal_category === 'leadership'
      );

      const signalSummary: SignalSummary = calculateSignalSummary(signals || []);
      const leadershipIndicators = calculateLeadershipIndicators(leadershipSignals);

      const { data, error } = await supabase
        .from('talent_pool_review_packets')
        .insert([{
          talent_pool_id: poolId,
          member_id: memberId,
          employee_id: employeeId,
          company_id: companyId,
          evidence_snapshot: evidence || [],
          signal_summary: signalSummary as any,
          leadership_indicators: leadershipIndicators as any,
          review_status: 'pending',
        }])
        .select('id')
        .single();

      if (error) throw error;
      toast.success('Review packet created');
      return data?.id || null;
    } catch (error) {
      console.error('Error creating review packet:', error);
      toast.error('Failed to create review packet');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (
    packetId: string,
    status: 'approved' | 'declined',
    reviewerId: string,
    notes?: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('talent_pool_review_packets')
        .update({
          review_status: status,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          notes: notes || null,
        })
        .eq('id', packetId);

      if (error) throw error;
      toast.success(`Nomination ${status}`);
      return true;
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error('Failed to update review status');
      return false;
    }
  };

  const addReviewNotes = async (packetId: string, notes: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('talent_pool_review_packets')
        .update({ notes })
        .eq('id', packetId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding notes:', error);
      return false;
    }
  };

  return {
    loading,
    fetchPacketsForPool,
    fetchPacketForMember,
    createReviewPacket,
    updateReviewStatus,
    addReviewNotes,
  };
}

function calculateSignalSummary(signals: any[]): SignalSummary {
  if (!signals.length) {
    return {
      overallScore: 0,
      signalCount: 0,
      avgConfidence: 0,
      topStrengths: [],
      developmentAreas: [],
      biasRiskLevel: 'low',
    };
  }

  let totalScore = 0;
  let totalConfidence = 0;
  const strengths: Array<{ name: string; score: number }> = [];
  const development: Array<{ name: string; score: number }> = [];
  let highBiasCount = 0;

  signals.forEach(signal => {
    const score = signal.signal_value || signal.normalized_score || 0;
    const confidence = signal.confidence_score || 0;
    const name = (signal.talent_signal_definitions as any)?.name || 'Unknown';

    totalScore += score;
    totalConfidence += confidence;

    if (signal.bias_risk_level === 'high') highBiasCount++;

    if (score >= 3.5) {
      strengths.push({ name, score });
    } else if (score < 2.5) {
      development.push({ name, score });
    }
  });

  strengths.sort((a, b) => b.score - a.score);
  development.sort((a, b) => a.score - b.score);

  return {
    overallScore: totalScore / signals.length,
    signalCount: signals.length,
    avgConfidence: totalConfidence / signals.length,
    topStrengths: strengths.slice(0, 3).map(s => s.name),
    developmentAreas: development.slice(0, 3).map(s => s.name),
    biasRiskLevel: highBiasCount > signals.length * 0.3 ? 'high' : 
                   highBiasCount > signals.length * 0.1 ? 'medium' : 'low',
  };
}

function calculateLeadershipIndicators(signals: any[]): LeadershipIndicator[] {
  return signals.map(signal => ({
    name: (signal.talent_signal_definitions as any)?.name || 'Unknown',
    score: signal.signal_value || signal.normalized_score || 0,
    confidence: signal.confidence_score || 0,
    trend: 'stable' as const, // Would need historical data for actual trend
  }));
}
