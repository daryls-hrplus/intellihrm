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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useAuditLog } from "@/hooks/useAuditLog";

type LookupCategory = 
  | "employee_status"
  | "termination_reason"
  | "employee_type"
  | "employment_action"
  | "leave_type"
  | "contract_type"
  | "qualification_type"
  | "education_level"
  | "field_of_study"
  | "institution_name"
  | "certification_type"
  | "certification_name"
  | "accrediting_body";

interface LookupValue {
  id: string;
  category: LookupCategory;
  code: string;
  name: string;
  description: string | null;
  display_order: number;
  is_default: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

interface LookupValueForm {
  code: string;
  name: string;
  description: string;
  display_order: number;
  is_default: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

const CATEGORY_LABELS: Record<LookupCategory, string> = {
  employee_status: "Employee Statuses",
  termination_reason: "Termination Reasons",
  employee_type: "Employee Types",
  employment_action: "Employment Actions",
  leave_type: "Leave Types",
  contract_type: "Contract Types",
  qualification_type: "Qualification Types",
  education_level: "Education Levels",
  field_of_study: "Fields of Study",
  institution_name: "Institution Names",
  certification_type: "Certification Types",
  certification_name: "Certification/License Names",
  accrediting_body: "Certifying/Accrediting Bodies",
};

const CATEGORY_DESCRIPTIONS: Record<LookupCategory, string> = {
  employee_status: "Define the various employment statuses an employee can have",
  termination_reason: "Reasons for employment termination",
  employee_type: "Types of employment arrangements",
  employment_action: "Actions that can be taken on employee records",
  leave_type: "Types of leave available to employees",
  contract_type: "Types of employment contracts",
  qualification_type: "Types of qualifications (academic, professional, etc.)",
  education_level: "Levels of educational attainment",
  field_of_study: "Academic and professional fields of study",
  institution_name: "Names of educational institutions",
  certification_type: "Types of professional certifications",
  certification_name: "Names of certifications and licenses",
  accrediting_body: "Organizations that issue certifications and accreditations",
};

const defaultFormValues: LookupValueForm = {
  code: "",
  name: "",
  description: "",
  display_order: 0,
  is_default: false,
  is_active: true,
  start_date: format(new Date(), "yyyy-MM-dd"),
  end_date: "",
};

export function LookupValuesManagement() {
  const [activeCategory, setActiveCategory] = useState<LookupCategory>("employee_status");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<LookupValue | null>(null);
  const [formData, setFormData] = useState<LookupValueForm>(defaultFormValues);
  const queryClient = useQueryClient();
  const { logAction } = useAuditLog();

  const { data: lookupValues, isLoading } = useQuery({
    queryKey: ["lookup-values", activeCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lookup_values")
        .select("*")
        .eq("category", activeCategory)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as LookupValue[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: LookupValueForm) => {
      const { data, error } = await supabase
        .from("lookup_values")
        .insert([{
          category: activeCategory,
          code: values.code.toUpperCase().replace(/\s+/g, "_"),
          name: values.name,
          description: values.description || null,
          display_order: values.display_order,
          is_default: values.is_default,
          is_active: values.is_active,
          start_date: values.start_date,
          end_date: values.end_date || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lookup-values", activeCategory] });
      logAction({
        action: "CREATE",
        entityType: "lookup_value",
        entityId: data.id,
        entityName: data.name,
        newValues: data,
      });
      toast.success("Lookup value created successfully");
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: LookupValueForm }) => {
      const { data, error } = await supabase
        .from("lookup_values")
        .update({
          code: values.code.toUpperCase().replace(/\s+/g, "_"),
          name: values.name,
          description: values.description || null,
          display_order: values.display_order,
          is_default: values.is_default,
          is_active: values.is_active,
          start_date: values.start_date,
          end_date: values.end_date || null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lookup-values", activeCategory] });
      logAction({
        action: "UPDATE",
        entityType: "lookup_value",
        entityId: data.id,
        entityName: data.name,
        oldValues: editingValue as unknown as Record<string, unknown>,
        newValues: data as unknown as Record<string, unknown>,
      });
      toast.success("Lookup value updated successfully");
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lookup_values")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["lookup-values", activeCategory] });
      const deleted = lookupValues?.find(v => v.id === id);
      logAction({
        action: "DELETE",
        entityType: "lookup_value",
        entityId: id,
        entityName: deleted?.name,
        oldValues: deleted as unknown as Record<string, unknown>,
      });
      toast.success("Lookup value deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const handleOpenDialog = (value?: LookupValue) => {
    if (value) {
      setEditingValue(value);
      setFormData({
        code: value.code,
        name: value.name,
        description: value.description || "",
        display_order: value.display_order,
        is_default: value.is_default,
        is_active: value.is_active,
        start_date: value.start_date,
        end_date: value.end_date || "",
      });
    } else {
      setEditingValue(null);
      setFormData({
        ...defaultFormValues,
        display_order: (lookupValues?.length || 0) + 1,
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

  const handleDelete = (value: LookupValue) => {
    if (confirm(`Are you sure you want to delete "${value.name}"?`)) {
      deleteMutation.mutate(value.id);
    }
  };

  const isValid = (value: LookupValue) => {
    const today = new Date();
    const startDate = new Date(value.start_date);
    const endDate = value.end_date ? new Date(value.end_date) : null;
    return value.is_active && startDate <= today && (!endDate || endDate >= today);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as LookupCategory)}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(CATEGORY_LABELS).map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{CATEGORY_LABELS[category as LookupCategory]}</h3>
                <p className="text-sm text-muted-foreground">
                  {CATEGORY_DESCRIPTIONS[category as LookupCategory]}
                </p>
              </div>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Value
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
                      <TableHead className="text-center">Default</TableHead>
                      <TableHead>Validity</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lookupValues?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No values defined. Click "Add Value" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      lookupValues?.map((value) => (
                        <TableRow key={value.id} className={!isValid(value) ? "opacity-50" : ""}>
                          <TableCell className="font-mono text-xs">{value.code}</TableCell>
                          <TableCell className="font-medium">{value.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {value.description || "-"}
                          </TableCell>
                          <TableCell className="text-center">{value.display_order}</TableCell>
                          <TableCell className="text-center">
                            {value.is_default && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div>{format(new Date(value.start_date), "MMM d, yyyy")}</div>
                            {value.end_date && (
                              <div className="text-muted-foreground">
                                to {format(new Date(value.end_date), "MMM d, yyyy")}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={isValid(value) ? "default" : "outline"}>
                              {isValid(value) ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingValue ? "Edit Lookup Value" : "Add Lookup Value"}
            </DialogTitle>
            <DialogDescription>
              {editingValue 
                ? "Update the lookup value details below"
                : `Add a new value to ${CATEGORY_LABELS[activeCategory]}`
              }
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
                  placeholder="UNIQUE_CODE"
                  className="uppercase"
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
                placeholder="Display Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                />
                <Label htmlFor="is_default">Set as Default</Label>
              </div>
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
