import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface HistoryEntry {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
  changer_email?: string;
}

interface RequestHistoryTimelineProps {
  requestId: string;
}

export function RequestHistoryTimeline({ requestId }: RequestHistoryTimelineProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [requestId]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("access_request_history")
        .select("*")
        .eq("access_request_id", requestId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch profile emails for changers
      const changerIds = [...new Set((data || []).map(h => h.changed_by).filter(Boolean))];
      let emailMap: Record<string, string> = {};
      
      if (changerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", changerIds);
        
        emailMap = (profiles || []).reduce((acc, p) => {
          acc[p.id] = p.email;
          return acc;
        }, {} as Record<string, string>);
      }

      setHistory((data || []).map(h => ({
        ...h,
        changer_email: h.changed_by ? emailMap[h.changed_by] : undefined,
      })));
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "revoked":
        return <XCircle className="h-4 w-4 text-orange-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (oldStatus: string | null, newStatus: string) => {
    if (!oldStatus) {
      return "Request created";
    }
    if (newStatus === "revoked") {
      return "Access revoked";
    }
    return `Status changed from ${oldStatus} to ${newStatus}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No history available
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      {history.map((entry, index) => (
        <div key={entry.id} className="relative flex gap-3 pb-4">
          {/* Timeline line */}
          {index < history.length - 1 && (
            <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
          )}
          
          {/* Icon */}
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center z-10">
            {getStatusIcon(entry.new_status)}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">
                {getStatusLabel(entry.old_status, entry.new_status)}
              </span>
              <Badge variant="outline" className="text-xs">
                {entry.new_status}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
              {entry.changer_email && (
                <>
                  <span>•</span>
                  <span>by {entry.changer_email}</span>
                </>
              )}
            </div>
            
            {entry.notes && (
              <p className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                {entry.notes}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
