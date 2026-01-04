import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  Settings2, 
  TrendingUp, 
  Sparkles, 
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  useNineBoxRatingSources,
  useManageRatingSource,
  useDeleteRatingSource,
  SOURCE_TYPE_LABELS,
  DEFAULT_PERFORMANCE_SOURCES,
  DEFAULT_POTENTIAL_SOURCES,
} from '@/hooks/succession/useNineBoxRatingSources';
import {
  useNineBoxSignalMappings,
  useManageSignalMapping,
  useDeleteSignalMapping,
  useInitializeDefaultMappings,
  DEFAULT_SIGNAL_MAPPINGS,
} from '@/hooks/succession/useNineBoxSignalMappings';

interface NineBoxConfigPanelProps {
  companyId: string;
}

export function NineBoxConfigPanel({ companyId }: NineBoxConfigPanelProps) {
  const [activeTab, setActiveTab] = useState('rating-sources');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          9-Box Configuration
        </CardTitle>
        <CardDescription>
          Configure how performance and potential ratings are calculated from data sources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rating-sources">Rating Sources</TabsTrigger>
            <TabsTrigger value="signal-mappings">Signal Mappings</TabsTrigger>
          </TabsList>

          <TabsContent value="rating-sources" className="mt-4">
            <RatingSourcesConfig companyId={companyId} />
          </TabsContent>

          <TabsContent value="signal-mappings" className="mt-4">
            <SignalMappingsConfig companyId={companyId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function RatingSourcesConfig({ companyId }: { companyId: string }) {
  const { data: sources, isLoading } = useNineBoxRatingSources(companyId);
  const manageMutation = useManageRatingSource();
  const deleteMutation = useDeleteRatingSource();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<any>(null);

  const performanceSources = sources?.filter(s => s.axis === 'performance') || [];
  const potentialSources = sources?.filter(s => s.axis === 'potential') || [];

  const handleInitializeDefaults = async () => {
    try {
      // Create default performance sources
      for (const src of DEFAULT_PERFORMANCE_SOURCES) {
        await manageMutation.mutateAsync({
          company_id: companyId,
          axis: 'performance',
          ...src,
          source_config: {},
          is_active: true,
        });
      }
      // Create default potential sources
      for (const src of DEFAULT_POTENTIAL_SOURCES) {
        await manageMutation.mutateAsync({
          company_id: companyId,
          axis: 'potential',
          ...src,
          source_config: {},
          is_active: true,
        });
      }
      toast.success('Default rating sources created');
    } catch (error) {
      toast.error('Failed to create default sources');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sources?.length === 0 && (
        <div className="text-center py-8 border rounded-lg border-dashed">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground mb-4">No rating sources configured</p>
          <Button onClick={handleInitializeDefaults} disabled={manageMutation.isPending}>
            {manageMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Initialize Default Sources
          </Button>
        </div>
      )}

      {/* Performance Sources */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Performance Sources</h4>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setEditingSource({ axis: 'performance' });
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Source
          </Button>
        </div>
        
        {performanceSources.length === 0 ? (
          <p className="text-sm text-muted-foreground">No performance sources configured</p>
        ) : (
          <div className="space-y-2">
            {performanceSources.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                onEdit={() => {
                  setEditingSource(source);
                  setDialogOpen(true);
                }}
                onDelete={() => deleteMutation.mutate(source.id)}
                onToggle={(active) => 
                  manageMutation.mutate({ ...source, is_active: active })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Potential Sources */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Potential Sources</h4>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setEditingSource({ axis: 'potential' });
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Source
          </Button>
        </div>
        
        {potentialSources.length === 0 ? (
          <p className="text-sm text-muted-foreground">No potential sources configured</p>
        ) : (
          <div className="space-y-2">
            {potentialSources.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                onEdit={() => {
                  setEditingSource(source);
                  setDialogOpen(true);
                }}
                onDelete={() => deleteMutation.mutate(source.id)}
                onToggle={(active) => 
                  manageMutation.mutate({ ...source, is_active: active })
                }
              />
            ))}
          </div>
        )}
      </div>

      <SourceEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        source={editingSource}
        companyId={companyId}
        onSave={async (data) => {
          await manageMutation.mutateAsync(data);
          setDialogOpen(false);
          setEditingSource(null);
        }}
      />
    </div>
  );
}

function SourceCard({ 
  source, 
  onEdit, 
  onDelete, 
  onToggle 
}: { 
  source: any; 
  onEdit: () => void; 
  onDelete: () => void;
  onToggle: (active: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <Switch
          checked={source.is_active}
          onCheckedChange={onToggle}
        />
        <div>
          <p className="font-medium text-sm">
            {SOURCE_TYPE_LABELS[source.source_type] || source.source_type}
          </p>
          <p className="text-xs text-muted-foreground">
            Weight: {(source.weight * 100).toFixed(0)}% | Priority: {source.priority}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" onClick={onEdit}>
          <Settings2 className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

function SourceEditDialog({
  open,
  onOpenChange,
  source,
  companyId,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: any;
  companyId: string;
  onSave: (data: any) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    source_type: '',
    weight: 0.5,
    priority: 1,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (source) {
      setFormData({
        source_type: source.source_type || '',
        weight: source.weight || 0.5,
        priority: source.priority || 1,
      });
    }
  }, [source]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave({
        id: source?.id,
        company_id: companyId,
        axis: source?.axis,
        source_type: formData.source_type,
        weight: formData.weight,
        priority: formData.priority,
        is_active: true,
        source_config: {},
      });
    } finally {
      setSaving(false);
    }
  };

  const sourceOptions = source?.axis === 'performance' 
    ? ['appraisal_overall_score', 'calibrated_score', 'goal_achievement', 'competency_average']
    : ['potential_assessment', 'leadership_signals', 'values_signals'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {source?.id ? 'Edit' : 'Add'} {source?.axis === 'performance' ? 'Performance' : 'Potential'} Source
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Source Type</Label>
            <Select
              value={formData.source_type}
              onValueChange={(value) => setFormData({ ...formData, source_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source type" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {SOURCE_TYPE_LABELS[type] || type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Weight: {(formData.weight * 100).toFixed(0)}%</Label>
            <Slider
              value={[formData.weight * 100]}
              onValueChange={([v]) => setFormData({ ...formData, weight: v / 100 })}
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Input
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
              min={1}
              max={10}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.source_type || saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SignalMappingsConfig({ companyId }: { companyId: string }) {
  const { data: mappings, isLoading } = useNineBoxSignalMappings(companyId);
  const [signalDefinitions, setSignalDefinitions] = useState<any[]>([]);
  const manageMutation = useManageSignalMapping();
  const deleteMutation = useDeleteSignalMapping();
  const initializeMutation = useInitializeDefaultMappings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<any>(null);

  useEffect(() => {
    const fetchDefinitions = async () => {
      const { data } = await supabase
        .from('talent_signal_definitions')
        .select('id, code, name, signal_category')
        .eq('is_active', true)
        .order('signal_category');
      setSignalDefinitions(data || []);
    };
    fetchDefinitions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const performanceMappings = mappings?.filter(m => 
    m.contributes_to === 'performance' || m.contributes_to === 'both'
  ) || [];
  const potentialMappings = mappings?.filter(m => 
    m.contributes_to === 'potential' || m.contributes_to === 'both'
  ) || [];

  return (
    <div className="space-y-6">
      {mappings?.length === 0 && (
        <div className="text-center py-8 border rounded-lg border-dashed">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground mb-4">No signal mappings configured</p>
          <Button 
            onClick={() => initializeMutation.mutate(companyId)} 
            disabled={initializeMutation.isPending}
          >
            {initializeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <RefreshCw className="mr-2 h-4 w-4" />
            Initialize Default Mappings
          </Button>
        </div>
      )}

      {mappings && mappings.length > 0 && (
        <>
          <div className="flex justify-end">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setEditingMapping({});
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Mapping
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance Signals */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance Signals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {performanceMappings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No signals mapped</p>
                ) : (
                  performanceMappings.map((mapping) => (
                    <MappingCard
                      key={mapping.id}
                      mapping={mapping}
                      onEdit={() => {
                        setEditingMapping(mapping);
                        setDialogOpen(true);
                      }}
                      onDelete={() => deleteMutation.mutate(mapping.id)}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            {/* Potential Signals */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Potential Signals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {potentialMappings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No signals mapped</p>
                ) : (
                  potentialMappings.map((mapping) => (
                    <MappingCard
                      key={mapping.id}
                      mapping={mapping}
                      onEdit={() => {
                        setEditingMapping(mapping);
                        setDialogOpen(true);
                      }}
                      onDelete={() => deleteMutation.mutate(mapping.id)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <MappingEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mapping={editingMapping}
        companyId={companyId}
        signalDefinitions={signalDefinitions}
        onSave={async (data) => {
          await manageMutation.mutateAsync(data);
          setDialogOpen(false);
          setEditingMapping(null);
        }}
      />
    </div>
  );
}

function MappingCard({ 
  mapping, 
  onEdit, 
  onDelete 
}: { 
  mapping: any; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  const contributesBadge = {
    performance: 'bg-blue-100 text-blue-800',
    potential: 'bg-purple-100 text-purple-800',
    both: 'bg-green-100 text-green-800',
  };

  return (
    <div className="flex items-center justify-between p-2 border rounded text-sm">
      <div>
        <p className="font-medium">{mapping.signal_definition?.name || 'Unknown'}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge 
            variant="secondary" 
            className={`text-xs ${contributesBadge[mapping.contributes_to as keyof typeof contributesBadge]}`}
          >
            {mapping.contributes_to}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Weight: {(mapping.weight * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onEdit}>
          <Settings2 className="h-3 w-3" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onDelete}>
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

function MappingEditDialog({
  open,
  onOpenChange,
  mapping,
  companyId,
  signalDefinitions,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapping: any;
  companyId: string;
  signalDefinitions: any[];
  onSave: (data: any) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    signal_definition_id: '',
    contributes_to: 'potential' as 'performance' | 'potential' | 'both',
    weight: 1.0,
    minimum_confidence: 0.6,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mapping) {
      setFormData({
        signal_definition_id: mapping.signal_definition_id || '',
        contributes_to: mapping.contributes_to || 'potential',
        weight: mapping.weight || 1.0,
        minimum_confidence: mapping.minimum_confidence || 0.6,
      });
    }
  }, [mapping]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave({
        id: mapping?.id,
        company_id: companyId,
        signal_definition_id: formData.signal_definition_id,
        contributes_to: formData.contributes_to,
        weight: formData.weight,
        minimum_confidence: formData.minimum_confidence,
        is_active: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mapping?.id ? 'Edit' : 'Add'} Signal Mapping</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Signal Definition</Label>
            <Select
              value={formData.signal_definition_id}
              onValueChange={(value) => setFormData({ ...formData, signal_definition_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select signal" />
              </SelectTrigger>
              <SelectContent>
                {signalDefinitions.map((def) => (
                  <SelectItem key={def.id} value={def.id}>
                    {def.name} ({def.signal_category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Contributes To</Label>
            <Select
              value={formData.contributes_to}
              onValueChange={(value: any) => setFormData({ ...formData, contributes_to: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Performance Only</SelectItem>
                <SelectItem value="potential">Potential Only</SelectItem>
                <SelectItem value="both">Both Axes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Weight: {(formData.weight * 100).toFixed(0)}%</Label>
            <Slider
              value={[formData.weight * 100]}
              onValueChange={([v]) => setFormData({ ...formData, weight: v / 100 })}
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Minimum Confidence: {(formData.minimum_confidence * 100).toFixed(0)}%</Label>
            <Slider
              value={[formData.minimum_confidence * 100]}
              onValueChange={([v]) => setFormData({ ...formData, minimum_confidence: v / 100 })}
              min={0}
              max={100}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              Signals below this confidence threshold will be excluded
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.signal_definition_id || saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
