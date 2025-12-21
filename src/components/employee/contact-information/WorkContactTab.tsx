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
import { Plus, Pencil, Trash2, Mail, Phone, Building2, Briefcase, Lock } from "lucide-react";
import { toast } from "sonner";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";

interface WorkContactTabProps {
  employeeId: string;
  canEdit: boolean; // Only HR/IT can edit
}

interface ContactFormData {
  contact_type: string;
  contact_value: string;
  is_primary: boolean;
  start_date: string;
  end_date: string;
  notes: string;
}

const WORK_CONTACT_TYPES = ["work_email", "work_phone", "work_mobile", "extension"];

export function WorkContactTab({ employeeId, canEdit }: WorkContactTabProps) {
  const queryClient = useQueryClient();
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  
  const [contactFormData, setContactFormData] = useState<ContactFormData>({
    contact_type: "",
    contact_value: "",
    is_primary: false,
    start_date: getTodayString(),
    end_date: "",
    notes: "",
  });

  // Fetch work contacts
  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ["employee-work-contacts", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_contacts")
        .select("*")
        .eq("employee_id", employeeId)
        .in("contact_type", WORK_CONTACT_TYPES)
        .order("is_primary", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const branchAssignments: any[] = [];
  const branchLoading = false;

  const saveContactMutation = useMutation({
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

      if (editingContactId) {
        const { error } = await supabase.from("employee_contacts").update(payload).eq("id", editingContactId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employee_contacts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-work-contacts", employeeId] });
      toast.success(editingContactId ? "Work contact updated" : "Work contact added");
      closeContactDialog();
    },
    onError: () => toast.error("Failed to save work contact"),
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employee_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-work-contacts", employeeId] });
      toast.success("Work contact deleted");
    },
    onError: () => toast.error("Failed to delete work contact"),
  });

  const closeContactDialog = () => {
    setIsContactDialogOpen(false);
    setEditingContactId(null);
    setContactFormData({
      contact_type: "",
      contact_value: "",
      is_primary: false,
      start_date: getTodayString(),
      end_date: "",
      notes: "",
    });
  };

  const handleEditContact = (item: any) => {
    setEditingContactId(item.id);
    setContactFormData({
      contact_type: item.contact_type,
      contact_value: item.contact_value,
      is_primary: item.is_primary,
      start_date: item.start_date,
      end_date: item.end_date || "",
      notes: item.notes || "",
    });
    setIsContactDialogOpen(true);
  };

  const getContactTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      work_email: "Work Email",
      work_phone: "Work Phone",
      work_mobile: "Work Mobile",
      extension: "Extension",
    };
    return labels[type] || type;
  };

  const getContactIcon = (type: string) => {
    if (type === "work_email") return <Mail className="h-4 w-4 text-muted-foreground" />;
    return <Phone className="h-4 w-4 text-muted-foreground" />;
  };

  const isLoading = contactsLoading || branchLoading;

  // Check if work email exists
  const hasWorkEmail = contacts?.some(c => c.contact_type === "work_email");

  return (
    <div className="space-y-6">
      {!canEdit && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Work contact information is managed by HR or IT. Contact your administrator to make changes.
          </AlertDescription>
        </Alert>
      )}

      {/* Work Email & Phone Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Work Contact Details
            </CardTitle>
            <CardDescription>Official company email and work phone numbers</CardDescription>
          </div>
          {canEdit && (
            <Button onClick={() => setIsContactDialogOpen(true)} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />Add
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!hasWorkEmail && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Work email is required. Please add a work email address.
              </AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : contacts?.length === 0 ? (
            <p className="text-muted-foreground text-sm">No work contacts found.</p>
          ) : (
            <div className="space-y-3">
              {contacts?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    {getContactIcon(item.contact_type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.contact_value}</span>
                        {item.is_primary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                        {item.contact_type === "work_email" && <Badge variant="outline" className="text-xs">Mandatory</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground">{getContactTypeLabel(item.contact_type)}</span>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditContact(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteContactMutation.mutate(item.id)}
                        disabled={item.contact_type === "work_email" && contacts?.filter(c => c.contact_type === "work_email").length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Office Location Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Office Location
          </CardTitle>
          <CardDescription>Assigned work location and office details</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : branchAssignments?.length === 0 ? (
            <p className="text-muted-foreground text-sm">No office location assigned.</p>
          ) : (
            <div className="space-y-3">
              {branchAssignments?.map((assignment: any) => (
                <div key={assignment.id} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{assignment.branch?.name}</span>
                        {assignment.is_primary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                      </div>
                      {assignment.branch?.address_line_1 && (
                        <p className="text-sm text-muted-foreground">{assignment.branch.address_line_1}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {assignment.branch?.city}
                        {assignment.branch?.state && `, ${assignment.branch.state}`}
                        {assignment.branch?.country && `, ${assignment.branch.country}`}
                      </p>
                      {assignment.branch?.building_floor && (
                        <p className="text-sm text-muted-foreground">Floor: {assignment.branch.building_floor}</p>
                      )}
                      {assignment.workstation && (
                        <p className="text-sm text-muted-foreground">Workstation: {assignment.workstation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingContactId ? "Edit Work Contact" : "Add Work Contact"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Contact Type *</Label>
              <Select value={contactFormData.contact_type} onValueChange={(value) => setContactFormData(prev => ({ ...prev, contact_type: value }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="work_email">Work Email (Mandatory)</SelectItem>
                  <SelectItem value="work_phone">Work Phone / Desk</SelectItem>
                  <SelectItem value="work_mobile">Work Mobile</SelectItem>
                  <SelectItem value="extension">Extension</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Value *</Label>
              <Input 
                value={contactFormData.contact_value} 
                onChange={(e) => setContactFormData(prev => ({ ...prev, contact_value: e.target.value }))} 
                placeholder={contactFormData.contact_type === "work_email" ? "name@company.com" : contactFormData.contact_type === "extension" ? "1234" : "+1 234 567 8900"}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="is_primary" checked={contactFormData.is_primary} onCheckedChange={(checked) => setContactFormData(prev => ({ ...prev, is_primary: !!checked }))} />
              <Label htmlFor="is_primary">Primary Contact</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date *</Label>
                <Input type="date" value={contactFormData.start_date} onChange={(e) => setContactFormData(prev => ({ ...prev, start_date: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input type="date" value={contactFormData.end_date} onChange={(e) => setContactFormData(prev => ({ ...prev, end_date: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea value={contactFormData.notes} onChange={(e) => setContactFormData(prev => ({ ...prev, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeContactDialog}>Cancel</Button>
            <Button onClick={() => saveContactMutation.mutate(contactFormData)} disabled={!contactFormData.contact_type || !contactFormData.contact_value || !contactFormData.start_date}>
              {editingContactId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
