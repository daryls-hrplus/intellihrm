import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Upload,
  Plus,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Paperclip,
  ExternalLink,
  MoreVertical,
  Lock,
  Trash2,
  Eye,
  Target,
  Award,
  Briefcase,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { usePerformanceEvidence, PerformanceEvidence, CreateEvidenceData, EvidenceType, EvidenceValidationStatus } from "@/hooks/capabilities/usePerformanceEvidence";
import { toast } from "sonner";

interface PerformanceEvidenceManagerProps {
  employeeId: string;
  goalId?: string;
  capabilityId?: string;
  responsibilityId?: string;
  cycleId?: string;
  canValidate?: boolean;
  readOnly?: boolean;
}

const EVIDENCE_TYPE_CONFIG: Record<EvidenceType, { icon: React.ElementType; label: string; color: string }> = {
  project: { icon: Briefcase, label: "Project", color: "bg-blue-500/10 text-blue-600" },
  ticket: { icon: FileText, label: "Ticket", color: "bg-purple-500/10 text-purple-600" },
  deliverable: { icon: Target, label: "Deliverable", color: "bg-green-500/10 text-green-600" },
  customer_feedback: { icon: Award, label: "Customer Feedback", color: "bg-amber-500/10 text-amber-600" },
  kpi_extract: { icon: Target, label: "KPI Extract", color: "bg-indigo-500/10 text-indigo-600" },
  document: { icon: FileText, label: "Document", color: "bg-slate-500/10 text-slate-600" },
  presentation: { icon: FileText, label: "Presentation", color: "bg-pink-500/10 text-pink-600" },
  code_contribution: { icon: FileText, label: "Code Contribution", color: "bg-emerald-500/10 text-emerald-600" },
  award: { icon: Award, label: "Award", color: "bg-yellow-500/10 text-yellow-600" },
  recognition: { icon: Award, label: "Recognition", color: "bg-orange-500/10 text-orange-600" },
  metric_achievement: { icon: Target, label: "Metric Achievement", color: "bg-cyan-500/10 text-cyan-600" },
};

const STATUS_CONFIG: Record<EvidenceValidationStatus, { icon: React.ElementType; label: string; color: string }> = {
  pending: { icon: Clock, label: "Pending", color: "bg-yellow-500/10 text-yellow-600" },
  validated: { icon: CheckCircle2, label: "Validated", color: "bg-green-500/10 text-green-600" },
  rejected: { icon: XCircle, label: "Rejected", color: "bg-destructive/10 text-destructive" },
  disputed: { icon: AlertCircle, label: "Disputed", color: "bg-orange-500/10 text-orange-600" },
};

export function PerformanceEvidenceManager({
  employeeId,
  goalId,
  capabilityId,
  responsibilityId,
  cycleId,
  canValidate = false,
  readOnly = false,
}: PerformanceEvidenceManagerProps) {
  const {
    evidence,
    loading,
    fetchEvidence,
    createEvidence,
    validateEvidence,
    updateEvidence,
    uploadAttachment,
    getAttachmentUrl,
  } = usePerformanceEvidence();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<PerformanceEvidence | null>(null);
  const [filterType, setFilterType] = useState<EvidenceType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<EvidenceValidationStatus | "all">("all");
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateEvidenceData>>({
    evidence_type: "project",
    title: "",
    description: "",
    goal_id: goalId,
    capability_id: capabilityId,
    responsibility_id: responsibilityId,
    appraisal_cycle_id: cycleId,
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [validationNotes, setValidationNotes] = useState("");

  useEffect(() => {
    fetchEvidence({ employee_id: employeeId, goal_id: goalId, capability_id: capabilityId, responsibility_id: responsibilityId, appraisal_cycle_id: cycleId });
  }, [employeeId, goalId, capabilityId, responsibilityId, cycleId]);

  const handleSubmitEvidence = async () => {
    if (!formData.title || !formData.evidence_type) {
      toast.error("Please fill in required fields");
      return;
    }

    setUploading(true);
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
        ...formData as CreateEvidenceData,
        goal_id: goalId,
        capability_id: capabilityId,
        responsibility_id: responsibilityId,
        appraisal_cycle_id: cycleId,
        attachment_path: attachmentPath,
        attachment_type: attachmentType,
        attachment_size_bytes: attachmentSize,
      });

      if (result) {
        setAddDialogOpen(false);
        resetForm();
        fetchEvidence({ employee_id: employeeId, goal_id: goalId, capability_id: capabilityId, responsibility_id: responsibilityId, appraisal_cycle_id: cycleId });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleValidate = async (status: "validated" | "rejected") => {
    if (!selectedEvidence) return;

    const result = await validateEvidence(selectedEvidence.id, status, validationNotes);
    if (result) {
      setValidationDialogOpen(false);
      setSelectedEvidence(null);
      setValidationNotes("");
      fetchEvidence({ employee_id: employeeId, goal_id: goalId, capability_id: capabilityId, responsibility_id: responsibilityId, appraisal_cycle_id: cycleId });
    }
  };

  const handleDelete = async (evidenceId: string) => {
    // Note: Delete functionality would need to be added to the hook
    toast.error("Delete not yet implemented");
  };

  const handleDeleteOld = async (evidenceId: string) => {
    const result = await deleteEvidence(evidenceId);
    if (result) {
      fetchEvidence(employeeId, { goalId, capabilityId, responsibilityId, cycleId });
    }
  };

  const resetForm = () => {
    setFormData({
      evidence_type: "project",
      title: "",
      description: "",
      goal_id: goalId,
      capability_id: capabilityId,
      responsibility_id: responsibilityId,
      appraisal_cycle_id: cycleId,
    });
    setAttachmentFile(null);
  };

  const filteredEvidence = evidence.filter((e) => {
    if (filterType !== "all" && e.evidence_type !== filterType) return false;
    if (filterStatus !== "all" && e.validation_status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: evidence.length,
    pending: evidence.filter((e) => e.validation_status === "pending").length,
    validated: evidence.filter((e) => e.validation_status === "validated").length,
    rejected: evidence.filter((e) => e.validation_status === "rejected").length,
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Performance Evidence
            </CardTitle>
            <div className="flex items-center gap-2">
              {!readOnly && (
                <Button size="sm" onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Evidence
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-accent/30 text-center">
              <p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 text-center">
              <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 text-center">
              <p className="text-2xl font-semibold text-green-600">{stats.validated}</p>
              <p className="text-xs text-muted-foreground">Validated</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 text-center">
              <p className="text-2xl font-semibold text-destructive">{stats.rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={(v) => setFilterType(v as EvidenceType | "all")}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(EVIDENCE_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as EvidenceValidationStatus | "all")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Evidence List */}
          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredEvidence.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No evidence found</p>
                {!readOnly && (
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => setAddDialogOpen(true)}>
                    Add your first evidence
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvidence.map((ev) => {
                  const typeConfig = EVIDENCE_TYPE_CONFIG[ev.evidence_type];
                  const statusConfig = STATUS_CONFIG[ev.validation_status];
                  const TypeIcon = typeConfig?.icon || FileText;
                  const StatusIcon = statusConfig?.icon || Clock;

                  return (
                    <div
                      key={ev.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={typeConfig?.color}>
                              <TypeIcon className="h-3 w-3 mr-1" />
                              {typeConfig?.label || ev.evidence_type}
                            </Badge>
                            <Badge variant="outline" className={statusConfig?.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig?.label}
                            </Badge>
                            {ev.is_immutable && (
                              <Badge variant="secondary" className="text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                Locked
                              </Badge>
                            )}
                          </div>

                          <h4 className="font-medium text-sm">{ev.title}</h4>
                          {ev.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {ev.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              Submitted {formatDistanceToNow(new Date(ev.submitted_at), { addSuffix: true })}
                            </span>
                            {ev.goal && <span>Goal: {ev.goal.title}</span>}
                            {ev.capability && <span>Skill: {ev.capability.name}</span>}
                            {ev.attachment_path && (
                              <span className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                Attachment
                              </span>
                            )}
                          </div>

                          {ev.external_url && (
                            <a
                              href={ev.external_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View External Reference
                            </a>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {ev.attachment_path && (
                              <DropdownMenuItem
                                onClick={async () => {
                                  const url = await getAttachmentUrl(ev.attachment_path!);
                                  if (url) window.open(url, "_blank");
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Attachment
                              </DropdownMenuItem>
                            )}
                            {canValidate && ev.validation_status === "pending" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedEvidence(ev);
                                  setValidationDialogOpen(true);
                                }}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Validate
                              </DropdownMenuItem>
                            )}
                            {!ev.is_immutable && !readOnly && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(ev.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Evidence Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Performance Evidence</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Evidence Type *</Label>
              <Select
                value={formData.evidence_type}
                onValueChange={(v) => setFormData({ ...formData, evidence_type: v as EvidenceType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVIDENCE_TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief title for this evidence"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this evidence demonstrates..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>External URL</Label>
              <Input
                value={formData.external_url || ""}
                onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Source System</Label>
              <Input
                value={formData.source_system || ""}
                onChange={(e) => setFormData({ ...formData, source_system: e.target.value })}
                placeholder="e.g., Jira, GitHub, Salesforce"
              />
            </div>

            <div className="space-y-2">
              <Label>Attachment</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                {attachmentFile && (
                  <Badge variant="secondary">
                    {attachmentFile.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEvidence} disabled={uploading || !formData.title}>
              {uploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Evidence
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validation Dialog */}
      <Dialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validate Evidence</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedEvidence && (
              <div className="p-3 rounded-lg bg-accent/30">
                <p className="font-medium">{selectedEvidence.title}</p>
                <p className="text-sm text-muted-foreground">{selectedEvidence.description}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Validation Notes</Label>
              <Textarea
                value={validationNotes}
                onChange={(e) => setValidationNotes(e.target.value)}
                placeholder="Add notes about your validation decision..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setValidationDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleValidate("rejected")}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={() => handleValidate("validated")}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Validate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}