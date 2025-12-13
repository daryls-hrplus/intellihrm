import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Loader2, MessageSquare, Play, Square, Users } from 'lucide-react';
import { useEmployeeRelations } from '@/hooks/useEmployeeRelations';
import { useAuth } from '@/contexts/AuthContext';
import { format, isAfter, isBefore } from 'date-fns';

const SURVEY_TYPES = ['engagement', 'satisfaction', 'pulse', 'feedback', 'climate'];

interface ERSurveysTabProps {
  companyId?: string;
}

export function ERSurveysTab({ companyId }: ERSurveysTabProps) {
  const { user } = useAuth();
  const { surveys, loadingSurveys, createSurvey, updateSurvey } = useEmployeeRelations(companyId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    survey_type: 'engagement',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_anonymous: true,
  });

  const filteredSurveys = surveys.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !user?.id) return;

    await createSurvey.mutateAsync({
      company_id: companyId,
      ...formData,
      created_by: user.id,
      questions: [],
    });

    setIsDialogOpen(false);
    setFormData({
      title: '',
      description: '',
      survey_type: 'engagement',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      is_anonymous: true,
    });
  };

  const handleStatusChange = async (surveyId: string, newStatus: string) => {
    await updateSurvey.mutateAsync({ id: surveyId, status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'closed': return 'bg-warning/10 text-warning border-warning/20';
      case 'archived': return 'bg-muted text-muted-foreground';
      default: return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'engagement': return 'bg-primary/10 text-primary border-primary/20';
      case 'satisfaction': return 'bg-success/10 text-success border-success/20';
      case 'pulse': return 'bg-info/10 text-info border-info/20';
      case 'feedback': return 'bg-warning/10 text-warning border-warning/20';
      case 'climate': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return '';
    }
  };

  if (loadingSurveys) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Employee Surveys
            </CardTitle>
            <CardDescription>Create and manage employee feedback surveys</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Survey
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Survey</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Survey title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Survey Type *</Label>
                  <Select value={formData.survey_type} onValueChange={(v) => setFormData({ ...formData, survey_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SURVEY_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Survey description..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_anonymous}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_anonymous: checked })}
                  />
                  <Label>Anonymous responses</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createSurvey.isPending}>
                    {createSurvey.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Survey
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search surveys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredSurveys.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No surveys found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Anonymous</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSurveys.map(survey => (
                <TableRow key={survey.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{survey.title}</p>
                      {survey.description && <p className="text-xs text-muted-foreground line-clamp-1">{survey.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTypeColor(survey.survey_type)}>
                      {survey.survey_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{format(new Date(survey.start_date), 'PP')}</p>
                      <p className="text-muted-foreground">to {format(new Date(survey.end_date), 'PP')}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={survey.is_anonymous ? 'secondary' : 'outline'}>
                      {survey.is_anonymous ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(survey.status)}>
                      {survey.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {survey.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(survey.id, 'active')}
                          title="Activate Survey"
                        >
                          <Play className="h-4 w-4 text-success" />
                        </Button>
                      )}
                      {survey.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(survey.id, 'closed')}
                          title="Close Survey"
                        >
                          <Square className="h-4 w-4 text-warning" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
