import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Edit, Trash2, Loader2, TrendingUp, TrendingDown, Hash } from 'lucide-react';
import { BIWidget, useBITool } from '@/hooks/useBITool';
import { useUserPermissionContext } from '@/hooks/useUserPermissionContext';

interface BIWidgetRendererProps {
  widget: BIWidget;
  onEdit?: () => void;
  onDelete?: () => void;
  isDesignMode?: boolean;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F'];

export function BIWidgetRenderer({ widget, onEdit, onDelete, isDesignMode = false }: BIWidgetRendererProps) {
  const { executeWidgetQuery } = useBITool();
  const permissionContext = useUserPermissionContext();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [widget, permissionContext.isLoading]);

  const loadData = async () => {
    if (permissionContext.isLoading) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await executeWidgetQuery(widget, permissionContext);
      setData(result || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Extract field names from axis config
  const getXKey = () => {
    const xAxis = widget.config?.xAxis;
    if (typeof xAxis === 'object' && xAxis?.field) return xAxis.field;
    return 'name';
  };

  const getYKey = () => {
    const yAxis = widget.config?.yAxis;
    if (typeof yAxis === 'object' && yAxis?.field) return yAxis.field;
    return 'value';
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-destructive text-sm">
          {error}
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          No data available
        </div>
      );
    }

    const xKey = getXKey();
    const yKey = getYKey();

    switch (widget.chart_type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey={xKey} className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
              <Legend />
              <Bar dataKey={yKey} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey={xKey} className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
              <Legend />
              <Line type="monotone" dataKey={yKey} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey={xKey} className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
              <Legend />
              <Area type="monotone" dataKey={yKey} stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.3)" />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey={yKey}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => entry[xKey]}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-muted-foreground">Unsupported chart type</div>;
    }
  };

  const renderKPI = () => {
    if (loading) {
      return <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />;
    }

    const yKey = getYKey();
    const value = data[0]?.[yKey] || 0;
    const previousValue = data[1]?.[yKey];
    const change = previousValue ? ((value - previousValue) / previousValue) * 100 : null;

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-4xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {change !== null && (
          <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
    );
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (data.length === 0) {
      return <div className="text-muted-foreground text-center">No data available</div>;
    }

    const columns = Object.keys(data[0] || {});

    return (
      <div className="overflow-auto h-full">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {columns.map(col => (
                <th key={col} className="text-left p-2 font-medium">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((row, i) => (
              <tr key={i} className="border-b">
                {columns.map(col => (
                  <td key={col} className="p-2">{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContent = () => {
    switch (widget.widget_type) {
      case 'kpi':
        return renderKPI();
      case 'table':
        return renderTable();
      case 'chart':
      default:
        return renderChart();
    }
  };

  const widgetHeight = (widget.position?.h || 4) * 60;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {widget.widget_type === 'kpi' && <Hash className="h-4 w-4" />}
            {widget.config?.title || widget.name}
          </CardTitle>
          {isDesignMode && (
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onEdit}>
                <Edit className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={onDelete}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0" style={{ height: `${widgetHeight}px` }}>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
