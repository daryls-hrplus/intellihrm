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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowLeft, 
  Calculator, 
  CheckCircle2, 
  DollarSign,
  Percent,
  Gift,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";
import { useNavigate } from "react-router-dom";
import { PayrollFilters, usePayrollFilters } from "@/components/payroll/PayrollFilters";
import { useRetroactivePay, RetroactivePayConfig, RetroactivePayConfigItem } from "@/hooks/useRetroactivePay";

interface ConfigFormData {
  config_name: string;
  description: string;
  pay_group_id: string;
  effective_start_date: string;
  effective_end_date: string;
}

interface ItemFormData {
  pay_element_id: string;
  increase_type: 'percentage' | 'fixed_amount' | 'one_off';
  increase_value: string;
  min_amount: string;
  max_amount: string;
  notes: string;
}

export default function RetroactivePayConfigPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedCompanyId, setSelectedCompanyId } = usePayrollFilters();
  const {
    isLoading: hookLoading,
    createConfig,
    updateConfig,
    deleteConfig,
    addConfigItem,
    updateConfigItem,
    deleteConfigItem,
    approveConfig,
    generateCalculations,
  } = useRetroactivePay();

  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);

  const [configFormData, setConfigFormData] = useState<ConfigFormData>({
    config_name: "",
    description: "",
    pay_group_id: "",
    effective_start_date: getTodayString(),
    effective_end_date: getTodayString(),
  });

  const [itemFormData, setItemFormData] = useState<ItemFormData>({
    pay_element_id: "",
    increase_type: "percentage",
    increase_value: "",
    min_amount: "",
    max_amount: "",
    notes: "",
  });

  // Fetch configs
  const { data: configs, isLoading: configsLoading } = useQuery({
    queryKey: ["retroactive-pay-configs", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("retroactive_pay_configs")
        .select(`
          *,
          pay_group:pay_groups(id, name, code)
        `)
        .eq("company_id", selectedCompanyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RetroactivePayConfig[];
    },
    enabled: !!selectedCompanyId,
  });

  // Fetch pay groups for the company
  const { data: payGroups } = useQuery({
    queryKey: ["pay-groups", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("pay_groups")
        .select("id, name, code")
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  // Fetch pay elements
  const { data: payElements } = useQuery({
    queryKey: ["pay-elements", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("pay_elements")
        .select("id, name, code")
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  // Fetch items for selected config
  const { data: configItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["retroactive-pay-config-items", selectedConfigId],
    queryFn: async () => {
      if (!selectedConfigId) return [];
      const { data, error } = await supabase
        .from("retroactive_pay_config_items")
        .select(`
          *,
          pay_element:pay_elements(id, name, code)
        `)
        .eq("config_id", selectedConfigId)
        .order("created_at");
      if (error) throw error;
      return data as RetroactivePayConfigItem[];
    },
    enabled: !!selectedConfigId,
  });

  const selectedConfig = configs?.find(c => c.id === selectedConfigId);

  // Config mutations
  const saveConfigMutation = useMutation({
    mutationFn: async (data: ConfigFormData) => {
      if (editingConfigId) {
        const success = await updateConfig(editingConfigId, {
          config_name: data.config_name,
          description: data.description || undefined,
          pay_group_id: data.pay_group_id,
          effective_start_date: data.effective_start_date,
          effective_end_date: data.effective_end_date,
        });
        if (!success) throw new Error("Failed to update config");
      } else {
        const id = await createConfig({
          company_id: selectedCompanyId!,
          config_name: data.config_name,
          description: data.description || undefined,
          pay_group_id: data.pay_group_id,
          effective_start_date: data.effective_start_date,
          effective_end_date: data.effective_end_date,
        });
        if (!id) throw new Error("Failed to create config");
        setSelectedConfigId(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retroactive-pay-configs"] });
      toast.success(editingConfigId ? "Configuration updated" : "Configuration created");
      closeConfigDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save configuration");
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: async (id: string) => {
      const success = await deleteConfig(id);
      if (!success) throw new Error("Failed to delete config");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retroactive-pay-configs"] });
      if (selectedConfigId === editingConfigId) {
        setSelectedConfigId(null);
      }
      toast.success("Configuration deleted");
    },
    onError: () => toast.error("Failed to delete configuration"),
  });

  // Item mutations
  const saveItemMutation = useMutation({
    mutationFn: async (data: ItemFormData) => {
      const itemData = {
        config_id: selectedConfigId!,
        pay_element_id: data.pay_element_id,
        increase_type: data.increase_type,
        increase_value: parseFloat(data.increase_value),
        min_amount: data.min_amount ? parseFloat(data.min_amount) : undefined,
        max_amount: data.max_amount ? parseFloat(data.max_amount) : undefined,
        notes: data.notes || undefined,
      };

      if (editingItemId) {
        const success = await updateConfigItem(editingItemId, itemData);
        if (!success) throw new Error("Failed to update item");
      } else {
        const id = await addConfigItem(itemData);
        if (!id) throw new Error("Failed to create item");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retroactive-pay-config-items"] });
      toast.success(editingItemId ? "Pay element updated" : "Pay element added");
      closeItemDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save pay element");
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const success = await deleteConfigItem(id);
      if (!success) throw new Error("Failed to delete item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retroactive-pay-config-items"] });
      toast.success("Pay element removed");
    },
    onError: () => toast.error("Failed to remove pay element"),
  });

  // Generate calculations
  const generateMutation = useMutation({
    mutationFn: async (configId: string) => {
      const result = await generateCalculations(configId);
      if (!result.success) throw new Error("Failed to generate calculations");
      return result;
    },
    onSuccess: (result) => {
      toast.success(
        `Generated ${result.count} calculations. Total adjustment: $${result.totalAdjustment.toFixed(2)}`
      );
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate calculations");
    },
  });

  const closeConfigDialog = () => {
    setIsConfigDialogOpen(false);
    setEditingConfigId(null);
    setConfigFormData({
      config_name: "",
      description: "",
      pay_group_id: "",
      effective_start_date: getTodayString(),
      effective_end_date: getTodayString(),
    });
  };

  const closeItemDialog = () => {
    setIsItemDialogOpen(false);
    setEditingItemId(null);
    setItemFormData({
      pay_element_id: "",
      increase_type: "percentage",
      increase_value: "",
      min_amount: "",
      max_amount: "",
      notes: "",
    });
  };

  const handleEditConfig = (config: RetroactivePayConfig) => {
    setEditingConfigId(config.id);
    setConfigFormData({
      config_name: config.config_name,
      description: config.description || "",
      pay_group_id: config.pay_group_id,
      effective_start_date: config.effective_start_date,
      effective_end_date: config.effective_end_date,
    });
    setIsConfigDialogOpen(true);
  };

  const handleEditItem = (item: RetroactivePayConfigItem) => {
    setEditingItemId(item.id);
    setItemFormData({
      pay_element_id: item.pay_element_id,
      increase_type: item.increase_type,
      increase_value: item.increase_value.toString(),
      min_amount: item.min_amount?.toString() || "",
      max_amount: item.max_amount?.toString() || "",
      notes: item.notes || "",
    });
    setIsItemDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      draft: "secondary",
      approved: "default",
      processed: "outline",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getIncreaseTypeIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <Percent className="h-4 w-4" />;
      case "fixed_amount":
        return <DollarSign className="h-4 w-4" />;
      case "one_off":
        return <Gift className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatIncreaseValue = (type: string, value: number) => {
    if (type === "percentage") {
      return `${value}%`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/payroll")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Retroactive Pay Configuration</h1>
          <p className="text-muted-foreground">
            Define back pay increases by pay group and pay elements
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <PayrollFilters
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={setSelectedCompanyId}
          showPayGroupFilter={false}
        />
        <Button onClick={() => setIsConfigDialogOpen(true)} disabled={!selectedCompanyId}>
          <Plus className="h-4 w-4 mr-2" />
          New Configuration
        </Button>
      </div>

      {!selectedCompanyId ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Please select a company to manage retroactive pay configurations
          </CardContent>
        </Card>
      ) : configsLoading ? (
        <Card>
          <CardContent className="py-10 text-center">Loading...</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configs List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Configurations</CardTitle>
              <CardDescription>Select a configuration to manage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {configs?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No configurations yet. Create one to get started.
                </p>
              ) : (
                configs?.map((config) => (
                  <div
                    key={config.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedConfigId === config.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    }`}
                    onClick={() => setSelectedConfigId(config.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{config.config_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {config.pay_group?.name || "No pay group"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateForDisplay(config.effective_start_date, "PP")} -{" "}
                          {formatDateForDisplay(config.effective_end_date, "PP")}
                        </p>
                      </div>
                      {getStatusBadge(config.status)}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Config Details */}
          <Card className="lg:col-span-2">
            {!selectedConfigId ? (
              <CardContent className="py-10 text-center text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a configuration from the list to view details</p>
              </CardContent>
            ) : (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedConfig?.config_name}</CardTitle>
                      <CardDescription>
                        {selectedConfig?.pay_group?.name} • {selectedConfig?.pay_group?.code}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedConfig?.status === "draft" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditConfig(selectedConfig)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteConfigMutation.mutate(selectedConfigId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Config Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-medium">{getStatusBadge(selectedConfig?.status || "draft")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="font-medium">
                        {formatDateForDisplay(selectedConfig?.effective_start_date || "", "PP")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <p className="font-medium">
                        {formatDateForDisplay(selectedConfig?.effective_end_date || "", "PP")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pay Elements</p>
                      <p className="font-medium">{configItems?.length || 0}</p>
                    </div>
                  </div>

                  {/* Pay Elements */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Pay Element Increases</h3>
                      {selectedConfig?.status === "draft" && (
                        <Button size="sm" onClick={() => setIsItemDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Pay Element
                        </Button>
                      )}
                    </div>

                    {itemsLoading ? (
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : configItems?.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No pay elements configured yet
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pay Element</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead className="text-right">Min</TableHead>
                            <TableHead className="text-right">Max</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {configItems?.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                <div>
                                  <p>{item.pay_element?.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.pay_element?.code}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {getIncreaseTypeIcon(item.increase_type)}
                                  <span className="capitalize">
                                    {item.increase_type.replace("_", " ")}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {formatIncreaseValue(item.increase_type, item.increase_value)}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {item.min_amount ? `$${item.min_amount}` : "-"}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {item.max_amount ? `$${item.max_amount}` : "-"}
                              </TableCell>
                              <TableCell>
                                {selectedConfig?.status === "draft" && (
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditItem(item)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteItemMutation.mutate(item.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>

                  {/* Actions */}
                  {selectedConfig?.status === "draft" && configItems && configItems.length > 0 && (
                    <div className="flex items-center justify-end gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => generateMutation.mutate(selectedConfigId)}
                        disabled={generateMutation.isPending}
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Generate Calculations
                      </Button>
                      <Button
                        onClick={() => navigate(`/payroll/retroactive-pay/generate/${selectedConfigId}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Calculations
                      </Button>
                    </div>
                  )}

                  {selectedConfig?.status !== "draft" && (
                    <div className="flex items-center justify-end gap-2 pt-4 border-t">
                      <Button
                        onClick={() => navigate(`/payroll/retroactive-pay/generate/${selectedConfigId}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Calculations
                      </Button>
                    </div>
                  )}
                </CardContent>
              </>
            )}
          </Card>
        </div>
      )}

      {/* Config Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingConfigId ? "Edit Configuration" : "New Retroactive Pay Configuration"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Configuration Name *</Label>
              <Input
                value={configFormData.config_name}
                onChange={(e) =>
                  setConfigFormData((prev) => ({ ...prev, config_name: e.target.value }))
                }
                placeholder="e.g., 2024 Annual Salary Increase"
              />
            </div>
            <div className="grid gap-2">
              <Label>Pay Group *</Label>
              <Select
                value={configFormData.pay_group_id}
                onValueChange={(value) =>
                  setConfigFormData((prev) => ({ ...prev, pay_group_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pay group" />
                </SelectTrigger>
                <SelectContent>
                  {payGroups?.map((pg) => (
                    <SelectItem key={pg.id} value={pg.id}>
                      {pg.name} ({pg.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Effective Start Date *</Label>
                <Input
                  type="date"
                  value={configFormData.effective_start_date}
                  onChange={(e) =>
                    setConfigFormData((prev) => ({ ...prev, effective_start_date: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Effective End Date *</Label>
                <Input
                  type="date"
                  value={configFormData.effective_end_date}
                  onChange={(e) =>
                    setConfigFormData((prev) => ({ ...prev, effective_end_date: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={configFormData.description}
                onChange={(e) =>
                  setConfigFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Optional notes about this retroactive pay configuration"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeConfigDialog}>
              Cancel
            </Button>
            <Button
              onClick={() => saveConfigMutation.mutate(configFormData)}
              disabled={
                !configFormData.config_name ||
                !configFormData.pay_group_id ||
                !configFormData.effective_start_date ||
                !configFormData.effective_end_date ||
                saveConfigMutation.isPending
              }
            >
              {editingConfigId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItemId ? "Edit Pay Element Increase" : "Add Pay Element Increase"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Pay Element *</Label>
              <Select
                value={itemFormData.pay_element_id}
                onValueChange={(value) =>
                  setItemFormData((prev) => ({ ...prev, pay_element_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pay element" />
                </SelectTrigger>
                <SelectContent>
                  {payElements?.map((pe) => (
                    <SelectItem key={pe.id} value={pe.id}>
                      {pe.name} ({pe.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Increase Type *</Label>
              <Select
                value={itemFormData.increase_type}
                onValueChange={(value: 'percentage' | 'fixed_amount' | 'one_off') =>
                  setItemFormData((prev) => ({ ...prev, increase_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      <span>Percentage Increase</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed_amount">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Fixed Amount Increase</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="one_off">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      <span>One-Off Payment</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {itemFormData.increase_type === "percentage" &&
                  "Increase original amount by this percentage"}
                {itemFormData.increase_type === "fixed_amount" &&
                  "Add this fixed amount per pay period"}
                {itemFormData.increase_type === "one_off" &&
                  "Single payment for the entire period (not per pay cycle)"}
              </p>
            </div>
            <div className="grid gap-2">
              <Label>
                {itemFormData.increase_type === "percentage" ? "Percentage *" : "Amount *"}
              </Label>
              <Input
                type="number"
                step={itemFormData.increase_type === "percentage" ? "0.01" : "0.01"}
                value={itemFormData.increase_value}
                onChange={(e) =>
                  setItemFormData((prev) => ({ ...prev, increase_value: e.target.value }))
                }
                placeholder={itemFormData.increase_type === "percentage" ? "e.g., 5.5" : "e.g., 100.00"}
              />
            </div>
            {itemFormData.increase_type !== "one_off" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Min Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={itemFormData.min_amount}
                    onChange={(e) =>
                      setItemFormData((prev) => ({ ...prev, min_amount: e.target.value }))
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Max Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={itemFormData.max_amount}
                    onChange={(e) =>
                      setItemFormData((prev) => ({ ...prev, max_amount: e.target.value }))
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                value={itemFormData.notes}
                onChange={(e) => setItemFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeItemDialog}>
              Cancel
            </Button>
            <Button
              onClick={() => saveItemMutation.mutate(itemFormData)}
              disabled={
                !itemFormData.pay_element_id ||
                !itemFormData.increase_value ||
                saveItemMutation.isPending
              }
            >
              {editingItemId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
