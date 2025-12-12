import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Mail, Bell, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Goal {
  id: string;
  title: string;
  employee_id: string | null;
  employee?: { full_name: string } | null;
}

interface ContactReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal;
  onSuccess?: () => void;
}

type ContactMethod = "review" | "chat" | "email";

export function ContactReportDialog({
  open,
  onOpenChange,
  goal,
  onSuccess,
}: ContactReportDialogProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [contactMethod, setContactMethod] = useState<ContactMethod>("review");
  const [message, setMessage] = useState("");

  const employeeName = goal.employee?.full_name || "Employee";

  const handleSubmit = async () => {
    if (!user?.id || !goal.employee_id) return;

    setSubmitting(true);
    try {
      const baseMessage = message.trim() || `Regarding your goal: "${goal.title}"`;
      
      if (contactMethod === "review") {
        // Create a notification for the employee
        const { error: notifError } = await supabase.from("notifications").insert([{
          user_id: goal.employee_id,
          title: "Goal Feedback from Manager",
          message: `Your manager has provided feedback on goal: "${goal.title}"`,
          type: "goal_review",
          link: `/ess/goals`,
          is_read: false,
        }]);

        if (notifError) throw notifError;

        // Add a comment to the goal
        const { error: commentError } = await supabase.from("goal_comments").insert([{
          goal_id: goal.id,
          user_id: user.id,
          comment: `Manager feedback: ${baseMessage}`,
          comment_type: "review",
        }]);

        if (commentError) throw commentError;

        toast.success("Feedback sent to employee");
      } else if (contactMethod === "chat") {
        // Add a comment tagging the employee
        const { error } = await supabase.from("goal_comments").insert([{
          goal_id: goal.id,
          user_id: user.id,
          comment: `@${employeeName}: ${baseMessage}`,
          comment_type: "feedback",
        }]);

        if (error) throw error;

        // Notify the employee
        await supabase.from("notifications").insert([{
          user_id: goal.employee_id,
          title: "New Goal Comment from Manager",
          message: `Your manager mentioned you in a goal comment`,
          type: "goal_comment",
          link: `/ess/goals`,
          is_read: false,
        }]);

        toast.success("Message sent to employee");
      } else if (contactMethod === "email") {
        // Create notification with email flag
        const { error } = await supabase.from("notifications").insert([{
          user_id: goal.employee_id,
          title: "Goal Discussion Request from Manager",
          message: `Your manager would like to discuss goal: "${goal.title}"\n\nMessage: ${baseMessage}`,
          type: "goal_review",
          link: `/ess/goals`,
          is_read: false,
          metadata: { send_email: true, goal_id: goal.id },
        }]);

        if (error) throw error;

        toast.success("Email notification sent to employee");
      }

      onOpenChange(false);
      setMessage("");
      onSuccess?.();
    } catch (error) {
      console.error("Error contacting employee:", error);
      toast.error("Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Team Member</DialogTitle>
          <DialogDescription>
            Reach out to your team member about this goal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee Info */}
          <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
            <Avatar>
              <AvatarFallback>{getInitials(employeeName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{employeeName}</p>
              <p className="text-sm text-muted-foreground">Team Member</p>
            </div>
          </div>

          {/* Goal Context */}
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Regarding goal:</p>
            <p className="font-medium">{goal.title}</p>
          </div>

          <Separator />

          {/* Contact Method */}
          <div className="space-y-3">
            <Label>How would you like to reach out?</Label>
            <RadioGroup
              value={contactMethod}
              onValueChange={(v) => setContactMethod(v as ContactMethod)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="review" id="review" />
                <Label htmlFor="review" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <span>Provide Feedback</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-normal">
                    Send a notification with your feedback
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="chat" id="chat" />
                <Label htmlFor="chat" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span>Start Chat</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-normal">
                    Add a comment thread on this goal
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>Send Email</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-normal">
                    Notify via email with goal details
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message for your team member..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  {contactMethod === "review" && <Bell className="mr-2 h-4 w-4" />}
                  {contactMethod === "chat" && <MessageSquare className="mr-2 h-4 w-4" />}
                  {contactMethod === "email" && <Mail className="mr-2 h-4 w-4" />}
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}