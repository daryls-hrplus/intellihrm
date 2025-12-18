import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  File,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ReferenceDoc {
  id: string;
  template_id: string | null;
  document_name: string;
  storage_path: string | null;
  document_type: string;
  extracted_content: string | null;
  extracted_styles: Record<string, unknown>;
  file_size: number | null;
  created_at: string;
}

interface TemplateReferenceUploaderProps {
  templateId?: string;
  onDocumentsChange?: (docs: ReferenceDoc[]) => void;
}

export function TemplateReferenceUploader({
  templateId,
  onDocumentsChange
}: TemplateReferenceUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch reference documents
  const { data: referenceDocs = [], isLoading } = useQuery({
    queryKey: ['enablement-reference-docs', templateId],
    queryFn: async () => {
      const query = supabase
        .from('enablement_template_reference_docs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (templateId) {
        query.eq('template_id', templateId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ReferenceDoc[];
    }
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      setIsUploading(true);
      setUploadProgress(0);

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('enablement-reference-docs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      setUploadProgress(50);

      // Get document type
      let docType = 'txt';
      if (fileExt === 'pdf') docType = 'pdf';
      else if (fileExt === 'docx' || fileExt === 'doc') docType = 'docx';

      // Create database record
      const { data, error: dbError } = await supabase
        .from('enablement_template_reference_docs')
        .insert({
          template_id: templateId || null,
          document_name: file.name,
          storage_path: fileName,
          document_type: docType,
          file_size: file.size,
          created_by: user.id
        })
        .select()
        .single();

      if (dbError) throw dbError;
      setUploadProgress(100);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['enablement-reference-docs'] });
      toast.success("Document uploaded successfully");
      // Trigger AI analysis
      analyzeDocument(data.id);
    },
    onError: (error) => {
      toast.error("Upload failed: " + error.message);
    },
    onSettled: () => {
      setIsUploading(false);
      setUploadProgress(0);
    }
  });

  // Analyze document mutation
  const analyzeMutation = useMutation({
    mutationFn: async (docId: string) => {
      setIsAnalyzing(true);
      
      // Call AI to analyze document
      const { data, error } = await supabase.functions.invoke('enablement-ai-assistant', {
        body: {
          action: 'analyze_reference_document',
          documentId: docId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, docId) => {
      queryClient.invalidateQueries({ queryKey: ['enablement-reference-docs'] });
      toast.success("Document analyzed - patterns extracted");
    },
    onError: (error) => {
      toast.error("Analysis failed: " + error.message);
    },
    onSettled: () => {
      setIsAnalyzing(false);
    }
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (doc: ReferenceDoc) => {
      // Delete from storage
      if (doc.storage_path) {
        await supabase.storage
          .from('enablement-reference-docs')
          .remove([doc.storage_path]);
      }

      // Delete from database
      const { error } = await supabase
        .from('enablement_template_reference_docs')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enablement-reference-docs'] });
      toast.success("Document deleted");
    },
    onError: (error) => {
      toast.error("Delete failed: " + error.message);
    }
  });

  const analyzeDocument = (docId: string) => {
    analyzeMutation.mutate(docId);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndUpload(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type) && !file.name.endsWith('.txt')) {
      toast.error("Invalid file type. Please upload PDF, DOCX, or TXT files.");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    uploadMutation.mutate(file);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
      case 'docx': return <FileText className="h-5 w-5 text-blue-500" />;
      default: return <File className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading document...</p>
            <Progress value={uploadProgress} className="w-48 mx-auto" />
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">
              Drag & drop your reference documents here
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Supports PDF, DOCX, and TXT files up to 10MB
            </p>
            <label>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileSelect}
              />
              <Button variant="outline" size="sm" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </>
        )}
      </div>

      {/* AI Analysis Info */}
      {isAnalyzing && (
        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <div>
            <p className="text-sm font-medium">AI is analyzing your document...</p>
            <p className="text-xs text-muted-foreground">
              Extracting formatting patterns, writing style, and terminology
            </p>
          </div>
        </div>
      )}

      {/* Uploaded Documents */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Uploaded Documents</h4>
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : referenceDocs.length === 0 ? (
          <div className="p-6 text-center border rounded-lg">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No reference documents uploaded yet
            </p>
            <p className="text-xs text-muted-foreground">
              Upload existing documentation to help AI match your style
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {referenceDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(doc.document_type)}
                    <div>
                      <p className="text-sm font-medium">{doc.document_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file_size)} • {doc.document_type.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.extracted_styles && Object.keys(doc.extracted_styles).length > 0 ? (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Analyzed
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => analyzeDocument(doc.id)}
                        disabled={isAnalyzing}
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Analyze
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(doc)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Extracted Patterns Preview */}
      {referenceDocs.some(d => d.extracted_styles && Object.keys(d.extracted_styles).length > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Extracted Patterns Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-2">
              AI has extracted the following patterns from your documents:
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Numbered headers</Badge>
              <Badge variant="secondary">Formal tone</Badge>
              <Badge variant="secondary">Step-by-step format</Badge>
              <Badge variant="secondary">Info callouts</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
