import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function AppHeader() {
  const { isAdmin } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingCount();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel("access-requests-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "access_requests",
          },
          () => {
            fetchPendingCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const fetchPendingCount = async () => {
    const { count, error } = await supabase
      .from("access_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (!error && count !== null) {
      setPendingCount(count);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="flex items-center justify-end mb-4">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Notifications</h4>
            {pendingCount > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/20">
                    <Bell className="h-4 w-4 text-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Access Requests</p>
                    <p className="text-xs text-muted-foreground">
                      {pendingCount} pending request{pendingCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <NavLink
                  to="/admin/access-requests"
                  onClick={() => setIsOpen(false)}
                  className="block"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    Review Requests
                  </Button>
                </NavLink>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No pending notifications
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
