import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

type AppRole = "admin" | "hr_manager" | "employee";

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  roles: AppRole[];
}

const roleConfig: { value: AppRole; label: string; icon: React.ElementType; color: string }[] = [
  { value: "admin", label: "Admin", icon: Shield, color: "bg-destructive/10 text-destructive" },
  { value: "hr_manager", label: "HR Manager", icon: UserCog, color: "bg-primary/10 text-primary" },
  { value: "employee", label: "Employee", icon: User, color: "bg-muted text-muted-foreground" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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

      // Combine profiles with their roles
      const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at,
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
      // Delete existing roles for this user
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Insert new role
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole });

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

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
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
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              User Management
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage users and assign roles across your organization
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
            <Shield className="h-4 w-4" />
            Admin Access
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 animate-slide-up">
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
        </div>

        {/* Search */}
        <div className="relative animate-slide-up" style={{ animationDelay: "100ms" }}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Users Table */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "150ms" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {searchQuery ? "No users found matching your search." : "No users found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email
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
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {user.email}
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
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setOpenDropdown(openDropdown === user.id ? null : user.id)
                              }
                              disabled={updatingUserId === user.id}
                              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                            >
                              {updatingUserId === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </button>

                            {openDropdown === user.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenDropdown(null)}
                                />
                                <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-lg">
                                  <p className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                                    Change Role
                                  </p>
                                  {roleConfig.map((role) => (
                                    <button
                                      key={role.value}
                                      onClick={() => updateUserRole(user.id, role.value)}
                                      className={cn(
                                        "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted",
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
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
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
