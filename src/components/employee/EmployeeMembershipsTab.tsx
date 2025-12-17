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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { getTodayString } from "@/utils/dateUtils";

interface EmployeeMembershipsTabProps {
  employeeId: string;
}

interface MembershipFormData {
  organization_name: string;
  membership_type: string;
  membership_number: string;
  start_date: string;
  end_date: string;
  status: string;
  notes: string;
}

export function EmployeeMembershipsTab({ employeeId }: EmployeeMembershipsTabProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MembershipFormData>({
    organization_name: "",
    membership_type: "",
    membership_number: "",
    start_date: getTodayString(),
    end_date: "",
    status: "active",
    notes: "",
  });

  const { data: memberships, isLoading } = useQuery({
    queryKey: ["employee-memberships", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_memberships")
        .select("*")
        .eq("employee_id", employeeId)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: MembershipFormData) => {
      const payload = {
        employee_id: employeeId,
        organization_name: data.organization_name,
        membership_type: data.membership_type,
        membership_number: data.membership_number || null,
        start_date: data.start_date,
        end_date: data.end_date || null,
        status: data.status,
        notes: data.notes || null,
      };

      if (editingId) {
        const { error } = await supabase.from("employee_memberships").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employee_memberships").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-memberships", employeeId] });
      toast.success(editingId ? "Membership updated" : "Membership added");
      closeDialog();
    },
    onError: () => toast.error("Failed to save membership"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employee_memberships").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-memberships", employeeId] });
      toast.success("Membership deleted");
    },
    onError: () => toast.error("Failed to delete membership"),
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      organization_name: "",
      membership_type: "",
      membership_number: "",
      start_date: getTodayString(),
      end_date: "",
      status: "active",
      notes: "",
    });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      organization_name: item.organization_name,
      membership_type: item.membership_type,
      membership_number: item.membership_number || "",
      start_date: item.start_date,
      end_date: item.end_date || "",
      status: item.status,
      notes: item.notes || "",
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Memberships</CardTitle>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />Add Membership
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : memberships?.length === 0 ? (
          <p className="text-muted-foreground">No memberships found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberships?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.organization_name}</TableCell>
                  <TableCell>{item.membership_type}</TableCell>
                  <TableCell>{item.membership_number || "-"}</TableCell>
                  <TableCell>{format(new Date(item.start_date), "PP")}</TableCell>
                  <TableCell>{item.end_date ? format(new Date(item.end_date), "PP") : "-"}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "active" ? "default" : "secondary"}>{item.status}</Badge>
                  </TableCell>
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
            <DialogTitle>{editingId ? "Edit Membership" : "Add Membership"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Organization Name *</Label>
              <Input value={formData.organization_name} onChange={(e) => setFormData(prev => ({ ...prev, organization_name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Membership Type *</Label>
              <Input value={formData.membership_type} onChange={(e) => setFormData(prev => ({ ...prev, membership_type: e.target.value }))} placeholder="e.g., Professional, Associate" />
            </div>
            <div className="grid gap-2">
              <Label>Membership Number</Label>
              <Input value={formData.membership_number} onChange={(e) => setFormData(prev => ({ ...prev, membership_number: e.target.value }))} />
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
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(formData)} disabled={!formData.organization_name || !formData.membership_type || !formData.start_date}>
              {editingId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
