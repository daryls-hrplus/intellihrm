import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  BarChart3, 
  MessageSquare, 
  Brain,
  Eye,
  Lightbulb,
  Users,
  Target
} from "lucide-react";
import { 
  useCreateReportTemplate, 
  useUpdateReportTemplate,
  type FeedbackReportTemplate,
  type AudienceType,
  type ContentDepth,
  type AnonymityLevel,
  type SectionsConfig
} from "@/hooks/useFeedbackReportTemplates";
import { useAuth } from "@/contexts/AuthContext";

interface ReportTemplateEditorProps {
  companyId: string;
  template?: FeedbackReportTemplate | null;
  defaultAudience?: AudienceType;
  onSuccess: () => void;
  onCancel: () => void;
}

const sectionConfig = [
  { key: "executive_summary", label: "Executive Summary", icon: FileText, description: "High-level overview with key takeaways" },
  { key: "score_breakdown", label: "Score Breakdown", icon: BarChart3, description: "Numeric scores by category and competency" },
  { key: "category_analysis", label: "Category Analysis", icon: Target, description: "Detailed analysis per feedback category" },
  { key: "question_details", label: "Question-Level Details", icon: MessageSquare, description: "Individual question responses" },
  { key: "verbatim_comments", label: "Verbatim Comments", icon: MessageSquare, description: "Full text of written feedback" },
  { key: "anonymized_themes", label: "Anonymized Themes", icon: Users, description: "AI-detected themes without attribution" },
  { key: "comparison_to_norm", label: "Comparison to Norms", icon: BarChart3, description: "Benchmarking against org averages" },
  { key: "development_suggestions", label: "Development Suggestions", icon: Lightbulb, description: "AI-generated growth recommendations" },
  { key: "ai_insights", label: "AI Insights", icon: Brain, description: "Advanced AI analysis and patterns" },
];

export function ReportTemplateEditor({ 
  companyId, 
  template, 
  defaultAudience = "individual_contributor",
  onSuccess, 
  onCancel 
}: ReportTemplateEditorProps) {
  const { user } = useAuth();
  const createTemplate = useCreateReportTemplate();
  const updateTemplate = useUpdateReportTemplate();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    audience_type: defaultAudience as AudienceType,
    content_depth: "detailed" as ContentDepth,
    anonymity_level: "standard" as AnonymityLevel,
    sections_config: {
      executive_summary: true,
      score_breakdown: true,
      category_analysis: true,
      question_details: false,
      verbatim_comments: false,
      anonymized_themes: true,
      comparison_to_norm: true,
      development_suggestions: true,
      ai_insights: true,
    } as SectionsConfig,
    visualization_config: {
      chart_types: ["radar", "bar"],
      show_benchmarks: true,
      color_scheme: "default",
    },
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || "",
        audience_type: template.audience_type,
        content_depth: template.content_depth,
        anonymity_level: template.anonymity_level,
        sections_config: template.sections_config,
        visualization_config: template.visualization_config,
      });
    }
  }, [template]);

  const handleSectionToggle = (key: keyof SectionsConfig, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sections_config: {
        ...prev.sections_config,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    const payload = {
      ...formData,
      company_id: companyId,
      created_by: user?.id,
    };

    if (template) {
      await updateTemplate.mutateAsync({ id: template.id, ...payload });
    } else {
      await createTemplate.mutateAsync(payload);
    }
    onSuccess();
  };

  const isSubmitting = createTemplate.isPending || updateTemplate.isPending;

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Standard Manager Report"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of this template's purpose"
            rows={2}
          />
        </div>
      </div>

      <Separator />

      {/* Configuration */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Target Audience</Label>
          <Select 
            value={formData.audience_type} 
            onValueChange={(v) => setFormData({ ...formData, audience_type: v as AudienceType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="executive">Executive</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="individual_contributor">Individual Contributor</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="self">Self</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Content Depth</Label>
          <Select 
            value={formData.content_depth} 
            onValueChange={(v) => setFormData({ ...formData, content_depth: v as ContentDepth })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high_level">High Level</SelectItem>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="comprehensive">Comprehensive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Anonymity Level</Label>
          <Select 
            value={formData.anonymity_level} 
            onValueChange={(v) => setFormData({ ...formData, anonymity_level: v as AnonymityLevel })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strict">Strict (No attribution)</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="relaxed">Relaxed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Section Toggles */}
      <div>
        <Label className="text-base font-medium mb-4 block">Report Sections</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sectionConfig.map((section) => {
            const Icon = section.icon;
            const isEnabled = formData.sections_config[section.key as keyof SectionsConfig];
            
            return (
              <Card 
                key={section.key} 
                className={`cursor-pointer transition-colors ${isEnabled ? "border-primary/50 bg-primary/5" : "hover:bg-muted/50"}`}
                onClick={() => handleSectionToggle(section.key as keyof SectionsConfig, !isEnabled)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${isEnabled ? "text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <p className={`text-sm font-medium ${isEnabled ? "text-primary" : ""}`}>
                          {section.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => handleSectionToggle(section.key as keyof SectionsConfig, checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Visualization Options */}
      <div>
        <Label className="text-base font-medium mb-4 block">Visualization Options</Label>
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Show Benchmark Comparisons</p>
              <p className="text-xs text-muted-foreground">
                Display organization averages alongside individual scores
              </p>
            </div>
          </div>
          <Switch
            checked={formData.visualization_config.show_benchmarks}
            onCheckedChange={(checked) => 
              setFormData({
                ...formData,
                visualization_config: { ...formData.visualization_config, show_benchmarks: checked }
              })
            }
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name.trim()}>
          {isSubmitting ? "Saving..." : template ? "Update Template" : "Create Template"}
        </Button>
      </div>
    </div>
  );
}
