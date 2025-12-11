import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, TrendingDown, ThumbsUp, MessageSquare, Loader2 } from "lucide-react";

export function SatisfactionAnalytics() {
  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ["satisfaction-surveys-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_satisfaction_surveys")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Calculate metrics
  const totalSurveys = surveys.length;
  const avgOverall = totalSurveys > 0
    ? surveys.reduce((sum, s) => sum + s.rating, 0) / totalSurveys
    : 0;
  const avgResponseTime = surveys.filter(s => s.response_time_rating).length > 0
    ? surveys.filter(s => s.response_time_rating).reduce((sum, s) => sum + (s.response_time_rating || 0), 0) / surveys.filter(s => s.response_time_rating).length
    : 0;
  const avgResolution = surveys.filter(s => s.resolution_rating).length > 0
    ? surveys.filter(s => s.resolution_rating).reduce((sum, s) => sum + (s.resolution_rating || 0), 0) / surveys.filter(s => s.resolution_rating).length
    : 0;
  const avgAgent = surveys.filter(s => s.agent_rating).length > 0
    ? surveys.filter(s => s.agent_rating).reduce((sum, s) => sum + (s.agent_rating || 0), 0) / surveys.filter(s => s.agent_rating).length
    : 0;
  
  const recommendCount = surveys.filter(s => s.would_recommend === true).length;
  const notRecommendCount = surveys.filter(s => s.would_recommend === false).length;
  const npsResponses = recommendCount + notRecommendCount;
  const npsScore = npsResponses > 0 ? Math.round(((recommendCount - notRecommendCount) / npsResponses) * 100) : 0;

  // Rating distribution
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating,
    count: surveys.filter(s => s.rating === rating).length,
    percentage: totalSurveys > 0 ? (surveys.filter(s => s.rating === rating).length / totalSurveys) * 100 : 0,
  }));

  // Recent feedback with comments
  const recentFeedback = surveys
    .filter(s => s.feedback)
    .slice(0, 5);

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getNpsColor = (score: number) => {
    if (score >= 50) return "text-green-600";
    if (score >= 0) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${getScoreColor(avgOverall)}`}>
                  {avgOverall.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Avg. Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSurveys}</p>
                <p className="text-xs text-muted-foreground">Total Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <ThumbsUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${getNpsColor(npsScore)}`}>
                  {npsScore > 0 ? "+" : ""}{npsScore}
                </p>
                <p className="text-xs text-muted-foreground">NPS Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                {avgOverall >= 4 ? (
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-purple-600" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalSurveys > 0 ? Math.round((surveys.filter(s => s.rating >= 4).length / totalSurveys) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Satisfaction Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rating Distribution</CardTitle>
            <CardDescription>Breakdown of customer ratings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ratingDistribution.reverse().map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <Progress value={percentage} className="h-2" />
                </div>
                <span className="text-sm text-muted-foreground w-16 text-right">
                  {count} ({percentage.toFixed(0)}%)
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Category Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Breakdown</CardTitle>
            <CardDescription>Average scores by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Response Time</span>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(avgResponseTime)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-sm font-medium ${getScoreColor(avgResponseTime)}`}>
                  {avgResponseTime.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Resolution Quality</span>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(avgResolution)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-sm font-medium ${getScoreColor(avgResolution)}`}>
                  {avgResolution.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Agent Helpfulness</span>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(avgAgent)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-sm font-medium ${getScoreColor(avgAgent)}`}>
                  {avgAgent.toFixed(1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback */}
      {recentFeedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Feedback</CardTitle>
            <CardDescription>Latest comments from customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentFeedback.map((survey) => (
              <div key={survey.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= survey.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(survey.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{survey.feedback}</p>
                {survey.would_recommend !== null && (
                  <Badge
                    variant="outline"
                    className={`mt-2 ${
                      survey.would_recommend
                        ? "bg-green-500/10 text-green-600"
                        : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    {survey.would_recommend ? "Would recommend" : "Would not recommend"}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
