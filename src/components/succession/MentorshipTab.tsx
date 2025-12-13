import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Users, Calendar, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface MentorshipTabProps {
  companyId: string;
}

interface Program {
  id: string;
  name: string;
  description: string | null;
  program_type: string;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
}

interface Pairing {
  id: string;
  program_id: string;
  mentor_id: string;
  mentee_id: string;
  status: string;
  start_date: string;
  goals: string | null;
  mentor?: { id: string; full_name: string };
  mentee?: { id: string; full_name: string };
}

interface Employee {
  id: string;
  full_name: string;
}

export function MentorshipTab({ companyId }: MentorshipTabProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [pairingDialogOpen, setPairingDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");

  const [programForm, setProgramForm] = useState({
    name: '',
    description: '',
    program_type: 'succession',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    is_active: true
  });

  const [pairingForm, setPairingForm] = useState({
    program_id: '',
    mentor_id: '',
    mentee_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    goals: ''
  });

  useEffect(() => {
    if (companyId) loadData();
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadPrograms(), loadEmployees()]);
    setLoading(false);
  };

  const loadPrograms = async () => {
    const { data } = await (supabase.from('mentorship_programs') as any)
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setPrograms(data || []);
    
    // Load pairings for all programs
    if (data?.length) {
      const programIds = data.map((p: any) => p.id);
      const { data: pairingsData } = await (supabase.from('mentorship_pairings') as any)
        .select(`
          *,
          mentor:profiles!mentorship_pairings_mentor_id_fkey(id, full_name),
          mentee:profiles!mentorship_pairings_mentee_id_fkey(id, full_name)
        `)
        .in('program_id', programIds);
      setPairings(pairingsData || []);
    }
  };

  const loadEmployees = async () => {
    const { data } = await (supabase.from('profiles') as any)
      .select('id, full_name')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('full_name');
    setEmployees(data || []);
  };

  const handleProgramSubmit = async () => {
    if (!programForm.name) {
      toast.error('Please enter a program name');
      return;
    }

    const payload = {
      ...programForm,
      company_id: companyId,
      end_date: programForm.end_date || null
    };

    if (editingProgram) {
      const { error } = await (supabase.from('mentorship_programs') as any)
        .update(payload)
        .eq('id', editingProgram.id);
      if (error) toast.error('Failed to update program');
      else toast.success('Program updated');
    } else {
      const { error } = await (supabase.from('mentorship_programs') as any)
        .insert([payload]);
      if (error) toast.error('Failed to create program');
      else toast.success('Program created');
    }

    setProgramDialogOpen(false);
    resetProgramForm();
    loadPrograms();
  };

  const handlePairingSubmit = async () => {
    if (!pairingForm.program_id || !pairingForm.mentor_id || !pairingForm.mentee_id) {
      toast.error('Please fill all required fields');
      return;
    }

    if (pairingForm.mentor_id === pairingForm.mentee_id) {
      toast.error('Mentor and mentee must be different');
      return;
    }

    const { error } = await (supabase.from('mentorship_pairings') as any)
      .insert([{
        ...pairingForm,
        goals: pairingForm.goals || null
      }]);
    
    if (error) toast.error('Failed to create pairing');
    else toast.success('Pairing created');

    setPairingDialogOpen(false);
    resetPairingForm();
    loadPrograms();
  };

  const deleteProgram = async (id: string) => {
    const { error } = await (supabase.from('mentorship_programs') as any).delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Deleted'); loadPrograms(); }
  };

  const deletePairing = async (id: string) => {
    const { error } = await (supabase.from('mentorship_pairings') as any).delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Deleted'); loadPrograms(); }
  };

  const resetProgramForm = () => {
    setProgramForm({ name: '', description: '', program_type: 'succession', start_date: format(new Date(), 'yyyy-MM-dd'), end_date: '', is_active: true });
    setEditingProgram(null);
  };

  const resetPairingForm = () => {
    setPairingForm({ program_id: selectedProgramId, mentor_id: '', mentee_id: '', start_date: format(new Date(), 'yyyy-MM-dd'), goals: '' });
  };

  const openEditProgram = (p: Program) => {
    setEditingProgram(p);
    setProgramForm({
      name: p.name,
      description: p.description || '',
      program_type: p.program_type,
      start_date: p.start_date,
      end_date: p.end_date || '',
      is_active: p.is_active
    });
    setProgramDialogOpen(true);
  };

  const openAddPairing = (programId: string) => {
    setSelectedProgramId(programId);
    setPairingForm({ ...pairingForm, program_id: programId });
    setPairingDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      cancelled: 'bg-destructive/20 text-destructive'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  if (loading) return <div className="flex items-center justify-center p-8">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Mentorship Programs</h3>
        <Dialog open={programDialogOpen} onOpenChange={(open) => { setProgramDialogOpen(open); if (!open) resetProgramForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Program</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProgram ? 'Edit' : 'Create'} Program</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input value={programForm.name} onChange={(e) => setProgramForm({...programForm, name: e.target.value})} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={programForm.description} onChange={(e) => setProgramForm({...programForm, description: e.target.value})} />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={programForm.program_type} onValueChange={(v) => setProgramForm({...programForm, program_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="succession">Succession</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" value={programForm.start_date} onChange={(e) => setProgramForm({...programForm, start_date: e.target.value})} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" value={programForm.end_date} onChange={(e) => setProgramForm({...programForm, end_date: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={programForm.is_active} onChange={(e) => setProgramForm({...programForm, is_active: e.target.checked})} className="rounded" />
                <Label>Active</Label>
              </div>
              <Button onClick={handleProgramSubmit} className="w-full">{editingProgram ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pairing Dialog */}
      <Dialog open={pairingDialogOpen} onOpenChange={(open) => { setPairingDialogOpen(open); if (!open) resetPairingForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Mentor-Mentee Pairing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Program *</Label>
              <Select value={pairingForm.program_id} onValueChange={(v) => setPairingForm({...pairingForm, program_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                <SelectContent>
                  {programs.filter(p => p.is_active).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mentor *</Label>
              <Select value={pairingForm.mentor_id} onValueChange={(v) => setPairingForm({...pairingForm, mentor_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select mentor" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mentee *</Label>
              <Select value={pairingForm.mentee_id} onValueChange={(v) => setPairingForm({...pairingForm, mentee_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select mentee" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={pairingForm.start_date} onChange={(e) => setPairingForm({...pairingForm, start_date: e.target.value})} />
            </div>
            <div>
              <Label>Goals</Label>
              <Textarea value={pairingForm.goals} onChange={(e) => setPairingForm({...pairingForm, goals: e.target.value})} />
            </div>
            <Button onClick={handlePairingSubmit} className="w-full">Create Pairing</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Programs List */}
      {programs.length === 0 ? (
        <Card><CardContent className="p-6 text-center text-muted-foreground">No mentorship programs yet</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {programs.map(program => {
            const programPairings = pairings.filter(p => p.program_id === program.id);
            return (
              <Card key={program.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{program.name}</CardTitle>
                      <Badge variant="outline">{program.program_type}</Badge>
                      {!program.is_active && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => openAddPairing(program.id)}>
                        <UserPlus className="h-3 w-3 mr-1" /> Add Pairing
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openEditProgram(program)}><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteProgram(program.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  {program.description && <p className="text-sm text-muted-foreground mt-1">{program.description}</p>}
                </CardHeader>
                <CardContent>
                  {programPairings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No pairings yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mentor</TableHead>
                          <TableHead>Mentee</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {programPairings.map(pairing => (
                          <TableRow key={pairing.id}>
                            <TableCell className="font-medium">{pairing.mentor?.full_name}</TableCell>
                            <TableCell>{pairing.mentee?.full_name}</TableCell>
                            <TableCell><Badge className={getStatusColor(pairing.status)}>{pairing.status}</Badge></TableCell>
                            <TableCell>{pairing.start_date}</TableCell>
                            <TableCell>
                              <Button size="icon" variant="ghost" onClick={() => deletePairing(pairing.id)}><Trash2 className="h-4 w-4" /></Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
