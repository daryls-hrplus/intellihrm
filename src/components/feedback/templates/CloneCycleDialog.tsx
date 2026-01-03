import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, UserCheck, UsersRound, UserCog } from 'lucide-react';
import { useCloneCycle, type CycleTemplate } from '@/hooks/feedback/useCycleTemplates';

interface CloneCycleDialogProps {
  template: CycleTemplate | null;
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (cycleId: string) => void;
}

export function CloneCycleDialog({
  template,
  companyId,
  open,
  onOpenChange,
  onSuccess,
}: CloneCycleDialogProps) {
  const cloneCycle = useCloneCycle();
  const [newName, setNewName] = useState('');

  const handleClone = () => {
    if (!template) return;
    
    cloneCycle.mutate(
      {
        templateId: template.id,
        newName: newName || `${template.template_name || template.name} (Copy)`,
        companyId,
      },
      {
        onSuccess: (data) => {
          onOpenChange(false);
          setNewName('');
          onSuccess?.(data.id);
        },
      }
    );
  };

  if (!template) return null;

  const reviewTypes = [
    { enabled: template.include_self_review, icon: UserCheck, label: 'Self Review' },
    { enabled: template.include_manager_review, icon: UserCog, label: 'Manager Review' },
    { enabled: template.include_peer_review, icon: Users, label: 'Peer Review' },
    { enabled: template.include_direct_report_review, icon: UsersRound, label: 'Direct Report Review' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Create Cycle from Template
          </DialogTitle>
          <DialogDescription>
            Create a new 360 feedback cycle based on "{template.template_name || template.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cycle-name">Cycle Name</Label>
            <Input
              id="cycle-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`${template.template_name || template.name} (Copy)`}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Template Configuration</Label>
            <div className="p-3 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {template.cycle_type || '360 Feedback'}
                </Badge>
                {template.min_peer_reviewers && (
                  <span className="text-xs text-muted-foreground">
                    Min {template.min_peer_reviewers} peer reviewers
                  </span>
                )}
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Includes: </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {reviewTypes
                    .filter((r) => r.enabled)
                    .map(({ icon: Icon, label }) => (
                      <Badge key={label} variant="secondary" className="text-xs">
                        <Icon className="h-3 w-3 mr-1" />
                        {label}
                      </Badge>
                    ))}
                  {reviewTypes.every((r) => !r.enabled) && (
                    <span className="text-xs text-muted-foreground">None configured</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {template.template_description && (
            <div className="text-sm text-muted-foreground">
              {template.template_description}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleClone} disabled={cloneCycle.isPending}>
            {cloneCycle.isPending ? 'Creating...' : 'Create Cycle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
