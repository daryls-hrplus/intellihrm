import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  FileText, Plus, Search, MoreHorizontal, 
  Play, Edit, Trash2, Copy, Globe, Building 
} from 'lucide-react';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { useReportWriter, ReportTemplate } from '@/hooks/useReportWriter';
import { ReportWriterDialog } from './ReportWriterDialog';
import { ReportRunnerDialog } from './ReportRunnerDialog';

interface ReportTemplatesListProps {
  module: string;
  companyId?: string;
  showCreateButton?: boolean;
}

export function ReportTemplatesList({ 
  module, 
  companyId,
  showCreateButton = true 
}: ReportTemplatesListProps) {
  const { getTemplates, deleteTemplate, isLoading } = useReportWriter();
  
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [writerDialogOpen, setWriterDialogOpen] = useState(false);
  const [runnerDialogOpen, setRunnerDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | undefined>();

  useEffect(() => {
    loadTemplates();
  }, [module, companyId]);

  const loadTemplates = async () => {
    const data = await getTemplates(module, companyId);
    setTemplates(data);
  };

  const handleCreate = () => {
    setEditingTemplateId(undefined);
    setWriterDialogOpen(true);
  };

  const handleEdit = (template: ReportTemplate) => {
    setEditingTemplateId(template.id);
    setWriterDialogOpen(true);
  };

  const handleRun = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setRunnerDialogOpen(true);
  };

  const handleDelete = async (template: ReportTemplate) => {
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      const success = await deleteTemplate(template.id);
      if (success) {
        loadTemplates();
      }
    }
  };

  const handleDuplicate = (template: ReportTemplate) => {
    // Pre-fill with existing template data for new creation
    setEditingTemplateId(undefined);
    setWriterDialogOpen(true);
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Templates
          </CardTitle>
          {showCreateButton && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No report templates found</p>
            <p className="text-sm">Create a template to start generating reports</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Data Source</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map(template => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="font-medium">{template.name}</div>
                    {template.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {template.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{template.code}</Badge>
                  </TableCell>
                  <TableCell>{template.data_source}</TableCell>
                  <TableCell>
                    {template.is_global ? (
                      <Badge className="gap-1">
                        <Globe className="h-3 w-3" />
                        Global
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Building className="h-3 w-3" />
                        Company
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateForDisplay(template.created_at, 'PP')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRun(template)}>
                          <Play className="h-4 w-4 mr-2" />
                          Run Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(template)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Template
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(template)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <ReportWriterDialog
        open={writerDialogOpen}
        onOpenChange={setWriterDialogOpen}
        module={module}
        templateId={editingTemplateId}
        companyId={companyId}
        onSave={loadTemplates}
      />

      {selectedTemplate && (
        <ReportRunnerDialog
          open={runnerDialogOpen}
          onOpenChange={setRunnerDialogOpen}
          template={selectedTemplate}
        />
      )}
    </Card>
  );
}
