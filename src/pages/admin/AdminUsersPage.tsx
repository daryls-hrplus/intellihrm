import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuditLog } from "@/hooks/useAuditLog";
import { usePiiVisibility } from "@/hooks/usePiiVisibility";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenuSeparator,
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
  Calendar,
  Building2,
  EyeOff,
  UserPlus,
  Mail,
  Key,
  UserX,
  UserCheck,
  Copy,
  Ban,
  Download,
  Edit,
  LogOut,
  Unlock,
  Clock,
  Filter,
  Users,
} from "lucide-react";

type AppRole = string;

interface Company {
  id: string;
  name: string;
  code: string;
}

interface Department {
  id: string;
  name: string;
  company_id: string;
}

interface Section {
  id: string;
  name: string;
  department_id: string;
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

// Default styling for known roles
const defaultRoleStyles: Record<string, { icon: React.ElementType; color: string }> = {
  admin: { icon: Shield, color: "bg-destructive/10 text-destructive" },
  hr_manager: { icon: UserCog, color: "bg-primary/10 text-primary" },
  employee: { icon: User, color: "bg-muted text-muted-foreground" },
};

const getRoleStyle = (roleCode: string) => {
  return defaultRoleStyles[roleCode] || { icon: User, color: "bg-secondary text-secondary-foreground" };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [roleDefinitions, setRoleDefinitions] = useState<RoleDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  
  // Selection for bulk operations
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Invite dialog state
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");
  const [inviteCompanyId, setInviteCompanyId] = useState<string>("");
  const [inviteDepartmentId, setInviteDepartmentId] = useState<string>("");
  const [inviteSectionId, setInviteSectionId] = useState<string>("");
  const [isInviting, setIsInviting] = useState(false);
  
  // Edit dialog state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editUser, setEditUser] = useState<UserWithRoles | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editCompanyId, setEditCompanyId] = useState<string>("");
  const [editDepartmentId, setEditDepartmentId] = useState<string>("");
  const [editSectionId, setEditSectionId] = useState<string>("");
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  
  // Temp password dialog state
  const [showTempPasswordDialog, setShowTempPasswordDialog] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [tempPasswordEmail, setTempPasswordEmail] = useState("");
  
  // Bulk role dialog
  const [showBulkRoleDialog, setShowBulkRoleDialog] = useState(false);
  const [bulkRoles, setBulkRoles] = useState<string[]>([]);
  
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { logView, logAction } = useAuditLog();
  const { canViewPii, maskPii } = usePiiVisibility();
  const hasLoggedView = useRef(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (users.length > 0 && !hasLoggedView.current) {
      hasLoggedView.current = true;
      logView('users_list', undefined, 'User Management', { user_count: users.length });
    }
  }, [users]);

  // Filter departments when company changes
  const filteredDepartments = departments.filter(d => 
    !editCompanyId || d.company_id === editCompanyId
  );
  const inviteFilteredDepartments = departments.filter(d => 
    !inviteCompanyId || d.company_id === inviteCompanyId
  );

  // Filter sections when department changes
  const filteredSections = sections.filter(s => 
    !editDepartmentId || s.department_id === editDepartmentId
  );
  const inviteFilteredSections = sections.filter(s => 
    !inviteDepartmentId || s.department_id === inviteDepartmentId
  );

  const fetchData = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");

      if (companiesError) throw companiesError;
      setCompanies(companiesData || []);

      const { data: departmentsData } = await supabase
        .from("departments")
        .select("id, name, company_id")
        .eq("is_active", true)
        .order("name");
      setDepartments(departmentsData || []);

      const { data: sectionsData } = await supabase
        .from("sections")
        .select("id, name, department_id")
        .eq("is_active", true)
        .order("name");
      setSections(sectionsData || []);

      const { data: roleDefs, error: roleDefsError } = await supabase
        .from("roles")
        .select("id, code, name")
        .eq("is_active", true);

      if (roleDefsError) throw roleDefsError;
      setRoleDefinitions(roleDefs || []);

      // Create lookups
      const companyLookup: Record<string, string> = {};
      (companiesData || []).forEach((c) => { companyLookup[c.id] = c.name; });
      
      const deptLookup: Record<string, string> = {};
      (departmentsData || []).forEach((d) => { deptLookup[d.id] = d.name; });
      
      const sectionLookup: Record<string, string> = {};
      (sectionsData || []).forEach((s) => { sectionLookup[s.id] = s.name; });

      const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at,
        company_id: profile.company_id,
        company_name: profile.company_id ? companyLookup[profile.company_id] || null : null,
        department_id: profile.department_id,
        department_name: profile.department_id ? deptLookup[profile.department_id] || null : null,
        section_id: profile.section_id,
        section_name: profile.section_id ? sectionLookup[profile.section_id] || null : null,
        is_active: profile.is_active ?? true,
        invited_at: profile.invited_at,
        invitation_status: profile.invitation_status,
        last_login_at: profile.last_login_at,
        force_password_change: profile.force_password_change ?? false,
        failed_login_attempts: profile.failed_login_attempts ?? 0,
        locked_until: profile.locked_until,
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

  const invokeManageUser = async (body: Record<string, unknown>) => {
    const { data: session } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke("manage-user", {
      body,
      headers: {
        Authorization: `Bearer ${session?.session?.access_token}`,
      },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const handleInviteUser = async () => {
    if (!inviteEmail) {
      toast({ title: "Email required", variant: "destructive" });
      return;
    }

    setIsInviting(true);
    try {
      const data = await invokeManageUser({
        action: "invite",
        email: inviteEmail,
        full_name: inviteFullName,
        company_id: inviteCompanyId || null,
        department_id: inviteDepartmentId || null,
        section_id: inviteSectionId || null,
      });

      logAction({
        action: "CREATE",
        entityType: "user",
        entityId: data.user_id,
        entityName: inviteEmail,
        newValues: { email: inviteEmail, full_name: inviteFullName },
      });

      setTempPasswordEmail(inviteEmail);
      setTempPassword(data.temp_password);
      setShowInviteDialog(false);
      setShowTempPasswordDialog(true);
      
      setInviteEmail("");
      setInviteFullName("");
      setInviteCompanyId("");
      setInviteDepartmentId("");
      setInviteSectionId("");
      
      fetchData();

      toast({
        title: "User invited",
        description: data.email_sent ? "Invitation email sent." : "User created (email not configured).",
      });
    } catch (error: unknown) {
      console.error("Error inviting user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to invite user.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleEditUser = (user: UserWithRoles) => {
    setEditUser(user);
    setEditFullName(user.full_name || "");
    setEditCompanyId(user.company_id || "");
    setEditDepartmentId(user.department_id || "");
    setEditSectionId(user.section_id || "");
    setEditRoles(user.roles);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;

    setIsSavingEdit(true);
    try {
      // Update profile
      await invokeManageUser({
        action: "update_profile",
        user_id: editUser.id,
        full_name: editFullName,
        company_id: editCompanyId || null,
        department_id: editDepartmentId || null,
        section_id: editSectionId || null,
      });

      // Update roles if changed
      if (JSON.stringify(editRoles.sort()) !== JSON.stringify(editUser.roles.sort())) {
        await invokeManageUser({
          action: "update_roles",
          user_id: editUser.id,
          roles: editRoles,
        });
      }

      logAction({
        action: "UPDATE",
        entityType: "user",
        entityId: editUser.id,
        entityName: editUser.email,
        oldValues: { full_name: editUser.full_name, roles: editUser.roles },
        newValues: { full_name: editFullName, roles: editRoles },
      });

      setShowEditDialog(false);
      fetchData();
      toast({ title: "User updated" });
    } catch (error: unknown) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user.",
        variant: "destructive",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    setUpdatingUserId(userId);
    setOpenDropdown(null);

    try {
      const data = await invokeManageUser({ action, user_id: userId });

      if (action === "resend_invite" || action === "generate_temp_password") {
        const user = users.find(u => u.id === userId);
        setTempPasswordEmail(user?.email || "");
        setTempPassword(data.temp_password);
        setShowTempPasswordDialog(true);
      }

      if (action === "enable" || action === "disable") {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: action === "enable" } : u));
      }

      const actionMessages: Record<string, string> = {
        resend_invite: "Invite resent",
        generate_temp_password: "Password reset",
        enable: "User enabled",
        disable: "User disabled",
        force_password_change: "Password change required on next login",
        unlock_account: "Account unlocked",
        revoke_sessions: "All sessions revoked",
      };

      toast({ title: actionMessages[action] || "Action completed" });
      
      if (["unlock_account", "force_password_change"].includes(action)) {
        fetchData();
      }
    } catch (error: unknown) {
      console.error(`Error ${action}:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Action failed.",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.size === 0) return;

    const userIds = Array.from(selectedUsers);
    
    try {
      if (action === "bulk_update_roles") {
        setShowBulkRoleDialog(true);
        return;
      }

      await invokeManageUser({ action, user_ids: userIds });
      
      toast({
        title: "Bulk action completed",
        description: `${userIds.length} users updated.`,
      });
      
      setSelectedUsers(new Set());
      fetchData();
    } catch (error: unknown) {
      console.error("Bulk action error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Bulk action failed.",
        variant: "destructive",
      });
    }
  };

  const handleBulkRoleUpdate = async () => {
    if (selectedUsers.size === 0 || bulkRoles.length === 0) return;

    try {
      await invokeManageUser({
        action: "bulk_update_roles",
        user_ids: Array.from(selectedUsers),
        roles: bulkRoles,
      });

      toast({
        title: "Roles updated",
        description: `${selectedUsers.size} users updated.`,
      });

      setShowBulkRoleDialog(false);
      setBulkRoles([]);
      setSelectedUsers(new Set());
      fetchData();
    } catch (error: unknown) {
      console.error("Bulk role update error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update roles.",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Company", "Department", "Roles", "Status", "Last Login", "Created"];
    const rows = filteredUsers.map(u => [
      u.full_name || "",
      canViewPii ? u.email : "***@***",
      u.company_name || "",
      u.department_name || "",
      u.roles.map(r => getRoleName(r)).join("; "),
      u.is_active ? "Active" : "Disabled",
      u.last_login_at ? formatDate(u.last_login_at) : "Never",
      formatDate(u.created_at),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    logAction({ action: "EXPORT", entityType: "users", metadata: { count: filteredUsers.length } });
    toast({ title: "Exported", description: `${filteredUsers.length} users exported to CSV.` });
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied" });
  };

  // Apply filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && user.is_active) ||
      (filterStatus === "disabled" && !user.is_active);
    
    const matchesRole = filterRole === "all" || user.roles.includes(filterRole);
    
    const matchesCompany = filterCompany === "all" || user.company_id === filterCompany;

    return matchesSearch && matchesStatus && matchesRole && matchesCompany;
  });

  const activeUsers = users.filter(u => u.is_active);
  const disabledUsers = users.filter(u => !u.is_active);

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getPrimaryRole = (roles: string[]): string => roles[0] || "employee";

  const getRoleName = (roleCode: string): string => {
    return roleDefinitions.find(r => r.code === roleCode)?.name || roleCode;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setShowInviteDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-5 animate-slide-up">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="mt-1 text-3xl font-bold text-card-foreground">{users.length}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
          {roleDefinitions.slice(0, 2).map((role) => {
            const count = users.filter((u) => u.roles.includes(role.code)).length;
            const style = getRoleStyle(role.code);
            const Icon = style.icon;
            return (
              <div key={role.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{role.name}s</p>
                    <p className="mt-1 text-3xl font-bold text-card-foreground">{count}</p>
                  </div>
                  <div className={cn("rounded-lg p-3", style.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="mt-1 text-3xl font-bold text-card-foreground">{activeUsers.length}</p>
              </div>
              <div className="rounded-lg bg-success/10 p-3 text-success">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disabled</p>
                <p className="mt-1 text-3xl font-bold text-card-foreground">{disabledUsers.length}</p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
                <Ban className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roleDefinitions.map(role => (
                  <SelectItem key={role.id} value={role.code}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

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
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="flex items-center gap-4 rounded-lg bg-primary/5 border border-primary/20 p-4 animate-fade-in">
            <span className="text-sm font-medium">{selectedUsers.size} user(s) selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("bulk_enable")}>
                <UserCheck className="mr-2 h-4 w-4" />
                Enable
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("bulk_disable")}>
                <UserX className="mr-2 h-4 w-4" />
                Disable
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowBulkRoleDialog(true)}>
                <Shield className="mr-2 h-4 w-4" />
                Set Roles
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedUsers(new Set())}>
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="rounded-xl border border-border bg-card shadow-card animate-slide-up" style={{ animationDelay: "150ms" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {searchQuery || filterStatus !== "all" || filterRole !== "all" || filterCompany !== "all" 
                ? "No users found matching your filters." 
                : "No users found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-4 text-left">
                      <Checkbox 
                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      User
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Company
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Roles
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Last Login
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => {
                    const isCurrentUser = user.id === currentUser?.id;
                    const isLocked = user.locked_until && new Date(user.locked_until) > new Date();

                    return (
                      <tr key={user.id} className={cn("transition-colors hover:bg-muted/30", !user.is_active && "opacity-60")}>
                        <td className="px-4 py-4">
                          <Checkbox 
                            checked={selectedUsers.has(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
                              user.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                              {getInitials(user.full_name, user.email)}
                            </div>
                            <div>
                              <p className="font-medium text-card-foreground">
                                {user.full_name || "Unnamed User"}
                                {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                                {isLocked && <span className="ml-2 text-xs text-destructive">(Locked)</span>}
                              </p>
                              <p className={cn("text-sm text-muted-foreground", !canViewPii && "font-mono text-xs")}>
                                {maskPii(user.email, "email")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p className="text-card-foreground">{user.company_name || "—"}</p>
                            {user.department_name && (
                              <p className="text-xs text-muted-foreground">{user.department_name}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map(role => {
                              const style = getRoleStyle(role);
                              const Icon = style.icon;
                              return (
                                <span key={role} className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", style.color)}>
                                  <Icon className="h-3 w-3" />
                                  {getRoleName(role)}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                            user.is_active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                          )}>
                            {user.is_active ? <UserCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                            {user.is_active ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {formatDateTime(user.last_login_at)}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <DropdownMenu open={openDropdown === user.id} onOpenChange={(open) => setOpenDropdown(open ? user.id : null)}>
                            <DropdownMenuTrigger asChild>
                              <button disabled={updatingUserId === user.id} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50">
                                {updatingUserId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, "resend_invite")}>
                                <Mail className="mr-2 h-4 w-4" />
                                Resend Invite
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, "generate_temp_password")}>
                                <Key className="mr-2 h-4 w-4" />
                                Reset Password
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Security</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, "force_password_change")}>
                                <Key className="mr-2 h-4 w-4" />
                                Force Password Change
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, "revoke_sessions")}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Revoke Sessions
                              </DropdownMenuItem>
                              {(isLocked || user.failed_login_attempts > 0) && (
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, "unlock_account")}>
                                  <Unlock className="mr-2 h-4 w-4" />
                                  Unlock Account
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuSeparator />
                              {user.is_active ? (
                                <DropdownMenuItem 
                                  onClick={() => handleUserAction(user.id, "disable")}
                                  disabled={isCurrentUser}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Disable User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, "enable")} className="text-success focus:text-success">
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Enable User
                                </DropdownMenuItem>
                              )}
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

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>Send an invitation to a new user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" placeholder="user@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="John Doe" value={inviteFullName} onChange={(e) => setInviteFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Select value={inviteCompanyId} onValueChange={(v) => { setInviteCompanyId(v); setInviteDepartmentId(""); setInviteSectionId(""); }}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                  {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {inviteCompanyId && inviteFilteredDepartments.length > 0 && (
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={inviteDepartmentId} onValueChange={(v) => { setInviteDepartmentId(v); setInviteSectionId(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {inviteFilteredDepartments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {inviteDepartmentId && inviteFilteredSections.length > 0 && (
              <div className="space-y-2">
                <Label>Section</Label>
                <Select value={inviteSectionId} onValueChange={setInviteSectionId}>
                  <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                  <SelectContent>
                    {inviteFilteredSections.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Cancel</Button>
            <Button onClick={handleInviteUser} disabled={isInviting}>
              {isInviting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Inviting...</> : <><Mail className="mr-2 h-4 w-4" />Send Invite</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user profile and roles.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={editFullName} onChange={(e) => setEditFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Select value={editCompanyId || "__none__"} onValueChange={(v) => { setEditCompanyId(v === "__none__" ? "" : v); setEditDepartmentId(""); setEditSectionId(""); }}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {editCompanyId && filteredDepartments.length > 0 && (
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={editDepartmentId || "__none__"} onValueChange={(v) => { setEditDepartmentId(v === "__none__" ? "" : v); setEditSectionId(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {filteredDepartments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {editDepartmentId && filteredSections.length > 0 && (
              <div className="space-y-2">
                <Label>Section</Label>
                <Select value={editSectionId || "__none__"} onValueChange={(v) => setEditSectionId(v === "__none__" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {filteredSections.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Roles</Label>
              <div className="space-y-2 rounded-lg border border-input p-3">
                {roleDefinitions.map(role => (
                  <div key={role.id} className="flex items-center gap-2">
                    <Checkbox 
                      id={`role-${role.id}`}
                      checked={editRoles.includes(role.code)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEditRoles([...editRoles, role.code]);
                        } else {
                          setEditRoles(editRoles.filter(r => r !== role.code));
                        }
                      }}
                    />
                    <label htmlFor={`role-${role.id}`} className="text-sm">{role.name}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={isSavingEdit}>
              {isSavingEdit ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Temp Password Dialog */}
      <Dialog open={showTempPasswordDialog} onOpenChange={setShowTempPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Temporary Password</DialogTitle>
            <DialogDescription>Share these credentials with the user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="rounded-md bg-muted p-3 font-mono text-sm">{tempPasswordEmail}</div>
            </div>
            <div className="space-y-2">
              <Label>Temporary Password</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-md bg-muted p-3 font-mono text-sm">{tempPassword}</div>
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(tempPassword)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTempPasswordDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Role Dialog */}
      <Dialog open={showBulkRoleDialog} onOpenChange={setShowBulkRoleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Roles for {selectedUsers.size} Users</DialogTitle>
            <DialogDescription>Select roles to assign to all selected users.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 rounded-lg border border-input p-3">
              {roleDefinitions.map(role => (
                <div key={role.id} className="flex items-center gap-2">
                  <Checkbox 
                    id={`bulk-role-${role.id}`}
                    checked={bulkRoles.includes(role.code)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setBulkRoles([...bulkRoles, role.code]);
                      } else {
                        setBulkRoles(bulkRoles.filter(r => r !== role.code));
                      }
                    }}
                  />
                  <label htmlFor={`bulk-role-${role.id}`} className="text-sm">{role.name}</label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowBulkRoleDialog(false); setBulkRoles([]); }}>Cancel</Button>
            <Button onClick={handleBulkRoleUpdate} disabled={bulkRoles.length === 0}>
              Apply to {selectedUsers.size} Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
