import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Gift, Users, DollarSign } from 'lucide-react';
import { formatDateForDisplay } from '@/utils/dateUtils';

interface ReferralProgramTabProps {
  companyId: string;
}

export function ReferralProgramTab({ companyId }: ReferralProgramTabProps) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [programForm, setProgramForm] = useState({
    name: '',
    description: '',
    reward_amount: '',
    reward_currency: 'USD',
    reward_type: 'cash',
    payout_timing: 'after_probation'
  });
  const [referralForm, setReferralForm] = useState({
    program_id: '',
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    relationship: '',
    notes: ''
  });

  useEffect(() => {
    if (companyId) {
      fetchPrograms();
      fetchReferrals();
    }
  }, [companyId]);

  const fetchPrograms = async () => {
    const { data } = await supabase
      .from('referral_programs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setPrograms(data || []);
  };

  const fetchReferrals = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('employee_referrals')
      .select('*, referral_programs(name), profiles:referrer_id(full_name)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setReferrals(data || []);
    setLoading(false);
  };

  const handleSaveProgram = async () => {
    if (!programForm.name.trim()) {
      toast.error('Name is required');
      return;
    }

    const payload = {
      company_id: companyId,
      ...programForm,
      reward_amount: programForm.reward_amount ? parseFloat(programForm.reward_amount) : null
    };

    if (editingProgram) {
      const { error } = await supabase.from('referral_programs').update(payload).eq('id', editingProgram.id);
      if (error) toast.error('Failed to update program');
      else toast.success('Program updated');
    } else {
      const { error } = await supabase.from('referral_programs').insert(payload);
      if (error) toast.error('Failed to create program');
      else toast.success('Program created');
    }
    setProgramDialogOpen(false);
    setEditingProgram(null);
    setProgramForm({ name: '', description: '', reward_amount: '', reward_currency: 'USD', reward_type: 'cash', payout_timing: 'after_probation' });
    fetchPrograms();
  };

  const handleSubmitReferral = async () => {
    if (!referralForm.candidate_name.trim() || !referralForm.candidate_email.trim()) {
      toast.error('Candidate name and email are required');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('employee_referrals')
      .insert({
        company_id: companyId,
        referrer_id: user?.id,
        ...referralForm,
        program_id: referralForm.program_id || null
      });
    if (error) toast.error('Failed to submit referral');
    else {
      toast.success('Referral submitted');
      setReferralDialogOpen(false);
      setReferralForm({ program_id: '', candidate_name: '', candidate_email: '', candidate_phone: '', relationship: '', notes: '' });
      fetchReferrals();
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('employee_referrals').update({ status }).eq('id', id);
    if (error) toast.error('Failed to update status');
    else {
      toast.success('Status updated');
      fetchReferrals();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hired': case 'reward_paid': return 'default';
      case 'interviewed': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const stats = {
    totalReferrals: referrals.length,
    hired: referrals.filter(r => r.status === 'hired' || r.status === 'reward_paid').length,
    pending: referrals.filter(r => ['submitted', 'reviewing', 'interviewed'].includes(r.status)).length,
    totalRewards: referrals.filter(r => r.status === 'reward_paid').reduce((acc, r) => acc + (r.reward_amount || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.totalReferrals}</div>
                <div className="text-sm text-muted-foreground">Total Referrals</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.hired}</div>
                <div className="text-sm text-muted-foreground">Hired</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">${stats.totalRewards.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Rewards Paid</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="referrals">
        <TabsList>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Employee Referrals</CardTitle>
              <Dialog open={referralDialogOpen} onOpenChange={setReferralDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Submit Referral</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit Referral</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Referral Program (optional)</Label>
                      <Select value={referralForm.program_id} onValueChange={(v) => setReferralForm({ ...referralForm, program_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select program" />
                        </SelectTrigger>
                        <SelectContent>
                          {programs.filter(p => p.is_active).map((prog) => (
                            <SelectItem key={prog.id} value={prog.id}>{prog.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Candidate Name *</Label>
                      <Input value={referralForm.candidate_name} onChange={(e) => setReferralForm({ ...referralForm, candidate_name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Candidate Email *</Label>
                      <Input type="email" value={referralForm.candidate_email} onChange={(e) => setReferralForm({ ...referralForm, candidate_email: e.target.value })} />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={referralForm.candidate_phone} onChange={(e) => setReferralForm({ ...referralForm, candidate_phone: e.target.value })} />
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <Input placeholder="How do you know them?" value={referralForm.relationship} onChange={(e) => setReferralForm({ ...referralForm, relationship: e.target.value })} />
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea value={referralForm.notes} onChange={(e) => setReferralForm({ ...referralForm, notes: e.target.value })} />
                    </div>
                    <Button onClick={handleSubmitReferral} className="w-full">Submit Referral</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Referred By</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((ref) => (
                    <TableRow key={ref.id}>
                      <TableCell>
                        <div className="font-medium">{ref.candidate_name}</div>
                        <div className="text-sm text-muted-foreground">{ref.candidate_email}</div>
                      </TableCell>
                      <TableCell>{ref.profiles?.full_name}</TableCell>
                      <TableCell>{ref.referral_programs?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(ref.status)}>{ref.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDateForDisplay(ref.created_at, 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Select value={ref.status} onValueChange={(v) => handleUpdateStatus(ref.id, v)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="reviewing">Reviewing</SelectItem>
                            <SelectItem value="interviewed">Interviewed</SelectItem>
                            <SelectItem value="hired">Hired</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="reward_pending">Reward Pending</SelectItem>
                            <SelectItem value="reward_paid">Reward Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Referral Programs</CardTitle>
              <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingProgram(null); setProgramForm({ name: '', description: '', reward_amount: '', reward_currency: 'USD', reward_type: 'cash', payout_timing: 'after_probation' }); }}>
                    <Plus className="mr-2 h-4 w-4" /> New Program
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingProgram ? 'Edit' : 'New'} Referral Program</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={programForm.name} onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={programForm.description} onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Reward Amount</Label>
                        <Input type="number" value={programForm.reward_amount} onChange={(e) => setProgramForm({ ...programForm, reward_amount: e.target.value })} />
                      </div>
                      <div>
                        <Label>Currency</Label>
                        <Select value={programForm.reward_currency} onValueChange={(v) => setProgramForm({ ...programForm, reward_currency: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Reward Type</Label>
                        <Select value={programForm.reward_type} onValueChange={(v) => setProgramForm({ ...programForm, reward_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="gift_card">Gift Card</SelectItem>
                            <SelectItem value="pto">PTO</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Payout Timing</Label>
                        <Select value={programForm.payout_timing} onValueChange={(v) => setProgramForm({ ...programForm, payout_timing: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="after_30_days">After 30 Days</SelectItem>
                            <SelectItem value="after_probation">After Probation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleSaveProgram} className="w-full">Save Program</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Payout</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((prog) => (
                    <TableRow key={prog.id}>
                      <TableCell className="font-medium">{prog.name}</TableCell>
                      <TableCell>{prog.reward_amount ? `${prog.reward_currency} ${prog.reward_amount}` : '-'}</TableCell>
                      <TableCell className="capitalize">{prog.reward_type}</TableCell>
                      <TableCell className="capitalize">{prog.payout_timing?.replace(/_/g, ' ')}</TableCell>
                      <TableCell>
                        <Badge variant={prog.is_active ? 'default' : 'secondary'}>
                          {prog.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingProgram(prog);
                          setProgramForm({
                            name: prog.name,
                            description: prog.description || '',
                            reward_amount: prog.reward_amount?.toString() || '',
                            reward_currency: prog.reward_currency || 'USD',
                            reward_type: prog.reward_type || 'cash',
                            payout_timing: prog.payout_timing || 'after_probation'
                          });
                          setProgramDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
