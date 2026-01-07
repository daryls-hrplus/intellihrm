import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, ArrowLeft, Coins, Crown, Users, Calendar } from "lucide-react";
import { toast } from "sonner";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";
import { useNavigate } from "react-router-dom";
import { PayrollFilters, usePayrollFilters } from "@/components/payroll/PayrollFilters";
import { usePageAudit } from "@/hooks/usePageAudit";

interface PoolFormData {
  name: string;
  code: string;
  pool_type: "tips" | "tronc";
  description: string;
  distribution_method: string;
  distribution_frequency: string;
  include_in_payroll: boolean;
  is_active: boolean;
  start_date: string;
  troncmaster_id: string;
}

export default function TipPoolManagementPage() {
  usePageAudit('tip_pool_management', 'Payroll');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedCompanyId, setSelectedCompanyId } = usePayrollFilters();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PoolFormData>({
    name: "",
    code: "",
    pool_type: "tips",
    description: "",
    distribution_method: "points",
    distribution_frequency: "weekly",
    include_in_payroll: true,
    is_active: true,
    start_date: getTodayString(),
    troncmaster_id: "",
  });

  // Fetch pool configurations
  const { data: pools, isLoading } = useQuery({
    queryKey: ["tip-pools", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("tip_pool_configurations")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  // Fetch employees for troncmaster selection
  const { data: employees } = useQuery({
    queryKey: ["employees-for-tronc", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, employee_id")
        .eq("company_id", selectedCompanyId)
        .order("last_name");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: PoolFormData) => {
      const payload = {
        company_id: selectedCompanyId,
        name: data.name,
        code: data.code,
        pool_type: data.pool_type,
        description: data.description || null,
        distribution_method: data.distribution_method,
        distribution_frequency: data.distribution_frequency,
        include_in_payroll: data.include_in_payroll,
        is_active: data.is_active,
        start_date: data.start_date,
        troncmaster_id: data.pool_type === "tronc" && data.troncmaster_id ? data.troncmaster_id : null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("tip_pool_configurations")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tip_pool_configurations")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tip-pools"] });
      toast.success(editingId ? "Pool updated successfully" : "Pool created successfully");
      closeDialog();
    },
    onError: (error: any) => {
      if (error.message?.includes("unique")) {
        toast.error("A pool with this code already exists");
      } else {
        toast.error("Failed to save pool");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tip_pool_configurations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tip-pools"] });
      toast.success("Pool deleted successfully");
    },
    onError: () => toast.error("Failed to delete pool"),
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      code: "",
      pool_type: "tips",
      description: "",
      distribution_method: "points",
      distribution_frequency: "weekly",
      include_in_payroll: true,
      is_active: true,
      start_date: getTodayString(),
      troncmaster_id: "",
    });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      code: item.code,
      pool_type: item.pool_type,
      description: item.description || "",
      distribution_method: item.distribution_method,
      distribution_frequency: item.distribution_frequency,
      include_in_payroll: item.include_in_payroll,
      is_active: item.is_active,
      start_date: item.start_date,
      troncmaster_id: item.troncmaster_id || "",
    });
    setIsDialogOpen(true);
  };

  const formatDistributionMethod = (method: string) => {
    const labels: Record<string, string> = {
      points: "Points-based",
      hours: "Hours worked",
      equal: "Equal split",
      percentage: "Percentage",
    };
    return labels[method] || method;
  };

  const formatFrequency = (freq: string) => {
    const labels: Record<string, string> = {
      daily: "Daily",
      weekly: "Weekly",
      biweekly: "Bi-weekly",
      monthly: "Monthly",
    };
    return labels[freq] || freq;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/payroll")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Tips & Tronc Management</h1>
          <p className="text-muted-foreground">
            Configure tip pooling and tronc distribution systems for hospitality
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Coins className="h-5 w-5 text-amber-500" />
              Tips Pool
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Traditional tip pooling where gratuities are collected and distributed among staff.
            Subject to Income Tax and National Insurance contributions.
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="h-5 w-5 text-purple-500" />
              Tronc System
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Independent gratuity pool managed by a troncmaster. When properly administered 
            independently from employer, payments are exempt from National Insurance.
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <PayrollFilters
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={setSelectedCompanyId}
          showPayGroupFilter={false}
        />
        <Button onClick={() => setIsDialogOpen(true)} disabled={!selectedCompanyId}>
          <Plus className="h-4 w-4 mr-2" />
          Create Pool
        </Button>
      </div>

      {!selectedCompanyId ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Select a company to manage tip pools
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="py-10 text-center">Loading...</CardContent>
        </Card>
      ) : pools?.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tip pools configured</p>
            <p className="text-sm">Create a Tips or Tronc pool to get started</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pool Configurations</CardTitle>
            <CardDescription>
              Manage tips and tronc distribution pools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Distribution</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Troncmaster</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pools?.map((pool: any) => (
                  <TableRow key={pool.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pool.name}</div>
                        <div className="text-xs text-muted-foreground">{pool.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={pool.pool_type === "tronc" ? "secondary" : "outline"}
                        className={pool.pool_type === "tronc" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}
                      >
                        {pool.pool_type === "tronc" ? (
                          <><Crown className="h-3 w-3 mr-1" /> Tronc</>
                        ) : (
                          <><Coins className="h-3 w-3 mr-1" /> Tips</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDistributionMethod(pool.distribution_method)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatFrequency(pool.distribution_frequency)}</Badge>
                    </TableCell>
                    <TableCell>
                      {pool.troncmaster ? (
                        <span className="text-sm">
                          {pool.troncmaster.first_name} {pool.troncmaster.last_name}
                        </span>
                      ) : pool.pool_type === "tronc" ? (
                        <span className="text-xs text-destructive">Not assigned</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={pool.is_active ? "default" : "outline"}>
                        {pool.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/payroll/tip-pools/${pool.id}/allocations`)}
                          title="Manage allocations"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/payroll/tip-pools/${pool.id}/collections`)}
                          title="View collections"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(pool)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(pool.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Pool Configuration" : "Create Pool Configuration"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Pool Type *</Label>
              <Select
                value={formData.pool_type}
                onValueChange={(value: "tips" | "tronc") => 
                  setFormData((prev) => ({ ...prev, pool_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tips">
                    <span className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-amber-500" />
                      Tips Pool (Subject to NI)
                    </span>
                  </SelectItem>
                  <SelectItem value="tronc">
                    <span className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-purple-500" />
                      Tronc System (NI Exempt)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Restaurant Tips"
                />
              </div>
              <div className="grid gap-2">
                <Label>Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g., REST-TIPS"
                />
              </div>
            </div>

            {formData.pool_type === "tronc" && (
              <div className="grid gap-2">
                <Label>Troncmaster *</Label>
                <Select
                  value={formData.troncmaster_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, troncmaster_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select troncmaster..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.employee_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The troncmaster must be independent from management to maintain NI exemption
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Distribution Method *</Label>
                <Select
                  value={formData.distribution_method}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, distribution_method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">Points-based</SelectItem>
                    <SelectItem value="hours">Hours worked</SelectItem>
                    <SelectItem value="equal">Equal split</SelectItem>
                    <SelectItem value="percentage">Fixed percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Distribution Frequency *</Label>
                <Select
                  value={formData.distribution_frequency}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, distribution_frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
              />
            </div>

            <div className="grid gap-2">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.include_in_payroll}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, include_in_payroll: checked }))}
                  />
                  <Label>Include in Payroll</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={
                !formData.name || 
                !formData.code || 
                !formData.start_date ||
                (formData.pool_type === "tronc" && !formData.troncmaster_id)
              }
            >
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
