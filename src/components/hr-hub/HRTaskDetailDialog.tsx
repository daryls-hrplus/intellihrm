import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow, format } from "date-fns";
import { Send, MessageSquare, Clock, User, Building2, CalendarDays, Repeat, AlertCircle } from "lucide-react";

interface HRTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  company_id: string | null;
  created_at: string;
  is_recurring: boolean | null;
  recurrence_pattern: string | null;
  company?: { name: string } | null;
  assignee?: { full_name: string } | null;
}

interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment_text: string;
  comment_type: string;
  created_at: string;
  user?: { full_name: string } | null;
}

interface HRTaskDetailDialogProps {
  task: HRTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const query = (table: string) => supabase.from(table as any);

const priorityColors: Record<string, string> = {
  low: "bg-slate-500",
  medium: "bg-amber-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

export function HRTaskDetailDialog({ task, open, onOpenChange }: HRTaskDetailDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task && open) {
      loadComments();
    }
  }, [task, open]);

  const loadComments = async () => {
    if (!task) return;
    setIsLoading(true);
    try {
      const res: any = await query("hr_task_comments")
        .select("*, user:profiles(full_name)")
        .eq("task_id", task.id)
        .order("created_at", { ascending: true });
      setComments(res.data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !task || !profile) return;

    setIsSubmitting(true);
    try {
      const res: any = await query("hr_task_comments").insert({
        task_id: task.id,
        user_id: profile.id,
        comment_text: newComment.trim(),
        comment_type: "comment",
      });

      if (res.error) throw res.error;

      setNewComment("");
      loadComments();
    } catch (error) {
      toast({ title: t("common.error"), description: "Failed to add comment", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const isOverdue = task?.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8">
            <span className="truncate">{task.title}</span>
            <Badge className={`${priorityColors[task.priority]} text-white`}>
              {task.priority}
            </Badge>
            {task.is_recurring && (
              <Badge variant="outline" className="gap-1">
                <Repeat className="h-3 w-3" />
                {task.recurrence_pattern}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Task Details */}
          <div className="space-y-3 text-sm">
            {task.description && (
              <p className="text-muted-foreground">{task.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              {task.company?.name && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {task.company.name}
                </span>
              )}
              {task.due_date && (
                <span className={`flex items-center gap-1 ${isOverdue ? "text-orange-600 font-medium" : ""}`}>
                  <CalendarDays className="h-4 w-4" />
                  {format(new Date(task.due_date), "PPP")}
                  {isOverdue && <AlertCircle className="h-3 w-3" />}
                </span>
              )}
              {task.assignee?.full_name && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {task.assignee.full_name}
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* Comments Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">Activity & Comments</span>
              <span className="text-xs text-muted-foreground">({comments.length})</span>
            </div>

            <ScrollArea className="flex-1 pr-4 min-h-[200px] max-h-[300px]">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No comments yet. Be the first to add one!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(comment.user?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{comment.user?.full_name || "Unknown"}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{comment.comment_text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Add Comment Input */}
            <div className="mt-4 flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSubmitComment();
                  }
                }}
              />
              <Button 
                onClick={handleSubmitComment} 
                disabled={!newComment.trim() || isSubmitting}
                size="icon"
                className="h-auto"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Press Ctrl+Enter to send</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}