import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, PieChart, LineChart, TrendingUp, Hash, Table, Save, Loader2 } from 'lucide-react';
import { useBITool, BIWidget, BIDataSource, WidgetConfig } from '@/hooks/useBITool';

interface BIWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardId: string;
  module: string;
  widgetId?: string;
  onSave?: () => void;
}

type WidgetType = 'chart' | 'kpi' | 'table' | 'gauge' | 'map' | 'text';
type ChartType = 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'scatter' | 'radar' | 'funnel' | 'stacked_bar' | 'horizontal_bar';

const WIDGET_TYPES = [
  { value: 'chart' as WidgetType, label: 'Chart', icon: BarChart3 },
  { value: 'kpi' as WidgetType, label: 'KPI Card', icon: Hash },
  { value: 'table' as WidgetType, label: 'Data Table', icon: Table },
];

const CHART_TYPES = [
  { value: 'bar' as ChartType, label: 'Bar Chart', icon: BarChart3 },
  { value: 'line' as ChartType, label: 'Line Chart', icon: LineChart },
  { value: 'pie' as ChartType, label: 'Pie Chart', icon: PieChart },
  { value: 'area' as ChartType, label: 'Area Chart', icon: TrendingUp },
];

export function BIWidgetDialog({
  open,
  onOpenChange,
  dashboardId,
  module,
  widgetId,
  onSave
}: BIWidgetDialogProps) {
  const { getDataSources, createWidget, updateWidget, isLoading } = useBITool();
  
  const [dataSources, setDataSources] = useState<BIDataSource[]>([]);
  const [widget, setWidget] = useState<Partial<BIWidget>>({
    name: '',
    widget_type: 'chart',
    chart_type: 'bar',
    data_source: '',
    dashboard_id: dashboardId,
    config: {
      title: '',
      xAxis: { field: '', label: '' },
      yAxis: { field: '', label: '', aggregation: 'count' },
      groupBy: '',
    },
    filters: [],
    position: { x: 0, y: 0, w: 6, h: 4 },
    display_order: 0,
    is_visible: true,
  });

  useEffect(() => {
    if (open) {
      loadDataSources();
      if (!widgetId) {
        setWidget({
          name: '',
          widget_type: 'chart',
          chart_type: 'bar',
          data_source: '',
          dashboard_id: dashboardId,
          config: {
            title: '',
            xAxis: { field: '', label: '' },
            yAxis: { field: '', label: '', aggregation: 'count' },
            groupBy: '',
          },
          filters: [],
          position: { x: 0, y: 0, w: 6, h: 4 },
          display_order: 0,
          is_visible: true,
        });
      }
    }
  }, [open, dashboardId]);

  const loadDataSources = async () => {
    const sources = await getDataSources(module);
    setDataSources(sources);
  };

  const selectedDataSource = dataSources.find(ds => ds.code === widget.data_source);

  const handleSave = async () => {
    if (!widget.name || !widget.data_source) return;

    if (widgetId) {
      await updateWidget(widgetId, widget);
    } else {
      await createWidget({ ...widget, dashboard_id: dashboardId });
    }
    onSave?.();
  };

  const updateConfig = (updates: Partial<WidgetConfig>) => {
    setWidget(prev => ({
      ...prev,
      config: { ...prev.config, ...updates } as WidgetConfig
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {widgetId ? 'Edit Widget' : 'Add Widget'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Widget Name *</Label>
              <Input
                value={widget.name}
                onChange={e => setWidget(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Monthly Sales Overview"
              />
            </div>

            <div className="space-y-2">
              <Label>Widget Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {WIDGET_TYPES.map(type => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={widget.widget_type === type.value ? 'default' : 'outline'}
                    className="flex flex-col h-20 gap-2"
                    onClick={() => setWidget(prev => ({ ...prev, widget_type: type.value }))}
                  >
                    <type.icon className="h-6 w-6" />
                    <span className="text-xs">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {widget.widget_type === 'chart' && (
              <div className="space-y-2">
                <Label>Chart Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {CHART_TYPES.map(type => (
                    <Button
                      key={type.value}
                      type="button"
                      variant={widget.chart_type === type.value ? 'default' : 'outline'}
                      className="flex flex-col h-16 gap-1"
                      onClick={() => setWidget(prev => ({ ...prev, chart_type: type.value }))}
                    >
                      <type.icon className="h-5 w-5" />
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="data" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Data Source *</Label>
              <Select
                value={widget.data_source}
                onValueChange={value => setWidget(prev => ({ ...prev, data_source: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  {dataSources.map(ds => (
                    <SelectItem key={ds.id} value={ds.code}>
                      {ds.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDataSource && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>X-Axis / Category Field</Label>
                    <Select
                      value={widget.config?.xAxis?.field || ''}
                      onValueChange={value => {
                        const field = selectedDataSource.available_fields?.find(f => f.name === value);
                        updateConfig({
                          xAxis: { field: value, label: field?.label || value }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedDataSource.available_fields?.map((field: any) => (
                          <SelectItem key={field.name} value={field.name}>
                            {field.label || field.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Y-Axis / Value Field</Label>
                    <Select
                      value={widget.config?.yAxis?.field || ''}
                      onValueChange={value => {
                        const field = selectedDataSource.available_fields?.find(f => f.name === value);
                        updateConfig({
                          yAxis: { 
                            field: value, 
                            label: field?.label || value,
                            aggregation: widget.config?.yAxis?.aggregation || 'count'
                          }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedDataSource.available_fields?.map((field: any) => (
                          <SelectItem key={field.name} value={field.name}>
                            {field.label || field.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Aggregation</Label>
                    <Select
                      value={widget.config?.yAxis?.aggregation || 'count'}
                      onValueChange={value => {
                        updateConfig({
                          yAxis: { 
                            ...widget.config?.yAxis!,
                            aggregation: value as 'sum' | 'avg' | 'count' | 'min' | 'max'
                          }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="count">Count</SelectItem>
                        <SelectItem value="sum">Sum</SelectItem>
                        <SelectItem value="avg">Average</SelectItem>
                        <SelectItem value="min">Minimum</SelectItem>
                        <SelectItem value="max">Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Group By</Label>
                    <Select
                      value={widget.config?.groupBy || ''}
                      onValueChange={value => updateConfig({ groupBy: value || undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Optional grouping" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {selectedDataSource.available_fields?.map((field: any) => (
                          <SelectItem key={field.name} value={field.name}>
                            {field.label || field.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Custom SQL (Advanced)</Label>
              <Textarea
                value={widget.custom_sql || ''}
                onChange={e => setWidget(prev => ({ ...prev, custom_sql: e.target.value }))}
                placeholder="Optional: Enter custom SQL query for complex data retrieval..."
                rows={4}
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Widget Title (Display)</Label>
              <Input
                value={widget.config?.title || ''}
                onChange={e => updateConfig({ title: e.target.value })}
                placeholder="Optional display title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Width (columns, 1-12)</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={widget.position?.w || 6}
                  onChange={e => setWidget(prev => ({
                    ...prev,
                    position: { ...prev.position!, w: parseInt(e.target.value) || 6 }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Height (rows)</Label>
                <Input
                  type="number"
                  min={2}
                  max={12}
                  value={widget.position?.h || 4}
                  onChange={e => setWidget(prev => ({
                    ...prev,
                    position: { ...prev.position!, h: parseInt(e.target.value) || 4 }
                  }))}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !widget.name || !widget.data_source}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Widget
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
