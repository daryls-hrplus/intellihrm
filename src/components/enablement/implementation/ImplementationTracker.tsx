import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pause,
  Target,
  Users,
  RefreshCw,
} from "lucide-react";
import { useModuleImplementations } from "@/hooks/useModuleImplementations";
import { ModuleImplementationCard } from "./ModuleImplementationCard";
import { AddModuleImplementationDialog } from "./AddModuleImplementationDialog";
import { ClientSelector } from "./ClientSelector";
import type { ImplementationStatus } from "@/types/implementation";

interface ImplementationTrackerProps {
  className?: string;
}

export function ImplementationTracker({ className }: ImplementationTrackerProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ImplementationStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const { 
    implementations, 
    isLoading, 
    refetch,
    startImplementation,
    completeImplementation,
    holdImplementation,
    deleteImplementation
  } = useModuleImplementations(selectedCompanyId);

  // Filter implementations
  const filteredImplementations = implementations.filter((impl) => {
    const matchesSearch = impl.module?.module_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || impl.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: implementations.length,
    notStarted: implementations.filter((i) => i.status === "not_started").length,
    inProgress: implementations.filter((i) => i.status === "in_progress").length,
    completed: implementations.filter((i) => i.status === "completed").length,
    onHold: implementations.filter((i) => i.status === "on_hold").length,
  };

  const overallProgress = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Client Implementation Tracker
          </h2>
          <p className="text-muted-foreground">
            Track module and feature implementations across client deployments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>
      </div>

      {/* Client Selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Select Client:</span>
              <div className="flex-1 max-w-sm">
                <ClientSelector
                  value={selectedCompanyId}
                  onValueChange={setSelectedCompanyId}
                />
              </div>
            </div>
            {selectedCompanyId && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Overall Progress:</span>
                  <Progress value={overallProgress} className="w-32" />
                  <span className="text-sm font-medium">{overallProgress}%</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedCompanyId ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <LayoutGrid className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Modules</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-500/10">
                    <Clock className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.notStarted}</p>
                    <p className="text-xs text-muted-foreground">Not Started</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.inProgress}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Pause className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.onHold}</p>
                    <p className="text-xs text-muted-foreground">On Hold</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Implementations List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredImplementations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Implementations Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {implementations.length === 0
                    ? "No modules have been added for this client yet."
                    : "No implementations match your search criteria."}
                </p>
                {implementations.length === 0 && (
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Module
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
              : "space-y-4"
            }>
              {filteredImplementations.map((impl) => (
                <ModuleImplementationCard
                  key={impl.id}
                  implementation={impl}
                  viewMode={viewMode}
                  onStart={() => startImplementation(impl.id)}
                  onComplete={() => completeImplementation(impl.id)}
                  onHold={() => holdImplementation(impl.id)}
                  onDelete={() => deleteImplementation(impl.id)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Select a Client</h3>
            <p className="text-muted-foreground text-center">
              Choose a client company from the dropdown above to view and manage their implementation progress.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Module Dialog */}
      <AddModuleImplementationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        companyId={selectedCompanyId}
        onSuccess={() => {
          setShowAddDialog(false);
          refetch();
        }}
      />
    </div>
  );
}
