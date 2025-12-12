import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";

type GoalType = 'okr_objective' | 'okr_key_result' | 'smart_goal';

interface GoalTemplate {
  id: string;
  name: string;
  description: string | null;
  goal_type: GoalType;
  category: string | null;
  default_weighting: number | null;
  is_active: boolean;
}

interface GoalTemplatesManagerProps {
  companyId: string | undefined;
}

export function GoalTemplatesManager({ companyId }: GoalTemplatesManagerProps) {
  const { logAction } = useAuditLog();
  const [templates, setTemplates] = useState<GoalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goal_type: "smart_goal" as GoalType,
    category: "",
    default_weighting: "10",
  });

  useEffect(() => {
    if (companyId) {
      fetchTemplates();
    }
  }, [companyId]);

  const fetchTemplates = async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("goal_templates")
        .select("*")
        .or(`company_id.eq.${companyId},company_id.is.null`)
        .order("name");

      if (error) throw error;
      setTemplates((data as GoalTemplate[]) || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (template?: GoalTemplate) => {
    if (template) {
      setSelectedTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || "",
        goal_type: template.goal_type,
        category: template.category || "",
        default_weighting: String(template.default_weighting || 10),
      });
    } else {
      setSelectedTemplate(null);
      setFormData({
        name: "",
        description: "",
        goal_type: "smart_goal",
        category: "",
        default_weighting: "10",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;

    try {
      const templateData = {
        company_id: companyId,
        name: formData.name,
        description: formData.description || null,
        goal_type: formData.goal_type,
        category: formData.category || null,
        default_weighting: parseFloat(formData.default_weighting) || 10,
      };

      if (selectedTemplate) {
        const { error } = await supabase
          .from("goal_templates")
          .update(templateData)
          .eq("id", selectedTemplate.id);

        if (error) throw error;

        await logAction({
          action: "UPDATE",
          entityType: "goal_template",
          entityId: selectedTemplate.id,
          entityName: formData.name,
        });

        toast.success("Template updated");
      } else {
        const { data, error } = await supabase
          .from("goal_templates")
          .insert([templateData])
          .select("id")
          .single();

        if (error) throw error;

        await logAction({
          action: "CREATE",
          entityType: "goal_template",
          entityId: data.id,
          entityName: formData.name,
        });

        toast.success("Template created");
      }

      setDialogOpen(false);
      fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    }
  };

  const handleDelete = async (template: GoalTemplate) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const { error } = await supabase
        .from("goal_templates")
        .delete()
        .eq("id", template.id);

      if (error) throw error;

      await logAction({
        action: "DELETE",
        entityType: "goal_template",
        entityId: template.id,
        entityName: template.name,
      });

      toast.success("Template deleted");
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const handleDuplicate = async (template: GoalTemplate) => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from("goal_templates")
        .insert([{
          company_id: companyId,
          name: `${template.name} (Copy)`,
          description: template.description,
          goal_type: template.goal_type,
          category: template.category,
          default_weighting: template.default_weighting,
        }])
        .select("id")
        .single();

      if (error) throw error;

      await logAction({
        action: "CREATE",
        entityType: "goal_template",
        entityId: data.id,
        entityName: `${template.name} (Copy)`,
        metadata: { duplicated_from: template.id },
      });

      toast.success("Template duplicated");
      fetchTemplates();
    } catch (error) {
      console.error("Error duplicating template:", error);
      toast.error("Failed to duplicate template");
    }
  };

  const typeLabels: Record<GoalType, string> = {
    okr_objective: "OKR Objective",
    okr_key_result: "Key Result",
    smart_goal: "SMART Goal",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Goal Templates</CardTitle>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Template
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No templates found. Create your first template to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{template.name}</p>
                      {template.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {template.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[template.goal_type]}</Badge>
                  </TableCell>
                  <TableCell>{template.category || "-"}</TableCell>
                  <TableCell>{template.default_weighting}%</TableCell>
                  <TableCell>
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicate(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(template)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goal_type">Goal Type</Label>
                <Select
                  value={formData.goal_type}
                  onValueChange={(value: GoalType) => setFormData({ ...formData, goal_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smart_goal">SMART Goal</SelectItem>
                    <SelectItem value="okr_objective">OKR Objective</SelectItem>
                    <SelectItem value="okr_key_result">Key Result</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="default_weighting">Default Weight (%)</Label>
              <Input
                id="default_weighting"
                type="number"
                min="0"
                max="100"
                value={formData.default_weighting}
                onChange={(e) => setFormData({ ...formData, default_weighting: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedTemplate ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
