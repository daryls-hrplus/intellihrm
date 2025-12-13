import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, DollarSign, Trash2, Pencil } from "lucide-react";

interface AllowancesSectionProps {
  companyId: string;
  employeeId: string;
  payPeriodId: string;
}

interface Allowance {
  id: string;
  allowance_name: string;
  allowance_code: string | null;
  amount: number;
  currency: string;
  is_benefit_in_kind: boolean;
  is_taxable: boolean;
  tax_rate: number | null;
  notes: string | null;
}

export function AllowancesSection({ companyId, employeeId, payPeriodId }: AllowancesSectionProps) {
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    allowance_name: '',
    allowance_code: '',
    amount: '',
    currency: 'USD',
    is_benefit_in_kind: false,
    is_taxable: true,
    tax_rate: '',
    notes: ''
  });

  useEffect(() => {
    loadAllowances();
  }, [employeeId, payPeriodId]);

  const loadAllowances = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('employee_period_allowances')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('pay_period_id', payPeriodId)
      .order('allowance_name');
    
    if (error) {
      toast.error("Failed to load allowances");
      setIsLoading(false);
      return;
    }
    setAllowances(data || []);
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      allowance_name: '',
      allowance_code: '',
      amount: '',
      currency: 'USD',
      is_benefit_in_kind: false,
      is_taxable: true,
      tax_rate: '',
      notes: ''
    });
    setEditingId(null);
  };

  const handleEdit = (allowance: Allowance) => {
    setFormData({
      allowance_name: allowance.allowance_name,
      allowance_code: allowance.allowance_code || '',
      amount: allowance.amount.toString(),
      currency: allowance.currency,
      is_benefit_in_kind: allowance.is_benefit_in_kind,
      is_taxable: allowance.is_taxable,
      tax_rate: allowance.tax_rate?.toString() || '',
      notes: allowance.notes || ''
    });
    setEditingId(allowance.id);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.allowance_name || !formData.amount) {
      toast.error("Please fill in required fields");
      return;
    }

    const payload = {
      company_id: companyId,
      employee_id: employeeId,
      pay_period_id: payPeriodId,
      allowance_name: formData.allowance_name,
      allowance_code: formData.allowance_code || null,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      is_benefit_in_kind: formData.is_benefit_in_kind,
      is_taxable: formData.is_taxable,
      tax_rate: formData.tax_rate ? parseFloat(formData.tax_rate) : null,
      notes: formData.notes || null
    };

    let error;
    if (editingId) {
      ({ error } = await supabase
        .from('employee_period_allowances')
        .update(payload)
        .eq('id', editingId));
    } else {
      ({ error } = await supabase
        .from('employee_period_allowances')
        .insert(payload));
    }

    if (error) {
      toast.error("Failed to save allowance");
      return;
    }

    toast.success(editingId ? "Allowance updated" : "Allowance added");
    setIsDialogOpen(false);
    resetForm();
    loadAllowances();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('employee_period_allowances')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete allowance");
      return;
    }

    toast.success("Allowance deleted");
    loadAllowances();
  };

  const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
  const totalTaxable = allowances.filter(a => a.is_taxable).reduce((sum, a) => sum + a.amount, 0);
  const totalBIK = allowances.filter(a => a.is_benefit_in_kind).reduce((sum, a) => sum + a.amount, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Allowances & Other Income
          </CardTitle>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <span>Total: ${totalAllowances.toFixed(2)}</span>
            <span>Taxable: ${totalTaxable.toFixed(2)}</span>
            <span>BIK: ${totalBIK.toFixed(2)}</span>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Allowance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Allowance' : 'Add Allowance'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Allowance Name *</Label>
                  <Input
                    value={formData.allowance_name}
                    onChange={(e) => setFormData({ ...formData, allowance_name: e.target.value })}
                    placeholder="e.g., Housing Allowance"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input
                    value={formData.allowance_code}
                    onChange={(e) => setFormData({ ...formData, allowance_code: e.target.value })}
                    placeholder="e.g., HOUSING"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(v) => setFormData({ ...formData, currency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="bik"
                    checked={formData.is_benefit_in_kind}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_benefit_in_kind: !!checked })}
                  />
                  <Label htmlFor="bik">Benefit in Kind</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="taxable"
                    checked={formData.is_taxable}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_taxable: !!checked })}
                  />
                  <Label htmlFor="taxable">Taxable</Label>
                </div>
              </div>
              {formData.is_taxable && (
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                    placeholder="e.g., 25"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleSave}>{editingId ? 'Update' : 'Add'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-4">Loading...</p>
        ) : allowances.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No allowances for this period</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>BIK</TableHead>
                <TableHead>Taxable</TableHead>
                <TableHead>Tax Rate</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allowances.map((allowance) => (
                <TableRow key={allowance.id}>
                  <TableCell className="font-medium">{allowance.allowance_name}</TableCell>
                  <TableCell>{allowance.allowance_code || '-'}</TableCell>
                  <TableCell className="text-right">
                    {allowance.currency} {allowance.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {allowance.is_benefit_in_kind ? (
                      <Badge className="bg-purple-100 text-purple-800">BIK</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={allowance.is_taxable ? "default" : "secondary"}>
                      {allowance.is_taxable ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {allowance.tax_rate ? `${allowance.tax_rate}%` : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {allowance.notes || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(allowance)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(allowance.id)}>
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
  );
}
