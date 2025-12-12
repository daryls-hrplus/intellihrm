import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Comment {
  id: string;
  comment: string;
  comment_type: string;
  is_private: boolean;
  created_at: string;
  user_id: string;
  user?: { full_name: string } | null;
}

interface GoalCommentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
  goalTitle: string;
}

const commentTypeLabels: Record<string, { label: string; className: string }> = {
  general: { label: "General", className: "bg-muted text-muted-foreground" },
  progress_update: { label: "Progress", className: "bg-info/10 text-info" },
  review: { label: "Review", className: "bg-warning/10 text-warning" },
  feedback: { label: "Feedback", className: "bg-success/10 text-success" },
};

export function GoalCommentsDialog({
  open,
  onOpenChange,
  goalId,
  goalTitle,
}: GoalCommentsDialogProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState("general");

  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open, goalId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("goal_comments")
        .select(`
          *,
          user:profiles!goal_comments_user_id_fkey(full_name)
        `)
        .eq("goal_id", goalId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments((data as Comment[]) || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || !user?.id) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("goal_comments").insert([{
        goal_id: goalId,
        user_id: user.id,
        comment: newComment.trim(),
        comment_type: commentType,
      }]);

      if (error) throw error;

      setNewComment("");
      setCommentType("general");
      await fetchComments();
      toast.success("Comment added");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("goal_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      await fetchComments();
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <p className="text-sm text-muted-foreground line-clamp-1">{goalTitle}</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new comment */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Select value={commentType} onValueChange={setCommentType}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="progress_update">Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 min-h-[60px]"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!newComment.trim() || submitting}
                size="sm"
              >
                <Send className="mr-2 h-4 w-4" />
                {submitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Comments list */}
          <ScrollArea className="h-[300px] pr-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => {
                  const typeConfig = commentTypeLabels[comment.comment_type] || commentTypeLabels.general;
                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(comment.user?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {comment.user?.full_name || "Unknown"}
                            </span>
                            <Badge variant="outline" className={`text-xs ${typeConfig.className}`}>
                              {typeConfig.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.created_at), "MMM d, h:mm a")}
                            </span>
                            {comment.user_id === user?.id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleDelete(comment.id)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-foreground">{comment.comment}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
