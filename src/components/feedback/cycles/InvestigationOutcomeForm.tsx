import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InvestigationOutcomeFormProps {
  requestId: string;
  onSuccess?: () => void;
}

const OUTCOME_STATUSES = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved - Action Taken' },
  { value: 'no_action', label: 'No Action Required' },
  { value: 'escalated', label: 'Escalated to Legal/HR Leadership' },
];

export function InvestigationOutcomeForm({ requestId, onSuccess }: InvestigationOutcomeFormProps) {
  const queryClient = useQueryClient();
  const [outcomeStatus, setOutcomeStatus] = useState<string>("");
  const [outcomeSummary, setOutcomeSummary] = useState("");
  const [nextSteps, setNextSteps] = useState("");

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('feedback_investigation_requests')
        .update({
          outcome_status: outcomeStatus,
          outcome_summary: outcomeSummary,
          outcome_documented_by: user.user.id,
          outcome_documented_at: new Date().toISOString(),
          next_steps: nextSteps || null,
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Investigation outcome documented");
      queryClient.invalidateQueries({ queryKey: ['investigation-requests-queue'] });
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error saving outcome:", error);
      toast.error("Failed to save outcome");
    },
  });

  const isValid = outcomeStatus && outcomeSummary.length >= 50;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Document Investigation Outcome</CardTitle>
        </div>
        <CardDescription>
          Record the findings and resolution of this investigation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="outcome-status">
            Outcome Status <span className="text-destructive">*</span>
          </Label>
          <Select value={outcomeStatus} onValueChange={setOutcomeStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select outcome status" />
            </SelectTrigger>
            <SelectContent>
              {OUTCOME_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="outcome-summary">
            Outcome Summary <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="outcome-summary"
            placeholder="Summarize the investigation findings and any actions taken..."
            value={outcomeSummary}
            onChange={(e) => setOutcomeSummary(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className={`text-xs ${outcomeSummary.length < 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {outcomeSummary.length < 50 
              ? `${50 - outcomeSummary.length} more characters required`
              : "Minimum requirement met"
            }
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="next-steps">Next Steps (Optional)</Label>
          <Textarea
            id="next-steps"
            placeholder="Any follow-up actions or monitoring required..."
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            This documentation becomes part of the permanent investigation record 
            and may be subject to legal discovery.
          </p>
        </div>

        <Button 
          onClick={() => saveMutation.mutate()}
          disabled={!isValid || saveMutation.isPending}
          className="w-full"
        >
          {saveMutation.isPending ? "Saving..." : "Save Investigation Outcome"}
        </Button>
      </CardContent>
    </Card>
  );
}
