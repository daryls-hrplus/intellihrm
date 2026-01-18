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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAppraisalReadiness, AppraisalReadinessResult } from "@/hooks/useAppraisalReadiness";
import { cn } from "@/lib/utils";
import {
  Rocket,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Bell,
  Lock,
  ClipboardCheck,
  Loader2,
  ShieldCheck,
  Info,
} from "lucide-react";

interface AppraisalCycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  evaluation_deadline: string | null;
  company_id: string;
}

interface AppraisalActivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycle: AppraisalCycle;
  onSuccess: () => void;
}

interface ActivationOptions {
  sendNotifications: boolean;
  lockGoals: boolean;
  createTasks: boolean;
}

interface ActivationResult {
  success: boolean;
  cycleName: string;
  participantsNotified: number;
  managersNotified: number;
  goalsLocked: number;
  tasksCreated: number;
  reminderRulesTriggered: number;
  errors: string[];
  warnings: string[];
}

export function AppraisalActivationDialog({
  open,
  onOpenChange,
  cycle,
  onSuccess,
}: AppraisalActivationDialogProps) {
  const [activating, setActivating] = useState(false);
  const [activationResult, setActivationResult] = useState<ActivationResult | null>(null);
  const [options, setOptions] = useState<ActivationOptions>({
    sendNotifications: true,
    lockGoals: true,
    createTasks: true,
  });

  const { result: readiness, isLoading: readinessLoading } = useAppraisalReadiness(cycle.company_id);

  // Get participant count
  const [participantCount, setParticipantCount] = useState<number | null>(null);
  useState(() => {
    supabase
      .from("appraisal_participants")
      .select("id", { count: "exact", head: true })
      .eq("cycle_id", cycle.id)
      .then(({ count }) => setParticipantCount(count || 0));
  });

  const criticalIssues = readiness?.checks.filter(c => !c.passed && c.severity === "critical") || [];
  const warnings = readiness?.checks.filter(c => !c.passed && c.severity === "warning") || [];
  const canActivate = criticalIssues.length === 0 && participantCount !== 0;

  const handleActivate = async () => {
    setActivating(true);
    setActivationResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("activate-appraisal-cycle", {
        body: {
          cycleId: cycle.id,
          sendNotifications: options.sendNotifications,
          lockGoals: options.lockGoals,
          createTasks: options.createTasks,
        },
      });

      if (error) throw error;

      if (data.success) {
        setActivationResult(data);
        toast.success(`Appraisal cycle "${cycle.name}" activated successfully`);
        onSuccess();
      } else {
        throw new Error(data.error || "Activation failed");
      }
    } catch (error: any) {
      console.error("Activation error:", error);
      toast.error(error.message || "Failed to activate cycle");
    } finally {
      setActivating(false);
    }
  };

  const handleClose = () => {
    setActivationResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Activate Appraisal Cycle
          </DialogTitle>
          <DialogDescription>
            Review readiness and configure activation options for "{cycle.name}"
          </DialogDescription>
        </DialogHeader>

        {activationResult ? (
          // Success Result View
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-200">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-700">Cycle Activated Successfully</h3>
                <p className="text-sm text-green-600">
                  {activationResult.cycleName} is now active
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Participants Notified
                  </div>
                  <p className="text-2xl font-bold mt-1">{activationResult.participantsNotified}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Bell className="h-4 w-4" />
                    Managers Notified
                  </div>
                  <p className="text-2xl font-bold mt-1">{activationResult.managersNotified}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    Goals Locked
                  </div>
                  <p className="text-2xl font-bold mt-1">{activationResult.goalsLocked}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ClipboardCheck className="h-4 w-4" />
                    Tasks Created
                  </div>
                  <p className="text-2xl font-bold mt-1">{activationResult.tasksCreated}</p>
                </CardContent>
              </Card>
            </div>

            {activationResult.warnings.length > 0 && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  {activationResult.warnings.join(". ")}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          // Pre-Activation View
          <div className="space-y-4">
            {/* Readiness Check Summary */}
            {readinessLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Checking readiness...</span>
              </div>
            ) : readiness ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {readiness.isReady ? (
                      <ShieldCheck className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    )}
                    <span className="font-medium">Readiness Score</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      readiness.overallScore === 100
                        ? "bg-green-500/10 text-green-600 border-green-200"
                        : readiness.overallScore >= 70
                        ? "bg-amber-500/10 text-amber-600 border-amber-200"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    )}
                  >
                    {readiness.overallScore}%
                  </Badge>
                </div>
                <Progress
                  value={readiness.overallScore}
                  className={cn(
                    "h-2",
                    readiness.overallScore === 100
                      ? "[&>div]:bg-green-500"
                      : readiness.overallScore >= 70
                      ? "[&>div]:bg-amber-500"
                      : "[&>div]:bg-destructive"
                  )}
                />

                {/* Critical Issues */}
                {criticalIssues.length > 0 && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{criticalIssues.length} critical issue(s)</strong> must be resolved:
                      <ul className="list-disc list-inside mt-1 text-sm">
                        {criticalIssues.map(issue => (
                          <li key={issue.id}>{issue.name}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Warnings */}
                {warnings.length > 0 && criticalIssues.length === 0 && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                      {warnings.length} warning(s) - activation can proceed but review recommended
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : null}

            {/* Participant Count */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Enrolled Participants</span>
              </div>
              <Badge variant={participantCount === 0 ? "destructive" : "secondary"}>
                {participantCount ?? "..."}
              </Badge>
            </div>

            {participantCount === 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  No participants are enrolled in this cycle. Add participants before activating.
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            {/* Activation Options */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Activation Options</h4>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    checked={options.sendNotifications}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, sendNotifications: checked === true })
                    }
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <Label className="cursor-pointer font-medium">Send Notifications</Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Notify all participants and managers about the cycle start
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    checked={options.lockGoals}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, lockGoals: checked === true })
                    }
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      <Label className="cursor-pointer font-medium">Lock Related Goals</Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Prevent modifications to goals within the performance period
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    checked={options.createTasks}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, createTasks: checked === true })
                    }
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4 text-primary" />
                      <Label className="cursor-pointer font-medium">Create Participant Tasks</Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Set participant status to "pending" with due dates
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 text-sm">
                Activation will trigger configured reminder rules and cannot be undone. 
                The cycle will immediately become visible to all participants.
              </AlertDescription>
            </Alert>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose} disabled={activating}>
                Cancel
              </Button>
              <Button
                onClick={handleActivate}
                disabled={activating || !canActivate}
                className="gap-2"
              >
                {activating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Activate Cycle
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
