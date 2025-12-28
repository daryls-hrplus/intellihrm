import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  Percent,
  Building2,
  Calculator,
  Layers,
} from "lucide-react";

interface CostComponent {
  id: string;
  name: string;
  code: string;
  component_type: string;
  calculation_method: string;
  default_value: number | null;
  default_percentage: number | null;
  is_taxable: boolean;
  is_active: boolean;
  display_order: number;
}

export default function PositionBudgetCostConfigPage() {
  const queryClient = useQueryClient();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingComponent, setEditingComponent] = useState<CostComponent | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    component_type: "other",
    calculation_method: "fixed",
    default_value: "",
    default_percentage: "",
    is_taxable: false,
    is_active: true,
    display_order: 0,
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["companies-cost-config"],
    queryFn: async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
  });

  const { data: costComponents = [], isLoading } = useQuery({
    queryKey: ["position-cost-components", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data } = await supabase
        .from("position_cost_components")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .order("display_order");
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        company_id: selectedCompanyId,
        name: formData.name,
        code: formData.code.toUpperCase(),
        component_type: formData.component_type,
        calculation_method: formData.calculation_method,
        default_value: formData.default_value ? parseFloat(formData.default_value) : null,
        default_percentage: formData.default_percentage ? parseFloat(formData.default_percentage) : null,
        is_taxable: formData.is_taxable,
        is_active: formData.is_active,
        display_order: formData.display_order,
      };

      if (editingComponent) {
        const { error } = await supabase
          .from("position_cost_components")
          .update(payload)
          .eq("id", editingComponent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("position_cost_components")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingComponent ? "Component updated" : "Component created");
      setShowAddDialog(false);
      setEditingComponent(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["position-cost-components"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("position_cost_components")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Component deleted");
      queryClient.invalidateQueries({ queryKey: ["position-cost-components"] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      component_type: "other",
      calculation_method: "fixed",
      default_value: "",
      default_percentage: "",
      is_taxable: false,
      is_active: true,
      display_order: costComponents.length,
    });
  };

  const openEditDialog = (component: CostComponent) => {
    setEditingComponent(component);
    setFormData({
      name: component.name,
      code: component.code,
      component_type: component.component_type,
      calculation_method: component.calculation_method,
      default_value: component.default_value?.toString() || "",
      default_percentage: component.default_percentage?.toString() || "",
      is_taxable: component.is_taxable,
      is_active: component.is_active,
      display_order: component.display_order,
    });
    setShowAddDialog(true);
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      base_salary: "bg-primary/10 text-primary",
      bonus: "bg-emerald-500/10 text-emerald-600",
      benefits: "bg-blue-500/10 text-blue-600",
      employer_taxes: "bg-amber-500/10 text-amber-600",
      allowances: "bg-violet-500/10 text-violet-600",
      overhead: "bg-rose-500/10 text-rose-600",
      other: "bg-muted text-muted-foreground",
    };
    return <Badge className={styles[type] || styles.other}>{type.replace("_", " ")}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Compensation", href: "/compensation" },
            { label: "Position-Based Budgeting", href: "/compensation/position-budget" },
            { label: "Cost Components" },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/compensation/position-budget">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
              <Settings className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Cost Components
              </h1>
              <p className="text-muted-foreground">
                Configure fully loaded cost calculation components
              </p>
            </div>
          </div>
          {selectedCompanyId && (
            <Dialog open={showAddDialog} onOpenChange={(open) => {
              setShowAddDialog(open);
              if (!open) {
                setEditingComponent(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Component
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingComponent ? "Edit Cost Component" : "Add Cost Component"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Health Insurance"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Code *</Label>
                      <Input
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="e.g., HEALTH_INS"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Component Type</Label>
                      <Select
                        value={formData.component_type}
                        onValueChange={(v) => setFormData({ ...formData, component_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="base_salary">Base Salary</SelectItem>
                          <SelectItem value="bonus">Bonus</SelectItem>
                          <SelectItem value="benefits">Benefits</SelectItem>
                          <SelectItem value="employer_taxes">Employer Taxes</SelectItem>
                          <SelectItem value="allowances">Allowances</SelectItem>
                          <SelectItem value="overhead">Overhead</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Calculation Method</Label>
                      <Select
                        value={formData.calculation_method}
                        onValueChange={(v) => setFormData({ ...formData, calculation_method: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                          <SelectItem value="percentage_of_base">% of Base Salary</SelectItem>
                          <SelectItem value="percentage_of_total">% of Total Comp</SelectItem>
                          <SelectItem value="formula">Custom Formula</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {formData.calculation_method === "fixed" ? (
                      <div className="space-y-2">
                        <Label>Default Amount</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            className="pl-9"
                            value={formData.default_value}
                            onChange={(e) => setFormData({ ...formData, default_value: e.target.value })}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>Default Percentage</Label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.1"
                            className="pl-9"
                            value={formData.default_percentage}
                            onChange={(e) => setFormData({ ...formData, default_percentage: e.target.value })}
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Display Order</Label>
                      <Input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_taxable}
                        onCheckedChange={(v) => setFormData({ ...formData, is_taxable: v })}
                      />
                      <Label>Taxable</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                      />
                      <Label>Active</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => saveMutation.mutate()}
                    disabled={!formData.name || !formData.code || saveMutation.isPending}
                  >
                    {editingComponent ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Company Selection */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a company to configure" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedCompanyId && (
          <Card>
            <CardHeader>
              <CardTitle>Cost Components</CardTitle>
              <CardDescription>
                Define the components that make up fully loaded cost per position
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : costComponents.length === 0 ? (
                <div className="text-center py-8">
                  <Layers className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No cost components configured</p>
                  <p className="text-sm text-muted-foreground">Add components to calculate fully loaded costs</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Calculation</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {costComponents.map((component: CostComponent) => (
                      <TableRow key={component.id}>
                        <TableCell className="font-medium">{component.name}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {component.code}
                          </code>
                        </TableCell>
                        <TableCell>{getTypeBadge(component.component_type)}</TableCell>
                        <TableCell>
                          {component.calculation_method === "fixed" ? "Fixed Amount" :
                           component.calculation_method === "percentage_of_base" ? "% of Base" :
                           component.calculation_method === "percentage_of_total" ? "% of Total" :
                           "Formula"}
                        </TableCell>
                        <TableCell>
                          {component.calculation_method === "fixed"
                            ? component.default_value ? `$${component.default_value.toLocaleString()}` : "-"
                            : component.default_percentage ? `${component.default_percentage}%` : "-"
                          }
                        </TableCell>
                        <TableCell>
                          {component.is_active ? (
                            <Badge className="bg-success/10 text-success">Active</Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(component)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => deleteMutation.mutate(component.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Explanation Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Calculator className="h-5 w-5 text-info mt-0.5" />
              <div>
                <p className="font-medium">Fully Loaded Cost Calculation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Fully loaded cost = Base Salary + Bonus + Benefits + Employer Taxes + Allowances + Overhead + Other Costs
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Configure each component type with either a fixed amount or a percentage of base salary/total compensation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
