import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreVertical, Edit, Copy, Trash, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useMetricTemplates } from "@/hooks/useMetricTemplates";
import {
  MetricTemplate,
  MeasurementType,
  MEASUREMENT_TYPE_LABELS,
} from "@/types/goalEnhancements";

interface MetricTemplatesManagerProps {
  companyId?: string;
}

export function MetricTemplatesManager({ companyId }: MetricTemplatesManagerProps) {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useMetricTemplates(companyId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MetricTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unitOfMeasure: "",
    defaultTarget: "",
    thresholdPercentage: "80",
    stretchPercentage: "120",
    measurementType: "quantitative" as MeasurementType,
    category: "",
    isInverse: false,
    isActive: true,
    isGlobal: false,
  });

  const handleOpenDialog = (template?: MetricTemplate) => {
    if (template) {
      setSelectedTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || "",
        unitOfMeasure: template.unitOfMeasure || "",
        defaultTarget: template.defaultTarget ? String(template.defaultTarget) : "",
        thresholdPercentage: String(template.thresholdPercentage),
        stretchPercentage: String(template.stretchPercentage),
        measurementType: template.measurementType,
        category: template.category || "",
        isInverse: template.isInverse,
        isActive: template.isActive,
        isGlobal: template.isGlobal || false,
      });
    } else {
      setSelectedTemplate(null);
      setFormData({
        name: "",
        description: "",
        unitOfMeasure: "",
        defaultTarget: "",
        thresholdPercentage: "80",
        stretchPercentage: "120",
        measurementType: "quantitative",
        category: "",
        isInverse: false,
        isActive: true,
        isGlobal: false,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Template name is required");
      return;
    }

    const templateData: Omit<MetricTemplate, "id"> = {
      name: formData.name.trim(),
      description: formData.description || undefined,
      unitOfMeasure: formData.unitOfMeasure || undefined,
      defaultTarget: formData.defaultTarget ? parseFloat(formData.defaultTarget) : undefined,
      thresholdPercentage: parseFloat(formData.thresholdPercentage) || 80,
      stretchPercentage: parseFloat(formData.stretchPercentage) || 120,
      measurementType: formData.measurementType,
      category: formData.category || undefined,
      isInverse: formData.isInverse,
      isActive: formData.isActive,
      isGlobal: formData.isGlobal,
    };

    if (selectedTemplate) {
      updateTemplate(selectedTemplate.id, templateData);
      toast.success("Template updated");
    } else {
      addTemplate(templateData);
      toast.success("Template created");
    }

    setDialogOpen(false);
  };

  const handleDuplicate = (template: MetricTemplate) => {
    const newTemplate: Omit<MetricTemplate, "id"> = {
      ...template,
      name: `${template.name} (Copy)`,
      isGlobal: false,
    };
    addTemplate(newTemplate);
    toast.success("Template duplicated");
  };

  const handleDelete = (template: MetricTemplate) => {
    if (template.isGlobal) {
      toast.error("Cannot delete global templates");
      return;
    }
    if (!confirm(`Delete template "${template.name}"?`)) return;
    deleteTemplate(template.id);
    toast.success("Template deleted");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Metric Templates</CardTitle>
            <CardDescription>
              Define reusable measurement configurations for goals
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Stretch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No templates configured. Add your first template to get started.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {template.isInverse ? (
                        <TrendingDown className="h-4 w-4 text-primary" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <div className="font-medium">{template.name}</div>
                        {template.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-48">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {MEASUREMENT_TYPE_LABELS[template.measurementType]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {template.category && (
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{template.thresholdPercentage}%</TableCell>
                  <TableCell>{template.stretchPercentage}%</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {template.isActive ? (
                        <Badge className="bg-success/10 text-success text-xs">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Inactive</Badge>
                      )}
                      {template.isGlobal && (
                        <Badge variant="outline" className="text-xs">Global</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(template)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        {!template.isGlobal && (
                          <DropdownMenuItem 
                            onClick={() => handleDelete(template)}
                            className="text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? "Edit Template" : "Create Metric Template"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Revenue Target"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this metric type"
                />
              </div>

              <div>
                <Label htmlFor="measurementType">Measurement Type</Label>
                <Select
                  value={formData.measurementType}
                  onValueChange={(value: MeasurementType) => 
                    setFormData({ ...formData, measurementType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(MEASUREMENT_TYPE_LABELS) as MeasurementType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        {MEASUREMENT_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Financial, Quality"
                />
              </div>

              <div>
                <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
                <Input
                  id="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                  placeholder="e.g., %, $, units"
                />
              </div>

              <div>
                <Label htmlFor="defaultTarget">Default Target</Label>
                <Input
                  id="defaultTarget"
                  type="number"
                  value={formData.defaultTarget}
                  onChange={(e) => setFormData({ ...formData, defaultTarget: e.target.value })}
                  placeholder="Optional default"
                />
              </div>

              <div>
                <Label htmlFor="thresholdPercentage">Threshold (%)</Label>
                <Input
                  id="thresholdPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.thresholdPercentage}
                  onChange={(e) => setFormData({ ...formData, thresholdPercentage: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="stretchPercentage">Stretch (%)</Label>
                <Input
                  id="stretchPercentage"
                  type="number"
                  min="100"
                  max="200"
                  value={formData.stretchPercentage}
                  onChange={(e) => setFormData({ ...formData, stretchPercentage: e.target.value })}
                />
              </div>

              <div className="col-span-2 flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Inverse Target</Label>
                  <p className="text-xs text-muted-foreground">
                    Lower values are better (e.g., costs, errors)
                  </p>
                </div>
                <Switch
                  checked={formData.isInverse}
                  onCheckedChange={(checked) => setFormData({ ...formData, isInverse: checked })}
                />
              </div>

              <div className="col-span-2 flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Available for use in goals
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedTemplate ? "Update Template" : "Create Template"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}