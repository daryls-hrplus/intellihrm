import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, AlertTriangle, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface FlightRiskTabProps {
  companyId: string;
}

interface FlightRisk {
  id: string;
  employee_id: string;
  risk_level: string;
  risk_factors: string[];
  retention_actions: string | null;
  assessment_date: string;
  next_review_date: string | null;
  notes: string | null;
  employee?: { id: string; full_name: string };
}

interface Employee {
  id: string;
  full_name: string;
}

const RISK_FACTORS = [
  'Low engagement scores',
  'Recent negative feedback',
  'Passed over for promotion',
  'Compensation below market',
  'Limited growth opportunities',
  'Poor manager relationship',
  'Work-life balance issues',
  'Received external offer',
  'Tenure milestone approaching',
  'Key project ending'
];

export function FlightRiskTab({ companyId }: FlightRiskTabProps) {
  const [risks, setRisks] = useState<FlightRisk[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<FlightRisk | null>(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    risk_level: 'medium',
    risk_factors: [] as string[],
    retention_actions: '',
    assessment_date: format(new Date(), 'yyyy-MM-dd'),
    next_review_date: '',
    notes: ''
  });

  useEffect(() => {
    if (companyId) loadData();
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadRisks(), loadEmployees()]);
    setLoading(false);
  };

  const loadRisks = async () => {
    const { data } = await (supabase.from('flight_risk_assessments') as any)
      .select(`
        *,
        employee:profiles!flight_risk_assessments_employee_id_fkey(id, full_name)
      `)
      .eq('company_id', companyId)
      .eq('is_current', true)
      .order('risk_level', { ascending: false });
    
    setRisks((data || []).map((r: any) => ({
      ...r,
      risk_factors: r.risk_factors || []
    })));
  };

  const loadEmployees = async () => {
    const { data } = await (supabase.from('profiles') as any)
      .select('id, full_name')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('full_name');
    setEmployees(data || []);
  };

  const handleSubmit = async () => {
    if (!formData.employee_id) {
      toast.error('Please select an employee');
      return;
    }

    const payload = {
      ...formData,
      company_id: companyId,
      risk_factors: formData.risk_factors,
      retention_actions: formData.retention_actions || null,
      next_review_date: formData.next_review_date || null,
      notes: formData.notes || null,
      is_current: true
    };

    if (editingRisk) {
      const { error } = await (supabase.from('flight_risk_assessments') as any)
        .update(payload)
        .eq('id', editingRisk.id);
      if (error) toast.error('Failed to update');
      else toast.success('Updated');
    } else {
      // Mark previous assessment as not current
      await (supabase.from('flight_risk_assessments') as any)
        .update({ is_current: false })
        .eq('employee_id', formData.employee_id)
        .eq('is_current', true);

      const { error } = await (supabase.from('flight_risk_assessments') as any)
        .insert([payload]);
      if (error) toast.error('Failed to create');
      else toast.success('Created');
    }

    setDialogOpen(false);
    resetForm();
    loadRisks();
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      risk_level: 'medium',
      risk_factors: [],
      retention_actions: '',
      assessment_date: format(new Date(), 'yyyy-MM-dd'),
      next_review_date: '',
      notes: ''
    });
    setEditingRisk(null);
  };

  const openEdit = (risk: FlightRisk) => {
    setEditingRisk(risk);
    setFormData({
      employee_id: risk.employee_id,
      risk_level: risk.risk_level,
      risk_factors: risk.risk_factors || [],
      retention_actions: risk.retention_actions || '',
      assessment_date: risk.assessment_date,
      next_review_date: risk.next_review_date || '',
      notes: risk.notes || ''
    });
    setDialogOpen(true);
  };

  const toggleFactor = (factor: string) => {
    setFormData(prev => ({
      ...prev,
      risk_factors: prev.risk_factors.includes(factor)
        ? prev.risk_factors.filter(f => f !== factor)
        : [...prev.risk_factors, factor]
    }));
  };

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[level] || 'bg-muted text-muted-foreground';
  };

  const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedRisks = [...risks].sort((a, b) => 
    (riskOrder[a.risk_level as keyof typeof riskOrder] || 4) - (riskOrder[b.risk_level as keyof typeof riskOrder] || 4)
  );

  // Summary stats
  const stats = {
    critical: risks.filter(r => r.risk_level === 'critical').length,
    high: risks.filter(r => r.risk_level === 'high').length,
    medium: risks.filter(r => r.risk_level === 'medium').length,
    low: risks.filter(r => r.risk_level === 'low').length
  };

  if (loading) return <div className="flex items-center justify-center p-8">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
            <div className="text-sm text-muted-foreground">High</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
            <div className="text-sm text-muted-foreground">Medium</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.low}</div>
            <div className="text-sm text-muted-foreground">Low</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Flight Risk Assessments</h3>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Assessment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingRisk ? 'Edit' : 'New'} Flight Risk Assessment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <Label>Employee *</Label>
                <Select value={formData.employee_id} onValueChange={(v) => setFormData({...formData, employee_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Risk Level</Label>
                <Select value={formData.risk_level} onValueChange={(v) => setFormData({...formData, risk_level: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Risk Factors</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {RISK_FACTORS.map(factor => (
                    <Badge
                      key={factor}
                      variant={formData.risk_factors.includes(factor) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleFactor(factor)}
                    >
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Retention Actions</Label>
                <Textarea 
                  value={formData.retention_actions} 
                  onChange={(e) => setFormData({...formData, retention_actions: e.target.value})}
                  placeholder="What actions are being taken to retain this employee?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Assessment Date</Label>
                  <Input type="date" value={formData.assessment_date} onChange={(e) => setFormData({...formData, assessment_date: e.target.value})} />
                </div>
                <div>
                  <Label>Next Review</Label>
                  <Input type="date" value={formData.next_review_date} onChange={(e) => setFormData({...formData, next_review_date: e.target.value})} />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
              </div>
              <Button onClick={handleSubmit} className="w-full">{editingRisk ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Risk List */}
      {sortedRisks.length === 0 ? (
        <Card><CardContent className="p-6 text-center text-muted-foreground">No flight risk assessments yet</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Risk Factors</TableHead>
                <TableHead>Assessment Date</TableHead>
                <TableHead>Next Review</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRisks.map(risk => (
                <TableRow key={risk.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {risk.employee?.full_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRiskColor(risk.risk_level)}>
                      {risk.risk_level === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {risk.risk_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(risk.risk_factors || []).slice(0, 2).map((f, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                      ))}
                      {(risk.risk_factors || []).length > 2 && (
                        <Badge variant="outline" className="text-xs">+{risk.risk_factors.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{risk.assessment_date}</TableCell>
                  <TableCell>{risk.next_review_date || '-'}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(risk)}><Edit className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
