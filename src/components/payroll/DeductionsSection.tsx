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
import { Plus, MinusCircle, Trash2, Pencil, Building2 } from "lucide-react";
import { useCompanyCurrencyList } from "@/hooks/useCompanyCurrencies";

interface DeductionsSectionProps {
  companyId: string;
  employeeId: string;
  payPeriodId: string;
}

interface Deduction {
  id: string;
  deduction_name: string;
  deduction_code: string | null;
  deduction_type: string | null;
  amount: number;
  currency: string;
  is_pretax: boolean;
  notes: string | null;
  institution_name: string | null;
  account_number: string | null;
}

export function DeductionsSection({ companyId, employeeId, payPeriodId }: DeductionsSectionProps) {
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const { currencies } = useCompanyCurrencyList(companyId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    deduction_name: '',
    deduction_code: '',
    deduction_type: 'statutory',
    amount: '',
    currency: 'USD',
    is_pretax: false,
    notes: '',
    institution_name: '',
    account_number: ''
  });

  useEffect(() => {
    loadDeductions();
  }, [employeeId, payPeriodId]);

  const loadDeductions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('employee_period_deductions')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('pay_period_id', payPeriodId)
      .order('deduction_name');
    
    if (error) {
      toast.error("Failed to load deductions");
      setIsLoading(false);
      return;
    }
    setDeductions(data || []);
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      deduction_name: '',
      deduction_code: '',
      deduction_type: 'statutory',
      amount: '',
      currency: 'USD',
      is_pretax: false,
      notes: '',
      institution_name: '',
      account_number: ''
    });
    setEditingId(null);
  };

  const handleEdit = (deduction: Deduction) => {
    setFormData({
      deduction_name: deduction.deduction_name,
      deduction_code: deduction.deduction_code || '',
      deduction_type: deduction.deduction_type || 'statutory',
      amount: deduction.amount.toString(),
      currency: deduction.currency,
      is_pretax: deduction.is_pretax,
      notes: deduction.notes || '',
      institution_name: deduction.institution_name || '',
      account_number: deduction.account_number || ''
    });
    setEditingId(deduction.id);
    setIsDialogOpen(true);
  };

  const checkDuplicateDeduction = () => {
    // Check if deduction with same name already exists
    const existingDeduction = deductions.find(d => {
      // Skip current record if editing
      if (editingId && d.id === editingId) return false;
      
      // Check if same deduction name
      if (d.deduction_name.toLowerCase() !== formData.deduction_name.toLowerCase()) return false;
      
      // If institution and account are provided, check if they're different
      const newInstitution = formData.institution_name.trim().toLowerCase();
      const newAccount = formData.account_number.trim();
      const existingInstitution = (d.institution_name || '').trim().toLowerCase();
      const existingAccount = (d.account_number || '').trim();
      
      // If both have institution/account info, allow if different
      if (newInstitution && newAccount && existingInstitution && existingAccount) {
        return newInstitution === existingInstitution && newAccount === existingAccount;
      }
      
      // If new entry has no institution/account but existing one does, it's a duplicate
      // If new entry has institution/account but existing one doesn't, it's a duplicate
      // Same deduction name without different institution/account is a duplicate
      return true;
    });
    
    return existingDeduction;
  };

  const handleSave = async () => {
    if (!formData.deduction_name || !formData.amount) {
      toast.error("Please fill in required fields");
      return;
    }

    // Check for duplicate deduction
    const duplicate = checkDuplicateDeduction();
    if (duplicate) {
      toast.error(
        "This deduction already exists for this pay period. To add the same deduction again, please specify a different institution and account number."
      );
      return;
    }

    const payload = {
      company_id: companyId,
      employee_id: employeeId,
      pay_period_id: payPeriodId,
      deduction_name: formData.deduction_name,
      deduction_code: formData.deduction_code || null,
      deduction_type: formData.deduction_type,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      is_pretax: formData.is_pretax,
      notes: formData.notes || null,
      institution_name: formData.institution_name || null,
      account_number: formData.account_number || null
    };

    let error;
    if (editingId) {
      ({ error } = await supabase
        .from('employee_period_deductions')
        .update(payload)
        .eq('id', editingId));
    } else {
      ({ error } = await supabase
        .from('employee_period_deductions')
        .insert(payload));
    }

    if (error) {
      toast.error("Failed to save deduction");
      return;
    }

    toast.success(editingId ? "Deduction updated" : "Deduction added");
    setIsDialogOpen(false);
    resetForm();
    loadDeductions();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('employee_period_deductions')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete deduction");
      return;
    }

    toast.success("Deduction deleted");
    loadDeductions();
  };

  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const totalPretax = deductions.filter(d => d.is_pretax).reduce((sum, d) => sum + d.amount, 0);
  const totalPosttax = deductions.filter(d => !d.is_pretax).reduce((sum, d) => sum + d.amount, 0);

  const getDeductionTypeBadge = (type: string | null) => {
    const variants: Record<string, string> = {
      'statutory': 'bg-blue-100 text-blue-800',
      'voluntary': 'bg-green-100 text-green-800',
      'loan': 'bg-yellow-100 text-yellow-800',
      'garnishment': 'bg-red-100 text-red-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return variants[type || 'other'] || variants['other'];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <MinusCircle className="h-5 w-5" />
            Employee Deductions
          </CardTitle>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <span>Total: ${totalDeductions.toFixed(2)}</span>
            <span>Pre-tax: ${totalPretax.toFixed(2)}</span>
            <span>Post-tax: ${totalPosttax.toFixed(2)}</span>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Deduction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Deduction' : 'Add Deduction'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Deduction Name *</Label>
                  <Input
                    value={formData.deduction_name}
                    onChange={(e) => setFormData({ ...formData, deduction_name: e.target.value })}
                    placeholder="e.g., Health Insurance"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input
                    value={formData.deduction_code}
                    onChange={(e) => setFormData({ ...formData, deduction_code: e.target.value })}
                    placeholder="e.g., HEALTH"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Deduction Type</Label>
                <Select 
                  value={formData.deduction_type} 
                  onValueChange={(v) => setFormData({ ...formData, deduction_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="statutory">Statutory</SelectItem>
                    <SelectItem value="voluntary">Voluntary</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                    <SelectItem value="garnishment">Garnishment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
                      {currencies.length > 0 ? (
                        currencies.map(cur => (
                          <SelectItem key={cur.id} value={cur.code}>{cur.code} - {cur.name}</SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="TTD">TTD</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Institution and Account fields */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Institution Details (required for duplicate deductions)</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Institution Name</Label>
                    <Input
                      value={formData.institution_name}
                      onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                      placeholder="e.g., First National Bank"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      value={formData.account_number}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      placeholder="e.g., 1234567890"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox 
                  id="pretax"
                  checked={formData.is_pretax}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_pretax: !!checked })}
                />
                <Label htmlFor="pretax">Pre-tax Deduction</Label>
              </div>
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
        ) : deductions.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No deductions for this period</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Institution / Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Pre-tax</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deductions.map((deduction) => (
                <TableRow key={deduction.id}>
                  <TableCell className="font-medium">{deduction.deduction_name}</TableCell>
                  <TableCell>{deduction.deduction_code || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getDeductionTypeBadge(deduction.deduction_type)}>
                      {deduction.deduction_type || 'other'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {deduction.institution_name || deduction.account_number ? (
                      <div className="text-sm">
                        {deduction.institution_name && (
                          <div className="font-medium">{deduction.institution_name}</div>
                        )}
                        {deduction.account_number && (
                          <div className="text-muted-foreground">Acct: {deduction.account_number}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {deduction.currency} {deduction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={deduction.is_pretax ? "default" : "secondary"}>
                      {deduction.is_pretax ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {deduction.notes || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(deduction)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(deduction.id)}>
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
