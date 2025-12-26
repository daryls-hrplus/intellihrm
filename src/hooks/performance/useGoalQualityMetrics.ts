import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface QualityFlag {
  type: string;
  count: number;
  severity: 'high' | 'medium' | 'low';
}

export interface GoalQualityMetrics {
  totalGoals: number;
  assessedGoals: number;
  avgQualityScore: number;
  qualityDistribution: { range: string; count: number; color: string }[];
  qualityFlags: QualityFlag[];
  lowQualityGoals: {
    id: string;
    title: string;
    employeeName: string;
    qualityScore: number;
    flags: string[];
  }[];
}

export function useGoalQualityMetrics(companyId: string | undefined) {
  return useQuery({
    queryKey: ['goal-quality-metrics', companyId],
    queryFn: async (): Promise<GoalQualityMetrics> => {
      if (!companyId) {
        return {
          totalGoals: 0,
          assessedGoals: 0,
          avgQualityScore: 0,
          qualityDistribution: [],
          qualityFlags: [],
          lowQualityGoals: [],
        };
      }

      // Get all active goals
      const { data: goals, error: goalsError } = await supabase
        .from('performance_goals')
        .select(`
          id,
          title,
          target_value,
          unit_of_measure,
          parent_goal_id,
          employee_id,
          specific,
          measurable,
          achievable,
          relevant,
          time_bound,
          profiles!performance_goals_employee_id_fkey(full_name)
        `)
        .eq('company_id', companyId)
        .neq('status', 'cancelled');

      if (goalsError) throw goalsError;

      // Get quality assessments
      const { data: assessments, error: assessError } = await supabase
        .from('goal_quality_assessments')
        .select('*')
        .eq('company_id', companyId);

      if (assessError) throw assessError;

      // Create a map of assessments by goal_id
      const assessmentMap = new Map(assessments?.map(a => [a.goal_id, a]) || []);

      // Calculate metrics for goals (with on-the-fly assessment if not in DB)
      const analyzedGoals = (goals || []).map(goal => {
        const assessment = assessmentMap.get(goal.id);
        
        if (assessment) {
          return {
            id: goal.id,
            title: goal.title,
            employeeName: goal.profiles?.full_name || 'Unknown',
            qualityScore: assessment.quality_score || 0,
            flags: (assessment.quality_flags as string[]) || [],
            hasMetrics: assessment.has_metrics,
            hasSmart: assessment.has_smart_criteria,
            hasAlignment: assessment.has_alignment,
          };
        }

        // Calculate quality on the fly
        const flags: string[] = [];
        let score = 0;

        // Check metrics (25 points)
        const hasMetrics = !!(goal.target_value && goal.unit_of_measure);
        if (hasMetrics) score += 25;
        else flags.push('missing_metrics');

        // Check SMART criteria (20 points)
        const smartFields = [goal.specific, goal.measurable, goal.achievable, goal.relevant, goal.time_bound];
        const smartCount = smartFields.filter(Boolean).length;
        const hasSmart = smartCount >= 3;
        if (hasSmart) score += 20;
        else if (smartCount < 3) flags.push('weak_smart');

        // Check alignment (25 points)
        const hasAlignment = !!goal.parent_goal_id;
        if (hasAlignment) score += 25;
        else flags.push('no_alignment');

        // Base score for existing goal (30 points)
        score += 30;

        return {
          id: goal.id,
          title: goal.title,
          employeeName: goal.profiles?.full_name || 'Unknown',
          qualityScore: score,
          flags,
          hasMetrics,
          hasSmart,
          hasAlignment,
        };
      });

      // Calculate distribution
      const distribution = [
        { range: '0-25', count: 0, color: 'hsl(var(--destructive))' },
        { range: '26-50', count: 0, color: 'hsl(var(--warning))' },
        { range: '51-75', count: 0, color: 'hsl(var(--muted))' },
        { range: '76-100', count: 0, color: 'hsl(var(--primary))' },
      ];

      analyzedGoals.forEach(g => {
        if (g.qualityScore <= 25) distribution[0].count++;
        else if (g.qualityScore <= 50) distribution[1].count++;
        else if (g.qualityScore <= 75) distribution[2].count++;
        else distribution[3].count++;
      });

      // Count flags
      const flagCounts: Record<string, number> = {};
      analyzedGoals.forEach(g => {
        g.flags.forEach(f => {
          flagCounts[f] = (flagCounts[f] || 0) + 1;
        });
      });

      const qualityFlags: QualityFlag[] = [
        { type: 'missing_metrics', count: flagCounts['missing_metrics'] || 0, severity: 'high' as const },
        { type: 'weak_smart', count: flagCounts['weak_smart'] || 0, severity: 'medium' as const },
        { type: 'no_alignment', count: flagCounts['no_alignment'] || 0, severity: 'medium' as const },
      ].filter(f => f.count > 0);

      // Get low quality goals (score < 50)
      const lowQualityGoals = analyzedGoals
        .filter(g => g.qualityScore < 50)
        .sort((a, b) => a.qualityScore - b.qualityScore)
        .slice(0, 10);

      const avgScore = analyzedGoals.length > 0
        ? analyzedGoals.reduce((sum, g) => sum + g.qualityScore, 0) / analyzedGoals.length
        : 0;

      return {
        totalGoals: analyzedGoals.length,
        assessedGoals: assessments?.length || 0,
        avgQualityScore: Math.round(avgScore),
        qualityDistribution: distribution,
        qualityFlags,
        lowQualityGoals,
      };
    },
    enabled: !!companyId,
  });
}
