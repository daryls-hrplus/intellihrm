import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  FileText, 
  Briefcase, 
  Users, 
  User, 
  Shield,
  Star,
  Edit,
  Trash2,
  Copy
} from "lucide-react";
import { ReportTemplateEditor } from "./ReportTemplateEditor";
import { 
  useFeedbackReportTemplates, 
  useDeleteReportTemplate,
  useSetDefaultTemplate,
  type FeedbackReportTemplate,
  type AudienceType
} from "@/hooks/useFeedbackReportTemplates";
import { useAuth } from "@/contexts/AuthContext";

interface ReportTemplateManagerProps {
  companyId: string;
}

const audienceConfig: Record<AudienceType, { icon: React.ElementType; label: string; description: string }> = {
  executive: { icon: Briefcase, label: "Executive", description: "High-level summary for leadership" },
  manager: { icon: Users, label: "Manager", description: "Team-focused with coaching prompts" },
  individual_contributor: { icon: User, label: "Individual Contributor", description: "Full detail for personal development" },
  hr: { icon: Shield, label: "HR", description: "Complete view with analytics" },
  self: { icon: User, label: "Self", description: "Self-reflection focused report" },
};

export function ReportTemplateManager({ companyId }: ReportTemplateManagerProps) {
  const { user } = useAuth();
  const { data: templates = [], isLoading } = useFeedbackReportTemplates(companyId);
  const deleteTemplate = useDeleteReportTemplate();
  const setDefault = useSetDefaultTemplate();
  
  const [selectedAudience, setSelectedAudience] = useState<AudienceType>("executive");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FeedbackReportTemplate | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const filteredTemplates = templates.filter((t) => t.audience_type === selectedAudience);

  const handleEdit = (template: FeedbackReportTemplate) => {
    setEditingTemplate(template);
    setEditorOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setEditorOpen(true);
  };

  const handleDelete = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteTemplate.mutate(templateToDelete);
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleSetDefault = (templateId: string) => {
    setDefault.mutate({ templateId, companyId, audienceType: selectedAudience });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Templates
              </CardTitle>
              <CardDescription>
                Configure role-based report templates for 360 feedback
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedAudience} onValueChange={(v) => setSelectedAudience(v as AudienceType)}>
            <TabsList className="grid grid-cols-5 w-full">
              {Object.entries(audienceConfig).map(([key, config]) => (
                <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                  <config.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{config.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.keys(audienceConfig).map((audience) => (
              <TabsContent key={audience} value={audience} className="mt-4">
                <div className="text-sm text-muted-foreground mb-4">
                  {audienceConfig[audience as AudienceType].description}
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-32" />
                    ))}
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="py-12 text-center border rounded-lg border-dashed">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No Templates</p>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Create a template for {audienceConfig[audience as AudienceType].label} reports
                    </p>
                    <Button variant="outline" onClick={handleCreate}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {filteredTemplates.map((template) => (
                        <Card key={template.id} className={template.is_default ? "border-primary/50" : ""}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium">{template.name}</h3>
                                  {template.is_default && (
                                    <Badge className="bg-primary">
                                      <Star className="h-3 w-3 mr-1" />
                                      Default
                                    </Badge>
                                  )}
                                </div>
                                {template.description && (
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {template.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline">
                                    Depth: {template.content_depth.replace("_", " ")}
                                  </Badge>
                                  <Badge variant="outline">
                                    Anonymity: {template.anonymity_level}
                                  </Badge>
                                  <Badge variant="outline">
                                    {Object.values(template.sections_config).filter(Boolean).length} sections
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {!template.is_default && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleSetDefault(template.id)}
                                    disabled={setDefault.isPending}
                                  >
                                    <Star className="h-4 w-4 mr-1" />
                                    Set Default
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDelete(template.id)}
                                  disabled={template.is_default}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Template Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create New Template"}
            </DialogTitle>
          </DialogHeader>
          <ReportTemplateEditor
            companyId={companyId}
            template={editingTemplate}
            defaultAudience={selectedAudience}
            onSuccess={() => setEditorOpen(false)}
            onCancel={() => setEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteTemplate.isPending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
