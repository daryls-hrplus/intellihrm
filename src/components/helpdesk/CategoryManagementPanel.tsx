import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, Lock, Loader2, FolderCog, GripVertical } from "lucide-react";

interface Category {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  visible_to_employees: boolean | null;
  visible_to_hr_only: boolean | null;
  display_order: number | null;
  icon: string | null;
}

export function CategoryManagementPanel() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    is_active: true,
    visible_to_employees: true,
    visible_to_hr_only: false,
    display_order: 0,
    icon: "",
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["category-management"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_categories")
        .select("*")
        .order("display_order")
        .order("name");
      if (error) throw error;
      return data as Category[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("ticket_categories").insert({
        name: data.name,
        code: data.code.toLowerCase().replace(/\s+/g, "-"),
        description: data.description || null,
        is_active: data.is_active,
        visible_to_employees: data.visible_to_employees,
        visible_to_hr_only: data.visible_to_hr_only,
        display_order: data.display_order,
        icon: data.icon || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-management"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-categories"] });
      toast.success("Category created");
      resetForm();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("ticket_categories")
        .update({
          name: data.name,
          code: data.code.toLowerCase().replace(/\s+/g, "-"),
          description: data.description || null,
          is_active: data.is_active,
          visible_to_employees: data.visible_to_employees,
          visible_to_hr_only: data.visible_to_hr_only,
          display_order: data.display_order,
          icon: data.icon || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-management"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-categories"] });
      toast.success("Category updated");
      resetForm();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ticket_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-management"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-categories"] });
      toast.success("Category deleted");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      is_active: true,
      visible_to_employees: true,
      visible_to_hr_only: false,
      display_order: 0,
      icon: "",
    });
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      code: category.code,
      description: category.description || "",
      is_active: category.is_active,
      visible_to_employees: category.visible_to_employees ?? true,
      visible_to_hr_only: category.visible_to_hr_only ?? false,
      display_order: category.display_order ?? 0,
      icon: category.icon || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code) {
      toast.error("Name and code are required");
      return;
    }
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const activeCategories = categories.filter(c => c.is_active);
  const inactiveCategories = categories.filter(c => !c.is_active);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderCog className="h-5 w-5" />
              Category Management
            </CardTitle>
            <CardDescription>
              Create, edit, and manage ticket categories. Control visibility for employees vs HR-only categories.
            </CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Order</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                      {category.display_order}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{category.code}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <p className="text-sm text-muted-foreground line-clamp-2">{category.description || "-"}</p>
                  </TableCell>
                  <TableCell>
                    {category.visible_to_hr_only ? (
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-200">
                        <Lock className="h-3 w-3 mr-1" />
                        HR Only
                      </Badge>
                    ) : category.visible_to_employees ? (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                        <Eye className="h-3 w-3 mr-1" />
                        Employee
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-500/10 text-gray-600">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Hidden
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this category?")) {
                            deleteMutation.mutate(category.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {inactiveCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">Inactive Categories ({inactiveCategories.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableBody>
                {inactiveCategories.map((category) => (
                  <TableRow key={category.id} className="opacity-60">
                    <TableCell>{category.display_order}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{category.code}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[250px] text-sm text-muted-foreground">{category.description || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-500/10 text-gray-600">Inactive</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Leave Management"
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="leave"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description shown to employees when selecting this category"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Icon (Lucide name)</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Calendar"
                />
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Active</Label>
                  <p className="text-xs text-muted-foreground">Category is available for use</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Visible to Employees</Label>
                  <p className="text-xs text-muted-foreground">Employees can select this when creating tickets</p>
                </div>
                <Switch
                  checked={formData.visible_to_employees}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    visible_to_employees: checked,
                    visible_to_hr_only: checked ? false : formData.visible_to_hr_only 
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>HR Only</Label>
                  <p className="text-xs text-muted-foreground">Only HR can use this category (hidden from employees)</p>
                </div>
                <Switch
                  checked={formData.visible_to_hr_only}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    visible_to_hr_only: checked,
                    visible_to_employees: checked ? false : formData.visible_to_employees 
                  })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
