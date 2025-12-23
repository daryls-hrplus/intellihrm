import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plus, Pencil, Archive, Award, AlertCircle, Upload, FileText, X, Download, Eye, Building2, CheckCircle2, Clock } from "lucide-react";
import { isBefore, addDays, format } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { CountrySelect } from "@/components/ui/country-select";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useCSMECertificates, CSMECertificate, CSMEFormData, VERIFICATION_METHODS } from "@/hooks/useCSMECertificates";
import { useAuth } from "@/contexts/AuthContext";

interface EmployeeCSMETabProps {
  employeeId: string;
  viewType?: "hr" | "manager" | "ess";
}

export function EmployeeCSMETab({ employeeId, viewType = "hr" }: EmployeeCSMETabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<CSMECertificate | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<CSMECertificate | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { user } = useAuth();
  const { hasTabAccess } = useGranularPermissions();
  const { logAction } = useAuditLog();

  const {
    certificates,
    certificateTypes,
    issuingAuthorities,
    isLoading,
    isLoadingLookups,
    fetchCertificates,
    getAuthoritiesByCountry,
    isExpiryRequired,
    getCertificateTypeName,
    getDefaultFormValues,
    certificateToFormData,
  } = useCSMECertificates(employeeId);

  const canEdit = viewType === "hr" && hasTabAccess("workforce", "immigration", "edit");
  const canAdd = viewType === "hr" && hasTabAccess("workforce", "immigration", "create");

  const form = useForm<CSMEFormData>({
    defaultValues: getDefaultFormValues(),
  });

  // Watch fields for conditional logic
  const watchedCertificateTypeId = useWatch({ control: form.control, name: "certificate_type_id" });
  const watchedIssuingCountry = useWatch({ control: form.control, name: "issuing_country" });
  const watchedVerificationStatus = useWatch({ control: form.control, name: "verification_status" });

  // Get filtered authorities based on selected country
  const filteredAuthorities = watchedIssuingCountry
    ? getAuthoritiesByCountry(watchedIssuingCountry)
    : [];

  // Check if expiry is required
  const expiryRequired = watchedCertificateTypeId ? isExpiryRequired(watchedCertificateTypeId) : true;

  // Auto-populate verification fields when status changes to verified
  useEffect(() => {
    if (watchedVerificationStatus === "verified" && user) {
      const currentDate = format(new Date(), "yyyy-MM-dd");
      if (!form.getValues("verified_by_name")) {
        form.setValue("verified_by_user_id", user.id);
        form.setValue("verified_by_name", user.user_metadata?.full_name || user.email || "");
      }
    }
  }, [watchedVerificationStatus, user, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (data: CSMEFormData) => {
    setUploading(true);
    try {
      let documentUrl = editingCertificate?.document_url || null;
      let documentName = editingCertificate?.document_name || null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `csme-certificates/${employeeId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("employee-documents")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("employee-documents")
          .getPublicUrl(filePath);

        documentUrl = urlData.publicUrl;
        documentName = selectedFile.name;
      }

      const payload = {
        certificate_number: data.certificate_number,
        certificate_type_id: data.certificate_type_id || null,
        skill_category: data.certificate_type_id ? "" : "other", // Keep for backward compatibility
        occupation: data.occupation,
        issuing_country: data.issuing_country,
        issuing_authority_id: data.issuing_authority_id || null,
        issuing_authority_name: data.issuing_authority_name || null,
        issue_date: data.issue_date,
        expiry_date: expiryRequired ? (data.expiry_date || null) : null,
        status: data.status,
        verification_status: data.verification_status,
        verified_by_country: data.verified_by_country || null,
        verified_by_user_id: data.verified_by_user_id || null,
        verified_by_name: data.verified_by_name || null,
        verification_method: data.verification_method || null,
        verification_date: data.verification_status === "verified" ? new Date().toISOString() : null,
        notes: data.notes || null,
        document_url: documentUrl,
        document_name: documentName,
      };

      if (editingCertificate) {
        const { error } = await supabase
          .from("employee_csme_certificates")
          .update(payload)
          .eq("id", editingCertificate.id);

        if (error) throw error;

        await logAction({
          action: "UPDATE",
          entityType: "csme_certificate",
          entityId: editingCertificate.id,
          entityName: data.certificate_number,
          newValues: payload,
        });

        toast.success("CSME certificate updated");
      } else {
        const { data: result, error } = await supabase
          .from("employee_csme_certificates")
          .insert({
            employee_id: employeeId,
            ...payload,
          })
          .select()
          .single();

        if (error) throw error;

        const resultData = result as unknown as CSMECertificate;
        await logAction({
          action: "CREATE",
          entityType: "csme_certificate",
          entityId: resultData.id,
          entityName: data.certificate_number,
          newValues: payload,
        });

        toast.success("CSME certificate added");
      }

      setDialogOpen(false);
      setEditingCertificate(null);
      setSelectedFile(null);
      form.reset(getDefaultFormValues());
      fetchCertificates();
    } catch (error) {
      toast.error("Failed to save CSME certificate");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (certificate: CSMECertificate) => {
    setEditingCertificate(certificate);
    setSelectedFile(null);
    form.reset(certificateToFormData(certificate));
    setDialogOpen(true);
  };

  const handleArchive = async (certificate: CSMECertificate) => {
    const { error } = await supabase
      .from("employee_csme_certificates")
      .update({ status: "archived" })
      .eq("id", certificate.id);

    if (error) {
      toast.error("Failed to archive CSME certificate");
    } else {
      await logAction({
        action: "UPDATE",
        entityType: "csme_certificate",
        entityId: certificate.id,
        entityName: certificate.certificate_number,
        oldValues: { status: certificate.status },
        newValues: { status: "archived" },
      });
      toast.success("CSME certificate archived");
      fetchCertificates();
    }
  };

  const openNewDialog = () => {
    setEditingCertificate(null);
    setSelectedFile(null);
    form.reset(getDefaultFormValues());
    setDialogOpen(true);
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return isBefore(new Date(date), new Date());
  };

  const isExpiringSoon = (date: string | null, days: number = 30) => {
    if (!date) return false;
    const expiryDate = new Date(date);
    const warningDate = addDays(new Date(), days);
    return isBefore(expiryDate, warningDate) && !isExpired(date);
  };

  const getStatusBadge = (certificate: CSMECertificate) => {
    if (certificate.status === "archived") {
      return <Badge variant="secondary">Archived</Badge>;
    }
    if (certificate.expiry_date && isExpired(certificate.expiry_date)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (certificate.expiry_date && isExpiringSoon(certificate.expiry_date)) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Expiring Soon</Badge>;
    }
    if (certificate.status === "active") {
      return <Badge variant="default">Active</Badge>;
    }
    return <Badge variant="secondary" className="capitalize">{certificate.status}</Badge>;
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Verified</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPermanentBadge = (certificate: CSMECertificate) => {
    if (!certificate.certificate_type_id) return null;
    const certType = certificateTypes.find(t => t.id === certificate.certificate_type_id);
    if (certType && !certType.requires_expiry) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Permanent</Badge>;
    }
    return null;
  };

  // ESS View
  if (viewType === "ess") {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">CSME Certificates</h3>
        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : certificates.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
              No CSME certificates on file
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {certificates.filter(c => c.status !== "archived").map((cert) => (
              <Card key={cert.id}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{getCertificateTypeName(cert.certificate_type_id)}</p>
                        <p className="text-sm text-muted-foreground">{cert.occupation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPermanentBadge(cert)}
                      {getStatusBadge(cert)}
                      {getVerificationBadge(cert.verification_status)}
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

  // HR View
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">CSME Certificates</h3>
        {canAdd && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add CSME Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCertificate ? "Edit CSME Certificate" : "Add CSME Certificate"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  {/* Section 1: Core Identity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Award className="h-4 w-4" />
                      Core Identity
                    </div>
                    <Separator />

                    <FormField
                      control={form.control}
                      name="certificate_number"
                      rules={{ required: "Certificate number is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certificate Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., CSME-2024-001234" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="certificate_type_id"
                        rules={{ required: "Certificate type is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CSME Certificate Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {certificateTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    <div className="flex flex-col">
                                      <span>{type.name}</span>
                                      {type.description && (
                                        <span className="text-xs text-muted-foreground">{type.description}</span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {watchedCertificateTypeId && !isExpiryRequired(watchedCertificateTypeId) && (
                              <FormDescription className="text-blue-600">
                                This certificate type does not expire
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="occupation"
                        rules={{ required: "Occupation is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Occupation</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Software Engineer" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="issuing_country"
                      rules={{ required: "Issuing country is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issuing Country</FormLabel>
                          <FormControl>
                            <CountrySelect
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                                // Reset authority when country changes
                                form.setValue("issuing_authority_id", "");
                                form.setValue("issuing_authority_name", "");
                              }}
                              valueType="name"
                              placeholder="Select country"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="issuing_authority_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issuing Authority</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                if (value === "other") {
                                  field.onChange("");
                                } else {
                                  field.onChange(value);
                                  form.setValue("issuing_authority_name", "");
                                }
                              }}
                              value={field.value || ""}
                              disabled={!watchedIssuingCountry}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={watchedIssuingCountry ? "Select authority" : "Select country first"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {filteredAuthorities.map((auth) => (
                                  <SelectItem key={auth.id} value={auth.id}>
                                    <div className="flex items-center gap-2">
                                      <Building2 className="h-3 w-3" />
                                      {auth.name}
                                    </div>
                                  </SelectItem>
                                ))}
                                <SelectItem value="other">
                                  <span className="text-muted-foreground">Other (specify)</span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="issuing_authority_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Authority Name (if Other)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter authority name"
                                disabled={!!form.watch("issuing_authority_id")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section 2: Validity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Validity
                    </div>
                    <Separator />

                    <div className="grid grid-cols-3 gap-4">
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

                      {expiryRequired && (
                        <FormField
                          control={form.control}
                          name="expiry_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

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
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="revoked">Revoked</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section 3: Verification (Audit-Grade) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                      Verification (Audit-Grade)
                    </div>
                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="verification_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verification Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="verification_method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verification Method</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {VERIFICATION_METHODS.map((method) => (
                                  <SelectItem key={method.value} value={method.value}>
                                    {method.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="verified_by_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verified By</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Verifier name" />
                            </FormControl>
                            <FormDescription>
                              {watchedVerificationStatus === "verified" && "Auto-filled when marking as verified"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="verified_by_country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verified By Country</FormLabel>
                            <FormControl>
                              <CountrySelect
                                value={field.value}
                                onChange={field.onChange}
                                valueType="name"
                                placeholder="Select country"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section 4: Evidence */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      Evidence
                    </div>
                    <Separator />

                    <div className="space-y-2">
                      <FormLabel>Supporting Document</FormLabel>
                      {editingCertificate?.document_url && !selectedFile && (
                        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm flex-1">{editingCertificate.document_name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(editingCertificate.document_url!, "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={handleFileChange}
                          className="flex-1"
                        />
                        {selectedFile && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} placeholder="Additional notes or comments..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={uploading || isLoadingLookups}>
                      {uploading ? "Saving..." : editingCertificate ? "Update" : "Add"}
                    </Button>
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
            <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No CSME certificates on file
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert) => (
            <Card key={cert.id} className={cert.status === "archived" ? "opacity-60" : ""}>
              <CardContent className="py-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{getCertificateTypeName(cert.certificate_type_id)}</p>
                        {getPermanentBadge(cert)}
                      </div>
                      <p className="text-sm text-muted-foreground">{cert.occupation}</p>
                      <p className="text-xs text-muted-foreground">
                        {cert.certificate_number} • {cert.issuing_country}
                        {(cert.issuing_authority?.name || cert.issuing_authority_name) && (
                          <> • {cert.issuing_authority?.name || cert.issuing_authority_name}</>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Issued: {formatDateForDisplay(cert.issue_date)}
                        {cert.expiry_date && <> • Expires: {formatDateForDisplay(cert.expiry_date)}</>}
                      </p>
                      {cert.verification_status === "verified" && cert.verified_by_name && (
                        <p className="text-xs text-green-600">
                          Verified by {cert.verified_by_name}
                          {cert.verification_method && <> via {VERIFICATION_METHODS.find(m => m.value === cert.verification_method)?.label}</>}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(cert)}
                      {getVerificationBadge(cert.verification_status)}
                    </div>
                    {canEdit && cert.status !== "archived" && (
                      <div className="flex items-center gap-1">
                        {cert.document_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(cert.document_url!, "_blank")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(cert)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleArchive(cert)}>
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={!!viewingCertificate} onOpenChange={() => setViewingCertificate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>CSME Certificate Details</DialogTitle>
          </DialogHeader>
          {viewingCertificate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Certificate Number</p>
                  <p className="font-medium">{viewingCertificate.certificate_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Certificate Type</p>
                  <p className="font-medium">{getCertificateTypeName(viewingCertificate.certificate_type_id)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Occupation</p>
                  <p className="font-medium">{viewingCertificate.occupation}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Issuing Country</p>
                  <p className="font-medium">{viewingCertificate.issuing_country}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  {getStatusBadge(viewingCertificate)}
                </div>
                <div>
                  <p className="text-muted-foreground">Verification</p>
                  {getVerificationBadge(viewingCertificate.verification_status)}
                </div>
              </div>
              {viewingCertificate.notes && (
                <div>
                  <p className="text-muted-foreground text-sm">Notes</p>
                  <p className="text-sm">{viewingCertificate.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
