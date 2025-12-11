import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Award, AlertCircle } from "lucide-react";
import { format, isBefore } from "date-fns";

interface License {
  id: string;
  license_type: string;
  license_number: string;
  issuing_authority: string;
  issuing_country: string | null;
  issue_date: string;
  expiry_date: string | null;
  status: string;
  notes: string | null;
}

interface LicenseFormData {
  license_type: string;
  license_number: string;
  issuing_authority: string;
  issuing_country: string;
  issue_date: string;
  expiry_date: string;
  status: string;
  notes: string;
}

interface EmployeeLicensesTabProps {
  employeeId: string;
}

export function EmployeeLicensesTab({ employeeId }: EmployeeLicensesTabProps) {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);

  const form = useForm<LicenseFormData>({
    defaultValues: {
      license_type: "driving",
      license_number: "",
      issuing_authority: "",
      issuing_country: "",
      issue_date: "",
      expiry_date: "",
      status: "active",
      notes: "",
    },
  });

  const fetchLicenses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("employee_licenses")
      .select("*")
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load licenses");
    } else {
      setLicenses(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLicenses();
  }, [employeeId]);

  const handleSubmit = async (data: LicenseFormData) => {
    try {
      const payload = {
        ...data,
        issuing_country: data.issuing_country || null,
        expiry_date: data.expiry_date || null,
        notes: data.notes || null,
      };

      if (editingLicense) {
        const { error } = await supabase
          .from("employee_licenses")
          .update(payload)
          .eq("id", editingLicense.id);

        if (error) throw error;
        toast.success("License updated");
      } else {
        const { error } = await supabase.from("employee_licenses").insert({
          employee_id: employeeId,
          ...payload,
        });

        if (error) throw error;
        toast.success("License added");
      }

      setDialogOpen(false);
      setEditingLicense(null);
      form.reset();
      fetchLicenses();
    } catch (error) {
      toast.error("Failed to save license");
    }
  };

  const handleEdit = (license: License) => {
    setEditingLicense(license);
    form.reset({
      license_type: license.license_type,
      license_number: license.license_number,
      issuing_authority: license.issuing_authority,
      issuing_country: license.issuing_country || "",
      issue_date: license.issue_date,
      expiry_date: license.expiry_date || "",
      status: license.status,
      notes: license.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("employee_licenses").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete license");
    } else {
      toast.success("License deleted");
      fetchLicenses();
    }
  };

  const openNewDialog = () => {
    setEditingLicense(null);
    form.reset();
    setDialogOpen(true);
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return isBefore(new Date(date), new Date());
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Licenses & Certifications</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add License
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingLicense ? "Edit License" : "Add License"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="license_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="driving">Driving License</SelectItem>
                            <SelectItem value="professional">Professional License</SelectItem>
                            <SelectItem value="medical">Medical License</SelectItem>
                            <SelectItem value="certification">Certification</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="license_number"
                    rules={{ required: "License number is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="issuing_authority"
                  rules={{ required: "Issuing authority is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issuing Authority</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issuing_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issuing Country</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="issue_date"
                    rules={{ required: "Issue date is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiry_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="revoked">Revoked</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
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
      ) : licenses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No licenses on file
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {licenses.map((license) => (
            <Card key={license.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base capitalize">
                      {license.license_type.replace("_", " ")}
                    </CardTitle>
                    <Badge variant={license.status === "active" ? "default" : "secondary"} className="capitalize">
                      {license.status}
                    </Badge>
                    {isExpired(license.expiry_date) && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Expired
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(license)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(license.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Number:</span> {license.license_number}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Authority:</span> {license.issuing_authority}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issued:</span>{" "}
                    {format(new Date(license.issue_date), "MMM d, yyyy")}
                  </div>
                  {license.expiry_date && (
                    <div>
                      <span className="text-muted-foreground">Expires:</span>{" "}
                      {format(new Date(license.expiry_date), "MMM d, yyyy")}
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
