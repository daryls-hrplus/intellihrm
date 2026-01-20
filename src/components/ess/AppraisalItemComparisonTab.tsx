import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Target,
  Users,
  Briefcase,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface AppraisalItemComparisonTabProps {
  participantId: string;
}

interface ScoreItem {
  id: string;
  item_id: string;
  item_name: string;
  evaluation_type: "goal" | "competency" | "responsibility" | "values";
  weight: number;
  rating: number | null;
  comments: string | null;
  self_rating: number | null;
  self_comments: string | null;
  evidenceCount?: number;
}

export function AppraisalItemComparisonTab({ participantId }: AppraisalItemComparisonTabProps) {
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [activeType, setActiveType] = useState<"goal" | "competency" | "responsibility">("goal");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchScores();
  }, [participantId]);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("appraisal_scores")
        .select("*")
        .eq("participant_id", participantId);

      if (error) throw error;

      // Fetch evidence counts for each score
      const scoresWithEvidence = await Promise.all(
        (data || []).map(async (score) => {
          const { count } = await supabase
            .from("performance_evidence")
            .select("*", { count: "exact", head: true })
            .eq("score_item_id", score.id);

          return {
            ...score,
            evidenceCount: count || 0,
          };
        })
      );

      setScores(scoresWithEvidence as ScoreItem[]);
    } catch (error) {
      console.error("Error fetching scores:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getScoresByType = (type: string) => scores.filter((s) => s.evaluation_type === type);

  const getGap = (selfRating: number | null, managerRating: number | null) => {
    if (selfRating === null || managerRating === null) return null;
    return selfRating - managerRating;
  };

  const getGapIndicator = (gap: number | null) => {
    if (gap === null) return { icon: Minus, color: "text-muted-foreground", label: "N/A" };
    if (Math.abs(gap) < 0.5) return { icon: Minus, color: "text-muted-foreground", label: "Aligned" };
    if (gap > 0)
      return {
        icon: TrendingUp,
        color: Math.abs(gap) >= 1.5 ? "text-amber-600" : "text-amber-500",
        label: `+${gap.toFixed(1)} higher`,
      };
    return {
      icon: TrendingDown,
      color: Math.abs(gap) >= 1.5 ? "text-blue-600" : "text-blue-500",
      label: `${gap.toFixed(1)} lower`,
    };
  };

  const getRatingColor = (rating: number | null) => {
    if (rating === null) return "text-muted-foreground";
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-blue-600";
    if (rating >= 2) return "text-amber-600";
    return "text-red-600";
  };

  const renderScoreItem = (item: ScoreItem) => {
    const gap = getGap(item.self_rating, item.rating);
    const gapInfo = getGapIndicator(gap);
    const GapIcon = gapInfo.icon;
    const isExpanded = expandedItems.has(item.id);
    const hasSignificantGap = gap !== null && Math.abs(gap) >= 1.5;

    return (
      <Card
        key={item.id}
        className={cn(
          "transition-all",
          hasSignificantGap && "border-amber-300 dark:border-amber-700"
        )}
      >
        <Collapsible open={isExpanded} onOpenChange={() => toggleItem(item.id)}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{item.item_name}</CardTitle>
                  <Badge variant="outline" className="shrink-0">
                    {item.weight}%
                  </Badge>
                  {hasSignificantGap && (
                    <Badge variant="destructive" className="shrink-0">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Gap
                    </Badge>
                  )}
                  {item.evidenceCount && item.evidenceCount > 0 && (
                    <Badge variant="secondary" className="shrink-0">
                      <Paperclip className="h-3 w-3 mr-1" />
                      {item.evidenceCount}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">You:</span>
                      <span className={cn("font-semibold", getRatingColor(item.self_rating))}>
                        {item.self_rating?.toFixed(1) || "—"}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-sm text-muted-foreground">Manager:</span>
                      <span className={cn("font-semibold", getRatingColor(item.rating))}>
                        {item.rating?.toFixed(1) || "—"}
                      </span>
                    </div>
                    {gap !== null && (
                      <div className={cn("flex items-center justify-end gap-1 text-xs", gapInfo.color)}>
                        <GapIcon className="h-3 w-3" />
                        {gapInfo.label}
                      </div>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0 border-t">
              <div className="grid grid-cols-2 gap-4 pt-4">
                {/* Self-Assessment */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Your Self-Assessment
                  </h4>
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rating</span>
                      <span className={cn("text-xl font-bold", getRatingColor(item.self_rating))}>
                        {item.self_rating?.toFixed(1) || "Not rated"}
                      </span>
                    </div>
                    {item.self_rating !== null && (
                      <Progress value={(item.self_rating / 5) * 100} className="h-2" />
                    )}
                    {item.self_comments && (
                      <div className="pt-2 border-t mt-2">
                        <p className="text-sm text-muted-foreground flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                          <span className="italic">{item.self_comments}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Manager Rating */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-purple-500" />
                    Manager's Evaluation
                  </h4>
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rating</span>
                      <span className={cn("text-xl font-bold", getRatingColor(item.rating))}>
                        {item.rating?.toFixed(1) || "Not rated"}
                      </span>
                    </div>
                    {item.rating !== null && (
                      <Progress value={(item.rating / 5) * 100} className="h-2" />
                    )}
                    {item.comments && (
                      <div className="pt-2 border-t mt-2">
                        <p className="text-sm text-muted-foreground flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                          <span className="italic">{item.comments}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Gap Analysis */}
              {gap !== null && Math.abs(gap) >= 0.5 && (
                <div
                  className={cn(
                    "mt-4 p-3 rounded-lg",
                    hasSignificantGap
                      ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                      : "bg-accent/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <GapIcon className={cn("h-4 w-4", gapInfo.color)} />
                    <span className="font-medium text-sm">
                      {hasSignificantGap ? "Significant Rating Gap" : "Minor Rating Difference"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {gap > 0
                      ? "Your self-assessment was higher than your manager's evaluation. Consider discussing this during your review meeting."
                      : "Your self-assessment was lower than your manager's evaluation. Your manager recognizes more of your contributions."}
                  </p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "goal":
        return <Target className="h-4 w-4" />;
      case "competency":
        return <Users className="h-4 w-4" />;
      case "responsibility":
        return <Briefcase className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeStats = (type: string) => {
    const typeScores = getScoresByType(type);
    const withGaps = typeScores.filter((s) => {
      const gap = getGap(s.self_rating, s.rating);
      return gap !== null && Math.abs(gap) >= 1.5;
    });
    return { total: typeScores.length, gaps: withGaps.length };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading item details...
        </CardContent>
      </Card>
    );
  }

  const goalStats = getTypeStats("goal");
  const compStats = getTypeStats("competency");
  const respStats = getTypeStats("responsibility");

  return (
    <div className="space-y-4">
      <Tabs value={activeType} onValueChange={(v) => setActiveType(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goal" className="gap-2">
            <Target className="h-4 w-4" />
            Goals
            {goalStats.gaps > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {goalStats.gaps}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="competency" className="gap-2">
            <Users className="h-4 w-4" />
            Competencies
            {compStats.gaps > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {compStats.gaps}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="responsibility" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Responsibilities
            {respStats.gaps > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {respStats.gaps}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goal" className="space-y-3 mt-4">
          <ScrollArea className="max-h-[500px]">
            {getScoresByType("goal").length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No goals were evaluated in this appraisal</p>
              </div>
            ) : (
              <div className="space-y-3 pr-4">
                {getScoresByType("goal").map(renderScoreItem)}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="competency" className="space-y-3 mt-4">
          <ScrollArea className="max-h-[500px]">
            {getScoresByType("competency").length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No competencies were evaluated in this appraisal</p>
              </div>
            ) : (
              <div className="space-y-3 pr-4">
                {getScoresByType("competency").map(renderScoreItem)}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="responsibility" className="space-y-3 mt-4">
          <ScrollArea className="max-h-[500px]">
            {getScoresByType("responsibility").length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No responsibilities were evaluated in this appraisal</p>
              </div>
            ) : (
              <div className="space-y-3 pr-4">
                {getScoresByType("responsibility").map(renderScoreItem)}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
