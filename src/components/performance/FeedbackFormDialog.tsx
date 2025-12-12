import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ChevronLeft, ChevronRight, Check, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  competency_id: string | null;
  competency_name?: string;
  is_required: boolean;
  rating_scale_min: number;
  rating_scale_max: number;
  rating_labels: string[];
  display_order: number;
}

interface FeedbackFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissionId: string;
  participantId: string;
  employeeName: string;
  reviewerType: string;
  onSuccess: () => void;
}

export function FeedbackFormDialog({
  open,
  onOpenChange,
  submissionId,
  participantId,
  employeeName,
  reviewerType,
  onSuccess,
}: FeedbackFormDialogProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, { rating?: number; text?: string }>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (open && participantId) {
      fetchQuestions();
    }
  }, [open, participantId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Get the review cycle ID from participant
      const { data: participant } = await supabase
        .from("review_participants")
        .select("review_cycle_id")
        .eq("id", participantId)
        .single();

      if (!participant) throw new Error("Participant not found");

      // Get questions for this cycle that apply to this reviewer type
      const { data: questionsData, error } = await supabase
        .from("review_questions")
        .select(`
          *,
          competency:competencies(name)
        `)
        .eq("review_cycle_id", participant.review_cycle_id)
        .contains("applies_to", [reviewerType])
        .order("display_order");

      if (error) throw error;

      const formattedQuestions = (questionsData || []).map((q: any) => ({
        ...q,
        competency_name: q.competency?.name,
        rating_labels: Array.isArray(q.rating_labels) ? q.rating_labels : JSON.parse(q.rating_labels || "[]"),
      }));

      setQuestions(formattedQuestions);

      // Load existing responses
      const { data: existingResponses } = await supabase
        .from("feedback_responses")
        .select("question_id, rating_value, text_value")
        .eq("feedback_submission_id", submissionId);

      if (existingResponses) {
        const responseMap: Record<string, { rating?: number; text?: string }> = {};
        existingResponses.forEach((r: any) => {
          responseMap[r.question_id] = {
            rating: r.rating_value,
            text: r.text_value,
          };
        });
        setResponses(responseMap);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (questionId: string, rating: number) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], rating },
    }));
  };

  const handleTextChange = (questionId: string, text: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], text },
    }));
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    try {
      // Update submission status to in_progress
      await supabase
        .from("feedback_submissions")
        .update({ status: "in_progress" })
        .eq("id", submissionId);

      // Upsert responses
      const responsesToSave = Object.entries(responses).map(([questionId, response]) => ({
        feedback_submission_id: submissionId,
        question_id: questionId,
        rating_value: response.rating || null,
        text_value: response.text || null,
      }));

      for (const response of responsesToSave) {
        await supabase
          .from("feedback_responses")
          .upsert(response, { onConflict: "feedback_submission_id,question_id" });
      }

      toast.success("Progress saved");
    } catch (error) {
      console.error("Error saving progress:", error);
      toast.error("Failed to save progress");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    // Validate required questions
    const unanswered = questions.filter(
      (q) => q.is_required && !responses[q.id]?.rating && !responses[q.id]?.text
    );

    if (unanswered.length > 0) {
      toast.error(`Please answer all required questions (${unanswered.length} remaining)`);
      return;
    }

    setSaving(true);
    try {
      // Save all responses
      const responsesToSave = Object.entries(responses).map(([questionId, response]) => ({
        feedback_submission_id: submissionId,
        question_id: questionId,
        rating_value: response.rating || null,
        text_value: response.text || null,
      }));

      for (const response of responsesToSave) {
        await supabase
          .from("feedback_responses")
          .upsert(response, { onConflict: "feedback_submission_id,question_id" });
      }

      // Update submission status to submitted
      await supabase
        .from("feedback_submissions")
        .update({ status: "submitted", submitted_at: new Date().toISOString() })
        .eq("id", submissionId);

      toast.success("Feedback submitted successfully");
      onSuccess();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setSaving(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(responses).filter(
    (qId) => responses[qId]?.rating || responses[qId]?.text
  ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {reviewerType === "self" ? "Self Assessment" : `Review for ${employeeName}`}
          </DialogTitle>
          <DialogDescription>
            {reviewerType === "peer" || reviewerType === "direct_report"
              ? "Your feedback is anonymous"
              : "Provide your feedback below"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : questions.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No questions configured for this review.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-muted-foreground">
                  {answeredCount} of {questions.length} answered
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Separator />

            {/* Current Question */}
            {currentQuestion && (
              <div className="space-y-4">
                {currentQuestion.competency_name && (
                  <Badge variant="outline">{currentQuestion.competency_name}</Badge>
                )}
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    {currentQuestion.question_text}
                    {currentQuestion.is_required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                </div>

                {currentQuestion.question_type === "rating" && (
                  <div className="space-y-4">
                    <RadioGroup
                      value={responses[currentQuestion.id]?.rating?.toString() || ""}
                      onValueChange={(value) =>
                        handleRatingChange(currentQuestion.id, parseInt(value))
                      }
                      className="space-y-2"
                    >
                      {Array.from(
                        { length: currentQuestion.rating_scale_max - currentQuestion.rating_scale_min + 1 },
                        (_, i) => currentQuestion.rating_scale_min + i
                      ).map((value, index) => (
                        <div
                          key={value}
                          className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
                        >
                          <RadioGroupItem value={value.toString()} id={`rating-${value}`} />
                          <Label
                            htmlFor={`rating-${value}`}
                            className="flex-1 cursor-pointer flex items-center gap-2"
                          >
                            <div className="flex items-center gap-1">
                              {Array.from({ length: value }, (_, i) => (
                                <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                              ))}
                            </div>
                            <span className="text-sm">
                              {currentQuestion.rating_labels[index] || `${value}`}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {currentQuestion.question_type === "text" && (
                  <Textarea
                    value={responses[currentQuestion.id]?.text || ""}
                    onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
                    placeholder="Enter your response..."
                    rows={4}
                  />
                )}

                {/* Comments section for rating questions */}
                {currentQuestion.question_type === "rating" && (
                  <div className="space-y-2 pt-4">
                    <Label className="text-sm text-muted-foreground">
                      Additional Comments (Optional)
                    </Label>
                    <Textarea
                      value={responses[currentQuestion.id]?.text || ""}
                      onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
                      placeholder="Add any additional feedback..."
                      rows={3}
                    />
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleSaveProgress} disabled={saving}>
                  Save Progress
                </Button>
                {currentIndex === questions.length - 1 ? (
                  <Button onClick={handleSubmit} disabled={saving}>
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Submit Feedback
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}