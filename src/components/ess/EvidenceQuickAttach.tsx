import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Plus,
  Link as LinkIcon,
  Upload,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";
import { usePerformanceEvidence, PerformanceEvidence, EvidenceType } from "@/hooks/capabilities/usePerformanceEvidence";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface EvidenceQuickAttachProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  participantId?: string;
  scoreItemId?: string;
  itemName: string;
  itemType: "goal" | "competency" | "responsibility";
  cycleId?: string;
  onAttached?: (evidenceIds: string[]) => void;
}

const EVIDENCE_TYPES: { value: EvidenceType; label: string }[] = [
  { value: "project", label: "Project" },
  { value: "deliverable", label: "Deliverable" },
  { value: "metric_achievement", label: "Metric Achievement" },
  { value: "customer_feedback", label: "Customer Feedback" },
  { value: "document", label: "Document" },
  { value: "presentation", label: "Presentation" },
  { value: "award", label: "Award" },
  { value: "recognition", label: "Recognition" },
];

export function EvidenceQuickAttach({
  open,
  onOpenChange,
  employeeId,
  participantId,
  scoreItemId,
  itemName,
  itemType,
  cycleId,
  onAttached,
}: EvidenceQuickAttachProps) {
  const { evidence, loading, fetchEvidence, createEvidence, uploadAttachment, updateEvidence } = usePerformanceEvidence();
  
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // New evidence form state
  const [newEvidence, setNewEvidence] = useState({
    title: "",
    description: "",
    evidence_type: "deliverable" as EvidenceType,
    external_url: "",
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      fetchEvidence({ employee_id: employeeId });
      setSelectedIds([]);
      setNewEvidence({
        title: `Evidence for: ${itemName}`,
        description: "",
        evidence_type: "deliverable",
        external_url: "",
      });
    }
  }, [open, employeeId, itemName]);

  const filteredEvidence = evidence.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleEvidence = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAttachExisting = async () => {
    if (selectedIds.length === 0) return;
    
    setSaving(true);
    try {
      // Update each selected evidence to link to this participant/score item
      for (const evidenceId of selectedIds) {
        await supabase
          .from("performance_evidence")
          .update({
            participant_id: participantId,
            score_item_id: scoreItemId,
            appraisal_cycle_id: cycleId,
          })
          .eq("id", evidenceId);
      }
      
      onAttached?.(selectedIds);
      onOpenChange(false);
    } catch (error) {
      console.error("Error attaching evidence:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = async () => {
    if (!newEvidence.title) return;

    setSaving(true);
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
        ...newEvidence,
        appraisal_cycle_id: cycleId,
        participant_id: participantId,
        score_item_id: scoreItemId,
        attachment_path: attachmentPath,
        attachment_type: attachmentType,
        attachment_size_bytes: attachmentSize,
        // Link to specific item based on type
        goal_id: itemType === "goal" ? scoreItemId : undefined,
        capability_id: itemType === "competency" ? scoreItemId : undefined,
        responsibility_id: itemType === "responsibility" ? scoreItemId : undefined,
      });

      if (result) {
        onAttached?.([result.id]);
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Attach Evidence
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            For: <span className="font-medium">{itemName}</span>
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "existing" | "new")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing" className="gap-2">
              <LinkIcon className="h-4 w-4" />
              Link Existing
            </TabsTrigger>
            <TabsTrigger value="new" className="gap-2">
              <Plus className="h-4 w-4" />
              Create New
            </TabsTrigger>
          </TabsList>

          {/* Existing Evidence Tab */}
          <TabsContent value="existing" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your evidence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-[300px] rounded-md border p-2">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredEvidence.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No evidence found</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setActiveTab("new")}
                  >
                    Create new evidence
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredEvidence.map((ev) => (
                    <div
                      key={ev.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedIds.includes(ev.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => handleToggleEvidence(ev.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedIds.includes(ev.id)}
                          onCheckedChange={() => handleToggleEvidence(ev.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">{ev.title}</h4>
                            <Badge
                              variant="outline"
                              className={
                                ev.validation_status === "validated"
                                  ? "bg-green-500/10 text-green-600"
                                  : "bg-yellow-500/10 text-yellow-600"
                              }
                            >
                              {ev.validation_status === "validated" ? (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              ) : (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              {ev.validation_status}
                            </Badge>
                          </div>
                          {ev.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {ev.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(ev.submitted_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {selectedIds.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedIds.length} evidence item(s) selected
              </p>
            )}
          </TabsContent>

          {/* New Evidence Tab */}
          <TabsContent value="new" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Evidence Type</Label>
                  <Select
                    value={newEvidence.evidence_type}
                    onValueChange={(v) => setNewEvidence(prev => ({ ...prev, evidence_type: v as EvidenceType }))}
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
                  <Label>External URL (Optional)</Label>
                  <Input
                    placeholder="https://..."
                    value={newEvidence.external_url}
                    onChange={(e) => setNewEvidence(prev => ({ ...prev, external_url: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="Evidence title"
                  value={newEvidence.title}
                  onChange={(e) => setNewEvidence(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe this evidence and how it supports your rating..."
                  value={newEvidence.description}
                  onChange={(e) => setNewEvidence(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Attachment (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  {attachmentFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachmentFile(null)}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {activeTab === "existing" ? (
            <Button
              onClick={handleAttachExisting}
              disabled={selectedIds.length === 0 || saving}
            >
              {saving ? "Attaching..." : `Attach ${selectedIds.length} Item(s)`}
            </Button>
          ) : (
            <Button
              onClick={handleCreateNew}
              disabled={!newEvidence.title || saving}
            >
              <Upload className="h-4 w-4 mr-2" />
              {saving ? "Creating..." : "Create & Attach"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
