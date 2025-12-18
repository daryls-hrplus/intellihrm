import { useState, useMemo } from "react";
import { useModulesWithFeatures, ApplicationModule, ApplicationFeature } from "@/hooks/useApplicationFeatures";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Search, 
  ChevronRight, 
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Check,
  X,
  Loader2
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureBrowserProps {
  selectedModule?: string;
  selectedFeature?: string;
  onModuleSelect: (moduleCode: string) => void;
  onFeatureSelect: (featureCode: string, feature: ApplicationFeature) => void;
  multiSelect?: boolean;
  selectedFeatures?: string[];
  onMultiSelectChange?: (features: string[]) => void;
}

export function FeatureBrowser({
  selectedModule,
  selectedFeature,
  onModuleSelect,
  onFeatureSelect,
  multiSelect = false,
  selectedFeatures = [],
  onMultiSelectChange
}: FeatureBrowserProps) {
  const { data: modulesWithFeatures, isLoading } = useModulesWithFeatures();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const getIcon = (iconName: string | null) => {
    if (!iconName) return LucideIcons.FileText;
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.FileText;
  };

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return modulesWithFeatures;
    }
    
    const query = searchQuery.toLowerCase();
    return modulesWithFeatures
      .map(module => ({
        ...module,
        features: module.features.filter(
          f => f.feature_name.toLowerCase().includes(query) ||
               f.feature_code.toLowerCase().includes(query) ||
               (f.description && f.description.toLowerCase().includes(query))
        )
      }))
      .filter(module => 
        module.features.length > 0 ||
        module.module_name.toLowerCase().includes(query) ||
        module.module_code.toLowerCase().includes(query)
      );
  }, [searchQuery, modulesWithFeatures]);

  const toggleModule = (moduleCode: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleCode) 
        ? prev.filter(m => m !== moduleCode)
        : [...prev, moduleCode]
    );
  };

  const handleFeatureClick = (moduleCode: string, feature: ApplicationFeature) => {
    if (multiSelect) {
      const featureKey = `${moduleCode}:${feature.feature_code}`;
      const newSelection = selectedFeatures.includes(featureKey)
        ? selectedFeatures.filter(f => f !== featureKey)
        : [...selectedFeatures, featureKey];
      onMultiSelectChange?.(newSelection);
    } else {
      onModuleSelect(moduleCode);
      onFeatureSelect(feature.feature_code, feature);
    }
  };

  const isFeatureSelected = (moduleCode: string, featureCode: string) => {
    if (multiSelect) {
      return selectedFeatures.includes(`${moduleCode}:${featureCode}`);
    }
    return selectedModule === moduleCode && selectedFeature === featureCode;
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Feature Repository
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
        {multiSelect && selectedFeatures.length > 0 && (
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="secondary">{selectedFeatures.length} selected</Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onMultiSelectChange?.([])}
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="px-4 pb-4 space-y-1">
            {filteredData.map((module) => {
              const ModuleIcon = getIcon(module.icon_name);
              const isModuleExpanded = expandedModules.includes(module.module_code) || searchQuery.trim() !== "";
              
              return (
                <div key={module.id} className="space-y-1">
                  <Collapsible open={isModuleExpanded}>
                    <CollapsibleTrigger asChild>
                      <button
                        onClick={() => toggleModule(module.module_code)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
                          "hover:bg-muted/50",
                          selectedModule === module.module_code && !selectedFeature && "bg-primary/10"
                        )}
                      >
                        {isModuleExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <ModuleIcon className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium text-sm flex-1">{module.module_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {module.features.length}
                        </Badge>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-6 mt-1 space-y-0.5">
                        {module.features.map((feature) => {
                          const isSelected = isFeatureSelected(module.module_code, feature.feature_code);
                          
                          return (
                            <button
                              key={feature.id}
                              onClick={() => handleFeatureClick(module.module_code, feature)}
                              className={cn(
                                "w-full flex items-center gap-2 px-3 py-1.5 rounded text-left transition-colors",
                                "hover:bg-muted/50",
                                isSelected && "bg-primary/10 border-l-2 border-primary"
                              )}
                            >
                              {multiSelect && (
                                <Checkbox
                                  checked={isSelected}
                                  className="shrink-0"
                                />
                              )}
                              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm truncate">{feature.feature_name}</div>
                              </div>
                              {isSelected && !multiSelect && (
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
            {filteredData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No features found
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Feature Detail Panel for showing selected feature info
interface FeatureDetailPanelProps {
  moduleCode: string;
  feature: ApplicationFeature;
}

export function FeatureDetailPanel({ moduleCode, feature }: FeatureDetailPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{feature.feature_name}</CardTitle>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Route</h4>
          <Badge variant="outline" className="font-mono text-xs">
            {feature.route_path || "N/A"}
          </Badge>
        </div>
        
        {feature.workflow_steps && Array.isArray(feature.workflow_steps) && feature.workflow_steps.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Workflow Steps</h4>
            <ol className="list-decimal list-inside space-y-1">
              {feature.workflow_steps.map((step: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground">{step}</li>
              ))}
            </ol>
          </div>
        )}
        
        {feature.ui_elements && Array.isArray(feature.ui_elements) && feature.ui_elements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">UI Elements</h4>
            <div className="flex flex-wrap gap-1.5">
              {feature.ui_elements.map((element: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {element}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {feature.role_requirements && feature.role_requirements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Required Roles</h4>
            <div className="flex flex-wrap gap-1.5">
              {feature.role_requirements.map((role: string, i: number) => (
                <Badge key={i} variant="outline" className="text-xs capitalize">
                  {role.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
