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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Mail, Bell, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Goal {
  id: string;
  title: string;
}

interface Supervisor {
  supervisor_id: string;
  supervisor_name: string;
  supervisor_position_title: string;
}

interface ContactManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal;
  onSuccess?: () => void;
}

type ContactMethod = "review" | "chat" | "email";

export function ContactManagerDialog({
  open,
  onOpenChange,
  goal,
  onSuccess,
}: ContactManagerDialogProps) {
  const { user } = useAuth();
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [contactMethod, setContactMethod] = useState<ContactMethod>("review");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open && user?.id) {
      fetchSupervisor();
    }
  }, [open, user?.id]);

  const fetchSupervisor = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc("get_employee_supervisor", { p_employee_id: user.id });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setSupervisor(data[0] as Supervisor);
      } else {
        setSupervisor(null);
      }
    } catch (error) {
      console.error("Error fetching supervisor:", error);
      setSupervisor(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id || !supervisor) return;

    setSubmitting(true);
    try {
      const baseMessage = message.trim() || `Please review my goal: "${goal.title}"`;
      
      if (contactMethod === "review") {
        // Create a notification for the supervisor
        const { error: notifError } = await supabase.from("notifications").insert([{
          user_id: supervisor.supervisor_id,
          title: "Goal Review Request",
          message: `${user.email} has requested your review on goal: "${goal.title}"`,
          type: "goal_review",
          link: `/performance/goals`,
          is_read: false,
        }]);

        if (notifError) throw notifError;

        // Add a comment to the goal
        const { error: commentError } = await supabase.from("goal_comments").insert([{
          goal_id: goal.id,
          user_id: user.id,
          comment: `Requested manager review: ${baseMessage}`,
          comment_type: "review",
        }]);

        if (commentError) throw commentError;

        toast.success("Review request sent to your manager");
      } else if (contactMethod === "chat") {
        // Add a comment tagging the manager
        const { error } = await supabase.from("goal_comments").insert([{
          goal_id: goal.id,
          user_id: user.id,
          comment: `@${supervisor.supervisor_name}: ${baseMessage}`,
          comment_type: "feedback",
        }]);

        if (error) throw error;

        // Notify the supervisor
        await supabase.from("notifications").insert([{
          user_id: supervisor.supervisor_id,
          title: "New Goal Comment",
          message: `${user.email} mentioned you in a goal comment`,
          type: "goal_comment",
          link: `/performance/goals`,
          is_read: false,
        }]);

        toast.success("Message sent to your manager");
      } else if (contactMethod === "email") {
        // Create notification with email flag
        const { error } = await supabase.from("notifications").insert([{
          user_id: supervisor.supervisor_id,
          title: "Goal Discussion Request",
          message: `${user.email} would like to discuss goal: "${goal.title}"\n\nMessage: ${baseMessage}`,
          type: "goal_review",
          link: `/performance/goals`,
          is_read: false,
          metadata: { send_email: true, goal_id: goal.id },
        }]);

        if (error) throw error;

        toast.success("Email notification sent to your manager");
      }

      onOpenChange(false);
      setMessage("");
      onSuccess?.();
    } catch (error) {
      console.error("Error contacting manager:", error);
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
          <DialogTitle>Contact Your Manager</DialogTitle>
          <DialogDescription>
            Reach out to your supervisor about this goal
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !supervisor ? (
          <div className="py-8 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold">No Supervisor Found</h3>
            <p className="text-sm text-muted-foreground">
              You don't have a supervisor assigned to your position
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Supervisor Info */}
            <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
              <Avatar>
                <AvatarFallback>{getInitials(supervisor.supervisor_name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{supervisor.supervisor_name}</p>
                <p className="text-sm text-muted-foreground">
                  {supervisor.supervisor_position_title}
                </p>
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
                      <span>Request Review</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-normal">
                      Send a notification requesting feedback
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
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message for your manager..."
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
        )}
      </DialogContent>
    </Dialog>
  );
}
