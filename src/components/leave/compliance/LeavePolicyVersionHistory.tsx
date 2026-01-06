import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { History, Search, Eye, GitCommit, ArrowRight, FileText, Download } from "lucide-react";

interface LeavePolicyVersionHistoryProps {
  companyId: string;
}

interface PolicyVersion {
  id: string;
  policy_type: string;
  policy_id: string;
  version_number: number;
  policy_name: string;
  policy_data: Record<string, unknown>;
  change_summary: string | null;
  change_type: string;
  effective_from: string | null;
  effective_to: string | null;
  changed_by: string | null;
  changed_at: string;
  approved_by: string | null;
  approved_at: string | null;
  profiles?: { full_name: string };
}

const CHANGE_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  created: { label: "Created", color: "bg-green-500/10 text-green-600" },
  updated: { label: "Updated", color: "bg-blue-500/10 text-blue-600" },
  activated: { label: "Activated", color: "bg-emerald-500/10 text-emerald-600" },
  deactivated: { label: "Deactivated", color: "bg-gray-500/10 text-gray-600" },
  deleted: { label: "Deleted", color: "bg-red-500/10 text-red-600" },
};

const POLICY_TYPE_LABELS: Record<string, string> = {
  leave_type: "Leave Type",
  accrual_rule: "Accrual Rule",
  rollover_rule: "Rollover Rule",
  blackout_period: "Blackout Period",
  conflict_rule: "Conflict Rule",
  encashment_policy: "Encashment Policy",
};

export function LeavePolicyVersionHistory({ companyId }: LeavePolicyVersionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPolicyType, setFilterPolicyType] = useState<string>("all");
  const [filterChangeType, setFilterChangeType] = useState<string>("all");
  const [selectedVersion, setSelectedVersion] = useState<PolicyVersion | null>(null);
  const [compareVersions, setCompareVersions] = useState<{
    v1: PolicyVersion | null;
    v2: PolicyVersion | null;
  }>({ v1: null, v2: null });

  // Fetch versions
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ["policy-versions", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leave_policy_versions")
        .select(`*, profiles!leave_policy_versions_changed_by_fkey(full_name)`)
        .eq("company_id", companyId)
        .order("changed_at", { ascending: false });
      if (error) throw error;
      return data as PolicyVersion[];
    },
    enabled: !!companyId,
  });

  // Group versions by policy
  const groupedVersions = versions.reduce((acc, version) => {
    const key = `${version.policy_type}-${version.policy_id}`;
    if (!acc[key]) {
      acc[key] = {
        policy_name: version.policy_name,
        policy_type: version.policy_type,
        versions: [],
      };
    }
    acc[key].versions.push(version);
    return acc;
  }, {} as Record<string, { policy_name: string; policy_type: string; versions: PolicyVersion[] }>);

  const filteredVersions = versions.filter((version) => {
    const matchesSearch =
      version.policy_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      version.change_summary?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPolicyType = filterPolicyType === "all" || version.policy_type === filterPolicyType;
    const matchesChangeType = filterChangeType === "all" || version.change_type === filterChangeType;
    return matchesSearch && matchesPolicyType && matchesChangeType;
  });

  // Stats
  const totalChanges = versions.length;
  const uniquePolicies = new Set(versions.map((v) => `${v.policy_type}-${v.policy_id}`)).size;
  const recentChanges = versions.filter((v) => {
    const changedAt = new Date(v.changed_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return changedAt >= weekAgo;
  }).length;

  const renderPolicyData = (data: Record<string, unknown>) => {
    return Object.entries(data).map(([key, value]) => (
      <div key={key} className="flex justify-between py-1 border-b last:border-0">
        <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
        <span className="font-medium">
          {typeof value === "object" ? JSON.stringify(value) : String(value)}
        </span>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Changes</p>
                <p className="text-2xl font-bold">{totalChanges}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Policies Tracked</p>
                <p className="text-2xl font-bold">{uniquePolicies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <GitCommit className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{recentChanges}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Download className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Export</p>
                <Button variant="link" className="p-0 h-auto text-primary">
                  Download Audit Log
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Policy Version History</CardTitle>
          <CardDescription>Complete audit trail of all leave policy changes</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search policies or changes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterPolicyType} onValueChange={setFilterPolicyType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Policy Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Policy Types</SelectItem>
                <SelectItem value="leave_type">Leave Types</SelectItem>
                <SelectItem value="accrual_rule">Accrual Rules</SelectItem>
                <SelectItem value="rollover_rule">Rollover Rules</SelectItem>
                <SelectItem value="blackout_period">Blackout Periods</SelectItem>
                <SelectItem value="conflict_rule">Conflict Rules</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterChangeType} onValueChange={setFilterChangeType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Changes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Changes</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="activated">Activated</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timeline Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Policy</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Changed By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredVersions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No version history found. Changes to leave policies will appear here.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVersions.map((version, index) => {
                    const changeConfig = CHANGE_TYPE_CONFIG[version.change_type] || CHANGE_TYPE_CONFIG.updated;
                    const isLatest = index === 0 || 
                      versions.find((v) => v.policy_id === version.policy_id && v.version_number > version.version_number) === undefined;
                    
                    return (
                      <TableRow key={version.id}>
                        <TableCell>
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${changeConfig.color.replace("text-", "bg-").replace("/10", "")}`} />
                            {index < filteredVersions.length - 1 && (
                              <div className="w-0.5 h-8 bg-border mt-1" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{version.policy_name}</p>
                            {version.change_summary && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {version.change_summary}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {POLICY_TYPE_LABELS[version.policy_type] || version.policy_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={changeConfig.color}>
                            {changeConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-mono">v{version.version_number}</span>
                            {isLatest && (
                              <Badge variant="secondary" className="text-xs">Latest</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {version.profiles?.full_name || "System"}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{format(new Date(version.changed_at), "PP")}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(version.changed_at), "p")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedVersion(version)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Grouped by Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Version History by Policy</CardTitle>
          <CardDescription>View all versions for each policy</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedVersions).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No policies tracked yet
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(groupedVersions).map(([key, group]) => (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4" />
                      <span>{group.policy_name}</span>
                      <Badge variant="outline" className="ml-2">
                        {POLICY_TYPE_LABELS[group.policy_type] || group.policy_type}
                      </Badge>
                      <Badge variant="secondary">{group.versions.length} versions</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-4">
                      {group.versions.map((version, idx) => {
                        const changeConfig = CHANGE_TYPE_CONFIG[version.change_type] || CHANGE_TYPE_CONFIG.updated;
                        return (
                          <div
                            key={version.id}
                            className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                            onClick={() => setSelectedVersion(version)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm">v{version.version_number}</span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <Badge className={`${changeConfig.color} text-xs`}>
                                {changeConfig.label}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                by {version.profiles?.full_name || "System"}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(version.changed_at), "PPp")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Version Detail Dialog */}
      <Dialog open={!!selectedVersion} onOpenChange={() => setSelectedVersion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Policy Version Details</DialogTitle>
          </DialogHeader>
          {selectedVersion && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Policy Name</p>
                    <p className="font-medium">{selectedVersion.policy_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="font-mono">v{selectedVersion.version_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Policy Type</p>
                    <Badge variant="outline">
                      {POLICY_TYPE_LABELS[selectedVersion.policy_type] || selectedVersion.policy_type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Change Type</p>
                    <Badge className={CHANGE_TYPE_CONFIG[selectedVersion.change_type]?.color}>
                      {CHANGE_TYPE_CONFIG[selectedVersion.change_type]?.label || selectedVersion.change_type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Changed By</p>
                    <p>{selectedVersion.profiles?.full_name || "System"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Changed At</p>
                    <p>{format(new Date(selectedVersion.changed_at), "PPpp")}</p>
                  </div>
                </div>

                {selectedVersion.change_summary && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Change Summary</p>
                    <p className="bg-muted p-2 rounded text-sm">{selectedVersion.change_summary}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Policy Configuration (Snapshot)</p>
                  <div className="bg-muted p-3 rounded text-sm">
                    {renderPolicyData(selectedVersion.policy_data)}
                  </div>
                </div>

                {selectedVersion.effective_from && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Effective From</p>
                      <p>{format(new Date(selectedVersion.effective_from), "PP")}</p>
                    </div>
                    {selectedVersion.effective_to && (
                      <div>
                        <p className="text-sm text-muted-foreground">Effective To</p>
                        <p>{format(new Date(selectedVersion.effective_to), "PP")}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
