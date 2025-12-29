import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Paperclip, 
  Plus, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { usePerformanceEvidence, EvidenceType, PerformanceEvidence } from "@/hooks/capabilities/usePerformanceEvidence";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface GoalEvidenceAttachmentProps {
  goalId: string;
  employeeId: string;
  goalTitle?: string;
  readOnly?: boolean;
}

const EVIDENCE_TYPES: { value: EvidenceType; label: string }[] = [
  { value: "project", label: "Project" },
  { value: "deliverable", label: "Deliverable" },
  { value: "document", label: "Document" },
  { value: "metric_achievement", label: "Metric Achievement" },
  { value: "customer_feedback", label: "Customer Feedback" },
  { value: "presentation", label: "Presentation" },
  { value: "award", label: "Award" },
  { value: "recognition", label: "Recognition" },
];

const STATUS_ICONS = {
  pending: { icon: Clock, color: "text-yellow-600" },
  validated: { icon: CheckCircle2, color: "text-green-600" },
  rejected: { icon: XCircle, color: "text-destructive" },
  disputed: { icon: Clock, color: "text-orange-600" },
};

export function GoalEvidenceAttachment({
  goalId,
  employeeId,
  goalTitle,
  readOnly = false,
}: GoalEvidenceAttachmentProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    evidence,
    loading,
    fetchEvidence,
    createEvidence,
    uploadAttachment,
    getAttachmentUrl,
  } = usePerformanceEvidence();

  // Form state
  const [formData, setFormData] = useState({
    evidence_type: "deliverable" as EvidenceType,
    title: "",
    description: "",
    external_url: "",
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const handleOpenDialog = async () => {
    setDialogOpen(true);
    await fetchEvidence({ goal_id: goalId, employee_id: employeeId });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSubmitting(true);
    try {
      let attachmentPath: string | undefined;
      let attachmentType: string | undefined;
      let attachmentSize: number | undefined;

      if (attachmentFile) {
        const uploadResult = await uploadAttachment(attachmentFile, employeeId);
        if (uploadResult) {
          attachmentPath = uploadResult.path;
          attachmentType = uploadResult.type;
          attachmentSize = uploadResult.size;
        }
      }

      const result = await createEvidence(employeeId, {
        ...formData,
        goal_id: goalId,
        attachment_path: attachmentPath,
        attachment_type: attachmentType,
        attachment_size_bytes: attachmentSize,
      });

      if (result) {
        setAddMode(false);
        setFormData({
          evidence_type: "deliverable",
          title: "",
          description: "",
          external_url: "",
        });
        setAttachmentFile(null);
        await fetchEvidence({ goal_id: goalId, employee_id: employeeId });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const goalEvidence = evidence.filter(e => e.goal_id === goalId);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenDialog}
          className="gap-2"
        >
          <Paperclip className="h-4 w-4" />
          Evidence
          {goalEvidence.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {goalEvidence.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Goal Evidence
          </DialogTitle>
          {goalTitle && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {goalTitle}
            </p>
          )}
        </DialogHeader>

        {addMode ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Evidence Type</Label>
              <Select
                value={formData.evidence_type}
                onValueChange={(v) =>
                  setFormData({ ...formData, evidence_type: v as EvidenceType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVIDENCE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Brief title for this evidence"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe how this relates to the goal..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>External URL (optional)</Label>
              <Input
                value={formData.external_url}
                onChange={(e) =>
                  setFormData({ ...formData, external_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Attachment (optional)</Label>
              <Input
                type="file"
                onChange={(e) =>
                  setAttachmentFile(e.target.files?.[0] || null)
                }
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setAddMode(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Evidence"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[300px]">
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">
                  Loading...
                </div>
              ) : goalEvidence.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No evidence attached yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {goalEvidence.map((ev) => {
                    const StatusIcon = STATUS_ICONS[ev.validation_status]?.icon || Clock;
                    const statusColor = STATUS_ICONS[ev.validation_status]?.color || "text-muted-foreground";

                    return (
                      <div
                        key={ev.id}
                        className="p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {ev.evidence_type.replace("_", " ")}
                              </Badge>
                              <StatusIcon className={`h-3.5 w-3.5 ${statusColor}`} />
                            </div>
                            <p className="font-medium text-sm">{ev.title}</p>
                            {ev.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {ev.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(ev.submitted_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {ev.external_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => window.open(ev.external_url!, "_blank")}
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {ev.attachment_path && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={async () => {
                                  const url = await getAttachmentUrl(ev.attachment_path!);
                                  if (url) window.open(url, "_blank");
                                }}
                              >
                                <Paperclip className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {!readOnly && (
              <div className="flex justify-end pt-2">
                <Button onClick={() => setAddMode(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Evidence
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
