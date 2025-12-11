import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Check,
  CheckCheck,
  Reply,
  MoreVertical,
  Trash2,
  Clock,
  Target
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  scenario_id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  content: string;
  annotation_target: string | null;
  is_resolved: boolean;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ScenarioCollaborationProps {
  scenarioId: string | null;
  scenarioName?: string;
}

const ANNOTATION_TARGETS = [
  { value: 'general', label: 'General Comment', icon: MessageSquare },
  { value: 'parameter:growthRate', label: 'Growth Rate', icon: Target },
  { value: 'parameter:attritionRate', label: 'Attrition Rate', icon: Target },
  { value: 'parameter:budgetConstraint', label: 'Budget', icon: Target },
  { value: 'result:finalHeadcount', label: 'Final Headcount', icon: Target },
  { value: 'result:feasibility', label: 'Feasibility', icon: Target },
];

export const ScenarioCollaboration: React.FC<ScenarioCollaborationProps> = ({
  scenarioId,
  scenarioName
}) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [annotationTarget, setAnnotationTarget] = useState('general');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch comments
  useEffect(() => {
    if (!scenarioId) return;
    
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('scenario_comments')
        .select('*')
        .eq('scenario_id', scenarioId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
      } else {
        setComments(data || []);
      }
    };

    fetchComments();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`scenario-comments-${scenarioId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scenario_comments',
          filter: `scenario_id=eq.${scenarioId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setComments(prev => [...prev, payload.new as Comment]);
            // Scroll to bottom on new comment
            setTimeout(() => {
              scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
            }, 100);
          } else if (payload.eventType === 'UPDATE') {
            setComments(prev => prev.map(c => c.id === payload.new.id ? payload.new as Comment : c));
          } else if (payload.eventType === 'DELETE') {
            setComments(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scenarioId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !scenarioId) return;

    setIsLoading(true);
    const { error } = await supabase
      .from('scenario_comments')
      .insert({
        scenario_id: scenarioId,
        user_id: user.id,
        user_email: user.email || '',
        user_name: profile?.full_name || user.email?.split('@')[0] || 'User',
        content: newComment.trim(),
        annotation_target: replyingTo ? null : annotationTarget,
        parent_comment_id: replyingTo,
      });

    if (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } else {
      setNewComment('');
      setReplyingTo(null);
      toast.success('Comment posted');
    }
    setIsLoading(false);
  };

  const toggleResolved = async (commentId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('scenario_comments')
      .update({ is_resolved: !currentStatus })
      .eq('id', commentId);

    if (error) {
      toast.error('Failed to update comment');
    }
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('scenario_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      toast.error('Failed to delete comment');
    } else {
      toast.success('Comment deleted');
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getTargetLabel = (target: string | null) => {
    const found = ANNOTATION_TARGETS.find(t => t.value === target);
    return found?.label || 'General';
  };

  // Group comments by parent
  const rootComments = comments.filter(c => !c.parent_comment_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_comment_id === parentId);

  if (!scenarioId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Collaboration
          </CardTitle>
          <CardDescription>
            Save a scenario to enable real-time collaboration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Save your scenario set to start collaborating with your team</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Collaboration
            </CardTitle>
            <CardDescription>
              {scenarioName ? `Comments on "${scenarioName}"` : 'Real-time comments and annotations'}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comments List */}
        <ScrollArea className="h-[300px] pr-4" ref={scrollRef}>
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No comments yet. Start the discussion!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rootComments.map(comment => (
                <div key={comment.id} className="space-y-2">
                  <CommentItem
                    comment={comment}
                    currentUserId={user?.id}
                    onReply={() => setReplyingTo(comment.id)}
                    onToggleResolved={() => toggleResolved(comment.id, comment.is_resolved)}
                    onDelete={() => deleteComment(comment.id)}
                    getInitials={getInitials}
                    getTargetLabel={getTargetLabel}
                  />
                  
                  {/* Replies */}
                  {getReplies(comment.id).length > 0 && (
                    <div className="ml-8 space-y-2 border-l-2 border-muted pl-4">
                      {getReplies(comment.id).map(reply => (
                        <CommentItem
                          key={reply.id}
                          comment={reply}
                          currentUserId={user?.id}
                          onReply={() => setReplyingTo(reply.id)}
                          onToggleResolved={() => toggleResolved(reply.id, reply.is_resolved)}
                          onDelete={() => deleteComment(reply.id)}
                          getInitials={getInitials}
                          getTargetLabel={getTargetLabel}
                          isReply
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />

        {/* New Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {replyingTo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
              <Reply className="h-4 w-4" />
              <span>Replying to comment</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 ml-auto"
                onClick={() => setReplyingTo(null)}
              >
                Cancel
              </Button>
            </div>
          )}
          
          {!replyingTo && (
            <div className="flex gap-2 flex-wrap">
              {ANNOTATION_TARGETS.map(target => (
                <Badge
                  key={target.value}
                  variant={annotationTarget === target.value ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setAnnotationTarget(target.value)}
                >
                  <target.icon className="h-3 w-3 mr-1" />
                  {target.label}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? "Write a reply..." : "Add a comment or annotation..."}
              className="min-h-[60px] resize-none"
            />
            <Button type="submit" disabled={isLoading || !newComment.trim()} className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReply: () => void;
  onToggleResolved: () => void;
  onDelete: () => void;
  getInitials: (name: string | null, email: string) => string;
  getTargetLabel: (target: string | null) => string;
  isReply?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onReply,
  onToggleResolved,
  onDelete,
  getInitials,
  getTargetLabel,
  isReply
}) => {
  const isOwn = comment.user_id === currentUserId;

  return (
    <div className={`p-3 rounded-lg ${comment.is_resolved ? 'bg-muted/30 opacity-70' : 'bg-muted/50'}`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {getInitials(comment.user_name, comment.user_email)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {comment.user_name || comment.user_email.split('@')[0]}
            </span>
            {!isReply && comment.annotation_target && comment.annotation_target !== 'general' && (
              <Badge variant="outline" className="text-xs">
                <Target className="h-3 w-3 mr-1" />
                {getTargetLabel(comment.annotation_target)}
              </Badge>
            )}
            {comment.is_resolved && (
              <Badge variant="secondary" className="text-xs">
                <CheckCheck className="h-3 w-3 mr-1" />
                Resolved
              </Badge>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          
          <p className={`text-sm mt-1 ${comment.is_resolved ? 'line-through' : ''}`}>
            {comment.content}
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onReply}>
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs"
              onClick={onToggleResolved}
            >
              {comment.is_resolved ? (
                <>
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Reopen
                </>
              ) : (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Resolve
                </>
              )}
            </Button>
            {isOwn && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
