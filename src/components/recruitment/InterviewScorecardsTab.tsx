import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface InterviewScorecardsTabProps {
  companyId: string;
}

export function InterviewScorecardsTab({ companyId }: InterviewScorecardsTabProps) {
  const [scorecards, setScorecards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScorecard, setEditingScorecard] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [criteriaForm, setCriteriaForm] = useState({ name: '', description: '', weight: 1, max_score: 5 });

  useEffect(() => {
    if (companyId) fetchScorecards();
  }, [companyId]);

  const fetchScorecards = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('interview_scorecards')
      .select('*, interview_scorecard_criteria(*)')
      .eq('company_id', companyId)
      .order('name');
    setScorecards(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (editingScorecard) {
      const { error } = await supabase
        .from('interview_scorecards')
        .update({ name: formData.name, description: formData.description })
        .eq('id', editingScorecard.id);
      if (error) toast.error('Failed to update scorecard');
      else toast.success('Scorecard updated');
    } else {
      const { error } = await supabase
        .from('interview_scorecards')
        .insert({ company_id: companyId, name: formData.name, description: formData.description });
      if (error) toast.error('Failed to create scorecard');
      else toast.success('Scorecard created');
    }
    setDialogOpen(false);
    setEditingScorecard(null);
    setFormData({ name: '', description: '' });
    fetchScorecards();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this scorecard?')) return;
    const { error } = await supabase.from('interview_scorecards').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else {
      toast.success('Scorecard deleted');
      fetchScorecards();
    }
  };

  const handleAddCriteria = async (scorecardId: string) => {
    if (!criteriaForm.name.trim()) return;
    const { error } = await supabase
      .from('interview_scorecard_criteria')
      .insert({ scorecard_id: scorecardId, ...criteriaForm, display_order: criteria.length });
    if (error) toast.error('Failed to add criteria');
    else {
      toast.success('Criteria added');
      setCriteriaForm({ name: '', description: '', weight: 1, max_score: 5 });
      fetchScorecards();
    }
  };

  const handleDeleteCriteria = async (id: string) => {
    const { error } = await supabase.from('interview_scorecard_criteria').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else {
      toast.success('Criteria deleted');
      fetchScorecards();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Interview Scorecards</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingScorecard(null); setFormData({ name: '', description: '' }); }}>
              <Plus className="mr-2 h-4 w-4" /> New Scorecard
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingScorecard ? 'Edit' : 'New'} Scorecard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <Button onClick={handleSave} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Criteria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scorecards.map((sc) => (
              <>
                <TableRow key={sc.id}>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === sc.id ? null : sc.id)}>
                      {expandedId === sc.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{sc.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{sc.description}</TableCell>
                  <TableCell>{sc.interview_scorecard_criteria?.length || 0}</TableCell>
                  <TableCell>
                    <Badge variant={sc.is_active ? 'default' : 'secondary'}>
                      {sc.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditingScorecard(sc);
                        setFormData({ name: sc.name, description: sc.description || '' });
                        setDialogOpen(true);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(sc.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedId === sc.id && (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-muted/50 p-4">
                      <div className="space-y-4">
                        <h4 className="font-medium">Evaluation Criteria</h4>
                        <div className="flex gap-2">
                          <Input placeholder="Criteria name" value={criteriaForm.name} onChange={(e) => setCriteriaForm({ ...criteriaForm, name: e.target.value })} />
                          <Input type="number" placeholder="Weight" className="w-20" value={criteriaForm.weight} onChange={(e) => setCriteriaForm({ ...criteriaForm, weight: parseInt(e.target.value) })} />
                          <Input type="number" placeholder="Max" className="w-20" value={criteriaForm.max_score} onChange={(e) => setCriteriaForm({ ...criteriaForm, max_score: parseInt(e.target.value) })} />
                          <Button onClick={() => handleAddCriteria(sc.id)}>Add</Button>
                        </div>
                        <div className="space-y-2">
                          {sc.interview_scorecard_criteria?.map((c: any) => (
                            <div key={c.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <span className="font-medium">{c.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">Weight: {c.weight}, Max: {c.max_score}</span>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteCriteria(c.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
