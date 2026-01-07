import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Receipt, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { TaxBracketUpload } from "@/components/payroll/TaxBracketUpload";
import { getTodayString } from "@/utils/dateUtils";
import { getCountryName } from "@/lib/countries";
import { usePageAudit } from "@/hooks/usePageAudit";

interface StatutoryDeductionType {
  id: string;
  country: string;
  statutory_type: string;
  statutory_code: string;
  statutory_name: string;
  start_date: string;
  end_date: string | null;
}

interface StatutoryRateBand {
  id: string;
  company_id: string | null;
  statutory_type_id: string;
  band_name: string | null;
  min_amount: number;
  max_amount: number | null;
  employee_rate: number | null;
  employer_rate: number | null;
  fixed_amount: number | null;
  earnings_class: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  display_order: number;
  calculation_method: string;
  per_monday_amount: number | null;
  employer_per_monday_amount: number | null;
  min_age: number | null;
  max_age: number | null;
  pay_frequency: string;
}

export default function TaxConfigPage() {
  usePageAudit('tax_config', 'Payroll');
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statutoryTypes, setStatutoryTypes] = useState<StatutoryDeductionType[]>([]);
  const [rateBands, setRateBands] = useState<StatutoryRateBand[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBand, setEditingBand] = useState<StatutoryRateBand | null>(null);

  const [bandForm, setBandForm] = useState({
    band_name: "",
    min_amount: 0,
    max_amount: null as number | null,
    employee_rate: null as number | null,
    employer_rate: null as number | null,
    fixed_amount: null as number | null,
    earnings_class: "",
    is_active: true,
    start_date: getTodayString(),
    end_date: null as string | null,
    notes: "",
    display_order: 0,
    calculation_method: 'percentage' as string,
    per_monday_amount: null as number | null,
    employer_per_monday_amount: null as number | null,
    min_age: null as number | null,
    max_age: null as number | null,
    pay_frequency: 'monthly' as string,
  });

  useEffect(() => {
    loadStatutoryTypes();
  }, []);

  useEffect(() => {
    if (selectedCountry && filteredTypes.length > 0) {
      loadRateBands();
    } else {
      setRateBands([]);
    }
  }, [selectedCountry, statutoryTypes]);

  const loadStatutoryTypes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('statutory_deduction_types')
        .select('*')
        .order('country', { ascending: true })
        .order('statutory_name', { ascending: true });

      if (error) throw error;

      setStatutoryTypes(data || []);
      
      // Extract unique countries
      const uniqueCountries = [...new Set((data || []).map(s => s.country))];
      setCountries(uniqueCountries);
      
      // Auto-select first country if available
      if (uniqueCountries.length > 0 && !selectedCountry) {
        setSelectedCountry(uniqueCountries[0]);
      }
    } catch (error) {
      console.error('Error loading statutory types:', error);
      toast.error('Failed to load statutory types');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRateBands = async () => {
    const typeIds = filteredTypes.map(t => t.id);
    if (typeIds.length === 0) return;
    
    try {
      const { data, error } = await supabase
        .from('statutory_rate_bands')
        .select('*')
        .in('statutory_type_id', typeIds)
        .order('display_order', { ascending: true })
        .order('min_amount', { ascending: true });

      if (error) throw error;
      setRateBands(data || []);
    } catch (error) {
      console.error('Error loading rate bands:', error);
      toast.error('Failed to load rate bands');
    }
  };

  const filteredTypes = statutoryTypes.filter(s => s.country === selectedCountry);

  // Auto-select first type when country changes
  useEffect(() => {
    if (filteredTypes.length > 0) {
      setSelectedTypeId(filteredTypes[0].id);
    } else {
      setSelectedTypeId("");
    }
  }, [selectedCountry, statutoryTypes]);

  const resetForm = () => {
    setEditingBand(null);
    const currentTypeBands = rateBands.filter(b => b.statutory_type_id === selectedTypeId);
    setBandForm({
      band_name: "",
      min_amount: 0,
      max_amount: null,
      employee_rate: null,
      employer_rate: null,
      fixed_amount: null,
      earnings_class: "",
      is_active: true,
      start_date: getTodayString(),
      end_date: null,
      notes: "",
      display_order: currentTypeBands.length,
      calculation_method: 'percentage',
      per_monday_amount: null,
      employer_per_monday_amount: null,
      min_age: null,
      max_age: null,
      pay_frequency: 'monthly',
    });
  };

  const openEdit = (band: StatutoryRateBand) => {
    setEditingBand(band);
    setBandForm({
      band_name: band.band_name || "",
      min_amount: band.min_amount,
      max_amount: band.max_amount,
      employee_rate: band.employee_rate,
      employer_rate: band.employer_rate,
      fixed_amount: band.fixed_amount,
      earnings_class: band.earnings_class || "",
      is_active: band.is_active,
      start_date: band.start_date,
      end_date: band.end_date,
      notes: band.notes || "",
      display_order: band.display_order,
      calculation_method: band.calculation_method || 'percentage',
      per_monday_amount: band.per_monday_amount,
      employer_per_monday_amount: band.employer_per_monday_amount,
      min_age: band.min_age,
      max_age: band.max_age,
      pay_frequency: band.pay_frequency || 'monthly',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedTypeId) {
      toast.error('Please select a statutory type first');
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    try {
      const data = {
        statutory_type_id: selectedTypeId,
        band_name: bandForm.band_name || null,
        min_amount: bandForm.min_amount,
        max_amount: bandForm.max_amount,
        employee_rate: bandForm.employee_rate,
        employer_rate: bandForm.employer_rate,
        fixed_amount: bandForm.fixed_amount,
        earnings_class: bandForm.earnings_class || null,
        is_active: bandForm.is_active,
        start_date: bandForm.start_date,
        end_date: bandForm.end_date,
        notes: bandForm.notes || null,
        display_order: bandForm.display_order,
        calculation_method: bandForm.calculation_method,
        per_monday_amount: bandForm.per_monday_amount,
        employer_per_monday_amount: bandForm.employer_per_monday_amount,
        min_age: bandForm.min_age,
        max_age: bandForm.max_age,
        pay_frequency: bandForm.pay_frequency,
      };

      if (editingBand) {
        const { error } = await supabase
          .from('statutory_rate_bands')
          .update(data)
          .eq('id', editingBand.id);
        if (error) throw error;
        toast.success('Rate band updated successfully');
      } else {
        const { error } = await supabase
          .from('statutory_rate_bands')
          .insert(data);
        if (error) throw error;
        toast.success('Rate band created successfully');
      }

      setDialogOpen(false);
      resetForm();
      loadRateBands();
    } catch (error) {
      console.error('Error saving rate band:', error);
      toast.error('Failed to save rate band');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rate band?')) return;

    try {
      const { error } = await supabase
        .from('statutory_rate_bands')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Rate band deleted successfully');
      loadRateBands();
    } catch (error) {
      console.error('Error deleting rate band:', error);
      toast.error('Failed to delete rate band');
    }
  };

  const getSelectedTypeName = () => {
    const type = statutoryTypes.find(s => s.id === selectedTypeId);
    return type?.statutory_name || '';
  };

  const getSelectedType = () => {
    return statutoryTypes.find(s => s.id === selectedTypeId);
  };

  const formatRate = (rate: number | null) => {
    if (rate === null) return '-';
    return `${(rate * 100).toFixed(2)}%`;
  };

  const formatAmount = (amount: number | null) => {
    if (amount === null) return '-';
    return amount.toLocaleString();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("payroll.title"), href: "/payroll" },
            { label: t("payroll.taxConfig.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
              <Receipt className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("payroll.taxConfig.title")}</h1>
              <p className="text-muted-foreground">Configure statutory deductions by country and type</p>
            </div>
          </div>
        </div>

        {/* Country Filter */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Select Country</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country} - {getCountryName(country)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {countries.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                No statutory deduction types configured. Please add statutory types first.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Statutory Type Tabs */}
        {selectedCountry && filteredTypes.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <Tabs value={selectedTypeId} onValueChange={setSelectedTypeId}>
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="flex-wrap h-auto gap-1">
                    {filteredTypes.map((type) => (
                      <TabsTrigger key={type.id} value={type.id} className="text-sm">
                        {type.statutory_name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {selectedTypeId && (
                    <div className="flex items-center gap-2">
                      <TaxBracketUpload
                        statutoryTypeId={selectedTypeId}
                        statutoryTypeName={getSelectedTypeName()}
                        country={selectedCountry}
                        onBracketsImported={loadRateBands}
                      />
                      <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Band
                      </Button>
                    </div>
                  )}
                </div>

                {filteredTypes.map((type) => (
                  <TabsContent key={type.id} value={type.id} className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>Code: <strong>{type.statutory_code}</strong></span>
                      <span>Type: <strong>{type.statutory_type}</strong></span>
                      <span>Valid: <strong>{type.start_date}</strong> - <strong>{type.end_date || 'Ongoing'}</strong></span>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Band/Class</TableHead>
                          <TableHead>Pay Frequency</TableHead>
                          <TableHead>Calc Method</TableHead>
                          <TableHead className="text-right">Min Amount</TableHead>
                          <TableHead className="text-right">Max Amount</TableHead>
                          <TableHead className="text-right">Employee</TableHead>
                          <TableHead className="text-right">Employer</TableHead>
                          <TableHead>Valid From</TableHead>
                          <TableHead>Valid To</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rateBands.filter(b => b.statutory_type_id === type.id).map((band) => (
                          <TableRow key={band.id}>
                            <TableCell className="font-medium">
                              {band.band_name || band.earnings_class || `Band ${band.display_order + 1}`}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs capitalize">
                                {band.pay_frequency || 'monthly'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {band.calculation_method === 'per_monday' ? 'Per Monday' : 
                                 band.calculation_method === 'fixed' ? 'Fixed' : 'Percentage'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatAmount(band.min_amount)}</TableCell>
                            <TableCell className="text-right">{formatAmount(band.max_amount)}</TableCell>
                            <TableCell className="text-right">
                              {band.calculation_method === 'per_monday' 
                                ? `$${band.per_monday_amount?.toFixed(2) || '0'}/Mon`
                                : band.calculation_method === 'fixed'
                                ? formatAmount(band.fixed_amount)
                                : formatRate(band.employee_rate)}
                            </TableCell>
                            <TableCell className="text-right">
                              {band.calculation_method === 'per_monday' 
                                ? `$${band.employer_per_monday_amount?.toFixed(2) || '0'}/Mon`
                                : band.calculation_method === 'fixed'
                                ? '-'
                                : formatRate(band.employer_rate)}
                            </TableCell>
                            <TableCell>{band.start_date}</TableCell>
                            <TableCell>{band.end_date || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={band.is_active ? "default" : "secondary"}>
                                {band.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openEdit(band)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(band.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {rateBands.filter(b => b.statutory_type_id === type.id).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                              No rate bands configured for {type.statutory_name}. Click "Add Band" to create one.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}

        {selectedCountry && filteredTypes.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No statutory deduction types configured for {selectedCountry}. 
              Please add statutory types in the Statutory Deduction Types page first.
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Band Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingBand ? 'Edit' : 'Add'} Rate Band - {getSelectedTypeName()}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Band Name</Label>
                  <Input
                    value={bandForm.band_name}
                    onChange={(e) => setBandForm({ ...bandForm, band_name: e.target.value })}
                    placeholder="e.g., Band A, First £12,570"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Earnings Class (NIS)</Label>
                  <Input
                    value={bandForm.earnings_class}
                    onChange={(e) => setBandForm({ ...bandForm, earnings_class: e.target.value })}
                    placeholder="e.g., Class 1, Category A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pay Frequency *</Label>
                  <Select 
                    value={bandForm.pay_frequency} 
                    onValueChange={(value) => setBandForm({ ...bandForm, pay_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Fortnightly uses weekly ranges (÷2)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Calculation Method *</Label>
                  <Select 
                    value={bandForm.calculation_method} 
                    onValueChange={(value) => setBandForm({ ...bandForm, calculation_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage of Earnings</SelectItem>
                      <SelectItem value="per_monday">Per Monday (NI/Health Surcharge)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={bandForm.min_amount}
                    onChange={(e) => setBandForm({ ...bandForm, min_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={bandForm.max_amount || ''}
                    onChange={(e) => setBandForm({ ...bandForm, max_amount: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="Leave empty for no limit"
                  />
                </div>
              </div>

              {bandForm.calculation_method === 'percentage' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employee Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={bandForm.employee_rate !== null ? bandForm.employee_rate * 100 : ''}
                      onChange={(e) => setBandForm({ ...bandForm, employee_rate: e.target.value ? parseFloat(e.target.value) / 100 : null })}
                      placeholder="e.g., 12.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Employer Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={bandForm.employer_rate !== null ? bandForm.employer_rate * 100 : ''}
                      onChange={(e) => setBandForm({ ...bandForm, employer_rate: e.target.value ? parseFloat(e.target.value) / 100 : null })}
                      placeholder="e.g., 13.8"
                    />
                  </div>
                </div>
              )}

              {bandForm.calculation_method === 'per_monday' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employee Amount per Monday</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={bandForm.per_monday_amount || ''}
                      onChange={(e) => setBandForm({ ...bandForm, per_monday_amount: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="e.g., 15.60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Employer Amount per Monday</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={bandForm.employer_per_monday_amount || ''}
                      onChange={(e) => setBandForm({ ...bandForm, employer_per_monday_amount: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="e.g., 23.40"
                    />
                  </div>
                </div>
              )}

              {bandForm.calculation_method === 'fixed' && (
                <div className="space-y-2">
                  <Label>Fixed Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={bandForm.fixed_amount || ''}
                    onChange={(e) => setBandForm({ ...bandForm, fixed_amount: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="Fixed deduction amount"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={bandForm.start_date}
                    onChange={(e) => setBandForm({ ...bandForm, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={bandForm.end_date || ''}
                    onChange={(e) => setBandForm({ ...bandForm, end_date: e.target.value || null })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Age</Label>
                  <Input
                    type="number"
                    value={bandForm.min_age ?? ''}
                    onChange={(e) => setBandForm({ ...bandForm, min_age: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="e.g., 16 (leave empty for no min)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Age</Label>
                  <Input
                    type="number"
                    value={bandForm.max_age ?? ''}
                    onChange={(e) => setBandForm({ ...bandForm, max_age: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="e.g., 60 (leave empty for no max)"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={bandForm.display_order}
                  onChange={(e) => setBandForm({ ...bandForm, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={bandForm.notes}
                  onChange={(e) => setBandForm({ ...bandForm, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={bandForm.is_active}
                  onCheckedChange={(checked) => setBandForm({ ...bandForm, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? 'Saving...' : editingBand ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
