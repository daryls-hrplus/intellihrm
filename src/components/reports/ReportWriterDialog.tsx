import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Plus, Trash2, GripVertical, FileText, Table, 
  LayoutTemplate, Settings, Filter, ArrowUpDown, Calculator, Save,
  Sparkles, ChevronDown, Code
} from 'lucide-react';
import { 
  useReportWriter, 
  ReportTemplate, 
  ReportBand, 
  ReportDataSource, 
  ReportParameter,
  GroupConfig,
  SortConfig,
  Calculation
} from '@/hooks/useReportWriter';
import { ReportAIAssistant } from './ReportAIAssistant';

interface ReportWriterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: string;
  templateId?: string;
  companyId?: string;
  onSave?: (template: ReportTemplate) => void;
}

const BAND_TYPES = [
  { value: 'report_header', label: 'Report Header', icon: FileText },
  { value: 'page_header', label: 'Page Header', icon: LayoutTemplate },
  { value: 'group_header', label: 'Group Header', icon: Table },
  { value: 'detail', label: 'Detail', icon: Table },
  { value: 'group_footer', label: 'Group Footer', icon: Table },
  { value: 'page_footer', label: 'Page Footer', icon: LayoutTemplate },
  { value: 'report_footer', label: 'Report Footer', icon: FileText },
  { value: 'sub_report', label: 'Sub-Report', icon: FileText }
];

const PARAMETER_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'dateRange', label: 'Date Range' },
  { value: 'select', label: 'Dropdown' },
  { value: 'multiSelect', label: 'Multi-Select' }
];

const CALCULATION_TYPES = [
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'count', label: 'Count' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
  { value: 'custom', label: 'Custom Expression' }
];

export function ReportWriterDialog({
  open,
  onOpenChange,
  module,
  templateId,
  companyId,
  onSave
}: ReportWriterDialogProps) {
  const { getDataSources, getTemplate, getTemplates, createTemplate, updateTemplate, isLoading } = useReportWriter();
  
  const [dataSources, setDataSources] = useState<ReportDataSource[]>([]);
  const [subReportTemplates, setSubReportTemplates] = useState<ReportTemplate[]>([]);
  const [activeTab, setActiveTab] = useState('general');
  const [aiAssistantOpen, setAiAssistantOpen] = useState(true);
  
  const [template, setTemplate] = useState<Partial<ReportTemplate>>({
    name: '',
    code: '',
    description: '',
    module,
    is_global: false,
    company_id: companyId,
    data_source: '',
    custom_sql: null,
    bands: [
      { band_type: 'report_header', band_order: 0, content: { elements: [] }, height: 80, visible: true, page_break_before: false, page_break_after: false, repeat_on_each_page: false },
      { band_type: 'page_header', band_order: 1, content: { elements: [] }, height: 40, visible: true, page_break_before: false, page_break_after: false, repeat_on_each_page: true },
      { band_type: 'detail', band_order: 2, content: { elements: [] }, height: 30, visible: true, page_break_before: false, page_break_after: false, repeat_on_each_page: false },
      { band_type: 'page_footer', band_order: 3, content: { elements: [] }, height: 40, visible: true, page_break_before: false, page_break_after: false, repeat_on_each_page: true },
      { band_type: 'report_footer', band_order: 4, content: { elements: [] }, height: 60, visible: true, page_break_before: false, page_break_after: false, repeat_on_each_page: false }
    ],
    parameters: [],
    grouping: [],
    sorting: [],
    calculations: [],
    page_settings: {
      orientation: 'portrait',
      size: 'A4',
      margins: { top: 20, right: 20, bottom: 20, left: 20 }
    }
  });

  useEffect(() => {
    if (open) {
      loadDataSources();
      loadSubReportTemplates();
      if (templateId) {
        loadTemplate();
      }
    }
  }, [open, templateId]);

  const loadDataSources = async () => {
    const sources = await getDataSources(module);
    setDataSources(sources);
  };

  const loadSubReportTemplates = async () => {
    const templates = await getTemplates(undefined, companyId);
    setSubReportTemplates(templates);
  };

  const loadTemplate = async () => {
    if (!templateId) return;
    const t = await getTemplate(templateId);
    if (t) {
      setTemplate(t);
    }
  };

  const handleSave = async () => {
    if (!template.name || !template.code || !template.data_source) {
      return;
    }

    let savedTemplate: ReportTemplate | null = null;
    if (templateId) {
      const success = await updateTemplate(templateId, template);
      if (success) {
        savedTemplate = { ...template, id: templateId } as ReportTemplate;
      }
    } else {
      savedTemplate = await createTemplate(template);
    }

    if (savedTemplate) {
      onSave?.(savedTemplate);
      onOpenChange(false);
    }
  };

  const addBand = (bandType: ReportBand['band_type']) => {
    const newBand: ReportBand = {
      band_type: bandType,
      band_order: template.bands?.length || 0,
      content: { elements: [] },
      height: bandType === 'detail' ? 30 : 50,
      visible: true,
      page_break_before: false,
      page_break_after: false,
      repeat_on_each_page: bandType.includes('page')
    };
    setTemplate(prev => ({
      ...prev,
      bands: [...(prev.bands || []), newBand]
    }));
  };

  const updateBand = (index: number, updates: Partial<ReportBand>) => {
    setTemplate(prev => ({
      ...prev,
      bands: prev.bands?.map((b, i) => i === index ? { ...b, ...updates } : b)
    }));
  };

  const removeBand = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      bands: prev.bands?.filter((_, i) => i !== index)
    }));
  };

  const addParameter = () => {
    const newParam: ReportParameter = {
      name: `param_${(template.parameters?.length || 0) + 1}`,
      label: `Parameter ${(template.parameters?.length || 0) + 1}`,
      type: 'text',
      required: false
    };
    setTemplate(prev => ({
      ...prev,
      parameters: [...(prev.parameters || []), newParam]
    }));
  };

  const updateParameter = (index: number, updates: Partial<ReportParameter>) => {
    setTemplate(prev => ({
      ...prev,
      parameters: prev.parameters?.map((p, i) => i === index ? { ...p, ...updates } : p)
    }));
  };

  const removeParameter = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      parameters: prev.parameters?.filter((_, i) => i !== index)
    }));
  };

  const addGrouping = () => {
    const newGroup: GroupConfig = {
      field: '',
      label: '',
      sortOrder: 'asc'
    };
    setTemplate(prev => ({
      ...prev,
      grouping: [...(prev.grouping || []), newGroup]
    }));
  };

  const updateGrouping = (index: number, updates: Partial<GroupConfig>) => {
    setTemplate(prev => ({
      ...prev,
      grouping: prev.grouping?.map((g, i) => i === index ? { ...g, ...updates } : g)
    }));
  };

  const removeGrouping = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      grouping: prev.grouping?.filter((_, i) => i !== index)
    }));
  };

  const addSorting = () => {
    const newSort: SortConfig = {
      field: '',
      order: 'asc'
    };
    setTemplate(prev => ({
      ...prev,
      sorting: [...(prev.sorting || []), newSort]
    }));
  };

  const updateSorting = (index: number, updates: Partial<SortConfig>) => {
    setTemplate(prev => ({
      ...prev,
      sorting: prev.sorting?.map((s, i) => i === index ? { ...s, ...updates } : s)
    }));
  };

  const removeSorting = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      sorting: prev.sorting?.filter((_, i) => i !== index)
    }));
  };

  const addCalculation = () => {
    const newCalc: Calculation = {
      name: `calc_${(template.calculations?.length || 0) + 1}`,
      label: `Calculation ${(template.calculations?.length || 0) + 1}`,
      type: 'sum',
      resetOn: 'report'
    };
    setTemplate(prev => ({
      ...prev,
      calculations: [...(prev.calculations || []), newCalc]
    }));
  };

  const updateCalculation = (index: number, updates: Partial<Calculation>) => {
    setTemplate(prev => ({
      ...prev,
      calculations: prev.calculations?.map((c, i) => i === index ? { ...c, ...updates } : c)
    }));
  };

  const removeCalculation = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      calculations: prev.calculations?.filter((_, i) => i !== index)
    }));
  };

  const selectedDataSource = dataSources.find(ds => ds.code === template.data_source);

  const handleApplyAITemplate = (aiTemplate: Partial<ReportTemplate>) => {
    setTemplate(prev => ({
      ...prev,
      ...aiTemplate,
      custom_sql: aiTemplate.custom_sql || prev.custom_sql,
      module,
      company_id: companyId
    }));
  };

  const handleApplyAISuggestions = (suggestions: {
    suggested_fields: string[];
    suggested_grouping: { field: string; reason: string }[];
    suggested_calculations: { type: string; field: string; reason: string }[];
    suggested_parameters: { name: string; type: string; reason: string }[];
  }) => {
    setTemplate(prev => ({
      ...prev,
      grouping: [
        ...(prev.grouping || []),
        ...suggestions.suggested_grouping.map((g, i) => ({
          field: g.field,
          label: g.field,
          sortOrder: 'asc' as const
        }))
      ],
      calculations: [
        ...(prev.calculations || []),
        ...suggestions.suggested_calculations.map((c, i) => ({
          name: `ai_calc_${i}`,
          label: c.field,
          type: c.type as 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom',
          field: c.field,
          resetOn: 'report' as const
        }))
      ],
      parameters: [
        ...(prev.parameters || []),
        ...suggestions.suggested_parameters.map(p => ({
          name: p.name,
          label: p.name,
          type: p.type as 'text' | 'number' | 'date' | 'dateRange' | 'select' | 'multiSelect',
          required: false
        }))
      ]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {templateId ? 'Edit Report Template' : 'Create Report Template'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4">
          {/* AI Assistant Panel */}
          <div className="col-span-1">
            <Collapsible open={aiAssistantOpen} onOpenChange={setAiAssistantOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Assistant
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${aiAssistantOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ReportAIAssistant
                  module={module}
                  dataSources={dataSources}
                  currentTemplate={template}
                  onApplyTemplate={handleApplyAITemplate}
                  onApplySuggestions={handleApplyAISuggestions}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Main Template Editor */}
          <div className="col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="grid grid-cols-7 w-full">
                <TabsTrigger value="general" className="gap-1 text-xs">
                  <Settings className="h-3 w-3" />
                  General
                </TabsTrigger>
                <TabsTrigger value="sql" className="gap-1 text-xs">
                  <Code className="h-3 w-3" />
                  SQL
                </TabsTrigger>
                <TabsTrigger value="bands" className="gap-1 text-xs">
                  <LayoutTemplate className="h-3 w-3" />
                  Bands
                </TabsTrigger>
                <TabsTrigger value="parameters" className="gap-1 text-xs">
                  <Filter className="h-3 w-3" />
                  Params
                </TabsTrigger>
                <TabsTrigger value="grouping" className="gap-1 text-xs">
                  <Table className="h-3 w-3" />
                  Group
                </TabsTrigger>
                <TabsTrigger value="sorting" className="gap-1 text-xs">
                  <ArrowUpDown className="h-3 w-3" />
                  Sort
                </TabsTrigger>
                <TabsTrigger value="calculations" className="gap-1 text-xs">
                  <Calculator className="h-3 w-3" />
                  Calc
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[55vh] mt-4">
                <TabsContent value="general" className="space-y-4 px-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name *</Label>
                  <Input
                    value={template.name}
                    onChange={e => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Monthly Employee Report"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Template Code *</Label>
                  <Input
                    value={template.code}
                    onChange={e => setTemplate(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/\s/g, '_') }))}
                    placeholder="MONTHLY_EMP_RPT"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={template.description || ''}
                  onChange={e => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this report shows..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Source *</Label>
                  <Select
                    value={template.data_source}
                    onValueChange={value => setTemplate(prev => ({ ...prev, data_source: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources.map(ds => (
                        <SelectItem key={ds.code} value={ds.code}>
                          {ds.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={template.is_global}
                      onCheckedChange={checked => setTemplate(prev => ({ ...prev, is_global: checked }))}
                    />
                    <Label>Global Template</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Page Settings</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Orientation</Label>
                    <Select
                      value={template.page_settings?.orientation}
                      onValueChange={value => setTemplate(prev => ({
                        ...prev,
                        page_settings: { ...prev.page_settings!, orientation: value as 'portrait' | 'landscape' }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Page Size</Label>
                    <Select
                      value={template.page_settings?.size}
                      onValueChange={value => setTemplate(prev => ({
                        ...prev,
                        page_settings: { ...prev.page_settings!, size: value as 'A4' | 'A3' | 'Letter' | 'Legal' }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="A3">A3</SelectItem>
                        <SelectItem value="Letter">Letter</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {['top', 'right', 'bottom', 'left'].map(margin => (
                    <div key={margin} className="space-y-2">
                      <Label className="capitalize">{margin} Margin (mm)</Label>
                      <Input
                        type="number"
                        value={template.page_settings?.margins?.[margin as keyof typeof template.page_settings.margins] || 20}
                        onChange={e => setTemplate(prev => ({
                          ...prev,
                          page_settings: {
                            ...prev.page_settings!,
                            margins: {
                              ...prev.page_settings!.margins,
                              [margin]: parseInt(e.target.value) || 20
                            }
                          }
                        }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {selectedDataSource && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Available Fields</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDataSource.available_fields.map(field => (
                        <Badge key={field.name} variant="secondary">
                          {field.label} ({field.type})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="sql" className="space-y-4 px-1">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Custom SQL Query</h4>
                  <p className="text-sm text-muted-foreground">
                    For complex reports with aggregations or cross-tabs, use custom SQL. The AI assistant can generate this.
                  </p>
                </div>
                <Textarea
                  value={template.custom_sql || ''}
                  onChange={e => setTemplate(prev => ({ ...prev, custom_sql: e.target.value || null }))}
                  placeholder="SELECT ... FROM ... GROUP BY ..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="bands" className="space-y-4 px-1">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Report Bands</h4>
                <Select onValueChange={addBand as (value: string) => void}>
                  <SelectTrigger className="w-48">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Band
                  </SelectTrigger>
                  <SelectContent>
                    {BAND_TYPES.map(bt => (
                      <SelectItem key={bt.value} value={bt.value}>
                        {bt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {template.bands?.map((band, index) => {
                  const bandType = BAND_TYPES.find(bt => bt.value === band.band_type);
                  const Icon = bandType?.icon || FileText;
                  
                  return (
                    <Card key={index}>
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            <Icon className="h-4 w-4" />
                            <CardTitle className="text-sm">{bandType?.label || band.band_type}</CardTitle>
                            <Badge variant={band.visible ? 'default' : 'secondary'}>
                              {band.visible ? 'Visible' : 'Hidden'}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeBand(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="grid grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Height (px)</Label>
                            <Input
                              type="number"
                              value={band.height}
                              onChange={e => updateBand(index, { height: parseInt(e.target.value) || 50 })}
                            />
                          </div>
                          {(band.band_type === 'group_header' || band.band_type === 'group_footer') && (
                            <div className="space-y-2">
                              <Label>Group Field</Label>
                              <Select
                                value={band.group_field}
                                onValueChange={value => updateBand(index, { group_field: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select field" />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedDataSource?.available_fields.map(f => (
                                    <SelectItem key={f.name} value={f.name}>{f.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {band.band_type === 'sub_report' && (
                            <div className="space-y-2">
                              <Label>Sub-Report Template</Label>
                              <Select
                                value={band.sub_report_template_id}
                                onValueChange={value => updateBand(index, { sub_report_template_id: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select template" />
                                </SelectTrigger>
                                <SelectContent>
                                  {subReportTemplates.filter(t => t.id !== templateId).map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          <div className="flex items-center gap-4 pt-6">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={band.visible}
                                onCheckedChange={checked => updateBand(index, { visible: checked })}
                              />
                              <Label className="text-xs">Visible</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={band.page_break_after}
                                onCheckedChange={checked => updateBand(index, { page_break_after: checked })}
                              />
                              <Label className="text-xs">Page Break After</Label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="parameters" className="space-y-4 px-1">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Report Parameters</h4>
                <Button onClick={addParameter} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Parameter
                </Button>
              </div>

              <div className="space-y-2">
                {template.parameters?.map((param, index) => (
                  <Card key={index}>
                    <CardContent className="py-4">
                      <div className="grid grid-cols-5 gap-4 items-end">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={param.name}
                            onChange={e => updateParameter(index, { name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Label</Label>
                          <Input
                            value={param.label}
                            onChange={e => updateParameter(index, { label: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={param.type}
                            onValueChange={value => updateParameter(index, { type: value as ReportParameter['type'] })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PARAMETER_TYPES.map(pt => (
                                <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={param.required}
                            onCheckedChange={checked => updateParameter(index, { required: checked })}
                          />
                          <Label>Required</Label>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeParameter(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {template.parameters?.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No parameters defined. Add parameters to allow users to filter report data.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="grouping" className="space-y-4 px-1">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Data Grouping</h4>
                <Button onClick={addGrouping} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Group
                </Button>
              </div>

              <div className="space-y-2">
                {template.grouping?.map((group, index) => (
                  <Card key={index}>
                    <CardContent className="py-4">
                      <div className="grid grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                          <Label>Field</Label>
                          <Select
                            value={group.field}
                            onValueChange={value => updateGrouping(index, { field: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedDataSource?.available_fields.map(f => (
                                <SelectItem key={f.name} value={f.name}>{f.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Label</Label>
                          <Input
                            value={group.label}
                            onChange={e => updateGrouping(index, { label: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Sort Order</Label>
                          <Select
                            value={group.sortOrder}
                            onValueChange={value => updateGrouping(index, { sortOrder: value as 'asc' | 'desc' })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asc">Ascending</SelectItem>
                              <SelectItem value="desc">Descending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={group.pageBreakAfter}
                              onCheckedChange={checked => updateGrouping(index, { pageBreakAfter: checked })}
                            />
                            <Label className="text-xs">Page Break</Label>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeGrouping(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {template.grouping?.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No grouping defined. Add groups to organize data hierarchically.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="sorting" className="space-y-4 px-1">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Data Sorting</h4>
                <Button onClick={addSorting} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sort
                </Button>
              </div>

              <div className="space-y-2">
                {template.sorting?.map((sort, index) => (
                  <Card key={index}>
                    <CardContent className="py-4">
                      <div className="grid grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                          <Label>Field</Label>
                          <Select
                            value={sort.field}
                            onValueChange={value => updateSorting(index, { field: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedDataSource?.available_fields.map(f => (
                                <SelectItem key={f.name} value={f.name}>{f.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Order</Label>
                          <Select
                            value={sort.order}
                            onValueChange={value => updateSorting(index, { order: value as 'asc' | 'desc' })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asc">Ascending</SelectItem>
                              <SelectItem value="desc">Descending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeSorting(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {template.sorting?.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No sorting defined. Add sorting to order the data.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="calculations" className="space-y-4 px-1">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Calculations</h4>
                <Button onClick={addCalculation} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Calculation
                </Button>
              </div>

              <div className="space-y-2">
                {template.calculations?.map((calc, index) => (
                  <Card key={index}>
                    <CardContent className="py-4">
                      <div className="grid grid-cols-5 gap-4 items-end">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={calc.name}
                            onChange={e => updateCalculation(index, { name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Label</Label>
                          <Input
                            value={calc.label}
                            onChange={e => updateCalculation(index, { label: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={calc.type}
                            onValueChange={value => updateCalculation(index, { type: value as Calculation['type'] })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CALCULATION_TYPES.map(ct => (
                                <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Field</Label>
                          <Select
                            value={calc.field}
                            onValueChange={value => updateCalculation(index, { field: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedDataSource?.available_fields.filter(f => f.type === 'integer' || f.type === 'numeric').map(f => (
                                <SelectItem key={f.name} value={f.name}>{f.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeCalculation(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {calc.type === 'custom' && (
                        <div className="mt-4 space-y-2">
                          <Label>Custom Expression</Label>
                          <Input
                            value={calc.expression || ''}
                            onChange={e => updateCalculation(index, { expression: e.target.value })}
                            placeholder="e.g., field1 + field2 * 0.1"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {template.calculations?.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No calculations defined. Add calculations for totals and aggregations.</p>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !template.name || !template.code || !template.data_source}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
