import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModulesWithFeatures, ApplicationFeature } from "@/hooks/useApplicationFeatures";
import { FeatureBrowser, FeatureDetailPanel } from "@/components/enablement/FeatureBrowser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  FileText, 
  ExternalLink, 
  Sparkles,
  Layers,
  FolderTree,
  BarChart3
} from "lucide-react";

export default function FeatureCatalogPage() {
  const navigate = useNavigate();
  const { data: modulesWithFeatures, isLoading } = useModulesWithFeatures();
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedFeature, setSelectedFeature] = useState<string>("");
  const [selectedFeatureData, setSelectedFeatureData] = useState<ApplicationFeature | null>(null);

  const handleModuleSelect = (moduleCode: string) => {
    setSelectedModule(moduleCode);
  };

  const handleFeatureSelect = (featureCode: string, feature: ApplicationFeature) => {
    setSelectedFeature(featureCode);
    setSelectedFeatureData(feature);
  };

  const handleGenerateDocs = () => {
    if (selectedModule && selectedFeature) {
      navigate(`/enablement/docs-generator?module=${selectedModule}&feature=${selectedFeature}`);
    }
  };

  const handleViewInApp = () => {
    if (selectedFeatureData?.route_path) {
      navigate(selectedFeatureData.route_path);
    }
  };

  // Calculate statistics from database data
  const totalModules = modulesWithFeatures.length;
  const totalFeatures = modulesWithFeatures.reduce((acc, mod) => acc + mod.features.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/enablement")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Feature Catalog</h1>
            <p className="text-muted-foreground">
              Browse all HRplus Cerebra modules, features, and capabilities
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1">
          <FolderTree className="h-3 w-3" />
          Repository
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalModules}</div>
                <p className="text-xs text-muted-foreground">Core system modules</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Features</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalFeatures}</div>
                <p className="text-xs text-muted-foreground">Documented capabilities</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Browser and Detail Panel */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Feature Browser */}
        <FeatureBrowser
          selectedModule={selectedModule}
          selectedFeature={selectedFeature}
          onModuleSelect={handleModuleSelect}
          onFeatureSelect={handleFeatureSelect}
        />

        {/* Right: Feature Details or Placeholder */}
        <div className="space-y-4">
          {selectedFeatureData ? (
            <>
              <FeatureDetailPanel 
                moduleCode={selectedModule} 
                feature={selectedFeatureData} 
              />
              
              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button onClick={handleGenerateDocs} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate Documentation
                  </Button>
                  {selectedFeatureData.route_path && (
                    <Button variant="outline" onClick={handleViewInApp} className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      View in App
                    </Button>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <CardTitle className="text-lg text-muted-foreground">No Feature Selected</CardTitle>
              <CardDescription className="text-center max-w-sm mt-2">
                Select a feature from the browser on the left to view its details, 
                workflow steps, UI elements, and role requirements.
              </CardDescription>
            </Card>
          )}
        </div>
      </div>

      {/* Module Overview Table */}
      <Card>
        <CardHeader>
          <CardTitle>Module Overview</CardTitle>
          <CardDescription>Feature distribution across all modules</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {modulesWithFeatures.map((module) => (
                <div 
                  key={module.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedModule(module.module_code);
                    setSelectedFeature("");
                    setSelectedFeatureData(null);
                  }}
                >
                  <span className="text-sm font-medium truncate">{module.module_name}</span>
                  <Badge variant="secondary">{module.features.length}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
