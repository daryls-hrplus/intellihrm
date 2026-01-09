// Article Review Panel - Individual article review UI

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ContentDiffViewer } from "./ContentDiffViewer";
import { InlineCommentPopover, InlineComment } from "./InlineCommentPopover";
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  FileText,
  GitBranch,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ArticleReviewPanelProps {
  article: {
    id: string;
    title: string;
    content: string;
    versionNumber: string;
    manualName: string;
    submittedBy: string;
    submittedAt: string;
  };
  previousContent?: string;
  previousVersionNumber?: string;
  comments: InlineComment[];
  onApprove: (comment?: string) => void;
  onRequestChanges: (feedback: string, inlineComments: InlineComment[]) => void;
  onAddComment: (paragraphId: string, comment: string, selectedText?: string) => void;
  onResolveComment: (commentId: string) => void;
  onSkip?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalCount?: number;
  isSubmitting?: boolean;
}

export function ArticleReviewPanel({
  article,
  previousContent,
  previousVersionNumber,
  comments,
  onApprove,
  onRequestChanges,
  onAddComment,
  onResolveComment,
  onSkip,
  onPrevious,
  onNext,
  currentIndex = 0,
  totalCount = 1,
  isSubmitting,
}: ArticleReviewPanelProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'changes' | 'comments'>('content');
  const [approvalComment, setApprovalComment] = useState("");
  const [changesRequested, setChangesRequested] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showChangesDialog, setShowChangesDialog] = useState(false);

  const openComments = comments.filter((c) => !c.resolved);
  const resolvedComments = comments.filter((c) => c.resolved);

  // Split content into paragraphs for inline commenting
  const paragraphs = article.content.split('\n\n').filter(Boolean);

  const handleApprove = () => {
    onApprove(approvalComment || undefined);
    setApprovalComment("");
    setShowApproveDialog(false);
  };

  const handleRequestChanges = () => {
    if (!changesRequested.trim()) return;
    onRequestChanges(changesRequested, comments);
    setChangesRequested("");
    setShowChangesDialog(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="font-semibold text-lg">{article.title}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{article.manualName}</span>
              <span>•</span>
              <Badge variant="outline" className="text-xs">v{article.versionNumber}</Badge>
              <span>•</span>
              <span>Submitted by {article.submittedBy}</span>
              <span>•</span>
              <span>{format(new Date(article.submittedAt), "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {totalCount}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            disabled={!onPrevious || currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            disabled={!onNext || currentIndex >= totalCount - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className="h-12">
            <TabsTrigger value="content" className="gap-2">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="changes" className="gap-2">
              <GitBranch className="h-4 w-4" />
              Changes
              {previousContent && (
                <Badge variant="secondary" className="ml-1 text-xs">Diff</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments
              {openComments.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">{openComments.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="content" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 prose prose-sm dark:prose-invert max-w-none">
              {paragraphs.map((paragraph, index) => (
                <InlineCommentPopover
                  key={index}
                  paragraphId={`p-${index}`}
                  existingComments={comments}
                  onAddComment={onAddComment}
                  onResolveComment={onResolveComment}
                >
                  <p className="mb-4 hover:bg-muted/30 -mx-2 px-2 py-1 rounded transition-colors">
                    {paragraph}
                  </p>
                </InlineCommentPopover>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="changes" className="flex-1 m-0 overflow-hidden">
          {previousContent ? (
            <ContentDiffViewer
              oldContent={previousContent}
              newContent={article.content}
              oldVersionLabel={`v${previousVersionNumber || 'Previous'}`}
              newVersionLabel={`v${article.versionNumber}`}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>This is the first version - no previous content to compare</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="comments" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {openComments.length === 0 && resolvedComments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No comments yet</p>
                  <p className="text-sm">Click on content paragraphs to add inline comments</p>
                </div>
              ) : (
                <>
                  {openComments.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Open Comments ({openComments.length})
                      </h4>
                      <div className="space-y-2">
                        {openComments.map((comment) => (
                          <CommentCard
                            key={comment.id}
                            comment={comment}
                            onResolve={() => onResolveComment(comment.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {resolvedComments.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-sm mb-3 text-muted-foreground">
                        Resolved ({resolvedComments.length})
                      </h4>
                      <div className="space-y-2 opacity-60">
                        {resolvedComments.map((comment) => (
                          <CommentCard key={comment.id} comment={comment} isResolved />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Action Bar */}
      <div className="border-t p-4 bg-muted/30">
        {showApproveDialog ? (
          <div className="space-y-3">
            <Textarea
              placeholder="Optional: Add a comment for the author..."
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={isSubmitting}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm Approval
              </Button>
            </div>
          </div>
        ) : showChangesDialog ? (
          <div className="space-y-3">
            <Textarea
              placeholder="Describe the changes required..."
              value={changesRequested}
              onChange={(e) => setChangesRequested(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowChangesDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRequestChanges}
                disabled={!changesRequested.trim() || isSubmitting}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Feedback
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {openComments.length > 0 && (
                <Badge variant="outline" className="text-amber-600 border-amber-500">
                  {openComments.length} open comments
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onSkip && (
                <Button variant="ghost" onClick={onSkip}>
                  Skip
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowChangesDialog(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Request Changes
              </Button>
              <Button onClick={() => setShowApproveDialog(true)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Comment card component
function CommentCard({
  comment,
  onResolve,
  isResolved,
}: {
  comment: InlineComment;
  onResolve?: () => void;
  isResolved?: boolean;
}) {
  return (
    <div className={cn(
      "p-3 border rounded-lg text-sm",
      isResolved && "bg-muted/30"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="font-medium text-foreground">{comment.authorName}</span>
            <span>{format(new Date(comment.createdAt), "MMM d, h:mm a")}</span>
          </div>
          {comment.selectedText && (
            <p className="text-xs italic text-muted-foreground mb-2 line-clamp-1">
              "{comment.selectedText}"
            </p>
          )}
          <p>{comment.comment}</p>
        </div>
        {!isResolved && onResolve && (
          <Button variant="ghost" size="sm" className="h-7" onClick={onResolve}>
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Resolve
          </Button>
        )}
      </div>
    </div>
  );
}
