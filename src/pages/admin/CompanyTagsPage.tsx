import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tag, Plus, Pencil, Trash2, Loader2, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageAudit } from "@/hooks/usePageAudit";

interface CompanyTag {
  id: string;
  name: string;
  code: string;
  description: string | null;
  color: string;
  is_active: boolean;
  created_at: string;
  company_count?: number;
}

const COLOR_OPTIONS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
];

const breadcrumbItems = [
  { label: "Admin", href: "/admin" },
  { label: "Company Tags" },
];

export default function CompanyTagsPage() {
  usePageAudit('company_tags', 'Admin');
  const [tags, setTags] = useState<CompanyTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<CompanyTag | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    color: "#6366f1",
    is_active: true,
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const { data: tagsData, error } = await supabase
        .from("company_tags")
        .select("*")
        .order("name");

      if (error) throw error;

      // Get company counts for each tag
      const { data: assignmentCounts } = await supabase
        .from("company_tag_assignments")
        .select("tag_id");

      const countMap = (assignmentCounts || []).reduce((acc, curr) => {
        acc[curr.tag_id] = (acc[curr.tag_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const tagsWithCounts = (tagsData || []).map(tag => ({
        ...tag,
        company_count: countMap[tag.id] || 0,
      }));

      setTags(tagsWithCounts);
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast({
        title: "Error",
        description: "Failed to load company tags.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setSelectedTag(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      color: "#6366f1",
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (tag: CompanyTag) => {
    setSelectedTag(tag);
    setFormData({
      name: tag.name,
      code: tag.code,
      description: tag.description || "",
      color: tag.color,
      is_active: tag.is_active,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (tag: CompanyTag) => {
    setSelectedTag(tag);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and code are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (selectedTag) {
        const { error } = await supabase
          .from("company_tags")
          .update({
            name: formData.name,
            description: formData.description || null,
            color: formData.color,
            is_active: formData.is_active,
          })
          .eq("id", selectedTag.id);

        if (error) throw error;
        toast({ title: "Tag updated successfully" });
      } else {
        const { error } = await supabase.from("company_tags").insert({
          name: formData.name,
          code: formData.code.toLowerCase().replace(/\s+/g, "_"),
          description: formData.description || null,
          color: formData.color,
          is_active: formData.is_active,
        });

        if (error) throw error;
        toast({ title: "Tag created successfully" });
      }

      setIsDialogOpen(false);
      fetchTags();
    } catch (error: any) {
      console.error("Error saving tag:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save tag.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTag) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("company_tags")
        .delete()
        .eq("id", selectedTag.id);

      if (error) throw error;

      toast({ title: "Tag deleted successfully" });
      setIsDeleteDialogOpen(false);
      fetchTags();
    } catch (error: any) {
      console.error("Error deleting tag:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete tag.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Company Tags</h1>
            <p className="text-muted-foreground mt-1">
              Group companies using tags for scoped admin access (e.g., Spanish-speaking, Caribbean region)
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Companies</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No company tags found. Create your first tag to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  tags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="font-medium">{tag.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {tag.code}
                        </code>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {tag.description || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{tag.company_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tag.is_active ? "default" : "secondary"}>
                          {tag.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(tag)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => openDeleteDialog(tag)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedTag ? "Edit Company Tag" : "Create Company Tag"}
              </DialogTitle>
              <DialogDescription>
                {selectedTag
                  ? "Update tag settings"
                  : "Create a new tag to group companies"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Tag Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Spanish Speaking"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Tag Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="e.g., spanish_speaking"
                    disabled={!!selectedTag}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this tag"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "w-8 h-8 rounded-full transition-all",
                        formData.color === color && "ring-2 ring-offset-2 ring-primary"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Inactive tags won't be available for assignment
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedTag ? "Update Tag" : "Create Tag"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Company Tag</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedTag?.name}"? This will also remove
                all company assignments for this tag. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isSaving}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
