// Review Dashboard - Reviewer queue management

import { useState } from "react";
import { format, isPast, differenceInDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  ArrowRight,
  Calendar,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewItem {
  id: string;
  version_id: string;
  article_id: string;
  title: string;
  manualName: string;
  submittedBy: string;
  submittedAt: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
}

interface ReviewDashboardProps {
  pendingReviews: ReviewItem[];
  completedReviews: ReviewItem[];
  onStartReview: (reviewId: string) => void;
  onViewArticle: (articleId: string, versionId: string) => void;
  isLoading?: boolean;
}

export function ReviewDashboard({
  pendingReviews,
  completedReviews,
  onStartReview,
  onViewArticle,
  isLoading,
}: ReviewDashboardProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  const overdueCount = pendingReviews.filter(
    (r) => r.dueDate && isPast(new Date(r.dueDate))
  ).length;

  const dueSoonCount = pendingReviews.filter((r) => {
    if (!r.dueDate) return false;
    const days = differenceInDays(new Date(r.dueDate), new Date());
    return days >= 0 && days <= 3;
  }).length;

  const progress = pendingReviews.length + completedReviews.length > 0
    ? Math.round((completedReviews.length / (pendingReviews.length + completedReviews.length)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingReviews.length}</p>
                <p className="text-xs text-muted-foreground">Pending Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overdueCount}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dueSoonCount}</p>
                <p className="text-xs text-muted-foreground">Due Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedReviews.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Review Progress</span>
            <span className="text-sm text-muted-foreground">{progress}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Review List */}
      <Card>
        <CardHeader>
          <CardTitle>My Reviews</CardTitle>
          <CardDescription>Articles assigned to you for review</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList>
              <TabsTrigger value="pending">
                Pending
                {pendingReviews.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{pendingReviews.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                <Badge variant="secondary" className="ml-2">{completedReviews.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {pendingReviews.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No pending reviews</p>
                    </div>
                  ) : (
                    pendingReviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        onStart={() => onStartReview(review.id)}
                        onView={() => onViewArticle(review.article_id, review.version_id)}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {completedReviews.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No completed reviews yet</p>
                    </div>
                  ) : (
                    completedReviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        onView={() => onViewArticle(review.article_id, review.version_id)}
                        isCompleted
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Individual review card
function ReviewCard({
  review,
  onStart,
  onView,
  isCompleted,
}: {
  review: ReviewItem;
  onStart?: () => void;
  onView: () => void;
  isCompleted?: boolean;
}) {
  const isOverdue = review.dueDate && isPast(new Date(review.dueDate));
  const isDueSoon = review.dueDate && !isOverdue && differenceInDays(new Date(review.dueDate), new Date()) <= 3;

  return (
    <div
      className={cn(
        "p-4 border rounded-lg transition-colors hover:bg-muted/50",
        isOverdue && "border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10",
        isDueSoon && "border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium truncate">{review.title}</h4>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">Overdue</Badge>
            )}
            {isDueSoon && !isOverdue && (
              <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                Due Soon
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="secondary" className="text-xs">Completed</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{review.manualName}</p>

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {review.submittedBy}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(review.submittedAt), "MMM d, yyyy")}
            </span>
            {review.dueDate && (
              <span className={cn(
                "flex items-center gap-1",
                isOverdue && "text-red-600",
                isDueSoon && "text-amber-600"
              )}>
                <Clock className="h-3 w-3" />
                Due {format(new Date(review.dueDate), "MMM d")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onView}>
            <Eye className="h-4 w-4" />
          </Button>
          {!isCompleted && onStart && (
            <Button size="sm" onClick={onStart}>
              Start Review
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
