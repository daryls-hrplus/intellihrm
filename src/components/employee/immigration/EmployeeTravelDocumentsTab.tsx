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
  is_machine_readable: boolean;
  document_url: string | null;
  document_name: string | null;
  notes: string | null;
  // MRZ Fields
  mrz_line_1: string | null;
  mrz_line_2: string | null;
  mrz_surname: string | null;
  mrz_given_names: string | null;
  mrz_check_digit_valid: boolean | null;
  machine_readable_name: string | null;
  // Alert & Validity
  expiry_alert_days: number;
  visa_pages_remaining: number | null;
  previous_document_number: string | null;
  date_of_birth_on_doc: string | null;
  gender_on_doc: string | null;
  // Verification
  verified_at: string | null;
  verified_by: string | null;
  verification_method: string | null;
  verification_notes: string | null;
  verification_status: string;
}

interface TravelDocumentFormData {
  // Core Identity
  document_type: string;
  document_subtype: string;
  document_number: string;
  issuing_country: string;
  issuing_authority: string;
  nationality: string;
  issue_place: string;
  // Document Features
  is_biometric: boolean;
  is_machine_readable: boolean;
  is_primary: boolean;
  // Validity
  issue_date: string;
  expiry_date: string;
  expiry_alert_days: number;
  status: string;
  // Biographical on Document
  date_of_birth_on_doc: string;
  gender_on_doc: string;
  machine_readable_name: string;
  // MRZ Data
  mrz_line_1: string;
  mrz_line_2: string;
  mrz_surname: string;
  mrz_given_names: string;
  mrz_check_digit_valid: boolean;
  // Additional
  visa_pages_remaining: number | null;
  previous_document_number: string;
  notes: string;
  // Verification
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
    { value: "collective", label: "Collective/Group" },
    { value: "family", label: "Family" },
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
    { value: "stateless", label: "Stateless Person Document" },
  ],
  other: [
    { value: "other", label: "Other" },
  ],
};

const VERIFICATION_METHODS = [
  { value: "visual_inspection", label: "Visual Inspection" },
  { value: "uv_light", label: "UV Light Check" },
  { value: "machine_reader", label: "Machine Reader/Scanner" },
  { value: "database_check", label: "Database Verification" },
  { value: "embassy_verification", label: "Embassy/Consulate Verification" },
  { value: "third_party", label: "Third-Party Verification Service" },
];

const GENDER_OPTIONS = [
  { value: "M", label: "Male (M)" },
  { value: "F", label: "Female (F)" },
  { value: "X", label: "Non-Binary (X)" },
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
      is_machine_readable: true,
      is_primary: false,
      issue_date: "",
      expiry_date: "",
      expiry_alert_days: 90,
      status: "active",
      date_of_birth_on_doc: "",
      gender_on_doc: "",
      machine_readable_name: "",
      mrz_line_1: "",
      mrz_line_2: "",
      mrz_surname: "",
      mrz_given_names: "",
      mrz_check_digit_valid: false,
      visa_pages_remaining: null,
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
      
      // Fetch verifier names
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
        is_machine_readable: data.is_machine_readable,
        notes: data.notes || null,
        document_url: documentUrl,
        document_name: documentName,
        // MRZ Data
        mrz_line_1: data.mrz_line_1 || null,
        mrz_line_2: data.mrz_line_2 || null,
        mrz_surname: data.mrz_surname || null,
        mrz_given_names: data.mrz_given_names || null,
        mrz_check_digit_valid: data.mrz_check_digit_valid,
        machine_readable_name: data.machine_readable_name || null,
        // Validity & Alert
        expiry_alert_days: data.expiry_alert_days || 90,
        visa_pages_remaining: data.visa_pages_remaining,
        previous_document_number: data.previous_document_number || null,
        date_of_birth_on_doc: data.date_of_birth_on_doc || null,
        gender_on_doc: data.gender_on_doc || null,
        // Verification
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
      is_machine_readable: document.is_machine_readable || false,
      notes: document.notes || "",
      expiry_alert_days: document.expiry_alert_days || 90,
      mrz_line_1: document.mrz_line_1 || "",
      mrz_line_2: document.mrz_line_2 || "",
      mrz_surname: document.mrz_surname || "",
      mrz_given_names: document.mrz_given_names || "",
      mrz_check_digit_valid: document.mrz_check_digit_valid || false,
      machine_readable_name: document.machine_readable_name || "",
      visa_pages_remaining: document.visa_pages_remaining,
      previous_document_number: document.previous_document_number || "",
      date_of_birth_on_doc: document.date_of_birth_on_doc || "",
      gender_on_doc: document.gender_on_doc || "",
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
              <Plane className="h-12 w-12 mx-auto mb-2 opacity-50" />
              No travel documents on file
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {documents.filter(d => d.status !== "archived").map((doc) => (
              <Card key={doc.id}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Plane className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {getDocumentTypeLabel(doc.document_type)}
                          {doc.document_subtype && <span className="text-muted-foreground ml-1">({getSubtypeLabel(doc.document_type, doc.document_subtype)})</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires: {formatDateForDisplay(doc.expiry_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {doc.is_biometric && <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Biometric</Badge>}
                      {doc.is_primary && <Badge variant="outline">Primary</Badge>}
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

  // HR View
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Travel Documents</h3>
        {canAdd && (
          <Button onClick={openNewDialog} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Travel Document
          </Button>
        )}
      </div>

      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDocument ? "Edit Travel Document" : "Add Travel Document"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              
              {/* Section 1: Core Identity */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Document Identity</h4>
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="document_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
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
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="document_subtype"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Sub-Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sub-type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(DOCUMENT_SUBTYPES[watchDocumentType] || DOCUMENT_SUBTYPES.other).map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>E.g., Diplomatic, Official, Regular</FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="document_number"
                    rules={{ required: "Document number is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Number *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., AB1234567" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="previous_document_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous Document Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="If renewed" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

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
                            valueType="name"
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
                          <Input {...field} placeholder="e.g., Ministry of Foreign Affairs" />
                        </FormControl>
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
                            valueType="name"
                            placeholder="Select nationality"
                          />
                        </FormControl>
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
                          <Input {...field} placeholder="e.g., Kingston, Jamaica" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Document Features */}
                <div className="flex flex-wrap gap-6 pt-2">
                  <FormField
                    control={form.control}
                    name="is_biometric"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0 flex items-center gap-1">
                          <Shield className="h-4 w-4" /> Biometric / ePassport
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_machine_readable"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Machine Readable (MRZ)</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_primary"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Primary Document</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 2: Validity */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Validity & Status</h4>
                <Separator />
                
                <div className="grid grid-cols-3 gap-4">
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
                  <FormField
                    control={form.control}
                    name="expiry_alert_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alert Before (Days)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value) || 90)}
                          />
                        </FormControl>
                        <FormDescription>Days before expiry to trigger warning</FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

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
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                            <SelectItem value="stolen">Stolen</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visa_pages_remaining"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visa Pages Remaining</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            value={field.value ?? ""}
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 3: Biographical on Document */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Biographical Data (As Printed)</h4>
                <Separator />
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="machine_readable_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (As Printed)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="SURNAME, GIVEN NAMES" />
                        </FormControl>
                        <FormDescription>Exactly as on document</FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date_of_birth_on_doc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth (On Document)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender_on_doc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender (On Document)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GENDER_OPTIONS.map((g) => (
                              <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 4: MRZ Data */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Machine Readable Zone (MRZ)</h4>
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mrz_line_1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MRZ Line 1</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<" className="font-mono text-xs" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mrz_line_2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MRZ Line 2</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="L898902C36UTO7408122F1204159ZE184226B<<<<<10" className="font-mono text-xs" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="mrz_surname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MRZ Surname</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ERIKSSON" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mrz_given_names"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MRZ Given Names</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ANNA MARIA" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mrz_check_digit_valid"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 pt-8">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Check Digits Valid</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 5: Verification */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Verification</h4>
                <Separator />
                
                {editingDocument?.verified_at ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Document Verified</span>
                    </div>
                    <div className="text-sm text-green-600 space-y-1">
                      <p>Verified on: {formatDateForDisplay(editingDocument.verified_at)}</p>
                      <p>Verified by: {verifierName[editingDocument.verified_by || ""] || "Unknown"}</p>
                      <p>Method: {VERIFICATION_METHODS.find(m => m.value === editingDocument.verification_method)?.label || editingDocument.verification_method}</p>
                      {editingDocument.verification_notes && <p>Notes: {editingDocument.verification_notes}</p>}
                    </div>
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
                                <SelectValue placeholder="Select method to verify" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {VERIFICATION_METHODS.map((m) => (
                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Select to mark as verified on save</FormDescription>
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
                            <Input {...field} placeholder="Any observations" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Section 6: Evidence */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Evidence & Notes</h4>
                <Separator />
                
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

                <div className="space-y-2">
                  <FormLabel>Document Scan</FormLabel>
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
                  {editingDocument?.document_name && !selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Current: {editingDocument.document_name}
                    </p>
                  )}
                </div>
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
                  {uploading ? "Saving..." : editingDocument ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Plane className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No travel documents on file
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className={doc.status === "archived" ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base">
                      {getDocumentTypeLabel(doc.document_type)}
                      {doc.document_subtype && (
                        <span className="text-muted-foreground font-normal ml-1">
                          ({getSubtypeLabel(doc.document_type, doc.document_subtype)})
                        </span>
                      )}
                    </CardTitle>
                    {doc.is_biometric && <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Biometric</Badge>}
                    {doc.is_primary && <Badge variant="outline">Primary</Badge>}
                    {getStatusBadge(doc)}
                    {getVerificationBadge(doc)}
                  </div>
                  {canEdit && doc.status !== "archived" && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(doc)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleArchive(doc)}>
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Document #:</span>
                    <p className="font-medium">{doc.document_number}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issuing Country:</span>
                    <p className="font-medium">{doc.issuing_country}</p>
                  </div>
                  {doc.issuing_authority && (
                    <div>
                      <span className="text-muted-foreground">Issuing Authority:</span>
                      <p className="font-medium">{doc.issuing_authority}</p>
                    </div>
                  )}
                  {doc.nationality && (
                    <div>
                      <span className="text-muted-foreground">Nationality:</span>
                      <p className="font-medium">{doc.nationality}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Issue Date:</span>
                    <p className="font-medium">{formatDateForDisplay(doc.issue_date)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expiry Date:</span>
                    <p className="font-medium">{formatDateForDisplay(doc.expiry_date)}</p>
                  </div>
                  {doc.issue_place && (
                    <div>
                      <span className="text-muted-foreground">Place of Issue:</span>
                      <p className="font-medium">{doc.issue_place}</p>
                    </div>
                  )}
                  {doc.visa_pages_remaining !== null && (
                    <div>
                      <span className="text-muted-foreground">Visa Pages:</span>
                      <p className="font-medium">{doc.visa_pages_remaining} remaining</p>
                    </div>
                  )}
                </div>
                
                {/* MRZ Preview */}
                {(doc.mrz_line_1 || doc.mrz_line_2) && (
                  <div className="mt-3 p-2 bg-muted rounded font-mono text-xs">
                    {doc.mrz_line_1 && <div>{doc.mrz_line_1}</div>}
                    {doc.mrz_line_2 && <div>{doc.mrz_line_2}</div>}
                  </div>
                )}
                
                {doc.notes && (
                  <p className="mt-2 text-sm text-muted-foreground">{doc.notes}</p>
                )}
                
                {doc.document_url && (
                  <div className="mt-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {doc.document_name || "View Document"}
                    </a>
                  </div>
                )}

                {/* Verification Info */}
                {doc.verified_at && (
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    Verified {formatDateForDisplay(doc.verified_at)} by {verifierName[doc.verified_by || ""] || "Unknown"} 
                    via {VERIFICATION_METHODS.find(m => m.value === doc.verification_method)?.label || doc.verification_method}
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
