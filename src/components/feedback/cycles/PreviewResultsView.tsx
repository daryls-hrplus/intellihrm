import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  EyeOff,
  Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VisibilityRules } from "./CycleVisibilityRulesEditor";
import { RolePerspective } from "./RolePerspectiveSelector";

interface PreviewResultsViewProps {
  participantId: string;
  participantName: string;
  cycleId: string;
  visibilityRules: VisibilityRules;
  role: RolePerspective;
}

interface FeedbackData {
  overall_score: number;
  category_scores: {
    category: string;
    score: number;
    response_count: number;
  }[];
  comments: {
    reviewer_type: string;
    comment: string;
  }[];
  response_count: number;
}

export function PreviewResultsView({
  participantId,
  participantName,
  cycleId,
  visibilityRules,
  role,
}: PreviewResultsViewProps) {
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);

  const getRoleConfig = () => {
    switch (role) {
      case "employee":
        return visibilityRules.employee_access;
      case "manager":
        return visibilityRules.manager_access;
      case "hr":
        return visibilityRules.hr_access;
    }
  };

  const config = getRoleConfig();

  useEffect(() => {
    fetchFeedbackData();
  }, [participantId, cycleId]);

  const fetchFeedbackData = async () => {
    setLoading(true);
    try {
      // Fetch feedback submissions for this participant
      const { data: submissions, error } = await supabase
        .from("feedback_submissions")
        .select(`
          id,
          reviewer_type,
          status
        `)
        .eq("review_participant_id", participantId)
        .eq("status", "submitted");

      if (error) throw error;

      if (!submissions || submissions.length === 0) {
        setFeedbackData({
          overall_score: 0,
          category_scores: [],
          comments: [],
          response_count: 0,
        });
        return;
      }

      // Fetch responses for each submission
      const submissionIds = submissions.map((s) => s.id);
      const { data: responses, error: respError } = await supabase
        .from("feedback_responses")
        .select("feedback_submission_id, rating_value, text_value")
        .in("feedback_submission_id", submissionIds);

      if (respError) throw respError;

      // Calculate overall score
      let totalScore = 0;
      let scoreCount = 0;
      const allComments: { reviewer_type: string; comment: string }[] = [];

      // Group responses by submission
      const responsesBySubmission = new Map<string, typeof responses>();
      (responses || []).forEach((r) => {
        if (!responsesBySubmission.has(r.feedback_submission_id)) {
          responsesBySubmission.set(r.feedback_submission_id, []);
        }
        responsesBySubmission.get(r.feedback_submission_id)!.push(r);
      });

      submissions.forEach((sub) => {
        const subResponses = responsesBySubmission.get(sub.id) || [];
        
        subResponses.forEach((r) => {
          if (r.rating_value !== null) {
            totalScore += r.rating_value;
            scoreCount++;
          }
          if (r.text_value) {
            allComments.push({
              reviewer_type: sub.reviewer_type,
              comment: r.text_value,
            });
          }
        });
      });

      setFeedbackData({
        overall_score: scoreCount > 0 ? totalScore / scoreCount : 0,
        category_scores: [],
        comments: allComments,
        response_count: submissions.length,
      });
    } catch (error) {
      console.error("Error fetching feedback data:", error);
      setFeedbackData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!config.enabled) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-12 text-center">
          <EyeOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            Access Disabled
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            This role does not have access to view 360 results
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!feedbackData || feedbackData.response_count === 0) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            No Feedback Available
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            No feedback has been submitted for this participant yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const HiddenPlaceholder = ({ label }: { label: string }) => (
    <div className="flex items-center gap-2 text-muted-foreground p-4 bg-muted/30 rounded-lg border-dashed border">
      <Lock className="h-4 w-4" />
      <span className="text-sm">{label} - Hidden for this role</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overall Score
            </CardTitle>
            <Badge variant="outline">{feedbackData.response_count} responses</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {config.show_scores ? (
            <div className="space-y-2">
              <div className="text-3xl font-bold">
                {feedbackData.overall_score.toFixed(1)} <span className="text-lg text-muted-foreground">/ 5.0</span>
              </div>
              <Progress value={(feedbackData.overall_score / 5) * 100} className="h-2" />
            </div>
          ) : (
            <HiddenPlaceholder label="Scores" />
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {config.show_reviewer_breakdown ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Score by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {config.show_scores ? (
              <div className="space-y-3">
                {feedbackData.category_scores.length > 0 ? (
                  feedbackData.category_scores.map((cat, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{cat.category.replace(/_/g, " ")}</span>
                        <span className="font-medium">{cat.score.toFixed(1)}</span>
                      </div>
                      <Progress value={(cat.score / 5) * 100} className="h-1.5" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No category scores available</p>
                )}
              </div>
            ) : (
              <HiddenPlaceholder label="Category scores" />
            )}
          </CardContent>
        </Card>
      ) : (
        <HiddenPlaceholder label="Reviewer breakdown" />
      )}

      {/* Comments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Feedback Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {config.show_comments ? (
            <div className="space-y-3">
              {feedbackData.comments.length > 0 ? (
                feedbackData.comments.slice(0, 5).map((item, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg">
                    {config.show_reviewer_breakdown && (
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {item.reviewer_type}
                      </Badge>
                    )}
                    <p className="text-sm">{item.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No comments available</p>
              )}
              {feedbackData.comments.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{feedbackData.comments.length - 5} more comments
                </p>
              )}
            </div>
          ) : (
            <HiddenPlaceholder label="Comments" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
