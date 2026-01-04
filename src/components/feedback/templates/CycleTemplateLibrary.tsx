import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LayoutTemplate, 
  Copy, 
  Trash2, 
  Search,
  UserCheck,
  Users,
  UserCog,
  Plus
} from 'lucide-react';
import { useCycleTemplates, useDeleteTemplate, type CycleTemplate } from '@/hooks/feedback/useCycleTemplates';
import { CloneCycleDialog } from './CloneCycleDialog';
import { CreateTemplateDialog } from './CreateTemplateDialog';

interface CycleTemplateLibraryProps {
  companyId: string;
  onCloneSuccess?: (cycleId: string) => void;
}

export function CycleTemplateLibrary({ companyId, onCloneSuccess }: CycleTemplateLibraryProps) {
  const { data: templates, isLoading } = useCycleTemplates(companyId);
  const deleteMutation = useDeleteTemplate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<CycleTemplate | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredTemplates = templates?.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.template_name?.toLowerCase().includes(query) ||
      t.template_description?.toLowerCase().includes(query) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const getReviewTypeIcons = (template: CycleTemplate) => {
    const icons = [];
    if (template.include_self_review) icons.push({ icon: UserCheck, label: 'Self' });
    if (template.include_manager_review) icons.push({ icon: UserCog, label: 'Manager' });
    if (template.include_peer_review) icons.push({ icon: Users, label: 'Peer' });
    return icons;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5" />
              Cycle Templates
            </CardTitle>
            <CardDescription>
              Create reusable templates or start a new cycle from an existing template
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredTemplates && filteredTemplates.length > 0 ? (
            <div className="space-y-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">
                        {template.template_name || template.name}
                      </h4>
                      {template.template_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.template_description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Use
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(template.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {template.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {template.cycle_type || '360 Feedback'}
                    </Badge>
                    {getReviewTypeIcons(template).map(({ icon: Icon, label }) => (
                      <span key={label} className="flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No templates match your search' : 'No templates saved yet'}
            </div>
          )}
        </CardContent>
      </Card>

      <CloneCycleDialog
        template={selectedTemplate}
        companyId={companyId}
        open={!!selectedTemplate}
        onOpenChange={(open) => !open && setSelectedTemplate(null)}
        onSuccess={onCloneSuccess}
      />

      <CreateTemplateDialog
        companyId={companyId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
}
