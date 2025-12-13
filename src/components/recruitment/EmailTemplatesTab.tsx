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
import { Plus, Edit, Trash2, Mail, Copy } from 'lucide-react';

interface EmailTemplatesTabProps {
  companyId: string;
}

const TEMPLATE_TYPES = [
  { value: 'application_received', label: 'Application Received' },
  { value: 'interview_invite', label: 'Interview Invitation' },
  { value: 'interview_reminder', label: 'Interview Reminder' },
  { value: 'rejection', label: 'Rejection' },
  { value: 'offer', label: 'Offer Letter' },
  { value: 'offer_accepted', label: 'Offer Accepted' },
  { value: 'offer_declined', label: 'Offer Declined' },
];

const MERGE_FIELDS = [
  '{{candidate_name}}',
  '{{candidate_first_name}}',
  '{{candidate_email}}',
  '{{position_title}}',
  '{{company_name}}',
  '{{interview_date}}',
  '{{interview_time}}',
  '{{interview_location}}',
  '{{hiring_manager}}',
  '{{offer_salary}}',
  '{{start_date}}'
];

export function EmailTemplatesTab({ companyId }: EmailTemplatesTabProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    template_type: '',
    subject: '',
    body: ''
  });

  useEffect(() => {
    if (companyId) fetchTemplates();
  }, [companyId]);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('recruitment_email_templates')
      .select('*')
      .eq('company_id', companyId)
      .order('template_type');
    setTemplates(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.template_type || !formData.subject.trim()) {
      toast.error('Name, type, and subject are required');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      company_id: companyId,
      ...formData,
      variables: MERGE_FIELDS,
      created_by: user?.id
    };

    if (editingTemplate) {
      const { error } = await supabase.from('recruitment_email_templates').update(payload).eq('id', editingTemplate.id);
      if (error) toast.error('Failed to update template');
      else toast.success('Template updated');
    } else {
      const { error } = await supabase.from('recruitment_email_templates').insert(payload);
      if (error) toast.error('Failed to create template');
      else toast.success('Template created');
    }
    setDialogOpen(false);
    setEditingTemplate(null);
    setFormData({ name: '', template_type: '', subject: '', body: '' });
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    const { error } = await supabase.from('recruitment_email_templates').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else {
      toast.success('Template deleted');
      fetchTemplates();
    }
  };

  const handleDuplicate = async (template: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('recruitment_email_templates').insert({
      company_id: companyId,
      name: `${template.name} (Copy)`,
      template_type: template.template_type,
      subject: template.subject,
      body: template.body,
      variables: template.variables,
      created_by: user?.id
    });
    if (error) toast.error('Failed to duplicate');
    else {
      toast.success('Template duplicated');
      fetchTemplates();
    }
  };

  const insertMergeField = (field: string) => {
    setFormData({ ...formData, body: formData.body + ' ' + field });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Email Templates</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingTemplate(null); setFormData({ name: '', template_type: '', subject: '', body: '' }); }}>
              <Plus className="mr-2 h-4 w-4" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit' : 'New'} Email Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Template Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <Label>Template Type</Label>
                  <Select value={formData.template_type} onValueChange={(v) => setFormData({ ...formData, template_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Subject Line</Label>
                <Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Email Body</Label>
                  <div className="text-xs text-muted-foreground">Click to insert merge fields:</div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {MERGE_FIELDS.map((field) => (
                    <Badge
                      key={field}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => insertMergeField(field)}
                    >
                      {field}
                    </Badge>
                  ))}
                </div>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              <Button onClick={handleSave} className="w-full">Save Template</Button>
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
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {template.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {TEMPLATE_TYPES.find(t => t.value === template.template_type)?.label || template.template_type}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                <TableCell>
                  <Badge variant={template.is_active ? 'default' : 'secondary'}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditingTemplate(template);
                      setFormData({
                        name: template.name,
                        template_type: template.template_type,
                        subject: template.subject,
                        body: template.body
                      });
                      setDialogOpen(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDuplicate(template)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)}>
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
  );
}
