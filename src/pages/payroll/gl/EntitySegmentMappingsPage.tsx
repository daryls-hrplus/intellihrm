import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePageAudit } from '@/hooks/usePageAudit';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PayrollFilters, usePayrollFilters } from '@/components/payroll/PayrollFilters';

const ENTITY_TYPES = [
  { value: 'company', label: 'Company', table: 'companies', codeField: 'code', nameField: 'name', segmentCode: 'COMPANY' },
  { value: 'division', label: 'Division', table: 'divisions', codeField: 'code', nameField: 'name', segmentCode: 'DIVISION' },
  { value: 'department', label: 'Department', table: 'departments', codeField: 'code', nameField: 'name', segmentCode: 'DEPARTMENT' },
  { value: 'section', label: 'Section', table: 'sections', codeField: 'code', nameField: 'name', segmentCode: 'SECTION' },
  { value: 'pay_element', label: 'Pay Element', table: 'pay_elements', codeField: 'code', nameField: 'name', segmentCode: 'ACCOUNT' },
  { value: 'job', label: 'Job', table: 'jobs', codeField: 'code', nameField: 'name', segmentCode: 'JOB' },
  { value: 'location', label: 'Location', table: 'company_locations', codeField: 'code', nameField: 'name', segmentCode: 'LOCATION' },
  { value: 'employee', label: 'Employee', table: 'profiles', codeField: 'employee_number', nameField: 'full_name', segmentCode: 'EMPLOYEE' },
];

interface Segment {
  id: string;
  segment_name: string;
  segment_code: string;
  segment_length: number;
}

interface EntityMapping {
  id: string;
  company_id: string;
  segment_id: string;
  entity_type: string;
  entity_id: string;
  segment_value: string;
  description: string | null;
  is_active: boolean;
  entity_name?: string;
  entity_code?: string;
}

interface EntityOption {
  id: string;
  code: string;
  name: string;
}

const EntitySegmentMappingsPage = () => {
  const { t } = useTranslation();
  usePageAudit('entity_segment_mappings', 'Payroll');
  const { selectedCompanyId, setSelectedCompanyId } = usePayrollFilters();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [mappings, setMappings] = useState<EntityMapping[]>([]);
  const [entityOptions, setEntityOptions] = useState<EntityOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<EntityMapping | null>(null);
  const [activeEntityType, setActiveEntityType] = useState('company');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    segment_id: '',
    entity_type: 'company',
    entity_id: '',
    segment_value: '',
    description: ''
  });

  useEffect(() => {
    if (selectedCompanyId) {
      loadSegments();
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    if (selectedCompanyId && activeEntityType) {
      loadMappings();
      loadEntityOptions();
    }
  }, [selectedCompanyId, activeEntityType]);

  const loadSegments = async () => {
    if (!selectedCompanyId) return;
    try {
      const { data, error } = await supabase
        .from('gl_cost_center_segments')
        .select('id, segment_name, segment_code, segment_length')
        .eq('company_id', selectedCompanyId)
        .eq('is_active', true)
        .order('segment_order');

      if (error) throw error;
      setSegments(data || []);
    } catch (error) {
      console.error('Error loading segments:', error);
    }
  };

  const loadMappings = async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gl_entity_segment_mappings')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .eq('entity_type', activeEntityType)
        .order('segment_value');

      if (error) throw error;
      
      // Enrich with entity names
      const enrichedMappings = await enrichMappingsWithEntityNames(data || []);
      setMappings(enrichedMappings);
    } catch (error) {
      console.error('Error loading mappings:', error);
      toast.error(t('common.error', 'Error loading data'));
    } finally {
      setLoading(false);
    }
  };

  const enrichMappingsWithEntityNames = async (mappings: EntityMapping[]): Promise<EntityMapping[]> => {
    const entityType = ENTITY_TYPES.find(e => e.value === activeEntityType);
    if (!entityType || mappings.length === 0) return mappings;

    const entityIds = mappings.map(m => m.entity_id);
    
    try {
      const { data: entities } = await supabase
        .from(entityType.table as any)
        .select(`id, ${entityType.codeField}, ${entityType.nameField}`)
        .in('id', entityIds);

      const entityMap = new Map(
        (entities || []).map((e: any) => [e.id, { code: e[entityType.codeField], name: e[entityType.nameField] }])
      );

      return mappings.map(m => ({
        ...m,
        entity_code: entityMap.get(m.entity_id)?.code || '',
        entity_name: entityMap.get(m.entity_id)?.name || ''
      }));
    } catch {
      return mappings;
    }
  };

  const loadEntityOptions = async () => {
    if (!selectedCompanyId) return;
    const entityType = ENTITY_TYPES.find(e => e.value === activeEntityType);
    if (!entityType) return;

    try {
      let query = supabase
        .from(entityType.table as any)
        .select(`id, ${entityType.codeField}, ${entityType.nameField}`);

      // Filter by company where applicable
      if (entityType.table !== 'companies') {
        if (entityType.table === 'profiles') {
          query = query.eq('company_id', selectedCompanyId);
        } else if (entityType.table === 'divisions') {
          // Divisions belong to company_groups - get all divisions for now
          // since filtering logic is complex
        } else {
          query = query.eq('company_id', selectedCompanyId);
        }
      }

      const { data, error } = await query.order(entityType.nameField);
      
      if (error) throw error;
      
      setEntityOptions(
        (data || []).map((e: any) => ({
          id: e.id,
          code: e[entityType.codeField] || '',
          name: e[entityType.nameField] || ''
        }))
      );
    } catch (error) {
      console.error('Error loading entity options:', error);
      setEntityOptions([]);
    }
  };

  const handleSave = async () => {
    if (!selectedCompanyId) return;
    
    const segment = segments.find(s => s.id === formData.segment_id);
    if (segment && formData.segment_value.length > segment.segment_length) {
      toast.error(t('payroll.gl.valueTooLong', 'Segment value exceeds maximum length'));
      return;
    }

    try {
      const payload = {
        company_id: selectedCompanyId,
        segment_id: formData.segment_id,
        entity_type: formData.entity_type,
        entity_id: formData.entity_id,
        segment_value: formData.segment_value,
        description: formData.description || null
      };

      if (editingMapping) {
        const { error } = await supabase
          .from('gl_entity_segment_mappings')
          .update(payload)
          .eq('id', editingMapping.id);
        if (error) throw error;
        toast.success(t('common.updated', 'Mapping updated'));
      } else {
        const { error } = await supabase
          .from('gl_entity_segment_mappings')
          .insert(payload);
        if (error) throw error;
        toast.success(t('common.created', 'Mapping created'));
      }

      setDialogOpen(false);
      resetForm();
      loadMappings();
    } catch (error: any) {
      toast.error(error.message || t('common.error', 'Error saving'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete', 'Are you sure?'))) return;
    try {
      const { error } = await supabase.from('gl_entity_segment_mappings').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('common.deleted', 'Mapping deleted'));
      loadMappings();
    } catch (error: any) {
      toast.error(error.message || t('common.error', 'Error deleting'));
    }
  };

  const openEdit = (mapping: EntityMapping) => {
    setEditingMapping(mapping);
    setFormData({
      segment_id: mapping.segment_id,
      entity_type: mapping.entity_type,
      entity_id: mapping.entity_id,
      segment_value: mapping.segment_value,
      description: mapping.description || ''
    });
    setDialogOpen(true);
  };

  const normalizeSegmentKey = (value: string) =>
    value.toLowerCase().trim().replace(/[\s-]+/g, "_");

  const SEGMENT_KEYS_BY_ENTITY: Record<string, string[]> = {
    company: ["company"],
    division: ["division"],
    department: ["department", "dept"],
    section: ["section"],
    pay_element: ["pay_element", "payelement", "account"],
    job: ["job"],
    location: ["location"],
    employee: ["employee"],
  };

  const getRequiredSegmentKeys = (entityType: string) =>
    SEGMENT_KEYS_BY_ENTITY[entityType] ?? [entityType];

  const getDefaultSegmentForEntityType = (entityType: string) => {
    const keys = getRequiredSegmentKeys(entityType);

    const matchingSegment = segments.find((s) => {
      const nameKey = normalizeSegmentKey(s.segment_name || "");
      const codeKey = normalizeSegmentKey(s.segment_code || "");
      return keys.includes(nameKey) || keys.includes(codeKey);
    });

    return matchingSegment?.id || "";
  };

  const resetForm = () => {
    setEditingMapping(null);
    setFormData({
      segment_id: getDefaultSegmentForEntityType(activeEntityType),
      entity_type: activeEntityType,
      entity_id: "",
      segment_value: "",
      description: "",
    });
  };

  const openAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const getSegmentName = (id: string) =>
    segments.find((s) => s.id === id)?.segment_name || "";
  const getSegmentLength = (id: string) =>
    segments.find((s) => s.id === id)?.segment_length || 0;

  const getFilteredSegments = () => {
    const keys = getRequiredSegmentKeys(formData.entity_type);
    return segments.filter((s) => {
      const nameKey = normalizeSegmentKey(s.segment_name || "");
      const codeKey = normalizeSegmentKey(s.segment_code || "");
      return keys.includes(nameKey) || keys.includes(codeKey);
    });
  };

  const getRequiredSegmentHint = () => {
    const keys = getRequiredSegmentKeys(formData.entity_type);
    const display = keys.map((k) => k.replace(/_/g, " "));
    return Array.from(new Set(display)).join(" / ");
  };

  const getEntityLabel = () => {
    return ENTITY_TYPES.find((e) => e.value === activeEntityType)?.label || "Entity";
  };

  const filteredMappings = mappings.filter(m => 
    !searchQuery || 
    m.segment_value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.entity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.entity_code?.toLowerCase().includes(searchQuery.toLowerCase())
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
            { label: t('payroll.gl.entityMappings', 'Entity Segment Mappings') }
          ]}
        />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t('payroll.gl.entityMappings', 'Entity Segment Mappings')}</h1>
            <p className="text-muted-foreground">{t('payroll.gl.entityMappingsDesc', 'Assign GL segment codes to organizational entities')}</p>
          </div>
          <Button onClick={openAdd} disabled={segments.length === 0}>
            <Plus className="h-4 w-4 mr-2" />
            {t('common.addMapping', 'Add Mapping')}
          </Button>
        </div>

        {segments.length === 0 && (
          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                {t('payroll.gl.noSegmentsDefined', 'No cost center segments defined. Create segments first before mapping entities.')}
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/payroll/gl/segments'}>
                {t('payroll.gl.goToSegments', 'Go to Cost Center Segments')}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <PayrollFilters
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
              showPayGroupFilter={false}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeEntityType} onValueChange={setActiveEntityType}>
              <TabsList className="flex-wrap h-auto gap-1">
                {ENTITY_TYPES.map((type) => (
                  <TabsTrigger key={type.value} value={type.value}>
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('common.search', 'Search...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                {loading ? (
                  <div className="text-center py-8">{t('common.loading', 'Loading...')}</div>
                ) : filteredMappings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('common.noMappings', 'No mappings defined for this entity type')}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('payroll.gl.entityCode', 'Entity Code')}</TableHead>
                        <TableHead>{t('payroll.gl.entityName', 'Entity Name')}</TableHead>
                        <TableHead>{t('payroll.gl.segment', 'Segment')}</TableHead>
                        <TableHead>{t('payroll.gl.glCode', 'GL Segment Code')}</TableHead>
                        <TableHead>{t('common.description', 'Description')}</TableHead>
                        <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMappings.map((mapping) => (
                        <TableRow key={mapping.id}>
                          <TableCell className="font-mono">{mapping.entity_code}</TableCell>
                          <TableCell>{mapping.entity_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{getSegmentName(mapping.segment_id)}</Badge>
                          </TableCell>
                          <TableCell className="font-mono font-medium">{mapping.segment_value}</TableCell>
                          <TableCell className="text-muted-foreground">{mapping.description}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(mapping)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(mapping.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Mapping Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMapping ? t('common.editMapping', 'Edit Mapping') : t('common.addMapping', 'Add Mapping')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>{t('payroll.gl.segment', 'Segment')}</Label>
                <Select
                  value={formData.segment_id}
                  onValueChange={(value) => setFormData({ ...formData, segment_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('payroll.gl.selectSegment', 'Select segment')} />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredSegments().map((seg) => (
                      <SelectItem key={seg.id} value={seg.id}>
                        {seg.segment_name} ({seg.segment_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {segments.length > 0 && getFilteredSegments().length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t(
                      "payroll.gl.noMatchingSegment",
                      "No matching segment is defined for this entity type."
                    )}{" "}
                    <span className="font-medium">{getRequiredSegmentHint()}</span>.{" "}
                    {t(
                      "payroll.gl.createRequiredSegment",
                      "Create the required segment in Cost Center Segments."
                    )}{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => (window.location.href = "/payroll/gl/segments")}
                    >
                      {t("payroll.gl.goToSegments", "Go to Cost Center Segments")}
                    </Button>
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>{getEntityLabel()}</Label>
                <Select
                  value={formData.entity_id}
                  onValueChange={(value) => setFormData({ ...formData, entity_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${getEntityLabel().toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {entityOptions.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.code ? `${entity.code} - ${entity.name}` : entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('payroll.gl.glCode', 'GL Segment Code')}</Label>
                <Input
                  value={formData.segment_value}
                  onChange={(e) => setFormData({ ...formData, segment_value: e.target.value })}
                  maxLength={formData.segment_id ? getSegmentLength(formData.segment_id) : 20}
                  placeholder={t('payroll.gl.enterGLCode', 'Enter GL code')}
                />
                {formData.segment_id && (
                  <p className="text-xs text-muted-foreground">
                    {t('payroll.gl.maxLength', 'Max length')}: {getSegmentLength(formData.segment_id)} {t('payroll.gl.characters', 'chars')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t('common.description', 'Description')}</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('common.optional', 'Optional')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
              <Button 
                onClick={handleSave}
                disabled={!formData.segment_id || !formData.entity_id || !formData.segment_value}
              >
                {t('common.save', 'Save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default EntitySegmentMappingsPage;
