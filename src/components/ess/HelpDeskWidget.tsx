import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMyTickets } from "@/hooks/useMyTickets";
import { useNavigate } from "react-router-dom";
import { Headphones, Plus, ChevronRight, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function HelpDeskWidget() {
  const { data: counts, isLoading } = useMyTickets();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="border-l-4 border-l-amber-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasActiveTickets = counts && counts.total > 0;

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
              <Headphones className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">HR Help Desk</span>
                {hasActiveTickets && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                    {counts.total} active
                  </Badge>
                )}
              </div>
              
              {hasActiveTickets ? (
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                  {counts.open > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      {counts.open} open
                    </span>
                  )}
                  {counts.inProgress > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      {counts.inProgress} in progress
                    </span>
                  )}
                  {counts.pending > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-purple-500" />
                      {counts.pending} awaiting you
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  No active tickets - all caught up!
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-amber-200 text-amber-700 hover:bg-amber-50"
              onClick={() => navigate("/help/tickets/new?from=ess")}
            >
              <Plus className="h-4 w-4 mr-1" />
              Submit Ticket
            </Button>
            {hasActiveTickets && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/help/tickets")}
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
