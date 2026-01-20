import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, ChevronDown, ChevronRight, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PermissionCell, PermissionBadge } from "./PermissionCell";
import { RiskDot } from "./PermissionRiskBadge";
import { UserPermissionData, RoleData, MENU_MODULES, ADMIN_CONTAINERS } from "@/hooks/usePermissionsOverview";

interface UserAccessMatrixProps {
  users: UserPermissionData[];
  roles: RoleData[];
  showCompanyColumn?: boolean;
}

type FilterType = "all" | "admin" | "pii" | "high-risk" | "no-role";
type PiiFilter = "all" | "full" | "limited" | "masked" | "none";

export function UserAccessMatrix({ users, roles, showCompanyColumn = false }: UserAccessMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedPii, setSelectedPii] = useState<PiiFilter>("all");
  const [selectedRisk, setSelectedRisk] = useState<string>("all");
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);

  const toggleExpanded = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRole("all");
    setSelectedPii("all");
    setSelectedRisk("all");
    setActiveFilters([]);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRole === "all" ||
      user.roles.some((r) => r.id === selectedRole) ||
      (selectedRole === "no-role" && user.roles.length === 0);

    const matchesPii = selectedPii === "all" || user.piiLevel === selectedPii;

    const matchesRisk = selectedRisk === "all" || user.riskLevel === selectedRisk;

    return matchesSearch && matchesRole && matchesPii && matchesRisk;
  });

  const hasActiveFilters = searchQuery || selectedRole !== "all" || selectedPii !== "all" || selectedRisk !== "all";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="no-role">No Role</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPii} onValueChange={(v) => setSelectedPii(v as PiiFilter)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="PII Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All PII</SelectItem>
            <SelectItem value="full">Full PII</SelectItem>
            <SelectItem value="limited">Limited</SelectItem>
            <SelectItem value="masked">Masked</SelectItem>
            <SelectItem value="none">No PII</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedRisk} onValueChange={setSelectedRisk}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Matrix Table */}
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="sticky left-0 bg-muted/50 min-w-[220px] z-10">User</TableHead>
              {showCompanyColumn && (
                <TableHead className="min-w-[100px]">Company</TableHead>
              )}
              <TableHead className="min-w-[140px]">Role(s)</TableHead>
              <TableHead className="text-center w-[70px]">PII</TableHead>
              <TableHead className="text-center w-[70px]">Admin</TableHead>
              <TableHead className="text-center w-[60px]">Risk</TableHead>
              {MENU_MODULES.map((module) => (
                <TableHead
                  key={module.code}
                  className="text-center w-[50px]"
                  title={module.label}
                >
                  <span className="text-[10px] font-medium">{module.short}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={MENU_MODULES.length + (showCompanyColumn ? 6 : 5)} className="text-center py-8 text-muted-foreground">
                  No users found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <Collapsible key={user.id} asChild open={expandedUsers.has(user.id)}>
                  <>
                    <TableRow className={cn(user.isAdmin && "bg-warning/5", user.riskLevel === "high" && "bg-destructive/5")}>
                      <TableCell className="sticky left-0 bg-card z-10">
                        <CollapsibleTrigger asChild>
                          <button 
                            className="flex items-center gap-3 w-full text-left hover:bg-muted/50 -mx-2 px-2 py-1 rounded"
                            onClick={() => toggleExpanded(user.id)}
                          >
                            {expandedUsers.has(user.id) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {user.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{user.full_name || "Unnamed"}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                      </TableCell>
                      {showCompanyColumn && (
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] h-5 font-medium">
                            {user.companyCode || "—"}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.isAdmin && (
                            <Badge variant="default" className="text-[10px] h-5">Admin</Badge>
                          )}
                          {user.roles.filter(r => r.code !== "admin").slice(0, 2).map((role) => (
                            <Badge key={role.id} variant="secondary" className="text-[10px] h-5">
                              {role.name}
                            </Badge>
                          ))}
                          {user.roles.length > 2 && (
                            <Badge variant="outline" className="text-[10px] h-5">
                              +{user.roles.length - 2}
                            </Badge>
                          )}
                          {user.roles.length === 0 && !user.isAdmin && (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <PermissionBadge level={user.piiLevel} />
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-xs font-medium">
                          {user.adminContainerCount}/{ADMIN_CONTAINERS.length}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <RiskDot level={user.riskLevel} />
                      </TableCell>
                      {MENU_MODULES.map((module) => (
                        <TableCell key={module.code} className="text-center">
                          <PermissionCell
                            level={user.effectiveModules.includes(module.code)}
                            size="sm"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                    
                    <CollapsibleContent asChild>
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={MENU_MODULES.length + (showCompanyColumn ? 6 : 5)} className="py-4">
                          <UserExpandedDetail user={user} showCompanyColumn={showCompanyColumn} />
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} users
      </p>
    </div>
  );
}

function UserExpandedDetail({ user, showCompanyColumn }: { user: UserPermissionData; showCompanyColumn?: boolean }) {
  return (
    <div className={cn("grid gap-6 px-4", showCompanyColumn ? "grid-cols-1 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3")}>
      {/* Company (only when viewing all companies) */}
      {showCompanyColumn && (
        <div>
          <h5 className="text-sm font-medium mb-2">Company</h5>
          <div className="space-y-1">
            <p className="text-sm font-medium">{user.companyName || "Unknown"}</p>
            <Badge variant="outline" className="text-xs">{user.companyCode || "—"}</Badge>
          </div>
        </div>
      )}

      {/* Roles */}
      <div>
        <h5 className="text-sm font-medium mb-2">Assigned Roles</h5>
        <div className="space-y-2">
          {user.roles.length === 0 ? (
            <p className="text-xs text-muted-foreground">No roles assigned</p>
          ) : (
            user.roles.map(role => (
              <div key={role.id} className="flex items-center gap-2">
                <Badge variant={role.is_seeded ? "outline" : "secondary"} className="text-xs">
                  {role.name}
                </Badge>
                {role.is_seeded && (
                  <span className="text-[10px] text-muted-foreground">System Role</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* PII Access */}
      <div>
        <h5 className="text-sm font-medium mb-2">PII Domain Access</h5>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {user.roles.flatMap(r => r.piiAccess ? [r.piiAccess] : []).length === 0 ? (
            <p className="text-muted-foreground col-span-2">No PII access configured</p>
          ) : (
            <>
              {["personal", "compensation", "banking", "medical", "disciplinary"].map(domain => {
                const hasAccess = user.roles.some(r => 
                  r.piiAccess?.[`access_${domain}` as keyof typeof r.piiAccess]
                );
                return (
                  <div key={domain} className="flex items-center gap-2">
                    <PermissionCell level={hasAccess} size="sm" showTooltip={false} />
                    <span className="capitalize">{domain}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Admin Containers */}
      <div>
        <h5 className="text-sm font-medium mb-2">Admin Container Access</h5>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {ADMIN_CONTAINERS.map(container => {
            const highestLevel = user.roles.reduce((highest, role) => {
              const access = role.containerAccess.find(c => c.container_code === container.code);
              if (!access) return highest;
              const levels = { none: 0, view: 1, configure: 2, approve: 3 };
              return levels[access.permission_level] > levels[highest] ? access.permission_level : highest;
            }, "none" as "none" | "view" | "configure" | "approve");
            
            return (
              <div key={container.code} className="flex items-center gap-2">
                <PermissionCell level={highestLevel} size="sm" showTooltip={false} />
                <span>{container.short}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
