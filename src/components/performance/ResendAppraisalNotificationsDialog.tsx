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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Bell,
  Users,
  UserCheck,
  Loader2,
  CheckCircle2,
  Send,
  Info,
} from "lucide-react";

interface ResendAppraisalNotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleId: string;
  cycleName: string;
}

interface ResendResult {
  success: boolean;
  cycleName: string;
  participantsNotified: number;
  managersNotified: number;
  errors: string[];
}

type TargetAudience = "all" | "participants" | "managers";

export function ResendAppraisalNotificationsDialog({
  open,
  onOpenChange,
  cycleId,
  cycleName,
}: ResendAppraisalNotificationsDialogProps) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<ResendResult | null>(null);
  const [targetAudience, setTargetAudience] = useState<TargetAudience>("all");

  const handleResend = async () => {
    setSending(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("resend-appraisal-notifications", {
        body: {
          cycleId,
          targetAudience,
        },
      });

      if (error) throw error;

      if (data.success) {
        setResult(data);
        toast.success(`Notifications resent successfully`);
      } else {
        throw new Error(data.error || "Failed to resend notifications");
      }
    } catch (error: any) {
      console.error("Resend error:", error);
      toast.error(error.message || "Failed to resend notifications");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setTargetAudience("all");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Resend Notifications
          </DialogTitle>
          <DialogDescription>
            Resend activation notifications for "{cycleName}"
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-200">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-700">Notifications Sent</h3>
                <p className="text-sm text-green-600">
                  Successfully resent notifications
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Participants
                  </div>
                  <p className="text-2xl font-bold mt-1">{result.participantsNotified}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserCheck className="h-4 w-4" />
                    Managers
                  </div>
                  <p className="text-2xl font-bold mt-1">{result.managersNotified}</p>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Send To</Label>
              <RadioGroup
                value={targetAudience}
                onValueChange={(value) => setTargetAudience(value as TargetAudience)}
                className="space-y-2"
              >
                <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="all" id="all" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <Label htmlFor="all" className="cursor-pointer font-medium">
                        All Recipients
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Send to both participants and managers
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="participants" id="participants" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <Label htmlFor="participants" className="cursor-pointer font-medium">
                        Participants Only
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Send only to employees being appraised
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="managers" id="managers" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <Label htmlFor="managers" className="cursor-pointer font-medium">
                        Managers Only
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Send only to evaluators/managers
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 text-sm">
                This will send reminder notifications to selected recipients. 
                They will receive a new notification even if they already have one.
              </AlertDescription>
            </Alert>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose} disabled={sending}>
                Cancel
              </Button>
              <Button onClick={handleResend} disabled={sending} className="gap-2">
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Notifications
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
