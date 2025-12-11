import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, Send, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MENU_MODULES = [
  { code: "dashboard", name: "Dashboard", description: "Main overview and statistics" },
  { code: "workforce", name: "Workforce Management", description: "Employee directory and management" },
  { code: "leave", name: "Leave Management", description: "Leave requests and approvals" },
  { code: "compensation", name: "Compensation", description: "Salary and compensation data" },
  { code: "benefits", name: "Benefits", description: "Employee benefits administration" },
  { code: "performance", name: "Performance", description: "Performance reviews and goals" },
  { code: "training", name: "Training", description: "Training programs and certifications" },
  { code: "succession", name: "Succession Planning", description: "Career paths and succession" },
  { code: "recruitment", name: "Recruitment", description: "Job postings and candidates" },
  { code: "hse", name: "Health & Safety", description: "HSE incidents and compliance" },
  { code: "employee_relations", name: "Employee Relations", description: "Grievances and disciplinary" },
  { code: "property", name: "Company Property", description: "Asset management" },
];

interface AccessRequest {
  id: string;
  requested_modules: string[];
  reason: string;
  status: string;
  review_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export default function MyPermissionsPage() {
  const { user, profile, roles } = useAuth();
  const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);
  const [hasPiiAccess, setHasPiiAccess] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Request form state
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [requestReason, setRequestReason] = useState("");

  useEffect(() => {
    fetchUserPermissions();
    fetchAccessRequests();
  }, [user]);

  const fetchUserPermissions = async () => {
    if (!user) return;

    try {
      // Get user's role assignments
      const { data: userRolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", user.id);

      if (rolesError) throw rolesError;

      if (!userRolesData || userRolesData.length === 0) {
        setCurrentPermissions([]);
        setIsLoading(false);
        return;
      }

      const roleIds = userRolesData.map((r) => r.role_id).filter(Boolean);

      // Get role details
      const { data: rolesData, error: roleError } = await supabase
        .from("roles")
        .select("name, menu_permissions, can_view_pii")
        .in("id", roleIds);

      if (roleError) throw roleError;

      // Combine permissions
      const allPermissions = new Set<string>();
      let piiAccess = false;
      const roleNames: string[] = [];

      (rolesData || []).forEach((role) => {
        roleNames.push(role.name);
        if (role.can_view_pii) piiAccess = true;
        const permissions = Array.isArray(role.menu_permissions)
          ? (role.menu_permissions as string[])
          : [];
        permissions.forEach((p) => allPermissions.add(p));
      });

      setCurrentPermissions(Array.from(allPermissions));
      setHasPiiAccess(piiAccess);
      setUserRoles(roleNames);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccessRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("access_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setAccessRequests((data || []).map(r => ({
        ...r,
        requested_modules: Array.isArray(r.requested_modules) ? r.requested_modules as string[] : []
      })));
    } catch (error) {
      console.error("Error fetching access requests:", error);
    }
  };

  const handleModuleToggle = (moduleCode: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleCode)
        ? prev.filter((m) => m !== moduleCode)
        : [...prev, moduleCode]
    );
  };

  const handleSubmitRequest = async () => {
    if (selectedModules.length === 0) {
      toast.error("Please select at least one module");
      return;
    }

    if (!requestReason.trim()) {
      toast.error("Please provide a reason for your request");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check for auto-approval eligibility
      const { data: autoApprovalResult, error: autoApprovalError } = await supabase
        .rpc("check_auto_approval", {
          p_user_id: user?.id,
          p_requested_modules: selectedModules,
        });

      let autoApprovedModules: string[] = [];
      let pendingModules: string[] = selectedModules;

      if (!autoApprovalError && autoApprovalResult?.[0]?.is_auto_approved) {
        const approvedModulesFromRule = autoApprovalResult[0].approved_modules || [];
        autoApprovedModules = Array.isArray(approvedModulesFromRule) 
          ? (approvedModulesFromRule as unknown as string[])
          : [];
        pendingModules = selectedModules.filter(m => !autoApprovedModules.includes(m));
      }

      // Create auto-approved request if any modules qualify
      if (autoApprovedModules.length > 0) {
        const { error: approvedError } = await supabase.from("access_requests").insert({
          user_id: user?.id,
          user_email: profile?.email || user?.email,
          requested_modules: autoApprovedModules,
          reason: requestReason.trim(),
          status: "approved",
          review_notes: `Auto-approved by rule: ${autoApprovalResult[0].rule_name}`,
          reviewed_at: new Date().toISOString(),
        });

        if (approvedError) throw approvedError;
      }

      // Create pending request for remaining modules
      if (pendingModules.length > 0) {
        const { error } = await supabase.from("access_requests").insert({
          user_id: user?.id,
          user_email: profile?.email || user?.email,
          requested_modules: pendingModules,
          reason: requestReason.trim(),
        });

        if (error) throw error;

        // Notify admins of new request (non-blocking)
        supabase.functions
          .invoke("notify-admins-new-request", {
            body: {
              userEmail: profile?.email || user?.email,
              requestedModules: pendingModules,
              reason: requestReason.trim(),
            },
          })
          .then((res) => {
            if (res.error) {
              console.error("Admin notification failed:", res.error);
            }
          });
      }

      // Show appropriate message
      if (autoApprovedModules.length > 0 && pendingModules.length > 0) {
        toast.success(`${autoApprovedModules.length} module(s) auto-approved, ${pendingModules.length} pending review`);
      } else if (autoApprovedModules.length > 0) {
        toast.success("Access request auto-approved!");
      } else {
        toast.success("Access request submitted for review");
      }

      setSelectedModules([]);
      setRequestReason("");
      fetchAccessRequests();
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const availableModules = MENU_MODULES.filter(
    (m) => !currentPermissions.includes(m.code) && m.code !== "dashboard"
  );

  const hasPendingRequest = accessRequests.some((r) => r.status === "pending");

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
        <Breadcrumbs
          items={[
            { label: "Profile", href: "/profile" },
            { label: "My Permissions" },
          ]}
        />

        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">My Permissions</h1>
            <p className="text-muted-foreground">
              View your current access and request additional permissions
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Current Access
              </CardTitle>
              <CardDescription>
                Your assigned roles and module permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Roles */}
              <div>
                <h4 className="text-sm font-medium mb-2">Assigned Roles</h4>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <Badge key={role} variant="outline" className="capitalize">
                      {role.replace("_", " ")}
                    </Badge>
                  ))}
                  {userRoles.map((role) => (
                    <Badge key={role} className="bg-primary/10 text-primary">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* PII Access */}
              <div>
                <h4 className="text-sm font-medium mb-2">Sensitive Data Access</h4>
                <div className="flex items-center gap-2">
                  {hasPiiAccess || roles.includes("admin") ? (
                    <Badge className="bg-warning/20 text-warning-foreground border-warning">
                      <Eye className="h-3 w-3 mr-1" />
                      PII Access Granted
                    </Badge>
                  ) : (
                    <Badge variant="secondary">No PII Access</Badge>
                  )}
                </div>
              </div>

              {/* Module Permissions */}
              <div>
                <h4 className="text-sm font-medium mb-3">Module Access</h4>
                <div className="grid gap-2">
                  {MENU_MODULES.map((module) => {
                    const hasAccess =
                      roles.includes("admin") ||
                      currentPermissions.includes(module.code) ||
                      module.code === "dashboard";
                    return (
                      <div
                        key={module.code}
                        className={`flex items-center justify-between p-2 rounded-md ${
                          hasAccess ? "bg-success/10" : "bg-muted/50"
                        }`}
                      >
                        <span className="text-sm">{module.name}</span>
                        {hasAccess ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Access */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Request Additional Access
                </CardTitle>
                <CardDescription>
                  Submit a request for access to additional modules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasPendingRequest && (
                  <div className="p-3 rounded-md bg-warning/10 border border-warning/20 text-sm">
                    <Clock className="h-4 w-4 inline mr-2" />
                    You have a pending access request. Please wait for it to be reviewed.
                  </div>
                )}

                {availableModules.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                    <p>You have access to all available modules!</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Select Modules</Label>
                      <div className="mt-2 grid gap-2 max-h-[200px] overflow-y-auto">
                        {availableModules.map((module) => (
                          <div
                            key={module.code}
                            className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50"
                          >
                            <Checkbox
                              id={module.code}
                              checked={selectedModules.includes(module.code)}
                              onCheckedChange={() => handleModuleToggle(module.code)}
                              disabled={hasPendingRequest}
                            />
                            <div className="flex-1">
                              <Label htmlFor={module.code} className="cursor-pointer font-medium">
                                {module.name}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {module.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reason" className="text-sm font-medium">
                        Reason for Request
                      </Label>
                      <Textarea
                        id="reason"
                        placeholder="Explain why you need access to these modules..."
                        value={requestReason}
                        onChange={(e) => setRequestReason(e.target.value)}
                        disabled={hasPendingRequest}
                        className="mt-2"
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleSubmitRequest}
                      disabled={isSubmitting || hasPendingRequest || selectedModules.length === 0}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Request History */}
            {accessRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {accessRequests.slice(0, 5).map((request) => (
                      <div
                        key={request.id}
                        className="p-3 rounded-md border bg-card"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {request.requested_modules.map((mod) => (
                            <Badge key={mod} variant="outline" className="text-xs">
                              {MENU_MODULES.find((m) => m.code === mod)?.name || mod}
                            </Badge>
                          ))}
                        </div>
                        {request.review_notes && (
                          <p className="text-xs text-muted-foreground italic">
                            "{request.review_notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}