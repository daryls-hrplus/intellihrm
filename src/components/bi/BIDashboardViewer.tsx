import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LayoutDashboard, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBITool, BIDashboard } from '@/hooks/useBITool';

interface BIDashboardViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardId: string;
}

export function BIDashboardViewer({ open, onOpenChange, dashboardId }: BIDashboardViewerProps) {
  const { getDashboard, isLoading } = useBITool();
  const [dashboard, setDashboard] = useState<BIDashboard | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (open && dashboardId) {
      loadDashboard();
    }
  }, [open, dashboardId]);

  const loadDashboard = async () => {
    const d = await getDashboard(dashboardId);
    setDashboard(d);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (isLoading && !dashboard) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              {dashboard?.name || 'Dashboard'}
            </DialogTitle>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-4 mt-4 overflow-y-auto max-h-[70vh]">
          {dashboard?.widgets && dashboard.widgets.length > 0 ? (
            dashboard.widgets.map(widget => (
              <Card 
                key={widget.id} 
                className="col-span-4"
                style={{
                  gridColumn: `span ${widget.position.w}`,
                }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{widget.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 flex items-center justify-center bg-muted/50 rounded text-muted-foreground text-sm">
                    {widget.widget_type === 'chart' && `${widget.chart_type} chart`}
                    {widget.widget_type === 'kpi' && 'KPI Widget'}
                    {widget.widget_type === 'table' && 'Data Table'}
                    {widget.widget_type === 'gauge' && 'Gauge Widget'}
                    {widget.widget_type === 'text' && 'Text Widget'}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-12 flex flex-col items-center justify-center py-12 text-muted-foreground">
              <LayoutDashboard className="h-12 w-12 mb-4" />
              <p>No widgets added to this dashboard yet.</p>
              <p className="text-sm">Edit the dashboard to add widgets.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
