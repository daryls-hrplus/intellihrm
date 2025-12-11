import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Loader2, Search, Users, Shield, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MENU_MODULES = [
  { code: "dashboard", label: "Dashboard", short: "Dash" },
  { code: "workforce", label: "Workforce", short: "WF" },
  { code: "leave", label: "Leave", short: "Leave" },
  { code: "compensation", label: "Compensation", short: "Comp" },
  { code: "benefits", label: "Benefits", short: "Ben" },
  { code: "performance", label: "Performance", short: "Perf" },
  { code: "training", label: "Training", short: "Train" },
  { code: "succession", label: "Succession", short: "Succ" },
  { code: "recruitment", label: "Recruitment", short: "Recr" },
  { code: "hse", label: "Health & Safety", short: "HSE" },
  { code: "employee_relations", label: "Employee Relations", short: "ER" },
  { code: "property", label: "Property", short: "Prop" },
  { code: "admin", label: "Admin", short: "Admin" },
];

interface UserPermission {
  id: string;
  email: string;
  full_name: string | null;
  roles: {
    id: string;
    name: string;
    code: string;
    menu_permissions: string[];
    can_view_pii: boolean;
  }[];
  effectivePermissions: string[];
  canViewPii: boolean;
  isAdmin: boolean;
}

interface Role {
  id: string;
  name: string;
  code: string;
  menu_permissions: string[];
  can_view_pii: boolean;
}

const breadcrumbItems = [
  { label: "Admin", href: "/admin" },
  { label: "Permissions Summary" },
];

export default function AdminPermissionsSummaryPage() {
  const [users, setUsers] = useState<UserPermission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (rolesError) throw rolesError;

      const mappedRoles: Role[] = (rolesData || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        code: r.code,
        menu_permissions: Array.isArray(r.menu_permissions) ? r.menu_permissions : [],
        can_view_pii: r.can_view_pii || false,
      }));
      setRoles(mappedRoles);

      // Fetch all profiles with their user_roles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .order("full_name");

      if (profilesError) throw profilesError;

      // Fetch user_roles with role details
      const { data: userRolesData, error: userRolesError } = await supabase
        .from("user_roles")
        .select("user_id, role_id, role");

      if (userRolesError) throw userRolesError;

      // Map profiles to permissions
      const userPermissions: UserPermission[] = (profilesData || []).map((profile: any) => {
        const userRoleEntries = (userRolesData || []).filter(
          (ur: any) => ur.user_id === profile.id
        );
        
        const userRoles = userRoleEntries
          .map((ur: any) => mappedRoles.find((r) => r.id === ur.role_id))
          .filter(Boolean) as Role[];

        // Check if user is admin (either by app_role enum or by role code)
        const isAdmin = userRoleEntries.some((ur: any) => ur.role === "admin") ||
          userRoles.some((r) => r.code === "admin");

        // Combine all permissions from all roles
        const effectivePermissions = new Set<string>();
        let canViewPii = false;

        userRoles.forEach((role) => {
          role.menu_permissions.forEach((p) => effectivePermissions.add(p));
          if (role.can_view_pii) canViewPii = true;
        });

        // Admins have all permissions
        if (isAdmin) {
          MENU_MODULES.forEach((m) => effectivePermissions.add(m.code));
          canViewPii = true;
        }

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          roles: userRoles,
          effectivePermissions: Array.from(effectivePermissions),
          canViewPii,
          isAdmin,
        };
      });

      setUsers(userPermissions);
    } catch (error) {
      console.error("Error fetching permissions data:", error);
    } finally {
      setIsLoading(false);
    }
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

    return matchesSearch && matchesRole;
  });

  // Stats
  const totalUsers = users.length;
  const usersWithPii = users.filter((u) => u.canViewPii).length;
  const adminUsers = users.filter((u) => u.isAdmin).length;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions Summary</h1>
          <p className="text-muted-foreground mt-1">
            View which users have access to which modules across the system
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <Shield className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{adminUsers}</p>
                  <p className="text-sm text-muted-foreground">Administrators</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-500/10 p-2">
                  <CheckCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{usersWithPii}</p>
                  <p className="text-sm text-muted-foreground">PII Access</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">User Permissions Matrix</CardTitle>
            <CardDescription>
              Green checkmarks indicate access to the module
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="no-role">No Role Assigned</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="sticky left-0 bg-muted/50 min-w-[200px]">User</TableHead>
                    <TableHead className="min-w-[120px]">Role(s)</TableHead>
                    <TableHead className="text-center w-[60px]">PII</TableHead>
                    {MENU_MODULES.map((module) => (
                      <TableHead
                        key={module.code}
                        className="text-center w-[50px]"
                        title={module.label}
                      >
                        <span className="text-xs">{module.short}</span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={MENU_MODULES.length + 3} className="text-center py-8 text-muted-foreground">
                        No users found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className={cn(user.isAdmin && "bg-warning/5")}>
                        <TableCell className="sticky left-0 bg-card">
                          <div>
                            <p className="font-medium">{user.full_name || "Unnamed"}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.isAdmin && (
                              <Badge variant="default" className="text-xs">
                                Admin
                              </Badge>
                            )}
                            {user.roles
                              .filter((r) => r.code !== "admin")
                              .map((role) => (
                                <Badge key={role.id} variant="secondary" className="text-xs">
                                  {role.name}
                                </Badge>
                              ))}
                            {user.roles.length === 0 && !user.isAdmin && (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {user.canViewPii ? (
                            <CheckCircle className="h-4 w-4 text-success mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </TableCell>
                        {MENU_MODULES.map((module) => (
                          <TableCell key={module.code} className="text-center">
                            {user.effectivePermissions.includes(module.code) ? (
                              <CheckCircle className="h-4 w-4 text-success mx-auto" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </CardContent>
        </Card>

        {/* Role Legend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Role Definitions</CardTitle>
            <CardDescription>
              Summary of permissions granted by each role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <div key={role.id} className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">{role.name}</h4>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {role.menu_permissions.length > 0 ? (
                      role.menu_permissions.map((perm) => {
                        const module = MENU_MODULES.find((m) => m.code === perm);
                        return (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {module?.short || perm}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-xs text-muted-foreground">No module access</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {role.can_view_pii ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-amber-600" />
                        <span>Can view PII</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        <span>No PII access</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
