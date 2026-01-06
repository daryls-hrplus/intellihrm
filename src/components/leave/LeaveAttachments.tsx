import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Upload, Trash2, FileText, Image, File, Download, Loader2 } from "lucide-react";
import { useLeaveAttachments, LeaveRequestAttachment } from "@/hooks/useLeaveEnhancements";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface LeaveAttachmentsProps {
  leaveRequestId: string;
  readonly?: boolean;
}

const ATTACHMENT_TYPES: { value: LeaveRequestAttachment['attachment_type']; label: string }[] = [
  { value: 'medical_certificate', label: 'Medical Certificate' },
  { value: 'travel_document', label: 'Travel Document' },
  { value: 'supporting_document', label: 'Supporting Document' },
  { value: 'approval_letter', label: 'Approval Letter' },
  { value: 'other', label: 'Other' },
];

export function LeaveAttachments({ leaveRequestId, readonly = false }: LeaveAttachmentsProps) {
  const { attachments, isLoading, uploadAttachment, deleteAttachment } = useLeaveAttachments(leaveRequestId);
  const [attachmentType, setAttachmentType] = useState<LeaveRequestAttachment['attachment_type']>('supporting_document');
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadAttachment.mutateAsync({
      file,
      attachment_type: attachmentType,
      description: description.trim() || undefined,
    });

    setDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = async (attachment: LeaveRequestAttachment) => {
    const { data, error } = await supabase.storage
      .from('leave-attachments')
      .download(attachment.file_path);
    
    if (error || !data) return;
    
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.file_name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFileIcon = (fileType: string | null) => {
    if (fileType?.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType?.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          Attachments
          {attachments.length > 0 && (
            <Badge variant="secondary" className="ml-auto">{attachments.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        {!readonly && (
          <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select value={attachmentType} onValueChange={(v) => setAttachmentType(v as LeaveRequestAttachment['attachment_type'])}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTACHMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description (optional)</Label>
                <Input 
                  className="h-9"
                  placeholder="Brief description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                onChange={handleFileSelect}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAttachment.isPending}
              >
                {uploadAttachment.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {uploadAttachment.isPending ? "Uploading..." : "Upload File"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Supported: PDF, Word, Images (max 10MB)
            </p>
          </div>
        )}

        {/* Attachments List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No attachments uploaded
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div 
                key={attachment.id}
                className="flex items-center gap-3 p-2 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 h-9 w-9 rounded bg-muted flex items-center justify-center">
                  {getFileIcon(attachment.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {ATTACHMENT_TYPES.find(t => t.value === attachment.attachment_type)?.label || attachment.attachment_type}
                    </Badge>
                    <span>{formatFileSize(attachment.file_size)}</span>
                    <span>•</span>
                    <span>{formatDateForDisplay(attachment.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(attachment)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {!readonly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteAttachment.mutate(attachment.id)}
                      disabled={deleteAttachment.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
