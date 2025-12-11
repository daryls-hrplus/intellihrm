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
import { Plus, Trash2, FileText, Download, Upload, AlertCircle } from "lucide-react";
import { format, isBefore } from "date-fns";

interface Document {
  id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  expiry_date: string | null;
  notes: string | null;
  created_at: string;
}

interface DocumentFormData {
  document_type: string;
  document_name: string;
  expiry_date: string;
  notes: string;
}

interface EmployeeDocumentsTabProps {
  employeeId: string;
}

export function EmployeeDocumentsTab({ employeeId }: EmployeeDocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<DocumentFormData>({
    defaultValues: {
      document_type: "id_card",
      document_name: "",
      expiry_date: "",
      notes: "",
    },
  });

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
      if (!form.getValues("document_name")) {
        form.setValue("document_name", file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (data: DocumentFormData) => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const filePath = `${employeeId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("employee-documents")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("employee-documents")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("employee_documents").insert({
        employee_id: employeeId,
        document_type: data.document_type,
        document_name: data.document_name,
        file_url: urlData.publicUrl,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
        expiry_date: data.expiry_date || null,
        notes: data.notes || null,
      });

      if (insertError) throw insertError;

      toast.success("Document uploaded");
      setDialogOpen(false);
      setSelectedFile(null);
      form.reset();
      fetchDocuments();
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: Document) => {
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

  const openNewDialog = () => {
    setSelectedFile(null);
    form.reset({
      document_type: "id_card",
      document_name: "",
      expiry_date: "",
      notes: "",
    });
    setDialogOpen(true);
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return isBefore(new Date(date), new Date());
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    {selectedFile ? (
                      <p className="text-sm">{selectedFile.name}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Click to upload (PDF, DOC, JPG, PNG - max 10MB)
                      </p>
                    )}
                  </label>
                </div>

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
                            <SelectItem value="id_card">ID Card</SelectItem>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="visa">Visa</SelectItem>
                            <SelectItem value="work_permit">Work Permit</SelectItem>
                            <SelectItem value="driving_license">Driving License</SelectItem>
                            <SelectItem value="education">Education Certificate</SelectItem>
                            <SelectItem value="contract">Employment Contract</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
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

                <FormField
                  control={form.control}
                  name="document_name"
                  rules={{ required: "Document name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
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
                  <Button type="submit" disabled={uploading || !selectedFile}>
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No documents on file
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">{doc.document_name}</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {doc.document_type.replace("_", " ")}
                    </Badge>
                    {doc.expiry_date && isExpired(doc.expiry_date) && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Expired
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <div>Size: {formatFileSize(doc.file_size)}</div>
                  <div>Uploaded: {format(new Date(doc.created_at), "MMM d, yyyy")}</div>
                  {doc.expiry_date && (
                    <div>Expires: {format(new Date(doc.expiry_date), "MMM d, yyyy")}</div>
                  )}
                </div>
                {doc.notes && <p className="text-sm mt-2">{doc.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
