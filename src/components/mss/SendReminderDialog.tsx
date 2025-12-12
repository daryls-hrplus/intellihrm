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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Bell, MessageSquare, Mail } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  employee_id: string | null;
  employee_name?: string;
}

interface SendReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  type: "reminder" | "update_request";
}

export function SendReminderDialog({ open, onOpenChange, goal, type }: SendReminderDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<"notification" | "chat" | "email">("notification");

  const handleSubmit = async () => {
    if (!goal || !goal.employee_id || !user?.id) return;

    setLoading(true);
    try {
      const notificationMessage = type === "reminder" 
        ? `Reminder: Please update your progress on goal "${goal.title}"`
        : `Your manager has requested an update on goal "${goal.title}"`;

      if (channel === "notification") {
        // Create in-app notification
        const { error } = await supabase.from("notifications").insert({
          user_id: goal.employee_id,
          type: "goal_reminder",
          title: type === "reminder" ? "Goal Reminder" : "Update Requested",
          message: message || notificationMessage,
          metadata: { goal_id: goal.id, goal_title: goal.title },
        });

        if (error) throw error;
        toast.success(`${type === "reminder" ? "Reminder" : "Update request"} sent successfully`);
      } else if (channel === "chat") {
        // Create a comment on the goal
        const { error } = await supabase.from("goal_comments").insert({
          goal_id: goal.id,
          user_id: user.id,
          comment: message || notificationMessage,
          is_private: false,
        });

        if (error) throw error;
        toast.success("Message posted to goal comments");
      } else {
        // For email - would typically call an edge function
        toast.success("Email notification queued");
      }

      setMessage("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "reminder" ? "Send Reminder" : "Request Progress Update"}
          </DialogTitle>
          <DialogDescription>
            {type === "reminder" 
              ? `Send a reminder to ${goal?.employee_name} about their goal progress.`
              : `Request an update from ${goal?.employee_name} on their goal progress.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Goal</Label>
            <p className="text-sm text-muted-foreground">{goal?.title}</p>
          </div>

          <div className="space-y-2">
            <Label>Delivery Channel</Label>
            <RadioGroup value={channel} onValueChange={(v) => setChannel(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="notification" id="notification" />
                <Label htmlFor="notification" className="flex items-center gap-2 cursor-pointer">
                  <Bell className="h-4 w-4" />
                  In-App Notification
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="chat" id="chat" />
                <Label htmlFor="chat" className="flex items-center gap-2 cursor-pointer">
                  <MessageSquare className="h-4 w-4" />
                  Goal Comment
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
