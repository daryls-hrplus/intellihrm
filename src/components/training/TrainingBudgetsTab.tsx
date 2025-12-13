import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

interface TrainingBudgetsTabProps {
  companyId: string;
}

interface Budget {
  id: string;
  fiscal_year: number;
  allocated_amount: number;
  spent_amount: number;
  currency: string;
  department: { name: string } | null;
}

export function TrainingBudgetsTab({ companyId }: TrainingBudgetsTabProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    department_id: "",
    fiscal_year: new Date().getFullYear().toString(),
    allocated_amount: "",
    spent_amount: "0",
    currency: "USD",
  });

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    const [budgetsRes, deptsRes] = await Promise.all([
      supabase
        .from("training_budgets")
        .select("*, department:departments(name)")
        .eq("company_id", companyId)
        .order("fiscal_year", { ascending: false }),
      supabase
        .from("departments")
        .select("id, name")
        .eq("company_id", companyId)
        .eq("is_active", true),
    ]);

    if (budgetsRes.data) setBudgets(budgetsRes.data);
    if (deptsRes.data) setDepartments(deptsRes.data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.fiscal_year || !formData.allocated_amount) {
      toast.error("Fiscal year and allocated amount are required");
      return;
    }

    const payload = {
      company_id: companyId,
      department_id: formData.department_id || null,
      fiscal_year: parseInt(formData.fiscal_year),
      allocated_amount: parseFloat(formData.allocated_amount),
      spent_amount: parseFloat(formData.spent_amount) || 0,
      currency: formData.currency,
    };

    if (editingId) {
      const { error } = await supabase.from("training_budgets").update(payload).eq("id", editingId);
      if (error) {
        toast.error("Failed to update budget");
      } else {
        toast.success("Budget updated");
        closeDialog();
        loadData();
      }
    } else {
      const { error } = await supabase.from("training_budgets").insert(payload);
      if (error) {
        toast.error("Failed to create budget");
      } else {
        toast.success("Budget created");
        closeDialog();
        loadData();
      }
    }
  };

  const openEdit = (budget: Budget) => {
    setEditingId(budget.id);
    setFormData({
      department_id: budget.department ? departments.find((d) => d.name === budget.department?.name)?.id || "" : "",
      fiscal_year: budget.fiscal_year.toString(),
      allocated_amount: budget.allocated_amount.toString(),
      spent_amount: budget.spent_amount.toString(),
      currency: budget.currency,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData({
      department_id: "",
      fiscal_year: new Date().getFullYear().toString(),
      allocated_amount: "",
      spent_amount: "0",
      currency: "USD",
    });
  };

  const totalAllocated = budgets.filter((b) => b.fiscal_year === new Date().getFullYear()).reduce((sum, b) => sum + b.allocated_amount, 0);
  const totalSpent = budgets.filter((b) => b.fiscal_year === new Date().getFullYear()).reduce((sum, b) => sum + b.spent_amount, 0);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Allocated ({new Date().getFullYear()})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAllocated.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalAllocated - totalSpent).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Training Budgets</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Budget</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Budget" : "Create Budget"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Department (leave empty for company-wide)</Label>
                  <Select value={formData.department_id} onValueChange={(v) => setFormData({ ...formData, department_id: v })}>
                    <SelectTrigger><SelectValue placeholder="All Departments" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Departments</SelectItem>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fiscal Year *</Label>
                  <Input type="number" value={formData.fiscal_year} onChange={(e) => setFormData({ ...formData, fiscal_year: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Allocated Amount *</Label>
                    <Input type="number" value={formData.allocated_amount} onChange={(e) => setFormData({ ...formData, allocated_amount: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Spent Amount</Label>
                    <Input type="number" value={formData.spent_amount} onChange={(e) => setFormData({ ...formData, spent_amount: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button onClick={handleSubmit}>{editingId ? "Update" : "Create"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Allocated</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => {
                const utilization = budget.allocated_amount > 0 ? (budget.spent_amount / budget.allocated_amount) * 100 : 0;
                return (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">{budget.fiscal_year}</TableCell>
                    <TableCell>{budget.department?.name || "All Departments"}</TableCell>
                    <TableCell>{budget.currency} {budget.allocated_amount.toLocaleString()}</TableCell>
                    <TableCell>{budget.currency} {budget.spent_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={utilization} className="w-20" />
                        <span className="text-sm">{utilization.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(budget)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {budgets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">No budgets defined</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
