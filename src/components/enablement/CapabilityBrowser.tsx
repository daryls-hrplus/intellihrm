import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import {
  PLATFORM_CAPABILITIES,
  CAPABILITY_CATEGORY_LABELS,
  CAPABILITY_TAG_LABELS,
  FEATURE_CAPABILITIES,
  getCapabilitiesByCategory,
  getFeatureCapabilities,
  type CapabilityCategory,
  type PlatformCapability,
  type FeatureCapabilities
} from "@/lib/platformCapabilities";
import { FEATURE_REGISTRY } from "@/lib/featureRegistry";

interface CapabilityBrowserProps {
  onFeatureSelect?: (featureCode: string) => void;
}

const getIcon = (iconName: string): LucideIcon => {
  return (Icons as any)[iconName] || Icons.HelpCircle;
};

const DifferentiatorBadge = ({ level }: { level: 'standard' | 'advanced' | 'unique' }) => {
  const config = {
    standard: { label: 'Core Feature', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    advanced: { label: 'Advanced', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    unique: { label: 'Market Differentiator', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' }
  };
  const { label, className } = config[level];
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export function CapabilityBrowser({ onFeatureSelect }: CapabilityBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<CapabilityCategory | null>(null);
  const [selectedCapability, setSelectedCapability] = useState<PlatformCapability | null>(null);

  const categories = Object.keys(CAPABILITY_CATEGORY_LABELS) as CapabilityCategory[];

  // Get feature details from registry
  const getFeatureFromRegistry = (featureCode: string) => {
    for (const module of FEATURE_REGISTRY) {
      for (const group of module.groups) {
        const feature = group.features.find(f => f.code === featureCode);
        if (feature) {
          return { feature, module, group };
        }
      }
    }
    return null;
  };

  // Stats
  const totalAIPowered = FEATURE_CAPABILITIES.filter(f => 
    f.capabilities.includes('ai-powered') || f.aiFeatures?.length
  ).length;
  const totalUnique = FEATURE_CAPABILITIES.filter(f => f.differentiatorLevel === 'unique').length;
  const totalAdvanced = FEATURE_CAPABILITIES.filter(f => f.differentiatorLevel === 'advanced').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Left Column - Categories */}
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{totalAIPowered}</div>
            <div className="text-xs text-muted-foreground">AI-Powered</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalAdvanced}</div>
            <div className="text-xs text-muted-foreground">Advanced</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-emerald-600">{totalUnique}</div>
            <div className="text-xs text-muted-foreground">Unique</div>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Platform Capabilities</CardTitle>
            <CardDescription>
              Strategic differentiators by business impact area
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="p-4 space-y-2">
                {categories.map((category) => {
                  const config = CAPABILITY_CATEGORY_LABELS[category];
                  const CategoryIcon = getIcon(config.icon);
                  const capabilities = getCapabilitiesByCategory(category);
                  const isSelected = selectedCategory === category;

                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(isSelected ? null : category);
                        setSelectedCapability(null);
                      }}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        isSelected 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CategoryIcon className="h-5 w-5" />
                        <div className="flex-1">
                          <div className="font-medium">{config.label}</div>
                          <div className={`text-xs ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {capabilities.length} capabilities
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Middle Column - Capabilities in Category */}
      <div>
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {selectedCategory 
                ? CAPABILITY_CATEGORY_LABELS[selectedCategory].label 
                : 'Select a Category'}
            </CardTitle>
            <CardDescription>
              {selectedCategory 
                ? CAPABILITY_CATEGORY_LABELS[selectedCategory].description
                : 'Choose a capability category to explore'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[540px]">
              {selectedCategory ? (
                <div className="p-4 space-y-3">
                  {getCapabilitiesByCategory(selectedCategory).map((capability) => {
                    const CapIcon = getIcon(capability.icon);
                    const isSelected = selectedCapability?.code === capability.code;

                    return (
                      <button
                        key={capability.code}
                        onClick={() => setSelectedCapability(isSelected ? null : capability)}
                        className={`w-full p-4 rounded-lg text-left transition-all border ${
                          isSelected 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <CapIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm">{capability.name}</div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {capability.businessValue}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {capability.keyFeatures.length} features
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Icons.Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a capability category from the left to explore platform differentiators</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Capability Detail */}
      <div>
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {selectedCapability?.name || 'Capability Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[540px]">
              {selectedCapability ? (
                <div className="p-4 space-y-4">
                  {/* Business Value */}
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                    <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                      <Icons.Target className="h-4 w-4" />
                      Business Value for Decision Makers
                    </h4>
                    <p className="text-sm">{selectedCapability.businessValue}</p>
                  </div>

                  {/* Competitive Advantage */}
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Icons.Zap className="h-4 w-4" />
                      Competitive Advantage
                    </h4>
                    <p className="text-sm text-muted-foreground">{selectedCapability.competitorGap}</p>
                  </div>

                  {/* Industry Impact */}
                  <div className="p-4 border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800 rounded-lg">
                    <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                      <Icons.TrendingUp className="h-4 w-4" />
                      Industry Impact
                    </h4>
                    <p className="text-sm text-emerald-600 dark:text-emerald-300">{selectedCapability.industryImpact}</p>
                  </div>

                  {/* Related Features */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Icons.Puzzle className="h-4 w-4" />
                      Features with this Capability
                    </h4>
                    <Accordion type="single" collapsible className="w-full">
                      {selectedCapability.keyFeatures.map((featureCode) => {
                        const featureData = getFeatureFromRegistry(featureCode);
                        const featureCaps = getFeatureCapabilities(featureCode);
                        
                        if (!featureData) return null;
                        
                        return (
                          <AccordionItem key={featureCode} value={featureCode}>
                            <AccordionTrigger className="text-sm hover:no-underline">
                              <div className="flex items-center gap-2">
                                <span>{featureData.feature.name}</span>
                                {featureCaps && (
                                  <DifferentiatorBadge level={featureCaps.differentiatorLevel} />
                                )}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 pt-2">
                                <p className="text-xs text-muted-foreground">
                                  {featureData.feature.description}
                                </p>
                                
                                {/* Decision Maker Value */}
                                {featureCaps?.decisionMakerValue && (
                                  <div className="text-xs p-2 bg-primary/5 rounded">
                                    <strong>Value:</strong> {featureCaps.decisionMakerValue}
                                  </div>
                                )}

                                {/* AI Features */}
                                {featureCaps?.aiFeatures && featureCaps.aiFeatures.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="text-xs font-medium">AI Capabilities:</div>
                                    {featureCaps.aiFeatures.map((ai, idx) => (
                                      <div key={idx} className="text-xs flex items-start gap-2 p-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                                        <Badge variant="outline" className="text-[10px] shrink-0">
                                          {ai.type}
                                        </Badge>
                                        <div>
                                          <span className="font-medium">{ai.name}:</span>{' '}
                                          {ai.businessValue}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Capability Tags */}
                                {featureCaps && (
                                  <div className="flex flex-wrap gap-1">
                                    {featureCaps.capabilities.slice(0, 4).map((cap) => (
                                      <Badge 
                                        key={cap} 
                                        variant="secondary" 
                                        className="text-[10px]"
                                      >
                                        {CAPABILITY_TAG_LABELS[cap]?.label || cap}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-xs"
                                  onClick={() => onFeatureSelect?.(featureCode)}
                                >
                                  <Icons.ExternalLink className="h-3 w-3 mr-1" />
                                  View Feature Details
                                </Button>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Icons.Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a capability to see detailed information and related features</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
