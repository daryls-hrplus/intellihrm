import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

type ImmigrationCodeCategory = 
  | "immigration_document_types"
  | "immigration_categories"
  | "immigration_permit_statuses"
  | "csme_skill_categories"
  | "immigration_dependent_types"
  | "travel_document_types";

interface ImmigrationCodeConfig {
  label: string;
  description: string;
  tableName: string;
  extraFields?: string[];
}

const IMMIGRATION_CODE_CONFIG: Record<ImmigrationCodeCategory, ImmigrationCodeConfig> = {
  immigration_document_types: {
    label: "Document Types",
    description: "Types of immigration documents (passports, visas, permits, etc.)",
    tableName: "immigration_document_types",
    extraFields: ["category", "requires_expiry", "requires_issue_date"],
  },
  immigration_categories: {
    label: "Immigration Categories",
    description: "Categories for immigration permits and visas by country",
    tableName: "immigration_categories",
    extraFields: ["country_code", "permit_duration_months", "is_work_authorized", "is_renewable"],
  },
  immigration_permit_statuses: {
    label: "Permit Statuses",
    description: "Status values for work permits and immigration documents",
    tableName: "immigration_permit_statuses",
    extraFields: ["is_terminal", "status_color", "allows_work"],
  },
  csme_skill_categories: {
    label: "CSME Skill Categories",
    description: "CARICOM Single Market skill categories for free movement",
    tableName: "csme_skill_categories",
    extraFields: ["skill_level", "eligible_countries"],
  },
  immigration_dependent_types: {
    label: "Dependent Types",
    description: "Types of dependents for immigration purposes",
    tableName: "immigration_dependent_types",
    extraFields: ["max_age", "requires_proof"],
  },
  travel_document_types: {
    label: "Travel Document Types",
    description: "Types of travel documents (passport, travel card, etc.)",
    tableName: "travel_document_types",
    extraFields: ["is_identity_doc", "validity_years"],
  },
};

interface BaseImmigrationCode {
  id: string;
  company_id: string | null;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface ImmigrationCodeForm {
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  display_order: number;
}

const defaultFormValues: ImmigrationCodeForm = {
  code: "",
  name: "",
  description: "",
  is_active: true,
  display_order: 0,
};

export function ImmigrationCodesManagement() {
  const [activeCategory, setActiveCategory] = useState<ImmigrationCodeCategory>("immigration_document_types");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<BaseImmigrationCode | null>(null);
  const [formData, setFormData] = useState<ImmigrationCodeForm>(defaultFormValues);
  const queryClient = useQueryClient();

  const config = IMMIGRATION_CODE_CONFIG[activeCategory];

  const { data: codes, isLoading } = useQuery({
    queryKey: ["immigration-codes", activeCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(config.tableName as any)
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as unknown as BaseImmigrationCode[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: ImmigrationCodeForm) => {
      const { data, error } = await supabase
        .from(config.tableName as any)
        .insert([{
          code: values.code.toUpperCase().replace(/\s+/g, "_"),
          name: values.name,
          description: values.description || null,
          display_order: values.display_order,
          is_active: values.is_active,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immigration-codes", activeCategory] });
      toast.success("Immigration code created successfully");
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ImmigrationCodeForm }) => {
      const { data, error } = await supabase
        .from(config.tableName as any)
        .update({
          code: values.code.toUpperCase().replace(/\s+/g, "_"),
          name: values.name,
          description: values.description || null,
          display_order: values.display_order,
          is_active: values.is_active,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immigration-codes", activeCategory] });
      toast.success("Immigration code updated successfully");
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(config.tableName as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immigration-codes", activeCategory] });
      toast.success("Immigration code deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const handleOpenDialog = (value?: BaseImmigrationCode) => {
    if (value) {
      setEditingValue(value);
      setFormData({
        code: value.code,
        name: value.name,
        description: value.description || "",
        is_active: value.is_active,
        display_order: value.display_order,
      });
    } else {
      setEditingValue(null);
      setFormData({
        ...defaultFormValues,
        display_order: (codes?.length || 0) + 1,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingValue(null);
    setFormData(defaultFormValues);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      toast.error("Code and Name are required");
      return;
    }

    if (editingValue) {
      updateMutation.mutate({ id: editingValue.id, values: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (value: BaseImmigrationCode) => {
    if (confirm(`Are you sure you want to delete "${value.name}"?`)) {
      deleteMutation.mutate(value.id);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as ImmigrationCodeCategory)}>
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Immigration
          </h4>
          <TabsList className="flex flex-wrap h-auto gap-1">
            {Object.entries(IMMIGRATION_CODE_CONFIG).map(([key, cfg]) => (
              <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">
                {cfg.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {Object.entries(IMMIGRATION_CODE_CONFIG).map(([category, cfg]) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{cfg.label}</h3>
                <p className="text-sm text-muted-foreground">{cfg.description}</p>
              </div>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add {cfg.label.replace(/s$/, "")}
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Order</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {codes?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No values defined. Click "Add" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      codes?.map((value) => (
                        <TableRow key={value.id} className={!value.is_active ? "opacity-50" : ""}>
                          <TableCell className="font-mono text-xs">{value.code}</TableCell>
                          <TableCell className="font-medium">{value.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {value.description || "-"}
                          </TableCell>
                          <TableCell className="text-center">{value.display_order}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={value.is_active ? "default" : "secondary"}>
                              {value.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(value)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(value)}
                                disabled={deleteMutation.isPending}
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
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingValue ? "Edit" : "Add"} {config.label.replace(/s$/, "")}
            </DialogTitle>
            <DialogDescription>
              {editingValue ? "Update the details below" : "Enter the details for the new code"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., WORK_PERMIT"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Work Permit"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingValue ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
