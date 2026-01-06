import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Copy, Eye, BookOpen, Building, Globe } from 'lucide-react';

interface Framework {
  id: string;
  name: string;
  description: string | null;
  framework_type: string;
  status: string;
  version: string;
  is_active: boolean;
  created_at: string;
}

interface FrameworkLibraryProps {
  companyId: string;
}

export function FrameworkLibrary({ companyId }: FrameworkLibraryProps) {
  const queryClient = useQueryClient();
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('system');

  const { data: frameworks, isLoading } = useQuery({
    queryKey: ['feedback-frameworks', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback_frameworks')
        .select('*')
        .or(`company_id.is.null,company_id.eq.${companyId}`)
        .order('status', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      return data as unknown as Framework[];
    },
  });

  const cloneMutation = useMutation({
    mutationFn: async (framework: Framework) => {
      const { data, error } = await supabase
        .from('feedback_frameworks')
        .insert({
          company_id: companyId,
          name: `${framework.name} (Copy)`,
          description: framework.description,
          framework_type: framework.framework_type,
          status: 'draft',
          version: '1.0',
          is_active: false,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-frameworks'] });
      toast.success('Framework cloned successfully');
    },
  });

  const systemFrameworks = frameworks?.filter(f => f.status === 'active') || [];
  const customFrameworks = frameworks?.filter(f => f.status === 'draft') || [];
  const industryFrameworks = frameworks?.filter(f => f.status === 'archived') || [];

  const renderFrameworkCard = (framework: Framework) => (
    <Card key={framework.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{framework.name}</CardTitle>
            <CardDescription className="text-xs mt-1">
              v{framework.version} • {framework.framework_type}
            </CardDescription>
          </div>
          <Badge variant={framework.is_active ? 'default' : 'secondary'}>
            {framework.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {framework.description || 'No description provided'}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {framework.framework_type}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFramework(framework)}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cloneMutation.mutate(framework)}
              disabled={cloneMutation.isPending}
            >
              <Copy className="h-3 w-3 mr-1" />
              Clone
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Competency Framework Library</h2>
          <p className="text-sm text-muted-foreground">
            Browse system, industry, and custom frameworks
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Create Custom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Framework</DialogTitle>
            </DialogHeader>
            <CreateFrameworkForm
              companyId={companyId}
              onSuccess={() => {
                setIsCreateOpen(false);
                queryClient.invalidateQueries({ queryKey: ['feedback-frameworks'] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="system" className="gap-1">
            <Globe className="h-3 w-3" />
            System ({systemFrameworks.length})
          </TabsTrigger>
          <TabsTrigger value="industry" className="gap-1">
            <Building className="h-3 w-3" />
            Industry ({industryFrameworks.length})
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-1">
            <BookOpen className="h-3 w-3" />
            Custom ({customFrameworks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : systemFrameworks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No system frameworks available
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {systemFrameworks.map(renderFrameworkCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="industry" className="mt-4">
          {industryFrameworks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No industry frameworks available
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {industryFrameworks.map(renderFrameworkCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom" className="mt-4">
          {customFrameworks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No custom frameworks yet. Clone a system framework or create your own.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {customFrameworks.map(renderFrameworkCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Framework Detail Dialog */}
      <Dialog open={!!selectedFramework} onOpenChange={() => setSelectedFramework(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedFramework && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedFramework.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {selectedFramework.description}
                </p>
                <div className="flex gap-2">
                <Badge>{selectedFramework.framework_type}</Badge>
                  <Badge variant="outline">v{selectedFramework.version}</Badge>
                  <Badge variant="secondary">{selectedFramework.status}</Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Details</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-medium text-sm">Type: {selectedFramework.framework_type}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Version: {selectedFramework.version}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Status: {selectedFramework.status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateFrameworkForm({
  companyId,
  onSuccess,
}: {
  companyId: string;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    framework_type: 'leadership',
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('feedback_frameworks').insert({
        company_id: companyId,
        name: formData.name,
        description: formData.description,
        framework_type: formData.framework_type,
        status: 'draft',
        version: '1.0',
        is_active: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Framework created');
      onSuccess();
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Framework name"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the framework"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Type</label>
        <Select
          value={formData.framework_type}
          onValueChange={(v) => setFormData({ ...formData, framework_type: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="leadership">Leadership</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="values">Values</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={() => createMutation.mutate()}
        disabled={!formData.name || createMutation.isPending}
        className="w-full"
      >
        Create Framework
      </Button>
    </div>
  );
}
