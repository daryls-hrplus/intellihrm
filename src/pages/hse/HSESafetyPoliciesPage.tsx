import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useHSE, HSESafetyPolicy } from "@/hooks/useHSE";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTabState } from "@/hooks/useTabState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/hooks/useLanguage";
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  Eye,
  Users,
} from "lucide-react";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { toast } from "sonner";

const policyTypes = [
  { value: "general", label: "General Safety" },
  { value: "emergency", label: "Emergency Procedures" },
  { value: "ppe", label: "PPE Requirements" },
  { value: "chemical", label: "Chemical Safety" },
  { value: "electrical", label: "Electrical Safety" },
  { value: "fire", label: "Fire Safety" },
  { value: "ergonomic", label: "Ergonomic" },
];

const statusOptions = [
  { value: "draft", label: "Draft", color: "bg-muted text-muted-foreground" },
  { value: "pending_approval", label: "Pending Approval", color: "bg-warning/10 text-warning" },
  { value: "active", label: "Active", color: "bg-success/10 text-success" },
  { value: "archived", label: "Archived", color: "bg-muted text-muted-foreground" },
];

export default function HSESafetyPoliciesPage() {
  const { t } = useLanguage();
  const { user, company } = useAuth();

  const [tabState, setTabState] = useTabState({
    defaultState: {
      selectedCompanyId: "",
      searchTerm: "",
      statusFilter: "all",
    },
    syncToUrl: ["selectedCompanyId", "statusFilter"],
  });

  const { selectedCompanyId, searchTerm, statusFilter } = tabState;

  // Initialize company from auth context
  useEffect(() => {
    if (company?.id && !selectedCompanyId) {
      setTabState({ selectedCompanyId: company.id });
    }
  }, [company?.id, selectedCompanyId, setTabState]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<HSESafetyPolicy | null>(null);
  const [formData, setFormData] = useState<Partial<HSESafetyPolicy>>({});

  const queryClient = useQueryClient();

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const result = await supabase.from("companies").select("id, name").eq("is_active", true);
      return (result.data || []) as { id: string; name: string }[];
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees", selectedCompanyId],
    queryFn: async (): Promise<{ id: string; full_name: string }[]> => {
      if (!selectedCompanyId) return [];
      const { data } = await (supabase as any).from("profiles").select("id, full_name").eq("company_id", selectedCompanyId).eq("is_active", true);
      return (data || []) as { id: string; full_name: string }[];
    },
    enabled: !!selectedCompanyId,
  });

  const { safetyPolicies, policiesLoading, createSafetyPolicy } = useHSE(selectedCompanyId || undefined);

  const { data: acknowledgments = [] } = useQuery({
    queryKey: ["hse-policy-acknowledgments", selectedPolicy?.id],
    queryFn: async () => {
      if (!selectedPolicy?.id) return [];
      const { data, error } = await supabase
        .from("hse_policy_acknowledgments")
        .select("*, employee:employee_id(full_name)")
        .eq("policy_id", selectedPolicy.id);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPolicy?.id,
  });

  const acknowledgePolicy = useMutation({
    mutationFn: async (policyId: string) => {
      const { data: result, error } = await supabase
        .from("hse_policy_acknowledgments")
        .insert([{ policy_id: policyId, employee_id: user?.id }])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hse-policy-acknowledgments"] });
      toast.success("Policy acknowledged successfully");
    },
    onError: (error) => toast.error(`Failed to acknowledge: ${error.message}`),
  });

  const filteredPolicies = safetyPolicies.filter((policy) => {
    const matchesSearch =
      policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || policy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenDialog = (policy?: HSESafetyPolicy) => {
    if (policy) {
      setSelectedPolicy(policy);
      setFormData(policy);
    } else {
      setSelectedPolicy(null);
      setFormData({
        company_id: selectedCompanyId,
        policy_type: "general",
        status: "draft",
        is_active: true,
        acknowledgment_required: false,
        effective_date: getTodayString(),
        version: "1.0",
      });
    }
    setDialogOpen(true);
  };

  const handleViewPolicy = (policy: HSESafetyPolicy) => {
    setSelectedPolicy(policy);
    setViewDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSafetyPolicy.mutateAsync(formData);
    setDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find((s) => s.value === status);
    return <Badge className={option?.color}>{option?.label || status}</Badge>;
  };

  const hasAcknowledged = (policyId: string) => {
    return acknowledgments.some(
      (a: Record<string, unknown>) => a.policy_id === policyId && a.employee_id === user?.id
    );
  };

  // Stats
  const activePolicies = safetyPolicies.filter((p) => p.status === "active").length;
  const requireAcknowledgment = safetyPolicies.filter((p) => p.acknowledgment_required).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("hseModule.title"), href: "/hse" },
            { label: t("hseModule.policies.title") },
          ]}
        />

        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
            <FileText className="h-5 w-5 text-info" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("hseModule.policies.title")}</h1>
            <p className="text-muted-foreground">{t("hseModule.policies.subtitle")}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("hseModule.stats.totalPolicies")}</p>
                  <p className="text-2xl font-bold">{safetyPolicies.length}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("hseModule.stats.active")}</p>
                  <p className="text-2xl font-bold text-success">{activePolicies}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("hseModule.stats.requireAcknowledgment")}</p>
                  <p className="text-2xl font-bold">{requireAcknowledgment}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Select value={selectedCompanyId} onValueChange={(id) => setTabState({ selectedCompanyId: id })}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t("hseModule.common.selectCompany")} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("hseModule.policies.searchPolicies")}
                  value={searchTerm}
                  onChange={(e) => setTabState({ searchTerm: e.target.value })}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={(v) => setTabState({ statusFilter: v })}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t("common.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("hseModule.common.allStatus")}</SelectItem>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {t(`hseModule.policies.statusOptions.${s.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={() => handleOpenDialog()} disabled={!selectedCompanyId}>
                <Plus className="mr-2 h-4 w-4" />
                {t("hseModule.policies.addPolicy")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("hseModule.common.code")}</TableHead>
                  <TableHead>{t("hseModule.common.title")}</TableHead>
                  <TableHead>{t("common.type")}</TableHead>
                  <TableHead>{t("hseModule.policies.version")}</TableHead>
                  <TableHead>{t("hseModule.policies.effectiveDate")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("hseModule.policies.acknowledgment")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policiesLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {t("hseModule.common.loading")}
                    </TableCell>
                  </TableRow>
                ) : filteredPolicies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {t("hseModule.policies.noPolicies")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-mono text-sm">{policy.code}</TableCell>
                      <TableCell className="font-medium">{policy.title}</TableCell>
                      <TableCell>
                        {policyTypes.find((t) => t.value === policy.policy_type)?.label}
                      </TableCell>
                      <TableCell>{policy.version}</TableCell>
                      <TableCell>
                        {formatDateForDisplay(policy.effective_date, "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{getStatusBadge(policy.status)}</TableCell>
                      <TableCell>
                        {policy.acknowledgment_required ? (
                          <Badge className="bg-warning/10 text-warning">{t("common.required")}</Badge>
                        ) : (
                          <Badge variant="outline">{t("common.optional")}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewPolicy(policy)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(policy)}
                          >
                            {t("common.edit")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Policy Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPolicy ? t("hseModule.policies.editPolicy") : t("hseModule.policies.addPolicy")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input
                    value={formData.code || ""}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select
                    value={formData.policy_type}
                    onValueChange={(v) => setFormData({ ...formData, policy_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {policyTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Version</Label>
                  <Input
                    value={formData.version || "1.0"}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Effective Date *</Label>
                  <Input
                    type="date"
                    value={formData.effective_date || ""}
                    onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Review Date</Label>
                  <Input
                    type="date"
                    value={formData.review_date || ""}
                    onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Owner</Label>
                  <Select
                    value={formData.owner_id || ""}
                    onValueChange={(v) => setFormData({ ...formData, owner_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.acknowledgment_required || false}
                      onCheckedChange={(c) =>
                        setFormData({ ...formData, acknowledgment_required: c })
                      }
                    />
                    <Label>Require Acknowledgment</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active ?? true}
                      onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Content</Label>
                  <Textarea
                    value={formData.content || ""}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    placeholder="Enter policy content..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit">{t("common.save")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Policy Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPolicy?.title}</DialogTitle>
            </DialogHeader>
            {selectedPolicy && (
              <div className="space-y-4">
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Code</p>
                    <p className="font-medium">{selectedPolicy.code}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Version</p>
                    <p className="font-medium">{selectedPolicy.version}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">
                      {policyTypes.find((t) => t.value === selectedPolicy.policy_type)?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    {getStatusBadge(selectedPolicy.status)}
                  </div>
                </div>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{selectedPolicy.content || "No content available."}</p>
                </div>
                {selectedPolicy.acknowledgment_required && (
                  <div className="pt-4 border-t">
                    {hasAcknowledged(selectedPolicy.id) ? (
                      <p className="text-success flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        You have acknowledged this policy
                      </p>
                    ) : (
                      <Button
                        onClick={() => acknowledgePolicy.mutate(selectedPolicy.id)}
                        disabled={acknowledgePolicy.isPending}
                      >
                        Acknowledge Policy
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
