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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Shield, FileWarning } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InvestigationRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleId: string;
  cycleName: string;
  targetEmployeeId?: string;
  targetEmployeeName?: string;
  companyId: string;
  onSuccess?: () => void;
}

const REQUEST_TYPES = [
  { value: 'harassment', label: 'Harassment Allegation' },
  { value: 'discrimination', label: 'Discrimination Claim' },
  { value: 'misconduct', label: 'Misconduct Investigation' },
  { value: 'policy_violation', label: 'Policy Violation' },
  { value: 'legal_hold', label: 'Legal Hold Request' },
  { value: 'other', label: 'Other (Specify)' },
];

export function InvestigationRequestDialog({
  open,
  onOpenChange,
  cycleId,
  cycleName,
  targetEmployeeId,
  targetEmployeeName,
  companyId,
  onSuccess,
}: InvestigationRequestDialogProps) {
  const [requestType, setRequestType] = useState<string>("");
  const [legalReference, setLegalReference] = useState("");
  const [reason, setReason] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = requestType && reason.length >= 100 && acknowledged;

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('feedback_investigation_requests')
        .insert({
          cycle_id: cycleId,
          target_employee_id: targetEmployeeId || null,
          requested_by: user.user.id,
          request_type: requestType,
          legal_reference: legalReference || null,
          request_reason: reason,
          company_id: companyId,
          status: 'pending',
        });

      if (error) throw error;

      toast.success("Investigation request submitted", {
        description: "Your request has been sent for approval.",
      });
      
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setRequestType("");
      setLegalReference("");
      setReason("");
      setAcknowledged(false);
    } catch (error) {
      console.error("Error submitting investigation request:", error);
      toast.error("Failed to submit request", {
        description: "Please try again or contact support.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            <DialogTitle>Request Investigation Access</DialogTitle>
          </div>
          <DialogDescription>
            Request access to individual 360 feedback responses for formal investigation purposes.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Anonymity Impact Warning</AlertTitle>
          <AlertDescription>
            Accessing individual responses breaks the anonymity that makes 360 feedback effective.
            This action is fully logged and may be audited. Only proceed for documented investigations.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Context */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cycle:</span>
              <span className="font-medium">{cycleName}</span>
            </div>
            {targetEmployeeName && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target Employee:</span>
                <span className="font-medium">{targetEmployeeName}</span>
              </div>
            )}
          </div>

          {/* Request Type */}
          <div className="space-y-2">
            <Label htmlFor="request-type">
              Investigation Type <span className="text-destructive">*</span>
            </Label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger>
                <SelectValue placeholder="Select investigation type" />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Legal Reference */}
          <div className="space-y-2">
            <Label htmlFor="legal-reference">
              Case/Ticket Reference
            </Label>
            <Input
              id="legal-reference"
              placeholder="e.g., HR Case #12345, Legal Ticket #ABC-789"
              value={legalReference}
              onChange={(e) => setLegalReference(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Optional but recommended for audit trail
            </p>
          </div>

          {/* Justification */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Justification <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Provide detailed justification for why access to individual responses is required. Minimum 100 characters."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <div className="flex justify-between text-xs">
              <span className={reason.length < 100 ? "text-destructive" : "text-muted-foreground"}>
                {reason.length < 100 
                  ? `${100 - reason.length} more characters required`
                  : "Minimum requirement met"
                }
              </span>
              <span className="text-muted-foreground">{reason.length} characters</span>
            </div>
          </div>

          {/* Acknowledgment */}
          <Alert className="bg-warning/10 border-warning/30">
            <FileWarning className="h-4 w-4 text-warning" />
            <AlertDescription className="text-sm">
              <div className="flex items-start gap-3 mt-1">
                <Checkbox
                  id="acknowledge"
                  checked={acknowledged}
                  onCheckedChange={(checked) => setAcknowledged(checked === true)}
                />
                <label htmlFor="acknowledge" className="cursor-pointer leading-relaxed">
                  I understand that this action is <strong>fully logged and auditable</strong>. 
                  Accessing individual feedback responses may <strong>impact program credibility</strong> and 
                  could have <strong>legal implications</strong> under data protection regulations.
                </label>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid || isSubmitting}
            variant="destructive"
          >
            {isSubmitting ? "Submitting..." : "Submit Investigation Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
