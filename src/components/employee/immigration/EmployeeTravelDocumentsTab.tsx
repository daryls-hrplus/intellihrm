import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plus, Pencil, Archive, Plane, FileText, X, Shield, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { isBefore, addDays, format } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { CountrySelect } from "@/components/ui/country-select";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useAuth } from "@/contexts/AuthContext";

interface TravelDocument {
  id: string;
  employee_id: string;
  document_type: string;
  document_subtype: string | null;
  document_number: string;
  issuing_country: string;
  issuing_authority: string | null;
  nationality: string | null;
  issue_date: string;
  expiry_date: string;
  issue_place: string | null;
  status: string;
  is_primary: boolean;
  is_biometric: boolean;
  document_url: string | null;
  document_name: string | null;
  notes: string | null;
  expiry_alert_days: number;
  previous_document_number: string | null;
  verified_at: string | null;
  verified_by: string | null;
  verification_method: string | null;
  verification_notes: string | null;
  verification_status: string;
}

interface TravelDocumentFormData {
  document_type: string;
  document_subtype: string;
  document_number: string;
  issuing_country: string;
  issuing_authority: string;
  nationality: string;
  issue_place: string;
  is_biometric: boolean;
  is_primary: boolean;
  issue_date: string;
  expiry_date: string;
  expiry_alert_days: number;
  status: string;
  previous_document_number: string;
  notes: string;
  verification_method: string;
  verification_notes: string;
}

interface EmployeeTravelDocumentsTabProps {
  employeeId: string;
  viewType?: "hr" | "manager" | "ess";
}

const DOCUMENT_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID" },
  { value: "travel_document", label: "Travel Document" },
  { value: "refugee_document", label: "Refugee Travel Document" },
  { value: "emergency_passport", label: "Emergency Passport" },
  { value: "laissez_passer", label: "Laissez-Passer" },
  { value: "other", label: "Other" },
];

const DOCUMENT_SUBTYPES: Record<string, { value: string; label: string }[]> = {
  passport: [
    { value: "regular", label: "Regular/Ordinary" },
    { value: "diplomatic", label: "Diplomatic" },
    { value: "official", label: "Official/Service" },
    { value: "emergency", label: "Emergency" },
  ],
  national_id: [
    { value: "national", label: "National ID Card" },
    { value: "resident", label: "Resident ID" },
    { value: "voter", label: "Voter ID" },
  ],
  travel_document: [
    { value: "laissez_passer", label: "Laissez-Passer" },
    { value: "certificate_of_identity", label: "Certificate of Identity" },
    { value: "refugee", label: "Refugee Travel Document" },
  ],
  other: [
    { value: "other", label: "Other" },
  ],
};

const VERIFICATION_METHODS = [
  { value: "visual_inspection", label: "Visual Inspection" },
  { value: "database_check", label: "Database Verification" },
  { value: "embassy_verification", label: "Embassy/Consulate Verification" },
  { value: "third_party", label: "Third-Party Verification Service" },
];

export function EmployeeTravelDocumentsTab({ employeeId, viewType = "hr" }: EmployeeTravelDocumentsTabProps) {
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<TravelDocument | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verifierName, setVerifierName] = useState<Record<string, string>>({});

  const { user } = useAuth();
  const { hasTabAccess } = useGranularPermissions();
  const { logAction } = useAuditLog();

  const canEdit = viewType === "hr" && hasTabAccess("workforce", "immigration", "edit");
  const canAdd = viewType === "hr" && hasTabAccess("workforce", "immigration", "create");

  const form = useForm<TravelDocumentFormData>({
    defaultValues: {
      document_type: "passport",
      document_subtype: "regular",
      document_number: "",
      issuing_country: "",
      issuing_authority: "",
      nationality: "",
      issue_place: "",
      is_biometric: false,
      is_primary: false,
      issue_date: "",
      expiry_date: "",
      expiry_alert_days: 90,
      status: "active",
      previous_document_number: "",
      notes: "",
      verification_method: "",
      verification_notes: "",
    },
  });

  const watchDocumentType = form.watch("document_type");

  const fetchDocuments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("employee_travel_documents" as any)
      .select("*")
      .eq("employee_id", employeeId)
      .order("is_primary", { ascending: false })
      .order("expiry_date", { ascending: false });

    if (error) {
      toast.error("Failed to load travel documents");
    } else {
      const docs = (data || []) as unknown as TravelDocument[];
      setDocuments(docs);
      
      const verifierIds = docs.filter(d => d.verified_by).map(d => d.verified_by);
      if (verifierIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", verifierIds);
        
        if (profiles) {
          const names: Record<string, string> = {};
          profiles.forEach(p => { names[p.id] = p.full_name || "Unknown"; });
          setVerifierName(names);
        }
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
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

  const handleSubmit = async (data: TravelDocumentFormData) => {
    setUploading(true);
    try {
      let documentUrl = editingDocument?.document_url || null;
      let documentName = editingDocument?.document_name || null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `travel-documents/${employeeId}/${Date.now()}.${fileExt}`;

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

      const shouldVerify = data.verification_method && !editingDocument?.verified_at;

      const payload = {
        document_type: data.document_type,
        document_subtype: data.document_subtype || null,
        document_number: data.document_number,
        issuing_country: data.issuing_country,
        issuing_authority: data.issuing_authority || null,
        nationality: data.nationality || null,
        issue_date: data.issue_date,
        expiry_date: data.expiry_date,
        issue_place: data.issue_place || null,
        status: data.status,
        is_primary: data.is_primary,
        is_biometric: data.is_biometric,
        notes: data.notes || null,
        document_url: documentUrl,
        document_name: documentName,
        expiry_alert_days: data.expiry_alert_days || 90,
        previous_document_number: data.previous_document_number || null,
        verification_method: data.verification_method || editingDocument?.verification_method || null,
        verification_notes: data.verification_notes || editingDocument?.verification_notes || null,
        verification_status: shouldVerify ? "verified" : (editingDocument?.verification_status || "pending"),
        verified_at: shouldVerify ? new Date().toISOString() : editingDocument?.verified_at,
        verified_by: shouldVerify ? user?.id : editingDocument?.verified_by,
      };

      if (editingDocument) {
        const { error } = await supabase
          .from("employee_travel_documents" as any)
          .update(payload)
          .eq("id", editingDocument.id);

        if (error) throw error;

        await logAction({
          action: "UPDATE",
          entityType: "travel_document",
          entityId: editingDocument.id,
          entityName: data.document_number,
          newValues: payload,
        });

        toast.success("Travel document updated");
      } else {
        const { data: result, error } = await supabase
          .from("employee_travel_documents" as any)
          .insert({
            employee_id: employeeId,
            ...payload,
          })
          .select()
          .single();

        if (error) throw error;

        const resultData = result as unknown as TravelDocument;
        await logAction({
          action: "CREATE",
          entityType: "travel_document",
          entityId: resultData.id,
          entityName: data.document_number,
          newValues: payload,
        });

        toast.success("Travel document added");
      }

      setDialogOpen(false);
      setEditingDocument(null);
      setSelectedFile(null);
      form.reset();
      fetchDocuments();
    } catch (error) {
      toast.error("Failed to save travel document");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (document: TravelDocument) => {
    setEditingDocument(document);
    setSelectedFile(null);
    form.reset({
      document_type: document.document_type,
      document_subtype: document.document_subtype || "regular",
      document_number: document.document_number,
      issuing_country: document.issuing_country,
      issuing_authority: document.issuing_authority || "",
      nationality: document.nationality || "",
      issue_date: document.issue_date,
      expiry_date: document.expiry_date,
      issue_place: document.issue_place || "",
      status: document.status,
      is_primary: document.is_primary,
      is_biometric: document.is_biometric || false,
      notes: document.notes || "",
      expiry_alert_days: document.expiry_alert_days || 90,
      previous_document_number: document.previous_document_number || "",
      verification_method: document.verification_method || "",
      verification_notes: document.verification_notes || "",
    });
    setDialogOpen(true);
  };

  const handleArchive = async (document: TravelDocument) => {
    const { error } = await supabase
      .from("employee_travel_documents" as any)
      .update({ status: "archived" })
      .eq("id", document.id);

    if (error) {
      toast.error("Failed to archive travel document");
    } else {
      await logAction({
        action: "UPDATE",
        entityType: "travel_document",
        entityId: document.id,
        entityName: document.document_number,
        oldValues: { status: document.status },
        newValues: { status: "archived" },
      });
      toast.success("Travel document archived");
      fetchDocuments();
    }
  };

  const openNewDialog = () => {
    setEditingDocument(null);
    setSelectedFile(null);
    form.reset();
    setDialogOpen(true);
  };

  const isExpired = (date: string) => isBefore(new Date(date), new Date());
  const isExpiringSoon = (date: string, alertDays: number = 90) => {
    const expiryDate = new Date(date);
    const warningDate = addDays(new Date(), alertDays);
    return isBefore(expiryDate, warningDate) && !isExpired(date);
  };

  const getStatusBadge = (document: TravelDocument) => {
    if (document.status === "archived") {
      return <Badge variant="secondary">Archived</Badge>;
    }
    if (isExpired(document.expiry_date)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (isExpiringSoon(document.expiry_date, document.expiry_alert_days)) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Expiring Soon</Badge>;
    }
    if (document.status === "active") {
      return <Badge variant="default">Active</Badge>;
    }
    return <Badge variant="secondary" className="capitalize">{document.status}</Badge>;
  };

  const getVerificationBadge = (doc: TravelDocument) => {
    switch (doc.verification_status) {
      case "verified":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case "rejected":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "expired":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Verification Expired</Badge>;
      default:
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getDocumentTypeLabel = (value: string) => {
    return DOCUMENT_TYPES.find(t => t.value === value)?.label || value;
  };

  const getSubtypeLabel = (type: string, subtype: string | null) => {
    if (!subtype) return null;
    const subtypes = DOCUMENT_SUBTYPES[type] || DOCUMENT_SUBTYPES.other;
    return subtypes.find(s => s.value === subtype)?.label || subtype;
  };

  // ESS View
  if (viewType === "ess") {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Travel Documents</h3>
        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No travel documents on file</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Plane className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{getDocumentTypeLabel(doc.document_type)}</span>
                          {doc.is_primary && <Badge variant="outline">Primary</Badge>}
                          {doc.is_biometric && <Badge variant="secondary">ePassport</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {doc.document_number} • {doc.issuing_country}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Expires: {formatDateForDisplay(doc.expiry_date)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getVerificationBadge(doc)}
                      {getStatusBadge(doc)}
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Travel Documents</h3>
        {canAdd && (
          <Button size="sm" onClick={openNewDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No travel documents recorded</p>
            {canAdd && (
              <Button variant="outline" className="mt-4" onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Travel Document
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Plane className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {getDocumentTypeLabel(doc.document_type)}
                        {doc.document_subtype && (
                          <span className="text-sm font-normal text-muted-foreground">
                            ({getSubtypeLabel(doc.document_type, doc.document_subtype)})
                          </span>
                        )}
                        {doc.is_primary && <Badge variant="outline">Primary</Badge>}
                        {doc.is_biometric && <Badge variant="secondary">ePassport</Badge>}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{doc.document_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getVerificationBadge(doc)}
                    {getStatusBadge(doc)}
                    {canEdit && doc.status !== "archived" && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(doc)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleArchive(doc)}>
                          <Archive className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Issuing Country</span>
                    <p className="font-medium">{doc.issuing_country}</p>
                  </div>
                  {doc.issuing_authority && (
                    <div>
                      <span className="text-muted-foreground">Issuing Authority</span>
                      <p className="font-medium">{doc.issuing_authority}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Issue Date</span>
                    <p className="font-medium">{formatDateForDisplay(doc.issue_date)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expiry Date</span>
                    <p className="font-medium">{formatDateForDisplay(doc.expiry_date)}</p>
                  </div>
                  {doc.nationality && (
                    <div>
                      <span className="text-muted-foreground">Nationality</span>
                      <p className="font-medium">{doc.nationality}</p>
                    </div>
                  )}
                  {doc.previous_document_number && (
                    <div>
                      <span className="text-muted-foreground">Previous Document</span>
                      <p className="font-medium">{doc.previous_document_number}</p>
                    </div>
                  )}
                </div>
                
                {doc.verification_status === "verified" && doc.verified_at && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>
                        Verified on {formatDateForDisplay(doc.verified_at)}
                        {doc.verified_by && verifierName[doc.verified_by] && ` by ${verifierName[doc.verified_by]}`}
                        {doc.verification_method && ` via ${VERIFICATION_METHODS.find(m => m.value === doc.verification_method)?.label || doc.verification_method}`}
                      </span>
                    </div>
                  </div>
                )}

                {doc.document_url && (
                  <div className="mt-3 pt-3 border-t">
                    <a
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      {doc.document_name || "View Document"}
                    </a>
                  </div>
                )}

                {doc.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">{doc.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDocument ? "Edit Travel Document" : "Add Travel Document"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Section 1: Document Identity */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Document Identity</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="document_type"
                    rules={{ required: "Document type is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DOCUMENT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="document_subtype"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub-Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sub-type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(DOCUMENT_SUBTYPES[watchDocumentType] || DOCUMENT_SUBTYPES.other).map((subtype) => (
                              <SelectItem key={subtype.value} value={subtype.value}>
                                {subtype.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="document_number"
                  rules={{ required: "Document number is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., A12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="issuing_country"
                    rules={{ required: "Issuing country is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issuing Country *</FormLabel>
                        <FormControl>
                          <CountrySelect
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select country"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="issuing_authority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issuing Authority</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Immigration Dept" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality</FormLabel>
                        <FormControl>
                          <CountrySelect
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select nationality"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="issue_place"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Place of Issue</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Kingston" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="previous_document_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Document Number</FormLabel>
                      <FormControl>
                        <Input placeholder="For renewals, enter previous document number" {...field} />
                      </FormControl>
                      <FormDescription>Useful for tracking document renewals</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Section 2: Validity & Alerts */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Validity & Alerts</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="issue_date"
                    rules={{ required: "Issue date is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Date *</FormLabel>
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
                    rules={{ required: "Expiry date is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date *</FormLabel>
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
                    name="expiry_alert_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Alert (Days Before)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0} 
                            max={365}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 90)}
                          />
                        </FormControl>
                        <FormDescription>Alert when document expires within this many days</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="lost">Lost/Stolen</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-6">
                  <FormField
                    control={form.control}
                    name="is_primary"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Primary Document</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_biometric"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">ePassport / Biometric</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Section 3: Verification */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Verification</h4>
                
                {editingDocument?.verification_status === "verified" && editingDocument.verified_at ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Already Verified</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Verified on {formatDateForDisplay(editingDocument.verified_at)}
                      {editingDocument.verified_by && verifierName[editingDocument.verified_by] && ` by ${verifierName[editingDocument.verified_by]}`}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
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
                          <FormDescription>
                            Selecting a method marks document as verified
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="verification_notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Notes</FormLabel>
                          <FormControl>
                            <Input placeholder="Any verification notes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Section 4: Evidence & Notes */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Evidence & Notes</h4>
                
                <FormItem>
                  <FormLabel>Upload Document Scan</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                      {selectedFile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>{selectedFile.name}</span>
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
                      {editingDocument?.document_url && !selectedFile && (
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-primary" />
                          <a
                            href={editingDocument.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {editingDocument.document_name || "Current Document"}
                          </a>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>PDF, JPG, or PNG up to 10MB</FormDescription>
                </FormItem>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional notes..."
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  {uploading ? "Saving..." : editingDocument ? "Update Document" : "Add Document"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
