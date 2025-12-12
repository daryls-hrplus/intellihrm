import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Star, TrendingUp, Users, User, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Participation {
  id: string;
  status: string;
  overall_score: number | null;
  review_cycle: {
    name: string;
    status: string;
  };
}

interface FeedbackItem {
  question_id: string;
  question_text: string;
  competency_name: string | null;
  reviewer_type: string;
  avg_rating: number | null;
  response_count: number;
  text_responses: string[] | null;
}

interface MyFeedbackSummaryProps {
  participations: Participation[];
}

const reviewerTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  self: { label: "Self", icon: <User className="h-4 w-4" /> },
  manager: { label: "Manager", icon: <UserCircle className="h-4 w-4" /> },
  peer: { label: "Peers", icon: <Users className="h-4 w-4" /> },
  direct_report: { label: "Direct Reports", icon: <TrendingUp className="h-4 w-4" /> },
};

export function MyFeedbackSummary({ participations }: MyFeedbackSummaryProps) {
  const [selectedParticipation, setSelectedParticipation] = useState<string>("");
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);

  const completedParticipations = participations.filter((p) => p.status === "completed");

  useEffect(() => {
    if (completedParticipations.length > 0 && !selectedParticipation) {
      setSelectedParticipation(completedParticipations[0].id);
    }
  }, [completedParticipations]);

  useEffect(() => {
    if (selectedParticipation) {
      fetchFeedback();
    }
  }, [selectedParticipation]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_360_feedback_summary", {
        p_participant_id: selectedParticipation,
      });

      if (error) throw error;
      setFeedback((data as FeedbackItem[]) || []);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group feedback by competency
  const groupedByCompetency = feedback.reduce((acc, item) => {
    const key = item.competency_name || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, FeedbackItem[]>);

  // Calculate averages by reviewer type
  const averagesByType = feedback.reduce((acc, item) => {
    if (item.avg_rating) {
      if (!acc[item.reviewer_type]) {
        acc[item.reviewer_type] = { total: 0, count: 0 };
      }
      acc[item.reviewer_type].total += item.avg_rating;
      acc[item.reviewer_type].count += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const overallAverages = Object.entries(averagesByType).map(([type, data]) => ({
    type,
    average: data.total / data.count,
  }));

  if (completedParticipations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold">No Completed Reviews</h3>
          <p className="text-sm">
            Your feedback summary will appear here once a review cycle is completed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cycle Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Review Cycle:</label>
        <Select value={selectedParticipation} onValueChange={setSelectedParticipation}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a review cycle" />
          </SelectTrigger>
          <SelectContent>
            {completedParticipations.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.review_cycle.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : feedback.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No feedback data available for this review cycle.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall Scores by Source */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overallAverages.map(({ type, average }) => (
              <Card key={type}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        {reviewerTypeLabels[type]?.icon}
                        {reviewerTypeLabels[type]?.label || type}
                      </p>
                      <p className="text-2xl font-bold">{average.toFixed(1)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.round(average) }, (_, i) => (
                        <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Feedback by Competency */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={Object.keys(groupedByCompetency)[0]} className="w-full">
                <TabsList className="flex-wrap">
                  {Object.keys(groupedByCompetency).map((competency) => (
                    <TabsTrigger key={competency} value={competency}>
                      {competency}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(groupedByCompetency).map(([competency, items]) => (
                  <TabsContent key={competency} value={competency} className="mt-4 space-y-4">
                    {/* Group items by question */}
                    {Object.values(
                      items.reduce((acc, item) => {
                        if (!acc[item.question_id]) {
                          acc[item.question_id] = {
                            question_text: item.question_text,
                            ratings: {},
                            comments: [],
                          };
                        }
                        if (item.avg_rating) {
                          acc[item.question_id].ratings[item.reviewer_type] = item.avg_rating;
                        }
                        if (item.text_responses) {
                          acc[item.question_id].comments.push(...item.text_responses);
                        }
                        return acc;
                      }, {} as Record<string, { question_text: string; ratings: Record<string, number>; comments: string[] }>)
                    ).map((question, idx) => (
                      <div key={idx} className="rounded-lg border p-4 space-y-3">
                        <h4 className="font-medium">{question.question_text}</h4>

                        {/* Ratings by source */}
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          {Object.entries(question.ratings).map(([type, rating]) => (
                            <div key={type} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                {reviewerTypeLabels[type]?.icon}
                                {reviewerTypeLabels[type]?.label}
                              </span>
                              <div className="flex items-center gap-2">
                                <Progress value={(rating / 5) * 100} className="w-16 h-2" />
                                <span className="text-sm font-medium w-8">{rating.toFixed(1)}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Anonymous comments */}
                        {question.comments.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-muted-foreground mb-2">Anonymous Comments:</p>
                            <div className="space-y-2">
                              {question.comments.map((comment, i) => (
                                <div key={i} className="text-sm p-2 bg-muted/30 rounded italic">
                                  "{comment}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}