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
import { Plus, Pencil, Archive, Award, AlertCircle, Eye } from "lucide-react";
import { isBefore } from "date-fns";
import { getTodayString, parseLocalDate, formatDateForDisplay } from "@/utils/dateUtils";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { useAuditLog } from "@/hooks/useAuditLog";

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
  start_date: string;
  end_date: string;
}

interface EmployeeLicensesTabProps {
  employeeId: string;
  viewType?: "hr" | "manager" | "ess";
}

export function EmployeeLicensesTab({ employeeId, viewType = "hr" }: EmployeeLicensesTabProps) {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [viewingLicense, setViewingLicense] = useState<License | null>(null);

  const { hasTabAccess } = useGranularPermissions();
  const { logAction } = useAuditLog();

  const canEdit = viewType === "hr" && hasTabAccess("workforce", "compliance_legal", "edit");
  const canAdd = viewType === "hr" && hasTabAccess("workforce", "compliance_legal", "create");
  const canViewNotes = viewType === "hr";

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
      start_date: getTodayString(),
      end_date: "",
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
        
        await logAction({
          action: "UPDATE",
          entityType: "license",
          entityId: editingLicense.id,
          entityName: data.license_type,
          newValues: payload,
        });
        
        toast.success("License updated");
      } else {
        const { data: result, error } = await supabase.from("employee_licenses").insert({
          employee_id: employeeId,
          ...payload,
        }).select().single();

        if (error) throw error;
        
        await logAction({
          action: "CREATE",
          entityType: "license",
          entityId: result.id,
          entityName: data.license_type,
          newValues: payload,
        });
        
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

  const handleEdit = (license: any) => {
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
      start_date: license.start_date || getTodayString(),
      end_date: license.end_date || "",
    });
    setDialogOpen(true);
  };

  const handleArchive = async (license: License) => {
    const { error } = await supabase
      .from("employee_licenses")
      .update({ status: "archived" })
      .eq("id", license.id);

    if (error) {
      toast.error("Failed to archive license");
    } else {
      await logAction({
        action: "UPDATE",
        entityType: "license",
        entityId: license.id,
        entityName: license.license_type,
        oldValues: { status: license.status },
        newValues: { status: "archived" },
      });
      toast.success("License archived");
      fetchLicenses();
    }
  };

  const openNewDialog = () => {
    setEditingLicense(null);
    form.reset({
      license_type: "driving",
      license_number: "",
      issuing_authority: "",
      issuing_country: "",
      issue_date: "",
      expiry_date: "",
      status: "active",
      notes: "",
      start_date: getTodayString(),
      end_date: "",
    });
    setDialogOpen(true);
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    const parsedDate = parseLocalDate(date);
    return parsedDate ? isBefore(parsedDate, new Date()) : false;
  };

  const getStatusBadge = (license: License) => {
    if (license.status === "archived") {
      return <Badge variant="secondary">Archived</Badge>;
    }
    if (isExpired(license.expiry_date)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (license.status === "active") {
      return <Badge variant="default">Active</Badge>;
    }
    return <Badge variant="secondary" className="capitalize">{license.status}</Badge>;
  };

  const getComplianceIndicator = (license: License) => {
    if (license.status === "archived") return null;
    
    if (isExpired(license.expiry_date)) {
      return <span className="text-destructive font-medium">✖</span>;
    }
    if (license.status === "suspended" || license.status === "revoked") {
      return <span className="text-destructive font-medium">✖</span>;
    }
    if (license.status === "active") {
      return <span className="text-green-500 font-medium">✔</span>;
    }
    return <span className="text-yellow-500 font-medium">⚠</span>;
  };

  // ESS View - Simplified status card
  if (viewType === "ess") {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Licenses & Certifications</h3>
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
          <div className="space-y-2">
            {licenses.filter(l => l.status !== "archived").map((license) => (
              <Card key={license.id}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium capitalize">{license.license_type.replace("_", " ")}</p>
                        <p className="text-sm text-muted-foreground">
                          {license.expiry_date 
                            ? `Expires: ${formatDateForDisplay(license.expiry_date)}`
                            : "No expiry date"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(license)}
                      {isExpired(license.expiry_date) && (
                        <span className="text-sm text-destructive font-medium">Action Required</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Manager View - Limited list
  if (viewType === "manager") {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Licenses & Certifications</h3>
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
            {licenses.filter(l => l.status !== "archived").map((license) => (
              <Card key={license.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getComplianceIndicator(license)}
                      <CardTitle className="text-base capitalize">
                        {license.license_type.replace("_", " ")}
                      </CardTitle>
                      {getStatusBadge(license)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Authority:</span> {license.issuing_authority}
                    </div>
                    {license.expiry_date && (
                      <div>
                        <span className="text-muted-foreground">Expires:</span>{" "}
                        {formatDateForDisplay(license.expiry_date)}
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

  // HR View - Full access
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Licenses & Certifications</h3>
        {canAdd && (
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
                        <FormLabel>Notes (HR Only)</FormLabel>
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
        )}
      </div>

      {/* Detail View Dialog */}
      <Dialog open={!!viewingLicense} onOpenChange={() => setViewingLicense(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>License Details</DialogTitle>
          </DialogHeader>
          {viewingLicense && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium capitalize">{viewingLicense.license_type.replace("_", " ")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Number:</span>
                  <p className="font-medium">{viewingLicense.license_number}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Authority:</span>
                  <p className="font-medium">{viewingLicense.issuing_authority}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-1">{getStatusBadge(viewingLicense)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Issue Date:</span>
                  <p className="font-medium">{formatDateForDisplay(viewingLicense.issue_date)}</p>
                </div>
                {viewingLicense.expiry_date && (
                  <div>
                    <span className="text-muted-foreground">Expiry Date:</span>
                    <p className="font-medium">{formatDateForDisplay(viewingLicense.expiry_date)}</p>
                  </div>
                )}
              </div>
              {viewingLicense.notes && canViewNotes && (
                <div>
                  <span className="text-muted-foreground text-sm">Notes:</span>
                  <p className="text-sm mt-1 bg-muted p-2 rounded">{viewingLicense.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            <Card key={license.id} className={license.status === "archived" ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getComplianceIndicator(license)}
                    <CardTitle className="text-base capitalize">
                      {license.license_type.replace("_", " ")}
                    </CardTitle>
                    {getStatusBadge(license)}
                    {isExpired(license.expiry_date) && license.status !== "archived" && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setViewingLicense(license)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canEdit && license.status !== "archived" && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(license)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleArchive(license)}>
                          <Archive className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Number:</span> {license.license_number}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Authority:</span> {license.issuing_authority}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issued:</span>{" "}
                    {formatDateForDisplay(license.issue_date)}
                  </div>
                  {license.expiry_date && (
                    <div>
                      <span className="text-muted-foreground">Expires:</span>{" "}
                      {formatDateForDisplay(license.expiry_date)}
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
