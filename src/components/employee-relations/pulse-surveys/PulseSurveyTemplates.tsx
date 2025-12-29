import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Clock, Star, Search, Plus, Sparkles, Users, Heart, BarChart3 } from "lucide-react";
import { usePulseSurveyTemplates, PulseSurveyTemplate } from "@/hooks/usePulseSurveys";

interface PulseSurveyTemplatesProps {
  companyId: string;
  onSelectTemplate: (template: PulseSurveyTemplate) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  engagement: <Star className="h-4 w-4" />,
  feedback: <Users className="h-4 w-4" />,
  wellbeing: <Heart className="h-4 w-4" />,
  general: <BarChart3 className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  engagement: "bg-primary/10 text-primary border-primary/20",
  feedback: "bg-info/10 text-info border-info/20",
  wellbeing: "bg-success/10 text-success border-success/20",
  general: "bg-muted text-muted-foreground",
};

export function PulseSurveyTemplates({ companyId, onSelectTemplate }: PulseSurveyTemplatesProps) {
  const { t } = useTranslation();
  const { data: templates = [], isLoading } = usePulseSurveyTemplates(companyId);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", ...new Set(templates.map((t) => t.category))];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const systemTemplates = filteredTemplates.filter((t) => t.is_system_template);
  const customTemplates = filteredTemplates.filter((t) => !t.is_system_template);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system" className="gap-2">
            <Sparkles className="h-4 w-4" />
            System Templates ({systemTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <FileText className="h-4 w-4" />
            Custom Templates ({customTemplates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <ScrollArea className="h-[400px]">
            <div className="grid gap-3 pr-4">
              {systemTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} onSelect={onSelectTemplate} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="custom">
          <ScrollArea className="h-[400px]">
            <div className="grid gap-3 pr-4">
              {customTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No custom templates yet</p>
                  <p className="text-sm">Create your first template or use a system template</p>
                </div>
              ) : (
                customTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} onSelect={onSelectTemplate} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: PulseSurveyTemplate;
  onSelect: (t: PulseSurveyTemplate) => void;
}) {
  const questionCount = template.questions?.length || 0;

  return (
    <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onSelect(template)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{template.name}</h4>
              {template.is_system_template && (
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  System
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {questionCount} questions
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{template.estimated_duration_minutes} min
              </span>
            </div>
          </div>
          <Badge variant="outline" className={CATEGORY_COLORS[template.category] || CATEGORY_COLORS.general}>
            {CATEGORY_ICONS[template.category]}
            <span className="ml-1 capitalize">{template.category}</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
