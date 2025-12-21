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
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, Mail, Phone, MapPin, User } from "lucide-react";
import { toast } from "sonner";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { useAuth } from "@/contexts/AuthContext";

interface PersonalContactTabProps {
  employeeId: string;
  canEdit: boolean;
}

interface ContactFormData {
  contact_type: string;
  contact_value: string;
  is_primary: boolean;
  start_date: string;
  end_date: string;
  notes: string;
}

interface AddressFormData {
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_primary: boolean;
  effective_date: string;
  end_date: string;
}

const PERSONAL_CONTACT_TYPES = ["personal_email", "mobile", "home_phone"];

export function PersonalContactTab({ employeeId, canEdit }: PersonalContactTabProps) {
  const queryClient = useQueryClient();
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  
  const [contactFormData, setContactFormData] = useState<ContactFormData>({
    contact_type: "",
    contact_value: "",
    is_primary: false,
    start_date: getTodayString(),
    end_date: "",
    notes: "",
  });

  const [addressFormData, setAddressFormData] = useState<AddressFormData>({
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    is_primary: false,
    effective_date: getTodayString(),
    end_date: "",
  });

  // Fetch personal contacts
  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ["employee-personal-contacts", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_contacts")
        .select("*")
        .eq("employee_id", employeeId)
        .in("contact_type", PERSONAL_CONTACT_TYPES)
        .order("is_primary", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch residential address (home type)
  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["employee-residential-addresses", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_addresses")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("address_type", "home")
        .order("is_primary", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["employee-personal-contacts", employeeId] });
      toast.success(editingContactId ? "Contact updated" : "Contact added");
      closeContactDialog();
    },
    onError: () => toast.error("Failed to save contact"),
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employee_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-personal-contacts", employeeId] });
      toast.success("Contact deleted");
    },
    onError: () => toast.error("Failed to delete contact"),
  });

  const saveAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      const payload = {
        employee_id: employeeId,
        address_type: "home",
        address_line_1: data.address_line_1,
        address_line_2: data.address_line_2 || null,
        city: data.city,
        state: data.state || null,
        postal_code: data.postal_code || null,
        country: data.country,
        is_primary: data.is_primary,
        effective_date: data.effective_date,
        end_date: data.end_date || null,
      };

      if (editingAddressId) {
        const { error } = await supabase.from("employee_addresses").update(payload).eq("id", editingAddressId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employee_addresses").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-residential-addresses", employeeId] });
      toast.success(editingAddressId ? "Address updated" : "Address added");
      closeAddressDialog();
    },
    onError: () => toast.error("Failed to save address"),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employee_addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-residential-addresses", employeeId] });
      toast.success("Address deleted");
    },
    onError: () => toast.error("Failed to delete address"),
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

  const closeAddressDialog = () => {
    setIsAddressDialogOpen(false);
    setEditingAddressId(null);
    setAddressFormData({
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      is_primary: false,
      effective_date: getTodayString(),
      end_date: "",
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

  const handleEditAddress = (item: any) => {
    setEditingAddressId(item.id);
    setAddressFormData({
      address_line_1: item.address_line_1,
      address_line_2: item.address_line_2 || "",
      city: item.city,
      state: item.state || "",
      postal_code: item.postal_code || "",
      country: item.country,
      is_primary: item.is_primary,
      effective_date: item.effective_date,
      end_date: item.end_date || "",
    });
    setIsAddressDialogOpen(true);
  };

  const getContactTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      personal_email: "Personal Email",
      mobile: "Mobile Phone",
      home_phone: "Home Phone",
    };
    return labels[type] || type;
  };

  const getContactIcon = (type: string) => {
    if (type === "personal_email") return <Mail className="h-4 w-4 text-muted-foreground" />;
    return <Phone className="h-4 w-4 text-muted-foreground" />;
  };

  const isLoading = contactsLoading || addressesLoading;

  return (
    <div className="space-y-6">
      {/* Personal Email & Phone Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Contact Details
            </CardTitle>
            <CardDescription>Personal email and phone numbers</CardDescription>
          </div>
          {canEdit && (
            <Button onClick={() => setIsContactDialogOpen(true)} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />Add
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : contacts?.length === 0 ? (
            <p className="text-muted-foreground text-sm">No personal contacts found.</p>
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
                      </div>
                      <span className="text-xs text-muted-foreground">{getContactTypeLabel(item.contact_type)}</span>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditContact(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteContactMutation.mutate(item.id)}>
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

      {/* Residential Address Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Residential Address
            </CardTitle>
            <CardDescription>Home address for official records</CardDescription>
          </div>
          {canEdit && (
            <Button onClick={() => setIsAddressDialogOpen(true)} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />Add
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : addresses?.length === 0 ? (
            <p className="text-muted-foreground text-sm">No residential address found.</p>
          ) : (
            <div className="space-y-3">
              {addresses?.map((item) => (
                <div key={item.id} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {item.is_primary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                      </div>
                      <p className="font-medium">{item.address_line_1}</p>
                      {item.address_line_2 && <p className="text-sm text-muted-foreground">{item.address_line_2}</p>}
                      <p className="text-sm text-muted-foreground">
                        {item.city}{item.state && `, ${item.state}`} {item.postal_code}
                      </p>
                      <p className="text-sm text-muted-foreground">{item.country}</p>
                    </div>
                    {canEdit && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditAddress(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteAddressMutation.mutate(item.id)}>
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

      {/* Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingContactId ? "Edit Personal Contact" : "Add Personal Contact"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Contact Type *</Label>
              <Select value={contactFormData.contact_type} onValueChange={(value) => setContactFormData(prev => ({ ...prev, contact_type: value }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal_email">Personal Email</SelectItem>
                  <SelectItem value="mobile">Mobile Phone</SelectItem>
                  <SelectItem value="home_phone">Home Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Value *</Label>
              <Input 
                value={contactFormData.contact_value} 
                onChange={(e) => setContactFormData(prev => ({ ...prev, contact_value: e.target.value }))} 
                placeholder={contactFormData.contact_type === "personal_email" ? "email@example.com" : "+1 234 567 8900"}
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

      {/* Address Dialog */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAddressId ? "Edit Residential Address" : "Add Residential Address"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Address Line 1 *</Label>
              <Input value={addressFormData.address_line_1} onChange={(e) => setAddressFormData(prev => ({ ...prev, address_line_1: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Address Line 2</Label>
              <Input value={addressFormData.address_line_2} onChange={(e) => setAddressFormData(prev => ({ ...prev, address_line_2: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>City *</Label>
                <Input value={addressFormData.city} onChange={(e) => setAddressFormData(prev => ({ ...prev, city: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>State/Province</Label>
                <Input value={addressFormData.state} onChange={(e) => setAddressFormData(prev => ({ ...prev, state: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Postal Code</Label>
                <Input value={addressFormData.postal_code} onChange={(e) => setAddressFormData(prev => ({ ...prev, postal_code: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Country *</Label>
                <Input value={addressFormData.country} onChange={(e) => setAddressFormData(prev => ({ ...prev, country: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="address_primary" checked={addressFormData.is_primary} onCheckedChange={(checked) => setAddressFormData(prev => ({ ...prev, is_primary: !!checked }))} />
              <Label htmlFor="address_primary">Primary Address</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Effective Date *</Label>
                <Input type="date" value={addressFormData.effective_date} onChange={(e) => setAddressFormData(prev => ({ ...prev, effective_date: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input type="date" value={addressFormData.end_date} onChange={(e) => setAddressFormData(prev => ({ ...prev, end_date: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAddressDialog}>Cancel</Button>
            <Button 
              onClick={() => saveAddressMutation.mutate(addressFormData)} 
              disabled={!addressFormData.address_line_1 || !addressFormData.city || !addressFormData.country || !addressFormData.effective_date}
            >
              {editingAddressId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
