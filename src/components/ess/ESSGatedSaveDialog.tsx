import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clock, FileUp, X, Upload, Info, AlertTriangle, Loader2 } from "lucide-react";
import { ApprovalMode } from "@/hooks/useESSApprovalPolicy";

interface ESSGatedSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  approvalMode: ApprovalMode;
  requiresDocumentation: boolean;
  isDocumentationOptional: boolean;
  onSubmit: (notes: string, documentUrls: string[]) => Promise<void>;
  isSubmitting: boolean;
  employeeId: string;
  children?: React.ReactNode;
}

export function ESSGatedSaveDialog({
  open,
  onOpenChange,
  title = "Submit Change",
  description = "Review your changes before submitting",
  approvalMode,
  requiresDocumentation,
  isDocumentationOptional,
  onSubmit,
  isSubmitting,
  employeeId,
  children,
}: ESSGatedSaveDialogProps) {
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((file) => {
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File too large: ${file.name} (max 10MB)`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (files.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const filePath = `${employeeId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("ess-change-documents")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Failed to upload ${file.name}`);
      }

      const { data: urlData } = supabase.storage
        .from("ess-change-documents")
        .getPublicUrl(filePath);

      uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    try {
      setIsUploading(true);

      let documentUrls: string[] = [];
      if (files.length > 0) {
        documentUrls = await uploadFiles();
      }

      await onSubmit(notes, documentUrls);

      // Reset state on success
      setNotes("");
      setFiles([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const isSubmitDisabled =
    isSubmitting || isUploading || (requiresDocumentation && !isDocumentationOptional && files.length === 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Policy Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {approvalMode === "hr_review"
                ? "This change requires HR approval before it takes effect."
                : "This change will go through a workflow approval process."}
            </AlertDescription>
          </Alert>

          {/* Render the form/content preview */}
          {children}

          {/* Document Upload - Show for HR Review or Workflow */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Supporting Documents</Label>
              {requiresDocumentation && !isDocumentationOptional ? (
                <Badge variant="outline" className="text-xs text-destructive border-destructive/50">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Required
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Optional
                </Badge>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
              onChange={handleFileSelect}
            />

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>

            {files.length > 0 && (
              <div className="space-y-2 mt-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-muted rounded-md"
                  >
                    <FileUp className="h-4 w-4" />
                    <span className="text-sm flex-1 truncate">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional context for the reviewer..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
            {(isSubmitting || isUploading) && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Submit for Approval
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Pending badge component for reuse
export function PendingApprovalBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={`bg-yellow-50 text-yellow-700 border-yellow-200 ${className || ""}`}
    >
      <Clock className="h-3 w-3 mr-1" />
      Pending Approval
    </Badge>
  );
}

// Overlay for items with pending requests
export function PendingApprovalOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center rounded-md">
        <PendingApprovalBadge />
      </div>
    </div>
  );
}
