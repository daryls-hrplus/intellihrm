import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Code2,
  Database,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Search,
  FileWarning,
  ArrowRight,
  Shield
} from "lucide-react";
import { useCodeRegistryScanner } from "@/hooks/useCodeRegistryScanner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CodeRegistryPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasScanned, setHasScanned] = useState(false);
  
  const {
    isScanning,
    syncStatus,
    codeRoutes,
    scanRegistry,
    checkSyncStatus,
    totalCodeRoutes,
    totalModules
  } = useCodeRegistryScanner();

  // Initial scan on mount
  useEffect(() => {
    if (!hasScanned) {
      handleScan();
    }
  }, [hasScanned]);

  const handleScan = async () => {
    try {
      await scanRegistry();
      await checkSyncStatus();
      setHasScanned(true);
      toast.success("Code registry scanned successfully");
    } catch (error) {
      toast.error("Failed to scan code registry");
    }
  };

  const filteredRoutes = codeRoutes.filter(route => 
    route.pageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.routePath.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.featureCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.moduleCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSyncBadge = (featureCode: string) => {
    if (!syncStatus) return null;
    
    const isSynced = syncStatus.synced.some(r => r.featureCode === featureCode);
    
    if (isSynced) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Synced
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Not in DB
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Code Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{totalCodeRoutes}</span>
              <Code2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Routes defined in App.tsx
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{totalModules}</span>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Distinct module codes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Synced to DB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-2xl font-bold",
                syncStatus && syncStatus.synced.length === totalCodeRoutes 
                  ? "text-green-600" 
                  : "text-yellow-600"
              )}>
                {syncStatus?.synced.length ?? "-"}
              </span>
              <Database className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered in application_features
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orphaned in DB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-2xl font-bold",
                syncStatus && syncStatus.orphaned.length > 0 
                  ? "text-destructive" 
                  : "text-green-600"
              )}>
                {syncStatus?.orphaned.length ?? "-"}
              </span>
              <FileWarning className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              DB entries without code
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Flow Diagram */}
      <Alert>
        <ArrowRight className="h-4 w-4" />
        <AlertTitle>Unidirectional Sync: Code → Database → Document</AlertTitle>
        <AlertDescription>
          The code registry is the source of truth. Database entries should only be created for routes that exist in code. 
          Documentation should only reference features that exist in the database.
        </AlertDescription>
      </Alert>

      {/* Orphaned Entries Warning */}
      {syncStatus && syncStatus.orphaned.length > 0 && (
        <Alert variant="destructive">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>Orphaned Database Entries Detected</AlertTitle>
          <AlertDescription>
            {syncStatus.orphaned.length} feature(s) exist in the database but have no corresponding code implementation.
            These may need to be removed or the code needs to be restored.
            <div className="mt-2 flex flex-wrap gap-2">
              {syncStatus.orphaned.slice(0, 5).map(orphan => (
                <Badge key={orphan.featureCode} variant="outline" className="bg-destructive/10">
                  {orphan.featureCode}
                </Badge>
              ))}
              {syncStatus.orphaned.length > 5 && (
                <Badge variant="outline">+{syncStatus.orphaned.length - 5} more</Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Unregistered Warning */}
      {syncStatus && syncStatus.unregistered.length > 0 && (
        <Alert className="border-yellow-500/50 bg-yellow-50/50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Unregistered Code Routes</AlertTitle>
          <AlertDescription className="text-yellow-700">
            {syncStatus.unregistered.length} route(s) exist in code but are not registered in the database.
            Run "Sync Code → DB" to register them.
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search routes, modules, or feature codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={handleScan}
          disabled={isScanning}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isScanning && "animate-spin")} />
          Rescan
        </Button>
      </div>

      {/* Routes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Code Routes (Source of Truth)</CardTitle>
          <CardDescription>
            All routes defined in App.tsx - these are the only valid routes for database sync
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page Component</TableHead>
                  <TableHead>Route Path</TableHead>
                  <TableHead>Feature Code</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Protection</TableHead>
                  <TableHead>DB Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.routePath}>
                    <TableCell className="font-mono text-sm">
                      {route.pageName}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {route.routePath}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {route.featureCode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{route.moduleCode}</Badge>
                    </TableCell>
                    <TableCell>
                      {route.hasProtection ? (
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3 text-green-600" />
                          {route.requiredRoles.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {route.requiredRoles.join(", ")}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Public</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getSyncBadge(route.featureCode)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
