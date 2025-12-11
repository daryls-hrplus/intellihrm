import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users } from "lucide-react";

interface Beneficiary {
  id: string;
  full_name: string;
  relationship: string;
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  percentage: number;
  is_primary: boolean;
  beneficiary_type: string;
  effective_date: string;
  end_date: string | null;
}

interface BeneficiaryFormData {
  full_name: string;
  relationship: string;
  date_of_birth: string;
  phone: string;
  email: string;
  address: string;
  percentage: number;
  is_primary: boolean;
  beneficiary_type: string;
  effective_date: string;
  end_date: string;
}

interface EmployeeBeneficiariesTabProps {
  employeeId: string;
}

export function EmployeeBeneficiariesTab({ employeeId }: EmployeeBeneficiariesTabProps) {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);

  const form = useForm<BeneficiaryFormData>({
    defaultValues: {
      full_name: "",
      relationship: "",
      date_of_birth: "",
      phone: "",
      email: "",
      address: "",
      percentage: 100,
      is_primary: false,
      beneficiary_type: "primary",
      effective_date: new Date().toISOString().split("T")[0],
      end_date: "",
    },
  });

  const fetchBeneficiaries = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("employee_beneficiaries")
      .select("*")
      .eq("employee_id", employeeId)
      .order("is_primary", { ascending: false });

    if (error) {
      toast.error("Failed to load beneficiaries");
    } else {
      setBeneficiaries(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, [employeeId]);

  const handleSubmit = async (data: BeneficiaryFormData) => {
    try {
      if (data.is_primary) {
        await supabase
          .from("employee_beneficiaries")
          .update({ is_primary: false })
          .eq("employee_id", employeeId);
      }

      const payload = {
        ...data,
        date_of_birth: data.date_of_birth || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        end_date: data.end_date || null,
      };

      if (editingBeneficiary) {
        const { error } = await supabase
          .from("employee_beneficiaries")
          .update(payload)
          .eq("id", editingBeneficiary.id);

        if (error) throw error;
        toast.success("Beneficiary updated");
      } else {
        const { error } = await supabase.from("employee_beneficiaries").insert({
          employee_id: employeeId,
          ...payload,
        });

        if (error) throw error;
        toast.success("Beneficiary added");
      }

      setDialogOpen(false);
      setEditingBeneficiary(null);
      form.reset();
      fetchBeneficiaries();
    } catch (error) {
      toast.error("Failed to save beneficiary");
    }
  };

  const handleEdit = (beneficiary: Beneficiary) => {
    setEditingBeneficiary(beneficiary);
    form.reset({
      full_name: beneficiary.full_name,
      relationship: beneficiary.relationship,
      date_of_birth: beneficiary.date_of_birth || "",
      phone: beneficiary.phone || "",
      email: beneficiary.email || "",
      address: beneficiary.address || "",
      percentage: beneficiary.percentage,
      is_primary: beneficiary.is_primary,
      beneficiary_type: beneficiary.beneficiary_type,
      effective_date: beneficiary.effective_date,
      end_date: beneficiary.end_date || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("employee_beneficiaries").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete beneficiary");
    } else {
      toast.success("Beneficiary deleted");
      fetchBeneficiaries();
    }
  };

  const openNewDialog = () => {
    setEditingBeneficiary(null);
    form.reset({
      full_name: "",
      relationship: "",
      date_of_birth: "",
      phone: "",
      email: "",
      address: "",
      percentage: 100,
      is_primary: beneficiaries.length === 0,
      beneficiary_type: "primary",
      effective_date: new Date().toISOString().split("T")[0],
      end_date: "",
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Beneficiaries</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Beneficiary
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingBeneficiary ? "Edit Beneficiary" : "Add Beneficiary"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  rules={{ required: "Full name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="relationship"
                    rules={{ required: "Relationship is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="spouse">Spouse</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="beneficiary_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="contingent">Contingent</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="percentage"
                    rules={{ required: "Percentage is required", min: { value: 0, message: "Min 0%" }, max: { value: 100, message: "Max 100%" } }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Percentage (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="effective_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is_primary"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Primary Beneficiary</FormLabel>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : beneficiaries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No beneficiaries on file
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {beneficiaries.map((beneficiary) => (
            <Card key={beneficiary.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{beneficiary.full_name}</CardTitle>
                    {beneficiary.is_primary && <Badge variant="default">Primary</Badge>}
                    <Badge variant="outline" className="capitalize">{beneficiary.beneficiary_type}</Badge>
                    <Badge variant="secondary">{beneficiary.percentage}%</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(beneficiary)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(beneficiary.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Relationship:</span>{" "}
                    <span className="capitalize">{beneficiary.relationship}</span>
                  </div>
                  {beneficiary.phone && (
                    <div>
                      <span className="text-muted-foreground">Phone:</span> {beneficiary.phone}
                    </div>
                  )}
                  {beneficiary.email && (
                    <div>
                      <span className="text-muted-foreground">Email:</span> {beneficiary.email}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
