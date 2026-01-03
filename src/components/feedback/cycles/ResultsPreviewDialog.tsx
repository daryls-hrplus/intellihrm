import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Info, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VisibilityRules, DEFAULT_VISIBILITY_RULES } from "./CycleVisibilityRulesEditor";
import { RolePerspectiveSelector, RolePerspective } from "./RolePerspectiveSelector";
import { VisibilitySummaryPanel } from "./VisibilitySummaryPanel";
import { PreviewResultsView } from "./PreviewResultsView";

interface ResultsPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleId: string;
  cycleName: string;
  visibilityRules?: VisibilityRules;
  companyId?: string;
}

interface Participant {
  id: string;
  employee_id: string;
  employee_name: string;
}

export function ResultsPreviewDialog({
  open,
  onOpenChange,
  cycleId,
  cycleName,
  visibilityRules = DEFAULT_VISIBILITY_RULES,
  companyId,
}: ResultsPreviewDialogProps) {
  const [role, setRole] = useState<RolePerspective>("employee");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [companyAnonymityPolicy, setCompanyAnonymityPolicy] = useState<{
    individual_response_access: 'never' | 'investigation_only';
  } | undefined>();

  useEffect(() => {
    if (open && cycleId) {
      fetchParticipants();
      if (companyId) {
        fetchCompanyPolicy();
      }
    }
  }, [open, cycleId, companyId]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("review_participants")
        .select("id, employee_id")
        .eq("review_cycle_id", cycleId)
        .limit(50);

      if (error) throw error;

      // Fetch employee names
      const participantsWithNames = await Promise.all(
        (data || []).map(async (p) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", p.employee_id)
            .single();
          return {
            id: p.id,
            employee_id: p.employee_id,
            employee_name: profile?.full_name || "Unknown Employee",
          };
        })
      );

      setParticipants(participantsWithNames);
      if (participantsWithNames.length > 0) {
        setSelectedParticipantId(participantsWithNames[0].id);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyPolicy = async () => {
    try {
      const { data } = await supabase
        .from("companies")
        .select("feedback_360_anonymity_policy")
        .eq("id", companyId)
        .single();

      if (data?.feedback_360_anonymity_policy) {
        const policy = typeof data.feedback_360_anonymity_policy === 'string'
          ? JSON.parse(data.feedback_360_anonymity_policy)
          : data.feedback_360_anonymity_policy;
        setCompanyAnonymityPolicy({
          individual_response_access: policy.individual_response_access || 'never',
        });
      }
    } catch (error) {
      console.error("Error fetching company policy:", error);
    }
  };

  const selectedParticipant = participants.find((p) => p.id === selectedParticipantId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview Results: {cycleName}</DialogTitle>
          <DialogDescription>
            See how 360 results will appear to different roles before releasing
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-info/10 border-info/20">
          <Info className="h-4 w-4 text-info" />
          <AlertDescription className="text-info">
            This preview shows what the selected role will see based on visibility rules.
            No data is modified.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {/* Role Selector */}
          <div className="space-y-2">
            <Label>Viewing As:</Label>
            <RolePerspectiveSelector value={role} onChange={setRole} />
          </div>

          <Separator />

          {/* Participant Selector */}
          <div className="space-y-2">
            <Label>Select Participant:</Label>
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading participants...
              </div>
            ) : participants.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No participants found in this cycle
              </p>
            ) : (
              <Select value={selectedParticipantId} onValueChange={setSelectedParticipantId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a participant" />
                </SelectTrigger>
                <SelectContent>
                  {participants.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.employee_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Visibility Summary */}
          <VisibilitySummaryPanel
            rules={visibilityRules}
            role={role}
            companyAnonymityPolicy={companyAnonymityPolicy}
          />

          <Separator />

          {/* Preview Results */}
          {selectedParticipant && (
            <PreviewResultsView
              participantId={selectedParticipant.id}
              participantName={selectedParticipant.employee_name}
              cycleId={cycleId}
              visibilityRules={visibilityRules}
              role={role}
            />
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
