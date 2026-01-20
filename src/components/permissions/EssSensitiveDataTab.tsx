import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Settings, Eye, Edit, Clock, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { PermissionCell } from "./PermissionCell";
import { PermissionHeatmap, HeatmapRow, HeatmapColumn, HeatmapCell } from "./PermissionHeatmap";
import { EssModuleData, EssFieldData, RoleData, PII_DOMAINS } from "@/hooks/usePermissionsOverview";
import { Link } from "react-router-dom";

interface EssSensitiveDataTabProps {
  essModules: EssModuleData[];
  essFields: EssFieldData[];
  roles: RoleData[];
}

export function EssSensitiveDataTab({ essModules, essFields, roles }: EssSensitiveDataTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter fields by search
  const filteredFields = essFields.filter((field) =>
    !searchQuery ||
    field.field_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    field.module_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group fields by module
  const fieldsByModule = filteredFields.reduce((acc, field) => {
    if (!acc[field.module_code]) {
      acc[field.module_code] = [];
    }
    acc[field.module_code].push(field);
    return acc;
  }, {} as Record<string, EssFieldData[]>);

  // Build heatmap data for PII access by role
  const heatmapRows: HeatmapRow[] = roles.slice(0, 10).map(role => ({
    id: role.id,
    label: role.name,
  }));

  const heatmapColumns: HeatmapColumn[] = PII_DOMAINS.map(domain => ({
    id: domain.code,
    label: domain.label,
    shortLabel: domain.label.slice(0, 4),
  }));

  const heatmapData: HeatmapCell[] = roles.slice(0, 10).flatMap(role => 
    PII_DOMAINS.map(domain => {
      const key = `access_${domain.code}` as keyof typeof role.piiAccess;
      const hasAccess = role.piiAccess?.[key];
      let value = 0;
      if (hasAccess) {
        const piiLevel = role.piiAccess?.pii_level?.toLowerCase() || "none";
        if (piiLevel === "full") value = 4;
        else if (piiLevel === "limited") value = 2;
        else if (piiLevel === "masked") value = 1;
        else value = 3; // Has access but no level = configure
      }
      return {
        rowId: role.id,
        colId: domain.code,
        value,
      };
    })
  );

  return (
    <div className="space-y-6">
      {/* ESS Module Status Grid */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">ESS Module Status</CardTitle>
              <CardDescription>
                Which self-service modules are enabled for employees
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/ess-configuration">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {essModules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No ESS modules configured. Enable modules in ESS Configuration.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {essModules.map((module) => (
                <div
                  key={module.module_code}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    module.ess_enabled ? "bg-success/5 border-success/20" : "bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      module.ess_enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    )}>
                      {module.ess_enabled ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <Settings className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{module.module_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {module.is_view_only && (
                          <Badge variant="outline" className="text-[10px] h-4">
                            <Eye className="h-2.5 w-2.5 mr-1" />
                            View Only
                          </Badge>
                        )}
                        {module.requires_approval && (
                          <Badge variant="outline" className="text-[10px] h-4">
                            <FileCheck className="h-2.5 w-2.5 mr-1" />
                            Approval
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Switch checked={module.ess_enabled} disabled />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ESS Field Permissions Matrix */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">ESS Field Permissions</CardTitle>
              <CardDescription>
                Which fields employees can view or edit in self-service
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {essFields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No ESS field permissions configured.
            </p>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="min-w-[180px]">Field</TableHead>
                    <TableHead className="min-w-[120px]">Module</TableHead>
                    <TableHead className="text-center w-[80px]">View</TableHead>
                    <TableHead className="text-center w-[80px]">Edit</TableHead>
                    <TableHead className="min-w-[140px]">Approval Mode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFields.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No fields found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFields.map((field) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-medium text-sm">
                          {field.field_name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {field.module_code.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <PermissionCell level={field.can_view} size="sm" />
                        </TableCell>
                        <TableCell className="text-center">
                          <PermissionCell level={field.can_edit} size="sm" />
                        </TableCell>
                        <TableCell>
                          <ApprovalModeBadge mode={field.approval_mode} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PII Access Heatmap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">PII Access by Role</CardTitle>
          <CardDescription>
            Visual heatmap showing which roles can access sensitive data domains
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No roles configured with PII access.
            </p>
          ) : (
            <PermissionHeatmap
              rows={heatmapRows}
              columns={heatmapColumns}
              data={heatmapData}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ApprovalModeBadge({ mode }: { mode: string }) {
  const config: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    none: {
      label: "Auto-save",
      icon: null,
      className: "bg-muted text-muted-foreground",
    },
    manager: {
      label: "Manager",
      icon: <Clock className="h-3 w-3" />,
      className: "bg-warning/10 text-warning",
    },
    hr: {
      label: "HR Approval",
      icon: <FileCheck className="h-3 w-3" />,
      className: "bg-primary/10 text-primary",
    },
    workflow: {
      label: "Workflow",
      icon: <Edit className="h-3 w-3" />,
      className: "bg-success/10 text-success",
    },
  };

  const { label, icon, className } = config[mode] || config.none;

  return (
    <Badge variant="outline" className={cn("text-[10px] border-0", className)}>
      {icon}
      <span className={icon ? "ml-1" : ""}>{label}</span>
    </Badge>
  );
}
