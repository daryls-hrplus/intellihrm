import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  MessageSquare,
  Star,
  FileText,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReviewQuestion {
  id: string;
  question_text: string;
  question_type: string;
  competency_id: string | null;
  is_required: boolean;
  display_order: number;
  rating_scale_min: number | null;
  rating_scale_max: number | null;
  rating_labels: Record<string, string> | null;
  applies_to: string[];
}

interface Competency {
  id: string;
  name: string;
  code: string;
}

interface CycleQuestionsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleId: string;
  cycleName: string;
  companyId: string;
}

const questionTypes = [
  { value: "rating", label: "Rating Scale", icon: Star },
  { value: "text", label: "Text Response", icon: FileText },
  { value: "competency", label: "Competency Rating", icon: Star },
];

const reviewerTypes = [
  { value: "self", label: "Self" },
  { value: "manager", label: "Manager" },
  { value: "peer", label: "Peer" },
  { value: "direct_report", label: "Direct Report" },
];

export function CycleQuestionsManager({
  open,
  onOpenChange,
  cycleId,
  cycleName,
  companyId,
}: CycleQuestionsManagerProps) {
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    question_text: "",
    question_type: "rating",
    competency_id: "",
    is_required: true,
    rating_scale_min: 1,
    rating_scale_max: 5,
    applies_to: ["self", "manager", "peer", "direct_report"] as string[],
  });

  useEffect(() => {
    if (open && cycleId) {
      fetchData();
    }
  }, [open, cycleId]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchQuestions(), fetchCompetencies()]);
    setLoading(false);
  };

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("review_questions")
      .select("*")
      .eq("review_cycle_id", cycleId)
      .order("display_order");

    if (error) {
      console.error("Error fetching questions:", error);
      return;
    }

    setQuestions((data || []).map(q => ({
      ...q,
      rating_labels: q.rating_labels as Record<string, string> | null,
    })));
  };

  const fetchCompetencies = async () => {
    const { data, error } = await supabase
      .from("competencies")
      .select("id, name, code")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching competencies:", error);
      return;
    }

    setCompetencies(data || []);
  };

  const handleAddQuestion = async () => {
    if (!formData.question_text.trim()) {
      toast.error("Question text is required");
      return;
    }

    setSaving(true);
    try {
      const maxOrder = Math.max(0, ...questions.map((q) => q.display_order));
      const { error } = await supabase.from("review_questions").insert([
        {
          review_cycle_id: cycleId,
          question_text: formData.question_text,
          question_type: formData.question_type,
          competency_id: formData.competency_id || null,
          is_required: formData.is_required,
          display_order: maxOrder + 1,
          rating_scale_min: formData.question_type === "rating" || formData.question_type === "competency" ? formData.rating_scale_min : null,
          rating_scale_max: formData.question_type === "rating" || formData.question_type === "competency" ? formData.rating_scale_max : null,
          applies_to: formData.applies_to,
        },
      ]);

      if (error) throw error;

      toast.success("Question added");
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Failed to add question");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateQuestion = async (question: ReviewQuestion) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("review_questions")
        .update({
          question_text: formData.question_text,
          question_type: formData.question_type,
          competency_id: formData.competency_id || null,
          is_required: formData.is_required,
          rating_scale_min: formData.question_type === "rating" || formData.question_type === "competency" ? formData.rating_scale_min : null,
          rating_scale_max: formData.question_type === "rating" || formData.question_type === "competency" ? formData.rating_scale_max : null,
          applies_to: formData.applies_to,
        })
        .eq("id", question.id);

      if (error) throw error;

      toast.success("Question updated");
      setEditingId(null);
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from("review_questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;

      toast.success("Question deleted");
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  const handleAddDefaultQuestions = async () => {
    setSaving(true);
    try {
      const defaultQuestions = [
        { text: "How effectively does this person communicate with team members?", category: "Communication" },
        { text: "Rate this person's ability to collaborate with others.", category: "Teamwork" },
        { text: "How well does this person demonstrate leadership qualities?", category: "Leadership" },
        { text: "Rate this person's problem-solving abilities.", category: "Problem Solving" },
        { text: "How effectively does this person manage their time and priorities?", category: "Results Orientation" },
        { text: "What are this person's key strengths?", category: "Other", type: "text" },
        { text: "What areas could this person improve on?", category: "Other", type: "text" },
        { text: "Any additional feedback or comments?", category: "Other", type: "text", required: false },
      ];

      const questionsToInsert = defaultQuestions.map((q, index) => ({
        review_cycle_id: cycleId,
        question_text: q.text,
        question_type: q.type || "rating",
        is_required: q.required !== false,
        display_order: questions.length + index + 1,
        rating_scale_min: q.type === "text" ? null : 1,
        rating_scale_max: q.type === "text" ? null : 5,
        applies_to: ["self", "manager", "peer", "direct_report"],
      }));

      const { error } = await supabase.from("review_questions").insert(questionsToInsert);

      if (error) throw error;

      toast.success("Default questions added");
      fetchQuestions();
    } catch (error) {
      console.error("Error adding default questions:", error);
      toast.error("Failed to add default questions");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCompetencyQuestions = async () => {
    if (competencies.length === 0) {
      toast.error("No competencies defined for this company");
      return;
    }

    setSaving(true);
    try {
      const questionsToInsert = competencies.map((comp, index) => ({
        review_cycle_id: cycleId,
        question_text: `Rate this person's proficiency in: ${comp.name}`,
        question_type: "competency",
        competency_id: comp.id,
        is_required: true,
        display_order: questions.length + index + 1,
        rating_scale_min: 1,
        rating_scale_max: 5,
        applies_to: ["self", "manager", "peer", "direct_report"],
      }));

      const { error } = await supabase.from("review_questions").insert(questionsToInsert);

      if (error) throw error;

      toast.success(`Added ${competencies.length} competency questions`);
      fetchQuestions();
    } catch (error) {
      console.error("Error adding competency questions:", error);
      toast.error("Failed to add competency questions");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question_text: "",
      question_type: "rating",
      competency_id: "",
      is_required: true,
      rating_scale_min: 1,
      rating_scale_max: 5,
      applies_to: ["self", "manager", "peer", "direct_report"],
    });
    setShowAddForm(false);
  };

  const startEditing = (question: ReviewQuestion) => {
    setEditingId(question.id);
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      competency_id: question.competency_id || "",
      is_required: question.is_required,
      rating_scale_min: question.rating_scale_min || 1,
      rating_scale_max: question.rating_scale_max || 5,
      applies_to: question.applies_to || ["self", "manager", "peer", "direct_report"],
    });
  };

  const getQuestionTypeIcon = (type: string) => {
    const questionType = questionTypes.find((t) => t.value === type);
    if (!questionType) return MessageSquare;
    return questionType.icon;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Configure Questions
          </DialogTitle>
          <DialogDescription>{cycleName}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Badge variant="secondary">{questions.length} questions</Badge>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddDefaultQuestions}
                disabled={saving}
              >
                Add Default Questions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCompetencyQuestions}
                disabled={saving || competencies.length === 0}
              >
                Add Competency Questions
              </Button>
              <Button size="sm" onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Custom Question
              </Button>
            </div>
          </div>

          {showAddForm && (
            <Card className="border-primary/50">
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Question Text *</Label>
                  <Textarea
                    value={formData.question_text}
                    onChange={(e) =>
                      setFormData({ ...formData, question_text: e.target.value })
                    }
                    placeholder="Enter your question..."
                    rows={2}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select
                      value={formData.question_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, question_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.question_type === "competency" && (
                  <div className="space-y-2">
                    <Label>Competency</Label>
                    <Select
                      value={formData.competency_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, competency_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select competency" />
                      </SelectTrigger>
                      <SelectContent>
                        {competencies.map((comp) => (
                          <SelectItem key={comp.id} value={comp.id}>
                            {comp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  )}
                </div>
                {(formData.question_type === "rating" || formData.question_type === "competency") && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Min Rating</Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={formData.rating_scale_min}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rating_scale_min: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Rating</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={formData.rating_scale_max}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rating_scale_max: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_required}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_required: checked })
                    }
                  />
                  <Label>Required question</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddQuestion} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No questions configured</p>
                <p className="text-sm">Add default questions or create custom ones</p>
              </div>
            ) : (
              <div className="space-y-2">
                {questions.map((question, index) => {
                  const TypeIcon = getQuestionTypeIcon(question.question_type);
                  const isEditing = editingId === question.id;

                  return (
                    <Card key={question.id} className={isEditing ? "border-primary/50" : ""}>
                      <CardContent className="p-4">
                        {isEditing ? (
                          <div className="space-y-4">
                            <Textarea
                              value={formData.question_text}
                              onChange={(e) =>
                                setFormData({ ...formData, question_text: e.target.value })
                              }
                              rows={2}
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingId(null);
                                  resetForm();
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateQuestion(question)}
                                disabled={saving}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <GripVertical className="h-4 w-4 cursor-grab" />
                              <span className="text-sm font-medium w-6">{index + 1}.</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{question.question_text}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge variant="outline" className="gap-1">
                                  <TypeIcon className="h-3 w-3" />
                                  {question.question_type}
                                </Badge>
                                {question.is_required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                                {question.rating_scale_max && (
                                  <span className="text-xs text-muted-foreground">
                                    Scale: {question.rating_scale_min}-{question.rating_scale_max}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => startEditing(question)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteQuestion(question.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
