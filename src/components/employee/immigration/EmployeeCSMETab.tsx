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
import { Plus, Pencil, Archive, Award, AlertCircle, Upload, FileText, X, Download, Eye } from "lucide-react";
import { isBefore, addDays } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { CountrySelect } from "@/components/ui/country-select";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { useAuditLog } from "@/hooks/useAuditLog";

interface CSMECertificate {
  id: string;
  employee_id: string;
  certificate_number: string;
  skill_category: string;
  occupation: string;
  issuing_country: string;
  issue_date: string;
  expiry_date: string | null;
  status: string;
  verification_status: string;
  verified_by_country: string | null;
  verification_date: string | null;
  document_url: string | null;
  document_name: string | null;
  notes: string | null;
}

interface CSMEFormData {
  certificate_number: string;
  skill_category: string;
  occupation: string;
  issuing_country: string;
  issue_date: string;
  expiry_date: string;
  status: string;
  verification_status: string;
  verified_by_country: string;
  notes: string;
}

interface EmployeeCSMETabProps {
  employeeId: string;
  viewType?: "hr" | "manager" | "ess";
}

const SKILL_CATEGORIES = [
  { value: "university_graduate", label: "University Graduate" },
  { value: "media_worker", label: "Media Worker" },
  { value: "sportsperson", label: "Sportsperson" },
  { value: "artiste", label: "Artiste" },
  { value: "musician", label: "Musician" },
  { value: "nurse", label: "Nurse" },
  { value: "teacher", label: "Teacher" },
  { value: "artisan", label: "Artisan" },
  { value: "domestic_worker", label: "Domestic Worker" },
  { value: "security_guard", label: "Security Guard" },
  { value: "agricultural_worker", label: "Agricultural Worker" },
  { value: "hospitality_worker", label: "Hospitality Worker" },
  { value: "other", label: "Other" },
];

export function EmployeeCSMETab({ employeeId, viewType = "hr" }: EmployeeCSMETabProps) {
  const [certificates, setCertificates] = useState<CSMECertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<CSMECertificate | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<CSMECertificate | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { hasTabAccess } = useGranularPermissions();
  const { logAction } = useAuditLog();

  const canEdit = viewType === "hr" && hasTabAccess("workforce", "immigration", "edit");
  const canAdd = viewType === "hr" && hasTabAccess("workforce", "immigration", "create");

  const form = useForm<CSMEFormData>({
    defaultValues: {
      certificate_number: "",
      skill_category: "university_graduate",
      occupation: "",
      issuing_country: "",
      issue_date: "",
      expiry_date: "",
      status: "active",
      verification_status: "pending",
      verified_by_country: "",
      notes: "",
    },
  });

  const fetchCertificates = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("employee_csme_certificates")
      .select("*")
      .eq("employee_id", employeeId)
      .order("issue_date", { ascending: false });

    if (error) {
      toast.error("Failed to load CSME certificates");
    } else {
      setCertificates(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCertificates();
  }, [employeeId]);

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
        skill_category: data.skill_category,
        occupation: data.occupation,
        issuing_country: data.issuing_country,
        issue_date: data.issue_date,
        expiry_date: data.expiry_date || null,
        status: data.status,
        verification_status: data.verification_status,
        verified_by_country: data.verified_by_country || null,
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

        await logAction({
          action: "CREATE",
          entityType: "csme_certificate",
          entityId: result.id,
          entityName: data.certificate_number,
          newValues: payload,
        });

        toast.success("CSME certificate added");
      }

      setDialogOpen(false);
      setEditingCertificate(null);
      setSelectedFile(null);
      form.reset();
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
    form.reset({
      certificate_number: certificate.certificate_number,
      skill_category: certificate.skill_category,
      occupation: certificate.occupation,
      issuing_country: certificate.issuing_country,
      issue_date: certificate.issue_date,
      expiry_date: certificate.expiry_date || "",
      status: certificate.status,
      verification_status: certificate.verification_status,
      verified_by_country: certificate.verified_by_country || "",
      notes: certificate.notes || "",
    });
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
    form.reset();
    setDialogOpen(true);
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return isBefore(new Date(date), new Date());
  };

  const getStatusBadge = (certificate: CSMECertificate) => {
    if (certificate.status === "archived") {
      return <Badge variant="secondary">Archived</Badge>;
    }
    if (certificate.expiry_date && isExpired(certificate.expiry_date)) {
      return <Badge variant="destructive">Expired</Badge>;
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

  const getSkillCategoryLabel = (value: string) => {
    return SKILL_CATEGORIES.find(c => c.value === value)?.label || value;
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
                        <p className="font-medium">{getSkillCategoryLabel(cert.skill_category)}</p>
                        <p className="text-sm text-muted-foreground">{cert.occupation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCertificate ? "Edit CSME Certificate" : "Add CSME Certificate"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="certificate_number"
                    rules={{ required: "Certificate number is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certificate Number</FormLabel>
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
                      name="skill_category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skill Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SKILL_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                            onChange={field.onChange}
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
                          <FormLabel>Expiry Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
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
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                              <SelectItem value="revoked">Revoked</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
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
                        </FormItem>
                      )}
                    />
                  </div>

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
                          <Textarea {...field} rows={3} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Supporting Document</FormLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="flex-1"
                      />
                      {selectedFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
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
                    {editingCertificate?.document_name && !selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        Current: {editingCertificate.document_name}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={uploading}>
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
        <div className="grid gap-4">
          {certificates.map((cert) => (
            <Card key={cert.id} className={cert.status === "archived" ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">
                      {getSkillCategoryLabel(cert.skill_category)}
                    </CardTitle>
                    {getStatusBadge(cert)}
                    {getVerificationBadge(cert.verification_status)}
                  </div>
                  {canEdit && cert.status !== "archived" && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(cert)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleArchive(cert)}>
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Certificate #:</span>
                    <p className="font-medium">{cert.certificate_number}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Occupation:</span>
                    <p className="font-medium">{cert.occupation}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issuing Country:</span>
                    <p className="font-medium">{cert.issuing_country}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issue Date:</span>
                    <p className="font-medium">{formatDateForDisplay(cert.issue_date)}</p>
                  </div>
                  {cert.expiry_date && (
                    <div>
                      <span className="text-muted-foreground">Expiry Date:</span>
                      <p className="font-medium">{formatDateForDisplay(cert.expiry_date)}</p>
                    </div>
                  )}
                  {cert.verified_by_country && (
                    <div>
                      <span className="text-muted-foreground">Verified By:</span>
                      <p className="font-medium">{cert.verified_by_country}</p>
                    </div>
                  )}
                </div>
                {cert.notes && (
                  <p className="mt-2 text-sm text-muted-foreground">{cert.notes}</p>
                )}
                {cert.document_url && (
                  <div className="mt-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={cert.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {cert.document_name || "View Document"}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
