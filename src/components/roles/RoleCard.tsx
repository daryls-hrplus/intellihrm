import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Lock,
  Eye,
  Menu as MenuIcon,
  Pencil,
  Copy,
  Trash2,
  Settings2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Role,
  RoleType,
  PiiLevel,
  ContainerPermissionLevel,
  ROLE_TYPE_CONFIG,
  PII_LEVEL_CONFIG,
  CONTAINER_PERMISSION_CONFIG,
} from "@/types/roles";

interface RoleCardProps {
  role: Role & {
    pii_level?: PiiLevel;
    aggregate_container_permission?: ContainerPermissionLevel;
    modules_count?: number;
  };
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDuplicate: (role: Role) => void;
  onDelete: (role: Role) => void;
  onManagePermissions: (role: Role) => void;
}

export function RoleCard({
  role,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onManagePermissions,
}: RoleCardProps) {
  const roleTypeConfig = ROLE_TYPE_CONFIG[role.role_type as RoleType] || ROLE_TYPE_CONFIG.business;
  const piiLevel = role.pii_level || (role.can_view_pii ? "full" : "none");
  const piiConfig = PII_LEVEL_CONFIG[piiLevel];
  const containerPermission = role.aggregate_container_permission || "none";
  const containerConfig = CONTAINER_PERMISSION_CONFIG[containerPermission];
  const modulesCount = role.modules_count ?? role.menu_permissions?.length ?? 0;

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20",
        !role.is_active && "opacity-60"
      )}
    >
      {/* Seeded/System indicator */}
      {role.is_seeded && (
        <div className="absolute right-3 top-3">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{role.name}</h3>
          <p className="text-xs text-muted-foreground font-mono">{role.code}</p>
        </div>
      </div>

      {/* Description */}
      {role.description && (
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {role.description}
        </p>
      )}

      {/* Badges Row 1: Role Type & Seeded */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="outline" className={cn("text-xs", roleTypeConfig.color)}>
          {roleTypeConfig.label}
        </Badge>
        {role.is_seeded && (
          <Badge variant="outline" className="text-xs bg-slate-500/10 text-slate-600 dark:text-slate-400">
            <Lock className="mr-1 h-3 w-3" />
            Seeded
          </Badge>
        )}
        {!role.is_active && (
          <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600">
            Inactive
          </Badge>
        )}
      </div>

      {/* Badges Row 2: PII & Container Access */}
      <div className="mt-2 flex flex-wrap gap-2">
        <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", piiConfig.color)}>
          <Eye className="h-3 w-3" />
          {piiConfig.label}
        </div>
        {containerPermission !== "none" && (
          <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", containerConfig.color)}>
            <Settings2 className="h-3 w-3" />
            Admin: {containerConfig.label}
          </div>
        )}
        <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <MenuIcon className="h-3 w-3" />
          {modulesCount} modules
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-end gap-1 border-t pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(role)}
          className="h-8 px-2"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onManagePermissions(role)}
          className="h-8 px-2"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </Button>
        {!role.is_seeded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(role)}
            className="h-8 px-2"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDuplicate(role)}
          className="h-8 px-2"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
        {!role.is_seeded && !role.is_system && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-destructive hover:text-destructive"
            onClick={() => onDelete(role)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
