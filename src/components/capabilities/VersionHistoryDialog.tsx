import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  History,
  Clock,
  User,
  ChevronRight,
  RotateCcw,
  Eye,
  FileText,
  ArrowUpCircle,
  CheckCircle,
  Archive,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Capability } from "@/hooks/useCapabilities";
import { cn } from "@/lib/utils";

interface VersionHistoryEntry {
  id: string;
  capability_id: string;
  version: number;
  snapshot_data: Capability;
  change_type: "created" | "updated" | "status_change" | "version_bump";
  change_summary: string | null;
  changed_by: string | null;
  created_at: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capability: Capability | null;
  onRestore?: (snapshot: Capability) => Promise<void>;
}

const changeTypeConfig = {
  created: { icon: FileText, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", label: "Created" },
  updated: { icon: ArrowUpCircle, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", label: "Updated" },
  status_change: { icon: CheckCircle, color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", label: "Status Change" },
  version_bump: { icon: Archive, color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200", label: "Version Bump" },
};

export function VersionHistoryDialog({
  open,
  onOpenChange,
  capability,
  onRestore,
}: VersionHistoryDialogProps) {
  const [history, setHistory] = useState<VersionHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<VersionHistoryEntry | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (open && capability) {
      fetchHistory();
    }
  }, [open, capability?.id]);

  const fetchHistory = async () => {
    if (!capability) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("capability_version_history")
        .select(`
          *,
          profile:profiles!capability_version_history_changed_by_fkey(
            first_name,
            last_name,
            email
          )
        `)
        .eq("capability_id", capability.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching version history:", error);
        return;
      }

      setHistory((data || []) as unknown as VersionHistoryEntry[]);
    } catch (err) {
      console.error("Error in fetchHistory:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (entry: VersionHistoryEntry) => {
    if (!onRestore || !entry.snapshot_data) return;
    setRestoring(true);
    try {
      await onRestore(entry.snapshot_data);
      onOpenChange(false);
    } finally {
      setRestoring(false);
    }
  };

  const getProfileName = (entry: VersionHistoryEntry) => {
    if (!entry.profile) return "System";
    const { first_name, last_name, email } = entry.profile;
    if (first_name || last_name) {
      return `${first_name || ""} ${last_name || ""}`.trim();
    }
    return email || "Unknown User";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </DialogTitle>
          <DialogDescription>
            {capability?.name} - View and restore previous versions
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 h-[500px]">
          {/* Timeline list */}
          <div className="w-1/2 border-r pr-4">
            <ScrollArea className="h-full">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <History className="h-8 w-8 mb-2" />
                  <p className="text-sm">No version history available</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {history.map((entry, index) => {
                    const config = changeTypeConfig[entry.change_type];
                    const Icon = config.icon;
                    const isSelected = selectedEntry?.id === entry.id;
                    const isFirst = index === 0;

                    return (
                      <button
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg transition-colors",
                          isSelected
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-1.5 rounded-full mt-0.5",
                            config.color
                          )}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                v{entry.version}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {config.label}
                              </Badge>
                              {isFirst && (
                                <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {entry.change_summary || "No description"}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{format(new Date(entry.created_at), "MMM d, yyyy HH:mm")}</span>
                              <span>•</span>
                              <User className="h-3 w-3" />
                              <span className="truncate">{getProfileName(entry)}</span>
                            </div>
                          </div>
                          <ChevronRight className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            isSelected && "rotate-90"
                          )} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Detail view */}
          <div className="w-1/2 pl-2">
            {selectedEntry ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Version {selectedEntry.version} Details</h3>
                  {selectedEntry.id !== history[0]?.id && onRestore && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestore(selectedEntry)}
                            disabled={restoring}
                          >
                            {restoring ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <RotateCcw className="h-4 w-4 mr-1" />
                            )}
                            Restore
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Restore capability to this version
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                <ScrollArea className="flex-1">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase">Name</label>
                      <p className="text-sm">{selectedEntry.snapshot_data?.name || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase">Code</label>
                      <p className="text-sm font-mono">{selectedEntry.snapshot_data?.code || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase">Description</label>
                      <p className="text-sm">{selectedEntry.snapshot_data?.description || "No description"}</p>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase">Type</label>
                        <p className="text-sm">{selectedEntry.snapshot_data?.type || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase">Category</label>
                        <p className="text-sm capitalize">{selectedEntry.snapshot_data?.category || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase">Status</label>
                        <p className="text-sm capitalize">{selectedEntry.snapshot_data?.status || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase">Effective From</label>
                        <p className="text-sm">
                          {selectedEntry.snapshot_data?.effective_from
                            ? format(new Date(selectedEntry.snapshot_data.effective_from), "MMM d, yyyy")
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    {selectedEntry.snapshot_data?.effective_to && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase">Effective To</label>
                        <p className="text-sm">
                          {format(new Date(selectedEntry.snapshot_data.effective_to), "MMM d, yyyy")}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Eye className="h-8 w-8 mb-2" />
                <p className="text-sm">Select a version to view details</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
