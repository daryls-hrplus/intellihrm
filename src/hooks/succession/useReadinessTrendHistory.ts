import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReadinessTrendPoint {
  date: string;
  score: number;
  band: string;
  assessorType: string;
  candidateId: string;
  eventId: string;
}

export interface ReadinessTrendData {
  candidateId: string;
  candidateName: string;
  trends: ReadinessTrendPoint[];
  currentScore: number | null;
  currentBand: string | null;
  scoreChange: number | null;
  bandProgression: string[];
}

export function useReadinessTrendHistory(candidateId?: string, companyId?: string) {
  return useQuery({
    queryKey: ["readiness-trend-history", candidateId],
    queryFn: async (): Promise<ReadinessTrendData | null> => {
      if (!candidateId) return null;

      // Fetch the candidate info
      const { data: candidate, error: candidateError } = await supabase
        .from("succession_candidates")
        .select(`
          id,
          latest_readiness_score,
          latest_readiness_band,
          employee:profiles!succession_candidates_employee_id_fkey(full_name)
        `)
        .eq("id", candidateId)
        .maybeSingle();

      if (candidateError || !candidate) {
        console.error("Error fetching candidate:", candidateError);
        return null;
      }

      // Fetch historical readiness assessment events
      const { data: events, error: eventsError } = await supabase
        .from("readiness_assessment_events")
        .select(`
          id,
          overall_score,
          readiness_band,
          completed_at,
          created_at
        `)
        .eq("candidate_id", candidateId)
        .order("completed_at", { ascending: true });

      if (eventsError) {
        console.error("Error fetching readiness events:", eventsError);
      }

      const trends: ReadinessTrendPoint[] = (events || [])
        .filter(e => e.overall_score !== null)
        .map(e => ({
          date: e.completed_at || e.created_at,
          score: e.overall_score!,
          band: e.readiness_band || "unknown",
          assessorType: "manager", // Default, could be extended
          candidateId: candidateId,
          eventId: e.id,
        }));

      // Calculate score change from first to last
      let scoreChange: number | null = null;
      if (trends.length >= 2) {
        scoreChange = trends[trends.length - 1].score - trends[0].score;
      }

      // Track band progression
      const bandProgression = trends.map(t => t.band);
      const uniqueBands = [...new Set(bandProgression)];

      return {
        candidateId,
        candidateName: (candidate.employee as any)?.full_name || "Unknown",
        trends,
        currentScore: candidate.latest_readiness_score,
        currentBand: candidate.latest_readiness_band,
        scoreChange,
        bandProgression: uniqueBands,
      };
    },
    enabled: !!candidateId,
  });
}

// Hook for aggregate trends across multiple candidates (for company-wide view)
export function useCompanyReadinessTrends(companyId?: string) {
  return useQuery({
    queryKey: ["company-readiness-trends", companyId],
    queryFn: async (): Promise<{
      averageByMonth: Array<{ month: string; avgScore: number; count: number }>;
      bandDistribution: Record<string, number>;
      totalAssessments: number;
    }> => {
      if (!companyId) {
        return { averageByMonth: [], bandDistribution: {}, totalAssessments: 0 };
      }

      // Fetch all readiness events for the company
      const { data: events, error } = await supabase
        .from("readiness_assessment_events")
        .select(`
          id,
          overall_score,
          readiness_band,
          completed_at,
          candidate:succession_candidates!readiness_assessment_events_candidate_id_fkey(
            plan:succession_plans!succession_candidates_plan_id_fkey(company_id)
          )
        `)
        .not("overall_score", "is", null)
        .order("completed_at", { ascending: true });

      if (error) {
        console.error("Error fetching company readiness trends:", error);
        return { averageByMonth: [], bandDistribution: {}, totalAssessments: 0 };
      }

      // Filter to company events
      const companyEvents = (events || []).filter(
        e => (e.candidate as any)?.plan?.company_id === companyId
      );

      // Group by month
      const monthlyData: Record<string, { total: number; count: number }> = {};
      const bandCounts: Record<string, number> = {};

      companyEvents.forEach(e => {
        const date = e.completed_at || "";
        const month = date.slice(0, 7); // YYYY-MM

        if (!monthlyData[month]) {
          monthlyData[month] = { total: 0, count: 0 };
        }
        monthlyData[month].total += e.overall_score!;
        monthlyData[month].count += 1;

        const band = e.readiness_band || "unknown";
        bandCounts[band] = (bandCounts[band] || 0) + 1;
      });

      const averageByMonth = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          avgScore: Math.round((data.total / data.count) * 10) / 10,
          count: data.count,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return {
        averageByMonth,
        bandDistribution: bandCounts,
        totalAssessments: companyEvents.length,
      };
    },
    enabled: !!companyId,
  });
}
