import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, Save, Loader2, Info, Building2 } from "lucide-react";
import { useLeaveProrataSettings, LeaveProrataSettings } from "@/hooks/useLeaveEnhancements";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

export default function LeaveProrataSettingsPage() {
  const { t } = useLanguage();
  const { company } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState(company?.id || "");

  const { data: companies = [] } = useQuery({
    queryKey: ["companies-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
  });

  const effectiveCompanyId = selectedCompanyId || company?.id;
  const { prorataSettings, isLoading, upsertSettings } = useLeaveProrataSettings(effectiveCompanyId);
  const { leaveTypes } = useLeaveManagement(effectiveCompanyId);
  
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<LeaveProrataSettings>>({});

  const handleEdit = (leaveTypeId: string) => {
    const existing = prorataSettings.find(s => s.leave_type_id === leaveTypeId);
    setEditingTypeId(leaveTypeId);
    setFormData(existing || {
      leave_type_id: leaveTypeId,
      calculation_method: 'monthly',
      rounding_method: 'nearest',
      rounding_precision: 0.5,
      include_join_month: true,
      min_service_days_for_accrual: 0,
      apply_to_first_year_only: false,
      is_active: true,
    });
  };

  const handleSave = async () => {
    if (!editingTypeId) return;
    await upsertSettings.mutateAsync({
      ...formData,
      leave_type_id: editingTypeId,
    });
    setEditingTypeId(null);
    setFormData({});
  };

  const getSettingsForType = (leaveTypeId: string) => {
    return prorataSettings.find(s => s.leave_type_id === leaveTypeId);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: t("navigation.leave"), href: "/leave" },
          { label: "Pro-rata Settings" }
        ]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              Pro-rata Entitlement Settings
            </h1>
            <p className="text-muted-foreground">Configure how leave entitlements are calculated for mid-year joiners</p>
          </div>
          <Select value={selectedCompanyId || company?.id || ""} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-[220px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Pro-rata settings automatically calculate leave entitlements based on an employee's join date. 
            This ensures fair allocation for employees who join partway through the leave year.
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Calculation Method</TableHead>
                    <TableHead>Rounding</TableHead>
                    <TableHead>Include Join Month</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveTypes.map(leaveType => {
                    const settings = getSettingsForType(leaveType.id);
                    const isEditing = editingTypeId === leaveType.id;
                    
                    return (
                      <TableRow key={leaveType.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: leaveType.color }}
                            />
                            <span className="font-medium">{leaveType.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Select 
                              value={formData.calculation_method || 'monthly'} 
                              onValueChange={(v: any) => setFormData({ ...formData, calculation_method: v })}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline">
                              {settings?.calculation_method || 'Not configured'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Select 
                                value={formData.rounding_method || 'nearest'} 
                                onValueChange={(v: any) => setFormData({ ...formData, rounding_method: v })}
                              >
                                <SelectTrigger className="w-[100px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="up">Up</SelectItem>
                                  <SelectItem value="down">Down</SelectItem>
                                  <SelectItem value="nearest">Nearest</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                type="number"
                                step="0.25"
                                min="0.25"
                                max="1"
                                className="w-[70px]"
                                value={formData.rounding_precision || 0.5}
                                onChange={(e) => setFormData({ ...formData, rounding_precision: parseFloat(e.target.value) || 0.5 })}
                              />
                            </div>
                          ) : (
                            settings ? (
                              <span className="text-sm">
                                {settings.rounding_method} to {settings.rounding_precision}
                              </span>
                            ) : '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Switch
                              checked={formData.include_join_month ?? true}
                              onCheckedChange={(v) => setFormData({ ...formData, include_join_month: v })}
                            />
                          ) : (
                            settings?.include_join_month ? 'Yes' : 'No'
                          )}
                        </TableCell>
                        <TableCell>
                          {settings?.is_active ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="outline">Not Set</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Button size="sm" onClick={handleSave} disabled={upsertSettings.isPending}>
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingTypeId(null)}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleEdit(leaveType.id)}>
                              Configure
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Example Calculation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How Pro-rata Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Daily Calculation</h4>
                <p className="text-sm text-muted-foreground">
                  Entitlement = (Annual Days × Days Remaining) / Total Days in Year
                </p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Example: 20 days annual, join July 1st = 20 × (184/365) ≈ 10.08 days
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Monthly Calculation</h4>
                <p className="text-sm text-muted-foreground">
                  Entitlement = (Annual Days × Months Remaining) / 12
                </p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Example: 20 days annual, join July 1st = 20 × (6/12) = 10 days
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Quarterly Calculation</h4>
                <p className="text-sm text-muted-foreground">
                  Entitlement = (Annual Days × Quarters Remaining) / 4
                </p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Example: 20 days annual, join July 1st = 20 × (2/4) = 10 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
