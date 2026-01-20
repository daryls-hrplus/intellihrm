import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useEssEntitlement, ESS_ELIGIBLE_MODULES } from "@/hooks/useEssEntitlement";
import {
  Search,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Eye,
  ShieldCheck,
  Users,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleRowProps {
  moduleCode: string;
  moduleName: string;
  onToggle: (code: string, field: 'ess_enabled' | 'ess_view_only' | 'requires_approval', value: boolean) => void;
  isUpdating: boolean;
  readiness: {
    isLicensed: boolean;
    isImplemented: boolean;
    implementationStatus: string;
    isEssEnabled: boolean;
    isReady: boolean;
  };
  config: {
    ess_enabled: boolean;
    ess_view_only: boolean;
    requires_approval: boolean;
  };
}

function ModuleRow({ moduleCode, moduleName, onToggle, isUpdating, readiness, config }: ModuleRowProps) {
  const canEnable = readiness.isLicensed;
  
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="min-w-[200px]">
          <p className="font-medium text-sm">{moduleName}</p>
          <p className="text-xs text-muted-foreground">{moduleCode}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {readiness.isLicensed ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Licensed
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              <Lock className="h-3 w-3 mr-1" />
              Not Licensed
            </Badge>
          )}
          
          {readiness.isLicensed && (
            <>
              {readiness.isImplemented ? (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Implemented
                </Badge>
              ) : readiness.implementationStatus === 'in_progress' ? (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                  <Clock className="h-3 w-3 mr-1" />
                  In Progress
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Ready
                </Badge>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-16">ESS</span>
          <Switch
            checked={config.ess_enabled}
            onCheckedChange={(checked) => onToggle(moduleCode, 'ess_enabled', checked)}
            disabled={!canEnable || isUpdating}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <Switch
            checked={config.ess_view_only}
            onCheckedChange={(checked) => onToggle(moduleCode, 'ess_view_only', checked)}
            disabled={!config.ess_enabled || isUpdating}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
          <Switch
            checked={config.requires_approval}
            onCheckedChange={(checked) => onToggle(moduleCode, 'requires_approval', checked)}
            disabled={!config.ess_enabled || isUpdating}
          />
        </div>
      </div>
    </div>
  );
}

interface ESSModuleEnablementTabProps {
  companyId?: string | null;
}

export function ESSModuleEnablementTab({ companyId }: ESSModuleEnablementTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(['Profile & Personal Data']));
  
  const { 
    essConfigs, 
    getModuleReadiness, 
    getEssConfig,
    updateConfig, 
    bulkUpdateConfig,
    isUpdating,
    isLoading 
  } = useEssEntitlement(companyId);
  
  const modulesByCategory = useMemo(() => {
    const filtered = ESS_ELIGIBLE_MODULES.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return filtered.reduce((acc, module) => {
      if (!acc[module.category]) {
        acc[module.category] = [];
      }
      acc[module.category].push(module);
      return acc;
    }, {} as Record<string, typeof ESS_ELIGIBLE_MODULES>);
  }, [searchQuery]);
  
  const stats = useMemo(() => {
    let enabled = 0;
    let licensed = 0;
    let implemented = 0;
    
    ESS_ELIGIBLE_MODULES.forEach(m => {
      const readiness = getModuleReadiness(m.code);
      if (readiness.isLicensed) licensed++;
      if (readiness.isImplemented) implemented++;
      if (readiness.isEssEnabled) enabled++;
    });
    
    return { enabled, licensed, implemented, total: ESS_ELIGIBLE_MODULES.length };
  }, [essConfigs, getModuleReadiness]);
  
  const toggleCategory = (category: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };
  
  const handleToggle = (moduleCode: string, field: 'ess_enabled' | 'ess_view_only' | 'requires_approval', value: boolean) => {
    updateConfig({ module_code: moduleCode, [field]: value });
  };
  
  const handleEnableAll = () => {
    const licensedModules = ESS_ELIGIBLE_MODULES
      .filter(m => getModuleReadiness(m.code).isLicensed)
      .map(m => m.code);
    bulkUpdateConfig({ module_codes: licensedModules, ess_enabled: true });
  };
  
  const handleDisableAll = () => {
    const allModules = ESS_ELIGIBLE_MODULES.map(m => m.code);
    bulkUpdateConfig({ module_codes: allModules, ess_enabled: false });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ESS Enabled</p>
                <p className="text-2xl font-bold">{stats.enabled}</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Licensed</p>
                <p className="text-2xl font-bold">{stats.licensed}</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Implemented</p>
                <p className="text-2xl font-bold">{stats.implemented}</p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Modules</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Bulk Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleDisableAll} disabled={isUpdating}>
          <ToggleLeft className="h-4 w-4 mr-2" />
          Disable All
        </Button>
        <Button size="sm" onClick={handleEnableAll} disabled={isUpdating}>
          <ToggleRight className="h-4 w-4 mr-2" />
          Enable All Licensed
        </Button>
      </div>
      
      {/* Search and Module List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> View Only
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Requires Approval
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {Object.entries(modulesByCategory).map(([category, modules]) => (
            <Collapsible 
              key={category} 
              open={openCategories.has(category)}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors border-b">
                <div className="flex items-center gap-2">
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    !openCategories.has(category) && "-rotate-90"
                  )} />
                  <span className="font-medium">{category}</span>
                  <Badge variant="secondary" className="text-xs">
                    {modules.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {modules.filter(m => getEssConfig(m.code)?.ess_enabled).length > 0 && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-200">
                      {modules.filter(m => getEssConfig(m.code)?.ess_enabled).length} enabled
                    </Badge>
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {modules.map(module => {
                  const readiness = getModuleReadiness(module.code);
                  const config = getEssConfig(module.code);
                  
                  return (
                    <ModuleRow
                      key={module.code}
                      moduleCode={module.code}
                      moduleName={module.name}
                      readiness={readiness}
                      config={{
                        ess_enabled: config?.ess_enabled ?? false,
                        ess_view_only: config?.ess_view_only ?? false,
                        requires_approval: config?.requires_approval ?? true,
                      }}
                      onToggle={handleToggle}
                      isUpdating={isUpdating}
                    />
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>
      
      {/* Info Card */}
      <Card className="bg-muted/30 border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">How ESS Configuration Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Three-Layer Entitlement Model:</strong> Employees can only access modules that pass all three checks:
          </p>
          <ol className="list-decimal ml-4 space-y-1">
            <li><strong>Licensed</strong> - Module is included in your company's subscription</li>
            <li><strong>Implemented</strong> - Module has been configured and marked ready by implementation team</li>
            <li><strong>ESS Enabled</strong> - HR Admin has explicitly enabled ESS access for employees</li>
          </ol>
          <p className="pt-2">
            <strong>View Only:</strong> When enabled, employees can view data but cannot submit changes.
            <br />
            <strong>Requires Approval:</strong> When enabled, any employee submissions require manager/HR approval.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
