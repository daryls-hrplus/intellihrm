import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, HelpCircle, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isPast } from "date-fns";
import { useReadinessAssessment, ReadinessAssessmentEvent, ReadinessAssessmentIndicator, ReadinessAssessmentResponse } from "@/hooks/succession/useReadinessAssessment";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ReadinessAssessmentFormProps {
  eventId: string;
  companyId: string;
  assessorType: "manager" | "hr" | "executive";
  onComplete?: () => void;
}

interface IndicatorResponse {
  indicatorId: string;
  rating: number;
  comments: string;
}

export function ReadinessAssessmentForm({
  eventId,
  companyId,
  assessorType,
  onComplete,
}: ReadinessAssessmentFormProps) {
  const { user } = useAuth();
  const { fetchIndicators, fetchResponses, submitResponse, calculateOverallScore } = useReadinessAssessment(companyId);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState<ReadinessAssessmentEvent | null>(null);
  const [indicators, setIndicators] = useState<ReadinessAssessmentIndicator[]>([]);
  const [existingResponses, setExistingResponses] = useState<ReadinessAssessmentResponse[]>([]);
  const [responses, setResponses] = useState<Record<string, IndicatorResponse>>({});
  const [candidateName, setCandidateName] = useState("");

  // Filter indicators for this assessor type
  const myIndicators = indicators.filter(ind => ind.assessor_type === assessorType);
  
  // Group by category
  const groupedIndicators = myIndicators.reduce((acc, ind) => {
    const catName = ind.category?.category_name || "General";
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(ind);
    return acc;
  }, {} as Record<string, ReadinessAssessmentIndicator[]>);

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch event details
      const { data: eventData } = await (supabase
        .from("readiness_assessment_events" as any)
        .select(`
          *,
          candidate:succession_candidates(
            id,
            employee_id,
            employee:profiles!succession_candidates_employee_id_fkey(id, full_name, avatar_url)
          ),
          form:readiness_assessment_forms(*)
        `)
        .eq("id", eventId)
        .single() as any);

      if (eventData) {
        setEvent(eventData as ReadinessAssessmentEvent);
        setCandidateName((eventData as any).candidate?.employee?.full_name || "Unknown");

        // Fetch indicators for the form
        if (eventData.form_id) {
          const indicatorsData = await fetchIndicators(eventData.form_id);
          setIndicators(indicatorsData);
        }
      }

      // Fetch existing responses
      const responsesData = await fetchResponses(eventId);
      setExistingResponses(responsesData);

      // Pre-populate responses from existing data for this user
      const myResponses = responsesData.filter(r => r.assessor_id === user?.id);
      const responseMap: Record<string, IndicatorResponse> = {};
      myResponses.forEach(r => {
        responseMap[r.indicator_id] = {
          indicatorId: r.indicator_id,
          rating: r.rating,
          comments: r.comments || "",
        };
      });
      setResponses(responseMap);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (indicatorId: string, rating: number) => {
    setResponses(prev => ({
      ...prev,
      [indicatorId]: {
        ...prev[indicatorId],
        indicatorId,
        rating,
        comments: prev[indicatorId]?.comments || "",
      },
    }));
  };

  const handleCommentsChange = (indicatorId: string, comments: string) => {
    setResponses(prev => ({
      ...prev,
      [indicatorId]: {
        ...prev[indicatorId],
        indicatorId,
        rating: prev[indicatorId]?.rating || 0,
        comments,
      },
    }));
  };

  const handleSubmit = async () => {
    // Validate all indicators have ratings
    const unanswered = myIndicators.filter(ind => !responses[ind.id]?.rating);
    if (unanswered.length > 0) {
      toast.error(`Please rate all indicators. ${unanswered.length} remaining.`);
      return;
    }

    setSubmitting(true);
    try {
      // Submit all responses
      for (const indicator of myIndicators) {
        const response = responses[indicator.id];
        await submitResponse({
          event_id: eventId,
          indicator_id: indicator.id,
          rating: response.rating,
          comments: response.comments || undefined,
          assessor_type: assessorType,
        });
      }

      // Check if all assessors have completed
      const allResponses = await fetchResponses(eventId);
      const totalIndicators = indicators.length;
      const completedResponses = allResponses.filter(r => r.submitted_at).length;

      if (completedResponses >= totalIndicators) {
        // All done - calculate final score
        await calculateOverallScore(eventId);
        toast.success("Assessment completed! Final score calculated.");
      } else {
        toast.success("Your responses have been saved.");
      }

      onComplete?.();
    } finally {
      setSubmitting(false);
    }
  };

  const getCompletionProgress = () => {
    const answered = myIndicators.filter(ind => responses[ind.id]?.rating).length;
    return (answered / myIndicators.length) * 100;
  };

  const getOverallProgress = () => {
    const uniqueAssessors = new Set(existingResponses.map(r => r.assessor_id));
    const completedAssessors = [...uniqueAssessors].filter(assessorId => {
      const assessorResponses = existingResponses.filter(r => r.assessor_id === assessorId && r.submitted_at);
      // This is a simplification - in reality we'd check against the assessor's required indicators
      return assessorResponses.length > 0;
    });
    // Assume 2 assessor types minimum (manager + hr)
    return (completedAssessors.size / 2) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Assessment not found or you don't have access.
        </CardContent>
      </Card>
    );
  }

  const isOverdue = event.due_date && isPast(parseISO(event.due_date));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                Readiness Assessment
                <Badge variant={event.status === "completed" ? "default" : "secondary"}>
                  {event.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                Assessing: <span className="font-medium text-foreground">{candidateName}</span>
              </CardDescription>
            </div>
            {event.due_date && (
              <div className={`text-sm ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                {isOverdue ? (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Overdue: {format(parseISO(event.due_date), "MMM d, yyyy")}
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Due: {format(parseISO(event.due_date), "MMM d, yyyy")}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Your Progress ({assessorType})</span>
              <span>{Math.round(getCompletionProgress())}%</span>
            </div>
            <Progress value={getCompletionProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Indicators by Category */}
      {myIndicators.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No indicators assigned for your assessor role ({assessorType}).
          </CardContent>
        </Card>
      ) : (
        <TooltipProvider>
          <Accordion type="multiple" defaultValue={Object.keys(groupedIndicators)} className="space-y-4">
            {Object.entries(groupedIndicators).map(([category, categoryIndicators]) => (
              <AccordionItem key={category} value={category} className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full mr-4">
                    <span className="font-medium">{category}</span>
                    <Badge variant="outline">
                      {categoryIndicators.filter(i => responses[i.id]?.rating).length}/{categoryIndicators.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-6">
                    {categoryIndicators.map((indicator) => {
                      const response = responses[indicator.id];
                      const isAnswered = !!response?.rating;

                      return (
                        <div key={indicator.id} className="space-y-3 p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <Label className="text-base font-normal leading-relaxed">
                                {indicator.indicator_name}
                              </Label>
                              {(indicator.scoring_guide_low || indicator.scoring_guide_high) && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="max-w-xs">
                                    <div className="space-y-2 text-sm">
                                      {indicator.scoring_guide_low && (
                                        <p><strong>1:</strong> {indicator.scoring_guide_low}</p>
                                      )}
                                      {indicator.scoring_guide_mid && (
                                        <p><strong>{Math.ceil(indicator.rating_scale_max / 2)}:</strong> {indicator.scoring_guide_mid}</p>
                                      )}
                                      {indicator.scoring_guide_high && (
                                        <p><strong>{indicator.rating_scale_max}:</strong> {indicator.scoring_guide_high}</p>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            {isAnswered && (
                              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Rating</span>
                              <span className="font-medium">
                                {response?.rating || "-"} / {indicator.rating_scale_max}
                              </span>
                            </div>
                            <Slider
                              value={[response?.rating || 0]}
                              onValueChange={([value]) => handleRatingChange(indicator.id, value)}
                              max={indicator.rating_scale_max}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>1 - Low</span>
                              <span>{indicator.rating_scale_max} - High</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Comments (optional)</Label>
                            <Textarea
                              value={response?.comments || ""}
                              onChange={(e) => handleCommentsChange(indicator.id, e.target.value)}
                              placeholder="Add any observations or context..."
                              rows={2}
                              className="resize-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TooltipProvider>
      )}

      {/* Submit Button */}
      {myIndicators.length > 0 && (
        <div className="flex justify-end gap-3 sticky bottom-4 bg-background p-4 rounded-lg border shadow-lg">
          <Button variant="outline" disabled={submitting}>
            Save Draft
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || getCompletionProgress() < 100}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit Assessment
          </Button>
        </div>
      )}
    </div>
  );
}
