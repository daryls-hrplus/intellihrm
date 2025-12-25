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
import { Plus, Edit, Trash2, ClipboardCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDateForDisplay } from '@/utils/dateUtils';

interface AssessmentsTabProps {
  companyId: string;
}

const ASSESSMENT_TYPES = [
  { value: 'skills', label: 'Skills Test' },
  { value: 'personality', label: 'Personality Assessment' },
  { value: 'cognitive', label: 'Cognitive Ability' },
  { value: 'technical', label: 'Technical Test' },
  { value: 'coding', label: 'Coding Challenge' },
];

export function AssessmentsTab({ companyId }: AssessmentsTabProps) {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assessment_type: '',
    duration_minutes: '',
    passing_score: '',
    instructions: ''
  });

  useEffect(() => {
    if (companyId) {
      fetchAssessments();
      fetchResults();
    }
  }, [companyId]);

  const fetchAssessments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('candidate_assessments')
      .select('*')
      .eq('company_id', companyId)
      .order('name');
    setAssessments(data || []);
    setLoading(false);
  };

  const fetchResults = async () => {
    const { data } = await supabase
      .from('assessment_results')
      .select('*, candidate_assessments(name, assessment_type), candidates(first_name, last_name), applications(job_requisitions(title))')
      .order('created_at', { ascending: false })
      .limit(50);
    setResults(data || []);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.assessment_type) {
      toast.error('Name and type are required');
      return;
    }

    const payload = {
      company_id: companyId,
      name: formData.name,
      description: formData.description || null,
      assessment_type: formData.assessment_type,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
      passing_score: formData.passing_score ? parseInt(formData.passing_score) : null,
      instructions: formData.instructions || null
    };

    if (editingAssessment) {
      const { error } = await supabase.from('candidate_assessments').update(payload).eq('id', editingAssessment.id);
      if (error) toast.error('Failed to update assessment');
      else toast.success('Assessment updated');
    } else {
      const { error } = await supabase.from('candidate_assessments').insert(payload);
      if (error) toast.error('Failed to create assessment');
      else toast.success('Assessment created');
    }
    setDialogOpen(false);
    setEditingAssessment(null);
    setFormData({ name: '', description: '', assessment_type: '', duration_minutes: '', passing_score: '', instructions: '' });
    fetchAssessments();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assessment?')) return;
    const { error } = await supabase.from('candidate_assessments').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else {
      toast.success('Assessment deleted');
      fetchAssessments();
    }
  };

  const stats = {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => r.passed === false).length,
    pending: results.filter(r => r.passed === null && !r.completed_at).length
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{assessments.length}</div>
                <div className="text-sm text-muted-foreground">Assessments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.passed}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{stats.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assessments">
        <TabsList>
          <TabsTrigger value="assessments">Assessment Templates</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Assessment Templates</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingAssessment(null); setFormData({ name: '', description: '', assessment_type: '', duration_minutes: '', passing_score: '', instructions: '' }); }}>
                    <Plus className="mr-2 h-4 w-4" /> New Assessment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingAssessment ? 'Edit' : 'New'} Assessment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={formData.assessment_type} onValueChange={(v) => setFormData({ ...formData, assessment_type: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSESSMENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Duration (minutes)</Label>
                        <Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} />
                      </div>
                      <div>
                        <Label>Passing Score (%)</Label>
                        <Input type="number" value={formData.passing_score} onChange={(e) => setFormData({ ...formData, passing_score: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label>Instructions</Label>
                      <Textarea value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} />
                    </div>
                    <Button onClick={handleSave} className="w-full">Save Assessment</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Passing Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">{assessment.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ASSESSMENT_TYPES.find(t => t.value === assessment.assessment_type)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{assessment.duration_minutes ? `${assessment.duration_minutes} min` : '-'}</TableCell>
                      <TableCell>{assessment.passing_score ? `${assessment.passing_score}%` : '-'}</TableCell>
                      <TableCell>
                        <Badge variant={assessment.is_active ? 'default' : 'secondary'}>
                          {assessment.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setEditingAssessment(assessment);
                            setFormData({
                              name: assessment.name,
                              description: assessment.description || '',
                              assessment_type: assessment.assessment_type,
                              duration_minutes: assessment.duration_minutes?.toString() || '',
                              passing_score: assessment.passing_score?.toString() || '',
                              instructions: assessment.instructions || ''
                            });
                            setDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(assessment.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {result.candidates?.first_name} {result.candidates?.last_name}
                      </TableCell>
                      <TableCell>
                        <div>{result.candidate_assessments?.name}</div>
                        <Badge variant="outline" className="mt-1">
                          {ASSESSMENT_TYPES.find(t => t.value === result.candidate_assessments?.assessment_type)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {result.score !== null ? `${result.score}/${result.max_score || 100}` : '-'}
                      </TableCell>
                      <TableCell>
                        {result.passed === null ? (
                          <Badge variant="outline">Pending</Badge>
                        ) : result.passed ? (
                          <Badge variant="default">Passed</Badge>
                        ) : (
                          <Badge variant="destructive">Failed</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {result.completed_at ? formatDateForDisplay(result.completed_at) : 'In Progress'}
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
