import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutDashboard, Save, Loader2 } from 'lucide-react';
import { useBITool, BIDashboard } from '@/hooks/useBITool';

interface BIDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: string;
  dashboardId?: string;
  companyId?: string;
  onSave?: () => void;
}

export function BIDashboardDialog({
  open,
  onOpenChange,
  module,
  dashboardId,
  companyId,
  onSave
}: BIDashboardDialogProps) {
  const { getDashboard, createDashboard, updateDashboard, isLoading } = useBITool();
  
  const [dashboard, setDashboard] = useState<Partial<BIDashboard>>({
    name: '',
    code: '',
    description: '',
    module,
    is_global: false,
    company_id: companyId,
    refresh_interval: null,
    theme: { colorScheme: 'default' },
  });

  useEffect(() => {
    if (open && dashboardId) {
      loadDashboard();
    } else if (open) {
      setDashboard({
        name: '',
        code: '',
        description: '',
        module,
        is_global: false,
        company_id: companyId,
        refresh_interval: null,
        theme: { colorScheme: 'default' },
      });
    }
  }, [open, dashboardId]);

  const loadDashboard = async () => {
    if (!dashboardId) return;
    const d = await getDashboard(dashboardId);
    if (d) setDashboard(d);
  };

  const handleSave = async () => {
    if (!dashboard.name || !dashboard.code) return;

    if (dashboardId) {
      await updateDashboard(dashboardId, dashboard);
    } else {
      await createDashboard(dashboard);
    }
    onSave?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            {dashboardId ? 'Edit Dashboard' : 'Create Dashboard'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dashboard Name *</Label>
              <Input
                value={dashboard.name}
                onChange={e => setDashboard(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Sales Overview"
              />
            </div>
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input
                value={dashboard.code}
                onChange={e => setDashboard(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/\s/g, '_') }))}
                placeholder="SALES_OVERVIEW"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={dashboard.description || ''}
              onChange={e => setDashboard(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Dashboard description..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Auto-Refresh (seconds)</Label>
              <Input
                type="number"
                value={dashboard.refresh_interval || ''}
                onChange={e => setDashboard(prev => ({ ...prev, refresh_interval: e.target.value ? parseInt(e.target.value) : null }))}
                placeholder="Leave empty for manual"
              />
            </div>
            <div className="space-y-2">
              <Label>Color Scheme</Label>
              <Select
                value={dashboard.theme?.colorScheme || 'default'}
                onValueChange={value => setDashboard(prev => ({ ...prev, theme: { ...prev.theme!, colorScheme: value as any } }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="vibrant">Vibrant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={dashboard.is_global}
              onCheckedChange={checked => setDashboard(prev => ({ ...prev, is_global: checked }))}
            />
            <Label>Global Dashboard (available to all companies)</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !dashboard.name || !dashboard.code}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
