import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FileText, Search, Eye, Sparkles, ChevronDown, AlertTriangle, Loader2, Check, X } from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useTemplateAI } from "@/hooks/useTemplateAI";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CannedResponse {
  id: string;
  title: string;
  content: string;
  category_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: { name: string } | null;
}

const AVAILABLE_VARIABLES = [
  { key: "{employee_name}", desc: "Employee's full name" },
  { key: "{ticket_number}", desc: "Ticket reference number" },
  { key: "{category}", desc: "Ticket category name" },
  { key: "{submitted_date}", desc: "Date ticket was submitted" },
  { key: "{company_name}", desc: "Company name" },
];

export function CannedResponseManagementPanel() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [existingOpen, setExistingOpen] = useState(false);
  const [improvedContent, setImprovedContent] = useState<string | null>(null);
  const [editingResponse, setEditingResponse] = useState<CannedResponse | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category_id: "",
    is_active: true,
  });

  const { isGenerating, isImproving, suggestions, suggestTemplates, improveContent, clearSuggestions } = useTemplateAI();

  const { data: responses = [], isLoading } = useQuery({
    queryKey: ["canned-responses-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("canned_responses")
        .select(`*, category:ticket_categories(name)`)
        .order("title");
      if (error) throw error;
      return data as CannedResponse[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["ticket-categories-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_categories")
        .select("id, name")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("canned_responses").insert({
        title: data.title,
        content: data.content,
        category_id: data.category_id || null,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canned-responses-admin"] });
      toast.success("Template created successfully");
      handleClose();
    },
    onError: () => toast.error("Failed to create template"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("canned_responses")
        .update({
          title: data.title,
          content: data.content,
          category_id: data.category_id || null,
          is_active: data.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canned-responses-admin"] });
      toast.success("Template updated successfully");
      handleClose();
    },
    onError: () => toast.error("Failed to update template"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("canned_responses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canned-responses-admin"] });
      toast.success("Template deleted");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete template"),
  });

  const handleClose = () => {
    setDialogOpen(false);
    setEditingResponse(null);
    setFormData({ title: "", content: "", category_id: "", is_active: true });
    setImprovedContent(null);
    setExistingOpen(false);
    clearSuggestions();
  };

  const handleEdit = (response: CannedResponse) => {
    setEditingResponse(response);
    setFormData({
      title: response.title,
      content: response.content,
      category_id: response.category_id || "",
      is_active: response.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    if (editingResponse) {
      updateMutation.mutate({ id: editingResponse.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const insertVariable = (variable: string) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content + variable,
    }));
  };

  const filteredResponses = responses.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Templates for the selected category
  const templatesForCategory = useMemo(() => {
    if (!formData.category_id) {
      return responses.filter((r) => !r.category_id);
    }
    return responses.filter((r) => r.category_id === formData.category_id);
  }, [responses, formData.category_id]);

  // Check for similar title
  const hasSimilarTitle = useMemo(() => {
    if (!formData.title.trim()) return false;
    const lowerTitle = formData.title.toLowerCase().trim();
    return templatesForCategory.some(
      (t) =>
        t.id !== editingResponse?.id &&
        (t.title.toLowerCase().includes(lowerTitle) || lowerTitle.includes(t.title.toLowerCase()))
    );
  }, [templatesForCategory, formData.title, editingResponse]);

  const selectedCategoryName = useMemo(() => {
    if (!formData.category_id) return "All Categories";
    return categories.find((c) => c.id === formData.category_id)?.name || "Selected Category";
  }, [formData.category_id, categories]);

  const handleSuggestTemplates = async () => {
    const existingTitles = templatesForCategory.map((t) => t.title);
    await suggestTemplates(selectedCategoryName, existingTitles);
  };

  const handleImproveContent = async () => {
    if (!formData.content.trim()) {
      toast.error("Please enter some content first");
      return;
    }
    const result = await improveContent(formData.content);
    if (result) {
      setImprovedContent(result);
    }
  };

  const acceptImprovedContent = () => {
    if (improvedContent) {
      setFormData((prev) => ({ ...prev, content: improvedContent }));
      setImprovedContent(null);
      toast.success("Improved content applied");
    }
  };

  const applySuggestion = (suggestion: { title: string; content: string }) => {
    setFormData((prev) => ({
      ...prev,
      title: suggestion.title,
      content: suggestion.content,
    }));
    clearSuggestions();
    toast.success("Template suggestion applied");
  };

  const getPreviewContent = () => {
    return formData.content
      .replace("{employee_name}", "John Smith")
      .replace("{ticket_number}", "TKT-2026-0001")
      .replace("{category}", "Leave Management")
      .replace("{submitted_date}", "January 8, 2026")
      .replace("{company_name}", "Acme Corporation");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Canned Response Templates
            </CardTitle>
            <CardDescription>
              Create and manage response templates for quick replies
            </CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredResponses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No templates found
                </TableCell>
              </TableRow>
            ) : (
              filteredResponses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{response.title}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                        {response.content.substring(0, 60)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {response.category?.name ? (
                      <Badge variant="outline">{response.category.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">All Categories</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={response.is_active ? "default" : "secondary"}>
                      {response.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateForDisplay(response.updated_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(response)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(response.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingResponse ? "Edit Template" : "Create Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <div className="flex items-center gap-2">
                <Label>
                  Title <span className="text-destructive">*</span>
                </Label>
                {hasSimilarTitle && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Similar exists
                  </Badge>
                )}
              </div>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Leave Balance Inquiry"
                className={hasSimilarTitle ? "border-amber-300" : ""}
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={formData.category_id || "__all__"}
                onValueChange={(v) => {
                  setFormData({ ...formData, category_id: v === "__all__" ? "" : v });
                  setExistingOpen(true);
                  clearSuggestions();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to use this template for all ticket types
              </p>
            </div>

            {/* Existing Templates Section */}
            {templatesForCategory.length > 0 && (
              <Collapsible open={existingOpen} onOpenChange={setExistingOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between px-3 py-2 h-auto bg-muted/50 hover:bg-muted">
                    <span className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      Existing Templates ({templatesForCategory.length})
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${existingOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="border rounded-md p-2 space-y-1 max-h-32 overflow-y-auto bg-background">
                    {templatesForCategory.map((t) => (
                      <div key={t.id} className="text-sm px-2 py-1 rounded hover:bg-muted flex items-center justify-between group">
                        <span className="truncate">{t.title}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 opacity-0 group-hover:opacity-100"
                          onClick={() => {
                            setFormData({ ...formData, title: t.title, content: t.content });
                            toast.info("Template loaded - modify as needed");
                          }}
                        >
                          Use as base
                        </Button>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* AI Suggestions Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSuggestTemplates}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating suggestions...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Suggest Templates for {selectedCategoryName}
                </>
              )}
            </Button>

            {/* AI Suggestions Display */}
            {suggestions.length > 0 && (
              <div className="border rounded-md p-3 space-y-2 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
                <Label className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  AI Suggestions
                </Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {suggestions.map((s, idx) => (
                    <div key={idx} className="p-2 rounded-md bg-background border hover:border-primary/50 cursor-pointer" onClick={() => applySuggestion(s)}>
                      <p className="font-medium text-sm">{s.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.useCase}</p>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={clearSuggestions} className="w-full">
                  Dismiss suggestions
                </Button>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>
                  Content <span className="text-destructive">*</span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleImproveContent}
                  disabled={isImproving || !formData.content.trim()}
                >
                  {isImproving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Improving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-1" />
                      AI Improve
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={formData.content}
                onChange={(e) => {
                  setFormData({ ...formData, content: e.target.value });
                  setImprovedContent(null);
                }}
                placeholder="Type your response template here..."
                rows={6}
              />
            </div>

            {/* Improved Content Comparison */}
            {improvedContent && (
              <div className="border rounded-md p-3 space-y-2 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                <Label className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-500" />
                  Improved Version
                </Label>
                <div className="p-2 rounded-md bg-background border text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {improvedContent}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={acceptImprovedContent} className="flex-1">
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setImprovedContent(null)} className="flex-1">
                    <X className="h-4 w-4 mr-1" />
                    Keep Original
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm text-muted-foreground">Available Variables</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {AVAILABLE_VARIABLES.map((v) => (
                  <Button
                    key={v.key}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(v.key)}
                    title={v.desc}
                  >
                    {v.key}
                  </Button>
                ))}
              </div>
            </div>

            {formData.content && (
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Preview</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewOpen(!previewOpen)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {previewOpen ? "Hide" : "Show"} Preview
                  </Button>
                </div>
                {previewOpen && (
                  <div className="mt-2 p-3 rounded-md bg-muted text-sm whitespace-pre-wrap">
                    {getPreviewContent()}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingResponse ? "Update Template" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The template will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
