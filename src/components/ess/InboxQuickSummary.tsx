import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEssInbox } from "@/hooks/useEssInbox";
import { useNavigate } from "react-router-dom";
import { Inbox, AlertCircle, ChevronRight, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function InboxQuickSummary() {
  const { data, isLoading } = useEssInbox();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.counts.total === 0) {
    return null;
  }

  const { counts } = data;
  const hasUrgent = counts.responseRequired > 0;

  return (
    <Card className={hasUrgent ? "border-l-4 border-l-destructive" : "border-l-4 border-l-primary"}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${hasUrgent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
              {hasUrgent ? <AlertCircle className="h-5 w-5" /> : <Inbox className="h-5 w-5" />}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">My Inbox</span>
                <Badge variant="secondary">{counts.total} items</Badge>
                {hasUrgent && (
                  <Badge variant="destructive">
                    {counts.responseRequired} urgent
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {hasUrgent 
                  ? `${counts.responseRequired} item${counts.responseRequired > 1 ? 's' : ''} require${counts.responseRequired === 1 ? 's' : ''} your response`
                  : `${counts.pending} item${counts.pending > 1 ? 's' : ''} awaiting review`
                }
              </p>
            </div>
          </div>
          
          <Button 
            variant={hasUrgent ? "default" : "outline"} 
            onClick={() => navigate("/ess/my-inbox")}
          >
            View Inbox
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
