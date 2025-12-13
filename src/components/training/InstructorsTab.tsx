import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, User, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface InstructorsTabProps {
  companyId: string;
}

interface Instructor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  instructor_type: string;
  specializations: string[] | null;
  hourly_rate: number | null;
  currency: string;
  is_active: boolean;
  employee: { full_name: string } | null;
}

export function InstructorsTab({ companyId }: InstructorsTabProps) {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    instructor_type: "internal",
    employee_id: "",
    name: "",
    email: "",
    phone: "",
    specializations: "",
    bio: "",
    hourly_rate: "",
    currency: "USD",
    is_active: true,
  });

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    const [instructorsRes, employeesRes] = await Promise.all([
      supabase
        .from("training_instructors")
        .select("*, employee:profiles!training_instructors_employee_id_fkey(full_name)")
        .eq("company_id", companyId)
        .order("name") as any,
      supabase
        .from("profiles")
        .select("id, full_name")
        .eq("company_id", companyId)
        .eq("is_active", true),
    ]);

    if (instructorsRes.data) setInstructors(instructorsRes.data);
    if (employeesRes.data) setEmployees(employeesRes.data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    const payload = {
      company_id: companyId,
      instructor_type: formData.instructor_type,
      employee_id: formData.instructor_type === "internal" && formData.employee_id ? formData.employee_id : null,
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      specializations: formData.specializations ? formData.specializations.split(",").map((s) => s.trim()) : null,
      bio: formData.bio || null,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      currency: formData.currency,
      is_active: formData.is_active,
    };

    if (editingId) {
      const { error } = await supabase.from("training_instructors").update(payload).eq("id", editingId);
      if (error) {
        toast.error("Failed to update instructor");
      } else {
        toast.success("Instructor updated");
        closeDialog();
        loadData();
      }
    } else {
      const { error } = await supabase.from("training_instructors").insert(payload);
      if (error) {
        toast.error("Failed to create instructor");
      } else {
        toast.success("Instructor created");
        closeDialog();
        loadData();
      }
    }
  };

  const openEdit = (instructor: Instructor) => {
    setEditingId(instructor.id);
    setFormData({
      instructor_type: instructor.instructor_type,
      employee_id: "",
      name: instructor.name,
      email: instructor.email || "",
      phone: instructor.phone || "",
      specializations: instructor.specializations?.join(", ") || "",
      bio: "",
      hourly_rate: instructor.hourly_rate?.toString() || "",
      currency: instructor.currency,
      is_active: instructor.is_active,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData({
      instructor_type: "internal",
      employee_id: "",
      name: "",
      email: "",
      phone: "",
      specializations: "",
      bio: "",
      hourly_rate: "",
      currency: "USD",
      is_active: true,
    });
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (emp) {
      setFormData({ ...formData, employee_id: employeeId, name: emp.full_name });
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Training Instructors</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Instructor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Instructor" : "Add Instructor"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Instructor Type</Label>
                <Select value={formData.instructor_type} onValueChange={(v) => setFormData({ ...formData, instructor_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal (Employee)</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.instructor_type === "internal" && (
                <div className="space-y-2">
                  <Label>Select Employee</Label>
                  <Select value={formData.employee_id} onValueChange={handleEmployeeSelect}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Specializations (comma-separated)</Label>
                <Input value={formData.specializations} onChange={(e) => setFormData({ ...formData, specializations: e.target.value })} placeholder="e.g., Leadership, Safety, Technical" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hourly Rate</Label>
                  <Input type="number" value={formData.hourly_rate} onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })} />
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
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
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
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Specializations</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instructors.map((inst) => (
              <TableRow key={inst.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {inst.instructor_type === "internal" ? <UserCheck className="h-4 w-4 text-blue-500" /> : <User className="h-4 w-4 text-gray-500" />}
                    {inst.name}
                  </div>
                </TableCell>
                <TableCell className="capitalize">{inst.instructor_type}</TableCell>
                <TableCell>{inst.email || "-"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {inst.specializations?.slice(0, 2).map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                    {(inst.specializations?.length || 0) > 2 && (
                      <Badge variant="outline" className="text-xs">+{(inst.specializations?.length || 0) - 2}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{inst.hourly_rate ? `${inst.currency} ${inst.hourly_rate}/hr` : "-"}</TableCell>
                <TableCell>
                  <Badge variant={inst.is_active ? "default" : "secondary"}>{inst.is_active ? "Active" : "Inactive"}</Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(inst)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {instructors.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">No instructors found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
