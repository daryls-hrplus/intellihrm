import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, FileText, Download, Upload, AlertCircle, Filter, ExternalLink, Eye, Pencil, Archive, Clock, CheckCircle, XCircle } from "lucide-react";
import { format, isBefore, addDays, differenceInDays } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

interface DocumentCategory {
  code: string;
  name: string;
  description: string | null;
}

interface DocumentType {
  code: string;
  name: string;
  category_code: string;
  managed_by_module: string | null;
}

interface Document {
  id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  expiry_date: string | null;
  issue_date: string | null;
  issuing_authority: string | null;
  notes: string | null;
  created_at: string;
  category: string | null;
  status: string | null;
  source_module: string | null;
  is_reference: boolean | null;
  source_record_id: string | null;
  uploaded_by: string | null;
}

interface DocumentFormData {
  category: string;
  document_type: string;
  document_name: string;
  issue_date: string;
  expiry_date: string;
  issuing_authority: string;
  notes: string;
}

interface EmployeeDocumentsTabProps {
  employeeId: string;
}

export function EmployeeDocumentsTab({ employeeId }: EmployeeDocumentsTabProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  
  // Qualification verification statuses
  const [qualificationStatuses, setQualificationStatuses] = useState<Record<string, string>>({});
  
  // Lookup data
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [expiryFilter, setExpiryFilter] = useState<string>("all");

  const form = useForm<DocumentFormData>({
    defaultValues: {
      category: "",
      document_type: "",
      document_name: "",
      issue_date: "",
      expiry_date: "",
      issuing_authority: "",
      notes: "",
    },
  });

  const selectedCategory = form.watch("category");
  const selectedDocType = form.watch("document_type");

  // Filter document types by selected category
  const filteredDocTypes = useMemo(() => {
    if (!selectedCategory) return documentTypes;
    return documentTypes.filter(dt => dt.category_code === selectedCategory);
  }, [selectedCategory, documentTypes]);

  // Check if selected document type is managed by another module
  const managedByModule = useMemo(() => {
    const docType = documentTypes.find(dt => dt.code === selectedDocType);
    return docType?.managed_by_module || null;
  }, [selectedDocType, documentTypes]);

  const fetchLookupData = async () => {
    const [catRes, typesRes] = await Promise.all([
      supabase.from("document_categories").select("code, name, description").eq("is_active", true).order("display_order"),
      supabase.from("document_types").select("code, name, category_code, managed_by_module").eq("is_active", true).order("display_order"),
    ]);
    
    if (catRes.data) setCategories(catRes.data);
    if (typesRes.data) setDocumentTypes(typesRes.data);
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("employee_documents")
      .select("*")
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load documents");
    } else {
      setDocuments(data || []);
      
      // Fetch verification statuses for qualification documents
      const qualificationDocIds = (data || [])
        .filter(doc => doc.source_module === 'qualifications' && doc.source_record_id)
        .map(doc => doc.source_record_id);
      
      if (qualificationDocIds.length > 0) {
        const { data: qualifications } = await supabase
          .from("employee_qualifications")
          .select("id, verification_status")
          .in("id", qualificationDocIds);
        
        if (qualifications) {
          const statusMap: Record<string, string> = {};
          qualifications.forEach(q => {
            statusMap[q.id] = q.verification_status || 'pending';
          });
          setQualificationStatuses(statusMap);
        }
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLookupData();
    fetchDocuments();
  }, [employeeId]);

  // Apply filters
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (categoryFilter !== "all" && doc.category !== categoryFilter) return false;
      if (statusFilter !== "all" && doc.status !== statusFilter) return false;
      if (sourceFilter !== "all" && doc.source_module !== sourceFilter) return false;
      
      if (expiryFilter !== "all" && doc.expiry_date) {
        const expiryDate = new Date(doc.expiry_date);
        const today = new Date();
        const daysUntilExpiry = differenceInDays(expiryDate, today);
        
        switch (expiryFilter) {
          case "expired":
            if (daysUntilExpiry >= 0) return false;
            break;
          case "30days":
            if (daysUntilExpiry < 0 || daysUntilExpiry > 30) return false;
            break;
          case "60days":
            if (daysUntilExpiry < 0 || daysUntilExpiry > 60) return false;
            break;
          case "90days":
            if (daysUntilExpiry < 0 || daysUntilExpiry > 90) return false;
            break;
        }
      } else if (expiryFilter !== "all" && !doc.expiry_date) {
        return false;
      }
      
      return true;
    });
  }, [documents, categoryFilter, statusFilter, sourceFilter, expiryFilter]);

  // Get unique source modules for filter
  const sourceModules = useMemo(() => {
    const sources = new Set(documents.map(d => d.source_module).filter(Boolean));
    return Array.from(sources);
  }, [documents]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      if (!form.getValues("document_name")) {
        form.setValue("document_name", file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (data: DocumentFormData) => {
    if (!editingDocument && !selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploading(true);
    try {
      let fileUrl = editingDocument?.file_url || "";
      let fileSize = editingDocument?.file_size || null;
      let mimeType = editingDocument?.mime_type || null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `${employeeId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("employee-documents")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("employee-documents")
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        fileSize = selectedFile.size;
        mimeType = selectedFile.type;
      }

      // Determine status based on expiry date
      let status = "active";
      if (data.expiry_date) {
        const expiry = new Date(data.expiry_date);
        if (isBefore(expiry, new Date())) {
          status = "expired";
        }
      }

      const documentData = {
        document_type: data.document_type,
        document_name: data.document_name,
        file_url: fileUrl,
        file_size: fileSize,
        mime_type: mimeType,
        category: data.category,
        issue_date: data.issue_date || null,
        expiry_date: data.expiry_date || null,
        issuing_authority: data.issuing_authority || null,
        notes: data.notes || null,
        status,
        source_module: "Documents",
        is_reference: false,
      };

      if (editingDocument) {
        const { error: updateError } = await supabase
          .from("employee_documents")
          .update(documentData)
          .eq("id", editingDocument.id);

        if (updateError) throw updateError;
        toast.success("Document updated");
      } else {
        const { error: insertError } = await supabase.from("employee_documents").insert({
          employee_id: employeeId,
          uploaded_by: user?.id,
          ...documentData,
        });

        if (insertError) throw insertError;
        toast.success("Document uploaded");
      }

      setDialogOpen(false);
      setSelectedFile(null);
      setEditingDocument(null);
      form.reset();
      fetchDocuments();
    } catch (error) {
      toast.error("Failed to save document");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (doc: Document) => {
    if (doc.is_reference) {
      toast.error("This document is managed by the " + doc.source_module + " module");
      return;
    }
    setEditingDocument(doc);
    form.reset({
      category: doc.category || "",
      document_type: doc.document_type,
      document_name: doc.document_name,
      issue_date: doc.issue_date || "",
      expiry_date: doc.expiry_date || "",
      issuing_authority: doc.issuing_authority || "",
      notes: doc.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (doc: Document) => {
    if (doc.is_reference) {
      toast.error("This document is managed by the " + doc.source_module + " module. Please delete it there.");
      return;
    }
    
    try {
      const path = doc.file_url.split("/employee-documents/")[1];
      if (path) {
        await supabase.storage.from("employee-documents").remove([path]);
      }

      const { error } = await supabase.from("employee_documents").delete().eq("id", doc.id);
      if (error) throw error;

      toast.success("Document deleted");
      fetchDocuments();
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  const handleArchive = async (doc: Document) => {
    if (doc.is_reference) {
      toast.error("This document is managed by the " + doc.source_module + " module");
      return;
    }
    
    const { error } = await supabase
      .from("employee_documents")
      .update({ status: "archived" })
      .eq("id", doc.id);
    
    if (error) {
      toast.error("Failed to archive document");
    } else {
      toast.success("Document archived");
      fetchDocuments();
    }
  };

  const openNewDialog = () => {
    setEditingDocument(null);
    setSelectedFile(null);
    form.reset({
      category: "",
      document_type: "",
      document_name: "",
      issue_date: "",
      expiry_date: "",
      issuing_authority: "",
      notes: "",
    });
    setDialogOpen(true);
  };

  const getStatusBadge = (doc: Document) => {
    const status = doc.status || "active";
    if (status === "expired" || (doc.expiry_date && isBefore(new Date(doc.expiry_date), new Date()))) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (status === "archived") {
      return <Badge variant="secondary">Archived</Badge>;
    }
    if (doc.expiry_date) {
      const daysUntil = differenceInDays(new Date(doc.expiry_date), new Date());
      if (daysUntil <= 30) {
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Expiring Soon</Badge>;
      }
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getVerificationBadge = (doc: Document) => {
    if (doc.source_module !== 'qualifications' || !doc.source_record_id) {
      return null;
    }
    const status = qualificationStatuses[doc.source_record_id] || 'pending';
    switch (status) {
      case 'verified':
        return <Badge className="bg-success/10 text-success"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="border-warning text-warning"><Clock className="h-3 w-3 mr-1" />Pending Verification</Badge>;
    }
  };

  const getCategoryName = (code: string | null) => {
    if (!code) return "-";
    const cat = categories.find(c => c.code === code);
    return cat?.name || code;
  };

  const getDocTypeName = (code: string) => {
    const dt = documentTypes.find(d => d.code === code);
    return dt?.name || code.replace(/_/g, " ");
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "-";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Documents</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingDocument ? "Edit Document" : "Upload Document"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* Warning for managed document types */}
                {managedByModule && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This document type is managed under the <strong>{managedByModule}</strong> screen. 
                      Updates made there will reflect here automatically.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Row 1: Category, Document Type */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    rules={{ required: "Category is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("document_type", "");
                        }} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.code} value={cat.code}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="document_type"
                    rules={{ required: "Document type is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCategory}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredDocTypes.map((dt) => (
                              <SelectItem key={dt.code} value={dt.code}>
                                {dt.name}
                                {dt.managed_by_module && " *"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 2: Issue Date, Expiry Date, Issuing Authority */}
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
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
                          <Input {...field} placeholder="e.g., Ministry of..." />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 3: File Upload */}
                <div className="space-y-2">
                  <FormLabel>Upload File {!editingDocument && "*"}</FormLabel>
                  <div className="border-2 border-dashed rounded-lg p-4">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center gap-2">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      {selectedFile ? (
                        <span className="text-sm">{selectedFile.name}</span>
                      ) : editingDocument ? (
                        <span className="text-sm text-muted-foreground">Click to replace file (PDF, DOC, JPG, PNG - max 10MB)</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Click to upload (PDF, DOC, JPG, PNG - max 10MB)</span>
                      )}
                    </label>
                  </div>
                  {editingDocument && !selectedFile && (
                    <p className="text-xs text-muted-foreground">Current file: {editingDocument.document_name}</p>
                  )}
                </div>

                {/* Document Name */}
                <FormField
                  control={form.control}
                  name="document_name"
                  rules={{ required: "Document name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Row 4: Notes */}
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
                  <Button type="submit" disabled={uploading || (!editingDocument && !selectedFile) || !!managedByModule}>
                    {uploading ? "Saving..." : editingDocument ? "Update" : "Upload"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.code} value={cat.code}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sourceModules.map((src) => (
                  <SelectItem key={src} value={src!}>{src}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={expiryFilter} onValueChange={setExpiryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Expiry Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="30days">Expiring in 30 days</SelectItem>
                <SelectItem value="60days">Expiring in 60 days</SelectItem>
                <SelectItem value="90days">Expiring in 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No documents found
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Issuing Authority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id} className={doc.is_reference ? "bg-muted/30" : ""}>
                  <TableCell className="font-medium">{getCategoryName(doc.category)}</TableCell>
                  <TableCell>{getDocTypeName(doc.document_type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {doc.document_name}
                    </div>
                  </TableCell>
                  <TableCell>{doc.issue_date ? format(new Date(doc.issue_date), "MMM d, yyyy") : "-"}</TableCell>
                  <TableCell>{doc.expiry_date ? format(new Date(doc.expiry_date), "MMM d, yyyy") : "-"}</TableCell>
                  <TableCell>{doc.issuing_authority || "-"}</TableCell>
                  <TableCell>{getStatusBadge(doc)}</TableCell>
                  <TableCell>{getVerificationBadge(doc) || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={doc.is_reference ? "secondary" : "outline"}>
                      {doc.source_module || "Documents"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" title="View/Download">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      {!doc.is_reference && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(doc)} title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleArchive(doc)} title="Archive">
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)} title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {doc.is_reference && doc.source_record_id && (
                        <Button variant="ghost" size="icon" title={`Managed by ${doc.source_module}`}>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
