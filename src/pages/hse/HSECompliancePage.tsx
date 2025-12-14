import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useHSE, HSEComplianceRequirement } from "@/hooks/useHSE";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/useLanguage";
import {
  ClipboardCheck,
  Plus,
  Search,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";
import { format, isPast, isBefore, addDays } from "date-fns";
import { NavLink } from "react-router-dom";
import { toast } from "sonner";

const requirementTypes = [
  { value: "regulatory", label: "Regulatory" },
  { value: "permit", label: "Permit" },
  { value: "license", label: "License" },
  { value: "certification", label: "Certification" },
  { value: "audit", label: "Audit" },
];

const statusOptions = [
  { value: "active", label: "Active", color: "bg-success/10 text-success" },
  { value: "pending_renewal", label: "Pending Renewal", color: "bg-warning/10 text-warning" },
  { value: "expired", label: "Expired", color: "bg-destructive/10 text-destructive" },
  { value: "not_applicable", label: "N/A", color: "bg-muted text-muted-foreground" },
];

const complianceStatusOptions = [
  { value: "compliant", label: "Compliant", color: "bg-success/10 text-success" },
  { value: "non_compliant", label: "Non-Compliant", color: "bg-destructive/10 text-destructive" },
  { value: "partial", label: "Partial", color: "bg-warning/10 text-warning" },
  { value: "under_review", label: "Under Review", color: "bg-info/10 text-info" },
];

const auditTypes = [
  { value: "internal", label: "Internal" },
  { value: "external", label: "External" },
  { value: "regulatory", label: "Regulatory" },
];

export default function HSECompliancePage() {
  const { t } = useLanguage();
  const [companyId, setCompanyId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("requirements");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<HSEComplianceRequirement | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<HSEComplianceRequirement>>({});
  const [auditFormData, setAuditFormData] = useState<Record<string, unknown>>({});

  const queryClient = useQueryClient();

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const result = await supabase.from("companies").select("id, name").eq("is_active", true);
      return (result.data || []) as { id: string; name: string }[];
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees", companyId],
    queryFn: async (): Promise<{ id: string; full_name: string }[]> => {
      if (!companyId) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).from("profiles").select("id, full_name").eq("company_id", companyId).eq("is_active", true);
      return (data || []) as { id: string; full_name: string }[];
    },
    enabled: !!companyId,
  });

  const { complianceRequirements, complianceLoading, createComplianceRequirement } = useHSE(
    companyId || undefined
  );

  const { data: audits = [], isLoading: auditsLoading } = useQuery({
    queryKey: ["hse-compliance-audits", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("hse_compliance_audits")
        .select("*, requirement:requirement_id(title)")
        .eq("company_id", companyId)
        .order("audit_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  const createAudit = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { requirement, ...rest } = data;
      const { data: result, error } = await supabase
        .from("hse_compliance_audits")
        .insert([rest as never])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hse-compliance-audits"] });
      toast.success("Audit record created successfully");
    },
    onError: (error) => toast.error(`Failed to create audit: ${error.message}`),
  });

  const filteredRequirements = complianceRequirements.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenDialog = (requirement?: HSEComplianceRequirement) => {
    if (requirement) {
      setSelectedRequirement(requirement);
      setFormData(requirement);
    } else {
      setSelectedRequirement(null);
      setFormData({
        company_id: companyId,
        requirement_type: "regulatory",
        status: "active",
        compliance_status: "compliant",
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createComplianceRequirement.mutateAsync(formData);
    setDialogOpen(false);
  };

  const handleOpenAuditDialog = (requirement?: HSEComplianceRequirement) => {
    setAuditFormData({
      company_id: companyId,
      requirement_id: requirement?.id,
      audit_date: format(new Date(), "yyyy-MM-dd"),
      audit_type: "internal",
      status: "pending",
    });
    setAuditDialogOpen(true);
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAudit.mutateAsync(auditFormData);
    setAuditDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find((s) => s.value === status);
    return <Badge className={option?.color}>{option?.label || status}</Badge>;
  };

  const getComplianceBadge = (status: string | null) => {
    if (!status) return null;
    const option = complianceStatusOptions.find((s) => s.value === status);
    return <Badge className={option?.color}>{option?.label || status}</Badge>;
  };

  // Stats
  const compliantCount = complianceRequirements.filter(
    (r) => r.compliance_status === "compliant"
  ).length;
  const nonCompliantCount = complianceRequirements.filter(
    (r) => r.compliance_status === "non_compliant"
  ).length;
  const expiringCount = complianceRequirements.filter(
    (r) =>
      r.expiry_date &&
      isBefore(new Date(r.expiry_date), addDays(new Date(), r.renewal_lead_days || 30)) &&
      !isPast(new Date(r.expiry_date))
  ).length;
  const expiredCount = complianceRequirements.filter(
    (r) => r.expiry_date && isPast(new Date(r.expiry_date))
  ).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <NavLink to="/hse" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </NavLink>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
            <ClipboardCheck className="h-5 w-5 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("hseModule.compliance.title")}</h1>
            <p className="text-muted-foreground">{t("hseModule.compliance.subtitle")}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Compliant</p>
                  <p className="text-2xl font-bold text-success">{compliantCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Non-Compliant</p>
                  <p className="text-2xl font-bold text-destructive">{nonCompliantCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  <p className="text-2xl font-bold text-warning">{expiringCount}</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold text-destructive">{expiredCount}</p>
                </div>
                <FileText className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select company" />
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
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeTab === "requirements" && (
                <Button onClick={() => handleOpenDialog()} disabled={!companyId}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Requirement
                </Button>
              )}
              {activeTab === "audits" && (
                <Button onClick={() => handleOpenAuditDialog()} disabled={!companyId}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Audit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="audits">Audit Records</TabsTrigger>
          </TabsList>

          <TabsContent value="requirements">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Regulatory Body</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complianceLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredRequirements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No compliance requirements found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequirements.map((req) => (
                        <TableRow
                          key={req.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleOpenDialog(req)}
                        >
                          <TableCell className="font-mono text-sm">{req.code}</TableCell>
                          <TableCell className="font-medium">{req.title}</TableCell>
                          <TableCell>
                            {requirementTypes.find((t) => t.value === req.requirement_type)?.label}
                          </TableCell>
                          <TableCell>{req.regulatory_body || "-"}</TableCell>
                          <TableCell>
                            {req.expiry_date ? (
                              <span
                                className={isPast(new Date(req.expiry_date)) ? "text-destructive" : ""}
                              >
                                {format(new Date(req.expiry_date), "MMM d, yyyy")}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(req.status)}</TableCell>
                          <TableCell>{getComplianceBadge(req.compliance_status)}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAuditDialog(req);
                              }}
                            >
                              Log Audit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audits">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Audit Type</TableHead>
                      <TableHead>Audit Date</TableHead>
                      <TableHead>Auditor</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : audits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No audit records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      audits.map((audit: Record<string, unknown>) => (
                        <TableRow key={audit.id as string}>
                          <TableCell className="font-medium">
                            {(audit.requirement as { title: string })?.title}
                          </TableCell>
                          <TableCell>
                            {auditTypes.find((t) => t.value === audit.audit_type)?.label}
                          </TableCell>
                          <TableCell>
                            {format(new Date(audit.audit_date as string), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{(audit.auditor_name as string) || "-"}</TableCell>
                          <TableCell>
                            {getComplianceBadge(audit.compliance_rating as string)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{audit.status as string}</Badge>
                          </TableCell>
                          <TableCell>
                            {audit.due_date
                              ? format(new Date(audit.due_date as string), "MMM d, yyyy")
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Requirement Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedRequirement ? "Edit Requirement" : "Add Compliance Requirement"}
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
                    value={formData.requirement_type}
                    onValueChange={(v) => setFormData({ ...formData, requirement_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {requirementTypes.map((t) => (
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
                  <Label>Regulatory Body</Label>
                  <Input
                    value={formData.regulatory_body || ""}
                    onChange={(e) => setFormData({ ...formData, regulatory_body: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reference Number</Label>
                  <Input
                    value={formData.reference_number || ""}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={formData.issue_date || ""}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={formData.expiry_date || ""}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
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
                  <Label>Compliance Status</Label>
                  <Select
                    value={formData.compliance_status || ""}
                    onValueChange={(v) => setFormData({ ...formData, compliance_status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {complianceStatusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Responsible Person</Label>
                  <Select
                    value={formData.responsible_person_id || ""}
                    onValueChange={(v) => setFormData({ ...formData, responsible_person_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select person" />
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
                <div className="space-y-2">
                  <Label>Renewal Lead Days</Label>
                  <Input
                    type="number"
                    value={formData.renewal_lead_days || 30}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        renewal_lead_days: parseInt(e.target.value) || 30,
                      })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createComplianceRequirement.isPending}>
                  {selectedRequirement ? "Update" : "Create"} Requirement
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Audit Dialog */}
        <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Audit Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAuditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Requirement *</Label>
                <Select
                  value={(auditFormData.requirement_id as string) || ""}
                  onValueChange={(v) => setAuditFormData({ ...auditFormData, requirement_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    {complianceRequirements.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Audit Type *</Label>
                  <Select
                    value={(auditFormData.audit_type as string) || ""}
                    onValueChange={(v) => setAuditFormData({ ...auditFormData, audit_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {auditTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Audit Date *</Label>
                  <Input
                    type="date"
                    value={(auditFormData.audit_date as string) || ""}
                    onChange={(e) => setAuditFormData({ ...auditFormData, audit_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Auditor Name</Label>
                <Input
                  value={(auditFormData.auditor_name as string) || ""}
                  onChange={(e) => setAuditFormData({ ...auditFormData, auditor_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Compliance Rating</Label>
                <Select
                  value={(auditFormData.compliance_rating as string) || ""}
                  onValueChange={(v) => setAuditFormData({ ...auditFormData, compliance_rating: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {complianceStatusOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Findings</Label>
                <Textarea
                  value={(auditFormData.findings as string) || ""}
                  onChange={(e) => setAuditFormData({ ...auditFormData, findings: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Corrective Actions</Label>
                <Textarea
                  value={(auditFormData.corrective_actions as string) || ""}
                  onChange={(e) =>
                    setAuditFormData({ ...auditFormData, corrective_actions: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={(auditFormData.due_date as string) || ""}
                  onChange={(e) => setAuditFormData({ ...auditFormData, due_date: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setAuditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAudit.isPending}>
                  Create Audit
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
