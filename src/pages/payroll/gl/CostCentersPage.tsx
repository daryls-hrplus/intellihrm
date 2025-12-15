import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PayrollFilters, usePayrollFilters } from '@/components/payroll/PayrollFilters';

interface CostCenter {
  id: string;
  company_id: string;
  cost_center_code: string;
  cost_center_name: string;
  segment_values: Record<string, string> | null;
  description: string | null;
  department_id: string | null;
  is_active: boolean;
}

const parseCostCenters = (data: any[]): CostCenter[] => {
  return data.map(item => ({
    ...item,
    segment_values: typeof item.segment_values === 'object' ? item.segment_values : null
  }));
};


interface Segment {
  id: string;
  segment_name: string;
  segment_code: string;
  segment_order: number;
  is_required: boolean;
}

interface SegmentValue {
  id: string;
  segment_id: string;
  segment_value: string;
  segment_description: string | null;
}

const CostCentersPage = () => {
  const { t } = useTranslation();
  const { selectedCompanyId, setSelectedCompanyId } = usePayrollFilters();
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [segmentValues, setSegmentValues] = useState<Record<string, SegmentValue[]>>({});
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCC, setEditingCC] = useState<CostCenter | null>(null);

  const [formData, setFormData] = useState({
    cost_center_code: '',
    cost_center_name: '',
    description: '',
    department_id: '',
    segment_values: {} as Record<string, string>
  });

  useEffect(() => {
    if (selectedCompanyId) {
      loadData();
    }
  }, [selectedCompanyId]);

  const loadData = async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    try {
      const { data: ccData, error: ccError } = await supabase
        .from('gl_cost_centers')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .order('cost_center_code');
      if (ccError) throw ccError;
      setCostCenters(parseCostCenters(ccData || []));

      const { data: segData, error: segError } = await supabase
        .from('gl_cost_center_segments')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .eq('is_active', true)
        .order('segment_order');
      if (segError) throw segError;
      setSegments(segData || []);

      const valuesMap: Record<string, SegmentValue[]> = {};
      for (const seg of segData || []) {
        const { data: valData } = await supabase
          .from('gl_cost_center_segment_values')
          .select('*')
          .eq('segment_id', seg.id)
          .eq('is_active', true)
          .order('segment_value');
        valuesMap[seg.id] = valData || [];
      }
      setSegmentValues(valuesMap);

      const { data: deptData } = await supabase
        .from('departments')
        .select('id, name')
        .eq('company_id', selectedCompanyId)
        .eq('is_active', true)
        .order('name');
      setDepartments(deptData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t('common.error', 'Error loading data'));
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const parts = segments.map(seg => formData.segment_values[seg.id] || '').filter(Boolean);
    return parts.join('-');
  };

  const handleSave = async () => {
    if (!selectedCompanyId) return;
    try {
      const code = formData.cost_center_code || generateCode();
      const payload = {
        company_id: selectedCompanyId,
        cost_center_code: code,
        cost_center_name: formData.cost_center_name,
        description: formData.description || null,
        department_id: formData.department_id || null,
        segment_values: formData.segment_values
      };

      if (editingCC) {
        const { error } = await supabase
          .from('gl_cost_centers')
          .update(payload)
          .eq('id', editingCC.id);
        if (error) throw error;
        toast.success(t('common.updated', 'Cost center updated'));
      } else {
        const { error } = await supabase
          .from('gl_cost_centers')
          .insert(payload);
        if (error) throw error;
        toast.success(t('common.created', 'Cost center created'));
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || t('common.error', 'Error saving'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete', 'Are you sure?'))) return;
    try {
      const { error } = await supabase.from('gl_cost_centers').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('common.deleted', 'Cost center deleted'));
      loadData();
    } catch (error: any) {
      toast.error(error.message || t('common.error', 'Error deleting'));
    }
  };

  const openEdit = (cc: CostCenter) => {
    setEditingCC(cc);
    setFormData({
      cost_center_code: cc.cost_center_code,
      cost_center_name: cc.cost_center_name,
      description: cc.description || '',
      department_id: cc.department_id || '',
      segment_values: cc.segment_values || {}
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCC(null);
    setFormData({
      cost_center_code: '',
      cost_center_name: '',
      description: '',
      department_id: '',
      segment_values: {}
    });
  };

  const filteredCCs = costCenters.filter(cc =>
    cc.cost_center_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cc.cost_center_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!selectedCompanyId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t('common.selectCompany', 'Please select a company')}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t('payroll.title', 'Payroll'), href: '/payroll' },
            { label: t('payroll.gl.title', 'GL Interface'), href: '/payroll/gl' },
            { label: t('payroll.gl.costCenters', 'Cost Centers') }
          ]}
        />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t('payroll.gl.costCenters', 'Cost Centers')}</h1>
            <p className="text-muted-foreground">{t('payroll.gl.costCentersDesc', 'Manage cost centers with flexible segment values')}</p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            {t('common.add', 'Add Cost Center')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex gap-4 items-center">
              <PayrollFilters
                selectedCompanyId={selectedCompanyId}
                onCompanyChange={setSelectedCompanyId}
                showPayGroupFilter={false}
              />
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('common.search', 'Search...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.code', 'Code')}</TableHead>
                  <TableHead>{t('common.name', 'Name')}</TableHead>
                  {segments.map(seg => (
                    <TableHead key={seg.id}>{seg.segment_name}</TableHead>
                  ))}
                  <TableHead>{t('common.status', 'Status')}</TableHead>
                  <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4 + segments.length} className="text-center py-8">
                      {t('common.loading', 'Loading...')}
                    </TableCell>
                  </TableRow>
                ) : filteredCCs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4 + segments.length} className="text-center py-8 text-muted-foreground">
                      {t('common.noData', 'No cost centers found')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCCs.map((cc) => (
                    <TableRow key={cc.id}>
                      <TableCell className="font-mono">{cc.cost_center_code}</TableCell>
                      <TableCell>{cc.cost_center_name}</TableCell>
                      {segments.map(seg => (
                        <TableCell key={seg.id} className="font-mono">
                          {cc.segment_values?.[seg.id] || '-'}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Badge variant={cc.is_active ? 'default' : 'secondary'}>
                          {cc.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(cc)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(cc.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCC ? t('common.edit', 'Edit Cost Center') : t('common.add', 'Add Cost Center')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('common.code', 'Cost Center Code')}</Label>
                  <Input
                    value={formData.cost_center_code || generateCode()}
                    onChange={(e) => setFormData({ ...formData, cost_center_code: e.target.value })}
                    placeholder="Auto-generated from segments"
                  />
                  <p className="text-xs text-muted-foreground">{t('payroll.gl.autoGenerated', 'Leave empty to auto-generate from segments')}</p>
                </div>
                <div className="space-y-2">
                  <Label>{t('common.name', 'Name')}</Label>
                  <Input
                    value={formData.cost_center_name}
                    onChange={(e) => setFormData({ ...formData, cost_center_name: e.target.value })}
                    placeholder="e.g., Finance - Head Office"
                  />
                </div>
              </div>

              {segments.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-base font-medium">{t('payroll.gl.segmentValues', 'Segment Values')}</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {segments.map(seg => (
                      <div key={seg.id} className="space-y-2">
                        <Label>
                          {seg.segment_name}
                          {seg.is_required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Select
                          value={formData.segment_values[seg.id] || ''}
                          onValueChange={(v) => setFormData({
                            ...formData,
                            segment_values: { ...formData.segment_values, [seg.id]: v }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('common.select', 'Select...')} />
                          </SelectTrigger>
                          <SelectContent>
                            {(segmentValues[seg.id] || []).map(val => (
                              <SelectItem key={val.id} value={val.segment_value}>
                                {val.segment_value} - {val.segment_description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t('common.department', 'Department')}</Label>
                <Select
                  value={formData.department_id || "none"}
                  onValueChange={(v) => setFormData({ ...formData, department_id: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.none', 'None')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('common.none', 'None')}</SelectItem>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('common.description', 'Description')}</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
              <Button onClick={handleSave}>{t('common.save', 'Save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default CostCentersPage;
