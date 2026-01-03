import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Bot, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Zap,
  ExternalLink
} from "lucide-react";
import { AIAgent } from "@/hooks/useAgentRegistry";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AgentRegistryTableProps {
  agents: AIAgent[];
  isLoading: boolean;
  onSelectAgent: (agent: AIAgent) => void;
  selectedAgentId?: string;
  onToggleEnabled: (agentId: string, isEnabled: boolean) => void;
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-600 border-green-500/20",
  inactive: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  error: "bg-red-500/10 text-red-600 border-red-500/20",
  maintenance: "bg-amber-500/10 text-amber-600 border-amber-500/20"
};

const categoryColors: Record<string, string> = {
  performance: "bg-blue-500/10 text-blue-600",
  assistant: "bg-purple-500/10 text-purple-600",
  organization: "bg-teal-500/10 text-teal-600",
  utility: "bg-gray-500/10 text-gray-600",
  workforce: "bg-orange-500/10 text-orange-600",
  learning: "bg-emerald-500/10 text-emerald-600",
  content: "bg-pink-500/10 text-pink-600",
  orchestration: "bg-indigo-500/10 text-indigo-600",
  governance: "bg-red-500/10 text-red-600",
  enablement: "bg-cyan-500/10 text-cyan-600",
  general: "bg-slate-500/10 text-slate-600"
};

export function AgentRegistryTable({
  agents,
  isLoading,
  onSelectAgent,
  selectedAgentId,
  onToggleEnabled
}: AgentRegistryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const categories = [...new Set(agents.map(a => a.category))];

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.agent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.agent_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || agent.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || agent.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
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
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Agent Registry
        </CardTitle>
        <CardDescription>
          {agents.length} registered agents across {categories.length} categories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat} className="capitalize">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Capabilities</TableHead>
                <TableHead className="text-center">Enabled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No agents found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgents.map((agent) => (
                  <TableRow 
                    key={agent.id}
                    className={`cursor-pointer transition-colors ${
                      selectedAgentId === agent.id 
                        ? "bg-primary/5 border-l-2 border-l-primary" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => onSelectAgent(agent)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{agent.agent_name}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {agent.agent_code}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`capitalize ${categoryColors[agent.category] || categoryColors.general}`}
                      >
                        {agent.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={statusColors[agent.status] || statusColors.inactive}
                      >
                        {agent.status === "active" ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(agent.capabilities || []).slice(0, 2).map((cap, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                        {(agent.capabilities || []).length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{agent.capabilities.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={agent.is_enabled || false}
                        onCheckedChange={(checked) => {
                          event?.stopPropagation();
                          onToggleEnabled(agent.id, checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAgent(agent);
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
