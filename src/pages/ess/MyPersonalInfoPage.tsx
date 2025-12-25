import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Plus, Edit2, Trash2, Loader2, User2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Address {
  id: string;
  address_type: string;
  is_primary: boolean;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
}

interface EmergencyContact {
  id: string;
  full_name: string;
  relationship: string;
  phone_primary: string;
  phone_secondary: string | null;
  email: string | null;
  is_primary: boolean;
}

export default function MyPersonalInfoPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Address dialog
  const [addressDialog, setAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    address_type: "home",
    is_primary: false,
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });

  // Emergency contact dialog
  const [contactDialog, setContactDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [contactForm, setContactForm] = useState({
    full_name: "",
    relationship: "",
    phone_primary: "",
    phone_secondary: "",
    email: "",
    is_primary: false,
  });

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [addressRes, contactRes] = await Promise.all([
        supabase.from("employee_addresses").select("*").eq("employee_id", user?.id),
        supabase.from("employee_emergency_contacts").select("*").eq("employee_id", user?.id),
      ]);

      setAddresses(addressRes.data || []);
      setEmergencyContacts(contactRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Address handlers
  const openAddressDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        address_type: address.address_type,
        is_primary: address.is_primary,
        address_line_1: address.address_line_1,
        address_line_2: address.address_line_2 || "",
        city: address.city,
        state: address.state || "",
        postal_code: address.postal_code || "",
        country: address.country,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        address_type: "home",
        is_primary: false,
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
      });
    }
    setAddressDialog(true);
  };

  const saveAddress = async () => {
    if (!addressForm.address_line_1 || !addressForm.city || !addressForm.country) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingAddress) {
        const { error } = await supabase
          .from("employee_addresses")
          .update(addressForm)
          .eq("id", editingAddress.id);
        if (error) throw error;
        toast.success("Address updated");
      } else {
        const { error } = await supabase
          .from("employee_addresses")
          .insert({ ...addressForm, employee_id: user?.id });
        if (error) throw error;
        toast.success("Address added");
      }
      setAddressDialog(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save address");
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const { error } = await supabase.from("employee_addresses").delete().eq("id", id);
      if (error) throw error;
      toast.success("Address deleted");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete address");
    }
  };

  // Emergency contact handlers
  const openContactDialog = (contact?: EmergencyContact) => {
    if (contact) {
      setEditingContact(contact);
      setContactForm({
        full_name: contact.full_name,
        relationship: contact.relationship,
        phone_primary: contact.phone_primary,
        phone_secondary: contact.phone_secondary || "",
        email: contact.email || "",
        is_primary: contact.is_primary,
      });
    } else {
      setEditingContact(null);
      setContactForm({
        full_name: "",
        relationship: "",
        phone_primary: "",
        phone_secondary: "",
        email: "",
        is_primary: false,
      });
    }
    setContactDialog(true);
  };

  const saveContact = async () => {
    if (!contactForm.full_name || !contactForm.relationship || !contactForm.phone_primary) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingContact) {
        const { error } = await supabase
          .from("employee_emergency_contacts")
          .update(contactForm)
          .eq("id", editingContact.id);
        if (error) throw error;
        toast.success("Contact updated");
      } else {
        const { error } = await supabase
          .from("employee_emergency_contacts")
          .insert({ ...contactForm, employee_id: user?.id });
        if (error) throw error;
        toast.success("Contact added");
      }
      setContactDialog(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save contact");
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      const { error } = await supabase.from("employee_emergency_contacts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Contact deleted");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete contact");
    }
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
            { label: "Personal Information" },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <User2 className="h-8 w-8" />
            Personal Information
          </h1>
          <p className="text-muted-foreground">
            Manage your addresses and emergency contacts
          </p>
        </div>

        <Tabs defaultValue="addresses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="addresses" className="gap-2">
              <MapPin className="h-4 w-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="emergency" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Emergency Contacts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="addresses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Addresses</CardTitle>
                  <CardDescription>Your home, mailing, and other addresses</CardDescription>
                </div>
                <Button onClick={() => openAddressDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No addresses on file. Add your first address.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">{addr.address_type}</span>
                              {addr.is_primary && <Badge variant="secondary">Primary</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {addr.address_line_1}
                              {addr.address_line_2 && `, ${addr.address_line_2}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {addr.city}{addr.state && `, ${addr.state}`} {addr.postal_code}
                            </p>
                            <p className="text-sm text-muted-foreground">{addr.country}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openAddressDialog(addr)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteAddress(addr.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Emergency Contacts</CardTitle>
                  <CardDescription>People to contact in case of emergency</CardDescription>
                </div>
                <Button onClick={() => openContactDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </CardHeader>
              <CardContent>
                {emergencyContacts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No emergency contacts on file. Add your first contact.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {emergencyContacts.map((contact) => (
                      <div key={contact.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{contact.full_name}</span>
                              {contact.is_primary && <Badge variant="secondary">Primary</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">{contact.relationship}</p>
                            <p className="text-sm">{contact.phone_primary}</p>
                            {contact.phone_secondary && (
                              <p className="text-sm text-muted-foreground">{contact.phone_secondary}</p>
                            )}
                            {contact.email && (
                              <p className="text-sm text-muted-foreground">{contact.email}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openContactDialog(contact)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteContact(contact.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Address Dialog */}
      <Dialog open={addressDialog} onOpenChange={setAddressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Edit Address" : "Add Address"}</DialogTitle>
            <DialogDescription>Enter your address details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Address Type</Label>
                <Select value={addressForm.address_type} onValueChange={(v) => setAddressForm({ ...addressForm, address_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="mailing">Mailing</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-end">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={addressForm.is_primary} onChange={(e) => setAddressForm({ ...addressForm, is_primary: e.target.checked })} />
                  Primary Address
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address Line 1 *</Label>
              <Input value={addressForm.address_line_1} onChange={(e) => setAddressForm({ ...addressForm, address_line_1: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Address Line 2</Label>
              <Input value={addressForm.address_line_2} onChange={(e) => setAddressForm({ ...addressForm, address_line_2: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>State/Province</Label>
                <Input value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Postal Code</Label>
                <Input value={addressForm.postal_code} onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Country *</Label>
                <Input value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddressDialog(false)}>Cancel</Button>
            <Button onClick={saveAddress}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Emergency Contact Dialog */}
      <Dialog open={contactDialog} onOpenChange={setContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit Contact" : "Add Emergency Contact"}</DialogTitle>
            <DialogDescription>Enter emergency contact details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={contactForm.full_name} onChange={(e) => setContactForm({ ...contactForm, full_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Relationship *</Label>
                <Select value={contactForm.relationship} onValueChange={(v) => setContactForm({ ...contactForm, relationship: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Phone *</Label>
                <Input value={contactForm.phone_primary} onChange={(e) => setContactForm({ ...contactForm, phone_primary: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Secondary Phone</Label>
                <Input value={contactForm.phone_secondary} onChange={(e) => setContactForm({ ...contactForm, phone_secondary: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={contactForm.is_primary} onChange={(e) => setContactForm({ ...contactForm, is_primary: e.target.checked })} />
              Primary Emergency Contact
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactDialog(false)}>Cancel</Button>
            <Button onClick={saveContact}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
