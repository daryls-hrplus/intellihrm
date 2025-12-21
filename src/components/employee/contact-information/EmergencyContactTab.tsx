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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Pencil, Trash2, AlertTriangle, Phone, Mail, MapPin, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";

interface EmergencyContactTabProps {
  employeeId: string;
  canEdit: boolean;
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

const RELATIONSHIP_OPTIONS = [
  "Spouse",
  "Partner",
  "Parent",
  "Mother",
  "Father",
  "Sibling",
  "Brother",
  "Sister",
  "Child",
  "Son",
  "Daughter",
  "Guardian",
  "Friend",
  "Other",
];

export function EmergencyContactTab({ employeeId, canEdit }: EmergencyContactTabProps) {
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

  const hasMinimumContacts = (contacts?.length || 0) >= 1;

  return (
    <div className="space-y-6">
      {!hasMinimumContacts && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            At least one emergency contact is required. Please add an emergency contact.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Emergency Contacts
            </CardTitle>
            <CardDescription>People to contact in case of emergency</CardDescription>
          </div>
          {canEdit && (
            <Button onClick={() => setIsDialogOpen(true)} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />Add
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : contacts?.length === 0 ? (
            <p className="text-muted-foreground text-sm">No emergency contacts found.</p>
          ) : (
            <div className="space-y-4">
              {contacts?.map((item) => (
                <div key={item.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">{item.full_name}</span>
                        {item.is_primary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.relationship}</p>
                      
                      <div className="grid gap-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{item.phone_primary}</span>
                          {item.phone_secondary && (
                            <span className="text-xs">/ {item.phone_secondary}</span>
                          )}
                        </div>
                        {item.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{item.email}</span>
                          </div>
                        )}
                        {item.address && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{item.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteMutation.mutate(item.id)}
                          disabled={contacts?.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Emergency Contact" : "Add Emergency Contact"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label>Full Name *</Label>
              <Input value={formData.full_name} onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Relationship *</Label>
              <Select value={formData.relationship} onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}>
                <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_OPTIONS.map((rel) => (
                    <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Primary Phone *</Label>
                <Input value={formData.phone_primary} onChange={(e) => setFormData(prev => ({ ...prev, phone_primary: e.target.value }))} placeholder="+1 234 567 8900" />
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
              <Textarea value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} placeholder="Full address (optional)" />
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
    </div>
  );
}
