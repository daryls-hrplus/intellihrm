import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { PayrollFilters, usePayrollFilters } from "@/components/payroll/PayrollFilters";

interface PayGroupFormData {
  name: string;
  code: string;
  description: string;
  pay_frequency: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

export default function PayGroupsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedCompanyId, setSelectedCompanyId } = usePayrollFilters();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PayGroupFormData>({
    name: "",
    code: "",
    description: "",
    pay_frequency: "monthly",
    is_active: true,
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });

  const { data: payGroups, isLoading } = useQuery({
    queryKey: ["pay-groups", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("pay_groups")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: PayGroupFormData) => {
      const payload = {
        company_id: selectedCompanyId,
        name: data.name,
        code: data.code,
        description: data.description || null,
        pay_frequency: data.pay_frequency,
        is_active: data.is_active,
        start_date: data.start_date,
        end_date: data.end_date || null,
      };

      if (editingId) {
        const { error } = await supabase.from("pay_groups").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("pay_groups").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pay-groups"] });
      toast.success(editingId ? "Pay group updated" : "Pay group created");
      closeDialog();
    },
    onError: (error: any) => {
      if (error.message?.includes("unique")) {
        toast.error("A pay group with this code already exists");
      } else {
        toast.error("Failed to save pay group");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pay_groups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pay-groups"] });
      toast.success("Pay group deleted");
    },
    onError: () => toast.error("Failed to delete pay group"),
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      pay_frequency: "monthly",
      is_active: true,
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      code: item.code,
      description: item.description || "",
      pay_frequency: item.pay_frequency,
      is_active: item.is_active,
      start_date: item.start_date,
      end_date: item.end_date || "",
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/payroll")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Pay Groups</h1>
          <p className="text-muted-foreground">Manage pay groups for payroll processing</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <PayrollFilters
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={setSelectedCompanyId}
          showPayGroupFilter={false}
        />
        <Button onClick={() => setIsDialogOpen(true)} disabled={!selectedCompanyId}>
          <Plus className="h-4 w-4 mr-2" />
          Add Pay Group
        </Button>
      </div>

      {!selectedCompanyId ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Please select a company to manage pay groups
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="py-10 text-center">Loading...</CardContent>
        </Card>
      ) : payGroups?.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pay groups defined yet</p>
            <p className="text-sm">Create pay groups to organize employees by pay frequency</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pay Groups</CardTitle>
            <CardDescription>Groups determine payroll processing frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payGroups?.map((pg) => (
                  <TableRow key={pg.id}>
                    <TableCell className="font-medium">{pg.name}</TableCell>
                    <TableCell>{pg.code}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{formatFrequency(pg.pay_frequency)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={pg.is_active ? "default" : "outline"}>
                        {pg.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(pg.start_date), "PP")}</TableCell>
                    <TableCell>{pg.end_date ? format(new Date(pg.end_date), "PP") : "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(pg)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(pg.id)}>
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
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Pay Group" : "Add Pay Group"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Monthly Salaried"
              />
            </div>
            <div className="grid gap-2">
              <Label>Code *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="e.g., MONTHLY-SAL"
              />
            </div>
            <div className="grid gap-2">
              <Label>Pay Frequency *</Label>
              <Select
                value={formData.pay_frequency}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, pay_frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly (Fortnightly)</SelectItem>
                  <SelectItem value="semimonthly">Semi-monthly (Twice a month)</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={!formData.name || !formData.code || !formData.pay_frequency || !formData.start_date}
            >
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
