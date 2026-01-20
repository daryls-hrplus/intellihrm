import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, ChevronDown, ChevronRight, Shield, Users, Settings, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PermissionCell, PermissionBadge } from "./PermissionCell";
import { RoleData, MENU_MODULES, ADMIN_CONTAINERS, PII_DOMAINS } from "@/hooks/usePermissionsOverview";
import { Link } from "react-router-dom";

interface RolePermissionsMatrixProps {
  roles: RoleData[];
}

export function RolePermissionsMatrix({ roles }: RolePermissionsMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<"all" | "seeded" | "custom">("all");

  const toggleExpanded = (roleId: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      !searchQuery ||
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === "all" ||
      (filterType === "seeded" && role.is_seeded) ||
      (filterType === "custom" && !role.is_seeded);

    return matchesSearch && matchesType;
  });

  // Group roles by type
  const seededRoles = filteredRoles.filter(r => r.is_seeded);
  const customRoles = filteredRoles.filter(r => !r.is_seeded);

  const getRoleTypeLabel = (roleType: string | null): string => {
    switch (roleType) {
      case "administrative": return "Admin";
      case "business": return "Business";
      case "self_service": return "ESS";
      default: return "Custom";
    }
  };

  const getRoleTypeColor = (roleType: string | null): string => {
    switch (roleType) {
      case "administrative": return "bg-primary/10 text-primary";
      case "business": return "bg-success/10 text-success";
      case "self_service": return "bg-warning/10 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
          >
            All ({roles.length})
          </Button>
          <Button
            variant={filterType === "seeded" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("seeded")}
          >
            <Lock className="h-3.5 w-3.5 mr-1" />
            System ({roles.filter(r => r.is_seeded).length})
          </Button>
          <Button
            variant={filterType === "custom" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("custom")}
          >
            <Settings className="h-3.5 w-3.5 mr-1" />
            Custom ({roles.filter(r => !r.is_seeded).length})
          </Button>
        </div>
      </div>

      {/* System Roles Section */}
      {seededRoles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">System Roles (Read-Only Templates)</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {seededRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                isExpanded={expandedRoles.has(role.id)}
                onToggle={() => toggleExpanded(role.id)}
                getRoleTypeLabel={getRoleTypeLabel}
                getRoleTypeColor={getRoleTypeColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom Roles Section */}
      {customRoles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Custom Roles</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {customRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                isExpanded={expandedRoles.has(role.id)}
                onToggle={() => toggleExpanded(role.id)}
                getRoleTypeLabel={getRoleTypeLabel}
                getRoleTypeColor={getRoleTypeColor}
              />
            ))}
          </div>
        </div>
      )}

      {filteredRoles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No roles found matching your criteria
        </div>
      )}
    </div>
  );
}

interface RoleCardProps {
  role: RoleData;
  isExpanded: boolean;
  onToggle: () => void;
  getRoleTypeLabel: (type: string | null) => string;
  getRoleTypeColor: (type: string | null) => string;
}

function RoleCard({ role, isExpanded, onToggle, getRoleTypeLabel, getRoleTypeColor }: RoleCardProps) {
  const moduleCount = role.menu_permissions.length;
  const piiLevel = role.piiAccess?.pii_level || "none";
  const containerCount = role.containerAccess.filter(
    c => c.permission_level !== "none"
  ).length;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className={cn(role.is_seeded && "border-dashed")}>
        <CardContent className="p-4">
          <CollapsibleTrigger asChild>
            <button className="w-full text-left">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-sm">{role.name}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-[10px] h-5", getRoleTypeColor(role.role_type))}>
                    {getRoleTypeLabel(role.role_type)}
                  </Badge>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{role.userCount} users</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Modules:</span>
                  <span className="font-medium">{moduleCount}/{MENU_MODULES.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">PII:</span>
                  <PermissionBadge level={piiLevel as any} />
                </div>
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-4 pt-4 border-t space-y-4">
            {/* Description */}
            {role.description && (
              <p className="text-xs text-muted-foreground">{role.description}</p>
            )}

            {/* Module Access */}
            <div>
              <h5 className="text-xs font-medium mb-2">Module Access</h5>
              <div className="flex flex-wrap gap-1">
                {role.menu_permissions.length > 0 ? (
                  role.menu_permissions.map((perm) => {
                    const module = MENU_MODULES.find((m) => m.code === perm);
                    return (
                      <Badge key={perm} variant="outline" className="text-[10px]">
                        {module?.short || perm}
                      </Badge>
                    );
                  })
                ) : (
                  <span className="text-xs text-muted-foreground">No module access</span>
                )}
              </div>
            </div>

            {/* PII Access */}
            {role.piiAccess && (
              <div>
                <h5 className="text-xs font-medium mb-2">PII Domain Access</h5>
                <div className="flex flex-wrap gap-2">
                  {PII_DOMAINS.map((domain) => {
                    const key = `access_${domain.code}` as keyof typeof role.piiAccess;
                    const hasAccess = role.piiAccess?.[key];
                    return (
                      <div key={domain.code} className="flex items-center gap-1 text-xs">
                        <PermissionCell level={hasAccess as boolean} size="sm" showTooltip={false} />
                        <span>{domain.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Container Access */}
            {role.containerAccess.length > 0 && (
              <div>
                <h5 className="text-xs font-medium mb-2">Admin Containers</h5>
                <div className="flex flex-wrap gap-2">
                  {ADMIN_CONTAINERS.map((container) => {
                    const access = role.containerAccess.find(c => c.container_code === container.code);
                    const level = access?.permission_level || "none";
                    if (level === "none") return null;
                    return (
                      <div key={container.code} className="flex items-center gap-1 text-xs">
                        <PermissionCell level={level} size="sm" showTooltip={false} />
                        <span>{container.short}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/admin/roles/${role.id}`}>View Details</Link>
              </Button>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}
