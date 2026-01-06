import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, CheckCircle2, Clock, User, Building2, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  rating_scale_min: number | null;
  rating_scale_max: number | null;
}

export default function ExternalFeedbackPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [consentGiven, setConsentGiven] = useState(false);
  const [responses, setResponses] = useState<Record<string, { rating: number | null; comment: string }>>({});
  const [submitted, setSubmitted] = useState(false);

  // Validate token
  const { data: validation, isLoading: validating, error: validationError } = useQuery({
    queryKey: ['external-feedback-validation', token],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('feedback-external-invite', {
        body: { action: 'validate_token', access_token: token, company_id: '' }
      });
      if (error) throw error;
      if (!data.valid) throw new Error(data.error);
      return data.request;
    },
    enabled: !!token,
    retry: false
  });

  // Fetch questions for the cycle
  const { data: questions } = useQuery({
    queryKey: ['external-feedback-questions', validation?.cycle_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback_360_questions')
        .select('id, question_text, question_type, is_required, rating_scale_min, rating_scale_max')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data as Question[];
    },
    enabled: !!validation?.cycle_id
  });

  // Give consent
  const consentMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('feedback_360_requests')
        .update({ 
          consent_given: true, 
          consent_given_at: new Date().toISOString() 
        })
        .eq('id', validation?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setConsentGiven(true);
    }
  });

  // Submit feedback
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!validation?.id || !questions) throw new Error('Missing data');

      // Insert responses
      for (const question of questions) {
        const response = responses[question.id];
        if (response) {
          const { error } = await supabase
            .from('feedback_360_responses')
            .insert({
              request_id: validation.id,
              question_id: question.id,
              rating_value: response.rating,
              text_response: response.comment || null
            });
          if (error) throw error;
        }
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('feedback_360_requests')
        .update({
          status: 'completed',
          submitted_at: new Date().toISOString()
        })
        .eq('id', validation.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Thank you! Your feedback has been submitted.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit feedback');
    }
  });

  const handleResponseChange = (questionId: string, field: 'rating' | 'comment', value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }));
  };

  const getProgress = () => {
    if (!questions) return 0;
    const answered = Object.keys(responses).filter(qId => {
      const r = responses[qId];
      return r.rating !== null || r.comment;
    }).length;
    return (answered / questions.length) * 100;
  };

  const canSubmit = () => {
    if (!questions) return false;
    return questions.filter(q => q.is_required).every(q => {
      const r = responses[q.id];
      return r && (r.rating !== null || r.comment);
    });
  };

  // Loading state
  if (validating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Validating your access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (validationError || !validation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground text-center">
              {(validationError as any)?.message || 'This feedback link is invalid or has expired.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Submitted state
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <CheckCircle2 className="h-12 w-12 text-success mb-4" />
            <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
            <p className="text-muted-foreground text-center">
              Your feedback for {validation.subject_name} has been submitted successfully.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Consent required
  if (validation.consent_required && !consentGiven && !validation.consent_given) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Consent Required</CardTitle>
            </div>
            <CardDescription>
              Before providing feedback, please review and accept the terms below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm space-y-3">
              <p>You are being asked to provide feedback for <strong>{validation.subject_name}</strong> ({validation.subject_title}).</p>
              <p>Your feedback will be:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Used to support their professional development</li>
                <li>Combined with feedback from other raters</li>
                <li>Kept confidential and not attributed to you by name</li>
                <li>Stored securely in accordance with data protection regulations</li>
              </ul>
              <p>By proceeding, you consent to these terms.</p>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Checkbox 
                id="consent" 
                checked={consentGiven}
                onCheckedChange={(checked) => setConsentGiven(!!checked)}
              />
              <label htmlFor="consent" className="text-sm cursor-pointer">
                I understand and agree to provide feedback under these terms
              </label>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              disabled={!consentGiven || consentMutation.isPending}
              onClick={() => consentMutation.mutate()}
            >
              {consentMutation.isPending ? 'Processing...' : 'Continue to Feedback Form'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Feedback form
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>360° Feedback</CardTitle>
                <CardDescription>{validation.cycle_name}</CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Due: {new Date(validation.due_date).toLocaleDateString()}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{validation.subject_name}</p>
                <p className="text-sm text-muted-foreground">{validation.subject_title}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              Providing feedback as: <strong>{validation.external_name}</strong> ({validation.external_relationship})
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(getProgress())}% complete</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </CardContent>
        </Card>

        {/* Questions */}
        {questions?.map((question, index) => (
          <Card key={question.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium">{question.question_text}</p>
                  {question.is_required && (
                    <span className="text-xs text-destructive">Required</span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {question.question_type === 'rating' && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Strongly Disagree</span>
                    <span>Strongly Agree</span>
                  </div>
                  <Slider
                    value={[responses[question.id]?.rating ?? 3]}
                    min={question.rating_scale_min ?? 1}
                    max={question.rating_scale_max ?? 5}
                    step={1}
                    onValueChange={([value]) => handleResponseChange(question.id, 'rating', value)}
                  />
                  <div className="text-center font-medium">
                    {responses[question.id]?.rating ?? '-'} / {question.rating_scale_max ?? 5}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Comments {question.question_type === 'text' && question.is_required && '*'}</Label>
                <Textarea
                  placeholder="Share your observations and examples..."
                  value={responses[question.id]?.comment || ''}
                  onChange={(e) => handleResponseChange(question.id, 'comment', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Submit */}
        <Card>
          <CardContent className="py-6">
            <Button 
              className="w-full" 
              size="lg"
              disabled={!canSubmit() || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Your feedback is confidential and will be aggregated with other responses.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
