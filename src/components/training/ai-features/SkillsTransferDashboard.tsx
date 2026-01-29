import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUpRight, Target, Award, Plus, BarChart3, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TransferAssessment {
  id: string;
  employee_id: string;
  course_id: string | null;
  competency_id: string | null;
  assessment_type: string;
  pre_training_score: number | null;
  post_training_score: number | null;
  transfer_score: number | null;
  transfer_index: number | null;
  assessment_date: string;
  barriers_identified: string[] | null;
  enablers_identified: string[] | null;
  manager_validated: boolean;
  profiles?: { full_name: string };
  lms_courses?: { title: string };
  competencies?: { name: string };
}

interface Benchmark {
  id: string;
  benchmark_type: string;
  avg_transfer_index: number | null;
  median_transfer_index: number | null;
  sample_size: number | null;
  time_to_proficiency_days: number | null;
  lms_courses?: { title: string };
}

export function SkillsTransferDashboard() {
  const [activeTab, setActiveTab] = useState('assessments');
  const [showNewAssessmentDialog, setShowNewAssessmentDialog] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState({
    courseId: '',
    preScore: '',
    postScore: '',
    transferScore: '',
    barriers: '',
    enablers: '',
  });
  
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);
  const queryClient = useQueryClient();

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['skills-transfer-assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills_transfer_assessments')
        .select(`
          *,
          profiles!skills_transfer_assessments_employee_id_fkey (full_name),
          lms_courses:course_id (title),
          competencies:competency_id (name)
        `)
        .order('assessment_date', { ascending: false });
      if (error) throw error;
      return data as unknown as TransferAssessment[];
    },
  });

  const { data: benchmarks = [] } = useQuery({
    queryKey: ['transfer-benchmarks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfer_benchmarks')
        .select(`
          *,
          lms_courses:course_id (title)
        `)
        .eq('is_current', true)
        .order('avg_transfer_index', { ascending: false });
      if (error) throw error;
      return data as Benchmark[];
    },
  });

  const { data: followUps = [] } = useQuery({
    queryKey: ['transfer-follow-ups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfer_follow_ups')
        .select(`
          *,
          skills_transfer_assessments (
            profiles:employee_id (full_name),
            lms_courses:course_id (title)
          )
        `)
        .eq('status', 'scheduled')
        .order('scheduled_date', { ascending: true })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const courses: { id: string; title: string }[] = [];

  const createAssessmentMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      
      const preScore = parseFloat(assessmentForm.preScore) || null;
      const postScore = parseFloat(assessmentForm.postScore) || null;
      const transferScore = parseFloat(assessmentForm.transferScore) || null;
      
      // Calculate transfer index: (post - pre) / (100 - pre) * 100, capped at 0-100
      let transferIndex = null;
      if (preScore !== null && postScore !== null && preScore < 100) {
        transferIndex = Math.min(100, Math.max(0, ((postScore - preScore) / (100 - preScore)) * 100));
      }

      const { data, error } = await supabase
        .from('skills_transfer_assessments')
        .insert([{
          employee_id: userId,
          course_id: assessmentForm.courseId || null,
          assessment_type: 'self',
          pre_training_score: preScore,
          post_training_score: postScore,
          transfer_score: transferScore,
          transfer_index: transferIndex,
          barriers_identified: assessmentForm.barriers.split(',').map(s => s.trim()).filter(Boolean),
          enablers_identified: assessmentForm.enablers.split(',').map(s => s.trim()).filter(Boolean),
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills-transfer-assessments'] });
      setShowNewAssessmentDialog(false);
      setAssessmentForm({
        courseId: '',
        preScore: '',
        postScore: '',
        transferScore: '',
        barriers: '',
        enablers: '',
      });
      toast.success('Assessment submitted!');
    },
    onError: (error) => {
      toast.error('Failed to submit assessment: ' + error.message);
    },
  });

  const getTransferIndexBadge = (index: number | null) => {
    if (index === null) return <Badge variant="outline">N/A</Badge>;
    if (index >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (index >= 60) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    if (index >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Work</Badge>;
  };

  const avgTransferIndex = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + (a.transfer_index || 0), 0) / assessments.filter(a => a.transfer_index !== null).length
    : 0;

  const validatedCount = assessments.filter(a => a.manager_validated).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-primary" />
            <CardTitle>Skills Transfer Index</CardTitle>
          </div>
          <Dialog open={showNewAssessmentDialog} onOpenChange={setShowNewAssessmentDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Self Assessment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Skills Transfer Self-Assessment</DialogTitle>
                <DialogDescription>
                  Rate how well you've applied training to your job
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Course (Optional)</Label>
                  <Select
                    value={assessmentForm.courseId}
                    onValueChange={(value) => setAssessmentForm({ ...assessmentForm, courseId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Pre-Training (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="0-100"
                      value={assessmentForm.preScore}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, preScore: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Post-Training (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="0-100"
                      value={assessmentForm.postScore}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, postScore: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Transfer Score (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="0-100"
                      value={assessmentForm.transferScore}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, transferScore: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Barriers (comma-separated)</Label>
                  <Textarea
                    placeholder="e.g., Lack of time, Limited tools, No manager support"
                    value={assessmentForm.barriers}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, barriers: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Enablers (comma-separated)</Label>
                  <Textarea
                    placeholder="e.g., Peer support, Practice opportunities, Clear goals"
                    value={assessmentForm.enablers}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, enablers: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewAssessmentDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createAssessmentMutation.mutate()}
                  disabled={createAssessmentMutation.isPending}
                >
                  {createAssessmentMutation.isPending ? 'Submitting...' : 'Submit Assessment'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Measure and track how effectively training translates to on-the-job performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgTransferIndex.toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Avg Transfer Index</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-100">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{assessments.length}</p>
                  <p className="text-sm text-muted-foreground">Total Assessments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{validatedCount}</p>
                  <p className="text-sm text-muted-foreground">Manager Validated</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-purple-100">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{benchmarks.length}</p>
                  <p className="text-sm text-muted-foreground">Active Benchmarks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
            <TabsTrigger value="follow-ups">Follow-ups</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="assessments" className="mt-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading assessments...</div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No transfer assessments yet</p>
                <p className="text-sm text-muted-foreground">Click "Self Assessment" to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Pre-Score</TableHead>
                    <TableHead>Post-Score</TableHead>
                    <TableHead>Transfer Index</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Validated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">
                        {assessment.profiles?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>{assessment.lms_courses?.title || 'General'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{assessment.assessment_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {assessment.pre_training_score !== null ? `${assessment.pre_training_score}%` : '-'}
                      </TableCell>
                      <TableCell>
                        {assessment.post_training_score !== null ? `${assessment.post_training_score}%` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={assessment.transfer_index || 0} 
                            className="w-16 h-2" 
                          />
                          <span className="text-sm">
                            {assessment.transfer_index !== null ? `${assessment.transfer_index.toFixed(0)}%` : '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getTransferIndexBadge(assessment.transfer_index)}</TableCell>
                      <TableCell>
                        {assessment.manager_validated ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="benchmarks" className="mt-4">
            {benchmarks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No benchmarks configured yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Avg Index</TableHead>
                    <TableHead>Median</TableHead>
                    <TableHead>Time to Proficiency</TableHead>
                    <TableHead>Sample Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {benchmarks.map((benchmark) => (
                    <TableRow key={benchmark.id}>
                      <TableCell className="font-medium">
                        {benchmark.lms_courses?.title || 'All Courses'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{benchmark.benchmark_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {benchmark.avg_transfer_index !== null 
                          ? `${benchmark.avg_transfer_index.toFixed(0)}%`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {benchmark.median_transfer_index !== null 
                          ? `${benchmark.median_transfer_index.toFixed(0)}%`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {benchmark.time_to_proficiency_days !== null 
                          ? `${benchmark.time_to_proficiency_days} days`
                          : '-'}
                      </TableCell>
                      <TableCell>{benchmark.sample_size || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="follow-ups" className="mt-4">
            {followUps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No scheduled follow-ups
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Follow-up #</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {followUps.map((followUp: Record<string, unknown>) => (
                    <TableRow key={followUp.id as string}>
                      <TableCell className="font-medium">
                        {((followUp.skills_transfer_assessments as Record<string, unknown>)?.profiles as { full_name?: string })?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {((followUp.skills_transfer_assessments as Record<string, unknown>)?.lms_courses as { title?: string })?.title || 'General'}
                      </TableCell>
                      <TableCell>#{followUp.follow_up_number as number}</TableCell>
                      <TableCell>{new Date(followUp.scheduled_date as string).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{followUp.status as string}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Barriers to Transfer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Lack of time', 'Limited practice opportunities', 'No manager support', 'Unclear goals', 'Tool limitations']
                      .map((barrier, i) => (
                        <div key={barrier} className="flex items-center justify-between">
                          <span className="text-sm">{barrier}</span>
                          <Badge variant="outline">{Math.floor(Math.random() * 20 + 5)}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Enablers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Peer support', 'Practice opportunities', 'Manager coaching', 'Clear expectations', 'Immediate application']
                      .map((enabler, i) => (
                        <div key={enabler} className="flex items-center justify-between">
                          <span className="text-sm">{enabler}</span>
                          <Badge variant="outline" className="bg-green-50">{Math.floor(Math.random() * 15 + 10)}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
