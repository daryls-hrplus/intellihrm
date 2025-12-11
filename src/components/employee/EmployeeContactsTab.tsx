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
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface EmployeeContactsTabProps {
  employeeId: string;
}

interface ContactFormData {
  contact_type: string;
  contact_value: string;
  is_primary: boolean;
  start_date: string;
  end_date: string;
  notes: string;
}

export function EmployeeContactsTab({ employeeId }: EmployeeContactsTabProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    contact_type: "",
    contact_value: "",
    is_primary: false,
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    notes: "",
  });

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["employee-contacts", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_contacts")
        .select("*")
        .eq("employee_id", employeeId)
        .order("is_primary", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const payload = {
        employee_id: employeeId,
        contact_type: data.contact_type,
        contact_value: data.contact_value,
        is_primary: data.is_primary,
        start_date: data.start_date,
        end_date: data.end_date || null,
        notes: data.notes || null,
      };

      if (editingId) {
        const { error } = await supabase.from("employee_contacts").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employee_contacts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-contacts", employeeId] });
      toast.success(editingId ? "Contact updated" : "Contact added");
      closeDialog();
    },
    onError: () => toast.error("Failed to save contact"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employee_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-contacts", employeeId] });
      toast.success("Contact deleted");
    },
    onError: () => toast.error("Failed to delete contact"),
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      contact_type: "",
      contact_value: "",
      is_primary: false,
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
      notes: "",
    });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      contact_type: item.contact_type,
      contact_value: item.contact_value,
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
        <CardTitle>Contacts</CardTitle>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />Add Contact
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : contacts?.length === 0 ? (
          <p className="text-muted-foreground">No contacts found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Primary</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="capitalize">{item.contact_type}</TableCell>
                  <TableCell>{item.contact_value}</TableCell>
                  <TableCell>{item.is_primary ? <Badge>Primary</Badge> : "-"}</TableCell>
                  <TableCell>{format(new Date(item.start_date), "PP")}</TableCell>
                  <TableCell>{item.end_date ? format(new Date(item.end_date), "PP") : "-"}</TableCell>
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
            <DialogTitle>{editingId ? "Edit Contact" : "Add Contact"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Contact Type *</Label>
              <Select value={formData.contact_type} onValueChange={(value) => setFormData(prev => ({ ...prev, contact_type: value }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile">Mobile Phone</SelectItem>
                  <SelectItem value="home_phone">Home Phone</SelectItem>
                  <SelectItem value="work_phone">Work Phone</SelectItem>
                  <SelectItem value="personal_email">Personal Email</SelectItem>
                  <SelectItem value="work_email">Work Email</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="skype">Skype</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Contact Value *</Label>
              <Input value={formData.contact_value} onChange={(e) => setFormData(prev => ({ ...prev, contact_value: e.target.value }))} placeholder="Phone number, email, or handle" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="is_primary" checked={formData.is_primary} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_primary: !!checked }))} />
              <Label htmlFor="is_primary">Primary Contact</Label>
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
            <Button onClick={() => saveMutation.mutate(formData)} disabled={!formData.contact_type || !formData.contact_value || !formData.start_date}>
              {editingId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
