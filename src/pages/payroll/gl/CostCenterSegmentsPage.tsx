import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PayrollFilters, usePayrollFilters } from '@/components/payroll/PayrollFilters';

const PREDEFINED_SEGMENTS = [
  { code: 'COMPANY', name: 'Company', defaultLength: 4 },
  { code: 'DIVISION', name: 'Division', defaultLength: 4 },
  { code: 'DEPT', name: 'Department', defaultLength: 6 },
  { code: 'SECTION', name: 'Section', defaultLength: 4 },
  { code: 'ACCOUNT', name: 'Account', defaultLength: 8 },
  { code: 'SUBACCT', name: 'Sub-Account', defaultLength: 6 },
  { code: 'JOB', name: 'Job', defaultLength: 6 },
  { code: 'LOCATION', name: 'Location', defaultLength: 6 },
  { code: 'EMPLOYEE', name: 'Employee', defaultLength: 8 },
  { code: 'USERDEF', name: 'User Defined', defaultLength: 8 }
];

const ENTITY_MAPPINGS = [
  { value: '', label: 'None (Manual Entry)' },
  { value: 'company', label: 'Company' },
  { value: 'division', label: 'Division' },
  { value: 'department', label: 'Department' },
  { value: 'section', label: 'Section' },
  { value: 'pay_element', label: 'Pay Element' },
  { value: 'job', label: 'Job' },
  { value: 'location', label: 'Location' },
  { value: 'employee', label: 'Employee' },
];

const MAX_SEGMENTS = 10;
const MAX_TOTAL_LENGTH = 60;

interface Segment {
  id: string;
  company_id: string;
  segment_name: string;
  segment_code: string;
  segment_order: number;
  segment_length: number;
  delimiter: string | null;
  default_value: string | null;
  maps_to: string | null;
  description: string | null;
  is_required: boolean;
  is_active: boolean;
}

interface SegmentValue {
  id: string;
  segment_id: string;
  segment_value: string;
  segment_description: string | null;
  is_active: boolean;
}

const CostCenterSegmentsPage = () => {
  const { t } = useTranslation();
  const { selectedCompanyId, setSelectedCompanyId } = usePayrollFilters();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [segmentValues, setSegmentValues] = useState<Record<string, SegmentValue[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedSegments, setExpandedSegments] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [valueDialogOpen, setValueDialogOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [editingValue, setEditingValue] = useState<SegmentValue | null>(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    segment_name: '',
    segment_code: '',
    segment_order: 1,
    segment_length: 4,
    delimiter: '-',
    default_value: '0000',
    maps_to: '',
    description: '',
    is_required: true
  });

  const [valueFormData, setValueFormData] = useState({
    segment_value: '',
    segment_description: ''
  });

  // Calculate total length of all segments
  const totalLength = segments.reduce((sum, seg) => sum + seg.segment_length, 0);

  // Get available segment types (not already used)
  const getAvailableSegmentTypes = () => {
    const usedCodes = segments.filter(s => editingSegment ? s.id !== editingSegment.id : true).map(s => s.segment_code);
    return PREDEFINED_SEGMENTS.filter(seg => !usedCodes.includes(seg.code));
  };

  // Handle segment type selection
  const handleSegmentTypeChange = (code: string) => {
    const segmentType = PREDEFINED_SEGMENTS.find(s => s.code === code);
    if (segmentType) {
      const defaultVal = '0'.repeat(segmentType.defaultLength);
      setFormData(prev => ({
        ...prev,
        segment_name: segmentType.name,
        segment_code: segmentType.code,
        segment_length: segmentType.defaultLength,
        default_value: defaultVal
      }));
    }
  };

  // Generate default value based on length
  const generateDefaultValue = (length: number) => '0'.repeat(length);

  useEffect(() => {
    if (selectedCompanyId) {
      loadSegments();
    }
  }, [selectedCompanyId]);

  const loadSegments = async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gl_cost_center_segments')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .order('segment_order');

      if (error) throw error;
      setSegments(data || []);

      for (const segment of data || []) {
        await loadSegmentValues(segment.id);
      }
    } catch (error) {
      console.error('Error loading segments:', error);
      toast.error(t('common.error', 'Error loading data'));
    } finally {
      setLoading(false);
    }
  };

  const loadSegmentValues = async (segmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('gl_cost_center_segment_values')
        .select('*')
        .eq('segment_id', segmentId)
        .order('segment_value');

      if (error) throw error;
      setSegmentValues(prev => ({ ...prev, [segmentId]: data || [] }));
    } catch (error) {
      console.error('Error loading segment values:', error);
    }
  };

  const handleSaveSegment = async () => {
    if (!selectedCompanyId) return;
    try {
      const payload = {
        company_id: selectedCompanyId,
        segment_name: formData.segment_name,
        segment_code: formData.segment_code,
        segment_order: formData.segment_order,
        segment_length: formData.segment_length,
        delimiter: formData.delimiter || '-',
        default_value: formData.default_value || generateDefaultValue(formData.segment_length),
        maps_to: formData.maps_to || null,
        description: formData.description || null,
        is_required: formData.is_required
      };

      if (editingSegment) {
        const { error } = await supabase
          .from('gl_cost_center_segments')
          .update(payload)
          .eq('id', editingSegment.id);
        if (error) throw error;
        toast.success(t('common.updated', 'Segment updated'));
      } else {
        const { error } = await supabase
          .from('gl_cost_center_segments')
          .insert(payload);
        if (error) throw error;
        toast.success(t('common.created', 'Segment created'));
      }

      setDialogOpen(false);
      resetSegmentForm();
      loadSegments();
    } catch (error: any) {
      toast.error(error.message || t('common.error', 'Error saving'));
    }
  };

  const handleSaveValue = async () => {
    if (!selectedSegmentId) return;
    try {
      const payload = {
        segment_id: selectedSegmentId,
        segment_value: valueFormData.segment_value,
        segment_description: valueFormData.segment_description || null
      };

      if (editingValue) {
        const { error } = await supabase
          .from('gl_cost_center_segment_values')
          .update(payload)
          .eq('id', editingValue.id);
        if (error) throw error;
        toast.success(t('common.updated', 'Value updated'));
      } else {
        const { error } = await supabase
          .from('gl_cost_center_segment_values')
          .insert(payload);
        if (error) throw error;
        toast.success(t('common.created', 'Value created'));
      }

      setValueDialogOpen(false);
      resetValueForm();
      loadSegmentValues(selectedSegmentId);
    } catch (error: any) {
      toast.error(error.message || t('common.error', 'Error saving'));
    }
  };

  const handleDeleteSegment = async (id: string) => {
    if (!confirm(t('common.confirmDelete', 'Are you sure?'))) return;
    try {
      const { error } = await supabase.from('gl_cost_center_segments').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('common.deleted', 'Segment deleted'));
      loadSegments();
    } catch (error: any) {
      toast.error(error.message || t('common.error', 'Error deleting'));
    }
  };

  const handleDeleteValue = async (id: string, segmentId: string) => {
    if (!confirm(t('common.confirmDelete', 'Are you sure?'))) return;
    try {
      const { error } = await supabase.from('gl_cost_center_segment_values').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('common.deleted', 'Value deleted'));
      loadSegmentValues(segmentId);
    } catch (error: any) {
      toast.error(error.message || t('common.error', 'Error deleting'));
    }
  };

  const openEditSegment = (segment: Segment) => {
    setEditingSegment(segment);
    setFormData({
      segment_name: segment.segment_name,
      segment_code: segment.segment_code,
      segment_order: segment.segment_order,
      segment_length: segment.segment_length,
      delimiter: segment.delimiter || '-',
      default_value: segment.default_value || generateDefaultValue(segment.segment_length),
      maps_to: segment.maps_to || '',
      description: segment.description || '',
      is_required: segment.is_required
    });
    setDialogOpen(true);
  };

  const openAddValue = (segmentId: string) => {
    setSelectedSegmentId(segmentId);
    setEditingValue(null);
    setValueFormData({ segment_value: '', segment_description: '' });
    setValueDialogOpen(true);
  };

  const openEditValue = (value: SegmentValue) => {
    setSelectedSegmentId(value.segment_id);
    setEditingValue(value);
    setValueFormData({
      segment_value: value.segment_value,
      segment_description: value.segment_description || ''
    });
    setValueDialogOpen(true);
  };

  const resetSegmentForm = () => {
    setEditingSegment(null);
    setFormData({
      segment_name: '',
      segment_code: '',
      segment_order: segments.length + 1,
      segment_length: 4,
      delimiter: '-',
      default_value: '0000',
      maps_to: '',
      description: '',
      is_required: true
    });
  };

  const resetValueForm = () => {
    setEditingValue(null);
    setValueFormData({ segment_value: '', segment_description: '' });
  };

  const toggleExpand = (id: string) => {
    setExpandedSegments(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

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
            { label: t('payroll.gl.costCenterSegments', 'Cost Center Segments') }
          ]}
        />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t('payroll.gl.costCenterSegments', 'Cost Center Segments')}</h1>
            <p className="text-muted-foreground">{t('payroll.gl.costCenterSegmentsDesc', 'Define cost center structure and segments')}</p>
          </div>
          <Button 
            onClick={() => { resetSegmentForm(); setDialogOpen(true); }}
            disabled={segments.length >= MAX_SEGMENTS}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('common.addSegment', 'Add Segment')}
          </Button>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{t('payroll.gl.segmentsUsed', 'Segments Used')}</div>
                <div className={`text-lg font-semibold ${segments.length >= MAX_SEGMENTS ? 'text-destructive' : ''}`}>
                  {segments.length} / {MAX_SEGMENTS}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{t('payroll.gl.totalLength', 'Total Length')}</div>
                <div className={`text-lg font-semibold ${totalLength > MAX_TOTAL_LENGTH ? 'text-destructive' : ''}`}>
                  {totalLength} / {MAX_TOTAL_LENGTH} {t('payroll.gl.characters', 'chars')}
                </div>
              </div>
              {totalLength > MAX_TOTAL_LENGTH && (
                <div className="flex items-center gap-1 text-destructive text-sm mt-1">
                  <AlertCircle className="h-4 w-4" />
                  {t('payroll.gl.lengthExceeded', 'Total length exceeds maximum')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <PayrollFilters
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
              showPayGroupFilter={false}
            />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">{t('common.loading', 'Loading...')}</div>
            ) : segments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t('common.noData', 'No segments defined')}</div>
            ) : (
              <div className="space-y-2">
                {segments.map((segment) => (
                  <Collapsible
                    key={segment.id}
                    open={expandedSegments.includes(segment.id)}
                    onOpenChange={() => toggleExpand(segment.id)}
                  >
                    <div className="border rounded-lg">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                          <div className="flex items-center gap-4">
                            {expandedSegments.includes(segment.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <div>
                              <div className="font-medium">
                                {segment.segment_order}. {segment.segment_name}
                                <span className="ml-2 text-sm text-muted-foreground font-mono">({segment.segment_code})</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {t('payroll.gl.length', 'Length')}: {segment.segment_length}
                                <span className="mx-2">|</span>
                                {t('payroll.gl.delimiter', 'Delimiter')}: <span className="font-mono">{segment.delimiter || '-'}</span>
                                <span className="mx-2">|</span>
                                {t('payroll.gl.defaultValue', 'Default')}: <span className="font-mono">{segment.default_value || '0'.repeat(segment.segment_length)}</span>
                                {segment.maps_to && (
                                  <>
                                    <span className="mx-2">|</span>
                                    {t('payroll.gl.mapsTo', 'Maps to')}: <Badge variant="outline" className="ml-1">{ENTITY_MAPPINGS.find(e => e.value === segment.maps_to)?.label || segment.maps_to}</Badge>
                                  </>
                                )}
                                {segment.is_required && (
                                  <Badge variant="secondary" className="ml-2">{t('common.required', 'Required')}</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" onClick={() => openAddValue(segment.id)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEditSegment(segment)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSegment(segment.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-t p-4 bg-muted/20">
                          <h4 className="text-sm font-medium mb-2">{t('payroll.gl.segmentValues', 'Segment Values')}</h4>
                          {(segmentValues[segment.id] || []).length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t('common.noValues', 'No values defined')}</p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t('common.value', 'Value')}</TableHead>
                                  <TableHead>{t('common.description', 'Description')}</TableHead>
                                  <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(segmentValues[segment.id] || []).map((value) => (
                                  <TableRow key={value.id}>
                                    <TableCell className="font-mono">{value.segment_value}</TableCell>
                                    <TableCell>{value.segment_description}</TableCell>
                                    <TableCell className="text-right">
                                      <Button variant="ghost" size="sm" onClick={() => openEditValue(value)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => handleDeleteValue(value.id, segment.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Segment Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSegment ? t('common.edit', 'Edit Segment') : t('common.add', 'Add Segment')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>{t('payroll.gl.segmentType', 'Segment Type')}</Label>
                <Select
                  value={formData.segment_code || 'placeholder'}
                  onValueChange={(value) => value !== 'placeholder' && handleSegmentTypeChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('payroll.gl.selectSegmentType', 'Select segment type')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(editingSegment ? PREDEFINED_SEGMENTS : getAvailableSegmentTypes()).map((seg) => (
                      <SelectItem key={seg.code} value={seg.code}>
                        {seg.name} ({seg.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('payroll.gl.order', 'Order')}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.segment_order}
                    onChange={(e) => setFormData({ ...formData, segment_order: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('payroll.gl.length', 'Length')}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.segment_length}
                    onChange={(e) => {
                      const newLength = parseInt(e.target.value) || 4;
                      setFormData({ 
                        ...formData, 
                        segment_length: newLength,
                        default_value: generateDefaultValue(newLength)
                      });
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('payroll.gl.delimiter', 'Delimiter')}</Label>
                  <Select
                    value={formData.delimiter}
                    onValueChange={(value) => setFormData({ ...formData, delimiter: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">- (Dash)</SelectItem>
                      <SelectItem value=".">. (Dot)</SelectItem>
                      <SelectItem value="/">/  (Slash)</SelectItem>
                      <SelectItem value="_">_ (Underscore)</SelectItem>
                      <SelectItem value=" ">  (Space)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('payroll.gl.defaultValue', 'Default Value')}</Label>
                  <Input
                    value={formData.default_value}
                    onChange={(e) => setFormData({ ...formData, default_value: e.target.value })}
                    maxLength={formData.segment_length}
                    placeholder={generateDefaultValue(formData.segment_length)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('payroll.gl.defaultValueHint', 'Must match segment length')} ({formData.segment_length} {t('payroll.gl.characters', 'chars')})
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('payroll.gl.mapsTo', 'Maps To Entity')}</Label>
                <Select
                  value={formData.maps_to || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, maps_to: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('payroll.gl.selectMapping', 'Select entity mapping')} />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTITY_MAPPINGS.map((mapping) => (
                      <SelectItem key={mapping.value || 'none'} value={mapping.value || 'none'}>
                        {mapping.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('payroll.gl.mapsToHint', 'Automatically populate segment from selected entity')}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t('common.description', 'Description')}</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_required"
                  checked={formData.is_required}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_required: !!checked })}
                />
                <Label htmlFor="is_required">{t('common.required', 'Required')}</Label>
              </div>
              {(() => {
                const currentEditingLength = editingSegment?.segment_length || 0;
                const newTotalLength = totalLength - currentEditingLength + formData.segment_length;
                return newTotalLength > MAX_TOTAL_LENGTH ? (
                  <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {t('payroll.gl.lengthWouldExceed', 'Total length would be')} {newTotalLength} ({t('payroll.gl.maxIs', 'max is')} {MAX_TOTAL_LENGTH})
                  </div>
                ) : null;
              })()}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
              <Button 
                onClick={handleSaveSegment}
                disabled={!formData.segment_code || (totalLength - (editingSegment?.segment_length || 0) + formData.segment_length > MAX_TOTAL_LENGTH)}
              >
                {t('common.save', 'Save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Value Dialog */}
        <Dialog open={valueDialogOpen} onOpenChange={setValueDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingValue ? t('common.edit', 'Edit Value') : t('common.add', 'Add Value')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>{t('common.value', 'Value')}</Label>
                <Input
                  value={valueFormData.segment_value}
                  onChange={(e) => setValueFormData({ ...valueFormData, segment_value: e.target.value })}
                  placeholder="e.g., 1000"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('common.description', 'Description')}</Label>
                <Input
                  value={valueFormData.segment_description}
                  onChange={(e) => setValueFormData({ ...valueFormData, segment_description: e.target.value })}
                  placeholder="e.g., Finance Department"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setValueDialogOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
              <Button onClick={handleSaveValue}>{t('common.save', 'Save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default CostCenterSegmentsPage;
