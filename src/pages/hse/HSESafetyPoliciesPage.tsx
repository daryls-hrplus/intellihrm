import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useHSE, HSESafetyPolicy } from "@/hooks/useHSE";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
import {
  FileText,
  Plus,
  Search,
  ChevronLeft,
  CheckCircle,
  Eye,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { NavLink } from "react-router-dom";
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
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<HSESafetyPolicy | null>(null);
  const [formData, setFormData] = useState<Partial<HSESafetyPolicy>>({});

  const queryClient = useQueryClient();

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("id, name").eq("is_active", true);
      return data || [];
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("company_id", companyId)
        .eq("is_active", true);
      return data || [];
    },
    enabled: !!companyId,
  });

  const { safetyPolicies, policiesLoading, createSafetyPolicy } = useHSE(companyId || undefined);

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
        company_id: companyId,
        policy_type: "general",
        status: "draft",
        is_active: true,
        acknowledgment_required: false,
        effective_date: format(new Date(), "yyyy-MM-dd"),
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
        <div className="flex items-center gap-4">
          <NavLink to="/hse" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </NavLink>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
            <FileText className="h-5 w-5 text-info" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Safety Policies</h1>
            <p className="text-muted-foreground">Company safety guidelines and procedures</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Policies</p>
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
                  <p className="text-sm text-muted-foreground">Active</p>
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
                  <p className="text-sm text-muted-foreground">Require Acknowledgment</p>
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
                  placeholder="Search policies..."
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

              <Button onClick={() => handleOpenDialog()} disabled={!companyId}>
                <Plus className="mr-2 h-4 w-4" />
                Add Policy
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
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acknowledgment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policiesLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredPolicies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No safety policies found
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
                        {format(new Date(policy.effective_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{getStatusBadge(policy.status)}</TableCell>
                      <TableCell>
                        {policy.acknowledgment_required ? (
                          <Badge className="bg-warning/10 text-warning">Required</Badge>
                        ) : (
                          <Badge variant="outline">Optional</Badge>
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
                            Edit
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
                {selectedPolicy ? "Edit Policy" : "Add Safety Policy"}
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
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={formData.acknowledgment_required || false}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, acknowledgment_required: v })
                    }
                  />
                  <Label>Require Acknowledgment</Label>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Policy Content</Label>
                  <Textarea
                    value={formData.content || ""}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    placeholder="Enter the full policy content here..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSafetyPolicy.isPending}>
                  {selectedPolicy ? "Update" : "Create"} Policy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Policy Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPolicy?.title}</DialogTitle>
            </DialogHeader>
            {selectedPolicy && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>
                    {policyTypes.find((t) => t.value === selectedPolicy.policy_type)?.label}
                  </Badge>
                  {getStatusBadge(selectedPolicy.status)}
                  <Badge variant="outline">v{selectedPolicy.version}</Badge>
                </div>

                <div className="prose prose-sm max-w-none">
                  <h4 className="font-semibold">Description</h4>
                  <p className="text-muted-foreground">
                    {selectedPolicy.description || "No description provided."}
                  </p>

                  {selectedPolicy.content && (
                    <>
                      <h4 className="font-semibold mt-4">Policy Content</h4>
                      <div className="whitespace-pre-wrap rounded-md border p-4 bg-muted/30">
                        {selectedPolicy.content}
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Effective Date:</span>{" "}
                    {format(new Date(selectedPolicy.effective_date), "MMM d, yyyy")}
                  </div>
                  {selectedPolicy.review_date && (
                    <div>
                      <span className="text-muted-foreground">Review Date:</span>{" "}
                      {format(new Date(selectedPolicy.review_date), "MMM d, yyyy")}
                    </div>
                  )}
                  {selectedPolicy.owner && (
                    <div>
                      <span className="text-muted-foreground">Owner:</span>{" "}
                      {selectedPolicy.owner.full_name}
                    </div>
                  )}
                </div>

                {selectedPolicy.acknowledgment_required && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Acknowledgment Required</h4>
                        <p className="text-sm text-muted-foreground">
                          You must acknowledge that you have read and understood this policy.
                        </p>
                      </div>
                      {hasAcknowledged(selectedPolicy.id) ? (
                        <Badge className="bg-success/10 text-success">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Acknowledged
                        </Badge>
                      ) : (
                        <Button
                          onClick={() => acknowledgePolicy.mutate(selectedPolicy.id)}
                          disabled={acknowledgePolicy.isPending}
                        >
                          Acknowledge Policy
                        </Button>
                      )}
                    </div>
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
