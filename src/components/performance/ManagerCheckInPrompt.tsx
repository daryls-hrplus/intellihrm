import { useEffect, useState, forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Clock,
  AlertTriangle,
  ChevronRight,
  Users,
  Bell,
} from "lucide-react";
import { useGoalCheckIns, GoalCheckIn } from "@/hooks/useGoalCheckIns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";

interface ManagerCheckInPromptProps {
  onReviewClick?: (checkIn: GoalCheckIn) => void;
}

interface EnrichedCheckIn extends GoalCheckIn {
  employee_name?: string;
  goal_title?: string;
}

export const ManagerCheckInPrompt = forwardRef<HTMLDivElement, ManagerCheckInPromptProps>(function ManagerCheckInPrompt({ onReviewClick }, ref) {
  const { user } = useAuth();
  const { getPendingManagerReviews } = useGoalCheckIns();
  const [pendingReviews, setPendingReviews] = useState<EnrichedCheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingReviews = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const reviews = await getPendingManagerReviews(user.id);
        
        // Enrich with employee and goal info
        const enrichedReviews: EnrichedCheckIn[] = await Promise.all(
          reviews.map(async (review) => {
            // Get employee name
            const { data: employee } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", review.employee_id)
              .maybeSingle();
            
            // Get goal title
            const { data: goal } = await supabase
              .from("performance_goals")
              .select("title")
              .eq("id", review.goal_id)
              .maybeSingle();
            
            return {
              ...review,
              employee_name: employee?.full_name || "Unknown",
              goal_title: goal?.title || "Unknown Goal",
            };
          })
        );
        
        setPendingReviews(enrichedReviews);
      } catch (error) {
        console.error("Error fetching pending reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingReviews();
  }, [user?.id, getPendingManagerReviews]);

  const getUrgencyBadge = (checkIn: GoalCheckIn) => {
    const daysSinceSubmission = differenceInDays(
      new Date(),
      new Date(checkIn.employee_submitted_at || checkIn.created_at)
    );

    if (daysSinceSubmission > 7) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      );
    }
    if (daysSinceSubmission > 3) {
      return (
        <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
          <Clock className="h-3 w-3 mr-1" />
          Pending {daysSinceSubmission}d
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs">
        New
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading pending reviews...
        </CardContent>
      </Card>
    );
  }

  if (pendingReviews.length === 0) {
    return null; // Don't show the card if there are no pending reviews
  }

  return (
    <Card ref={ref} className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="h-5 w-5 text-primary" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center font-medium">
              {pendingReviews.length}
            </span>
          </div>
          <CardTitle className="text-lg">Pending Check-in Reviews</CardTitle>
        </div>
        <Badge variant="outline" className="text-xs">
          <Users className="h-3 w-3 mr-1" />
          {pendingReviews.length} awaiting review
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-3">
            {pendingReviews.map((checkIn) => (
              <div
                key={checkIn.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => onReviewClick?.(checkIn)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(checkIn.employee_name || "")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{checkIn.employee_name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {checkIn.goal_title}
                      </p>
                    </div>
                    {getUrgencyBadge(checkIn)}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {checkIn.employee_status?.replace("_", " ")}
                    </span>
                    <span>
                      Submitted {format(new Date(checkIn.employee_submitted_at || checkIn.created_at), "MMM d")}
                    </span>
                  </div>

                  {checkIn.employee_commentary && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
                      "{checkIn.employee_commentary}"
                    </p>
                  )}

                  {checkIn.blockers && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
                      <AlertTriangle className="h-3 w-3" />
                      Has blockers
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {pendingReviews.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Timely feedback helps employees stay on track. Review check-ins within 3 days of submission.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
