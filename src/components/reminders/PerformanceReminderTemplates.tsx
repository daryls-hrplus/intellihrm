import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Mail, 
  MessageSquare, 
  Target, 
  AlertTriangle, 
  UserCheck, 
  Clock,
  Copy,
  Edit,
  Eye,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TEMPLATE_PLACEHOLDERS } from './templatePlaceholders';

interface EmailTemplate {
  id: string;
  event_code: string;
  name: string;
  subject: string;
  body: string;
  description: string;
  icon: React.ReactNode;
  category: 'response' | 'escalation' | 'deadline';
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'review_submitted',
    event_code: 'REVIEW_RESPONSE_REQUIRED',
    name: 'Manager Review Submitted',
    description: 'Sent when a manager submits a performance review',
    subject: 'Action Required: Your Performance Review is Ready for Response',
    body: `Dear {employee_name},

Your manager has submitted your performance review for {cycle_name}.

Please log in to review your evaluation and provide your feedback. You have until {response_deadline} to submit your response.

What you can do:
• Agree with the review
• Agree with additional comments
• Partially disagree with specific areas
• Disagree and request HR review

Your voice matters in this process.

Best regards,
HR Team`,
    icon: <Target className="h-5 w-5" />,
    category: 'response',
  },
  {
    id: 'response_deadline',
    event_code: 'REVIEW_RESPONSE_DEADLINE',
    name: 'Response Deadline Reminder',
    description: 'Sent when the response deadline is approaching',
    subject: 'Reminder: Performance Review Response Due {response_deadline}',
    body: `Dear {employee_name},

This is a reminder that your deadline to respond to your performance review is approaching.

Review Cycle: {cycle_name}
Deadline: {response_deadline}
Days Remaining: {days_until}

Please ensure you submit your response before the deadline. If you have already responded, please disregard this message.

Best regards,
HR Team`,
    icon: <Clock className="h-5 w-5" />,
    category: 'deadline',
  },
  {
    id: 'employee_escalated',
    event_code: 'EMPLOYEE_ESCALATION_NEW',
    name: 'Employee Escalation to HR',
    description: 'Sent to HR when an employee escalates their review',
    subject: 'HR Review Required: Employee Escalation for {employee_name}',
    body: `Dear HR Team,

{employee_name} has escalated their performance review response and is requesting HR intervention.

Review Cycle: {cycle_name}
Review Date: {review_date}
Manager: {manager_name}

The employee has indicated disagreement with their review and would like HR to facilitate the discussion.

Please review the escalation and take appropriate action.

Best regards,
HRIS System`,
    icon: <AlertTriangle className="h-5 w-5" />,
    category: 'escalation',
  },
  {
    id: 'hr_responded',
    event_code: 'HR_ESCALATION_RESOLVED',
    name: 'HR Response to Escalation',
    description: 'Sent to employee when HR responds to their escalation',
    subject: 'Update: HR Has Responded to Your Escalation',
    body: `Dear {employee_name},

HR has reviewed and responded to your performance review escalation for {cycle_name}.

Please log in to view the HR response and any actions taken. If you have any questions, please contact your HR representative.

Best regards,
HR Team`,
    icon: <UserCheck className="h-5 w-5" />,
    category: 'escalation',
  },
  {
    id: 'manager_rebuttal',
    event_code: 'MANAGER_REBUTTAL_RECEIVED',
    name: 'Manager Rebuttal',
    description: 'Sent to employee when manager adds a rebuttal',
    subject: 'Your Manager Has Responded to Your Feedback',
    body: `Dear {employee_name},

{manager_name} has reviewed and responded to your performance review feedback for {cycle_name}.

Please log in to view their response. This is part of the ongoing dialogue to ensure mutual understanding.

Best regards,
HR Team`,
    icon: <MessageSquare className="h-5 w-5" />,
    category: 'response',
  },
];

interface PerformanceReminderTemplatesProps {
  companyId: string;
  onSaveTemplate?: (template: EmailTemplate) => Promise<void>;
}

export function PerformanceReminderTemplates({ companyId, onSaveTemplate }: PerformanceReminderTemplatesProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopyTemplate = (template: EmailTemplate) => {
    navigator.clipboard.writeText(template.body);
    toast({
      title: 'Copied',
      description: 'Template copied to clipboard',
    });
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate({ ...template });
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    try {
      if (onSaveTemplate) {
        await onSaveTemplate(editingTemplate);
      }

      // Update local state
      setTemplates(prev => 
        prev.map(t => t.id === editingTemplate.id ? editingTemplate : t)
      );

      toast({
        title: 'Template Saved',
        description: 'Your changes have been saved successfully.',
      });

      setIsEditing(false);
      setEditingTemplate(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const previewBody = (body: string) => {
    // Replace placeholders with sample values for preview
    return body
      .replace(/{employee_name}/gi, 'John Doe')
      .replace(/{manager_name}/gi, 'Jane Smith')
      .replace(/{cycle_name}/gi, '2024 Annual Review')
      .replace(/{response_deadline}/gi, 'January 15, 2025')
      .replace(/{review_date}/gi, 'January 1, 2025')
      .replace(/{days_until}/gi, '5');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'response': return 'bg-blue-100 text-blue-700';
      case 'escalation': return 'bg-orange-100 text-orange-700';
      case 'deadline': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Performance Review Email Templates</h3>
          <p className="text-sm text-muted-foreground">
            Customize email templates for Employee Voice notifications
          </p>
        </div>
      </div>

      {/* Placeholder Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Available Placeholders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_PLACEHOLDERS.filter(p => 
              ['employee_name', 'manager_name', 'cycle_name', 'response_deadline', 'review_date', 'days_until'].includes(p.key.replace(/{|}/g, ''))
            ).map(placeholder => (
              <Badge 
                key={placeholder.key} 
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => navigator.clipboard.writeText(placeholder.key)}
              >
                {placeholder.key}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <Card key={template.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                    <CardDescription className="text-xs">{template.description}</CardDescription>
                  </div>
                </div>
                <Badge className={getCategoryColor(template.category)}>
                  {template.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <p className="text-sm font-medium">{template.subject}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Preview</Label>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.body.substring(0, 100)}...
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{template.name} - Preview</DialogTitle>
                      <DialogDescription>{template.description}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground">Subject</Label>
                        <p className="font-medium">{previewBody(template.subject)}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                        {previewBody(template.body)}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditTemplate(template)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>

                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleCopyTemplate(template)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template: {editingTemplate?.name}</DialogTitle>
            <DialogDescription>
              Customize the email template. Use placeholders like {'{employee_name}'} for dynamic content.
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Subject Line</Label>
                <Input
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    subject: e.target.value
                  })}
                />
              </div>
              <div>
                <Label>Email Body</Label>
                <Textarea
                  value={editingTemplate.body}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    body: e.target.value
                  })}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Available Placeholders</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {['{employee_name}', '{manager_name}', '{cycle_name}', '{response_deadline}', '{review_date}', '{days_until}'].map(p => (
                    <Badge 
                      key={p} 
                      variant="secondary" 
                      className="cursor-pointer text-xs"
                      onClick={() => {
                        setEditingTemplate({
                          ...editingTemplate,
                          body: editingTemplate.body + ' ' + p
                        });
                      }}
                    >
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
