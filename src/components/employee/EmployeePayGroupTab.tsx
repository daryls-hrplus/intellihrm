import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";

interface EmployeePayGroupTabProps {
  employeeId: string;
}

interface PayGroupFormData {
  pay_group_name: string;
  pay_frequency: string;
  payment_method: string;
  start_date: string;
  end_date: string;
  notes: string;
}

export function EmployeePayGroupTab({ employeeId }: EmployeePayGroupTabProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PayGroupFormData>({
    pay_group_name: "",
    pay_frequency: "",
    payment_method: "bank_transfer",
    start_date: getTodayString(),
    end_date: "",
    notes: "",
  });

  const { data: payGroups, isLoading } = useQuery({
    queryKey: ["employee-pay-groups", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_pay_groups")
        .select("*")
        .eq("employee_id", employeeId)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: PayGroupFormData) => {
      const payload = {
        employee_id: employeeId,
        pay_group_name: data.pay_group_name,
        pay_frequency: data.pay_frequency,
        payment_method: data.payment_method,
        start_date: data.start_date,
        end_date: data.end_date || null,
        notes: data.notes || null,
      };

      if (editingId) {
        const { error } = await supabase.from("employee_pay_groups").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employee_pay_groups").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-pay-groups", employeeId] });
      toast.success(editingId ? "Pay group updated" : "Pay group added");
      closeDialog();
    },
    onError: () => toast.error("Failed to save pay group"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employee_pay_groups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-pay-groups", employeeId] });
      toast.success("Pay group deleted");
    },
    onError: () => toast.error("Failed to delete pay group"),
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      pay_group_name: "",
      pay_frequency: "",
      payment_method: "bank_transfer",
      start_date: getTodayString(),
      end_date: "",
      notes: "",
    });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      pay_group_name: item.pay_group_name,
      pay_frequency: item.pay_frequency,
      payment_method: item.payment_method,
      start_date: item.start_date,
      end_date: item.end_date || "",
      notes: item.notes || "",
    });
    setIsDialogOpen(true);
  };

  const formatFrequency = (freq: string) => {
    const labels: Record<string, string> = {
      weekly: "Weekly",
      biweekly: "Bi-weekly",
      semimonthly: "Semi-monthly",
      monthly: "Monthly",
    };
    return labels[freq] || freq;
  };

  const formatMethod = (method: string) => {
    const labels: Record<string, string> = {
      bank_transfer: "Bank Transfer",
      check: "Check",
      cash: "Cash",
    };
    return labels[method] || method;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pay Group</CardTitle>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />Add Pay Group
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : payGroups?.length === 0 ? (
          <p className="text-muted-foreground">No pay group assigned.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pay Group</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payGroups?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.pay_group_name}</TableCell>
                  <TableCell>{formatFrequency(item.pay_frequency)}</TableCell>
                  <TableCell>{formatMethod(item.payment_method)}</TableCell>
                  <TableCell>{formatDateForDisplay(item.start_date, "PP")}</TableCell>
                  <TableCell>{item.end_date ? formatDateForDisplay(item.end_date, "PP") : "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Pay Group" : "Add Pay Group"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Pay Group Name *</Label>
              <Input value={formData.pay_group_name} onChange={(e) => setFormData(prev => ({ ...prev, pay_group_name: e.target.value }))} placeholder="e.g., Salaried, Hourly, Executive" />
            </div>
            <div className="grid gap-2">
              <Label>Pay Frequency *</Label>
              <Select value={formData.pay_frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, pay_frequency: value }))}>
                <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="semimonthly">Semi-monthly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Payment Method *</Label>
              <Select value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date *</Label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input type="date" value={formData.end_date} onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(formData)} disabled={!formData.pay_group_name || !formData.pay_frequency || !formData.start_date}>
              {editingId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
