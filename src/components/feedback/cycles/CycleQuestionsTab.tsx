import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Edit, Star, ToggleLeft, AlignLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  reviewer_types: string[];
  is_required: boolean;
  display_order: number;
  competency_id?: string;
  competency_name?: string;
}

interface CycleQuestionsTabProps {
  cycleId: string;
  onOpenQuestionsManager: () => void;
}

export function CycleQuestionsTab({ cycleId, onOpenQuestionsManager }: CycleQuestionsTabProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [cycleId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("review_questions")
        .select(`
          id,
          question_text,
          question_type,
          reviewer_types,
          is_required,
          display_order,
          competency_id,
          competencies(name)
        `)
        .eq("review_cycle_id", cycleId)
        .order("display_order");

      if (error) throw error;

      const questionsWithCompetency = (data || []).map((q: any) => ({
        ...q,
        competency_name: q.competencies?.name,
      }));

      setQuestions(questionsWithCompetency);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "rating":
        return <Star className="h-4 w-4" />;
      case "yes_no":
        return <ToggleLeft className="h-4 w-4" />;
      default:
        return <AlignLeft className="h-4 w-4" />;
    }
  };

  const getQuestionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      rating: "bg-warning/10 text-warning",
      text: "bg-info/10 text-info",
      yes_no: "bg-success/10 text-success",
    };
    return (
      <Badge className={colors[type] || "bg-muted"}>
        {getQuestionTypeIcon(type)}
        <span className="ml-1 capitalize">{type.replace("_", " ")}</span>
      </Badge>
    );
  };

  const groupedQuestions = questions.reduce((acc, q) => {
    (q.reviewer_types || ["all"]).forEach((type) => {
      if (!acc[type]) acc[type] = [];
      acc[type].push(q);
    });
    return acc;
  }, {} as Record<string, Question[]>);

  const reviewerTypeLabels: Record<string, string> = {
    self: "Self Review",
    peer: "Peer Review",
    manager: "Manager Review",
    direct_report: "Direct Report Review",
    all: "All Reviewer Types",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Question Preview</h3>
          <Badge variant="outline">{questions.length} questions</Badge>
        </div>
        <Button onClick={onOpenQuestionsManager} className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Questions
        </Button>
      </div>

      {/* Questions Preview */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Loading questions...
          </CardContent>
        </Card>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h4 className="mt-4 font-semibold">No Questions Configured</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Add questions to define what feedback will be collected
            </p>
            <Button onClick={onOpenQuestionsManager} className="mt-4">
              <Edit className="mr-2 h-4 w-4" />
              Configure Questions
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-6">
            {Object.entries(groupedQuestions).map(([reviewerType, typeQuestions]) => (
              <Card key={reviewerType}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Badge variant="secondary">
                      {reviewerTypeLabels[reviewerType] || reviewerType}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      ({typeQuestions.length} questions)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {typeQuestions.map((question, index) => (
                      <div key={question.id}>
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {question.question_text}
                              {question.is_required && (
                                <span className="text-destructive ml-1">*</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {getQuestionTypeBadge(question.question_type)}
                              {question.competency_name && (
                                <Badge variant="outline" className="text-xs">
                                  {question.competency_name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {index < typeQuestions.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
