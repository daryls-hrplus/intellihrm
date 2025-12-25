import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Edit2, Trash2, Loader2, Calendar, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

interface Dependent {
  id: string;
  full_name: string;
  relationship: string;
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  id_number: string | null;
  is_disabled: boolean;
  is_student: boolean;
  notes: string | null;
}

export default function MyDependentsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDependent, setEditingDependent] = useState<Dependent | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    relationship: "",
    date_of_birth: "",
    gender: "",
    nationality: "",
    id_number: "",
    is_disabled: false,
    is_student: false,
    notes: "",
  });

  useEffect(() => {
    if (user?.id) {
      loadDependents();
    }
  }, [user?.id]);

  const loadDependents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("employee_dependents")
        .select("*")
        .eq("employee_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDependents(data || []);
    } catch (error) {
      console.error("Error loading dependents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (dependent?: Dependent) => {
    if (dependent) {
      setEditingDependent(dependent);
      setForm({
        full_name: dependent.full_name,
        relationship: dependent.relationship,
        date_of_birth: dependent.date_of_birth || "",
        gender: dependent.gender || "",
        nationality: dependent.nationality || "",
        id_number: dependent.id_number || "",
        is_disabled: dependent.is_disabled,
        is_student: dependent.is_student,
        notes: dependent.notes || "",
      });
    } else {
      setEditingDependent(null);
      setForm({
        full_name: "",
        relationship: "",
        date_of_birth: "",
        gender: "",
        nationality: "",
        id_number: "",
        is_disabled: false,
        is_student: false,
        notes: "",
      });
    }
    setDialogOpen(true);
  };

  const saveDependent = async () => {
    if (!form.full_name || !form.relationship) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const payload = {
        full_name: form.full_name,
        relationship: form.relationship,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        nationality: form.nationality || null,
        id_number: form.id_number || null,
        is_disabled: form.is_disabled,
        is_student: form.is_student,
        notes: form.notes || null,
      };

      if (editingDependent) {
        const { error } = await supabase
          .from("employee_dependents")
          .update(payload)
          .eq("id", editingDependent.id);
        if (error) throw error;
        toast.success("Dependent updated");
      } else {
        const { error } = await supabase
          .from("employee_dependents")
          .insert({ ...payload, employee_id: user?.id });
        if (error) throw error;
        toast.success("Dependent added");
      }
      setDialogOpen(false);
      loadDependents();
    } catch (error: any) {
      toast.error(error.message || "Failed to save dependent");
    }
  };

  const deleteDependent = async (id: string) => {
    if (!confirm("Are you sure you want to remove this dependent?")) return;
    try {
      const { error } = await supabase.from("employee_dependents").delete().eq("id", id);
      if (error) throw error;
      toast.success("Dependent removed");
      loadDependents();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete dependent");
    }
  };

  const getRelationshipLabel = (rel: string) => {
    const labels: Record<string, string> = {
      spouse: "Spouse",
      child: "Child",
      parent: "Parent",
      sibling: "Sibling",
      domestic_partner: "Domestic Partner",
      other: "Other",
    };
    return labels[rel] || rel;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("ess.title"), href: "/ess" },
            { label: "Dependents" },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8" />
            My Dependents
          </h1>
          <p className="text-muted-foreground">
            Manage your dependents and beneficiaries
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Dependents</CardTitle>
              <CardDescription>Family members and dependents for benefits and records</CardDescription>
            </div>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Dependent
            </Button>
          </CardHeader>
          <CardContent>
            {dependents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No dependents</h3>
                <p className="text-muted-foreground">Add your first dependent to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dependents.map((dep) => (
                  <div key={dep.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{dep.full_name}</span>
                          <Badge variant="outline">{getRelationshipLabel(dep.relationship)}</Badge>
                          {dep.is_student && <Badge variant="secondary">Student</Badge>}
                          {dep.is_disabled && <Badge variant="secondary">Disabled</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
                          {dep.date_of_birth && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              DOB: {format(new Date(dep.date_of_birth), "MMM d, yyyy")}
                            </span>
                          )}
                          {dep.gender && <span>Gender: {dep.gender}</span>}
                          {dep.nationality && <span>Nationality: {dep.nationality}</span>}
                        </div>
                        {dep.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{dep.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(dep)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteDependent(dep.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDependent ? "Edit Dependent" : "Add Dependent"}</DialogTitle>
            <DialogDescription>Enter dependent information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Relationship *</Label>
                <Select value={form.relationship} onValueChange={(v) => setForm({ ...form, relationship: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="domestic_partner">Domestic Partner</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nationality</Label>
                <Input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>ID Number</Label>
                <Input value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_student} onChange={(e) => setForm({ ...form, is_student: e.target.checked })} />
                Student
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_disabled} onChange={(e) => setForm({ ...form, is_disabled: e.target.checked })} />
                Disabled
              </label>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveDependent}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
