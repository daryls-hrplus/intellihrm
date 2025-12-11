import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { History, Search, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface HistoryEntry {
  id: string;
  employee_position_id: string | null;
  employee_id: string;
  position_id: string;
  action: string;
  old_values: any;
  new_values: any;
  changed_by: string | null;
  created_at: string;
  employee: {
    full_name: string | null;
    email: string;
  } | null;
  position: {
    title: string;
    code: string;
  } | null;
  changed_by_profile: {
    full_name: string | null;
    email: string;
  } | null;
}

interface AssignmentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId?: string;
  employeeName?: string;
}

export function AssignmentHistoryDialog({
  open,
  onOpenChange,
  employeeId,
  employeeName,
}: AssignmentHistoryDialogProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open, employeeId]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("employee_position_history")
        .select(`
          *,
          employee:profiles!employee_position_history_employee_id_fkey(full_name, email),
          position:positions(title, code)
        `)
        .order("created_at", { ascending: false })
        .limit(200);

      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch changed_by profiles separately
      const changedByIds = [...new Set((data || []).map(d => d.changed_by).filter(Boolean))];
      let changedByProfiles: Record<string, { full_name: string | null; email: string }> = {};
      
      if (changedByIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", changedByIds);
        
        if (profiles) {
          changedByProfiles = profiles.reduce((acc, p) => {
            acc[p.id] = { full_name: p.full_name, email: p.email };
            return acc;
          }, {} as Record<string, { full_name: string | null; email: string }>);
        }
      }

      const enrichedData = (data || []).map(entry => ({
        ...entry,
        changed_by_profile: entry.changed_by ? changedByProfiles[entry.changed_by] || null : null
      }));

      setHistory(enrichedData as HistoryEntry[]);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "created":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Created</Badge>;
      case "updated":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Updated</Badge>;
      case "ended":
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">Ended</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const getChangeDescription = (entry: HistoryEntry) => {
    if (entry.action === "created") {
      return "Position assigned";
    }
    if (entry.action === "ended") {
      return "Position ended";
    }
    if (!entry.old_values || !entry.new_values) return "Updated";

    const changes: string[] = [];
    
    if (entry.old_values.position_id !== entry.new_values.position_id) {
      changes.push("Position changed");
    }
    if (entry.old_values.is_primary !== entry.new_values.is_primary) {
      changes.push(entry.new_values.is_primary ? "Made primary" : "No longer primary");
    }
    if (entry.old_values.compensation_amount !== entry.new_values.compensation_amount) {
      const oldAmt = entry.old_values.compensation_amount || 0;
      const newAmt = entry.new_values.compensation_amount || 0;
      changes.push(`Compensation: ${oldAmt} → ${newAmt}`);
    }
    if (entry.old_values.is_active !== entry.new_values.is_active) {
      changes.push(entry.new_values.is_active ? "Reactivated" : "Deactivated");
    }

    return changes.length > 0 ? changes.join(", ") : "Updated";
  };

  const filteredHistory = history.filter((entry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.employee?.full_name?.toLowerCase().includes(query) ||
      entry.employee?.email?.toLowerCase().includes(query) ||
      entry.position?.title?.toLowerCase().includes(query) ||
      entry.action.toLowerCase().includes(query)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {employeeName ? `Assignment History: ${employeeName}` : "Assignment History"}
          </DialogTitle>
          <DialogDescription>
            Track all position changes and updates over time
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* History Table */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No history records found
            </div>
          ) : (
            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Changed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(entry.created_at), "MMM d, yyyy")}
                        <br />
                        <span className="text-xs">
                          {format(new Date(entry.created_at), "HH:mm")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {entry.employee?.full_name || "Unknown"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {entry.employee?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(entry.action)}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {entry.position?.title || "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {entry.position?.code}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px]">
                        {getChangeDescription(entry)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.changed_by_profile?.full_name || 
                         entry.changed_by_profile?.email || 
                         "System"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
