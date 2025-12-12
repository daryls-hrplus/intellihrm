import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Star, Users, MessageSquare, TrendingUp, AlertTriangle } from "lucide-react";

interface Review360FeedbackAnalyticsProps {
  cycleIds: string[];
  compact?: boolean;
}

interface FeedbackStats {
  totalResponses: number;
  avgRating: number;
  responsesByType: Record<string, { count: number; avgRating: number }>;
  ratingDistribution: { rating: number; count: number }[];
  competencyScores: { name: string; avgRating: number; responseCount: number }[];
  questionScores: { question: string; avgRating: number; responseCount: number }[];
}

const REVIEWER_TYPE_COLORS: Record<string, string> = {
  self: "hsl(var(--primary))",
  manager: "hsl(var(--info))",
  peer: "hsl(var(--success))",
  direct_report: "hsl(var(--warning))",
};

const RATING_COLORS = [
  "hsl(var(--destructive))",
  "hsl(var(--warning))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--info))",
  "hsl(var(--success))",
];

export function Review360FeedbackAnalytics({
  cycleIds,
  compact = false,
}: Review360FeedbackAnalyticsProps) {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cycleIds.length > 0) {
      fetchFeedbackStats();
    } else {
      setLoading(false);
    }
  }, [cycleIds]);

  const fetchFeedbackStats = async () => {
    setLoading(true);
    try {
      // Get all participants for these cycles
      const { data: participants } = await supabase
        .from("review_participants")
        .select("id")
        .in("review_cycle_id", cycleIds);

      if (!participants?.length) {
        setStats(null);
        setLoading(false);
        return;
      }

      const participantIds = participants.map(p => p.id);

      // Get all feedback submissions
      const { data: submissions } = await supabase
        .from("feedback_submissions")
        .select(`
          id,
          reviewer_type,
          status,
          review_participant_id
        `)
        .in("review_participant_id", participantIds)
        .eq("status", "submitted");

      if (!submissions?.length) {
        setStats({
          totalResponses: 0,
          avgRating: 0,
          responsesByType: {},
          ratingDistribution: [],
          competencyScores: [],
          questionScores: [],
        });
        setLoading(false);
        return;
      }

      const submissionIds = submissions.map(s => s.id);

      // Get all feedback responses with ratings
      const { data: responses } = await supabase
        .from("feedback_responses")
        .select(`
          id,
          rating_value,
          feedback_submission_id,
          question_id
        `)
        .in("feedback_submission_id", submissionIds)
        .not("rating_value", "is", null);

      // Get questions with competencies
      const { data: questions } = await supabase
        .from("review_questions")
        .select(`
          id,
          question_text,
          competency_id,
          competency:competencies(name)
        `)
        .in("review_cycle_id", cycleIds);

      // Calculate stats
      const responsesByType: Record<string, { count: number; totalRating: number }> = {};
      const ratingCounts: Record<number, number> = {};
      const competencyRatings: Record<string, { name: string; totalRating: number; count: number }> = {};
      const questionRatings: Record<string, { question: string; totalRating: number; count: number }> = {};

      let totalRating = 0;
      let ratingCount = 0;

      // Create lookup maps
      const submissionLookup = new Map(submissions.map(s => [s.id, s]));
      const questionLookup = new Map(questions?.map(q => [q.id, q]) || []);

      responses?.forEach(response => {
        if (response.rating_value === null) return;

        const submission = submissionLookup.get(response.feedback_submission_id);
        const question = questionLookup.get(response.question_id);

        if (!submission) return;

        // Overall rating
        totalRating += response.rating_value;
        ratingCount++;

        // Rating distribution
        ratingCounts[response.rating_value] = (ratingCounts[response.rating_value] || 0) + 1;

        // By reviewer type
        if (!responsesByType[submission.reviewer_type]) {
          responsesByType[submission.reviewer_type] = { count: 0, totalRating: 0 };
        }
        responsesByType[submission.reviewer_type].count++;
        responsesByType[submission.reviewer_type].totalRating += response.rating_value;

        // By competency
        if (question?.competency_id && question.competency) {
          const compName = (question.competency as any).name;
          if (!competencyRatings[question.competency_id]) {
            competencyRatings[question.competency_id] = { name: compName, totalRating: 0, count: 0 };
          }
          competencyRatings[question.competency_id].totalRating += response.rating_value;
          competencyRatings[question.competency_id].count++;
        }

        // By question
        if (question) {
          if (!questionRatings[question.id]) {
            questionRatings[question.id] = { 
              question: question.question_text.substring(0, 50) + (question.question_text.length > 50 ? "..." : ""), 
              totalRating: 0, 
              count: 0 
            };
          }
          questionRatings[question.id].totalRating += response.rating_value;
          questionRatings[question.id].count++;
        }
      });

      setStats({
        totalResponses: ratingCount,
        avgRating: ratingCount > 0 ? totalRating / ratingCount : 0,
        responsesByType: Object.fromEntries(
          Object.entries(responsesByType).map(([type, data]) => [
            type,
            { count: data.count, avgRating: data.totalRating / data.count }
          ])
        ),
        ratingDistribution: [1, 2, 3, 4, 5].map(rating => ({
          rating,
          count: ratingCounts[rating] || 0,
        })),
        competencyScores: Object.values(competencyRatings)
          .map(c => ({ name: c.name, avgRating: c.totalRating / c.count, responseCount: c.count }))
          .sort((a, b) => b.avgRating - a.avgRating),
        questionScores: Object.values(questionRatings)
          .map(q => ({ question: q.question, avgRating: q.totalRating / q.count, responseCount: q.count }))
          .sort((a, b) => b.avgRating - a.avgRating),
      });
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats || stats.totalResponses === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No feedback responses yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Analytics will appear once feedback is submitted
          </p>
        </CardContent>
      </Card>
    );
  }

  const reviewerTypeData = Object.entries(stats.responsesByType).map(([type, data]) => ({
    name: type.replace("_", " ").charAt(0).toUpperCase() + type.replace("_", " ").slice(1),
    value: data.count,
    avgRating: data.avgRating,
    color: REVIEWER_TYPE_COLORS[type] || "hsl(var(--muted-foreground))",
  }));

  const chartHeight = compact ? 100 : 140;

  // Prepare radar data for competencies
  const radarData = stats.competencyScores.slice(0, 8).map(c => ({
    competency: c.name.length > 15 ? c.name.substring(0, 15) + "..." : c.name,
    score: c.avgRating,
    fullMark: 5,
  }));

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className={`grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-4"}`}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-warning" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                {stats.avgRating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">/ 5</span>
            </div>
            <Progress value={(stats.avgRating / 5) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-info" />
              Total Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalResponses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all questions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Top Competency
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.competencyScores.length > 0 ? (
              <>
                <div className="text-lg font-bold truncate">
                  {stats.competencyScores[0].name}
                </div>
                <p className="text-sm text-success">
                  {stats.competencyScores[0].avgRating.toFixed(1)} avg rating
                </p>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">No competency data</p>
            )}
          </CardContent>
        </Card>

        {!compact && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.competencyScores.length > 0 ? (
                <>
                  <div className="text-lg font-bold truncate">
                    {stats.competencyScores[stats.competencyScores.length - 1].name}
                  </div>
                  <p className="text-sm text-warning">
                    {stats.competencyScores[stats.competencyScores.length - 1].avgRating.toFixed(1)} avg rating
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">No data</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts */}
      <div className={`grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {/* Rating Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.ratingDistribution} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="rating" 
                    type="category" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}★`}
                    width={35}
                  />
                  <Tooltip
                    formatter={(value: number) => [value, "Responses"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[0, 4, 4, 0]}
                  >
                    {stats.ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RATING_COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* By Reviewer Type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">By Reviewer Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reviewerTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={compact ? 25 : 30}
                    outerRadius={compact ? 40 : 55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {reviewerTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                      `${value} responses (${props.payload.avgRating.toFixed(1)} avg)`,
                      props.payload.name
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {reviewerTypeData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Competency Radar */}
        {!compact && radarData.length > 2 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Competency Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="competency" tick={{ fontSize: 9 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 8 }} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                    <Tooltip
                      formatter={(value: number) => [value.toFixed(1), "Score"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Competency Breakdown */}
      {!compact && stats.competencyScores.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Competency Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.competencyScores.map((comp, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{comp.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {comp.responseCount} responses
                      </Badge>
                      <span className="font-bold">{comp.avgRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <Progress 
                    value={(comp.avgRating / 5) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
