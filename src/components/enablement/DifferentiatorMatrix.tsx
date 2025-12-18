import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as Icons from "lucide-react";
import {
  FEATURE_CAPABILITIES,
  CAPABILITY_TAG_LABELS,
  type CapabilityTag,
  type FeatureCapabilities
} from "@/lib/platformCapabilities";
import { FEATURE_REGISTRY } from "@/lib/featureRegistry";

interface DifferentiatorMatrixProps {
  onFeatureSelect?: (featureCode: string) => void;
}

const CAPABILITY_TAGS: CapabilityTag[] = [
  'ai-powered',
  'predictive-analytics',
  'prescriptive-guidance',
  'generative-ai',
  'dynamic-dashboards',
  'intelligent-automation',
  'workflow-orchestration',
  'real-time-processing',
  'compliance-tracking',
  'audit-ready',
  'self-service',
  'multi-company',
  'temporal-tracking',
  'cross-module'
];

export function DifferentiatorMatrix({ onFeatureSelect }: DifferentiatorMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterModule, setFilterModule] = useState<string>("all");

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

  // Build matrix data
  const matrixData = useMemo(() => {
    return FEATURE_CAPABILITIES
      .map((fc) => {
        const featureData = getFeatureFromRegistry(fc.featureCode);
        if (!featureData) return null;
        
        return {
          ...fc,
          featureName: featureData.feature.name,
          moduleName: featureData.module.name,
          moduleCode: featureData.module.code,
          groupName: featureData.group.groupName
        };
      })
      .filter(Boolean)
      .filter((item) => {
        if (!item) return false;
        const matchesSearch = searchQuery === "" || 
          item.featureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.moduleName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = filterLevel === "all" || item.differentiatorLevel === filterLevel;
        const matchesModule = filterModule === "all" || item.moduleCode === filterModule;
        return matchesSearch && matchesLevel && matchesModule;
      }) as (FeatureCapabilities & { featureName: string; moduleName: string; moduleCode: string; groupName: string })[];
  }, [searchQuery, filterLevel, filterModule]);

  // Stats
  const stats = useMemo(() => {
    const aiCount = matrixData.filter(f => f.capabilities.includes('ai-powered')).length;
    const predictiveCount = matrixData.filter(f => f.capabilities.includes('predictive-analytics')).length;
    const automationCount = matrixData.filter(f => f.capabilities.includes('intelligent-automation')).length;
    const uniqueCount = matrixData.filter(f => f.differentiatorLevel === 'unique').length;
    return { aiCount, predictiveCount, automationCount, uniqueCount };
  }, [matrixData]);

  const modules = FEATURE_REGISTRY.map(m => ({ code: m.code, name: m.name }));

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Icons.Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.aiCount}</div>
              <div className="text-xs text-muted-foreground">AI-Powered Features</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Icons.TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.predictiveCount}</div>
              <div className="text-xs text-muted-foreground">Predictive Analytics</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Icons.Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.automationCount}</div>
              <div className="text-xs text-muted-foreground">Intelligent Automation</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Icons.Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.uniqueCount}</div>
              <div className="text-xs text-muted-foreground">Market Differentiators</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Feature Capability Matrix</CardTitle>
              <CardDescription>
                Visual mapping of platform capabilities across all HR features
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Icons.Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[180px]"
                />
              </div>
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {modules.map((m) => (
                    <SelectItem key={m.code} value={m.code}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="unique">Market Differentiators</SelectItem>
                  <SelectItem value="advanced">Advanced Features</SelectItem>
                  <SelectItem value="standard">Core Features</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="min-w-max">
              {/* Header Row */}
              <div className="flex border-b bg-muted/50">
                <div className="w-[250px] p-3 font-semibold text-sm border-r shrink-0 sticky left-0 bg-muted/50 z-10">
                  Feature
                </div>
                <div className="w-[120px] p-3 font-semibold text-sm border-r shrink-0">
                  Module
                </div>
                <div className="w-[100px] p-3 font-semibold text-sm border-r shrink-0">
                  Level
                </div>
                <TooltipProvider>
                  {CAPABILITY_TAGS.map((tag) => (
                    <Tooltip key={tag}>
                      <TooltipTrigger asChild>
                        <div className="w-[80px] p-2 text-center border-r shrink-0">
                          <div className="text-[10px] font-medium leading-tight">
                            {CAPABILITY_TAG_LABELS[tag]?.label.split(' ').slice(0, 2).join(' ')}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {CAPABILITY_TAG_LABELS[tag]?.label}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>

              {/* Data Rows */}
              <ScrollArea className="h-[400px]">
                {matrixData.map((item) => (
                  <div 
                    key={item.featureCode} 
                    className="flex border-b hover:bg-muted/30 cursor-pointer"
                    onClick={() => onFeatureSelect?.(item.featureCode)}
                  >
                    <div className="w-[250px] p-3 border-r shrink-0 sticky left-0 bg-background z-10">
                      <div className="font-medium text-sm truncate">{item.featureName}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.groupName}</div>
                    </div>
                    <div className="w-[120px] p-3 border-r shrink-0">
                      <Badge variant="outline" className="text-[10px]">{item.moduleName}</Badge>
                    </div>
                    <div className="w-[100px] p-3 border-r shrink-0">
                      <DifferentiatorDot level={item.differentiatorLevel} />
                    </div>
                    {CAPABILITY_TAGS.map((tag) => (
                      <div 
                        key={tag} 
                        className="w-[80px] p-2 border-r shrink-0 flex items-center justify-center"
                      >
                        {item.capabilities.includes(tag) ? (
                          <div className={`w-5 h-5 rounded-full ${CAPABILITY_TAG_LABELS[tag]?.color || 'bg-primary'} flex items-center justify-center`}>
                            <Icons.Check className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-muted" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </ScrollArea>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium">Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs">Market Differentiator</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs">Advanced Feature</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-400" />
            <span className="text-xs">Core Feature</span>
          </div>
          <div className="border-l pl-4 flex flex-wrap gap-3">
            {CAPABILITY_TAGS.slice(0, 6).map((tag) => (
              <div key={tag} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${CAPABILITY_TAG_LABELS[tag]?.color}`} />
                <span className="text-[10px]">{CAPABILITY_TAG_LABELS[tag]?.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function DifferentiatorDot({ level }: { level: 'standard' | 'advanced' | 'unique' }) {
  const config = {
    standard: { color: 'bg-slate-400', label: 'Core' },
    advanced: { color: 'bg-blue-500', label: 'Advanced' },
    unique: { color: 'bg-purple-500', label: 'Unique' }
  };
  const { color, label } = config[level];
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-xs">{label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {level === 'unique' && 'Market differentiator - unique to HRplus Cerebra'}
          {level === 'advanced' && 'Advanced feature with competitive advantage'}
          {level === 'standard' && 'Core HR functionality'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
