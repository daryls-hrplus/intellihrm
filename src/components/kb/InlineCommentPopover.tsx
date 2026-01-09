// Inline comment popover for article reviews

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MessageSquare, Send, Check, Reply, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InlineComment {
  id: string;
  paragraphId: string;
  selectedText?: string;
  comment: string;
  author: string;
  authorName: string;
  createdAt: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  replies?: InlineCommentReply[];
}

interface InlineCommentReply {
  id: string;
  comment: string;
  author: string;
  authorName: string;
  createdAt: string;
}

interface InlineCommentPopoverProps {
  paragraphId: string;
  selectedText?: string;
  existingComments?: InlineComment[];
  onAddComment: (paragraphId: string, comment: string, selectedText?: string) => void;
  onResolveComment: (commentId: string) => void;
  onReplyToComment?: (commentId: string, reply: string) => void;
  children: React.ReactNode;
}

export function InlineCommentPopover({
  paragraphId,
  selectedText,
  existingComments = [],
  onAddComment,
  onResolveComment,
  onReplyToComment,
  children,
}: InlineCommentPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const paragraphComments = existingComments.filter(
    (c) => c.paragraphId === paragraphId && !c.resolved
  );

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(paragraphId, newComment, selectedText);
    setNewComment("");
  };

  const handleReply = (commentId: string) => {
    if (!replyText.trim() || !onReplyToComment) return;
    onReplyToComment(commentId, replyText);
    setReplyText("");
    setReplyingTo(null);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer group">
          {children}
          {paragraphComments.length > 0 && (
            <Badge
              variant="secondary"
              className="absolute -right-2 -top-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {paragraphComments.length}
            </Badge>
          )}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments
          </h4>
          {selectedText && (
            <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
              "{selectedText}"
            </p>
          )}
        </div>

        {paragraphComments.length > 0 && (
          <ScrollArea className="max-h-60">
            <div className="p-2 space-y-2">
              {paragraphComments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-muted/50 rounded-lg p-2 text-sm space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs">
                          {comment.authorName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.comment}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onResolveComment(comment.id)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-4 space-y-1 border-l-2 border-border pl-2">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="text-xs">
                          <span className="font-medium">{reply.authorName}:</span>{" "}
                          {reply.comment}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply input */}
                  {replyingTo === comment.id ? (
                    <div className="flex gap-1 mt-2">
                      <input
                        type="text"
                        className="flex-1 text-xs p-1 border rounded"
                        placeholder="Reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleReply(comment.id);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleReply(comment.id)}
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setReplyingTo(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    onReplyToComment && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => setReplyingTo(comment.id)}
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                    )
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="p-3 border-t space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[60px] text-sm"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSubmit} disabled={!newComment.trim()}>
              <Send className="h-3 w-3 mr-1" />
              Comment
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
