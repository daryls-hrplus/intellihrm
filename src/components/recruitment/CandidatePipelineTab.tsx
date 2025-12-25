import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Mail, Phone, MessageSquare, Calendar, FileText, User } from 'lucide-react';
import { format } from 'date-fns';
import { formatDateForDisplay } from "@/utils/dateUtils";

interface CandidatePipelineTabProps {
  companyId: string;
}

const ACTIVITY_TYPES = [
  { value: 'email_sent', label: 'Email Sent', icon: Mail },
  { value: 'call_made', label: 'Call Made', icon: Phone },
  { value: 'note_added', label: 'Note Added', icon: FileText },
  { value: 'meeting', label: 'Meeting', icon: Calendar },
  { value: 'linkedin_message', label: 'LinkedIn Message', icon: MessageSquare },
];

export function CandidatePipelineTab({ companyId }: CandidatePipelineTabProps) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    activity_type: 'note_added',
    subject: '',
    content: '',
    outcome: '',
    follow_up_date: ''
  });

  useEffect(() => {
    if (companyId) fetchCandidates();
  }, [companyId]);

  useEffect(() => {
    if (selectedCandidate) fetchActivities(selectedCandidate.id);
  }, [selectedCandidate]);

  const fetchCandidates = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('candidates')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setCandidates(data || []);
    if (data && data.length > 0 && !selectedCandidate) {
      setSelectedCandidate(data[0]);
    }
    setLoading(false);
  };

  const fetchActivities = async (candidateId: string) => {
    const { data } = await supabase
      .from('candidate_pipeline_activities')
      .select('*, profiles:created_by(full_name)')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });
    setActivities(data || []);
  };

  const handleAddActivity = async () => {
    if (!selectedCandidate) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('candidate_pipeline_activities')
      .insert({
        candidate_id: selectedCandidate.id,
        ...formData,
        follow_up_date: formData.follow_up_date || null,
        created_by: user?.id
      });
    if (error) toast.error('Failed to add activity');
    else {
      toast.success('Activity added');
      setDialogOpen(false);
      setFormData({ activity_type: 'note_added', subject: '', content: '', outcome: '', follow_up_date: '' });
      fetchActivities(selectedCandidate.id);
    }
  };

  const getActivityIcon = (type: string) => {
    const activity = ACTIVITY_TYPES.find(a => a.value === type);
    return activity ? activity.icon : FileText;
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Candidate List */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                    selectedCandidate?.id === candidate.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <div className="font-medium">{candidate.first_name} {candidate.last_name}</div>
                  <div className="text-sm text-muted-foreground">{candidate.email}</div>
                  <Badge variant="outline" className="mt-1">{candidate.status}</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {selectedCandidate ? `${selectedCandidate.first_name} ${selectedCandidate.last_name}` : 'Select a Candidate'}
            </CardTitle>
            {selectedCandidate && (
              <p className="text-sm text-muted-foreground">{selectedCandidate.email}</p>
            )}
          </div>
          {selectedCandidate && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Add Activity</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Activity</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Activity Type</Label>
                    <Select value={formData.activity_type} onValueChange={(v) => setFormData({ ...formData, activity_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTIVITY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
                  </div>
                  <div>
                    <Label>Outcome</Label>
                    <Input value={formData.outcome} onChange={(e) => setFormData({ ...formData, outcome: e.target.value })} />
                  </div>
                  <div>
                    <Label>Follow-up Date</Label>
                    <Input type="date" value={formData.follow_up_date} onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })} />
                  </div>
                  <Button onClick={handleAddActivity} className="w-full">Add Activity</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {selectedCandidate ? (
            <ScrollArea className="h-[450px]">
              <div className="space-y-4">
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.activity_type);
                  return (
                    <div key={activity.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{ACTIVITY_TYPES.find(t => t.value === activity.activity_type)?.label}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        {activity.subject && <div className="font-medium">{activity.subject}</div>}
                        {activity.content && <p className="text-sm text-muted-foreground mt-1">{activity.content}</p>}
                        {activity.outcome && (
                          <div className="text-sm mt-2">
                            <span className="font-medium">Outcome:</span> {activity.outcome}
                          </div>
                        )}
                        {activity.follow_up_date && (
                          <div className="text-sm text-primary mt-1">
                            Follow-up: {formatDateForDisplay(activity.follow_up_date)}
                          </div>
                        )}
                        {activity.profiles?.full_name && (
                          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <User className="h-3 w-3" /> {activity.profiles.full_name}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {activities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No activities recorded yet
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Select a candidate to view their activity timeline
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
