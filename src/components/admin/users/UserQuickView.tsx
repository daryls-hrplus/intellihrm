import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Shield,
  UserCog,
  User,
  Mail,
  Building2,
  Clock,
  Calendar,
  Edit,
  Key,
  UserX,
  UserCheck,
  LogOut,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  roles: string[];
  company_id: string | null;
  company_name: string | null;
  department_id: string | null;
  department_name: string | null;
  section_id: string | null;
  section_name: string | null;
  is_active: boolean;
  invited_at: string | null;
  invitation_status: string | null;
  last_login_at: string | null;
  force_password_change: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
}

interface RoleDefinition {
  id: string;
  code: string;
  name: string;
}

interface UserQuickViewProps {
  user: UserWithRoles | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleDefinitions: RoleDefinition[];
  onEdit: (user: UserWithRoles) => void;
  onAction: (userId: string, action: string) => void;
  isCurrentUser: boolean;
  canViewPii: boolean;
  maskPii: (value: string, type: string) => string;
}

const defaultRoleStyles: Record<string, { icon: React.ElementType; color: string }> = {
  admin: { icon: Shield, color: "bg-destructive/10 text-destructive" },
  hr_manager: { icon: UserCog, color: "bg-primary/10 text-primary" },
  employee: { icon: User, color: "bg-muted text-muted-foreground" },
};

const getRoleStyle = (roleCode: string) => {
  return defaultRoleStyles[roleCode] || { icon: User, color: "bg-secondary text-secondary-foreground" };
};

export function UserQuickView({
  user,
  open,
  onOpenChange,
  roleDefinitions,
  onEdit,
  onAction,
  isCurrentUser,
  canViewPii,
  maskPii,
}: UserQuickViewProps) {
  if (!user) return null;

  const getRoleName = (roleCode: string): string => {
    return roleDefinitions.find(r => r.code === roleCode)?.name || roleCode;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return "";
  };

  const isLocked = user.locked_until && new Date(user.locked_until) > new Date();
  const isRecentlyActive = user.last_login_at && 
    (new Date().getTime() - new Date(user.last_login_at).getTime()) < 15 * 60 * 1000;

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="text-left">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold",
                user.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {getInitials(user.full_name, user.email)}
              </div>
              {isRecentlyActive && (
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-success border-2 border-background" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl truncate">
                {user.full_name || "Unnamed User"}
                {isCurrentUser && <span className="ml-2 text-sm text-muted-foreground font-normal">(You)</span>}
              </SheetTitle>
              <SheetDescription className="mt-1">
                <span className={cn(!canViewPii && "font-mono text-xs")}>
                  {maskPii(user.email, "email")}
                </span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Status Badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant={user.is_active ? "default" : "destructive"} className="gap-1">
            {user.is_active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {user.is_active ? "Active" : "Disabled"}
          </Badge>
          {user.invitation_status === "pending" && (
            <Badge variant="outline" className="text-amber-600 border-amber-300 gap-1">
              <Mail className="h-3 w-3" />
              Invite Pending
            </Badge>
          )}
          {isLocked && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Locked
            </Badge>
          )}
          {user.force_password_change && (
            <Badge variant="outline" className="text-amber-600 border-amber-300 gap-1">
              <Key className="h-3 w-3" />
              Password Change Required
            </Badge>
          )}
        </div>

        <Separator className="my-6" />

        {/* Organization Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Organization</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">{user.company_name || "No company assigned"}</p>
                {user.department_name && (
                  <p className="text-sm text-muted-foreground">{user.department_name}</p>
                )}
                {user.section_name && (
                  <p className="text-xs text-muted-foreground">{user.section_name}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Roles */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Assigned Roles</h4>
          <div className="flex flex-wrap gap-2">
            {user.roles.length > 0 ? user.roles.map(role => {
              const style = getRoleStyle(role);
              const Icon = style.icon;
              return (
                <Badge key={role} variant="secondary" className={cn("gap-1", style.color)}>
                  <Icon className="h-3 w-3" />
                  {getRoleName(role)}
                </Badge>
              );
            }) : (
              <p className="text-sm text-muted-foreground">No roles assigned</p>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Activity */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Activity</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm">Last Login</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(user.last_login_at)}
                  {getRelativeTime(user.last_login_at) && (
                    <span className="ml-2 text-xs">({getRelativeTime(user.last_login_at)})</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm">Member Since</p>
                <p className="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
              </div>
            </div>
            {user.failed_login_attempts > 0 && (
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <div>
                  <p className="text-sm">Failed Login Attempts</p>
                  <p className="text-sm text-muted-foreground">{user.failed_login_attempts} attempts</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Quick Actions */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(user)} className="justify-start">
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAction(user.id, "generate_temp_password")} className="justify-start">
              <Key className="mr-2 h-4 w-4" />
              Reset Password
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAction(user.id, "revoke_sessions")} className="justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Revoke Sessions
            </Button>
            {(isLocked || user.failed_login_attempts > 0) && (
              <Button variant="outline" size="sm" onClick={() => onAction(user.id, "unlock_account")} className="justify-start">
                <Unlock className="mr-2 h-4 w-4" />
                Unlock Account
              </Button>
            )}
          </div>

          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4 mt-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">User Status</p>
              <p className="text-xs text-muted-foreground">
                {user.is_active ? "User can access the system" : "User is disabled"}
              </p>
            </div>
            <Switch
              checked={user.is_active}
              onCheckedChange={(checked) => {
                if (!isCurrentUser) {
                  onAction(user.id, checked ? "enable" : "disable");
                }
              }}
              disabled={isCurrentUser}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
