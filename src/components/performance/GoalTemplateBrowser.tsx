import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Target, Lightbulb, CheckCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GoalTemplate {
  id: string;
  name: string;
  description: string | null;
  goal_type: string;
  category: string | null;
  default_weighting: number | null;
  suggested_metrics: {
    metrics?: string[];
    measurement_frequency?: string;
  } | null;
}

interface GoalTemplateBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: GoalTemplate) => void;
  companyId?: string;
}

const categoryColors: Record<string, string> = {
  Leadership: "bg-primary/10 text-primary border-primary/20",
  "Customer Focus": "bg-info/10 text-info border-info/20",
  Innovation: "bg-warning/10 text-warning border-warning/20",
  Technical: "bg-success/10 text-success border-success/20",
  Communication: "bg-secondary/10 text-secondary-foreground border-secondary/20",
};

const goalTypeLabels: Record<string, string> = {
  smart_goal: "SMART Goal",
  okr_objective: "OKR Objective",
  okr_key_result: "Key Result",
};

export function GoalTemplateBrowser({
  open,
  onOpenChange,
  onSelectTemplate,
  companyId,
}: GoalTemplateBrowserProps) {
  const [templates, setTemplates] = useState<GoalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open, companyId]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("goal_templates")
        .select("id, name, description, goal_type, category, default_weighting, suggested_metrics")
        .eq("is_active", true)
        .order("category")
        .order("name");

      // Fetch both global (NULL company_id) and company-specific templates
      if (companyId) {
        query = query.or(`company_id.is.null,company_id.eq.${companyId}`);
      } else {
        query = query.is("company_id", null);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTemplates((data as GoalTemplate[]) || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load goal templates");
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    templates.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats).sort();
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        searchQuery === "" ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        categoryFilter === "all" || template.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [templates, searchQuery, categoryFilter]);

  const handleSelectTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onOpenChange(false);
      setSelectedTemplate(null);
      setSearchQuery("");
      setCategoryFilter("all");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedTemplate(null);
    setSearchQuery("");
    setCategoryFilter("all");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Goal Templates
          </DialogTitle>
          <DialogDescription>
            Select a template to quickly create a goal with pre-filled details and suggested metrics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(searchQuery || categoryFilter !== "all") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Templates Grid */}
          <ScrollArea className="h-[400px] pr-4">
            {loading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading templates...
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Target className="h-12 w-12 mb-4 opacity-50" />
                <p>No templates found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {filteredTemplates.map((template) => {
                  const isSelected = selectedTemplate?.id === template.id;
                  const colorClass = template.category
                    ? categoryColors[template.category] || "bg-muted text-muted-foreground"
                    : "bg-muted text-muted-foreground";

                  return (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? "ring-2 ring-primary shadow-md" : ""
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate flex items-center gap-2">
                              {template.name}
                              {isSelected && (
                                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                              )}
                            </CardTitle>
                            <CardDescription className="line-clamp-2 mt-1">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          {template.category && (
                            <Badge variant="outline" className={colorClass}>
                              {template.category}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {goalTypeLabels[template.goal_type] || template.goal_type}
                          </Badge>
                          {template.default_weighting && (
                            <Badge variant="outline" className="text-xs">
                              {template.default_weighting}% weight
                            </Badge>
                          )}
                        </div>
                        {template.suggested_metrics?.metrics && template.suggested_metrics.metrics.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground mb-1">Suggested Metrics:</p>
                            <div className="flex flex-wrap gap-1">
                              {template.suggested_metrics.metrics.slice(0, 3).map((metric, i) => (
                                <Badge key={i} variant="outline" className="text-xs font-normal">
                                  {metric}
                                </Badge>
                              ))}
                              {template.suggested_metrics.metrics.length > 3 && (
                                <Badge variant="outline" className="text-xs font-normal">
                                  +{template.suggested_metrics.metrics.length - 3} more
                                </Badge>
                              )}
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

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""} available
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSelectTemplate} disabled={!selectedTemplate}>
                <Target className="mr-2 h-4 w-4" />
                Use Template
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
