import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NavLink } from "react-router-dom";

const MENU_MODULES = [
  { code: "dashboard", name: "Dashboard" },
  { code: "workforce", name: "Workforce Management" },
  { code: "leave", name: "Leave Management" },
  { code: "compensation", name: "Compensation" },
  { code: "benefits", name: "Benefits" },
  { code: "performance", name: "Performance" },
  { code: "training", name: "Training" },
  { code: "succession", name: "Succession Planning" },
  { code: "recruitment", name: "Recruitment" },
  { code: "hse", name: "Health & Safety" },
  { code: "employee_relations", name: "Employee Relations" },
  { code: "property", name: "Company Property" },
];

interface AutoApprovalRule {
  id: string;
  name: string;
  description: string | null;
  role_id: string | null;
  company_id: string | null;
  approved_modules: string[];
  is_active: boolean;
  created_at: string;
}

interface Role {
  id: string;
  name: string;
  code: string;
}

interface Company {
  id: string;
  name: string;
  code: string;
}

export default function AdminAutoApprovalPage() {
  const [rules, setRules] = useState<AutoApprovalRule[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoApprovalRule | null>(null);
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formRoleId, setFormRoleId] = useState<string>("any");
  const [formCompanyId, setFormCompanyId] = useState<string>("any");
  const [formModules, setFormModules] = useState<string[]>([]);
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rulesRes, rolesRes, companiesRes] = await Promise.all([
        supabase
          .from("auto_approval_rules")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("roles")
          .select("id, name, code")
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("companies")
          .select("id, name, code")
          .eq("is_active", true)
          .order("name"),
      ]);

      if (rulesRes.error) throw rulesRes.error;
      if (rolesRes.error) throw rolesRes.error;
      if (companiesRes.error) throw companiesRes.error;

      setRules(
        (rulesRes.data || []).map((r) => ({
          ...r,
          approved_modules: Array.isArray(r.approved_modules)
            ? (r.approved_modules as string[])
            : [],
        }))
      );
      setRoles(rolesRes.data || []);
      setCompanies(companiesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load auto-approval rules");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormRoleId("any");
    setFormCompanyId("any");
    setFormModules([]);
    setFormIsActive(true);
    setEditingRule(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (rule: AutoApprovalRule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormDescription(rule.description || "");
    setFormRoleId(rule.role_id || "any");
    setFormCompanyId(rule.company_id || "any");
    setFormModules(rule.approved_modules);
    setFormIsActive(rule.is_active);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error("Please enter a rule name");
      return;
    }
    if (formModules.length === 0) {
      toast.error("Please select at least one module");
      return;
    }

    setIsSaving(true);
    try {
      const ruleData = {
        name: formName.trim(),
        description: formDescription.trim() || null,
        role_id: formRoleId === "any" ? null : formRoleId,
        company_id: formCompanyId === "any" ? null : formCompanyId,
        approved_modules: formModules,
        is_active: formIsActive,
      };

      if (editingRule) {
        const { error } = await supabase
          .from("auto_approval_rules")
          .update(ruleData)
          .eq("id", editingRule.id);
        if (error) throw error;
        toast.success("Rule updated successfully");
      } else {
        const { error } = await supabase
          .from("auto_approval_rules")
          .insert(ruleData);
        if (error) throw error;
        toast.success("Rule created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving rule:", error);
      toast.error("Failed to save rule");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRuleId) return;

    try {
      const { error } = await supabase
        .from("auto_approval_rules")
        .delete()
        .eq("id", deleteRuleId);

      if (error) throw error;
      toast.success("Rule deleted successfully");
      setDeleteRuleId(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast.error("Failed to delete rule");
    }
  };

  const toggleModuleSelection = (code: string) => {
    setFormModules((prev) =>
      prev.includes(code) ? prev.filter((m) => m !== code) : [...prev, code]
    );
  };

  const getModuleName = (code: string) =>
    MENU_MODULES.find((m) => m.code === code)?.name || code;

  const getRoleName = (id: string | null) =>
    id ? roles.find((r) => r.id === id)?.name || "Unknown" : "Any Role";

  const getCompanyName = (id: string | null) =>
    id ? companies.find((c) => c.id === id)?.name || "Unknown" : "Any Company";

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Auto-Approval Rules" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink
              to="/admin"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </NavLink>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Zap className="h-8 w-8 text-primary" />
                Auto-Approval Rules
              </h1>
              <p className="text-muted-foreground">
                Configure automatic approval for access requests based on roles and companies
              </p>
            </div>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Rules</CardTitle>
            <CardDescription>
              When a user submits an access request, matching rules will automatically approve the requested modules
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : rules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No auto-approval rules configured</p>
                <p className="text-sm">Create a rule to enable automatic approvals</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Modules</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          {rule.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {rule.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getRoleName(rule.role_id)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCompanyName(rule.company_id)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {rule.approved_modules.slice(0, 2).map((mod) => (
                            <Badge key={mod} variant="secondary" className="text-xs">
                              {getModuleName(mod)}
                            </Badge>
                          ))}
                          {rule.approved_modules.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{rule.approved_modules.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {rule.is_active ? (
                          <Badge className="bg-success text-success-foreground">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(rule)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteRuleId(rule.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? "Edit Rule" : "Create Auto-Approval Rule"}
              </DialogTitle>
              <DialogDescription>
                Configure when access requests should be automatically approved
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name *</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., HR Manager Basic Access"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional description of this rule"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>User Role</Label>
                  <Select value={formRoleId} onValueChange={setFormRoleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Role</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Company</Label>
                  <Select value={formCompanyId} onValueChange={setFormCompanyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Company</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Modules to Auto-Approve *</Label>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto border rounded-lg p-3">
                  {MENU_MODULES.map((module) => (
                    <div key={module.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={module.code}
                        checked={formModules.includes(module.code)}
                        onCheckedChange={() => toggleModuleSelection(module.code)}
                      />
                      <label
                        htmlFor={module.code}
                        className="text-sm cursor-pointer"
                      >
                        {module.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch
                  id="active"
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingRule ? "Update" : "Create"} Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteRuleId} onOpenChange={() => setDeleteRuleId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Rule</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this auto-approval rule? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
