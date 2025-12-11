import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function PendingAccessRequests() {
  const { isAdmin } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentRequests, setRecentRequests] = useState<{ user_email: string; created_at: string }[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingRequests();

      // Subscribe to real-time updates
      const channel = supabase
        .channel("pending-requests-widget")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "access_requests",
          },
          () => {
            fetchPendingRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      const { data, count, error } = await supabase
        .from("access_requests")
        .select("user_email, created_at", { count: "exact" })
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;

      setPendingCount(count || 0);
      setRecentRequests(data || []);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Access Requests
        </CardTitle>
        {pendingCount > 0 && (
          <Badge className="bg-warning text-warning-foreground">
            {pendingCount} pending
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : pendingCount === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No pending access requests
          </p>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((req, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0 last:pb-0"
              >
                <span className="truncate max-w-[180px] text-foreground">
                  {req.user_email}
                </span>
                <span className="text-muted-foreground text-xs">
                  {new Date(req.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {pendingCount > 3 && (
              <p className="text-xs text-muted-foreground">
                +{pendingCount - 3} more request{pendingCount - 3 !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}
        <NavLink to="/admin/access-requests" className="block mt-4">
          <Button variant="outline" size="sm" className="w-full">
            Review Requests
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </NavLink>
      </CardContent>
    </Card>
  );
}
