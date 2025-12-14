import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuditLog } from "@/hooks/useAuditLog";
import { usePiiVisibility } from "@/hooks/usePiiVisibility";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Shield,
  UserCog,
  User,
  MoreHorizontal,
  Check,
  Loader2,
  Mail,
  Calendar,
  Building2,
  EyeOff,
} from "lucide-react";

type AppRole = "admin" | "hr_manager" | "employee";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface RoleDefinition {
  id: string;
  code: string;
  name: string;
}

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  roles: AppRole[];
  company_id: string | null;
  company_name: string | null;
}

const roleConfig: { value: AppRole; label: string; icon: React.ElementType; color: string }[] = [
  { value: "admin", label: "Admin", icon: Shield, color: "bg-destructive/10 text-destructive" },
  { value: "hr_manager", label: "HR Manager", icon: UserCog, color: "bg-primary/10 text-primary" },
  { value: "employee", label: "Employee", icon: User, color: "bg-muted text-muted-foreground" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [roleDefinitions, setRoleDefinitions] = useState<RoleDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openCompanyDropdown, setOpenCompanyDropdown] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { logView } = useAuditLog();
  const { canViewPii, maskPii } = usePiiVisibility();
  const hasLoggedView = useRef(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Log view when users are loaded
  useEffect(() => {
    if (users.length > 0 && !hasLoggedView.current) {
      hasLoggedView.current = true;
      logView('users_list', undefined, 'User Management', { user_count: users.length });
    }
  }, [users]);

  const fetchData = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Fetch all companies
      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");

      if (companiesError) throw companiesError;
      setCompanies(companiesData || []);

      // Fetch role definitions
      const { data: roleDefs, error: roleDefsError } = await supabase
        .from("roles")
        .select("id, code, name")
        .eq("is_active", true);

      if (roleDefsError) throw roleDefsError;
      setRoleDefinitions(roleDefs || []);

      // Create company lookup
      const companyLookup: Record<string, string> = {};
      (companiesData || []).forEach((c) => {
        companyLookup[c.id] = c.name;
      });

      // Combine profiles with their roles and company
      const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at,
        company_id: profile.company_id,
        company_name: profile.company_id ? companyLookup[profile.company_id] || null : null,
        roles: (roles || [])
          .filter((r) => r.user_id === profile.id)
          .map((r) => r.role as AppRole),
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: AppRole) => {
    if (userId === currentUser?.id && newRole !== "admin") {
      toast({
        title: "Cannot change your own role",
        description: "You cannot remove your own admin privileges.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingUserId(userId);
    setOpenDropdown(null);

    try {
      // Find role_id for the new role
      const roleDef = roleDefinitions.find(r => r.code === newRole);
      if (!roleDef) {
        throw new Error("Role definition not found");
      }

      // Delete existing roles for this user
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Insert new role with role_id
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole, role_id: roleDef.id });

      if (insertError) throw insertError;

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, roles: [newRole] } : u
        )
      );

      toast({
        title: "Role updated",
        description: `User role has been changed to ${roleConfig.find(r => r.value === newRole)?.label}.`,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const updateUserCompany = async (userId: string, companyId: string | null) => {
    setUpdatingUserId(userId);
    setOpenCompanyDropdown(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ company_id: companyId })
        .eq("id", userId);

      if (error) throw error;

      // Update local state
      const companyName = companyId 
        ? companies.find(c => c.id === companyId)?.name || null 
        : null;
      
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, company_id: companyId, company_name: companyName } : u
        )
      );

      toast({
        title: "Company updated",
        description: companyId ? "User has been assigned to company." : "User has been unassigned from company.",
      });
    } catch (error) {
      console.error("Error updating company:", error);
      toast({
        title: "Error",
        description: "Failed to update company. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getPrimaryRole = (roles: AppRole[]): AppRole => {
    if (roles.includes("admin")) return "admin";
    if (roles.includes("hr_manager")) return "hr_manager";
    return "employee";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Admin & Security", href: "/admin" },
          { label: "Users" }
        ]} />
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              User Management
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage users, roles, and company assignments
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
            <Shield className="h-4 w-4" />
            Admin Access
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4 animate-slide-up">
          {roleConfig.map((role) => {
            const count = users.filter((u) => getPrimaryRole(u.roles) === role.value).length;
            const Icon = role.icon;
            return (
              <div
                key={role.value}
                className="rounded-xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{role.label}s</p>
                    <p className="mt-1 text-3xl font-bold text-card-foreground">{count}</p>
                  </div>
                  <div className={cn("rounded-lg p-3", role.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Companies</p>
                <p className="mt-1 text-3xl font-bold text-card-foreground">{companies.length}</p>
              </div>
              <div className="rounded-lg bg-info/10 p-3 text-info">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {!canViewPii && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-600">
                  <EyeOff className="h-3.5 w-3.5" />
                  PII Hidden
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Personal information is hidden based on your role permissions</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Users Table */}
        <div className="rounded-xl border border-border bg-card shadow-card animate-slide-up" style={{ animationDelay: "150ms" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {searchQuery ? "No users found matching your search." : "No users found."}
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => {
                    const primaryRole = getPrimaryRole(user.roles);
                    const roleInfo = roleConfig.find((r) => r.value === primaryRole)!;
                    const RoleIcon = roleInfo.icon;
                    const isCurrentUser = user.id === currentUser?.id;

                    return (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                              {getInitials(user.full_name, user.email)}
                            </div>
                            <div>
                              <p className="font-medium text-card-foreground">
                                {user.full_name || "Unnamed User"}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                                )}
                              </p>
                              <p className={cn("text-sm text-muted-foreground", !canViewPii && "font-mono text-xs")}>
                                {maskPii(user.email, "email")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <button
                              onClick={() => setOpenCompanyDropdown(openCompanyDropdown === user.id ? null : user.id)}
                              disabled={updatingUserId === user.id}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                                user.company_name ? "text-card-foreground" : "text-muted-foreground"
                              )}
                            >
                              <Building2 className="h-4 w-4" />
                              {user.company_name || "Unassigned"}
                            </button>
                            {openCompanyDropdown === user.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setOpenCompanyDropdown(null)} />
                                <div className="absolute left-0 top-full z-50 mt-1 w-56 max-h-64 overflow-y-auto rounded-lg border border-border bg-popover py-1 shadow-lg">
                                  <p className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                                    Assign Company
                                  </p>
                                  <button
                                    onClick={() => updateUserCompany(user.id, null)}
                                    className={cn(
                                      "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted",
                                      !user.company_id ? "text-primary" : "text-card-foreground"
                                    )}
                                  >
                                    <span className="flex-1 text-left">Unassigned</span>
                                    {!user.company_id && <Check className="h-4 w-4" />}
                                  </button>
                                  {companies.map((company) => (
                                    <button
                                      key={company.id}
                                      onClick={() => updateUserCompany(user.id, company.id)}
                                      className={cn(
                                        "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted",
                                        user.company_id === company.id ? "text-primary" : "text-card-foreground"
                                      )}
                                    >
                                      <span className="flex-1 text-left">{company.name}</span>
                                      {user.company_id === company.id && <Check className="h-4 w-4" />}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                              roleInfo.color
                            )}
                          >
                            <RoleIcon className="h-3.5 w-3.5" />
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(user.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu
                            open={openDropdown === user.id}
                            onOpenChange={(open) =>
                              setOpenDropdown(open ? user.id : null)
                            }
                          >
                            <DropdownMenuTrigger asChild>
                              <button
                                disabled={updatingUserId === user.id}
                                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                              >
                                {updatingUserId === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="z-50 w-48"
                            >
                              <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                                Change Role
                              </DropdownMenuLabel>
                              {roleConfig.map((role) => (
                                <DropdownMenuItem
                                  key={role.value}
                                  onClick={() => updateUserRole(user.id, role.value)}
                                  className={cn(
                                    "flex w-full items-center gap-2 px-3 py-2 text-sm",
                                    primaryRole === role.value
                                      ? "text-primary"
                                      : "text-card-foreground"
                                  )}
                                >
                                  <role.icon className="h-4 w-4" />
                                  <span className="flex-1 text-left">{role.label}</span>
                                  {primaryRole === role.value && (
                                    <Check className="h-4 w-4" />
                                  )}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
