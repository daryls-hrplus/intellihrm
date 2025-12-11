import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Star, ThumbsUp, ThumbsDown, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SatisfactionSurveyProps {
  ticketId: string;
  userId: string;
}

export function SatisfactionSurvey({ ticketId, userId }: SatisfactionSurveyProps) {
  const queryClient = useQueryClient();
  const [overallRating, setOverallRating] = useState(0);
  const [responseTimeRating, setResponseTimeRating] = useState(0);
  const [resolutionRating, setResolutionRating] = useState(0);
  const [agentRating, setAgentRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState("");
  const [hoveredStar, setHoveredStar] = useState<{ category: string; value: number } | null>(null);

  // Check if survey already submitted
  const { data: existingSurvey, isLoading } = useQuery({
    queryKey: ["satisfaction-survey", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_satisfaction_surveys")
        .select("*")
        .eq("ticket_id", ticketId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const submitSurveyMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ticket_satisfaction_surveys").insert({
        ticket_id: ticketId,
        user_id: userId,
        rating: overallRating,
        response_time_rating: responseTimeRating || null,
        resolution_rating: resolutionRating || null,
        agent_rating: agentRating || null,
        would_recommend: wouldRecommend,
        feedback: feedback.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["satisfaction-survey", ticketId] });
      toast.success("Thank you for your feedback!");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const handleSubmit = () => {
    if (overallRating === 0) {
      toast.error("Please provide an overall rating");
      return;
    }
    submitSurveyMutation.mutate();
  };

  const StarRating = ({
    category,
    value,
    onChange,
    label,
  }: {
    category: string;
    value: number;
    onChange: (v: number) => void;
    label: string;
  }) => {
    const displayValue = hoveredStar?.category === category ? hoveredStar.value : value;

    return (
      <div className="space-y-2">
        <Label className="text-sm">{label}</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredStar({ category, value: star })}
              onMouseLeave={() => setHoveredStar(null)}
              onClick={() => onChange(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  star <= displayValue
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30"
                )}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Show thank you message if survey already submitted
  if (existingSurvey) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">Thank you for your feedback!</p>
              <p className="text-sm text-green-600">
                You rated this support experience {existingSurvey.rating}/5 stars
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          How was your support experience?
        </CardTitle>
        <CardDescription>
          Your feedback helps us improve our support quality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating - Required */}
        <StarRating
          category="overall"
          value={overallRating}
          onChange={setOverallRating}
          label="Overall Experience *"
        />

        {/* Additional Ratings */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StarRating
            category="response"
            value={responseTimeRating}
            onChange={setResponseTimeRating}
            label="Response Time"
          />
          <StarRating
            category="resolution"
            value={resolutionRating}
            onChange={setResolutionRating}
            label="Resolution Quality"
          />
          <StarRating
            category="agent"
            value={agentRating}
            onChange={setAgentRating}
            label="Agent Helpfulness"
          />
        </div>

        {/* Would Recommend */}
        <div className="space-y-2">
          <Label className="text-sm">Would you recommend our support?</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={wouldRecommend === true ? "default" : "outline"}
              size="sm"
              onClick={() => setWouldRecommend(true)}
              className={cn(
                wouldRecommend === true && "bg-green-600 hover:bg-green-700"
              )}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Yes
            </Button>
            <Button
              type="button"
              variant={wouldRecommend === false ? "default" : "outline"}
              size="sm"
              onClick={() => setWouldRecommend(false)}
              className={cn(
                wouldRecommend === false && "bg-red-600 hover:bg-red-700"
              )}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              No
            </Button>
          </div>
        </div>

        {/* Feedback */}
        <div className="space-y-2">
          <Label htmlFor="feedback" className="text-sm">
            Additional Comments (Optional)
          </Label>
          <Textarea
            id="feedback"
            placeholder="Tell us more about your experience..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={overallRating === 0 || submitSurveyMutation.isPending}
          className="w-full"
        >
          {submitSurveyMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );
}
