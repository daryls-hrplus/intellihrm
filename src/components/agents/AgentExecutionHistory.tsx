import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  History, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Loader2,
  ChevronRight,
  Bot,
  Zap,
  DollarSign
} from "lucide-react";
import { AgentExecution, AIAgent } from "@/hooks/useAgentRegistry";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, formatDistanceToNow } from "date-fns";

interface AgentExecutionHistoryProps {
  executions: AgentExecution[];
  agents: AIAgent[];
  isLoading: boolean;
  onRefresh: () => void;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  completed: { color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle2 },
  failed: { color: "bg-red-500/10 text-red-600 border-red-500/20", icon: XCircle },
  pending: { color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  running: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Loader2 }
};

export function AgentExecutionHistory({
  executions,
  agents,
  isLoading,
  onRefresh
}: AgentExecutionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedExecution, setSelectedExecution] = useState<AgentExecution | null>(null);

  const filteredExecutions = executions.filter(exec => {
    const agentName = exec.agent?.agent_name || "";
    const matchesSearch = 
      exec.execution_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exec.trigger_source?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAgent = agentFilter === "all" || exec.agent_id === agentFilter;
    const matchesStatus = statusFilter === "all" || exec.status === statusFilter;

    return matchesSearch && matchesAgent && matchesStatus;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Execution History
              </CardTitle>
              <CardDescription>
                {executions.length} executions recorded
              </CardDescription>
            </div>
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search executions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.agent_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="running">Running</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Execution ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead className="text-right">Latency</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExecutions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No executions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExecutions.map((exec) => {
                    const statusInfo = statusConfig[exec.status] || statusConfig.pending;
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <TableRow 
                        key={exec.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedExecution(exec)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {exec.agent?.agent_name || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs text-muted-foreground">
                            {exec.execution_id.slice(0, 12)}...
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusInfo.color}>
                            <StatusIcon className={`h-3 w-3 mr-1 ${exec.status === "running" ? "animate-spin" : ""}`} />
                            {exec.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {exec.trigger_type || "manual"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {exec.latency_ms ? `${exec.latency_ms}ms` : "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {exec.tokens_used || 0}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          ${(Number(exec.estimated_cost_usd) || 0).toFixed(6)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(exec.started_at), { addSuffix: true })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Execution Details Dialog */}
      <Dialog open={!!selectedExecution} onOpenChange={() => setSelectedExecution(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Execution Details
            </DialogTitle>
            <DialogDescription>
              {selectedExecution?.execution_id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedExecution && (
            <div className="space-y-4">
              {/* Status & Timing */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge 
                    variant="outline" 
                    className={statusConfig[selectedExecution.status]?.color}
                  >
                    {selectedExecution.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Started</span>
                  <p className="text-sm font-medium">
                    {format(new Date(selectedExecution.started_at), "PPp")}
                  </p>
                </div>
                {selectedExecution.completed_at && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedExecution.completed_at), "PPp")}
                    </p>
                  </div>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-bold">
                    {selectedExecution.latency_ms || 0}ms
                  </p>
                  <span className="text-xs text-muted-foreground">Latency</span>
                </div>
                <div className="text-center">
                  <Zap className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-bold">
                    {selectedExecution.tokens_used || 0}
                  </p>
                  <span className="text-xs text-muted-foreground">Tokens</span>
                </div>
                <div className="text-center">
                  <DollarSign className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-bold">
                    ${(Number(selectedExecution.estimated_cost_usd) || 0).toFixed(6)}
                  </p>
                  <span className="text-xs text-muted-foreground">Cost</span>
                </div>
              </div>

              {/* Error */}
              {selectedExecution.error_message && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h4 className="text-sm font-medium text-destructive mb-2">Error</h4>
                  <code className="text-xs text-destructive/80">
                    {selectedExecution.error_message}
                  </code>
                </div>
              )}

              {/* Input/Output */}
              {(selectedExecution.input_data || selectedExecution.output_data) && (
                <div className="space-y-3">
                  {selectedExecution.input_data && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Input</h4>
                      <ScrollArea className="h-32">
                        <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                          {JSON.stringify(selectedExecution.input_data, null, 2)}
                        </pre>
                      </ScrollArea>
                    </div>
                  )}
                  {selectedExecution.output_data && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Output</h4>
                      <ScrollArea className="h-32">
                        <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                          {JSON.stringify(selectedExecution.output_data, null, 2)}
                        </pre>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
