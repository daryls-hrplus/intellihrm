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
import { Plus, Pencil, Archive, FileText, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { useEnhancedPiiVisibility } from "@/hooks/useEnhancedPiiVisibility";
import { useAuditLog } from "@/hooks/useAuditLog";
import { CountrySelect } from "@/components/ui/country-select";

interface CertificateOfCharacter {
  id: string;
  check_type: string;
  provider: string | null;
  requested_date: string;
  completed_date: string | null;
  status: string;
  result: string | null;
  reference_number: string | null;
  expiry_date: string | null;
  notes: string | null;
  jurisdiction: string | null;
  category: string;
}

interface CertificateFormData {
  check_type: string;
  provider: string;
  requested_date: string;
  completed_date: string;
  status: string;
  result: string;
  reference_number: string;
  expiry_date: string;
  notes: string;
  jurisdiction: string;
}

interface EmployeeCertificateOfCharacterTabProps {
  employeeId: string;
  viewType?: "hr" | "manager" | "ess";
}

export function EmployeeCertificateOfCharacterTab({ employeeId, viewType = "hr" }: EmployeeCertificateOfCharacterTabProps) {
  const [certificates, setCertificates] = useState<CertificateOfCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<CertificateOfCharacter | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<CertificateOfCharacter | null>(null);
  
  const { hasTabAccess } = useGranularPermissions();
  const { canViewDomain, maskPiiValue } = useEnhancedPiiVisibility();
  const { logAction } = useAuditLog();

  const canEdit = viewType === "hr" && hasTabAccess("workforce", "compliance_legal", "edit");
  const canAdd = viewType === "hr" && hasTabAccess("workforce", "compliance_legal", "create");
  const canViewResults = viewType === "hr";
  const canViewNotes = viewType === "hr";

  const form = useForm<CertificateFormData>({
    defaultValues: {
      check_type: "police_certificate",
      provider: "",
      requested_date: getTodayString(),
      completed_date: "",
      status: "pending",
      result: "",
      reference_number: "",
      expiry_date: "",
      notes: "",
      jurisdiction: "",
    },
  });

  const fetchCertificates = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("employee_background_checks")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("category", "certificate_of_character")
      .order("requested_date", { ascending: false });

    if (error) {
      toast.error("Failed to load certificates of character");
    } else {
      setCertificates(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCertificates();
  }, [employeeId]);

  const handleSubmit = async (data: CertificateFormData) => {
    try {
      const payload = {
        ...data,
        category: "certificate_of_character",
        provider: data.provider || null,
        completed_date: data.completed_date || null,
        result: data.result || null,
        reference_number: data.reference_number || null,
        expiry_date: data.expiry_date || null,
        notes: data.notes || null,
        jurisdiction: data.jurisdiction || null,
      };

      if (editingCertificate) {
        const { error } = await supabase
          .from("employee_background_checks")
          .update(payload)
          .eq("id", editingCertificate.id);

        if (error) throw error;
        
        await logAction({
          action: "UPDATE",
          entityType: "certificate_of_character",
          entityId: editingCertificate.id,
          entityName: data.check_type,
          newValues: payload,
        });
        
        toast.success("Certificate of character updated");
      } else {
        const { data: result, error } = await supabase
          .from("employee_background_checks")
          .insert({ employee_id: employeeId, ...payload })
          .select()
          .single();

        if (error) throw error;
        
        await logAction({
          action: "CREATE",
          entityType: "certificate_of_character",
          entityId: result.id,
          entityName: data.check_type,
          newValues: payload,
        });
        
        toast.success("Certificate of character added");
      }

      setDialogOpen(false);
      setEditingCertificate(null);
      form.reset();
      fetchCertificates();
    } catch (error) {
      toast.error("Failed to save certificate of character");
    }
  };

  const handleEdit = (certificate: CertificateOfCharacter) => {
    setEditingCertificate(certificate);
    form.reset({
      check_type: certificate.check_type,
      provider: certificate.provider || "",
      requested_date: certificate.requested_date,
      completed_date: certificate.completed_date || "",
      status: certificate.status,
      result: certificate.result || "",
      reference_number: certificate.reference_number || "",
      expiry_date: certificate.expiry_date || "",
      notes: certificate.notes || "",
      jurisdiction: certificate.jurisdiction || "",
    });
    setDialogOpen(true);
  };

  const handleArchive = async (certificate: CertificateOfCharacter) => {
    const { error } = await supabase
      .from("employee_background_checks")
      .update({ status: "archived" })
      .eq("id", certificate.id);

    if (error) {
      toast.error("Failed to archive certificate");
    } else {
      await logAction({
        action: "UPDATE",
        entityType: "certificate_of_character",
        entityId: certificate.id,
        entityName: certificate.check_type,
        oldValues: { status: certificate.status },
        newValues: { status: "archived" },
      });
      toast.success("Certificate archived");
      fetchCertificates();
    }
  };

  const openNewDialog = () => {
    setEditingCertificate(null);
    form.reset({
      check_type: "police_certificate",
      provider: "",
      requested_date: getTodayString(),
      completed_date: "",
      status: "pending",
      result: "",
      reference_number: "",
      expiry_date: "",
      notes: "",
      jurisdiction: "",
    });
    setDialogOpen(true);
  };

  const getStatusIcon = (status: string, result: string | null) => {
    if (status === "completed") {
      if (result === "clear" || result === "passed") {
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      } else if (result === "failed" || result === "flagged") {
        return <XCircle className="h-4 w-4 text-destructive" />;
      }
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const getComplianceIndicator = (certificate: CertificateOfCharacter) => {
    if (certificate.status === "archived") return null;
    
    const now = new Date();
    const expiry = certificate.expiry_date ? new Date(certificate.expiry_date) : null;
    
    if (certificate.result === "failed" || certificate.result === "flagged") {
      return <span className="text-destructive font-medium">✖</span>;
    }
    if (expiry && expiry < now) {
      return <span className="text-destructive font-medium">✖</span>;
    }
    if (certificate.status === "pending" || certificate.status === "in_progress") {
      return <span className="text-yellow-500 font-medium">⚠</span>;
    }
    if (certificate.result === "clear" || certificate.result === "passed") {
      return <span className="text-green-500 font-medium">✔</span>;
    }
    return <span className="text-yellow-500 font-medium">⚠</span>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Certificate of Character</h3>
        {canAdd && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingCertificate ? "Edit Certificate" : "Add Certificate of Character"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="check_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certificate Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="police_certificate">Police Certificate</SelectItem>
                              <SelectItem value="good_conduct">Good Conduct Certificate</SelectItem>
                              <SelectItem value="character_reference">Character Reference</SelectItem>
                              <SelectItem value="criminal_record">Criminal Record Check</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="jurisdiction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jurisdiction</FormLabel>
                          <FormControl>
                            <CountrySelect
                              value={field.value}
                              onChange={field.onChange}
                              valueType="name"
                              placeholder="Select jurisdiction"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider / Issuing Authority</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Royal Police Force" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="requested_date"
                      rules={{ required: "Requested date is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requested Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="completed_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Completed Date</FormLabel>
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
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="result"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Result</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select result..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="clear">Clear</SelectItem>
                              <SelectItem value="passed">Passed</SelectItem>
                              <SelectItem value="flagged">Flagged</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="reference_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
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

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : certificates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No certificates of character on file
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {certificates.map((certificate) => (
            <Card key={certificate.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(certificate.status, certificate.result)}
                    <CardTitle className="text-base capitalize">
                      {certificate.check_type.replace(/_/g, " ")}
                    </CardTitle>
                    {getStatusBadge(certificate.status)}
                    {viewType !== "ess" && getComplianceIndicator(certificate)}
                    {canViewResults && certificate.result && (
                      <Badge
                        variant={certificate.result === "clear" || certificate.result === "passed" ? "default" : "destructive"}
                        className="capitalize"
                      >
                        {certificate.result}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {viewType === "hr" && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => setViewingCertificate(certificate)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEdit && certificate.status !== "archived" && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(certificate)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleArchive(certificate)}>
                              <Archive className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {viewType === "hr" && certificate.jurisdiction && (
                    <div>
                      <span className="text-muted-foreground">Jurisdiction:</span> {certificate.jurisdiction}
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Status:</span> {certificate.status}
                  </div>
                  {viewType === "hr" && (
                    <div>
                      <span className="text-muted-foreground">Requested:</span>{" "}
                      {formatDateForDisplay(certificate.requested_date)}
                    </div>
                  )}
                  {viewType === "hr" && certificate.completed_date && (
                    <div>
                      <span className="text-muted-foreground">Completed:</span>{" "}
                      {formatDateForDisplay(certificate.completed_date)}
                    </div>
                  )}
                  {certificate.expiry_date && (
                    <div>
                      <span className="text-muted-foreground">Expires:</span>{" "}
                      {formatDateForDisplay(certificate.expiry_date)}
                    </div>
                  )}
                  {viewType === "ess" && (
                    <div>
                      <span className="text-muted-foreground">Action Required:</span>{" "}
                      {certificate.status === "pending" ? "Yes" : "No"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog for HR */}
      <Dialog open={!!viewingCertificate} onOpenChange={(open) => !open && setViewingCertificate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certificate of Character Details</DialogTitle>
          </DialogHeader>
          {viewingCertificate && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Type</h4>
                  <p className="capitalize">{viewingCertificate.check_type.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Jurisdiction</h4>
                  <p>{viewingCertificate.jurisdiction || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Provider</h4>
                  <p>{viewingCertificate.provider || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Reference Number</h4>
                  <p>{viewingCertificate.reference_number || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
                  {getStatusBadge(viewingCertificate.status)}
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Result</h4>
                  {viewingCertificate.result ? (
                    <Badge
                      variant={viewingCertificate.result === "clear" || viewingCertificate.result === "passed" ? "default" : "destructive"}
                      className="capitalize"
                    >
                      {viewingCertificate.result}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">Pending</span>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Dates</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Requested:</span>{" "}
                    {formatDateForDisplay(viewingCertificate.requested_date)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Completed:</span>{" "}
                    {viewingCertificate.completed_date ? formatDateForDisplay(viewingCertificate.completed_date) : "Pending"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expiry:</span>{" "}
                    {viewingCertificate.expiry_date ? formatDateForDisplay(viewingCertificate.expiry_date) : "N/A"}
                  </div>
                </div>
              </div>

              {canViewNotes && viewingCertificate.notes && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Notes (HR Only)</h4>
                  <p className="text-sm text-muted-foreground">{viewingCertificate.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
