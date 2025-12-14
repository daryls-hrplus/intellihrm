import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Plus, BarChart3, PieChart, LineChart, Table2, Gauge, 
  LayoutDashboard, Eye, Edit, Trash2, Globe, Building2, Loader2, Sparkles, ChevronDown
} from 'lucide-react';
import { useBITool, BIDashboard, BIWidget } from '@/hooks/useBITool';
import { BIDashboardDialog } from './BIDashboardDialog';
import { BIDashboardViewer } from './BIDashboardViewer';
import { BIAIAssistant } from './BIAIAssistant';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BIDashboardsListProps {
  module: string;
  companyId?: string;
}

export function BIDashboardsList({ module, companyId }: BIDashboardsListProps) {
  const { getDashboards, getDataSources, deleteDashboard, createDashboard, createWidget, isLoading } = useBITool();
  const [dashboards, setDashboards] = useState<BIDashboard[]>([]);
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<BIDashboard | null>(null);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  useEffect(() => {
    loadDashboards();
    loadDataSources();
  }, [module, companyId]);

  const loadDashboards = async () => {
    setLoading(true);
    const data = await getDashboards(module, companyId);
    setDashboards(data);
    setLoading(false);
  };

  const loadDataSources = async () => {
    const sources = await getDataSources(module);
    setDataSources(sources);
  };

  const handleCreate = () => {
    setEditingId(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (dashboard: BIDashboard) => {
    setEditingId(dashboard.id);
    setDialogOpen(true);
  };

  const handleView = (dashboard: BIDashboard) => {
    setSelectedDashboard(dashboard);
    setViewerOpen(true);
  };

  const handleDelete = (id: string) => {
    setDashboardToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (dashboardToDelete) {
      await deleteDashboard(dashboardToDelete);
      loadDashboards();
    }
    setDeleteConfirmOpen(false);
    setDashboardToDelete(null);
  };

  const handleSave = () => {
    loadDashboards();
    setDialogOpen(false);
  };

  const handleAIGeneratedDashboard = async (dashboardData: Partial<BIDashboard>, widgets: Partial<BIWidget>[]) => {
    // Create the dashboard first
    const createdDashboard = await createDashboard({
      ...dashboardData,
      module,
      company_id: companyId
    });

    if (createdDashboard && widgets.length > 0) {
      // Create each widget for the dashboard
      for (const widget of widgets) {
        await createWidget({
          ...widget,
          dashboard_id: createdDashboard.id
        });
      }
    }

    loadDashboards();
    setShowAIAssistant(false);
  };

  const getWidgetTypeIcon = (type: string) => {
    switch (type) {
      case 'bar': return BarChart3;
      case 'pie': case 'donut': return PieChart;
      case 'line': case 'area': return LineChart;
      case 'table': return Table2;
      case 'gauge': return Gauge;
      default: return LayoutDashboard;
    }
  };

  const globalDashboards = dashboards.filter(d => d.is_global);
  const companyDashboards = dashboards.filter(d => !d.is_global);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Create and manage BI dashboards with interactive charts and KPIs
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAIAssistant(!showAIAssistant)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generate
          </Button>
          <Button onClick={handleCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Dashboard
          </Button>
        </div>
      </div>

      {showAIAssistant && (
        <BIAIAssistant
          module={module}
          dataSources={dataSources}
          onApplyDashboard={handleAIGeneratedDashboard}
        />
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({dashboards.length})</TabsTrigger>
          <TabsTrigger value="global">
            <Globe className="h-3 w-3 mr-1" />
            Global ({globalDashboards.length})
          </TabsTrigger>
          <TabsTrigger value="company">
            <Building2 className="h-3 w-3 mr-1" />
            Company ({companyDashboards.length})
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[60vh] mt-4">
          <TabsContent value="all" className="space-y-3">
            {dashboards.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <LayoutDashboard className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No dashboards created yet.
                    <br />
                    Click "New Dashboard" to create your first BI dashboard.
                  </p>
                </CardContent>
              </Card>
            ) : (
              dashboards.map(dashboard => (
                <DashboardCard 
                  key={dashboard.id} 
                  dashboard={dashboard}
                  onView={() => handleView(dashboard)}
                  onEdit={() => handleEdit(dashboard)}
                  onDelete={() => handleDelete(dashboard.id)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="global" className="space-y-3">
            {globalDashboards.map(dashboard => (
              <DashboardCard 
                key={dashboard.id} 
                dashboard={dashboard}
                onView={() => handleView(dashboard)}
                onEdit={() => handleEdit(dashboard)}
                onDelete={() => handleDelete(dashboard.id)}
              />
            ))}
          </TabsContent>

          <TabsContent value="company" className="space-y-3">
            {companyDashboards.map(dashboard => (
              <DashboardCard 
                key={dashboard.id} 
                dashboard={dashboard}
                onView={() => handleView(dashboard)}
                onEdit={() => handleEdit(dashboard)}
                onDelete={() => handleDelete(dashboard.id)}
              />
            ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <BIDashboardDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        module={module}
        dashboardId={editingId}
        companyId={companyId}
        onSave={handleSave}
      />

      {selectedDashboard && (
        <BIDashboardViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          dashboardId={selectedDashboard.id}
          module={selectedDashboard.module}
        />
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dashboard?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this dashboard and all its widgets.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DashboardCard({ 
  dashboard, 
  onView, 
  onEdit, 
  onDelete 
}: { 
  dashboard: BIDashboard; 
  onView: () => void; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  return (
    <Card className="hover:border-primary/20 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-primary" />
              {dashboard.name}
            </CardTitle>
            <CardDescription className="text-xs">
              {dashboard.code}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            {dashboard.is_global ? (
              <Badge variant="secondary" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                Global
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <Building2 className="h-3 w-3 mr-1" />
                Company
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {dashboard.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {dashboard.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {dashboard.refresh_interval && (
              <span>Auto-refresh: {dashboard.refresh_interval}s</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onView}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
