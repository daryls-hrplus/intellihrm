import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Users, Edit, Trash2, UserPlus, Loader2, FileCheck } from 'lucide-react';
import { TalentPool, TalentPoolMember, useSuccession } from '@/hooks/useSuccession';
import { supabase } from '@/integrations/supabase/client';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { TalentPoolNominationEvidence } from '@/components/talent/pool/TalentPoolNominationEvidence';
import { HRReviewConfidenceIndicators } from '@/components/talent/pool/HRReviewConfidenceIndicators';

interface TalentPoolsTabProps {
  companyId: string;
}

const poolTypeColors: Record<string, string> = {
  high_potential: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  leadership: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  technical: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  emerging: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  critical_role: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function TalentPoolsTab({ companyId }: TalentPoolsTabProps) {
  const {
    loading,
    fetchTalentPools,
    createTalentPool,
    updateTalentPool,
    deleteTalentPool,
    fetchTalentPoolMembers,
    addTalentPoolMember,
    removeTalentPoolMember,
  } = useSuccession(companyId);

  const [pools, setPools] = useState<TalentPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<TalentPool | null>(null);
  const [members, setMembers] = useState<TalentPoolMember[]>([]);
  const [showPoolDialog, setShowPoolDialog] = useState(false);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [editingPool, setEditingPool] = useState<TalentPool | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    pool_type: 'high_potential',
  });
  const [memberForm, setMemberForm] = useState({
    employee_id: '',
    reason: '',
  });

  useEffect(() => {
    loadPools();
    loadEmployees();
  }, [companyId]);

  const loadPools = async () => {
    const data = await fetchTalentPools();
    setPools(data);
  };

  const loadEmployees = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('company_id', companyId)
      .order('full_name');
    setEmployees(data || []);
  };

  const loadMembers = async (poolId: string) => {
    setLoadingMembers(true);
    const data = await fetchTalentPoolMembers(poolId);
    setMembers(data);
    setLoadingMembers(false);
  };

  const handleSelectPool = async (pool: TalentPool) => {
    setSelectedPool(pool);
    await loadMembers(pool.id);
  };

  const handleCreatePool = async () => {
    const result = await createTalentPool(formData);
    if (result) {
      loadPools();
      setShowPoolDialog(false);
      resetForm();
    }
  };

  const handleUpdatePool = async () => {
    if (!editingPool) return;
    const result = await updateTalentPool(editingPool.id, formData);
    if (result) {
      loadPools();
      setShowPoolDialog(false);
      setEditingPool(null);
      resetForm();
    }
  };

  const handleDeletePool = async (poolId: string) => {
    if (!confirm('Are you sure you want to delete this talent pool?')) return;
    const result = await deleteTalentPool(poolId);
    if (result) {
      loadPools();
      if (selectedPool?.id === poolId) {
        setSelectedPool(null);
        setMembers([]);
      }
    }
  };

  const handleAddMember = async () => {
    if (!selectedPool) return;
    const result = await addTalentPoolMember(selectedPool.id, memberForm.employee_id, memberForm.reason);
    if (result) {
      loadMembers(selectedPool.id);
      loadPools();
      setShowMemberDialog(false);
      setMemberForm({ employee_id: '', reason: '' });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member from the talent pool?')) return;
    const result = await removeTalentPoolMember(memberId);
    if (result && selectedPool) {
      loadMembers(selectedPool.id);
      loadPools();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', description: '', pool_type: 'high_potential' });
  };

  const openEditDialog = (pool: TalentPool) => {
    setEditingPool(pool);
    setFormData({
      name: pool.name,
      code: pool.code,
      description: pool.description || '',
      pool_type: pool.pool_type,
    });
    setShowPoolDialog(true);
  };

  const existingMemberIds = members.map(m => m.employee_id);
  const availableEmployees = employees.filter(e => !existingMemberIds.includes(e.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pools List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Talent Pools</h3>
          <Button size="sm" onClick={() => { resetForm(); setEditingPool(null); setShowPoolDialog(true); }}>
            <Plus className="h-4 w-4 mr-1" />
            New Pool
          </Button>
        </div>

        <div className="space-y-2">
          {pools.map((pool) => (
            <Card
              key={pool.id}
              className={`cursor-pointer transition-colors ${
                selectedPool?.id === pool.id ? 'border-primary' : 'hover:border-primary/50'
              }`}
              onClick={() => handleSelectPool(pool)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{pool.name}</div>
                    <div className="text-sm text-muted-foreground">{pool.code}</div>
                  </div>
                  <Badge className={poolTypeColors[pool.pool_type] || 'bg-gray-100'}>
                    {pool.pool_type.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {pool.member_count || 0} members
                </div>
                <div className="flex gap-1 mt-2">
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openEditDialog(pool); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeletePool(pool.id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pools.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No talent pools yet. Create one to get started.
            </div>
          )}
        </div>
      </div>

      {/* Pool Members */}
      <div className="lg:col-span-2">
        {selectedPool ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{selectedPool.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedPool.description}</p>
              </div>
              <Button onClick={() => setShowMemberDialog(true)} disabled={availableEmployees.length === 0}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </CardHeader>
            <CardContent>
              {loadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No members in this pool yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Hire Date</TableHead>
                      <TableHead>Added to Pool</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => {
                      const primaryPosition = member.employee?.employee_positions?.find(p => p.is_primary) 
                        || member.employee?.employee_positions?.[0];
                      const hireDate = member.employee?.employee_positions
                        ?.reduce((earliest, pos) => {
                          if (!earliest) return pos.start_date;
                          return pos.start_date < earliest ? pos.start_date : earliest;
                        }, null as string | null);
                      
                      return (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.employee?.avatar_url || undefined} />
                                <AvatarFallback>
                                  {member.employee?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{member.employee?.full_name}</div>
                                <div className="text-sm text-muted-foreground">{member.employee?.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {primaryPosition?.position?.title || (
                              <span className="text-muted-foreground italic">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {member.employee?.department?.name || (
                              <span className="text-muted-foreground italic">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {hireDate ? formatDateForDisplay(hireDate) : (
                              <span className="text-muted-foreground italic">-</span>
                            )}
                          </TableCell>
                          <TableCell>{formatDateForDisplay(member.start_date)}</TableCell>
                          <TableCell>{member.reason || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => handleRemoveMember(member.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a talent pool to view members</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pool Dialog */}
      <Dialog open={showPoolDialog} onOpenChange={setShowPoolDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPool ? 'Edit Talent Pool' : 'Create Talent Pool'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="High Potential Leaders"
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="HIPO-LEAD"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pool Type</Label>
              <Select
                value={formData.pool_type}
                onValueChange={(value) => setFormData({ ...formData, pool_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high_potential">High Potential</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="emerging">Emerging Talent</SelectItem>
                  <SelectItem value="critical_role">Critical Role</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description of this talent pool..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPoolDialog(false)}>Cancel</Button>
              <Button onClick={editingPool ? handleUpdatePool : handleCreatePool} disabled={!formData.name || !formData.code}>
                {editingPool ? 'Update' : 'Create'} Pool
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog with Evidence */}
      <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Add Member to {selectedPool?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Select
                value={memberForm.employee_id}
                onValueChange={(value) => setMemberForm({ ...memberForm, employee_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Evidence Panel - shown when employee is selected */}
            {memberForm.employee_id && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-sm">Talent Evidence</h4>
                <TalentPoolNominationEvidence 
                  employeeId={memberForm.employee_id}
                  poolCriteria={selectedPool?.pool_type ? {
                    minimumScore: 3.5,
                    minimumConfidence: 0.7
                  } : undefined}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Reason for Inclusion</Label>
              <Textarea
                value={memberForm.reason}
                onChange={(e) => setMemberForm({ ...memberForm, reason: e.target.value })}
                placeholder="Why is this employee being added to this pool?"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMemberDialog(false)}>Cancel</Button>
              <Button onClick={handleAddMember} disabled={!memberForm.employee_id}>
                Add Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
