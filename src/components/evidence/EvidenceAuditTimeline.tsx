import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  History,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Paperclip,
  FileUp,
  Eye,
  Download,
  ChevronDown,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useEvidenceAuditTrail, EvidenceAuditEntry } from "@/hooks/useEvidenceAuditTrail";
import { Json } from "@/integrations/supabase/types";

interface EvidenceAuditTimelineProps {
  employeeId: string;
  evidenceId?: string;
  limit?: number;
  showFilters?: boolean;
  compact?: boolean;
  onRefresh?: () => void;
}

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  created: { icon: <Plus className="h-3.5 w-3.5" />, label: "Created", color: "bg-green-500/10 text-green-600 border-green-200" },
  updated: { icon: <Pencil className="h-3.5 w-3.5" />, label: "Updated", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  deleted: { icon: <Trash2 className="h-3.5 w-3.5" />, label: "Deleted", color: "bg-red-500/10 text-red-600 border-red-200" },
  validated: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Validated", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  rejected: { icon: <XCircle className="h-3.5 w-3.5" />, label: "Rejected", color: "bg-red-500/10 text-red-600 border-red-200" },
  disputed: { icon: <AlertTriangle className="h-3.5 w-3.5" />, label: "Disputed", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  locked: { icon: <Lock className="h-3.5 w-3.5" />, label: "Locked", color: "bg-slate-500/10 text-slate-600 border-slate-200" },
  unlocked: { icon: <Unlock className="h-3.5 w-3.5" />, label: "Unlocked", color: "bg-slate-500/10 text-slate-600 border-slate-200" },
  attached_to_appraisal: { icon: <Paperclip className="h-3.5 w-3.5" />, label: "Attached", color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  detached_from_appraisal: { icon: <Paperclip className="h-3.5 w-3.5" />, label: "Detached", color: "bg-orange-500/10 text-orange-600 border-orange-200" },
  file_uploaded: { icon: <FileUp className="h-3.5 w-3.5" />, label: "File Uploaded", color: "bg-cyan-500/10 text-cyan-600 border-cyan-200" },
  file_replaced: { icon: <FileUp className="h-3.5 w-3.5" />, label: "File Replaced", color: "bg-cyan-500/10 text-cyan-600 border-cyan-200" },
  viewed: { icon: <Eye className="h-3.5 w-3.5" />, label: "Viewed", color: "bg-gray-500/10 text-gray-600 border-gray-200" },
  exported: { icon: <Download className="h-3.5 w-3.5" />, label: "Exported", color: "bg-indigo-500/10 text-indigo-600 border-indigo-200" },
};

export function EvidenceAuditTimeline({
  employeeId,
  evidenceId,
  limit = 50,
  showFilters = true,
  compact = false,
  onRefresh,
}: EvidenceAuditTimelineProps) {
  const { loading, fetchAuditHistory, fetchEmployeeEvidenceAudit } = useEvidenceAuditTrail();
  const [entries, setEntries] = useState<EvidenceAuditEntry[]>([]);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAuditData();
  }, [employeeId, evidenceId]);

  const loadAuditData = async () => {
    let data: EvidenceAuditEntry[];
    if (evidenceId) {
      data = await fetchAuditHistory(evidenceId);
    } else {
      data = await fetchEmployeeEvidenceAudit(employeeId, { limit });
    }
    setEntries(data);
  };

  const handleRefresh = () => {
    loadAuditData();
    onRefresh?.();
  };

  const toggleExpanded = (entryId: string) => {
    setExpandedEntries(prev => {
      const next = new Set(prev);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
  };

  const filteredEntries = actionFilter === "all"
    ? entries
    : entries.filter(e => e.action === actionFilter);

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'SY';
  };

  const renderChanges = (entry: EvidenceAuditEntry) => {
    if (!entry.old_values && !entry.new_values) return null;

    const changes: { field: string; oldVal: unknown; newVal: unknown }[] = [];
    
    const oldObj = entry.old_values && typeof entry.old_values === 'object' && !Array.isArray(entry.old_values) 
      ? entry.old_values as Record<string, Json>
      : null;
    const newObj = entry.new_values && typeof entry.new_values === 'object' && !Array.isArray(entry.new_values)
      ? entry.new_values as Record<string, Json>
      : null;
    
    if (oldObj && newObj) {
      const allKeys = new Set([
        ...Object.keys(oldObj),
        ...Object.keys(newObj),
      ]);
      
      allKeys.forEach(key => {
        const oldVal = oldObj[key];
        const newVal = newObj[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          changes.push({ field: key, oldVal, newVal });
        }
      });
    } else if (newObj) {
      Object.entries(newObj).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          changes.push({ field: key, oldVal: undefined, newVal: value });
        }
      });
    }

    if (changes.length === 0) return null;

    const relevantFields = ['title', 'description', 'validation_status', 'validation_notes', 'evidence_type'];
    const displayChanges = changes.filter(c => relevantFields.includes(c.field));
    
    if (displayChanges.length === 0) return null;

    return (
      <div className="mt-2 space-y-1 text-xs">
        {displayChanges.map(({ field, oldVal, newVal }) => (
          <div key={field} className="flex items-start gap-2">
            <span className="font-medium text-muted-foreground capitalize min-w-[80px]">
              {field.replace(/_/g, ' ')}:
            </span>
            <div className="flex-1">
              {oldVal !== undefined && (
                <span className="line-through text-red-500/70 mr-2">
                  {String(oldVal).slice(0, 50)}
                </span>
              )}
              <span className="text-green-600">
                {String(newVal).slice(0, 100)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading && entries.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Evidence Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Evidence Audit Trail
          </CardTitle>
          <div className="flex items-center gap-2">
            {showFilters && (
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No audit history available</p>
          </div>
        ) : (
          <ScrollArea className={compact ? "h-[300px]" : "h-[400px]"}>
            <div className="relative space-y-0">
              {/* Timeline line */}
              <div className="absolute left-4 top-4 bottom-4 w-px bg-border" />
              
              {filteredEntries.map((entry, index) => {
                const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.updated;
                const isExpanded = expandedEntries.has(entry.id);
                const hasDetails = entry.old_values || entry.new_values || entry.change_reason || entry.item_name;

                return (
                  <div key={entry.id} className="relative pl-10 pb-4">
                    {/* Timeline dot */}
                    <div className="absolute left-2 top-2 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>

                    <Collapsible open={isExpanded} onOpenChange={() => hasDetails && toggleExpanded(entry.id)}>
                      <div
                        className={`p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors ${
                          hasDetails ? 'cursor-pointer' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px] bg-primary/10">
                                {getInitials(entry.performer_name, entry.performer_email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config.color}`}>
                                  {config.icon}
                                  <span className="ml-1">{config.label}</span>
                                </Badge>
                                {entry.item_name && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    on "{entry.item_name}"
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {entry.performer_name || entry.performer_email || 'System'} •{' '}
                                {formatDistanceToNow(new Date(entry.performed_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {format(new Date(entry.performed_at), 'MMM d, HH:mm')}
                            </span>
                            {hasDetails && (
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                  {isExpanded ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            )}
                          </div>
                        </div>

                        <CollapsibleContent>
                          <div className="mt-3 pt-3 border-t border-dashed space-y-2">
                            {entry.change_reason && (
                              <div className="text-xs">
                                <span className="font-medium text-muted-foreground">Reason: </span>
                                <span>{entry.change_reason}</span>
                              </div>
                            )}
                            {entry.item_type && (
                              <div className="text-xs">
                                <span className="font-medium text-muted-foreground">Item Type: </span>
                                <Badge variant="secondary" className="text-[10px]">
                                  {entry.item_type}
                                </Badge>
                              </div>
                            )}
                            {renderChanges(entry)}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
