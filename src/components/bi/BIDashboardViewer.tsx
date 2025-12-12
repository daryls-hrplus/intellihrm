import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useBITool, BIDashboard } from '@/hooks/useBITool';
import { LayoutDashboard, Plus, RefreshCw, Loader2, Settings } from 'lucide-react';
import { BIWidgetDialog } from './BIWidgetDialog';
import { BIWidgetRenderer } from './BIWidgetRenderer';
import { toast } from 'sonner';

interface BIDashboardViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardId: string;
  module: string;
}

export function BIDashboardViewer({ open, onOpenChange, dashboardId, module }: BIDashboardViewerProps) {
  const { getDashboard, deleteWidget, isLoading } = useBITool();
  const [dashboard, setDashboard] = useState<BIDashboard | null>(null);
  const [isDesignMode, setIsDesignMode] = useState(true);
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false);
  const [editingWidgetId, setEditingWidgetId] = useState<string | undefined>();
  const [deletingWidgetId, setDeletingWidgetId] = useState<string | null>(null);

  useEffect(() => {
    if (open && dashboardId) {
      loadDashboard();
    }
  }, [open, dashboardId]);

  const loadDashboard = async () => {
    const d = await getDashboard(dashboardId);
    setDashboard(d);
  };

  const handleAddWidget = () => {
    setEditingWidgetId(undefined);
    setWidgetDialogOpen(true);
  };

  const handleEditWidget = (widgetId: string) => {
    setEditingWidgetId(widgetId);
    setWidgetDialogOpen(true);
  };

  const handleDeleteWidget = async () => {
    if (!deletingWidgetId) return;
    await deleteWidget(deletingWidgetId);
    toast.success('Widget deleted');
    setDeletingWidgetId(null);
    loadDashboard();
  };

  const handleWidgetSaved = () => {
    setWidgetDialogOpen(false);
    setEditingWidgetId(undefined);
    loadDashboard();
    toast.success('Widget saved');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                {dashboard?.name || 'Loading...'}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={isDesignMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsDesignMode(!isDesignMode)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {isDesignMode ? 'Design Mode' : 'View Mode'}
                </Button>
                <Button variant="outline" size="sm" onClick={loadDashboard}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                {isDesignMode && (
                  <Button size="sm" onClick={handleAddWidget}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Widget
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="min-h-[400px] border rounded-lg p-4 bg-muted/20">
              {dashboard?.widgets && dashboard.widgets.length > 0 ? (
                <div className="grid grid-cols-12 gap-4">
                  {dashboard.widgets.map((widget) => (
                    <div
                      key={widget.id}
                      style={{ gridColumn: `span ${widget.position?.w || 6}` }}
                    >
                      <BIWidgetRenderer
                        widget={widget}
                        isDesignMode={isDesignMode}
                        onEdit={() => handleEditWidget(widget.id)}
                        onDelete={() => setDeletingWidgetId(widget.id)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                  <LayoutDashboard className="h-12 w-12 mb-4" />
                  <p>No widgets added yet</p>
                  <p className="text-sm">Click "Add Widget" to start building your dashboard</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BIWidgetDialog
        open={widgetDialogOpen}
        onOpenChange={setWidgetDialogOpen}
        dashboardId={dashboardId}
        module={module}
        widgetId={editingWidgetId}
        onSave={handleWidgetSaved}
      />

      <AlertDialog open={!!deletingWidgetId} onOpenChange={() => setDeletingWidgetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Widget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this widget? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWidget} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
