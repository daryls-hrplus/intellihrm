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
import { Plus, Pencil, Archive, Plane, FileText, X } from "lucide-react";
import { isBefore, addDays } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { CountrySelect } from "@/components/ui/country-select";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { useAuditLog } from "@/hooks/useAuditLog";

interface TravelDocument {
  id: string;
  employee_id: string;
  document_type: string;
  document_number: string;
  issuing_country: string;
  nationality: string | null;
  issue_date: string;
  expiry_date: string;
  issue_place: string | null;
  status: string;
  is_primary: boolean;
  document_url: string | null;
  document_name: string | null;
  notes: string | null;
}

interface TravelDocumentFormData {
  document_type: string;
  document_number: string;
  issuing_country: string;
  nationality: string;
  issue_date: string;
  expiry_date: string;
  issue_place: string;
  status: string;
  is_primary: boolean;
  notes: string;
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

export function EmployeeTravelDocumentsTab({ employeeId, viewType = "hr" }: EmployeeTravelDocumentsTabProps) {
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<TravelDocument | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { hasTabAccess } = useGranularPermissions();
  const { logAction } = useAuditLog();

  const canEdit = viewType === "hr" && hasTabAccess("workforce", "immigration", "edit");
  const canAdd = viewType === "hr" && hasTabAccess("workforce", "immigration", "create");

  const form = useForm<TravelDocumentFormData>({
    defaultValues: {
      document_type: "passport",
      document_number: "",
      issuing_country: "",
      nationality: "",
      issue_date: "",
      expiry_date: "",
      issue_place: "",
      status: "active",
      is_primary: false,
      notes: "",
    },
  });

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
      setDocuments((data || []) as unknown as TravelDocument[]);
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

      const payload = {
        document_type: data.document_type,
        document_number: data.document_number,
        issuing_country: data.issuing_country,
        nationality: data.nationality || null,
        issue_date: data.issue_date,
        expiry_date: data.expiry_date,
        issue_place: data.issue_place || null,
        status: data.status,
        is_primary: data.is_primary,
        notes: data.notes || null,
        document_url: documentUrl,
        document_name: documentName,
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
      document_number: document.document_number,
      issuing_country: document.issuing_country,
      nationality: document.nationality || "",
      issue_date: document.issue_date,
      expiry_date: document.expiry_date,
      issue_place: document.issue_place || "",
      status: document.status,
      is_primary: document.is_primary,
      notes: document.notes || "",
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
  const isExpiringSoon = (date: string) => {
    const expiryDate = new Date(date);
    const warningDate = addDays(new Date(), 90);
    return isBefore(expiryDate, warningDate) && !isExpired(date);
  };

  const getStatusBadge = (document: TravelDocument) => {
    if (document.status === "archived") {
      return <Badge variant="secondary">Archived</Badge>;
    }
    if (isExpired(document.expiry_date)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (isExpiringSoon(document.expiry_date)) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Expiring Soon</Badge>;
    }
    if (document.status === "active") {
      return <Badge variant="default">Active</Badge>;
    }
    return <Badge variant="secondary" className="capitalize">{document.status}</Badge>;
  };

  const getDocumentTypeLabel = (value: string) => {
    return DOCUMENT_TYPES.find(t => t.value === value)?.label || value;
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
                        <p className="font-medium">{getDocumentTypeLabel(doc.document_type)}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires: {formatDateForDisplay(doc.expiry_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Travel Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingDocument ? "Edit Travel Document" : "Add Travel Document"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="document_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Type</FormLabel>
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
                      name="document_number"
                      rules={{ required: "Document number is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
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
                  </div>

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
                      rules={{ required: "Expiry date is required" }}
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
                      name="is_primary"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 pt-8">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4"
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Primary Document</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

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
        )}
      </div>

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
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">
                      {getDocumentTypeLabel(doc.document_type)}
                    </CardTitle>
                    {doc.is_primary && <Badge variant="outline">Primary</Badge>}
                    {getStatusBadge(doc)}
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
                </div>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
