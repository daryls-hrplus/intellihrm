import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Globe, Calculator, RefreshCcw } from "lucide-react";
import { usePageAudit } from "@/hooks/usePageAudit";
import { 
  fetchAllCountryTaxSettings,
  upsertCountryTaxSettings, 
  CountryTaxSettings 
} from "@/utils/payroll/countryTaxSettings";
import { countries, getCountryName } from "@/lib/countries";

const breadcrumbItems = [
  { label: "Dashboard", href: "/" },
  { label: "Payroll", href: "/payroll" },
  { label: "Country Tax Settings" },
];

interface FormData {
  id?: string;
  country: string;
  taxCalculationMethod: 'cumulative' | 'non_cumulative';
  allowMidYearRefunds: boolean;
  refundMethod: 'automatic' | 'end_of_year' | 'manual_claim';
  refundDisplayType: 'separate_line_item' | 'reduced_tax';
  refundCalculationFrequency: 'monthly' | 'quarterly' | 'annually';
  refundLineItemLabel: string;
  description: string;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
}

const initialFormData: FormData = {
  country: '',
  taxCalculationMethod: 'cumulative',
  allowMidYearRefunds: true,
  refundMethod: 'automatic',
  refundDisplayType: 'reduced_tax',
  refundCalculationFrequency: 'monthly',
  refundLineItemLabel: 'PAYE Refund',
  description: '',
  effectiveFrom: new Date().toISOString().split('T')[0],
  effectiveTo: '',
  isActive: true,
};

export default function CountryTaxSettingsPage() {
  usePageAudit('country_tax_settings', 'Payroll');
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['country-tax-settings'],
    queryFn: fetchAllCountryTaxSettings,
  });

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => upsertCountryTaxSettings({
      id: data.id,
      country: data.country,
      taxCalculationMethod: data.taxCalculationMethod,
      allowMidYearRefunds: data.allowMidYearRefunds,
      refundMethod: data.refundMethod,
      refundDisplayType: data.refundDisplayType,
      refundCalculationFrequency: data.refundCalculationFrequency,
      refundLineItemLabel: data.refundLineItemLabel || null,
      description: data.description || null,
      effectiveFrom: data.effectiveFrom,
      effectiveTo: data.effectiveTo || null,
      isActive: data.isActive,
    }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Country tax settings ${isEditing ? 'updated' : 'created'} successfully`);
        queryClient.invalidateQueries({ queryKey: ['country-tax-settings'] });
        setDialogOpen(false);
        setFormData(initialFormData);
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    },
    onError: (error) => {
      toast.error('Failed to save settings');
      console.error(error);
    },
  });

  const handleEdit = (setting: CountryTaxSettings) => {
    setFormData({
      id: setting.id,
      country: setting.country,
      taxCalculationMethod: setting.taxCalculationMethod,
      allowMidYearRefunds: setting.allowMidYearRefunds,
      refundMethod: setting.refundMethod,
      refundDisplayType: setting.refundDisplayType || 'reduced_tax',
      refundCalculationFrequency: setting.refundCalculationFrequency || 'monthly',
      refundLineItemLabel: setting.refundLineItemLabel || 'PAYE Refund',
      description: setting.description || '',
      effectiveFrom: setting.effectiveFrom,
      effectiveTo: setting.effectiveTo || '',
      isActive: setting.isActive,
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.country) {
      toast.error('Please select a country');
      return;
    }
    saveMutation.mutate(formData);
  };

  const getMethodBadge = (method: string) => {
    if (method === 'cumulative') {
      return <Badge variant="default" className="bg-blue-500">Cumulative (YTD)</Badge>;
    }
    return <Badge variant="secondary">Non-Cumulative (Period)</Badge>;
  };

  const getRefundBadge = (method: string, allowed: boolean) => {
    if (!allowed) {
      return <Badge variant="outline">End of Year Only</Badge>;
    }
    switch (method) {
      case 'automatic':
        return <Badge variant="default" className="bg-green-500">Auto Refund</Badge>;
      case 'end_of_year':
        return <Badge variant="secondary">Year-End</Badge>;
      case 'manual_claim':
        return <Badge variant="outline">Manual Claim</Badge>;
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Country Tax Settings</h1>
              <p className="text-muted-foreground">
                Configure tax calculation methods per country
              </p>
            </div>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Country
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Tax Calculation Methods
            </CardTitle>
            <CardDescription>
              Define whether each country uses cumulative (YTD-based) or non-cumulative (period-based) tax calculation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : settings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No country tax settings configured yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Tax Method</TableHead>
                    <TableHead>Refund Handling</TableHead>
                    <TableHead>Refund Display</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.map((setting) => (
                    <TableRow key={setting.id}>
                      <TableCell className="font-medium">
                        {getCountryName(setting.country)} ({setting.country})
                      </TableCell>
                      <TableCell>
                        {getMethodBadge(setting.taxCalculationMethod)}
                      </TableCell>
                      <TableCell>
                        {getRefundBadge(setting.refundMethod, setting.allowMidYearRefunds)}
                      </TableCell>
                      <TableCell>
                        {setting.allowMidYearRefunds ? (
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="w-fit">
                              {setting.refundDisplayType === 'separate_line_item' 
                                ? 'Separate Line' 
                                : 'Reduced Tax'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {setting.refundCalculationFrequency}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {setting.isActive ? (
                          <Badge variant="default" className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(setting)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <RefreshCcw className="h-5 w-5" />
              Understanding Tax Calculation Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-blue-600">Cumulative (YTD-Based)</h4>
              <p className="text-sm text-muted-foreground">
                Tax is calculated on year-to-date earnings. Each pay period, the system calculates 
                total tax due on cumulative income and deducts the difference from previous payments. 
                This method can result in mid-year refunds if an employee's income decreases.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Common in:</strong> UK, Trinidad & Tobago, Jamaica, Barbados
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-orange-600">Non-Cumulative (Period-Based)</h4>
              <p className="text-sm text-muted-foreground">
                Tax is calculated only on the current period's earnings without considering prior 
                periods. Prior earnings and tax credits are not carried forward. Any over or 
                under-payment is reconciled at year-end through annual tax filing.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Common in:</strong> Nigeria, Dominican Republic, some US states
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Country Tax Settings' : 'Add Country Tax Settings'}
              </DialogTitle>
              <DialogDescription>
                Configure how taxes are calculated for this country
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                  disabled={isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name} ({country.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tax Calculation Method</Label>
                <Select
                  value={formData.taxCalculationMethod}
                  onValueChange={(value: 'cumulative' | 'non_cumulative') => 
                    setFormData(prev => ({ 
                      ...prev, 
                      taxCalculationMethod: value,
                      // If non-cumulative, disable mid-year refunds by default
                      allowMidYearRefunds: value === 'cumulative' ? prev.allowMidYearRefunds : false,
                    }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cumulative">
                      Cumulative (YTD-Based) - Tax calculated on year-to-date income
                    </SelectItem>
                    <SelectItem value="non_cumulative">
                      Non-Cumulative (Period-Based) - Tax calculated on current period only
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.taxCalculationMethod === 'cumulative' && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Mid-Year Refunds</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically apply tax refunds during the year if over-deducted
                      </p>
                    </div>
                    <Switch
                      checked={formData.allowMidYearRefunds}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, allowMidYearRefunds: checked }))}
                    />
                  </div>

                  {formData.allowMidYearRefunds && (
                    <>
                      <div className="space-y-2">
                        <Label>Refund Method</Label>
                        <Select
                          value={formData.refundMethod}
                          onValueChange={(value: 'automatic' | 'end_of_year' | 'manual_claim') => 
                            setFormData(prev => ({ ...prev, refundMethod: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="automatic">
                              Automatic - Apply refund in payroll immediately
                            </SelectItem>
                            <SelectItem value="end_of_year">
                              End of Year - Accumulate and refund at year end
                            </SelectItem>
                            <SelectItem value="manual_claim">
                              Manual Claim - Employee must request refund
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Refund Calculation Frequency</Label>
                        <Select
                          value={formData.refundCalculationFrequency}
                          onValueChange={(value: 'monthly' | 'quarterly' | 'annually') => 
                            setFormData(prev => ({ ...prev, refundCalculationFrequency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly - Calculate refunds each month</SelectItem>
                            <SelectItem value="quarterly">Quarterly - Calculate refunds each quarter</SelectItem>
                            <SelectItem value="annually">Annually - Calculate refunds at year end only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Refund Display on Payslip</Label>
                        <Select
                          value={formData.refundDisplayType}
                          onValueChange={(value: 'separate_line_item' | 'reduced_tax') => 
                            setFormData(prev => ({ ...prev, refundDisplayType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="separate_line_item">
                              Separate Line Item - Show refund as distinct entry under PAYE
                            </SelectItem>
                            <SelectItem value="reduced_tax">
                              Reduced Tax Amount - Reflect as lower tax deduction
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Some countries require refunds shown separately, others as reduced tax
                        </p>
                      </div>

                      {formData.refundDisplayType === 'separate_line_item' && (
                        <div className="space-y-2">
                          <Label>Refund Line Item Label</Label>
                          <Input
                            value={formData.refundLineItemLabel}
                            onChange={(e) => setFormData(prev => ({ ...prev, refundLineItemLabel: e.target.value }))}
                            placeholder="e.g., PAYE Refund, Income Tax Credit"
                          />
                          <p className="text-xs text-muted-foreground">
                            Label shown on payslip for the refund line
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Effective From</Label>
                  <Input
                    type="date"
                    value={formData.effectiveFrom}
                    onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Effective To (Optional)</Label>
                  <Input
                    type="date"
                    value={formData.effectiveTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, effectiveTo: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., PAYE calculated on cumulative YTD basis per Income Tax Act"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Use these settings for payroll calculations
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
