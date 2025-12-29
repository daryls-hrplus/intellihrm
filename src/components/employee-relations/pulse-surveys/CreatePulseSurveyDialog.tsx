import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, Trash2, GripVertical, Calendar, Clock, Users } from "lucide-react";
import { usePulseSurveyMutations, PulseSurveyTemplate } from "@/hooks/usePulseSurveys";
import { PulseSurveyTemplates } from "./PulseSurveyTemplates";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTodayString } from "@/utils/dateUtils";

interface CreatePulseSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

const FREQUENCY_OPTIONS = [
  { value: "one_time", label: "One-time" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
];

const QUESTION_TYPES = [
  { value: "scale", label: "Rating Scale (1-5)" },
  { value: "nps", label: "NPS (0-10)" },
  { value: "open", label: "Open Text" },
  { value: "yes_no", label: "Yes/No" },
  { value: "multiple_choice", label: "Multiple Choice" },
];

export function CreatePulseSurveyDialog({ open, onOpenChange, companyId }: CreatePulseSurveyDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { createSurvey } = usePulseSurveyMutations();
  const [step, setStep] = useState<"template" | "customize">("template");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    questions: [] as any[],
    target_departments: [] as string[],
    target_audience: "all",
    is_anonymous: true,
    frequency: "one_time",
    start_date: getTodayString(),
    end_date: "",
    reminder_enabled: true,
    reminder_days_before: 1,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSelectTemplate = (template: PulseSurveyTemplate) => {
    setFormData((prev) => ({
      ...prev,
      title: template.name,
      description: template.description || "",
      questions: template.questions || [],
    }));
    setStep("customize");
  };

  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: `q${Date.now()}`,
          type: "scale",
          text: "",
          scale_min: 1,
          scale_max: 5,
          options: [],
        },
      ],
    }));
  };

  const handleUpdateQuestion = (index: number, updates: any) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? { ...q, ...updates } : q)),
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    await createSurvey.mutateAsync({
      company_id: companyId,
      title: formData.title,
      description: formData.description,
      questions: formData.questions,
      target_departments: formData.target_departments,
      target_audience: formData.target_audience,
      is_anonymous: formData.is_anonymous,
      frequency: formData.frequency,
      start_date: formData.start_date,
      end_date: formData.end_date,
      reminder_enabled: formData.reminder_enabled,
      reminder_days_before: formData.reminder_days_before,
      status: "draft",
    } as any);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setStep("template");
    setFormData({
      title: "",
      description: "",
      questions: [],
      target_departments: [],
      target_audience: "all",
      is_anonymous: true,
      frequency: "one_time",
      start_date: getTodayString(),
      end_date: "",
      reminder_enabled: true,
      reminder_days_before: 1,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {step === "template" ? "Choose a Template" : "Customize Your Pulse Survey"}
          </DialogTitle>
        </DialogHeader>

        {step === "template" ? (
          <div className="space-y-4">
            <PulseSurveyTemplates companyId={companyId} onSelectTemplate={handleSelectTemplate} />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, title: "Custom Survey", questions: [] }));
                  setStep("customize");
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Start from Scratch
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="questions">Questions ({formData.questions.length})</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <Label>Survey Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Weekly Team Pulse"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of this survey..."
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.is_anonymous}
                  onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_anonymous: checked }))}
                />
                <Label>Anonymous responses (recommended for honest feedback)</Label>
              </div>
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {formData.questions.map((question, index) => (
                    <Card key={question.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-grab" />
                          <div className="flex-1 space-y-3">
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <Input
                                  value={question.text}
                                  onChange={(e) => handleUpdateQuestion(index, { text: e.target.value })}
                                  placeholder="Enter your question..."
                                />
                              </div>
                              <Select
                                value={question.type}
                                onValueChange={(v) => handleUpdateQuestion(index, { type: v })}
                              >
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {QUESTION_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveQuestion(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            {question.type === "multiple_choice" && (
                              <div className="pl-4 space-y-2">
                                <Label className="text-xs">Options (comma-separated)</Label>
                                <Input
                                  value={question.options?.join(", ") || ""}
                                  onChange={(e) =>
                                    handleUpdateQuestion(index, {
                                      options: e.target.value.split(",").map((o: string) => o.trim()),
                                    })
                                  }
                                  placeholder="Option 1, Option 2, Option 3"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
              <Button variant="outline" onClick={handleAddQuestion} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </TabsContent>

            <TabsContent value="audience" className="space-y-4">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select
                  value={formData.target_audience}
                  onValueChange={(v) => setFormData((p) => ({ ...p, target_audience: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    <SelectItem value="managers">Managers Only</SelectItem>
                    <SelectItem value="non_managers">Non-Managers Only</SelectItem>
                    <SelectItem value="departments">Specific Departments</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.target_audience === "departments" && (
                <div className="space-y-2">
                  <Label>Select Departments</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px]">
                    {departments.map((dept) => (
                      <Badge
                        key={dept.id}
                        variant={formData.target_departments.includes(dept.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setFormData((p) => ({
                            ...p,
                            target_departments: p.target_departments.includes(dept.id)
                              ? p.target_departments.filter((d) => d !== dept.id)
                              : [...p.target_departments, dept.id],
                          }));
                        }}
                      >
                        {dept.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(v) => setFormData((p) => ({ ...p, frequency: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.reminder_enabled}
                  onCheckedChange={(checked) => setFormData((p) => ({ ...p, reminder_enabled: checked }))}
                />
                <Label>Send reminders before deadline</Label>
              </div>

              {formData.reminder_enabled && (
                <div className="space-y-2">
                  <Label>Days before deadline</Label>
                  <Select
                    value={String(formData.reminder_days_before)}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, reminder_days_before: parseInt(v) }))
                    }
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="2">2 days</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep("template")}>
                Back to Templates
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.title || !formData.end_date || formData.questions.length === 0 || createSurvey.isPending}
                >
                  {createSurvey.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Survey
                </Button>
              </div>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
