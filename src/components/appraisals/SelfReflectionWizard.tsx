import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Save, Sparkles, CheckCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReflectionPrompt {
  id: string;
  prompt: string;
  type: "text" | "multiselect" | "boolean";
  options?: string[];
}

interface ReflectionTemplate {
  id: string;
  name: string;
  category: string;
  prompts: ReflectionPrompt[];
}

interface SelfReflectionWizardProps {
  participantId: string;
  onComplete?: () => void;
}

export function SelfReflectionWizard({ participantId, onComplete }: SelfReflectionWizardProps) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, Record<string, unknown>>>({});
  const [careerAspirations, setCareerAspirations] = useState("");
  const [developmentInterests, setDevelopmentInterests] = useState<string[]>([]);

  const { data: templates, isLoading: loadingTemplates } = useQuery({
    queryKey: ["reflection-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reflection_templates")
        .select("*")
        .eq("is_active", true)
        .eq("is_default", true)
        .order("display_order");

      if (error) throw error;
      // Parse prompts from JSON to array
      return (data || []).map(t => ({
        ...t,
        prompts: (typeof t.prompts === 'string' ? JSON.parse(t.prompts) : t.prompts) as ReflectionPrompt[]
      })) as ReflectionTemplate[];
    },
  });

  const { data: participant } = useQuery({
    queryKey: ["appraisal-participant", participantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appraisal_participants")
        .select("self_reflection, career_aspirations, development_interests")
        .eq("id", participantId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (participant) {
      if (participant.self_reflection) {
        setResponses(participant.self_reflection as Record<string, Record<string, unknown>>);
      }
      if (participant.career_aspirations) {
        setCareerAspirations(participant.career_aspirations);
      }
      if (participant.development_interests) {
        setDevelopmentInterests(participant.development_interests);
      }
    }
  }, [participant]);

  const saveMutation = useMutation({
    mutationFn: async (complete: boolean) => {
      const updateData: Record<string, unknown> = {
        self_reflection: responses,
        career_aspirations: careerAspirations,
        development_interests: developmentInterests,
        updated_at: new Date().toISOString(),
      };

      if (complete) {
        updateData.reflection_completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("appraisal_participants")
        .update(updateData)
        .eq("id", participantId);

      if (error) throw error;
    },
    onSuccess: (_, complete) => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-participant", participantId] });
      if (complete) {
        toast.success("Self-reflection completed!");
        onComplete?.();
      } else {
        toast.success("Progress saved");
      }
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const handleResponseChange = (templateId: string, promptId: string, value: unknown) => {
    setResponses((prev) => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        [promptId]: value,
      },
    }));
  };

  const toggleDevelopmentInterest = (interest: string) => {
    setDevelopmentInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  if (loadingTemplates) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allSteps = [...(templates || []), { id: "career", name: "Career Aspirations", category: "aspirations" }];
  const currentTemplate = allSteps[currentStep];
  const totalSteps = allSteps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const renderPrompt = (template: ReflectionTemplate, prompt: ReflectionPrompt) => {
    const value = responses[template.id]?.[prompt.id];

    switch (prompt.type) {
      case "text":
        return (
          <div key={prompt.id} className="space-y-2">
            <Label className="text-sm font-medium">{prompt.prompt}</Label>
            <Textarea
              value={(value as string) || ""}
              onChange={(e) => handleResponseChange(template.id, prompt.id, e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
            />
          </div>
        );
      case "multiselect":
        return (
          <div key={prompt.id} className="space-y-2">
            <Label className="text-sm font-medium">{prompt.prompt}</Label>
            <div className="flex flex-wrap gap-2">
              {prompt.options?.map((option) => {
                const selected = Array.isArray(value) ? value.includes(option) : false;
                return (
                  <Badge
                    key={option}
                    variant={selected ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = selected
                        ? currentValues.filter((v) => v !== option)
                        : [...currentValues, option];
                      handleResponseChange(template.id, prompt.id, newValues);
                    }}
                  >
                    {option}
                  </Badge>
                );
              })}
            </div>
          </div>
        );
      case "boolean":
        return (
          <div key={prompt.id} className="flex items-center space-x-2">
            <Checkbox
              checked={!!value}
              onCheckedChange={(checked) => handleResponseChange(template.id, prompt.id, checked)}
            />
            <Label className="text-sm">{prompt.prompt}</Label>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Self-Reflection</CardTitle>
          </div>
          <Badge variant="outline">
            Step {currentStep + 1} of {totalSteps}
          </Badge>
        </div>
        <CardDescription>
          Take time to reflect on your performance, achievements, and growth areas
        </CardDescription>
        <Progress value={progress} className="mt-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {currentTemplate.id === "career" ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Where do you see yourself in the next 1-2 years?</Label>
              <Textarea
                value={careerAspirations}
                onChange={(e) => setCareerAspirations(e.target.value)}
                placeholder="Describe your career goals and aspirations..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">What areas would you like to develop?</Label>
              <div className="flex flex-wrap gap-2">
                {["Leadership", "Technical Skills", "Communication", "Project Management", "Strategic Thinking", "Innovation", "Mentoring", "Cross-functional Collaboration"].map((interest) => (
                  <Badge
                    key={interest}
                    variant={developmentInterests.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleDevelopmentInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="font-medium text-lg">{currentTemplate.name}</h3>
            {(currentTemplate as ReflectionTemplate).prompts?.map((prompt) =>
              renderPrompt(currentTemplate as ReflectionTemplate, prompt)
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((prev) => prev - 1)}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => saveMutation.mutate(false)} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Progress
          </Button>

          {currentStep === totalSteps - 1 ? (
            <Button onClick={() => saveMutation.mutate(true)} disabled={saveMutation.isPending}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Reflection
            </Button>
          ) : (
            <Button onClick={() => setCurrentStep((prev) => prev + 1)}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
