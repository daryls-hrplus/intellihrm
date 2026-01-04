import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ClipboardCheck, Sparkles } from 'lucide-react';
import { getTodayString } from '@/utils/dateUtils';

interface PotentialAssessmentInlineProps {
  employeeId: string;
  companyId: string;
  onComplete?: () => void;
}

interface Question {
  id: string;
  question_text: string;
  question_category: string;
  display_order: number;
}

const DEFAULT_QUESTIONS: Omit<Question, 'id'>[] = [
  { question_text: 'Quickly learns and applies new concepts in unfamiliar situations', question_category: 'learning_agility', display_order: 1 },
  { question_text: 'Seeks feedback and learns from mistakes without becoming defensive', question_category: 'learning_agility', display_order: 2 },
  { question_text: 'Inspires and motivates others toward shared goals', question_category: 'leadership', display_order: 3 },
  { question_text: 'Builds effective teams and develops talent', question_category: 'leadership', display_order: 4 },
  { question_text: 'Demonstrates ambition and willingness to take on stretch assignments', question_category: 'drive', display_order: 5 },
  { question_text: 'Shows resilience when facing setbacks', question_category: 'drive', display_order: 6 },
  { question_text: 'Thrives in ambiguous situations with limited guidance', question_category: 'adaptability', display_order: 7 },
  { question_text: 'Embraces change and helps others navigate transitions', question_category: 'adaptability', display_order: 8 },
];

const SCALE_OPTIONS = [
  { value: '1', label: 'Disagree', points: 1 },
  { value: '2', label: 'Agree', points: 2 },
  { value: '3', label: 'Strongly Agree', points: 3 },
];

export function PotentialAssessmentInline({ 
  employeeId, 
  companyId, 
  onComplete 
}: PotentialAssessmentInlineProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded) {
      fetchOrCreateQuestions();
    }
  }, [expanded, companyId]);

  const fetchOrCreateQuestions = async () => {
    setLoading(true);
    try {
      // Try to fetch existing template
      const { data: templates } = await supabase
        .from('potential_assessment_templates')
        .select('id')
        .eq('company_id', companyId)
        .eq('is_default', true)
        .eq('is_active', true)
        .limit(1);

      let templateId: string;

      if (templates && templates.length > 0) {
        templateId = templates[0].id;
      } else {
        // Create default template
        const { data: newTemplate, error: templateError } = await supabase
          .from('potential_assessment_templates')
          .insert({
            company_id: companyId,
            name: 'Default Potential Assessment',
            description: 'Industry-standard potential assessment questionnaire',
            is_default: true,
            is_active: true
          })
          .select('id')
          .single();

        if (templateError) throw templateError;
        templateId = newTemplate.id;

        // Create default questions
        const questionsToInsert = DEFAULT_QUESTIONS.map(q => ({
          template_id: templateId,
          ...q,
          is_required: true
        }));

        await supabase
          .from('potential_assessment_questions')
          .insert(questionsToInsert);
      }

      // Fetch questions
      const { data: questionData } = await supabase
        .from('potential_assessment_questions')
        .select('*')
        .eq('template_id', templateId)
        .order('display_order');

      setQuestions(questionData || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      // Fall back to default questions
      setQuestions(DEFAULT_QUESTIONS.map((q, i) => ({ ...q, id: `default-${i}` })));
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateRating = () => {
    const totalPoints = Object.values(responses).reduce((sum, val) => sum + parseInt(val), 0);
    // Rating thresholds based on 8 questions * 3 max points = 24 max
    if (totalPoints <= 10) return 1; // Low
    if (totalPoints <= 18) return 2; // Medium
    return 3; // High
  };

  const handleSubmit = async () => {
    if (Object.keys(responses).length < questions.length) {
      toast.error('Please answer all questions');
      return;
    }

    setSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const totalPoints = Object.values(responses).reduce((sum, val) => sum + parseInt(val), 0);
      const calculatedRating = calculateRating();

      // Get template ID
      const { data: templates } = await supabase
        .from('potential_assessment_templates')
        .select('id')
        .eq('company_id', companyId)
        .eq('is_default', true)
        .limit(1);

      const templateId = templates?.[0]?.id;

      // Mark previous assessments as not current
      await supabase
        .from('potential_assessments')
        .update({ is_current: false })
        .eq('employee_id', employeeId);

      // Create assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('potential_assessments')
        .insert({
          employee_id: employeeId,
          assessed_by: user?.user?.id,
          template_id: templateId,
          company_id: companyId,
          assessment_date: getTodayString(),
          total_points: totalPoints,
          calculated_rating: calculatedRating,
          is_current: true
        })
        .select('id')
        .single();

      if (assessmentError) throw assessmentError;

      // Save responses
      const responsesToInsert = Object.entries(responses).map(([questionId, value]) => ({
        assessment_id: assessment.id,
        question_id: questionId.startsWith('default-') ? null : questionId,
        scale_value: parseInt(value),
        points_earned: parseInt(value)
      }));

      await supabase
        .from('potential_assessment_responses')
        .insert(responsesToInsert);

      toast.success('Potential assessment completed');
      setExpanded(false);
      setResponses({});
      onComplete?.();
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = Object.keys(responses).length === questions.length;
  const currentPoints = Object.values(responses).reduce((sum, val) => sum + parseInt(val || '0'), 0);
  const maxPoints = questions.length * 3;

  if (!expanded) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Complete Potential Assessment</h4>
                <p className="text-sm text-muted-foreground">
                  Answer 8 questions to generate an AI-suggested potential rating
                </p>
              </div>
            </div>
            <Button onClick={() => setExpanded(true)}>
              <Sparkles className="mr-2 h-4 w-4" />
              Start Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Potential Assessment Questionnaire
        </CardTitle>
        <CardDescription>
          Rate the employee on each dimension. Your responses will be used to suggest a potential rating.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <Label className="text-sm font-medium">
                  {index + 1}. {question.question_text}
                </Label>
                <RadioGroup
                  value={responses[question.id] || ''}
                  onValueChange={(value) => handleResponseChange(question.id, value)}
                  className="flex gap-4"
                >
                  {SCALE_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                      <Label 
                        htmlFor={`${question.id}-${option.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Progress: {Object.keys(responses).length}/{questions.length} answered
                </span>
                <span className="font-medium">
                  Current Score: {currentPoints}/{maxPoints} points
                </span>
              </div>

              {allAnswered && (
                <div className="bg-primary/5 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      Suggested Rating: {calculateRating() === 1 ? 'Low' : calculateRating() === 2 ? 'Medium' : 'High'} Potential
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setExpanded(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!allAnswered || submitting}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Assessment
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
