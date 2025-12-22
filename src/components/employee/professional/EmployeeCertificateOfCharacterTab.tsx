import { useState, useEffect, useRef } from "react";
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
import { Plus, Pencil, Archive, FileText, CheckCircle, XCircle, Clock, Eye, Upload, X, Download } from "lucide-react";
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
  scope: string | null;
  consent_date: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
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
  scope: string;
  consent_date: string;
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
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentAttachment, setCurrentAttachment] = useState<{ url: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      scope: "",
      consent_date: "",
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (checkId: string): Promise<{ url: string; name: string } | null> => {
    if (!selectedFile) return null;

    const fileExt = selectedFile.name.split('.').pop();
    const filePath = `certificates/${employeeId}/${checkId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('compliance-documents')
      .upload(filePath, selectedFile);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      toast.error("Failed to upload document");
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('compliance-documents')
      .getPublicUrl(filePath);

    return { url: publicUrl, name: selectedFile.name };
  };

  const handleSubmit = async (data: CertificateFormData) => {
    try {
      setUploadingFile(true);
      
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
        scope: data.scope || null,
        consent_date: data.consent_date || null,
      };

      if (editingCertificate) {
        let attachmentData = {};
        if (selectedFile) {
          const uploaded = await uploadFile(editingCertificate.id);
          if (uploaded) {
            attachmentData = { attachment_url: uploaded.url, attachment_name: uploaded.name };
          }
        }

        const { error } = await supabase
          .from("employee_background_checks")
          .update({ ...payload, ...attachmentData })
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

        if (selectedFile && result) {
          const uploaded = await uploadFile(result.id);
          if (uploaded) {
            await supabase
              .from("employee_background_checks")
              .update({ attachment_url: uploaded.url, attachment_name: uploaded.name })
              .eq("id", result.id);
          }
        }
        
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
      setSelectedFile(null);
      setCurrentAttachment(null);
      form.reset();
      fetchCertificates();
    } catch (error) {
      toast.error("Failed to save certificate of character");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleEdit = (certificate: CertificateOfCharacter) => {
    setEditingCertificate(certificate);
    setCurrentAttachment(certificate.attachment_url ? { url: certificate.attachment_url, name: certificate.attachment_name || 'Document' } : null);
    setSelectedFile(null);
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
      scope: certificate.scope || "",
      consent_date: certificate.consent_date || "",
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
    setSelectedFile(null);
    setCurrentAttachment(null);
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
      scope: "",
      consent_date: "",
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

  const getScopeBadge = (scope: string | null) => {
    if (!scope) return null;
    const labels: Record<string, string> = {
      local: "Local",
      regional: "Regional",
      national: "National",
      international: "International",
    };
    return <Badge variant="outline" className="text-xs">{labels[scope] || scope}</Badge>;
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCertificate ? "Edit Certificate" : "Add Certificate of Character"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {/* Row 1: Certificate Type, Jurisdiction, Scope */}
                  <div className="grid grid-cols-3 gap-4">
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
                    <FormField
                      control={form.control}
                      name="scope"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scope</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select scope..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="local">Local</SelectItem>
                              <SelectItem value="regional">Regional</SelectItem>
                              <SelectItem value="national">National</SelectItem>
                              <SelectItem value="international">International</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 2: Provider, Reference Number */}
                  <div className="grid grid-cols-2 gap-4">
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
                    <FormField
                      control={form.control}
                      name="reference_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Certificate ID" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 3: Requested Date, Consent Date, Completed Date */}
                  <div className="grid grid-cols-3 gap-4">
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
                      name="consent_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consent Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
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

                  {/* Row 4: Status, Result, Expiry Date */}
                  <div className="grid grid-cols-3 gap-4">
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
                              <SelectItem value="inconclusive">Inconclusive</SelectItem>
                            </SelectContent>
                          </Select>
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

                  {/* Row 5: Attachment */}
                  <div className="space-y-2">
                    <FormLabel>Attachment</FormLabel>
                    <div className="border rounded-md p-4 space-y-3">
                      {currentAttachment && !selectedFile && (
                        <div className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{currentAttachment.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(currentAttachment.url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentAttachment(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      {selectedFile && (
                        <div className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{selectedFile.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {selectedFile || currentAttachment ? "Replace File" : "Upload Document"}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          PDF, Word, or Image (max 10MB)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 6: Notes */}
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
                    <Button type="submit" disabled={uploadingFile}>
                      {uploadingFile ? "Saving..." : editingCertificate ? "Update" : "Add"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewingCertificate} onOpenChange={() => setViewingCertificate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="capitalize">{viewingCertificate?.check_type.replace("_", " ")} Details</DialogTitle>
          </DialogHeader>
          {viewingCertificate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Certificate Type</p>
                  <p className="capitalize">{viewingCertificate.check_type.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  {getStatusBadge(viewingCertificate.status)}
                </div>
                {viewingCertificate.jurisdiction && (
                  <div>
                    <p className="text-muted-foreground">Jurisdiction</p>
                    <p>{viewingCertificate.jurisdiction}</p>
                  </div>
                )}
                {viewingCertificate.scope && (
                  <div>
                    <p className="text-muted-foreground">Scope</p>
                    <p className="capitalize">{viewingCertificate.scope}</p>
                  </div>
                )}
                {viewingCertificate.provider && (
                  <div>
                    <p className="text-muted-foreground">Provider</p>
                    <p>{viewingCertificate.provider}</p>
                  </div>
                )}
                {viewingCertificate.reference_number && (
                  <div>
                    <p className="text-muted-foreground">Reference</p>
                    <p>{viewingCertificate.reference_number}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Requested Date</p>
                  <p>{formatDateForDisplay(viewingCertificate.requested_date)}</p>
                </div>
                {viewingCertificate.consent_date && (
                  <div>
                    <p className="text-muted-foreground">Consent Date</p>
                    <p>{formatDateForDisplay(viewingCertificate.consent_date)}</p>
                  </div>
                )}
                {viewingCertificate.completed_date && (
                  <div>
                    <p className="text-muted-foreground">Completed Date</p>
                    <p>{formatDateForDisplay(viewingCertificate.completed_date)}</p>
                  </div>
                )}
                {viewingCertificate.expiry_date && (
                  <div>
                    <p className="text-muted-foreground">Expiry Date</p>
                    <p>{formatDateForDisplay(viewingCertificate.expiry_date)}</p>
                  </div>
                )}
                {canViewResults && viewingCertificate.result && (
                  <div>
                    <p className="text-muted-foreground">Result</p>
                    <p className="capitalize">{viewingCertificate.result}</p>
                  </div>
                )}
              </div>
              {viewingCertificate.attachment_url && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Attachment</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(viewingCertificate.attachment_url!, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {viewingCertificate.attachment_name || 'Download Document'}
                  </Button>
                </div>
              )}
              {canViewNotes && viewingCertificate.notes && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{viewingCertificate.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            <Card key={certificate.id} className={certificate.status === "archived" ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getComplianceIndicator(certificate)}
                    <CardTitle className="text-base capitalize">
                      {certificate.check_type.replace("_", " ")}
                    </CardTitle>
                    {getStatusBadge(certificate.status)}
                    {getScopeBadge(certificate.scope)}
                    {certificate.attachment_url && (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex gap-1">
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
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Requested:</span>{" "}
                    {formatDateForDisplay(certificate.requested_date)}
                  </div>
                  {certificate.jurisdiction && (
                    <div>
                      <span className="text-muted-foreground">Jurisdiction:</span>{" "}
                      {certificate.jurisdiction}
                    </div>
                  )}
                  {certificate.consent_date && (
                    <div>
                      <span className="text-muted-foreground">Consent:</span>{" "}
                      {formatDateForDisplay(certificate.consent_date)}
                    </div>
                  )}
                  {canViewResults && certificate.result && (
                    <div>
                      <span className="text-muted-foreground">Result:</span>{" "}
                      <span className="capitalize">{certificate.result}</span>
                    </div>
                  )}
                  {certificate.expiry_date && (
                    <div>
                      <span className="text-muted-foreground">Expires:</span>{" "}
                      {formatDateForDisplay(certificate.expiry_date)}
                    </div>
                  )}
                  {certificate.provider && (
                    <div>
                      <span className="text-muted-foreground">Provider:</span>{" "}
                      {certificate.provider}
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
