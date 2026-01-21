import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Eye, CheckCircle2, AlertTriangle, Users, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ReleaseRatingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleId: string;
  cycleName: string;
  onSuccess?: () => void;
}

interface EligibleParticipant {
  id: string;
  employee_id: string;
  employee_name: string;
  overall_score: number | null;
  status: string;
  selected: boolean;
}

interface ReleaseResult {
  success: boolean;
  cycleName: string;
  results: {
    released: number;
    notified: number;
    errors: string[];
  };
}

export function ReleaseRatingsDialog({
  open,
  onOpenChange,
  cycleId,
  cycleName,
  onSuccess,
}: ReleaseRatingsDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState(false);
  const [participants, setParticipants] = useState<EligibleParticipant[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<ReleaseResult | null>(null);

  useEffect(() => {
    if (open && cycleId) {
      fetchEligibleParticipants();
      setConfirmed(false);
      setResult(null);
    }
  }, [open, cycleId]);

  const fetchEligibleParticipants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("appraisal_participants")
        .select(`
          id,
          employee_id,
          overall_score,
          status,
          released_at
        `)
        .eq("cycle_id", cycleId)
        .in("status", ["finalized", "reviewed"])
        .is("released_at", null);

      if (error) throw error;

      // Fetch employee names
      const participantsWithNames = await Promise.all(
        (data || []).map(async (p) => {
          const { data: employee } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", p.employee_id)
            .single();

          return {
            id: p.id,
            employee_id: p.employee_id,
            employee_name: employee?.full_name || "Unknown",
            overall_score: p.overall_score,
            status: p.status,
            selected: true,
          };
        })
      );

      setParticipants(participantsWithNames);
    } catch (error) {
      console.error("Error fetching participants:", error);
      toast.error("Failed to load eligible participants");
    } finally {
      setLoading(false);
    }
  };

  const toggleParticipant = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const toggleAll = (selected: boolean) => {
    setParticipants((prev) => prev.map((p) => ({ ...p, selected })));
  };

  const selectedCount = participants.filter((p) => p.selected).length;

  const handleRelease = async () => {
    if (!user?.id || selectedCount === 0) return;

    setReleasing(true);
    try {
      const selectedIds = participants
        .filter((p) => p.selected)
        .map((p) => p.id);

      const { data, error } = await supabase.functions.invoke("release-appraisal-ratings", {
        body: {
          cycleId,
          participantIds: selectedIds.length === participants.length ? undefined : selectedIds,
          releasedBy: user.id,
        },
      });

      if (error) throw error;

      setResult(data);
      toast.success(`Released ratings for ${data.results.released} employees`);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error releasing ratings:", error);
      toast.error(error.message || "Failed to release ratings");
    } finally {
      setReleasing(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setConfirmed(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Release Ratings
          </DialogTitle>
          <DialogDescription>
            Release performance ratings to employees for "{cycleName}"
          </DialogDescription>
        </DialogHeader>

        {result ? (
          // Success result view
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div>
                <p className="font-medium">Ratings Released Successfully</p>
                <p className="text-sm text-muted-foreground">
                  {result.results.released} employees can now view their results
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold">{result.results.released}</p>
                <p className="text-sm text-muted-foreground">Ratings Released</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold">{result.results.notified}</p>
                <p className="text-sm text-muted-foreground">Notifications Sent</p>
              </div>
            </div>

            {result.results.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {result.results.errors.length} notification(s) failed to send
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : participants.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              No participants with finalized ratings available for release
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Ensure manager reviews are completed and ratings are finalized before releasing
            </p>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectedCount === participants.length}
                  onCheckedChange={(checked) => toggleAll(!!checked)}
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Select All ({participants.length})
                </label>
              </div>
              <Badge variant="secondary">
                {selectedCount} selected
              </Badge>
            </div>

            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="p-2 space-y-1">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleParticipant(participant.id)}
                  >
                    <Checkbox
                      checked={participant.selected}
                      onCheckedChange={() => toggleParticipant(participant.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{participant.employee_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {participant.status}
                      </p>
                    </div>
                    {participant.overall_score !== null && (
                      <Badge variant="outline">
                        Score: {participant.overall_score.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Releasing ratings will notify employees via email and in-app notifications.
                They will be able to view their scores and provide acknowledgment.
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(!!checked)}
              />
              <label htmlFor="confirm" className="text-sm cursor-pointer">
                I confirm these ratings have been reviewed and are ready to be released to employees
              </label>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleRelease}
                disabled={!confirmed || selectedCount === 0 || releasing}
              >
                {releasing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Releasing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Release to {selectedCount} Employee{selectedCount !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
