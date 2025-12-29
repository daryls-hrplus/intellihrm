import { useState, useEffect, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Target, Briefcase, Award, Save, Send, ChevronDown, ChevronUp, Loader2, GitBranch, Settings2, Users } from "lucide-react";
import { useKRARatingSubmissions } from "@/hooks/useKRARatingSubmissions";
import { KRAWithRating, ResponsibilityKRA } from "@/types/responsibilityKRA";
import { KRARatingCard } from "./KRARatingCard";
import { RoleSegmentTimeline } from "./RoleSegmentTimeline";
import { useAppraisalRoleSegments, RoleSegment } from "@/hooks/useAppraisalRoleSegments";
import { SegmentFilterTabs } from "./SegmentFilterTabs";
import { SegmentScoreSummary } from "./SegmentScoreSummary";
import { SegmentOverrideDialog } from "./SegmentOverrideDialog";
import { useMultiPositionParticipant, PositionWeight } from "@/hooks/useMultiPositionParticipant";
import { PositionFilterTabs } from "./PositionFilterTabs";
import { PositionScoreSummary } from "./PositionScoreSummary";
import { MultiPositionWeightsManager } from "./MultiPositionWeightsManager";
import { useEmployeeLevelExpectations } from "@/hooks/useEmployeeLevelExpectations";
import { JobLevelExpectationsPanel } from "./JobLevelExpectationsPanel";
interface AppraisalScore {
  id?: string;
  item_id: string;
  item_name: string;
  evaluation_type: "competency" | "responsibility" | "goal";
  weight: number;
  rating: number | null;
  weighted_score: number | null;
  comments: string;
  // For responsibilities with KRAs
  hasKRAs?: boolean;
  kras?: KRAWithRating[];
  kraRollupScore?: number;
  // For segment tracking (role changes over time)
  segment_id?: string;
  segment_name?: string;
  // For multi-position tracking (concurrent positions)
  position_id?: string;
  position_title?: string;
}

interface CycleInfo {
  competency_weight: number;
  responsibility_weight: number;
  goal_weight: number;
  min_rating: number;
  max_rating: number;
  multi_position_mode?: "aggregate" | "separate";
  company_id?: string;
}

interface ParticipantInfo {
  employee_id: string;
  final_comments: string | null;
  has_role_change: boolean;
  primary_position_id: string | null;
}

interface AppraisalEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantId: string;
  employeeName: string;
  cycleId: string;
  onSuccess: () => void;
  isEmployee?: boolean;
  currentUserId?: string;
}

export function AppraisalEvaluationDialog({
  open,
  onOpenChange,
  participantId,
  employeeName,
  cycleId,
  onSuccess,
  isEmployee = false,
  currentUserId,
}: AppraisalEvaluationDialogProps) {
  const [activeTab, setActiveTab] = useState("competencies");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cycleInfo, setCycleInfo] = useState<CycleInfo | null>(null);
  const [scores, setScores] = useState<AppraisalScore[]>([]);
  const [finalComments, setFinalComments] = useState("");
  const [expandedResponsibilities, setExpandedResponsibilities] = useState<Set<string>>(new Set());
  const [hasRoleChange, setHasRoleChange] = useState(false);
  const [roleSegments, setRoleSegments] = useState<RoleSegment[]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState<string | undefined>();
  const [selectedFilterSegmentId, setSelectedFilterSegmentId] = useState<string | null>(null);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  
  // Multi-position state
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [weightsDialogOpen, setWeightsDialogOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  const { fetchSegments } = useAppraisalRoleSegments();
  
  // Multi-position hook
  const {
    hasMultiplePositions,
    positions: multiPositions,
    multiPositionMode,
    loading: multiPositionLoading,
    refetch: refetchMultiPosition,
  } = useMultiPositionParticipant(open ? participantId : null, open ? cycleId : null);

  const { 
    fetchKRAsWithRatings, 
    submitSelfRating, 
    submitManagerRating,
    calculateResponsibilityRollup,
  } = useKRARatingSubmissions({ participantId });

  // Calculate current competency and goal scores for level expectations comparison
  const currentCompetencyScore = useMemo(() => {
    const compScores = scores.filter(s => s.evaluation_type === "competency");
    const totalWeight = compScores.reduce((sum, s) => sum + s.weight, 0);
    if (totalWeight === 0) return 0;
    const weightedSum = compScores.reduce((sum, s) => {
      if (s.rating === null) return sum;
      return sum + s.rating * (s.weight / totalWeight);
    }, 0);
    return weightedSum;
  }, [scores]);

  const currentGoalScore = useMemo(() => {
    const goalScores = scores.filter(s => s.evaluation_type === "goal");
    const totalWeight = goalScores.reduce((sum, s) => sum + s.weight, 0);
    const totalWeighted = goalScores.reduce((sum, s) => sum + (s.weighted_score || 0), 0);
    return totalWeight > 0 ? (totalWeighted / totalWeight) * 100 : 0;
  }, [scores]);

  // Job level expectations hook
  const {
    expectation: levelExpectation,
    employeeInfo: levelEmployeeInfo,
    gapAnalysis,
    loading: levelExpectationsLoading,
  } = useEmployeeLevelExpectations(
    open ? employeeId : null,
    open ? cycleInfo?.company_id ?? null : null,
    {
      competencyScore: currentCompetencyScore,
      goalScore: currentGoalScore,
    }
  );

  useEffect(() => {
    if (open && participantId) {
      fetchData();
    }
  }, [open, participantId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch cycle info including multi_position_mode and company_id
      const { data: cycleData } = await supabase
        .from("appraisal_cycles")
        .select("competency_weight, responsibility_weight, goal_weight, min_rating, max_rating, multi_position_mode, company_id")
        .eq("id", cycleId)
        .single();

      if (cycleData) {
        setCycleInfo({
          ...cycleData,
          multi_position_mode: (cycleData.multi_position_mode as "aggregate" | "separate") || "aggregate",
        });
      }

      // Fetch participant info
      const { data: participantData } = await supabase
        .from("appraisal_participants")
        .select("employee_id, final_comments, has_role_change, primary_position_id")
        .eq("id", participantId)
        .single();

      if (participantData) {
        setEmployeeId(participantData.employee_id);
        setFinalComments(participantData.final_comments || "");
        setHasRoleChange(participantData.has_role_change || false);
        
        // Fetch role segments if there's a role change
        if (participantData.has_role_change) {
          const segments = await fetchSegments(participantId);
          setRoleSegments(segments);
          if (segments.length > 0) {
            setActiveSegmentId(segments[segments.length - 1].id);
          }
        }
        
        await fetchEmployeeItems(participantData.employee_id, participantData.has_role_change);
      }

      // Fetch existing scores
      await fetchExistingScores();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch items from stored role segments
  const fetchSegmentBasedItems = async () => {
    const newScores: AppraisalScore[] = [];
    
    for (const segment of roleSegments) {
      const segmentWeight = segment.contribution_percentage / 100;
      const segmentName = segment.position_title || 'Unknown Role';
      
      // Add segment competencies
      if (segment.competencies && Array.isArray(segment.competencies)) {
        for (const comp of segment.competencies as any[]) {
          newScores.push({
            item_id: `${segment.id}-${comp.id}`,
            item_name: comp.name,
            evaluation_type: "competency",
            weight: (comp.weight || 0) * segmentWeight,
            rating: null,
            weighted_score: null,
            comments: "",
            segment_id: segment.id,
            segment_name: segmentName,
          });
        }
      }
      
      // Add segment responsibilities
      if (segment.responsibilities && Array.isArray(segment.responsibilities)) {
        for (const resp of segment.responsibilities as any[]) {
          newScores.push({
            item_id: `${segment.id}-${resp.id}`,
            item_name: resp.name,
            evaluation_type: "responsibility",
            weight: (resp.weight || 0) * segmentWeight,
            rating: null,
            weighted_score: null,
            comments: "",
            segment_id: segment.id,
            segment_name: segmentName,
          });
        }
      }
      
      // Add segment goals
      if (segment.goals && Array.isArray(segment.goals)) {
        for (const goal of segment.goals as any[]) {
          newScores.push({
            item_id: `${segment.id}-${goal.id}`,
            item_name: goal.name,
            evaluation_type: "goal",
            weight: (goal.weight || 0) * segmentWeight,
            rating: null,
            weighted_score: null,
            comments: "",
            segment_id: segment.id,
            segment_name: segmentName,
          });
        }
      }
    }
    
    setScores(newScores);
  };

  // Fetch items for multi-position employees
  const fetchMultiPositionItems = async (employeeId: string) => {
    const newScores: AppraisalScore[] = [];
    
    for (const position of multiPositions) {
      const positionWeight = position.weight_percentage / 100;
      const positionTitle = position.position_title;
      const jobId = position.job_id;
      
      if (!jobId) continue;
      
      // Fetch competencies for this position's job
      const { data: jobCompetencies } = await supabase
        .from("job_competencies")
        .select("competency_id, weighting, competencies(id, name)")
        .eq("job_id", jobId)
        .is("end_date", null);
      
      for (const jc of jobCompetencies || []) {
        newScores.push({
          item_id: `${position.position_id}-${jc.competency_id}`,
          item_name: (jc as any).competencies?.name || "Unknown",
          evaluation_type: "competency",
          weight: ((jc.weighting || 0) * positionWeight),
          rating: null,
          weighted_score: null,
          comments: "",
          position_id: position.position_id,
          position_title: positionTitle,
        });
      }
      
      // Fetch responsibilities for this position's job
      const { data: jobResps } = await supabase
        .from("job_responsibilities")
        .select("responsibility_id, weighting, responsibilities(id, name)")
        .eq("job_id", jobId)
        .is("end_date", null);
      
      for (const jr of jobResps || []) {
        const respId = jr.responsibility_id;
        const krasWithRatings = await fetchKRAsWithRatings(participantId, respId);
        const hasKRAs = krasWithRatings.length > 0;
        
        newScores.push({
          item_id: `${position.position_id}-${respId}`,
          item_name: (jr as any).responsibilities?.name || "Unknown",
          evaluation_type: "responsibility",
          weight: ((jr.weighting || 0) * positionWeight),
          rating: null,
          weighted_score: null,
          comments: "",
          position_id: position.position_id,
          position_title: positionTitle,
          hasKRAs,
          kras: hasKRAs ? krasWithRatings : undefined,
          kraRollupScore: hasKRAs ? calculateKRAScore(krasWithRatings) : undefined,
        });
        
        if (hasKRAs) {
          setExpandedResponsibilities(prev => new Set([...prev, `${position.position_id}-${respId}`]));
        }
      }
      
      // Fetch goals for this position's job
      const { data: jobGoals } = await supabase
        .from("job_goals")
        .select("id, goal_name, weighting")
        .eq("job_id", jobId)
        .is("end_date", null);
      
      for (const goal of jobGoals || []) {
        newScores.push({
          item_id: `${position.position_id}-${goal.id}`,
          item_name: goal.goal_name,
          evaluation_type: "goal",
          weight: ((goal.weighting || 0) * positionWeight),
          rating: null,
          weighted_score: null,
          comments: "",
          position_id: position.position_id,
          position_title: positionTitle,
        });
      }
    }
    
    setScores(newScores);
  };

  const fetchEmployeeItems = async (employeeId: string, hasMultipleRoles: boolean = false) => {
    // If employee has role changes, fetch items per segment
    if (hasMultipleRoles && roleSegments.length > 0) {
      await fetchSegmentBasedItems();
      return;
    }
    
    // If employee has multiple concurrent positions with position weights configured
    if (hasMultiplePositions && multiPositions.length > 0) {
      await fetchMultiPositionItems(employeeId);
      return;
    }
    
    // Standard single-position fetch
    const { data: competencies } = await supabase
      .from("employee_competencies")
      .select(`
        id,
        weighting,
        competency_id
      `)
      .eq("employee_id", employeeId)
      .is("end_date", null);

    const compIds = (competencies || []).map((c: any) => c.competency_id);
    let compNames: Record<string, string> = {};
    if (compIds.length > 0) {
      const { data: compData } = await supabase
        .from("competencies")
        .select("id, name")
        .in("id", compIds);
      compNames = Object.fromEntries((compData || []).map((c: any) => [c.id, c.name]));
    }

    const { data: positions } = await supabase
      .from("employee_positions")
      .select("position_id, positions!inner(job_id)")
      .eq("employee_id", employeeId)
      .eq("is_active", true);

    let responsibilities: { id: string; name: string; weight: number; responsibility_id: string }[] = [];
    if (positions && positions.length > 0) {
      const jobIds = positions
        .map((p: any) => p.positions?.job_id)
        .filter(Boolean);
      
      if (jobIds.length > 0) {
        const { data: jobResps } = await supabase
          .from("job_responsibilities")
          .select("id, weighting, responsibility_id, responsibilities(id, name)")
          .in("job_id", jobIds)
          .is("end_date", null);
        
        responsibilities = (jobResps || []).map((jr: any) => ({
          id: jr.responsibility_id,
          name: jr.responsibilities?.name || 'Unknown',
          weight: jr.weighting || 0,
          responsibility_id: jr.responsibility_id,
        }));
      }
    }

    let goals: { id: string; title: string; weight: number }[] = [];
    if (positions && positions.length > 0) {
      const jobIds = positions
        .map((p: any) => p.positions?.job_id)
        .filter(Boolean);
      
      if (jobIds.length > 0) {
        const { data: jobGoals } = await supabase
          .from("job_goals")
          .select("id, goal_name, weighting")
          .in("job_id", jobIds)
          .is("end_date", null);
        
        goals = (jobGoals || []).map((g: any) => ({
          id: g.id,
          title: g.goal_name,
          weight: g.weighting || 0
        }));
      }
    }

    const newScores: AppraisalScore[] = [];

    (competencies || []).forEach((comp: any) => {
      newScores.push({
        item_id: comp.competency_id,
        item_name: compNames[comp.competency_id] || "Unknown",
        evaluation_type: "competency",
        weight: comp.weighting || 0,
        rating: null,
        weighted_score: null,
        comments: "",
      });
    });

    for (const resp of responsibilities) {
      const krasWithRatings = await fetchKRAsWithRatings(participantId, resp.id);
      const hasKRAs = krasWithRatings.length > 0;

      newScores.push({
        item_id: resp.id,
        item_name: resp.name,
        evaluation_type: "responsibility",
        weight: resp.weight || 0,
        rating: null,
        weighted_score: null,
        comments: "",
        hasKRAs,
        kras: hasKRAs ? krasWithRatings : undefined,
        kraRollupScore: hasKRAs ? calculateKRAScore(krasWithRatings) : undefined,
      });

      if (hasKRAs) {
        setExpandedResponsibilities(prev => new Set([...prev, resp.id]));
      }
    }

    (goals || []).forEach((goal: any) => {
      newScores.push({
        item_id: goal.id,
        item_name: goal.title,
        evaluation_type: "goal",
        weight: goal.weight || 0,
        rating: null,
        weighted_score: null,
        comments: "",
      });
    });

    setScores(newScores);
  };

  const calculateKRAScore = (kras: KRAWithRating[]): number => {
    let totalWeight = 0;
    let weightedSum = 0;

    kras.forEach(kra => {
      if (kra.rating?.final_score !== null && kra.rating?.final_score !== undefined) {
        weightedSum += kra.rating.final_score * kra.weight;
        totalWeight += kra.weight;
      }
    });

    if (totalWeight === 0) return 0;
    return Math.round((weightedSum / totalWeight) * 100) / 100;
  };

  const fetchExistingScores = async () => {
    const { data } = await supabase
      .from("appraisal_scores")
      .select("*")
      .eq("participant_id", participantId);

    if (data && data.length > 0) {
      setScores((prev) =>
        prev.map((score) => {
          const existing = data.find(
            (d) => d.item_id === score.item_id && d.evaluation_type === score.evaluation_type
          );
          if (existing) {
            return {
              ...score,
              id: existing.id,
              rating: existing.rating,
              weighted_score: existing.weighted_score,
              comments: existing.comments || "",
            };
          }
          return score;
        })
      );
    }
  };

  const handleRatingChange = (itemId: string, type: string, rating: number) => {
    setScores((prev) =>
      prev.map((score) => {
        if (score.item_id === itemId && score.evaluation_type === type) {
          const maxRating = cycleInfo?.max_rating || 5;
          const weightedScore = (rating / maxRating) * score.weight;
          return { ...score, rating, weighted_score: weightedScore };
        }
        return score;
      })
    );
  };

  const handleCommentChange = (itemId: string, type: string, comments: string) => {
    setScores((prev) =>
      prev.map((score) => {
        if (score.item_id === itemId && score.evaluation_type === type) {
          return { ...score, comments };
        }
        return score;
      })
    );
  };

  const handleKRASelfRating = useCallback(async (kraId: string, responsibilityId: string, rating: number, comments?: string) => {
    const { error } = await submitSelfRating(kraId, responsibilityId, rating, comments, participantId);
    if (error) {
      toast.error("Failed to save KRA rating");
      return;
    }

    const updatedKRAs = await fetchKRAsWithRatings(participantId, responsibilityId);
    const newRollupScore = calculateKRAScore(updatedKRAs);

    setScores(prev => prev.map(score => {
      if (score.item_id === responsibilityId && score.evaluation_type === 'responsibility') {
        return {
          ...score,
          kras: updatedKRAs,
          kraRollupScore: newRollupScore,
          rating: newRollupScore,
          weighted_score: (newRollupScore / (cycleInfo?.max_rating || 5)) * score.weight,
        };
      }
      return score;
    }));
  }, [participantId, cycleInfo, fetchKRAsWithRatings, submitSelfRating]);

  const handleKRAManagerRating = useCallback(async (kraId: string, responsibilityId: string, rating: number, comments?: string) => {
    if (!currentUserId) return;

    const { error } = await submitManagerRating(kraId, responsibilityId, currentUserId, rating, comments, participantId);
    if (error) {
      toast.error("Failed to save KRA rating");
      return;
    }

    const updatedKRAs = await fetchKRAsWithRatings(participantId, responsibilityId);
    const newRollupScore = calculateKRAScore(updatedKRAs);

    setScores(prev => prev.map(score => {
      if (score.item_id === responsibilityId && score.evaluation_type === 'responsibility') {
        return {
          ...score,
          kras: updatedKRAs,
          kraRollupScore: newRollupScore,
          rating: newRollupScore,
          weighted_score: (newRollupScore / (cycleInfo?.max_rating || 5)) * score.weight,
        };
      }
      return score;
    }));
  }, [participantId, currentUserId, cycleInfo, fetchKRAsWithRatings, submitManagerRating]);

  const handleSave = async (submit: boolean = false) => {
    setSaving(true);
    try {
      // Upsert scores
      for (const score of scores) {
        const finalRating = score.hasKRAs ? score.kraRollupScore : score.rating;
        
        if (finalRating !== null && finalRating !== undefined) {
          const payload = {
            participant_id: participantId,
            evaluation_type: score.evaluation_type,
            item_id: score.item_id,
            item_name: score.item_name,
            weight: score.weight,
            rating: finalRating,
            comments: score.comments || null,
          };

          if (score.id) {
            await supabase.from("appraisal_scores").update(payload).eq("id", score.id);
          } else {
            await supabase.from("appraisal_scores").insert(payload);
          }
        }
      }

      // Save position-level scores if multi-position
      if (hasMultiplePositions && multiPositions.length > 0 && multiPositionMode === "aggregate") {
        for (const position of multiPositions) {
          const positionItems = scores.filter(s => s.position_id === position.position_id);
          
          const calcTypeScore = (type: string) => {
            const typeItems = positionItems.filter(s => s.evaluation_type === type);
            const totalWeight = typeItems.reduce((sum, s) => sum + s.weight, 0);
            const totalWeighted = typeItems.reduce((sum, s) => sum + (s.weighted_score || 0), 0);
            return totalWeight > 0 ? (totalWeighted / totalWeight) * 100 : null;
          };
          
          const compScore = calcTypeScore("competency");
          const respScore = calcTypeScore("responsibility");
          const goalScore = calcTypeScore("goal");
          
          const overall = cycleInfo && compScore !== null && respScore !== null && goalScore !== null
            ? (compScore * cycleInfo.competency_weight +
               respScore * cycleInfo.responsibility_weight +
               goalScore * cycleInfo.goal_weight) / 100
            : null;
          
          await (supabase
            .from("appraisal_position_weights" as any)
            .update({
              competency_score: compScore,
              responsibility_score: respScore,
              goal_score: goalScore,
              overall_score: overall,
            })
            .eq("participant_id", participantId)
            .eq("position_id", position.position_id) as any);
        }
      }

      // Update participant status and comments
      const updatePayload: any = {
        final_comments: finalComments || null,
        status: submit ? "submitted" : "in_progress",
      };

      if (submit) {
        updatePayload.submitted_at = new Date().toISOString();
      }

      await supabase.from("appraisal_participants").update(updatePayload).eq("id", participantId);

      toast.success(submit ? "Evaluation submitted successfully" : "Progress saved");
      if (submit) {
        onOpenChange(false);
      }
      onSuccess();
    } catch (error: any) {
      console.error("Error saving:", error);
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const getScoresByType = (type: string) => {
    let typeScores = scores.filter((s) => s.evaluation_type === type);
    
    // Apply segment filter if set (for role changes)
    if (selectedFilterSegmentId && hasRoleChange) {
      typeScores = typeScores.filter((s) => s.segment_id === selectedFilterSegmentId);
    }
    
    // Apply position filter if set (for multi-position)
    if (selectedPositionId && hasMultiplePositions) {
      typeScores = typeScores.filter((s) => s.position_id === selectedPositionId);
    }
    
    return typeScores;
  };

  const getAllScoresByType = (type: string) => scores.filter((s) => s.evaluation_type === type);

  const calculateCategoryScore = (type: string) => {
    const typeScores = getAllScoresByType(type);
    return typeScores.reduce((sum, s) => sum + (s.weighted_score || 0), 0);
  };

  const calculateTotalWeight = (type: string) => {
    return getScoresByType(type).reduce((sum, s) => sum + s.weight, 0);
  };

  // Calculate segment-level scores for SegmentScoreSummary (role changes)
  const segmentScores = useMemo(() => {
    if (!hasRoleChange || roleSegments.length <= 1) return [];
    
    return roleSegments.map(segment => {
      const segmentItems = scores.filter(s => s.segment_id === segment.id);
      
      const calcTypeScore = (type: string) => {
        const typeItems = segmentItems.filter(s => s.evaluation_type === type);
        const totalWeight = typeItems.reduce((sum, s) => sum + s.weight, 0);
        const totalWeighted = typeItems.reduce((sum, s) => sum + (s.weighted_score || 0), 0);
        return totalWeight > 0 ? (totalWeighted / totalWeight) * 100 : 0;
      };
      
      const compScore = calcTypeScore("competency");
      const respScore = calcTypeScore("responsibility");
      const goalScore = calcTypeScore("goal");
      
      const overall = cycleInfo
        ? (compScore * cycleInfo.competency_weight +
           respScore * cycleInfo.responsibility_weight +
           goalScore * cycleInfo.goal_weight) / 100
        : 0;
      
      return {
        segmentId: segment.id,
        competency: compScore,
        responsibility: respScore,
        goal: goalScore,
        overall,
      };
    });
  }, [scores, roleSegments, hasRoleChange, cycleInfo]);

  // Calculate position-level scores for PositionScoreSummary (multi-position)
  const positionScores = useMemo(() => {
    if (!hasMultiplePositions || multiPositions.length <= 1) return [];
    
    return multiPositions.map(position => {
      const positionItems = scores.filter(s => s.position_id === position.position_id);
      
      const calcTypeScore = (type: string) => {
        const typeItems = positionItems.filter(s => s.evaluation_type === type);
        const totalWeight = typeItems.reduce((sum, s) => sum + s.weight, 0);
        const totalWeighted = typeItems.reduce((sum, s) => sum + (s.weighted_score || 0), 0);
        return totalWeight > 0 ? (totalWeighted / totalWeight) * 100 : 0;
      };
      
      const compScore = calcTypeScore("competency");
      const respScore = calcTypeScore("responsibility");
      const goalScore = calcTypeScore("goal");
      
      const overall = cycleInfo
        ? (compScore * cycleInfo.competency_weight +
           respScore * cycleInfo.responsibility_weight +
           goalScore * cycleInfo.goal_weight) / 100
        : 0;
      
      return {
        positionId: position.position_id,
        competency: compScore,
        responsibility: respScore,
        goal: goalScore,
        overall,
      };
    });
  }, [scores, multiPositions, hasMultiplePositions, cycleInfo]);

  const overallWeightedScore = useMemo(() => {
    if (!hasRoleChange || roleSegments.length <= 1) return 0;
    
    return roleSegments.reduce((sum, segment) => {
      const segScore = segmentScores.find(s => s.segmentId === segment.id);
      return sum + (segScore?.overall || 0) * (segment.contribution_percentage / 100);
    }, 0);
  }, [segmentScores, roleSegments, hasRoleChange]);

  // Calculate weighted overall for multi-position
  const positionWeightedScore = useMemo(() => {
    if (!hasMultiplePositions || multiPositions.length <= 1) return 0;
    
    return multiPositions.reduce((sum, position) => {
      const posScore = positionScores.find(s => s.positionId === position.position_id);
      return sum + (posScore?.overall || 0) * (position.weight_percentage / 100);
    }, 0);
  }, [positionScores, multiPositions, hasMultiplePositions]);

  const handleOverrideSuccess = () => {
    fetchData();
  };

  const handleWeightsSuccess = () => {
    refetchMultiPosition();
    fetchData();
  };

  const toggleResponsibilityExpanded = (itemId: string) => {
    setExpandedResponsibilities(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const renderResponsibilityItems = () => {
    const items = getScoresByType("responsibility");
    const totalWeight = calculateTotalWeight("responsibility");

    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No responsibilities assigned
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total weight: {totalWeight.toFixed(1)}%</span>
          <span className={totalWeight === 100 ? "text-success" : "text-warning"}>
            {totalWeight === 100 ? "✓ Valid" : "Should total 100%"}
          </span>
        </div>

        {items.map((item) => (
          <Card key={`responsibility-${item.item_id}`}>
            <Collapsible 
              open={expandedResponsibilities.has(item.item_id)}
              onOpenChange={() => toggleResponsibilityExpanded(item.item_id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{item.item_name}</CardTitle>
                      {item.segment_name && hasRoleChange && (
                        <Badge variant="outline" className="text-xs bg-info/10 text-info border-info/30">
                          {item.segment_name}
                        </Badge>
                      )}
                      {item.position_title && hasMultiplePositions && (
                        <Badge variant="outline" className="text-xs bg-accent/20 text-accent-foreground border-accent/40">
                          {item.position_title}
                        </Badge>
                      )}
                      {item.hasKRAs && (
                        <Badge variant="secondary" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          {item.kras?.length} KRAs
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.weight.toFixed(1)}% weight</Badge>
                      {item.hasKRAs && item.kraRollupScore !== undefined && (
                        <Badge variant="default" className="bg-green-600">
                          Score: {item.kraRollupScore.toFixed(2)}
                        </Badge>
                      )}
                      {expandedResponsibilities.has(item.item_id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  {item.hasKRAs && item.kras ? (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-muted-foreground">
                        Rate each Key Result Area individually:
                      </div>
                      {item.kras.map((kra) => (
                        <KRARatingCard
                          key={kra.id}
                          kra={kra}
                          isEmployee={isEmployee}
                          minRating={cycleInfo?.min_rating || 1}
                          maxRating={cycleInfo?.max_rating || 5}
                          onSelfRatingChange={(kraId, rating, comments) => 
                            handleKRASelfRating(kraId, item.item_id, rating, comments)
                          }
                          onManagerRatingChange={(kraId, rating, comments) => 
                            handleKRAManagerRating(kraId, item.item_id, rating, comments)
                          }
                        />
                      ))}
                      
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Responsibility Rollup Score</span>
                          <span className="text-xl font-bold text-primary">
                            {item.kraRollupScore?.toFixed(2) || '—'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Calculated from weighted average of KRA ratings
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Rating ({cycleInfo?.min_rating || 1} - {cycleInfo?.max_rating || 5})</Label>
                          <span className="text-lg font-semibold">
                            {item.rating !== null ? item.rating : "-"}
                          </span>
                        </div>
                        <Slider
                          value={[item.rating || cycleInfo?.min_rating || 1]}
                          min={cycleInfo?.min_rating || 1}
                          max={cycleInfo?.max_rating || 5}
                          step={0.5}
                          onValueChange={([value]) =>
                            handleRatingChange(item.item_id, item.evaluation_type, value)
                          }
                        />
                        {item.weighted_score !== null && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Weighted score: {item.weighted_score.toFixed(1)}%
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`comments-${item.item_id}`}>Comments</Label>
                        <Textarea
                          id={`comments-${item.item_id}`}
                          value={item.comments}
                          onChange={(e) =>
                            handleCommentChange(item.item_id, item.evaluation_type, e.target.value)
                          }
                          placeholder="Add feedback comments..."
                          rows={2}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    );
  };

  const renderScoreItems = (type: "competency" | "goal") => {
    const items = getScoresByType(type);
    const totalWeight = calculateTotalWeight(type);

    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No {type === "competency" ? "competencies" : "goals"} assigned
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total weight: {totalWeight.toFixed(1)}%</span>
          <span className={totalWeight === 100 ? "text-success" : "text-warning"}>
            {totalWeight === 100 ? "✓ Valid" : "Should total 100%"}
          </span>
        </div>

        {items.map((item) => (
          <Card key={`${item.evaluation_type}-${item.item_id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{item.item_name}</CardTitle>
                  {item.segment_name && hasRoleChange && (
                    <Badge variant="secondary" className="text-xs">
                      {item.segment_name}
                    </Badge>
                  )}
                  {item.position_title && hasMultiplePositions && (
                    <Badge variant="outline" className="text-xs bg-accent/20 text-accent-foreground border-accent/40">
                      {item.position_title}
                    </Badge>
                  )}
                </div>
                <Badge variant="outline">{item.weight.toFixed(1)}% weight</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Rating ({cycleInfo?.min_rating || 1} - {cycleInfo?.max_rating || 5})</Label>
                  <span className="text-lg font-semibold">
                    {item.rating !== null ? item.rating : "-"}
                  </span>
                </div>
                <Slider
                  value={[item.rating || cycleInfo?.min_rating || 1]}
                  min={cycleInfo?.min_rating || 1}
                  max={cycleInfo?.max_rating || 5}
                  step={0.5}
                  onValueChange={([value]) =>
                    handleRatingChange(item.item_id, item.evaluation_type, value)
                  }
                />
                {item.weighted_score !== null && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Weighted score: {item.weighted_score.toFixed(1)}%
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor={`comments-${item.item_id}`}>Comments</Label>
                <Textarea
                  id={`comments-${item.item_id}`}
                  value={item.comments}
                  onChange={(e) =>
                    handleCommentChange(item.item_id, item.evaluation_type, e.target.value)
                  }
                  placeholder="Add feedback comments..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading || multiPositionLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const compScore = calculateCategoryScore("competency");
  const respScore = calculateCategoryScore("responsibility");
  const goalScore = calculateCategoryScore("goal");
  const overallScore =
    cycleInfo
      ? (compScore * cycleInfo.competency_weight +
          respScore * cycleInfo.responsibility_weight +
          goalScore * cycleInfo.goal_weight) /
        100
      : 0;

  // Determine which overall score to display
  const displayOverallScore = hasMultiplePositions && multiPositions.length > 1
    ? positionWeightedScore
    : hasRoleChange && roleSegments.length > 1
      ? overallWeightedScore
      : overallScore;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEmployee ? "Self-Evaluation" : "Evaluate"}: {employeeName}
            {hasRoleChange && (
              <Badge variant="secondary" className="ml-2">
                <GitBranch className="h-3 w-3 mr-1" />
                Role Changed
              </Badge>
            )}
            {hasMultiplePositions && multiPositions.length > 1 && (
              <Badge variant="outline" className="ml-2 bg-accent/20">
                <Users className="h-3 w-3 mr-1" />
                {multiPositions.length} Positions
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Role Segment Timeline - show if employee had role changes */}
          {hasRoleChange && roleSegments.length > 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <RoleSegmentTimeline
                  segments={roleSegments}
                  activeSegmentId={activeSegmentId}
                  onSegmentClick={setActiveSegmentId}
                />
                {!isEmployee && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOverrideDialogOpen(true)}
                  >
                    <Settings2 className="h-4 w-4 mr-2" />
                    Adjust Weights
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Multi-Position Info Banner */}
          {hasMultiplePositions && multiPositions.length > 1 && (
            <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/30">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent-foreground" />
                <span className="text-sm">
                  This employee holds <strong>{multiPositions.length} concurrent positions</strong>. 
                  Scores are {multiPositionMode === "aggregate" ? "aggregated by weighted average" : "tracked separately"}.
                </span>
              </div>
              {!isEmployee && multiPositionMode === "aggregate" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWeightsDialogOpen(true)}
                >
                  <Settings2 className="h-4 w-4 mr-2" />
                  Configure Weights
                </Button>
              )}
            </div>
          )}

          {/* Segment-Level Score Summary - for multi-role employees */}
          {hasRoleChange && roleSegments.length > 1 && cycleInfo && (
            <SegmentScoreSummary
              segments={roleSegments}
              segmentScores={segmentScores}
              cycleWeights={{
                competency_weight: cycleInfo.competency_weight,
                responsibility_weight: cycleInfo.responsibility_weight,
                goal_weight: cycleInfo.goal_weight,
              }}
              overallWeightedScore={overallWeightedScore}
            />
          )}

          {/* Position-Level Score Summary - for multi-position employees */}
          {hasMultiplePositions && multiPositions.length > 1 && cycleInfo && (
            <PositionScoreSummary
              positions={multiPositions}
              positionScores={positionScores}
              cycleWeights={{
                competency_weight: cycleInfo.competency_weight,
                responsibility_weight: cycleInfo.responsibility_weight,
                goal_weight: cycleInfo.goal_weight,
              }}
              overallWeightedScore={positionWeightedScore}
              mode={multiPositionMode}
            />
          )}

          {/* Job Level Expectations Panel - show during evaluation */}
          {cycleInfo && !levelExpectationsLoading && (
            <JobLevelExpectationsPanel
              expectation={levelExpectation}
              employeeInfo={levelEmployeeInfo}
              gapAnalysis={gapAnalysis}
              currentScores={{
                competencyScore: currentCompetencyScore,
                goalScore: currentGoalScore,
              }}
              maxRating={cycleInfo.max_rating}
            />
          )}

          {/* Score Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Competency</p>
                <p className="text-xl font-bold">{compScore.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  Weight: {cycleInfo?.competency_weight}%
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Responsibility</p>
                <p className="text-xl font-bold">{respScore.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  Weight: {cycleInfo?.responsibility_weight}%
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Goals</p>
                <p className="text-xl font-bold">{goalScore.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  Weight: {cycleInfo?.goal_weight}%
                </p>
              </CardContent>
            </Card>
            <Card className="bg-primary/10">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Overall</p>
                <p className="text-2xl font-bold text-primary">{displayOverallScore.toFixed(1)}%</p>
                {(hasMultiplePositions && multiPositions.length > 1) && (
                  <p className="text-xs text-muted-foreground">Weighted Average</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabs for evaluation categories */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="competencies" className="gap-2">
                <Award className="h-4 w-4" />
                Competencies
              </TabsTrigger>
              <TabsTrigger value="responsibilities" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Responsibilities
              </TabsTrigger>
              <TabsTrigger value="goals" className="gap-2">
                <Target className="h-4 w-4" />
                Goals
              </TabsTrigger>
            </TabsList>

            {/* Segment Filter Tabs - show for multi-role employees */}
            {hasRoleChange && roleSegments.length > 1 && (
              <div className="mt-3">
                <SegmentFilterTabs
                  segments={roleSegments}
                  selectedSegmentId={selectedFilterSegmentId}
                  onSegmentChange={setSelectedFilterSegmentId}
                />
              </div>
            )}

            {/* Position Filter Tabs - show for multi-position employees */}
            {hasMultiplePositions && multiPositions.length > 1 && (
              <div className="mt-3">
                <PositionFilterTabs
                  positions={multiPositions}
                  selectedPositionId={selectedPositionId}
                  onPositionChange={setSelectedPositionId}
                />
              </div>
            )}

            <TabsContent value="competencies" className="mt-4">
              {renderScoreItems("competency")}
            </TabsContent>

            <TabsContent value="responsibilities" className="mt-4">
              {renderResponsibilityItems()}
            </TabsContent>

            <TabsContent value="goals" className="mt-4">
              {renderScoreItems("goal")}
            </TabsContent>
          </Tabs>

          {/* Final Comments */}
          <div>
            <Label htmlFor="final_comments">Overall Comments & Recommendations</Label>
            <Textarea
              id="final_comments"
              value={finalComments}
              onChange={(e) => setFinalComments(e.target.value)}
              placeholder="Provide overall feedback and development recommendations..."
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              Save Progress
            </Button>
            <Button onClick={() => handleSave(true)} disabled={saving}>
              <Send className="mr-2 h-4 w-4" />
              Submit Evaluation
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Segment Override Dialog */}
      <SegmentOverrideDialog
        open={overrideDialogOpen}
        onOpenChange={setOverrideDialogOpen}
        participantId={participantId}
        segments={roleSegments}
        onSuccess={handleOverrideSuccess}
      />

      {/* Multi-Position Weights Manager */}
      <MultiPositionWeightsManager
        open={weightsDialogOpen}
        onOpenChange={setWeightsDialogOpen}
        participantId={participantId}
        employeeName={employeeName}
        onSuccess={handleWeightsSuccess}
      />
    </Dialog>
  );
}
