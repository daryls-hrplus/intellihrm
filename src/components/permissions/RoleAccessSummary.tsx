import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LayoutGrid,
  Layers,
  Building2,
  Eye,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleAccessStats {
  totalModules: number;
  accessibleModules: number;
  totalTabs: number;
  accessibleTabs: number;
}

interface OrgScopeStats {
  companiesSelected: number;
  tagsSelected: number;
  totalCompanies: number;
  isAllAccess: boolean;
}

interface RoleAccessSummaryProps {
  role: {
    id: string;
    name: string;
    code: string;
    role_type: string;
  };
  moduleStats: ModuleAccessStats;
  orgScopeStats: OrgScopeStats;
  hasUnsavedChanges: boolean;
}

export function RoleAccessSummary({
  role,
  moduleStats,
  orgScopeStats,
  hasUnsavedChanges,
}: RoleAccessSummaryProps) {
  const moduleProgress = (moduleStats.accessibleModules / moduleStats.totalModules) * 100;
  const tabProgress = (moduleStats.accessibleTabs / moduleStats.totalTabs) * 100;

  const getAccessLevelBadge = () => {
    if (moduleProgress >= 80) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Full Access
        </Badge>
      );
    } else if (moduleProgress >= 40) {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Partial Access
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-muted text-muted-foreground border-border">
          <XCircle className="h-3 w-3 mr-1" />
          Restricted
        </Badge>
      );
    }
  };

  const getRoleTypeBadge = () => {
    if (role.role_type === "system") {
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-200">
          System
        </Badge>
      );
    } else if (role.role_type === "seeded") {
      return (
        <Badge variant="outline" className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200">
          Template
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200">
        Custom
      </Badge>
    );
  };

  return (
    <Card className="bg-white dark:bg-card border shadow-sm">
      <CardContent className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Modules Access */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LayoutGrid className="h-4 w-4" />
              <span>Modules</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{moduleStats.accessibleModules}</span>
              <span className="text-muted-foreground">/ {moduleStats.totalModules}</span>
            </div>
            <Progress value={moduleProgress} className="h-1.5" />
          </div>

          {/* Tabs Enabled */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span>Tabs Enabled</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{moduleStats.accessibleTabs}</span>
              <span className="text-muted-foreground">/ {moduleStats.totalTabs}</span>
            </div>
            <Progress value={tabProgress} className="h-1.5" />
          </div>

          {/* Company Scope */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>Company Scope</span>
            </div>
            <div className="text-2xl font-bold">
              {orgScopeStats.isAllAccess ? (
                <span className="text-emerald-600 dark:text-emerald-400">All</span>
              ) : orgScopeStats.companiesSelected + orgScopeStats.tagsSelected > 0 ? (
                <span>
                  {orgScopeStats.companiesSelected > 0 && `${orgScopeStats.companiesSelected} Co.`}
                  {orgScopeStats.companiesSelected > 0 && orgScopeStats.tagsSelected > 0 && ", "}
                  {orgScopeStats.tagsSelected > 0 && `${orgScopeStats.tagsSelected} Tags`}
                </span>
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {orgScopeStats.isAllAccess
                ? "Full organizational access"
                : orgScopeStats.companiesSelected + orgScopeStats.tagsSelected > 0
                ? "Scoped access"
                : "No company access configured"}
            </div>
          </div>

          {/* Access Level */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>Access Level</span>
            </div>
            <div className={cn(
              "text-2xl font-bold",
              moduleProgress >= 80 && "text-emerald-600 dark:text-emerald-400",
              moduleProgress >= 40 && moduleProgress < 80 && "text-amber-600 dark:text-amber-400",
              moduleProgress < 40 && "text-muted-foreground"
            )}>
              {moduleProgress >= 80 ? "High" : moduleProgress >= 40 ? "Medium" : "Low"}
            </div>
            <div className="text-xs text-muted-foreground">
              {moduleProgress >= 80 
                ? "Extensive system access" 
                : moduleProgress >= 40 
                ? "Moderate permissions" 
                : "Limited visibility"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
