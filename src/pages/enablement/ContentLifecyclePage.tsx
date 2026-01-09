// Content Lifecycle Page - Admin dashboard for content lifecycle management

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays, isPast } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  RefreshCw,
  CalendarClock,
  Archive,
  TrendingUp,
} from "lucide-react";
import { ContentLifecycleService } from "@/services/kb/ContentLifecycleService";
import { cn } from "@/lib/utils";

export default function ContentLifecyclePage() {
  const [activeTab, setActiveTab] = useState("due-review");

  // Fetch lifecycle stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["lifecycle-stats"],
    queryFn: () => ContentLifecycleService.getLifecycleStats(),
  });

  // Fetch due for review
  const { data: dueForReview = [], isLoading: dueLoading } = useQuery({
    queryKey: ["due-for-review"],
    queryFn: () => ContentLifecycleService.getArticlesDueForReview(14),
  });

  // Fetch expiring content
  const { data: expiringContent = [], isLoading: expiringLoading } = useQuery({
    queryKey: ["expiring-content"],
    queryFn: () => ContentLifecycleService.getExpiringContent(60),
  });

  // Fetch stale content
  const { data: staleContent = [], isLoading: staleLoading } = useQuery({
    queryKey: ["stale-content"],
    queryFn: () => ContentLifecycleService.getStaleContent(180),
  });

  // Fetch pending approvals
  const { data: pendingApprovals = [], isLoading: pendingLoading } = useQuery({
    queryKey: ["pending-approvals"],
    queryFn: () => ContentLifecycleService.getPendingApprovals(),
  });

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Content Lifecycle" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CalendarClock className="h-6 w-6 text-primary" />
              Content Lifecycle Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor content health, review schedules, and expiration dates
            </p>
          </div>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalArticles || 0}</p>
                  <p className="text-xs text-muted-foreground">Published Articles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Calendar className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.dueForReview || 0}</p>
                  <p className="text-xs text-muted-foreground">Due for Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Clock className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.expiringContent || 0}</p>
                  <p className="text-xs text-muted-foreground">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-500/10">
                  <Archive className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.staleContent || 0}</p>
                  <p className="text-xs text-muted-foreground">Stale Content</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.pendingApprovals || 0}</p>
                  <p className="text-xs text-muted-foreground">Pending Approval</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Content Status</CardTitle>
            <CardDescription>
              Track articles that need attention based on their lifecycle stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="due-review">
                  Due for Review
                  {dueForReview.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{dueForReview.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="expiring">
                  Expiring
                  {expiringContent.length > 0 && (
                    <Badge variant="outline" className="ml-2 border-red-500 text-red-600">
                      {expiringContent.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="stale">
                  Stale Content
                  {staleContent.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{staleContent.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending Approvals
                  {pendingApprovals.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{pendingApprovals.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="due-review" className="mt-4">
                <ContentList
                  items={dueForReview}
                  isLoading={dueLoading}
                  emptyMessage="No articles due for review"
                  emptyIcon={CheckCircle2}
                  dateField="review_due_date"
                  dateLabel="Review Due"
                />
              </TabsContent>

              <TabsContent value="expiring" className="mt-4">
                <ContentList
                  items={expiringContent}
                  isLoading={expiringLoading}
                  emptyMessage="No expiring content"
                  emptyIcon={CheckCircle2}
                  dateField="expires_at"
                  dateLabel="Expires"
                />
              </TabsContent>

              <TabsContent value="stale" className="mt-4">
                <ContentList
                  items={staleContent}
                  isLoading={staleLoading}
                  emptyMessage="No stale content detected"
                  emptyIcon={CheckCircle2}
                  dateField="created_at"
                  dateLabel="Last Updated"
                />
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <ContentList
                  items={pendingApprovals}
                  isLoading={pendingLoading}
                  emptyMessage="No pending approvals"
                  emptyIcon={CheckCircle2}
                  dateField="created_at"
                  dateLabel="Submitted"
                  showStatus
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

// Content list component
function ContentList({
  items,
  isLoading,
  emptyMessage,
  emptyIcon: EmptyIcon,
  dateField,
  dateLabel,
  showStatus,
}: {
  items: any[];
  isLoading: boolean;
  emptyMessage: string;
  emptyIcon: typeof CheckCircle2;
  dateField: string;
  dateLabel: string;
  showStatus?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <EmptyIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {items.map((item) => {
          const dateValue = item[dateField];
          const isOverdue = dateField.includes('due') && dateValue && isPast(new Date(dateValue));
          const daysUntil = dateValue ? differenceInDays(new Date(dateValue), new Date()) : null;

          return (
            <div
              key={item.id}
              className={cn(
                "p-4 border rounded-lg hover:bg-muted/50 transition-colors",
                isOverdue && "border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{item.title}</h4>
                    {showStatus && (
                      <Badge variant="outline" className="text-xs">{item.status}</Badge>
                    )}
                    {isOverdue && (
                      <Badge variant="destructive" className="text-xs">Overdue</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    v{item.version_number}
                  </p>
                </div>

                <div className="text-right text-sm">
                  <p className="text-muted-foreground">{dateLabel}</p>
                  <p className={cn(
                    "font-medium",
                    isOverdue && "text-red-600"
                  )}>
                    {dateValue ? format(new Date(dateValue), "MMM d, yyyy") : "Not set"}
                  </p>
                  {daysUntil !== null && daysUntil >= 0 && daysUntil <= 7 && (
                    <p className="text-xs text-amber-600">
                      {daysUntil === 0 ? "Today" : `${daysUntil} days`}
                    </p>
                  )}
                </div>

                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
