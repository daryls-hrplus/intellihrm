import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Settings, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShiftApprovalSetupProps {
  companyId: string | null;
}

interface Shift {
  id: string;
  name: string;
}

interface ApprovalLevel {
  id: string;
  shift_id: string;
  approval_level: number;
  approver_id: string;
  is_active: boolean;
  approver?: {
    id: string;
    first_name: string;
    first_last_name: string;
  };
}

interface Approver {
  id: string;
  first_name: string;
  first_last_name: string;
}

export function ShiftApprovalSetup({ companyId }: ShiftApprovalSetupProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [approvalLevels, setApprovalLevels] = useState<ApprovalLevel[]>([]);
  const [availableApprovers, setAvailableApprovers] = useState<Approver[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newLevel, setNewLevel] = useState<number>(1);
  const [newApproverId, setNewApproverId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (companyId) {
      loadShifts();
      loadApprovers();
    }
  }, [companyId]);

  useEffect(() => {
    if (selectedShift) {
      loadApprovalLevels(selectedShift);
    }
  }, [selectedShift]);

  const loadShifts = async () => {
    if (!companyId) return;

    const { data, error } = await supabase
      .from('shifts')
      .select('id, name')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error loading shifts:', error);
      return;
    }

    setShifts(data || []);
    setLoading(false);
  };

  const loadApprovers = async () => {
    if (!companyId) return;

    // Get users who can be approvers (managers, HR, etc.)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, first_last_name')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('first_last_name');

    if (error) {
      console.error('Error loading approvers:', error);
      return;
    }

    setAvailableApprovers(data || []);
  };

  const loadApprovalLevels = async (shiftId: string) => {
    const { data, error } = await supabase
      .from('shift_approval_levels')
      .select(`
        id,
        shift_id,
        approval_level,
        approver_id,
        is_active,
        approver:approver_id (id, first_name, first_last_name)
      `)
      .eq('shift_id', shiftId)
      .order('approval_level');

    if (error) {
      console.error('Error loading approval levels:', error);
      return;
    }

    setApprovalLevels((data as unknown as ApprovalLevel[]) || []);
  };

  const handleAddLevel = async () => {
    if (!selectedShift || !newApproverId || !companyId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('shift_approval_levels')
        .insert({
          shift_id: selectedShift,
          company_id: companyId,
          approval_level: newLevel,
          approver_id: newApproverId,
          is_active: true
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('This approval level already exists for this shift');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Approval level added successfully');
      setAddDialogOpen(false);
      setNewApproverId('');
      loadApprovalLevels(selectedShift);
    } catch (error: any) {
      console.error('Error adding approval level:', error);
      toast.error(error.message || 'Failed to add approval level');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (levelId: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('shift_approval_levels')
      .update({ is_active: !currentActive })
      .eq('id', levelId);

    if (error) {
      console.error('Error toggling level:', error);
      toast.error('Failed to update approval level');
      return;
    }

    loadApprovalLevels(selectedShift!);
  };

  const handleDeleteLevel = async (levelId: string) => {
    if (!confirm('Are you sure you want to delete this approval level?')) return;

    const { error } = await supabase
      .from('shift_approval_levels')
      .delete()
      .eq('id', levelId);

    if (error) {
      console.error('Error deleting level:', error);
      toast.error('Failed to delete approval level');
      return;
    }

    toast.success('Approval level deleted');
    loadApprovalLevels(selectedShift!);
  };

  const getNextAvailableLevel = () => {
    const existingLevels = approvalLevels.map(l => l.approval_level);
    for (let i = 1; i <= 3; i++) {
      if (!existingLevels.includes(i)) return i;
    }
    return null;
  };

  const openAddDialog = () => {
    const nextLevel = getNextAvailableLevel();
    if (nextLevel === null) {
      toast.error('Maximum 3 approval levels allowed');
      return;
    }
    setNewLevel(nextLevel);
    setNewApproverId('');
    setAddDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            Loading shifts...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Shift Approval Workflow Setup
          </CardTitle>
          <CardDescription>
            Configure multi-level approval workflows for each shift. Timesheets will flow through each level before reaching payroll.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedShift || ''} onValueChange={setSelectedShift}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a shift to configure..." />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedShift && approvalLevels.length < 3 && (
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Approval Level
              </Button>
            )}
          </div>

          {selectedShift && (
            <>
              {approvalLevels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No approval levels configured for this shift.</p>
                  <p className="text-sm">By default, timekeeper approval goes directly to payroll.</p>
                  <Button variant="outline" className="mt-4" onClick={openAddDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Approver
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Approver</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvalLevels.map((level) => (
                      <TableRow key={level.id}>
                        <TableCell>
                          <Badge variant="outline">Level {level.approval_level}</Badge>
                        </TableCell>
                        <TableCell>
                          {level.approver?.first_name} {level.approver?.first_last_name}
                        </TableCell>
                        <TableCell>
                          {level.is_active ? (
                            <Badge className="bg-green-500">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={level.is_active}
                            onCheckedChange={() => handleToggleActive(level.id, level.is_active)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLevel(level.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {approvalLevels.length > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Workflow Preview</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">Timekeeper</Badge>
                    <span>→</span>
                    {approvalLevels
                      .filter(l => l.is_active)
                      .sort((a, b) => a.approval_level - b.approval_level)
                      .map((level, idx, arr) => (
                        <React.Fragment key={level.id}>
                          <Badge>
                            L{level.approval_level}: {level.approver?.first_name} {level.approver?.first_last_name?.charAt(0)}.
                          </Badge>
                          {idx < arr.length - 1 && <span>→</span>}
                        </React.Fragment>
                      ))}
                    <span>→</span>
                    <Badge className="bg-green-500">Payroll</Badge>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Approval Level Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Approval Level</DialogTitle>
            <DialogDescription>
              Select an approver for Level {newLevel}. This person will review and approve timesheets before they proceed to the next level.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Approval Level</label>
              <div className="mt-1">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Level {newLevel}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Select Approver</label>
              <Select value={newApproverId} onValueChange={setNewApproverId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose an approver..." />
                </SelectTrigger>
                <SelectContent>
                  {availableApprovers.map((approver) => (
                    <SelectItem key={approver.id} value={approver.id}>
                      {approver.first_name} {approver.first_last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLevel} disabled={!newApproverId || saving}>
              {saving ? 'Adding...' : 'Add Approver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
