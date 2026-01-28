import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FileWarning,
  RefreshCw,
  Loader2,
  Search,
  Download,
  Archive,
  Trash2,
  Filter,
  BarChart3,
  FolderTree,
  Copy,
  AlertTriangle,
  GitMerge,
  Database,
  Plus,
  CheckCircle
} from "lucide-react";
import { useOrphanDetection } from "@/hooks/useOrphanDetection";
import { useOrphanActions } from "@/hooks/useOrphanActions";
import { OrphanEntry, OrphanSource, OrphanRecommendation, OrphanDuplicate } from "@/types/orphanTypes";
import { OrphanModuleAccordion } from "./OrphanModuleAccordion";
import { OrphanDuplicatesPanel } from "./OrphanDuplicatesPanel";
import { OrphanActionDialog } from "./OrphanActionDialog";
import { KeepActionDialog } from "./KeepActionDialog";
import { KeptEntriesPanel } from "./KeptEntriesPanel";
import { DuplicateDetailDialog } from "./DuplicateDetailDialog";
import { PrefixedVariantsPanel } from "./PrefixedVariantsPanel";
import { RegistryCandidatesPanel } from "./RegistryCandidatesPanel";
import { MigrationBatchesPanel } from "./MigrationBatchesPanel";
import { cn } from "@/lib/utils";

export function OrphanManagementPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [recommendationFilter, setRecommendationFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedOrphans, setSelectedOrphans] = useState<Set<string>>(new Set());
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'archive' | 'delete' | 'archive_bulk' | 'delete_bulk';
    orphan?: OrphanEntry;
    count?: number;
  }>({ open: false, type: 'archive' });
  const [keepDialog, setKeepDialog] = useState<{
    open: boolean;
    orphan?: OrphanEntry;
    count?: number;
  }>({ open: false });
  const [duplicateDialog, setDuplicateDialog] = useState<{
    open: boolean;
    duplicate: OrphanDuplicate | null;
  }>({ open: false, duplicate: null });

  const {
    isLoading,
    orphans,
    keptEntries,
    stats,
    duplicates,
    routeConflicts,
    totalDbFeatures,
    prefixedVariants,
    migrationBatches,
    registryCandidates,
    error,
    detectOrphans,
    getOrphansByModule,
    codeRouteCount
  } = useOrphanDetection();

  const {
    isProcessing,
    archiveOrphan,
    deleteOrphan,
    markAsKept,
    archiveMultiple,
    deleteMultiple,
    markMultipleAsKept,
    undoKeep,
    exportToCsv
  } = useOrphanActions();

  // Initial detection on mount
  useEffect(() => {
    detectOrphans();
  }, []);

  // Get unique modules for filter
  const modules = useMemo(() => {
    const moduleSet = new Set(orphans.map(o => o.moduleCode || 'unassigned'));
    return Array.from(moduleSet).sort();
  }, [orphans]);

  // Filter orphans
  const filteredOrphans = useMemo(() => {
    return orphans.filter(orphan => {
      const matchesSearch = 
        orphan.featureCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        orphan.featureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (orphan.routePath?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      const matchesModule = moduleFilter === "all" || orphan.moduleCode === moduleFilter;
      const matchesSource = sourceFilter === "all" || orphan.source === sourceFilter;
      const matchesRecommendation = recommendationFilter === "all" || orphan.recommendation === recommendationFilter;

      return matchesSearch && matchesModule && matchesSource && matchesRecommendation;
    });
  }, [orphans, searchQuery, moduleFilter, sourceFilter, recommendationFilter]);

  // Group by module for accordion view
  const moduleGroups = useMemo(() => getOrphansByModule(), [getOrphansByModule]);

  // Handle bulk selection
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedOrphans);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedOrphans(newSelection);
  };

  const selectAll = () => {
    setSelectedOrphans(new Set(filteredOrphans.map(o => o.id)));
  };

  const clearSelection = () => {
    setSelectedOrphans(new Set());
  };

  // Handle actions
  const handleArchive = async (orphan: OrphanEntry) => {
    await archiveOrphan(orphan.id);
    detectOrphans();
  };

  const handleDelete = async (orphan: OrphanEntry) => {
    await deleteOrphan(orphan.id);
    detectOrphans();
  };

  const handleBulkArchive = async () => {
    await archiveMultiple(Array.from(selectedOrphans));
    setSelectedOrphans(new Set());
    detectOrphans();
  };

  const handleBulkDelete = async () => {
    await deleteMultiple(Array.from(selectedOrphans));
    setSelectedOrphans(new Set());
    detectOrphans();
  };

  const handleKeep = async (orphan: OrphanEntry, notes?: string) => {
    await markAsKept(orphan.id, notes);
    detectOrphans();
  };

  const handleBulkKeep = async (notes?: string) => {
    await markMultipleAsKept(Array.from(selectedOrphans), notes);
    setSelectedOrphans(new Set());
    detectOrphans();
  };

  const handleUndoKeep = async (orphanId: string) => {
    await undoKeep(orphanId);
    detectOrphans();
  };

  const handleExport = () => {
    exportToCsv(filteredOrphans);
  };

  const getRecommendationBadge = (recommendation: OrphanRecommendation) => {
    const variants: Record<OrphanRecommendation, { className: string; label: string }> = {
      keep_as_planned: { className: "bg-green-50 text-green-700 border-green-200", label: "Keep" },
      archive: { className: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Archive" },
      delete: { className: "bg-red-50 text-red-700 border-red-200", label: "Delete" },
      merge: { className: "bg-blue-50 text-blue-700 border-blue-200", label: "Merge" },
      review: { className: "bg-gray-50 text-gray-700 border-gray-200", label: "Review" }
    };
    const variant = variants[recommendation];
    return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
  };

  const getSourceBadge = (source: OrphanSource) => {
    const variants: Record<OrphanSource, { className: string; label: string }> = {
      auto_migration: { className: "bg-purple-50 text-purple-700", label: "Auto-migrated" },
      manual_entry: { className: "bg-blue-50 text-blue-700", label: "Manual" },
      registry: { className: "bg-green-50 text-green-700", label: "Registry" },
      unknown: { className: "bg-gray-50 text-gray-700", label: "Unknown" }
    };
    const variant = variants[source];
    return <Badge variant="secondary" className={variant.className}>{variant.label}</Badge>;
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Detecting Orphans</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards - Row 1: Core Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              DB Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{totalDbFeatures}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Registry Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-green-600">{codeRouteCount}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Synced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-emerald-600">
              {totalDbFeatures - (stats?.total ?? 0)}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orphans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-destructive">{stats?.total ?? 0}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prefixed Variants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-blue-600">{prefixedVariants.length}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-purple-600">{registryCandidates.length}</span>
          </CardContent>
        </Card>
      </div>

      {/* Recommendation Summary */}
      {stats && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">AI Recommendations Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Keep: {stats.byRecommendation.keep_as_planned}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Archive: {stats.byRecommendation.archive}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Delete: {stats.byRecommendation.delete}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Merge: {stats.byRecommendation.merge}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  Review: {stats.byRecommendation.review}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search feature codes, names, routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {modules.map(m => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="auto_migration">Auto-migrated</SelectItem>
            <SelectItem value="manual_entry">Manual</SelectItem>
            <SelectItem value="registry">Registry</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>

        <Select value={recommendationFilter} onValueChange={setRecommendationFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Recommendation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="keep_as_planned">Keep</SelectItem>
            <SelectItem value="archive">Archive</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="merge">Merge</SelectItem>
            <SelectItem value="review">Review</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => detectOrphans()} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>

        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedOrphans.size > 0 && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>{selectedOrphans.size} orphan(s) selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={clearSelection}>
                Clear
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => setKeepDialog({ open: true, count: selectedOrphans.size })}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Keep Selected
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setActionDialog({ open: true, type: 'archive_bulk', count: selectedOrphans.size })}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive Selected
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => setActionDialog({ open: true, type: 'delete_bulk', count: selectedOrphans.size })}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="summary" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="by-module" className="gap-2">
            <FolderTree className="h-4 w-4" />
            By Module
          </TabsTrigger>
          <TabsTrigger value="duplicates" className="gap-2">
            <Copy className="h-4 w-4" />
            Duplicates ({duplicates.length})
          </TabsTrigger>
          <TabsTrigger value="prefixed-variants" className="gap-2">
            <GitMerge className="h-4 w-4" />
            Prefixed Variants ({prefixedVariants.length})
          </TabsTrigger>
          <TabsTrigger value="migration-batches" className="gap-2">
            <Database className="h-4 w-4" />
            Batches ({migrationBatches.length})
          </TabsTrigger>
          <TabsTrigger value="registry-candidates" className="gap-2">
            <Plus className="h-4 w-4" />
            Candidates ({registryCandidates.length})
          </TabsTrigger>
          <TabsTrigger value="kept" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Kept ({keptEntries.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <FileWarning className="h-4 w-4" />
            All ({filteredOrphans.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Source Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>By Source</CardTitle>
                <CardDescription>How orphans were created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats && Object.entries(stats.bySource).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      {getSourceBadge(source as OrphanSource)}
                      <span className="font-medium">{count as number}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Modules */}
            <Card>
              <CardHeader>
                <CardTitle>Top Modules by Orphan Count</CardTitle>
                <CardDescription>Modules with most orphaned entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {moduleGroups.slice(0, 5).map(group => (
                    <div key={group.moduleCode} className="flex items-center justify-between">
                      <Badge variant="outline">{group.moduleName}</Badge>
                      <span className="font-medium">{group.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by-module" className="mt-6">
          <OrphanModuleAccordion
            moduleGroups={moduleGroups}
            selectedOrphans={selectedOrphans}
            onToggleSelection={toggleSelection}
            onArchive={(orphan) => setActionDialog({ open: true, type: 'archive', orphan })}
            onDelete={(orphan) => setActionDialog({ open: true, type: 'delete', orphan })}
            onKeep={(orphan) => setKeepDialog({ open: true, orphan })}
            onViewDuplicate={(duplicate) => setDuplicateDialog({ open: true, duplicate })}
            duplicates={duplicates}
            getRecommendationBadge={getRecommendationBadge}
            getSourceBadge={getSourceBadge}
          />
        </TabsContent>

        <TabsContent value="duplicates" className="mt-6">
          <OrphanDuplicatesPanel
            duplicates={duplicates}
            routeConflicts={routeConflicts}
            onArchive={(orphan) => setActionDialog({ open: true, type: 'archive', orphan })}
            onDelete={(orphan) => setActionDialog({ open: true, type: 'delete', orphan })}
            onKeep={(orphan) => setKeepDialog({ open: true, orphan })}
            onViewDuplicate={(duplicate) => setDuplicateDialog({ open: true, duplicate })}
          />
        </TabsContent>

        <TabsContent value="prefixed-variants" className="mt-6">
          <PrefixedVariantsPanel
            prefixedVariants={prefixedVariants}
            onArchive={(orphan) => setActionDialog({ open: true, type: 'archive', orphan })}
            onDelete={(orphan) => setActionDialog({ open: true, type: 'delete', orphan })}
            onKeep={(orphan) => setKeepDialog({ open: true, orphan })}
          />
        </TabsContent>

        <TabsContent value="migration-batches" className="mt-6">
          <MigrationBatchesPanel
            batches={migrationBatches}
            orphans={orphans}
            onArchiveBatch={async (codes) => {
              const ids = orphans.filter(o => codes.includes(o.featureCode)).map(o => o.id);
              if (ids.length > 0) {
                await archiveMultiple(ids);
                detectOrphans();
              }
            }}
            onKeepBatch={async (codes) => {
              const ids = orphans.filter(o => codes.includes(o.featureCode)).map(o => o.id);
              if (ids.length > 0) {
                await markMultipleAsKept(ids);
                detectOrphans();
              }
            }}
          />
        </TabsContent>

        <TabsContent value="registry-candidates" className="mt-6">
          <RegistryCandidatesPanel candidates={registryCandidates} />
        </TabsContent>

        <TabsContent value="kept" className="mt-6">
          <KeptEntriesPanel
            keptEntries={keptEntries}
            onUndoKeep={handleUndoKeep}
            isProcessing={isProcessing}
          />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Orphaned Entries</CardTitle>
                <CardDescription>
                  {filteredOrphans.length} orphan(s) matching filters
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {filteredOrphans.map(orphan => (
                    <div 
                      key={orphan.id}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg border",
                        selectedOrphans.has(orphan.id) && "bg-muted"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedOrphans.has(orphan.id)}
                        onChange={() => toggleSelection(orphan.id)}
                        className="h-4 w-4"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-medium truncate">
                            {orphan.featureCode}
                          </span>
                          {getSourceBadge(orphan.source)}
                          {getRecommendationBadge(orphan.recommendation)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {orphan.featureName}
                        </p>
                        {orphan.routePath && (
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            {orphan.routePath}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 italic whitespace-normal">
                          {orphan.recommendationReason}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setKeepDialog({ open: true, orphan })}
                          disabled={isProcessing}
                          title="Mark as reviewed and keep"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setActionDialog({ open: true, type: 'archive', orphan })}
                          disabled={isProcessing}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setActionDialog({ open: true, type: 'delete', orphan })}
                          disabled={isProcessing}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Confirmation Dialog */}
      <OrphanActionDialog
        open={actionDialog.open}
        type={actionDialog.type}
        orphan={actionDialog.orphan}
        count={actionDialog.count}
        isProcessing={isProcessing}
        onConfirm={async () => {
          if (actionDialog.type === 'archive' && actionDialog.orphan) {
            await handleArchive(actionDialog.orphan);
          } else if (actionDialog.type === 'delete' && actionDialog.orphan) {
            await handleDelete(actionDialog.orphan);
          } else if (actionDialog.type === 'archive_bulk') {
            await handleBulkArchive();
          } else if (actionDialog.type === 'delete_bulk') {
            await handleBulkDelete();
          }
          setActionDialog({ open: false, type: 'archive' });
        }}
        onCancel={() => setActionDialog({ open: false, type: 'archive' })}
      />

      {/* Duplicate Detail Dialog */}
      <DuplicateDetailDialog
        open={duplicateDialog.open}
        onOpenChange={(open) => setDuplicateDialog({ open, duplicate: duplicateDialog.duplicate })}
        duplicate={duplicateDialog.duplicate}
        onArchive={(orphan) => {
          setDuplicateDialog({ open: false, duplicate: null });
          setActionDialog({ open: true, type: 'archive', orphan });
        }}
        onDelete={(orphan) => {
          setDuplicateDialog({ open: false, duplicate: null });
          setActionDialog({ open: true, type: 'delete', orphan });
        }}
      />

      {/* Keep Action Dialog */}
      <KeepActionDialog
        open={keepDialog.open}
        orphan={keepDialog.orphan}
        count={keepDialog.count}
        isProcessing={isProcessing}
        onConfirm={async (notes) => {
          if (keepDialog.orphan) {
            await handleKeep(keepDialog.orphan, notes);
          } else if (keepDialog.count) {
            await handleBulkKeep(notes);
          }
          setKeepDialog({ open: false });
        }}
        onCancel={() => setKeepDialog({ open: false })}
      />
    </div>
  );
}
