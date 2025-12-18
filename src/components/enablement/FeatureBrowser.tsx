import { useState, useMemo } from "react";
import { 
  FEATURE_REGISTRY, 
  ModuleDefinition, 
  FeatureGroup, 
  FeatureDefinition,
  searchFeatures,
  getFeatureCount 
} from "@/lib/featureRegistry";
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
  X
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureBrowserProps {
  selectedModule?: string;
  selectedFeature?: string;
  onModuleSelect: (moduleCode: string) => void;
  onFeatureSelect: (featureCode: string, feature: FeatureDefinition) => void;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.FileText;
  };

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return FEATURE_REGISTRY;
    }
    
    const searchResults = searchFeatures(searchQuery);
    const moduleMap = new Map<string, ModuleDefinition>();
    
    searchResults.forEach(({ module, group, feature }) => {
      if (!moduleMap.has(module.code)) {
        moduleMap.set(module.code, {
          ...module,
          groups: []
        });
      }
      
      const mod = moduleMap.get(module.code)!;
      let existingGroup = mod.groups.find(g => g.groupCode === group.groupCode);
      
      if (!existingGroup) {
        existingGroup = { ...group, features: [] };
        mod.groups.push(existingGroup);
      }
      
      if (!existingGroup.features.find(f => f.code === feature.code)) {
        existingGroup.features.push(feature);
      }
    });
    
    return Array.from(moduleMap.values());
  }, [searchQuery]);

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

  const handleFeatureClick = (moduleCode: string, feature: FeatureDefinition) => {
    if (multiSelect) {
      const featureKey = `${moduleCode}:${feature.code}`;
      const newSelection = selectedFeatures.includes(featureKey)
        ? selectedFeatures.filter(f => f !== featureKey)
        : [...selectedFeatures, featureKey];
      onMultiSelectChange?.(newSelection);
    } else {
      onModuleSelect(moduleCode);
      onFeatureSelect(feature.code, feature);
    }
  };

  const isFeatureSelected = (moduleCode: string, featureCode: string) => {
    if (multiSelect) {
      return selectedFeatures.includes(`${moduleCode}:${featureCode}`);
    }
    return selectedModule === moduleCode && selectedFeature === featureCode;
  };

  return (
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
              const ModuleIcon = getIcon(module.icon);
              const isModuleExpanded = expandedModules.includes(module.code) || searchQuery.trim() !== "";
              const featureCount = getFeatureCount(module.code);
              
              return (
                <div key={module.code} className="space-y-1">
                  {/* Module Header */}
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
                              {/* Group Header */}
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
                                      const isSelected = isFeatureSelected(module.code, feature.code);
                                      
                                      return (
                                        <button
                                          key={feature.code}
                                          onClick={() => handleFeatureClick(module.code, feature)}
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
                                          <FeatureIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                          <div className="flex-1 min-w-0">
                                            <div className="text-sm truncate">{feature.name}</div>
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
  );
}

// Feature Detail Panel for showing selected feature info
interface FeatureDetailPanelProps {
  moduleCode: string;
  feature: FeatureDefinition;
}

export function FeatureDetailPanel({ moduleCode, feature }: FeatureDetailPanelProps) {
  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.FileText;
  };
  
  const FeatureIcon = getIcon(feature.icon);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FeatureIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{feature.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Route</h4>
          <Badge variant="outline" className="font-mono text-xs">
            {feature.routePath}
          </Badge>
        </div>
        
        {feature.workflowSteps && feature.workflowSteps.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Workflow Steps</h4>
            <ol className="list-decimal list-inside space-y-1">
              {feature.workflowSteps.map((step, i) => (
                <li key={i} className="text-sm text-muted-foreground">{step}</li>
              ))}
            </ol>
          </div>
        )}
        
        {feature.uiElements && feature.uiElements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">UI Elements</h4>
            <div className="flex flex-wrap gap-1.5">
              {feature.uiElements.map((element, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {element}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {feature.roleRequirements && feature.roleRequirements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Required Roles</h4>
            <div className="flex flex-wrap gap-1.5">
              {feature.roleRequirements.map((role, i) => (
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
