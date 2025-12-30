import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Clock, Star, AlertTriangle } from "lucide-react";
import type { My360Request } from "@/hooks/useMy360FeedbackRequests";
import { use360CycleQuestions, useSubmit360Feedback } from "@/hooks/useMy360FeedbackRequests";

interface Ess360FeedbackResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: My360Request;
}

interface QuestionResponse {
  question_id: string;
  rating: number | null;
  comment: string | null;
}

export function Ess360FeedbackResponseDialog({
  open,
  onOpenChange,
  request,
}: Ess360FeedbackResponseDialogProps) {
  const { data: questions = [], isLoading: questionsLoading } = use360CycleQuestions(request.cycle_id);
  const submitFeedback = useSubmit360Feedback();
  
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [submitting, setSubmitting] = useState(false);

  const updateResponse = (questionId: string, field: "rating" | "comment", value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        rating: field === "rating" ? value : prev[questionId]?.rating || null,
        comment: field === "comment" ? value : prev[questionId]?.comment || null,
      }
    }));
  };

  const handleSubmit = async () => {
    // Validate required questions
    const requiredQuestions = questions.filter(q => q.is_required);
    const missingResponses = requiredQuestions.filter(q => {
      const response = responses[q.id];
      if (q.question_type === "rating" || q.question_type === "scale") {
        return !response?.rating;
      }
      return !response?.comment;
    });

    if (missingResponses.length > 0) {
      return; // Show validation errors
    }

    setSubmitting(true);
    try {
      await submitFeedback.mutateAsync({
        requestId: request.id,
        responses: Object.values(responses),
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const renderRatingScale = (question: typeof questions[0], questionId: string) => {
    const min = question.rating_scale_min || 1;
    const max = question.rating_scale_max || 5;
    const currentRating = responses[questionId]?.rating;

    return (
      <div className="space-y-3">
        <RadioGroup
          value={currentRating?.toString() || ""}
          onValueChange={(value) => updateResponse(questionId, "rating", parseInt(value))}
          className="flex flex-wrap gap-2"
        >
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((value) => (
            <div key={value} className="flex flex-col items-center">
              <RadioGroupItem value={value.toString()} id={`${questionId}-${value}`} className="sr-only" />
              <Label
                htmlFor={`${questionId}-${value}`}
                className={`
                  cursor-pointer flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                  ${currentRating === value 
                    ? "border-primary bg-primary text-primary-foreground" 
                    : "border-muted-foreground/30 hover:border-primary/50"
                  }
                `}
              >
                {value}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            360 Feedback for {request.subject_employee_name}
          </DialogTitle>
        </DialogHeader>

        {/* Header Info */}
        <div className="flex flex-wrap items-center gap-3 text-sm pb-4 border-b">
          <Badge variant="outline">{request.cycle_name}</Badge>
          {request.is_mandatory && (
            <Badge variant="destructive">Mandatory</Badge>
          )}
          {request.due_date && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              Due: {format(new Date(request.due_date), "MMM d, yyyy")}
            </span>
          )}
        </div>

        <Alert className="mb-4">
          <Star className="h-4 w-4" />
          <AlertDescription>
            Your feedback is anonymous and will be used to help {request.subject_employee_name} grow professionally.
            Please be honest and constructive.
          </AlertDescription>
        </Alert>

        {/* Questions */}
        <div className="space-y-6">
          {questionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                <p className="text-muted-foreground">No questions configured for this cycle.</p>
              </CardContent>
            </Card>
          ) : (
            questions.map((question, index) => (
              <Card key={question.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-muted-foreground">{index + 1}.</span>
                      <div className="flex-1">
                        <Label className="text-base font-medium">
                          {question.question_text}
                          {question.is_required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </Label>
                      </div>
                    </div>

                    {(question.question_type === "rating" || question.question_type === "scale") && (
                      renderRatingScale(question, question.id)
                    )}

                    {question.question_type === "text" && (
                      <Textarea
                        placeholder="Enter your response..."
                        value={responses[question.id]?.comment || ""}
                        onChange={(e) => updateResponse(question.id, "comment", e.target.value)}
                        rows={3}
                      />
                    )}

                    {(question.question_type === "rating" || question.question_type === "scale") && (
                      <div className="pt-2">
                        <Label className="text-sm text-muted-foreground">Additional comments (optional)</Label>
                        <Textarea
                          placeholder="Add any additional context..."
                          value={responses[question.id]?.comment || ""}
                          onChange={(e) => updateResponse(question.id, "comment", e.target.value)}
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || questionsLoading || questions.length === 0}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
