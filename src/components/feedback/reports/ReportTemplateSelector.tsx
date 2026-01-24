import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Users, Briefcase, UserCircle, User } from 'lucide-react';
import { 
  useFeedbackReportTemplates, 
  type FeedbackReportTemplate,
  type AudienceType 
} from '@/hooks/useFeedbackReportTemplates';

interface ReportTemplateSelectorProps {
  companyId?: string;
  onSelect: (template: FeedbackReportTemplate | null) => void;
  selectedTemplateId?: string;
  defaultAudienceType?: AudienceType;
  showLabel?: boolean;
  className?: string;
}

const audienceIcons: Record<AudienceType, React.ReactNode> = {
  executive: <Briefcase className="h-4 w-4" />,
  manager: <UserCircle className="h-4 w-4" />,
  hr: <Users className="h-4 w-4" />,
  individual_contributor: <User className="h-4 w-4" />,
  self: <User className="h-4 w-4" />,
};

const audienceLabels: Record<AudienceType, string> = {
  executive: 'Executive',
  manager: 'Manager',
  hr: 'HR Professional',
  individual_contributor: 'Individual Contributor',
  self: 'Self',
};

const contentDepthLabels: Record<string, string> = {
  high_level: 'High Level',
  summary: 'Summary',
  detailed: 'Detailed',
  comprehensive: 'Comprehensive',
};

export function ReportTemplateSelector({
  companyId,
  onSelect,
  selectedTemplateId,
  defaultAudienceType = 'individual_contributor',
  showLabel = true,
  className,
}: ReportTemplateSelectorProps) {
  const { data: templates, isLoading } = useFeedbackReportTemplates(companyId);
  const [selectedId, setSelectedId] = useState<string>(selectedTemplateId || '');

  // Find the default template based on audience type
  const defaultTemplate = templates?.find(
    t => t.audience_type === defaultAudienceType && t.is_default
  ) || templates?.find(t => t.audience_type === defaultAudienceType);

  // Auto-select default if nothing selected
  useState(() => {
    if (!selectedId && defaultTemplate) {
      setSelectedId(defaultTemplate.id);
      onSelect(defaultTemplate);
    }
  });

  const handleSelect = (templateId: string) => {
    setSelectedId(templateId);
    const template = templates?.find(t => t.id === templateId) || null;
    onSelect(template);
  };

  if (isLoading) {
    return (
      <div className={className}>
        {showLabel && <Label className="mb-2 block">Report Format</Label>}
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return null;
  }

  const selectedTemplate = templates.find(t => t.id === selectedId);

  return (
    <div className={className}>
      {showLabel && (
        <Label className="mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Report Format
        </Label>
      )}
      <Select value={selectedId} onValueChange={handleSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select report format">
            {selectedTemplate && (
              <div className="flex items-center gap-2">
                {audienceIcons[selectedTemplate.audience_type]}
                <span>{selectedTemplate.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              <div className="flex items-center gap-2">
                {audienceIcons[template.audience_type]}
                <div className="flex flex-col">
                  <span className="font-medium">{template.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {audienceLabels[template.audience_type]} • {contentDepthLabels[template.content_depth]}
                  </span>
                </div>
                {template.is_default && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Default
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedTemplate?.description && (
        <p className="mt-1 text-xs text-muted-foreground">
          {selectedTemplate.description}
        </p>
      )}
    </div>
  );
}
