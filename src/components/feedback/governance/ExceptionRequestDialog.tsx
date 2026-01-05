import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield } from "lucide-react";
import { useFeedbackGovernance, type ExceptionType } from "@/hooks/useFeedbackGovernance";

interface ExceptionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleId: string;
  companyId: string;
  employeeId: string;
  employeeName?: string;
  onSuccess?: () => void;
}

const EXCEPTION_TYPES: { value: ExceptionType; label: string; description: string; requiresApproval: boolean }[] = [
  {
    value: 'deadline_extension',
    label: 'Deadline Extension',
    description: 'Request additional time to complete feedback',
    requiresApproval: true
  },
  {
    value: 'rater_exclusion',
    label: 'Rater Exclusion',
    description: 'Request to exclude a specific rater from providing feedback',
    requiresApproval: true
  },
  {
    value: 'anonymity_bypass',
    label: 'Anonymity Bypass',
    description: 'Request to reveal rater identity (requires strong justification)',
    requiresApproval: true
  },
  {
    value: 'report_access_override',
    label: 'Report Access Override',
    description: 'Request special access to feedback reports',
    requiresApproval: true
  },
  {
    value: 'ai_opt_out',
    label: 'AI Analysis Opt-Out',
    description: 'Opt out of AI-powered feedback analysis',
    requiresApproval: false
  },
  {
    value: 'signal_suppression',
    label: 'Signal Suppression',
    description: 'Request to suppress talent signals from this feedback cycle',
    requiresApproval: true
  }
];

export function ExceptionRequestDialog({
  open,
  onOpenChange,
  cycleId,
  companyId,
  employeeId,
  employeeName,
  onSuccess
}: ExceptionRequestDialogProps) {
  const { requestException, loading } = useFeedbackGovernance(companyId, cycleId);
  const [exceptionType, setExceptionType] = useState<ExceptionType | ''>('');
  const [reason, setReason] = useState('');
  const [supportingEvidence, setSupportingEvidence] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedType = EXCEPTION_TYPES.find(t => t.value === exceptionType);

  const handleSubmit = async () => {
    if (!exceptionType || !reason) return;

    setSubmitting(true);
    try {
      const success = await requestException(
        employeeId,
        exceptionType,
        reason,
        supportingEvidence || undefined,
        validUntil || undefined
      );

      if (success) {
        onOpenChange(false);
        resetForm();
        onSuccess?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setExceptionType('');
    setReason('');
    setSupportingEvidence('');
    setValidUntil('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Request Exception
          </DialogTitle>
          <DialogDescription>
            Request a governance exception for {employeeName || 'this employee'} in this feedback cycle.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="exceptionType">Exception Type *</Label>
            <Select value={exceptionType} onValueChange={(v) => setExceptionType(v as ExceptionType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select exception type" />
              </SelectTrigger>
              <SelectContent>
                {EXCEPTION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedType && (
              <p className="text-xs text-muted-foreground">{selectedType.description}</p>
            )}
          </div>

          {selectedType?.requiresApproval && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This exception type requires HR approval before taking effect.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this exception is needed..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence">Supporting Evidence (optional)</Label>
            <Textarea
              id="evidence"
              value={supportingEvidence}
              onChange={(e) => setSupportingEvidence(e.target.value)}
              placeholder="Provide any supporting documentation or references..."
              rows={2}
            />
          </div>

          {(exceptionType === 'deadline_extension' || exceptionType === 'report_access_override') && (
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                When should this exception expire?
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!exceptionType || !reason || submitting || loading}
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
