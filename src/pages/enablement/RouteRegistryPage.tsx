import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Route,
  Database,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  FileCode,
  Unlink2,
  Activity,
  TrendingUp,
  Info,
  Play,
  ExternalLink,
  Wrench,
  Code2
} from "lucide-react";
import { toast } from "sonner";
import { useRouteResolver } from "@/hooks/useRouteResolver";
import { useRouteValidation, ValidationIssue } from "@/hooks/useRouteValidation";
import { useHandbookTasks } from "@/hooks/useHandbookTasks";
import { useFeatureRegistrySync } from "@/hooks/useFeatureRegistrySync";
import { useValidationFixer } from "@/hooks/useValidationFixer";
import { useProductCapabilitiesValidation } from "@/hooks/useProductCapabilitiesValidation";
import { useCodeRegistryScanner } from "@/hooks/useCodeRegistryScanner";
import { FixPreviewDialog } from "@/components/enablement/route-registry/FixPreviewDialog";
import { DocumentSelector } from "@/components/enablement/route-registry/DocumentSelector";
import { ProductCapabilitiesValidation } from "@/components/enablement/route-registry/ProductCapabilitiesValidation";
import { CodeRegistryPanel } from "@/components/enablement/route-registry/CodeRegistryPanel";
import { OrphanManagementPanel } from "@/components/enablement/route-registry/OrphanManagementPanel";
import { DocumentType } from "@/types/documentValidation";
import { cn } from "@/lib/utils";

export default function RouteRegistryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showFixPreview, setShowFixPreview] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType>("implementation_handbook");
  const { 
    dbRouteCount, 
    registryRouteCount, 
    getUnsyncedRoutes,
    getAllDbRoutes,
    isLoading: routesLoading,
    refresh: refreshRoutes
  } = useRouteResolver();
  
  const { 
    runValidation, 
    getQuickHealth, 
    isValidating, 
    lastReport 
  } = useRouteValidation();
  
  const { 
    tasks, 
    isUsingDatabase, 
    isLoading: tasksLoading 
  } = useHandbookTasks();
  
  const {
    syncRegistry,
    previewSync,
    isSyncing,
    unsyncedCount,
    totalRegistryFeatures,
    lastSyncResult
  } = useFeatureRegistrySync();

  const {
    previewFix,
    fixAllIssues,
    isFixing,
    isPreviewing,
    lastPreview
  } = useValidationFixer();

  const {
    totalCodeRoutes,
    syncStatus,
    checkSyncStatus
  } = useCodeRegistryScanner();

  const unsyncedRoutes = getUnsyncedRoutes();
  const dbRoutes = getAllDbRoutes();
  const quickHealth = getQuickHealth();

  const handleRunValidation = async () => {
    try {
      await runValidation();
      toast.success("Validation complete");
    } catch (error) {
      toast.error("Validation failed");
    }
  };

  const handlePreviewFix = async () => {
    try {
      await previewFix();
      setShowFixPreview(true);
    } catch (error) {
      toast.error("Failed to generate fix preview");
    }
  };

  const handleFixAll = async () => {
    const result = await fixAllIssues();
    if (result.success) {
      setShowFixPreview(false);
      // Re-run validation to refresh the report
      await runValidation();
    }
  };

  const handleSyncRegistry = async (dryRun: boolean) => {
    try {
      const result = await syncRegistry({ dryRun });
      if (dryRun) {
        toast.info(`Preview: ${result.summary.newFeatures} new, ${result.summary.updatedFeatures} updates`);
      }
    } catch (error) {
      toast.error("Sync failed");
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/enablement")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Route className="h-8 w-8" />
              Route Registry
            </h1>
            <p className="text-muted-foreground">
              Database-First Single Source of Truth for application routes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => refreshRoutes()}
            disabled={routesLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", routesLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button 
            onClick={handleRunValidation}
            disabled={isValidating}
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run Validation
          </Button>
        </div>
      </div>

      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Database Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{dbRouteCount}</span>
              <Database className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Routes in application_features table
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Registry Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{totalRegistryFeatures}</span>
              <FileCode className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Features defined in code registry
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unsynced Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={cn("text-2xl font-bold", unsyncedCount > 0 && "text-warning")}>
                {unsyncedCount}
              </span>
              <Unlink2 className={cn("h-5 w-5", unsyncedCount > 0 ? "text-warning" : "text-muted-foreground")} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In registry but not in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Migration Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={cn("text-2xl font-bold", getHealthColor(quickHealth.migrationProgress))}>
                {quickHealth.migrationProgress}%
              </span>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <Progress value={quickHealth.migrationProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Data Source Alert */}
      <Alert variant={isUsingDatabase ? "default" : "destructive"}>
        {isUsingDatabase ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
        <AlertTitle>
          {isUsingDatabase ? "Using Database (SSOT)" : "Using Legacy Hardcoded Data"}
        </AlertTitle>
        <AlertDescription>
          {isUsingDatabase 
            ? "Handbook tasks are being loaded from the database. Routes are resolved using the Database-First approach."
            : "Database is empty or unreachable. Falling back to hardcoded implementation mappings. Run the migration to populate the database."
          }
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="code-registry" className="gap-2">
            <Code2 className="h-4 w-4" />
            Code Registry
          </TabsTrigger>
          <TabsTrigger value="orphans" className="gap-2">
            <FileCode className="h-4 w-4" />
            Orphans
            {syncStatus && syncStatus.orphaned.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                {syncStatus.orphaned.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unsynced" className="gap-2">
            <Unlink2 className="h-4 w-4" />
            Unsynced ({unsyncedCount})
          </TabsTrigger>
          <TabsTrigger value="database" className="gap-2">
            <Database className="h-4 w-4" />
            Database Routes
          </TabsTrigger>
          <TabsTrigger value="validation" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Validation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sync Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Registry Sync</CardTitle>
                <CardDescription>
                  Sync features from code registry to database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSyncRegistry(true)}
                    disabled={isSyncing}
                  >
                    Preview Sync
                  </Button>
                  <Button 
                    onClick={() => handleSyncRegistry(false)}
                    disabled={isSyncing}
                  >
                    {isSyncing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Execute Sync
                  </Button>
                </div>
                
                {lastSyncResult && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <p className="font-medium">
                      {lastSyncResult.dryRun ? "Preview Result" : "Last Sync Result"}
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">New:</span>
                        <span className="ml-2 font-medium text-green-600">
                          {lastSyncResult.summary.newFeatures}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Updated:</span>
                        <span className="ml-2 font-medium text-blue-600">
                          {lastSyncResult.summary.updatedFeatures}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Unchanged:</span>
                        <span className="ml-2 font-medium">
                          {lastSyncResult.summary.unchanged}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Handbook Task Status</CardTitle>
                <CardDescription>
                  Implementation task route mapping status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Tasks</span>
                    <Badge variant="outline">{quickHealth.totalTasks}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">With Feature Code</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {quickHealth.tasksWithFeatureCode}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Using Legacy Routes</span>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      {quickHealth.totalTasks - quickHealth.tasksWithFeatureCode}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database Routes Available</span>
                    <Badge variant="outline">{quickHealth.totalDbRoutes}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="code-registry" className="mt-6">
          <CodeRegistryPanel />
        </TabsContent>

        <TabsContent value="orphans" className="mt-6">
          <OrphanManagementPanel />
        </TabsContent>

        <TabsContent value="unsynced" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Unsynced Features</CardTitle>
              <CardDescription>
                Features defined in code registry but not yet synced to database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unsyncedRoutes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                  <p className="font-medium">All features are synced!</p>
                  <p className="text-sm text-muted-foreground">
                    Registry and database are in sync
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Feature Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Route Path</TableHead>
                        <TableHead className="w-[100px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unsyncedRoutes.map((route) => (
                        <TableRow key={route.featureCode}>
                          <TableCell className="font-mono text-sm">
                            {route.featureCode}
                          </TableCell>
                          <TableCell>{route.name}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {route.path}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(route.path)}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Routes</CardTitle>
              <CardDescription>
                Routes stored in application_features table (Source of Truth)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Route Path</TableHead>
                      <TableHead className="w-[100px]">Test</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dbRoutes.map((route) => (
                      <TableRow key={route.featureCode}>
                        <TableCell className="font-mono text-sm">
                          {route.featureCode}
                        </TableCell>
                        <TableCell>{route.name}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {route.path}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(route.path)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="mt-6 space-y-4">
          {/* Document Selector */}
          <div className="flex items-center justify-between">
            <DocumentSelector 
              selected={selectedDocument} 
              onSelect={setSelectedDocument} 
            />
            {selectedDocument === "implementation_handbook" && (
              <Button 
                onClick={handleRunValidation}
                disabled={isValidating}
                size="sm"
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run Validation
              </Button>
            )}
          </div>

          {/* Conditional Validation Content */}
          {selectedDocument === "implementation_handbook" ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Implementation Handbook Validation</span>
                  {lastReport && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-lg px-3 py-1",
                        lastReport.healthScore >= 80 && "bg-green-50 text-green-700 border-green-200",
                        lastReport.healthScore >= 60 && lastReport.healthScore < 80 && "bg-yellow-50 text-yellow-700 border-yellow-200",
                        lastReport.healthScore < 60 && "bg-red-50 text-red-700 border-red-200"
                      )}
                    >
                      Health Score: {lastReport.healthScore}%
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {lastReport 
                    ? `Last run: ${lastReport.timestamp.toLocaleString()}`
                    : "Run validation to check implementation tasks against application features registry"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!lastReport ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="font-medium">No validation report yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click "Run Validation" to check route health
                    </p>
                    <Button onClick={handleRunValidation} disabled={isValidating}>
                      {isValidating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Run Validation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="rounded-lg border p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {lastReport.summary.tasksWithFeatureCode}
                        </p>
                        <p className="text-xs text-muted-foreground">With Feature Code</p>
                      </div>
                      <div className="rounded-lg border p-3 text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {lastReport.summary.tasksWithLegacyRoute}
                        </p>
                        <p className="text-xs text-muted-foreground">Legacy Routes</p>
                      </div>
                      <div className="rounded-lg border p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {lastReport.summary.validRoutes}
                        </p>
                        <p className="text-xs text-muted-foreground">Valid Routes</p>
                      </div>
                      <div className="rounded-lg border p-3 text-center">
                        <p className="text-2xl font-bold text-destructive">
                          {lastReport.summary.invalidRoutes}
                        </p>
                        <p className="text-xs text-muted-foreground">Invalid Routes</p>
                      </div>
                    </div>

                    {/* Fix Actions */}
                    {lastReport.summary.tasksWithLegacyRoute > 0 && (
                      <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
                        <div>
                          <p className="font-medium">Legacy Routes Detected</p>
                          <p className="text-sm text-muted-foreground">
                            {lastReport.summary.tasksWithLegacyRoute} tasks can be auto-migrated to feature codes
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={handlePreviewFix}
                            disabled={isPreviewing || isFixing}
                          >
                            {isPreviewing ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Info className="h-4 w-4 mr-2" />
                            )}
                            Preview Fix
                          </Button>
                          <Button
                            onClick={handlePreviewFix}
                            disabled={isPreviewing || isFixing}
                          >
                            {isFixing ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Wrench className="h-4 w-4 mr-2" />
                            )}
                            Fix All
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Issues */}
                    {lastReport.issues.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">
                          Issues ({lastReport.issues.length})
                        </h4>
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-2">
                            {lastReport.issues.map((issue, index) => (
                              <div 
                                key={index}
                                className={cn(
                                  "flex items-start gap-3 rounded-lg border p-3",
                                  issue.severity === 'error' && "border-destructive/50 bg-destructive/5",
                                  issue.severity === 'warning' && "border-yellow-500/50 bg-yellow-50/50"
                                )}
                              >
                                {getSeverityIcon(issue.severity)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{issue.message}</p>
                                  {issue.details.area && (
                                    <p className="text-xs text-muted-foreground">
                                      {issue.details.phaseId} → Step {issue.details.stepOrder}: {issue.details.area}
                                    </p>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {issue.type.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Product Capabilities Validation</CardTitle>
                <CardDescription>
                  Validates capabilities document modules against route registry and completeness checks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductCapabilitiesValidation />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Fix Preview Dialog */}
      <FixPreviewDialog
        open={showFixPreview}
        onOpenChange={setShowFixPreview}
        preview={lastPreview}
        isFixing={isFixing}
        onConfirm={handleFixAll}
      />
    </div>
  );
}
