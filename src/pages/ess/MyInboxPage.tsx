import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useEssInbox, InboxCategory } from "@/hooks/useEssInbox";
import { InboxSummaryBar } from "@/components/ess/inbox/InboxSummaryBar";
import { InboxCategorySection } from "@/components/ess/inbox/InboxCategorySection";
import { InboxItemCard } from "@/components/ess/inbox/InboxItemCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox, CheckCircle } from "lucide-react";

const CATEGORY_ORDER: InboxCategory[] = [
  'time_absence',
  'pay_benefits', 
  'performance',
  'tasks_approvals',
  'documents',
  'learning'
];

export default function MyInboxPage() {
  const { data, isLoading } = useEssInbox();

  const responseRequiredItems = data?.items.filter(i => i.urgency === 'response_required') || [];
  const pendingItems = data?.items.filter(i => i.urgency === 'pending') || [];
  const infoItems = data?.items.filter(i => i.urgency === 'info') || [];

  const itemsByCategory = CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = data?.items.filter(i => i.category === category) || [];
    return acc;
  }, {} as Record<InboxCategory, typeof data extends undefined ? never : NonNullable<typeof data>['items']>);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Employee Self-Service", href: "/ess" },
            { label: "My Inbox" },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Inbox className="h-8 w-8 text-primary" />
            My Inbox
          </h1>
          <p className="text-muted-foreground mt-1">
            See all your pending tasks and actions in one place
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-64" />
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ) : (
          <>
            <InboxSummaryBar counts={data?.counts || { total: 0, responseRequired: 0, pending: 0, byCategory: {} as Record<InboxCategory, number> }} />

            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">
                  All ({data?.counts.total || 0})
                </TabsTrigger>
                <TabsTrigger value="response_required">
                  Response Required ({responseRequiredItems.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({pendingItems.length})
                </TabsTrigger>
                <TabsTrigger value="by_category">
                  By Category
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {data?.items.length === 0 ? (
                  <EmptyInboxState />
                ) : (
                  data?.items.map((item) => (
                    <InboxItemCard key={item.id} item={item} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="response_required" className="space-y-3">
                {responseRequiredItems.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                      <h3 className="font-semibold text-lg">No urgent items</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        You have no items requiring immediate response
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  responseRequiredItems.map((item) => (
                    <InboxItemCard key={item.id} item={item} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-3">
                {pendingItems.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                      <h3 className="font-semibold text-lg">No pending items</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        You have no items awaiting review
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingItems.map((item) => (
                    <InboxItemCard key={item.id} item={item} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="by_category" className="space-y-4">
                {data?.items.length === 0 ? (
                  <EmptyInboxState />
                ) : (
                  CATEGORY_ORDER.map((category) => (
                    <InboxCategorySection
                      key={category}
                      category={category}
                      items={itemsByCategory[category]}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
}

function EmptyInboxState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h3 className="font-semibold text-xl">All caught up!</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          You have no pending tasks or actions. Check back later for new items.
        </p>
      </CardContent>
    </Card>
  );
}
