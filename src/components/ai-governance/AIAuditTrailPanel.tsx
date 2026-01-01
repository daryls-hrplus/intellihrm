import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Bot, 
  CheckCircle, 
  XCircle, 
  Edit2,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface AuditEntry {
  id: string;
  override_action: string;
  override_reason: string;
  justification_category: string | null;
  approval_status: string;
  created_at: string;
  overridden_by: string;
  original_ai_response: any;
  modified_response: any;
  profile?: { full_name: string } | null;
}

interface AIAuditTrailPanelProps {
  companyId: string;
  limit?: number;
}

export function AIAuditTrailPanel({ companyId, limit = 10 }: AIAuditTrailPanelProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchAuditTrail();
  }, [companyId]);

  const fetchAuditTrail = async () => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from("ai_human_overrides")
        .select(`
          id,
          override_action,
          override_reason,
          justification_category,
          approval_status,
          created_at,
          overridden_by,
          original_ai_response,
          modified_response,
          profile:profiles!ai_human_overrides_overridden_by_fkey(full_name)
        `)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      setEntries((data || []) as AuditEntry[]);
    } catch (error) {
      console.error("Error fetching audit trail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "accept": return <CheckCircle className="h-4 w-4 text-success" />;
      case "reject": return <XCircle className="h-4 w-4 text-destructive" />;
      case "modify": return <Edit2 className="h-4 w-4 text-warning" />;
      default: return <Bot className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "accept": return "Accepted";
      case "reject": return "Dismissed";
      case "modify": return "Modified";
      default: return action;
    }
  };

  const displayedEntries = showAll ? entries : entries.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <History className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">AI Governance Audit Trail</CardTitle>
              <CardDescription>Human oversight actions on AI decisions</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchAuditTrail}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No audit entries yet</p>
              <p className="text-xs">Human override actions will appear here</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {displayedEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="mt-0.5">
                      {getActionIcon(entry.override_action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {getActionLabel(entry.override_action)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {entry.justification_category || "N/A"}
                        </Badge>
                        {entry.approval_status && (
                          <Badge 
                            variant={entry.approval_status === "approved" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {entry.approval_status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {entry.override_reason}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{entry.profile?.full_name || "Unknown"}</span>
                        <span>•</span>
                        <span>{formatDateForDisplay(entry.created_at, "MMM d, yyyy h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {entries.length > 5 && !showAll && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3"
              onClick={() => setShowAll(true)}
            >
              Show All ({entries.length} entries)
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
