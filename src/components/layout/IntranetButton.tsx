import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function IntranetButton() {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();

      // Subscribe to real-time updates
      const channel = supabase
        .channel("intranet-announcements-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "intranet_announcements",
          },
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    // Get announcements from the last 7 days that the user can see
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count, error } = await supabase
      .from("intranet_announcements")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true)
      .gte("created_at", sevenDaysAgo.toISOString());

    if (!error && count !== null) {
      setUnreadCount(count);
    }
  };

  return (
    <button
      onClick={() => navigate("/intranet")}
      className="relative inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground shadow-sm transition-all hover:bg-accent"
    >
      <Newspaper className="h-4 w-4" />
      Intranet
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
