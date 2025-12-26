import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGoalAdjustments } from "@/hooks/useGoalAdjustments";
import { format } from "date-fns";

interface GoalLockDialogProps {
  goalId: string;
  goalTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalLockDialog({ goalId, goalTitle, open, onOpenChange }: GoalLockDialogProps) {
  const { lockInfo, lockGoal, unlockGoal } = useGoalAdjustments(goalId);
  const [lockReason, setLockReason] = useState("");
  
  const isLocked = lockInfo?.is_locked ?? false;
  const isSubmitting = lockGoal.isPending || unlockGoal.isPending;

  const handleLock = async () => {
    if (!lockReason.trim()) return;
    
    await lockGoal.mutateAsync({ goal_id: goalId, lock_reason: lockReason });
    setLockReason("");
    onOpenChange(false);
  };

  const handleUnlock = async () => {
    await unlockGoal.mutateAsync(goalId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isLocked ? (
              <>
                <Unlock className="h-5 w-5" />
                Unlock Goal
              </>
            ) : (
              <>
                <Lock className="h-5 w-5" />
                Lock Goal
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isLocked
              ? "Unlocking this goal will allow edits and modifications."
              : "Locking this goal will prevent any changes until unlocked."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Goal: </span>
            <span className="font-medium">{goalTitle}</span>
          </div>

          {isLocked && lockInfo ? (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p>
                    Locked by <strong>{lockInfo.locked_by_profile?.full_name || "Unknown"}</strong>
                  </p>
                  {lockInfo.locked_at && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(lockInfo.locked_at), "PPp")}
                    </p>
                  )}
                  {lockInfo.lock_reason && (
                    <p className="mt-2 text-sm">{lockInfo.lock_reason}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="lock-reason">Lock Reason *</Label>
              <Textarea
                id="lock-reason"
                placeholder="Enter the reason for locking this goal..."
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This reason will be visible to anyone viewing the goal.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {isLocked ? (
            <Button onClick={handleUnlock} disabled={isSubmitting}>
              <Unlock className="mr-2 h-4 w-4" />
              {isSubmitting ? "Unlocking..." : "Unlock Goal"}
            </Button>
          ) : (
            <Button
              onClick={handleLock}
              disabled={isSubmitting || !lockReason.trim()}
              variant="destructive"
            >
              <Lock className="mr-2 h-4 w-4" />
              {isSubmitting ? "Locking..." : "Lock Goal"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
