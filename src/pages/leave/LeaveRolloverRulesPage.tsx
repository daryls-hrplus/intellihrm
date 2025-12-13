import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";
import { useAuth } from "@/contexts/AuthContext";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Plus, RotateCcw } from "lucide-react";

export default function LeaveRolloverRulesPage() {
  const { company } = useAuth();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { leaveTypes, rolloverRules, loadingRolloverRules, createRolloverRule } = useLeaveManagement(selectedCompanyId);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    leave_type_id: "",
    max_rollover_amount: null as number | null,
    max_balance_cap: null as number | null,
    rollover_expiry_months: null as number | null,
    forfeit_unused: false,
  });

  const resetForm = () => {
    setFormData({
      leave_type_id: "",
      max_rollover_amount: null,
      max_balance_cap: null,
      rollover_expiry_months: null,
      forfeit_unused: false,
    });
  };

  const handleSubmit = async () => {
    if (!selectedCompanyId || !formData.leave_type_id) return;

    await createRolloverRule.mutateAsync({
      ...formData,
      company_id: selectedCompanyId,
    });
    setIsOpen(false);
    resetForm();
  };

  // Filter out leave types that already have rollover rules
  const availableLeaveTypes = leaveTypes.filter(
    (type) => !rolloverRules.some((rule) => rule.leave_type_id === type.id)
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Leave Management", href: "/leave" },
            { label: "Rollover Rules" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <RotateCcw className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave Rollover Rules</h1>
              <p className="text-muted-foreground">Configure year-end leave balance rollover policies</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LeaveCompanyFilter 
              selectedCompanyId={selectedCompanyId} 
              onCompanyChange={setSelectedCompanyId} 
            />
            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button disabled={availableLeaveTypes.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Rollover Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Rollover Rule</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                      {availableLeaveTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_rollover">Max Rollover Amount</Label>
                  <Input
                    id="max_rollover"
                    type="number"
                    value={formData.max_rollover_amount || ""}
                    onChange={(e) => setFormData({ ...formData, max_rollover_amount: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="No limit"
                  />
                  <p className="text-xs text-muted-foreground">Maximum amount that can roll over to next year</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_balance">Max Balance Cap</Label>
                  <Input
                    id="max_balance"
                    type="number"
                    value={formData.max_balance_cap || ""}
                    onChange={(e) => setFormData({ ...formData, max_balance_cap: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="No limit"
                  />
                  <p className="text-xs text-muted-foreground">Absolute maximum balance limit</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry_months">Rollover Expiry (Months)</Label>
                  <Input
                    id="expiry_months"
                    type="number"
                    value={formData.rollover_expiry_months || ""}
                    onChange={(e) => setFormData({ ...formData, rollover_expiry_months: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Never expires"
                  />
                  <p className="text-xs text-muted-foreground">Months before rolled-over balance expires</p>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="forfeit_unused">Forfeit Unused Balance</Label>
                    <p className="text-xs text-muted-foreground">Any balance exceeding limits is lost</p>
                  </div>
                  <Switch
                    id="forfeit_unused"
                    checked={formData.forfeit_unused}
                    onCheckedChange={(checked) => setFormData({ ...formData, forfeit_unused: checked })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={!formData.leave_type_id}>
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                <TableHead>Max Rollover</TableHead>
                <TableHead>Max Balance Cap</TableHead>
                <TableHead>Expiry (Months)</TableHead>
                <TableHead>Forfeit Unused</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingRolloverRules ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : rolloverRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No rollover rules configured. Add rules to define year-end balance handling.
                  </TableCell>
                </TableRow>
              ) : (
                rolloverRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: rule.leave_type?.color || "#3B82F6" }} 
                        />
                        {rule.leave_type?.name || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rule.max_rollover_amount !== null ? `${rule.max_rollover_amount}` : "No limit"}
                    </TableCell>
                    <TableCell>
                      {rule.max_balance_cap !== null ? `${rule.max_balance_cap}` : "No limit"}
                    </TableCell>
                    <TableCell>
                      {rule.rollover_expiry_months !== null ? `${rule.rollover_expiry_months} months` : "Never"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.forfeit_unused ? "destructive" : "secondary"}>
                        {rule.forfeit_unused ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
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
