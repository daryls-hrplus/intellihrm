import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useESSChangeRequest, ESSRequestType, ChangeRequestData } from "@/hooks/useESSChangeRequest";
import { useApprovalPolicyLookup } from "@/hooks/useESSApprovalPolicy";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clock, FileUp, X, Upload, Info, AlertTriangle, Loader2 } from "lucide-react";
import { ESS_SUPPORTING_DOCUMENTS_BUCKET } from "@/config/storageBuckets";

interface ESSChangeRequestWrapperProps {
  requestType: ESSRequestType;
  entityId: string | null;
  entityTable: string;
  currentValues: Record<string, any> | null;
  newValues: Record<string, any>;
  changeAction: "create" | "update" | "delete";
  onDirectSave: () => Promise<void>;
  onSuccess?: () => void;
  children: React.ReactNode;
  triggerButton?: React.ReactNode;
  dialogTitle?: string;
  dialogDescription?: string;
}

export function ESSChangeRequestWrapper({
  requestType,
  entityId,
  entityTable,
  currentValues,
  newValues,
  changeAction,
  onDirectSave,
  onSuccess,
  children,
  triggerButton,
  dialogTitle = "Submit Change",
  dialogDescription = "Review your changes before submitting",
}: ESSChangeRequestWrapperProps) {
  const { profile } = useAuth();
  const employeeId = profile?.id || "";
  
  const { canDirectEdit, submitChangeRequest, hasPendingRequest, isSubmitting } = useESSChangeRequest(employeeId);
  const { approvalMode, requiresDocumentation, notificationOnly } = useApprovalPolicyLookup(requestType);
  
  const [showDialog, setShowDialog] = useState(false);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPending = hasPendingRequest(entityId, entityTable);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((file) => {
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
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
        .from(ESS_SUPPORTING_DOCUMENTS_BUCKET)
        .upload(filePath, file);
      
      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error(uploadError.message || `Failed to upload ${file.name}`);
        throw new Error(uploadError.message || `Failed to upload ${file.name}`);
      }
      
      const { data: urlData } = supabase.storage
        .from(ESS_SUPPORTING_DOCUMENTS_BUCKET)
        .getPublicUrl(filePath);
      
      uploadedUrls.push(urlData.publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    try {
      // If user can directly edit OR policy is auto-approve, save directly
      if (canDirectEdit || approvalMode === "auto_approve") {
        await onDirectSave();
        
        // If notification only, still create a record for HR visibility
        if (notificationOnly && !canDirectEdit) {
          await submitChangeRequest.mutateAsync({
            request_type: requestType,
            entity_id: entityId,
            entity_table: entityTable,
            change_action: changeAction,
            current_values: currentValues,
            new_values: newValues,
          } as ChangeRequestData);
        }
        
        onSuccess?.();
        setShowDialog(false);
        return;
      }

      // Otherwise, submit change request
      setIsUploading(true);
      
      let documentUrls: string[] = [];
      if (files.length > 0) {
        documentUrls = await uploadFiles();
      }

      await submitChangeRequest.mutateAsync({
        request_type: requestType,
        entity_id: entityId,
        entity_table: entityTable,
        change_action: changeAction,
        current_values: currentValues,
        new_values: { ...newValues, _notes: notes, _document_urls: documentUrls },
      } as ChangeRequestData);

      setShowDialog(false);
      setNotes("");
      setFiles([]);
      onSuccess?.();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error?.message || "Failed to submit for approval");
    } finally {
      setIsUploading(false);
    }
  };

  // If there's a pending request, show badge and disable actions
  if (isPending) {
    return (
      <div className="relative">
        {children}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center rounded-md">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending Approval
          </Badge>
        </div>
      </div>
    );
  }

  // If user can directly edit or auto-approve, just render children with direct action
  if (canDirectEdit || approvalMode === "auto_approve") {
    return <>{children}</>;
  }

  // For HR review or workflow mode, wrap in dialog
  return (
    <>
      <div onClick={() => setShowDialog(true)} className="cursor-pointer">
        {triggerButton || children}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
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

            {/* Render the form/content */}
            {children}

            {/* Document Upload - Show for HR Review or Workflow modes */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Supporting Documents</Label>
                {requiresDocumentation ? (
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
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <FileUp className="h-4 w-4" />
                      <span className="text-sm flex-1 truncate">{file.name}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}>
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
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || isUploading || (requiresDocumentation && files.length === 0)}
            >
              {(isSubmitting || isUploading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
