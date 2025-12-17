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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Users, Calendar, MessageSquare, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { formatDateForDisplay } from "@/utils/dateUtils";

interface InterviewPanelsTabProps {
  companyId: string;
}

const INTERVIEW_TYPES = [
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'technical', label: 'Technical Interview' },
  { value: 'behavioral', label: 'Behavioral Interview' },
  { value: 'culture_fit', label: 'Culture Fit' },
  { value: 'final', label: 'Final Interview' },
];

export function InterviewPanelsTab({ companyId }: InterviewPanelsTabProps) {
  const [panels, setPanels] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [scorecards, setScorecards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<any>(null);
  const [formData, setFormData] = useState({
    application_id: '',
    interview_type: '',
    scheduled_at: '',
    duration_minutes: '60',
    location: '',
    meeting_link: '',
    scorecard_id: '',
    notes: ''
  });
  const [feedbackForm, setFeedbackForm] = useState({
    overall_rating: '',
    recommendation: '',
    strengths: '',
    weaknesses: '',
    notes: ''
  });

  useEffect(() => {
    if (companyId) {
      fetchPanels();
      fetchApplications();
      fetchEmployees();
      fetchScorecards();
    }
  }, [companyId]);

  const fetchPanels = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('interview_panels')
      .select('*, applications(*, candidates(first_name, last_name)), interview_panel_members(*, profiles(full_name)), interview_feedback(*)')
      .order('scheduled_at', { ascending: false });
    setPanels(data || []);
    setLoading(false);
  };

  const fetchApplications = async () => {
    const { data } = await supabase
      .from('applications')
      .select('*, candidates(first_name, last_name), job_requisitions!inner(company_id, title)')
      .eq('job_requisitions.company_id', companyId)
      .in('status', ['active', 'shortlisted']);
    setApplications(data || []);
  };

  const fetchEmployees = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name, email').order('full_name');
    setEmployees(data || []);
  };

  const fetchScorecards = async () => {
    const { data } = await supabase.from('interview_scorecards').select('id, name').eq('company_id', companyId).eq('is_active', true);
    setScorecards(data || []);
  };

  const handleCreatePanel = async () => {
    if (!formData.application_id || !formData.interview_type) {
      toast.error('Application and interview type are required');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('interview_panels').insert({
      application_id: formData.application_id,
      interview_type: formData.interview_type,
      scheduled_at: formData.scheduled_at || null,
      duration_minutes: parseInt(formData.duration_minutes) || 60,
      location: formData.location || null,
      meeting_link: formData.meeting_link || null,
      scorecard_id: formData.scorecard_id || null,
      notes: formData.notes || null,
      created_by: user?.id
    });

    if (error) toast.error('Failed to create panel');
    else {
      toast.success('Interview panel created');
      setDialogOpen(false);
      setFormData({ application_id: '', interview_type: '', scheduled_at: '', duration_minutes: '60', location: '', meeting_link: '', scorecard_id: '', notes: '' });
      fetchPanels();
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedPanel) return;
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('interview_feedback').insert({
      panel_id: selectedPanel.id,
      interviewer_id: user?.id,
      overall_rating: feedbackForm.overall_rating ? parseInt(feedbackForm.overall_rating) : null,
      recommendation: feedbackForm.recommendation || null,
      strengths: feedbackForm.strengths || null,
      weaknesses: feedbackForm.weaknesses || null,
      notes: feedbackForm.notes || null,
      submitted_at: new Date().toISOString()
    });

    if (error) toast.error('Failed to submit feedback');
    else {
      toast.success('Feedback submitted');
      setFeedbackDialogOpen(false);
      setFeedbackForm({ overall_rating: '', recommendation: '', strengths: '', weaknesses: '', notes: '' });
      fetchPanels();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'scheduled': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Interview Panels</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Schedule Interview</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule Interview Panel</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Application</Label>
                  <Select value={formData.application_id} onValueChange={(v) => setFormData({ ...formData, application_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select application" />
                    </SelectTrigger>
                    <SelectContent>
                      {applications.map((app) => (
                        <SelectItem key={app.id} value={app.id}>
                          {app.candidates?.first_name} {app.candidates?.last_name} - {app.job_requisitions?.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Interview Type</Label>
                  <Select value={formData.interview_type} onValueChange={(v) => setFormData({ ...formData, interview_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVIEW_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Scorecard</Label>
                  <Select value={formData.scorecard_id} onValueChange={(v) => setFormData({ ...formData, scorecard_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      {scorecards.map((sc) => (
                        <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" value={formData.scheduled_at} onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })} />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>
                <div>
                  <Label>Meeting Link</Label>
                  <Input value={formData.meeting_link} onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Button onClick={handleCreatePanel} className="w-full">Create Interview Panel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Interviewers</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {panels.map((panel) => (
                <TableRow key={panel.id}>
                  <TableCell className="font-medium">
                    {panel.applications?.candidates?.first_name} {panel.applications?.candidates?.last_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {INTERVIEW_TYPES.find(t => t.value === panel.interview_type)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {panel.scheduled_at ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDateForDisplay(panel.scheduled_at, 'MMM d, h:mm a')}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {panel.interview_panel_members?.length || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      {panel.interview_feedback?.length || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(panel.status)}>{panel.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedPanel(panel); setFeedbackDialogOpen(true); }}>
                      Add Feedback
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Interview Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Overall Rating (1-5)</Label>
              <Input type="number" min="1" max="5" value={feedbackForm.overall_rating} onChange={(e) => setFeedbackForm({ ...feedbackForm, overall_rating: e.target.value })} />
            </div>
            <div>
              <Label>Recommendation</Label>
              <Select value={feedbackForm.recommendation} onValueChange={(v) => setFeedbackForm({ ...feedbackForm, recommendation: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recommendation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strong_hire">Strong Hire</SelectItem>
                  <SelectItem value="hire">Hire</SelectItem>
                  <SelectItem value="no_hire">No Hire</SelectItem>
                  <SelectItem value="strong_no_hire">Strong No Hire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Strengths</Label>
              <Textarea value={feedbackForm.strengths} onChange={(e) => setFeedbackForm({ ...feedbackForm, strengths: e.target.value })} />
            </div>
            <div>
              <Label>Weaknesses</Label>
              <Textarea value={feedbackForm.weaknesses} onChange={(e) => setFeedbackForm({ ...feedbackForm, weaknesses: e.target.value })} />
            </div>
            <div>
              <Label>Additional Notes</Label>
              <Textarea value={feedbackForm.notes} onChange={(e) => setFeedbackForm({ ...feedbackForm, notes: e.target.value })} />
            </div>
            <Button onClick={handleSubmitFeedback} className="w-full">Submit Feedback</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
