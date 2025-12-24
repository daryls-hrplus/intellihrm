import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  Loader2,
  Check,
  Plus,
  Edit,
  ArrowRight,
  Package,
  AlertCircle,
  CheckSquare,
  Square,
} from "lucide-react";
import { useFeatureRegistrySync, SyncResult } from "@/hooks/useFeatureRegistrySync";
import { useEnablementReleases } from "@/hooks/useEnablementData";
import { FeatureModuleGroup, FeaturePreviewItem } from "./FeaturePreviewCard";

interface FeatureRegistrySyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeatureRegistrySyncDialog({
  open,
  onOpenChange,
}: FeatureRegistrySyncDialogProps) {
  const {
    isSyncing,
    unsyncedFeatures,
    totalRegistryFeatures,
    syncRegistry,
    previewSync,
  } = useFeatureRegistrySync();
  
  const { releases } = useEnablementReleases();
  const [previewResult, setPreviewResult] = useState<SyncResult | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [addToRelease, setAddToRelease] = useState<string>("none");
  const [syncComplete, setSyncComplete] = useState(false);
  const [finalResult, setFinalResult] = useState<SyncResult | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());

  const activeReleases = releases.filter(
    (r) => r.status === "planning" || r.status === "preview"
  );

  // Group features by module
  const featuresByModule = useMemo(() => {
    const features = previewResult?.newFeatureDetails || unsyncedFeatures;
    const grouped: Record<string, FeaturePreviewItem[]> = {};
    
    features.forEach((feature) => {
      if (!grouped[feature.moduleName]) {
        grouped[feature.moduleName] = [];
      }
      grouped[feature.moduleName].push(feature);
    });
    
    return grouped;
  }, [previewResult, unsyncedFeatures]);

  // Initialize selected features when preview is shown
  const initializeSelection = (features: FeaturePreviewItem[]) => {
    setSelectedFeatures(new Set(features.map((f) => f.code)));
  };

  const handlePreview = async () => {
    setIsPreviewing(true);
    setSyncComplete(false);
    try {
      const result = await previewSync();
      setPreviewResult(result);
      // Select all by default
      initializeSelection(result.newFeatureDetails);
    } catch (error) {
      console.error("Preview failed:", error);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleSync = async () => {
    // Get excluded features (those not selected)
    const allNewFeatures = previewResult?.newFeatureDetails || [];
    const excludedFeatures = allNewFeatures
      .filter((f) => !selectedFeatures.has(f.code))
      .map((f) => f.code);

    try {
      const result = await syncRegistry({
        addToRelease: addToRelease !== "none" ? addToRelease : null,
        excludeFeatureCodes: excludedFeatures,
      });
      setFinalResult(result);
      setSyncComplete(true);
    } catch (error) {
      console.error("Sync failed:", error);
    }
  };

  const handleClose = () => {
    setPreviewResult(null);
    setSyncComplete(false);
    setFinalResult(null);
    setAddToRelease("none");
    setSelectedFeatures(new Set());
    onOpenChange(false);
  };

  const handleToggleFeature = (code: string) => {
    setSelectedFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const handleToggleAll = (codes: string[], selected: boolean) => {
    setSelectedFeatures((prev) => {
      const next = new Set(prev);
      codes.forEach((code) => {
        if (selected) {
          next.add(code);
        } else {
          next.delete(code);
        }
      });
      return next;
    });
  };

  const handleSelectAll = () => {
    const allCodes = (previewResult?.newFeatureDetails || unsyncedFeatures).map((f) => f.code);
    setSelectedFeatures(new Set(allCodes));
  };

  const handleDeselectAll = () => {
    setSelectedFeatures(new Set());
  };

  const selectedCount = selectedFeatures.size;
  const totalNewFeatures = previewResult?.newFeatureDetails.length || 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sync Feature Registry
          </DialogTitle>
          <DialogDescription>
            Review and select features to sync from the code registry to the database.
            Synced features automatically go to In Development.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Registry Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg border bg-muted/50">
              <p className="text-2xl font-bold">{totalRegistryFeatures}</p>
              <p className="text-xs text-muted-foreground">Registry Features</p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/50">
              <p className="text-2xl font-bold text-primary">
                {unsyncedFeatures.length}
              </p>
              <p className="text-xs text-muted-foreground">New / Unsynced</p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/50">
              <p className="text-2xl font-bold text-green-600">
                {totalRegistryFeatures - unsyncedFeatures.length}
              </p>
              <p className="text-xs text-muted-foreground">Already Synced</p>
            </div>
          </div>

          {/* Preview Results with Selection */}
          {previewResult && !syncComplete && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Package className="h-4 w-4" />
                  Select Features to Sync
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-7 text-xs"
                  >
                    <CheckSquare className="h-3 w-3 mr-1" />
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="h-7 text-xs"
                  >
                    <Square className="h-3 w-3 mr-1" />
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <Plus className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{selectedCount}</span>
                  <span className="text-muted-foreground">Selected</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Edit className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{previewResult.summary.updatedFeatures}</span>
                  <span className="text-muted-foreground">Updated</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                  <Check className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{previewResult.summary.unchanged}</span>
                  <span className="text-muted-foreground">Unchanged</span>
                </div>
              </div>

              {/* Feature list grouped by module */}
              {totalNewFeatures > 0 && (
                <ScrollArea className="h-[300px] rounded-lg border p-2">
                  <div className="space-y-3">
                    {Object.entries(featuresByModule).map(([moduleName, features]) => (
                      <FeatureModuleGroup
                        key={moduleName}
                        moduleName={moduleName}
                        features={features}
                        selectedFeatures={selectedFeatures}
                        onToggle={handleToggleFeature}
                        onToggleAll={handleToggleAll}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Info about workflow */}
              <div className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/20">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Workflow:</strong> Selected features will be added to{" "}
                  <Badge variant="secondary">In Development</Badge> and must progress through
                  Testing → Documentation → Ready for Enablement before artifacts can be created.
                </p>
              </div>

              {/* Add to release option */}
              {selectedCount > 0 && activeReleases.length > 0 && (
                <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                  <Label className="text-sm font-medium">
                    Auto-add to release (optional)
                  </Label>
                  <Select value={addToRelease} onValueChange={setAddToRelease}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a release (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Don't add to release</SelectItem>
                      {activeReleases.map((release) => (
                        <SelectItem key={release.id} value={release.id}>
                          {release.version_number}
                          {release.release_name && ` - ${release.release_name}`}
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {release.status}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Sync Complete */}
          {syncComplete && finalResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <Check className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-700">Sync Complete!</p>
                  <p className="text-sm text-muted-foreground">
                    {finalResult.summary.newFeatures} new features added to In Development,{" "}
                    {finalResult.summary.updatedFeatures} updated
                  </p>
                </div>
              </div>

              {finalResult.errors.length > 0 && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <p className="font-medium text-sm">
                      {finalResult.errors.length} error(s) occurred
                    </p>
                  </div>
                  <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside">
                    {finalResult.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Initial state - no preview yet */}
          {!previewResult && !syncComplete && unsyncedFeatures.length > 0 && (
            <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Plus className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">
                    {unsyncedFeatures.length} new features detected in registry
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click "Preview Changes" to review and select which features to sync.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!previewResult && !syncComplete && unsyncedFeatures.length === 0 && (
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">All features are synced</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The database is up to date with the feature registry.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!syncComplete ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {!previewResult ? (
                <Button onClick={handlePreview} disabled={isPreviewing}>
                  {isPreviewing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Previewing...
                    </>
                  ) : (
                    <>
                      Preview Changes
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleSync} 
                  disabled={isSyncing || selectedCount === 0}
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync {selectedCount} Feature{selectedCount !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
