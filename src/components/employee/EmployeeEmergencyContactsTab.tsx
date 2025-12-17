import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";

interface EmployeeEmergencyContactsTabProps {
  employeeId: string;
}

interface EmergencyContactFormData {
  full_name: string;
  relationship: string;
  phone_primary: string;
  phone_secondary: string;
  email: string;
  address: string;
  is_primary: boolean;
  start_date: string;
  end_date: string;
  notes: string;
}

export function EmployeeEmergencyContactsTab({ employeeId }: EmployeeEmergencyContactsTabProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EmergencyContactFormData>({
    full_name: "",
    relationship: "",
    phone_primary: "",
    phone_secondary: "",
    email: "",
    address: "",
    is_primary: false,
    start_date: getTodayString(),
    end_date: "",
    notes: "",
  });

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["employee-emergency-contacts", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_emergency_contacts")
        .select("*")
        .eq("employee_id", employeeId)
        .order("is_primary", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: EmergencyContactFormData) => {
      const payload = {
        employee_id: employeeId,
        full_name: data.full_name,
        relationship: data.relationship,
        phone_primary: data.phone_primary,
        phone_secondary: data.phone_secondary || null,
        email: data.email || null,
        address: data.address || null,
        is_primary: data.is_primary,
        start_date: data.start_date,
        end_date: data.end_date || null,
        notes: data.notes || null,
      };

      if (editingId) {
        const { error } = await supabase.from("employee_emergency_contacts").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employee_emergency_contacts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-emergency-contacts", employeeId] });
      toast.success(editingId ? "Emergency contact updated" : "Emergency contact added");
      closeDialog();
    },
    onError: () => toast.error("Failed to save emergency contact"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employee_emergency_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-emergency-contacts", employeeId] });
      toast.success("Emergency contact deleted");
    },
    onError: () => toast.error("Failed to delete emergency contact"),
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      full_name: "",
      relationship: "",
      phone_primary: "",
      phone_secondary: "",
      email: "",
      address: "",
      is_primary: false,
      start_date: getTodayString(),
      end_date: "",
      notes: "",
    });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      full_name: item.full_name,
      relationship: item.relationship,
      phone_primary: item.phone_primary,
      phone_secondary: item.phone_secondary || "",
      email: item.email || "",
      address: item.address || "",
      is_primary: item.is_primary,
      start_date: item.start_date,
      end_date: item.end_date || "",
      notes: item.notes || "",
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Emergency Contacts</CardTitle>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />Add Emergency Contact
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : contacts?.length === 0 ? (
          <p className="text-muted-foreground">No emergency contacts found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Primary</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.full_name}</TableCell>
                  <TableCell>{item.relationship}</TableCell>
                  <TableCell>{item.phone_primary}</TableCell>
                  <TableCell>{item.is_primary ? <Badge>Primary</Badge> : "-"}</TableCell>
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
            <DialogTitle>{editingId ? "Edit Emergency Contact" : "Add Emergency Contact"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Full Name *</Label>
              <Input value={formData.full_name} onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Relationship *</Label>
              <Input value={formData.relationship} onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))} placeholder="e.g., Spouse, Parent, Sibling" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Primary Phone *</Label>
                <Input value={formData.phone_primary} onChange={(e) => setFormData(prev => ({ ...prev, phone_primary: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Secondary Phone</Label>
                <Input value={formData.phone_secondary} onChange={(e) => setFormData(prev => ({ ...prev, phone_secondary: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Textarea value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="is_primary" checked={formData.is_primary} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_primary: !!checked }))} />
              <Label htmlFor="is_primary">Primary Emergency Contact</Label>
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
            <Button onClick={() => saveMutation.mutate(formData)} disabled={!formData.full_name || !formData.relationship || !formData.phone_primary || !formData.start_date}>
              {editingId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
