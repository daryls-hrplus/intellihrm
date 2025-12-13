import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLeaveManagement, LeaveAccrualRule } from "@/hooks/useLeaveManagement";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Plus, TrendingUp } from "lucide-react";

export default function LeaveAccrualRulesPage() {
  const { company } = useAuth();
  const { leaveTypes, accrualRules, loadingAccrualRules, createAccrualRule } = useLeaveManagement(company?.id);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    leave_type_id: "",
    name: "",
    description: "",
    accrual_frequency: "monthly" as "monthly" | "annually" | "bi_weekly" | "weekly",
    accrual_amount: 0,
    years_of_service_min: 0,
    years_of_service_max: null as number | null,
    employee_status: "",
    employee_type: "",
    priority: 0,
  });

  const resetForm = () => {
    setFormData({
      leave_type_id: "",
      name: "",
      description: "",
      accrual_frequency: "monthly",
      accrual_amount: 0,
      years_of_service_min: 0,
      years_of_service_max: null,
      employee_status: "",
      employee_type: "",
      priority: 0,
    });
  };

  const handleSubmit = async () => {
    if (!company?.id || !formData.leave_type_id) return;

    await createAccrualRule.mutateAsync({
      ...formData,
      company_id: company.id,
      years_of_service_max: formData.years_of_service_max || undefined,
      employee_status: formData.employee_status || undefined,
      employee_type: formData.employee_type || undefined,
    });
    setIsOpen(false);
    resetForm();
  };

  const frequencyLabels: Record<string, string> = {
    monthly: "Monthly",
    annually: "Annually",
    bi_weekly: "Bi-Weekly",
    weekly: "Weekly",
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Leave Management", href: "/leave" },
            { label: "Accrual Rules" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave Accrual Rules</h1>
              <p className="text-muted-foreground">Configure how leave is earned based on tenure and other factors</p>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Accrual Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Accrual Rule</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leave_type">Leave Type *</Label>
                    <Select
                      value={formData.leave_type_id}
                      onValueChange={(value) => setFormData({ ...formData, leave_type_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Rule Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Standard Accrual"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description of the accrual rule"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Accrual Frequency *</Label>
                    <Select
                      value={formData.accrual_frequency}
                      onValueChange={(value: "monthly" | "annually" | "bi_weekly" | "weekly") => 
                        setFormData({ ...formData, accrual_frequency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accrual_amount">Accrual Amount *</Label>
                    <Input
                      id="accrual_amount"
                      type="number"
                      step="0.25"
                      value={formData.accrual_amount}
                      onChange={(e) => setFormData({ ...formData, accrual_amount: parseFloat(e.target.value) || 0 })}
                      placeholder="Amount per period"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yos_min">Min Years of Service</Label>
                    <Input
                      id="yos_min"
                      type="number"
                      value={formData.years_of_service_min}
                      onChange={(e) => setFormData({ ...formData, years_of_service_min: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yos_max">Max Years of Service</Label>
                    <Input
                      id="yos_max"
                      type="number"
                      value={formData.years_of_service_max || ""}
                      onChange={(e) => setFormData({ ...formData, years_of_service_max: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="No limit"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee_status">Employee Status (Optional)</Label>
                    <Input
                      id="employee_status"
                      value={formData.employee_status}
                      onChange={(e) => setFormData({ ...formData, employee_status: e.target.value })}
                      placeholder="e.g., Full-Time"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employee_type">Employee Type (Optional)</Label>
                    <Input
                      id="employee_type"
                      value={formData.employee_type}
                      onChange={(e) => setFormData({ ...formData, employee_type: e.target.value })}
                      placeholder="e.g., Permanent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority (Higher = Applied First)</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={!formData.name || !formData.leave_type_id}>
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Years of Service</TableHead>
                <TableHead>Employee Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingAccrualRules ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : accrualRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No accrual rules configured. Add rules to define how leave is earned.
                  </TableCell>
                </TableRow>
              ) : (
                accrualRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: rule.leave_type?.color || "#3B82F6" }} 
                        />
                        {rule.leave_type?.name || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell>{frequencyLabels[rule.accrual_frequency]}</TableCell>
                    <TableCell>{rule.accrual_amount}</TableCell>
                    <TableCell>
                      {rule.years_of_service_min} - {rule.years_of_service_max || "∞"} years
                    </TableCell>
                    <TableCell>{rule.employee_status || "All"}</TableCell>
                    <TableCell>{rule.priority}</TableCell>
                    <TableCell>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
