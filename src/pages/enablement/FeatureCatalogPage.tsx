import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FEATURE_REGISTRY, 
  FeatureDefinition,
  getFeatureCount,
  getTotalFeatureCount
} from "@/lib/featureRegistry";
import { getFeatureCapabilities, getAIPoweredFeatures, getUniqueFeatures, CAPABILITY_TAG_LABELS } from "@/lib/platformCapabilities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ArrowLeft, 
  FileText, 
  ExternalLink, 
  Sparkles,
  Layers,
  FolderTree,
  BarChart3,
  Search,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Check,
  Brain,
  Grid3X3,
  Star,
  Printer,
  Download
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { CapabilityBrowser } from "@/components/enablement/CapabilityBrowser";
import { DifferentiatorMatrix } from "@/components/enablement/DifferentiatorMatrix";
import { FeatureCatalogGuidePreview } from "@/components/enablement/FeatureCatalogGuidePreview";

export default function FeatureCatalogPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("browser");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedFeature, setSelectedFeature] = useState<string>("");
  const [selectedFeatureData, setSelectedFeatureData] = useState<FeatureDefinition | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [showGuidePreview, setShowGuidePreview] = useState(false);

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.FileText;
  };

  const handleFeatureSelect = (moduleCode: string, featureCode: string, feature: FeatureDefinition) => {
    setSelectedModule(moduleCode);
    setSelectedFeature(featureCode);
    setSelectedFeatureData(feature);
    setActiveTab("browser");
  };

  const handleFeatureSelectByCode = (featureCode: string) => {
    for (const module of FEATURE_REGISTRY) {
      for (const group of module.groups) {
        const feature = group.features.find(f => f.code === featureCode);
        if (feature) {
          handleFeatureSelect(module.code, featureCode, feature);
          return;
        }
      }
    }
  };

  const handleGenerateDocs = () => {
    if (selectedModule && selectedFeature) {
      navigate(`/enablement/docs-generator?module=${selectedModule}&feature=${selectedFeature}`);
    }
  };

  const handleViewInApp = () => {
    if (selectedFeatureData?.routePath) {
      navigate(selectedFeatureData.routePath);
    }
  };

  const toggleModule = (moduleCode: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleCode) 
        ? prev.filter(m => m !== moduleCode)
        : [...prev, moduleCode]
    );
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupKey)
        ? prev.filter(g => g !== groupKey)
        : [...prev, groupKey]
    );
  };

  const filteredData = searchQuery.trim() 
    ? FEATURE_REGISTRY.map(module => ({
        ...module,
        groups: module.groups.map(group => ({
          ...group,
          features: group.features.filter(
            f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 f.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
        })).filter(g => g.features.length > 0)
      })).filter(m => m.groups.length > 0 || m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : FEATURE_REGISTRY;

  const totalFeatures = getTotalFeatureCount();
  const totalModules = FEATURE_REGISTRY.length;
  const totalGroups = FEATURE_REGISTRY.reduce((acc, mod) => acc + mod.groups.length, 0);
  const aiPoweredCount = getAIPoweredFeatures().length;
  const uniqueCount = getUniqueFeatures().length;

  return (
    <>
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
              Browse all Intelli HRM modules, features, and capabilities
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowGuidePreview(true)} className="gap-2">
            <Printer className="h-4 w-4" />
            Export Guide
          </Button>
          <Badge variant="outline" className="gap-1">
            <FolderTree className="h-3 w-3" />
            Registry
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modules</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalModules}</div>
            <p className="text-xs text-muted-foreground">Core HR modules</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groups</CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGroups}</div>
            <p className="text-xs text-muted-foreground">Feature categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Features</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFeatures}</div>
            <p className="text-xs text-muted-foreground">Total capabilities</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">AI-Powered</CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{aiPoweredCount}</div>
            <p className="text-xs text-muted-foreground">Intelligent features</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">Differentiators</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{uniqueCount}</div>
            <p className="text-xs text-muted-foreground">Market-unique</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="browser" className="gap-2">
            <FolderTree className="h-4 w-4" />
            Module Browser
          </TabsTrigger>
          <TabsTrigger value="capabilities" className="gap-2">
            <Brain className="h-4 w-4" />
            Capabilities
          </TabsTrigger>
          <TabsTrigger value="matrix" className="gap-2">
            <Grid3X3 className="h-4 w-4" />
            Matrix
          </TabsTrigger>
        </TabsList>

        {/* Tab: Module Browser */}
        <TabsContent value="browser" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Feature Browser */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Feature Browser
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="px-4 pb-4 space-y-1">
                {filteredData.map((module) => {
                  const ModuleIcon = getIcon(module.icon);
                  const isModuleExpanded = expandedModules.includes(module.code) || searchQuery.trim() !== "";
                  const featureCount = getFeatureCount(module.code);
                  
                  return (
                    <div key={module.code} className="space-y-1">
                      <Collapsible open={isModuleExpanded}>
                        <CollapsibleTrigger asChild>
                          <button
                            onClick={() => toggleModule(module.code)}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
                              "hover:bg-muted/50",
                              selectedModule === module.code && !selectedFeature && "bg-primary/10"
                            )}
                          >
                            {isModuleExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <ModuleIcon className="h-4 w-4 text-primary shrink-0" />
                            <span className="font-medium text-sm flex-1">{module.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {featureCount}
                            </Badge>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-4 mt-1 space-y-1">
                            {module.groups.map((group) => {
                              const groupKey = `${module.code}:${group.groupCode}`;
                              const isGroupExpanded = expandedGroups.includes(groupKey) || searchQuery.trim() !== "";
                              
                              return (
                                <div key={groupKey}>
                                  <Collapsible open={isGroupExpanded}>
                                    <CollapsibleTrigger asChild>
                                      <button
                                        onClick={() => toggleGroup(groupKey)}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-left hover:bg-muted/30 transition-colors"
                                      >
                                        {isGroupExpanded ? (
                                          <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                        ) : (
                                          <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                                        )}
                                        <span className="text-sm text-muted-foreground">{group.groupName}</span>
                                        <span className="text-xs text-muted-foreground/70">({group.features.length})</span>
                                      </button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                      <div className="ml-4 mt-0.5 space-y-0.5">
                                        {group.features.map((feature) => {
                                          const FeatureIcon = getIcon(feature.icon);
                                          const isSelected = selectedModule === module.code && selectedFeature === feature.code;
                                          
                                          return (
                                            <button
                                              key={feature.code}
                                              onClick={() => handleFeatureSelect(module.code, feature.code, feature)}
                                              className={cn(
                                                "w-full flex items-center gap-2 px-3 py-1.5 rounded text-left transition-colors",
                                                "hover:bg-muted/50",
                                                isSelected && "bg-primary/10 border-l-2 border-primary"
                                              )}
                                            >
                                              <FeatureIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                              <div className="flex-1 min-w-0">
                                                <div className="text-sm truncate">{feature.name}</div>
                                              </div>
                                              {isSelected && (
                                                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                                              )}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                </div>
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right: Feature Details or Placeholder */}
        <div className="space-y-4">
          {selectedFeatureData ? (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      {(() => {
                        const FeatureIcon = getIcon(selectedFeatureData.icon);
                        return <FeatureIcon className="h-5 w-5 text-primary" />;
                      })()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{selectedFeatureData.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{selectedFeatureData.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Route</h4>
                    <Badge variant="outline" className="font-mono text-xs">
                      {selectedFeatureData.routePath}
                    </Badge>
                  </div>
                  
                  {selectedFeatureData.workflowSteps && selectedFeatureData.workflowSteps.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Workflow Steps</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        {selectedFeatureData.workflowSteps.map((step, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {selectedFeatureData.uiElements && selectedFeatureData.uiElements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">UI Elements</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedFeatureData.uiElements.map((element, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {element}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedFeatureData.roleRequirements && selectedFeatureData.roleRequirements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Required Roles</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedFeatureData.roleRequirements.map((role, i) => (
                          <Badge key={i} variant="outline" className="text-xs capitalize">
                            {role.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
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
                  {selectedFeatureData.routePath && (
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
        </TabsContent>

        {/* Tab: Capabilities */}
        <TabsContent value="capabilities">
          <CapabilityBrowser onFeatureSelect={handleFeatureSelectByCode} />
        </TabsContent>

        {/* Tab: Matrix */}
        <TabsContent value="matrix">
          <DifferentiatorMatrix onFeatureSelect={handleFeatureSelectByCode} />
        </TabsContent>
      </Tabs>

      {/* Module Overview Table */}
      <Card>
        <CardHeader>
          <CardTitle>Module Overview</CardTitle>
          <CardDescription>Feature distribution across all modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {FEATURE_REGISTRY.map((module) => {
              const count = getFeatureCount(module.code);
              return (
                <div 
                  key={module.code}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedModule(module.code);
                    setSelectedFeature("");
                    setSelectedFeatureData(null);
                    setActiveTab("browser");
                    if (!expandedModules.includes(module.code)) {
                      setExpandedModules(prev => [...prev, module.code]);
                    }
                  }}
                >
                  <span className="text-sm font-medium truncate">{module.name}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>

      {/* Guide Export Preview Dialog */}
      <FeatureCatalogGuidePreview
        open={showGuidePreview}
        onOpenChange={setShowGuidePreview}
      />
    </>
  );
}
