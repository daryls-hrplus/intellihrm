import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Route, GitBranch, Plus, Settings, Users, TrendingUp, Play, Pause, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdaptivePath {
  id: string;
  path_name: string;
  description: string | null;
  adaptation_strategy: string;
  is_active: boolean;
  min_mastery_threshold: number;
  max_retry_attempts: number;
  enable_skip_ahead: boolean;
  enable_remediation: boolean;
  created_at: string;
}

interface PathRule {
  id: string;
  adaptive_path_id: string;
  rule_name: string;
  rule_type: string;
  trigger_condition: Record<string, unknown>;
  action_config: Record<string, unknown>;
  priority: number;
  is_active: boolean;
}

export function AdaptivePathConfigPanel() {
  const [activeTab, setActiveTab] = useState('paths');
  const [selectedPath, setSelectedPath] = useState<AdaptivePath | null>(null);
  const [showNewPathDialog, setShowNewPathDialog] = useState(false);
  const [showNewRuleDialog, setShowNewRuleDialog] = useState(false);
  const [pathConfig, setPathConfig] = useState({
    name: '',
    description: '',
    strategy: 'performance_based',
    masteryThreshold: 70,
    maxRetries: 3,
    enableSkipAhead: false,
    enableRemediation: true,
  });
  const [ruleConfig, setRuleConfig] = useState({
    name: '',
    type: 'remediate',
    triggerScore: 50,
    priority: 100,
  });

  const queryClient = useQueryClient();

  const { data: paths = [], isLoading: loadingPaths } = useQuery({
    queryKey: ['adaptive-learning-paths'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('adaptive_learning_paths')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AdaptivePath[];
    },
  });

  const { data: rules = [], isLoading: loadingRules } = useQuery({
    queryKey: ['adaptive-path-rules', selectedPath?.id],
    queryFn: async () => {
      if (!selectedPath) return [];
      const { data, error } = await supabase
        .from('adaptive_path_rules')
        .select('*')
        .eq('adaptive_path_id', selectedPath.id)
        .order('priority', { ascending: true });
      if (error) throw error;
      return data as PathRule[];
    },
    enabled: !!selectedPath,
  });

  const { data: learnerProgress = [] } = useQuery({
    queryKey: ['adaptive-learner-progress', selectedPath?.id],
    queryFn: async () => {
      if (!selectedPath) return [];
      const { data, error } = await supabase
        .from('adaptive_learner_progress')
        .select(`
          *,
          profiles:employee_id (full_name, email)
        `)
        .eq('adaptive_path_id', selectedPath.id);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPath,
  });

  const createPathMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('adaptive_learning_paths')
        .insert({
          path_name: pathConfig.name,
          description: pathConfig.description,
          adaptation_strategy: pathConfig.strategy,
          min_mastery_threshold: pathConfig.masteryThreshold,
          max_retry_attempts: pathConfig.maxRetries,
          enable_skip_ahead: pathConfig.enableSkipAhead,
          enable_remediation: pathConfig.enableRemediation,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adaptive-learning-paths'] });
      setShowNewPathDialog(false);
      toast.success('Adaptive path created!');
    },
    onError: (error) => {
      toast.error('Failed to create path: ' + error.message);
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPath) throw new Error('No path selected');
      const { data, error } = await supabase
        .from('adaptive_path_rules')
        .insert({
          adaptive_path_id: selectedPath.id,
          rule_name: ruleConfig.name,
          rule_type: ruleConfig.type,
          trigger_condition: { score_below: ruleConfig.triggerScore },
          action_config: { action: ruleConfig.type },
          priority: ruleConfig.priority,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adaptive-path-rules'] });
      setShowNewRuleDialog(false);
      toast.success('Rule created!');
    },
    onError: (error) => {
      toast.error('Failed to create rule: ' + error.message);
    },
  });

  const togglePathMutation = useMutation({
    mutationFn: async ({ pathId, isActive }: { pathId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('adaptive_learning_paths')
        .update({ is_active: isActive })
        .eq('id', pathId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adaptive-learning-paths'] });
      toast.success('Path status updated');
    },
  });

  const getStrategyBadge = (strategy: string) => {
    const colors: Record<string, string> = {
      performance_based: 'bg-blue-100 text-blue-800',
      time_based: 'bg-green-100 text-green-800',
      engagement_based: 'bg-purple-100 text-purple-800',
      hybrid: 'bg-orange-100 text-orange-800',
    };
    return (
      <Badge className={colors[strategy] || 'bg-gray-100'} variant="outline">
        {strategy.replace('_', ' ')}
      </Badge>
    );
  };

  const getRuleTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      skip: 'bg-green-100 text-green-800',
      remediate: 'bg-yellow-100 text-yellow-800',
      branch: 'bg-blue-100 text-blue-800',
      accelerate: 'bg-purple-100 text-purple-800',
      pause: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={colors[type] || 'bg-gray-100'} variant="outline">
        {type}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            <CardTitle>Adaptive Learning Paths</CardTitle>
          </div>
          <Dialog open={showNewPathDialog} onOpenChange={setShowNewPathDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Path
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Adaptive Path</DialogTitle>
                <DialogDescription>
                  Configure an AI-driven learning path with automatic adaptations
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Path Name</Label>
                  <Input
                    placeholder="Enter path name"
                    value={pathConfig.name}
                    onChange={(e) => setPathConfig({ ...pathConfig, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Optional description"
                    value={pathConfig.description}
                    onChange={(e) => setPathConfig({ ...pathConfig, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adaptation Strategy</Label>
                  <Select
                    value={pathConfig.strategy}
                    onValueChange={(value) => setPathConfig({ ...pathConfig, strategy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance_based">Performance Based</SelectItem>
                      <SelectItem value="time_based">Time Based</SelectItem>
                      <SelectItem value="engagement_based">Engagement Based</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mastery Threshold (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={pathConfig.masteryThreshold}
                      onChange={(e) => setPathConfig({ ...pathConfig, masteryThreshold: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Retry Attempts</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={pathConfig.maxRetries}
                      onChange={(e) => setPathConfig({ ...pathConfig, maxRetries: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enable Skip Ahead</Label>
                  <Switch
                    checked={pathConfig.enableSkipAhead}
                    onCheckedChange={(checked) => setPathConfig({ ...pathConfig, enableSkipAhead: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enable Remediation</Label>
                  <Switch
                    checked={pathConfig.enableRemediation}
                    onCheckedChange={(checked) => setPathConfig({ ...pathConfig, enableRemediation: checked })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewPathDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createPathMutation.mutate()}
                  disabled={createPathMutation.isPending || !pathConfig.name}
                >
                  {createPathMutation.isPending ? 'Creating...' : 'Create Path'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Configure intelligent learning paths that adapt to learner performance and engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="paths">Paths</TabsTrigger>
            <TabsTrigger value="rules" disabled={!selectedPath}>Rules</TabsTrigger>
            <TabsTrigger value="learners" disabled={!selectedPath}>Learners</TabsTrigger>
          </TabsList>

          <TabsContent value="paths" className="mt-4">
            {loadingPaths ? (
              <div className="text-center py-8 text-muted-foreground">Loading paths...</div>
            ) : paths.length === 0 ? (
              <div className="text-center py-8">
                <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No adaptive paths configured</p>
                <p className="text-sm text-muted-foreground">Click "Create Path" to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Path Name</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Mastery %</TableHead>
                    <TableHead>Skip Ahead</TableHead>
                    <TableHead>Remediation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paths.map((path) => (
                    <TableRow 
                      key={path.id}
                      className={selectedPath?.id === path.id ? 'bg-muted/50' : ''}
                    >
                      <TableCell className="font-medium">{path.path_name}</TableCell>
                      <TableCell>{getStrategyBadge(path.adaptation_strategy)}</TableCell>
                      <TableCell>{path.min_mastery_threshold}%</TableCell>
                      <TableCell>
                        {path.enable_skip_ahead ? (
                          <Badge variant="outline" className="bg-green-50">Yes</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {path.enable_remediation ? (
                          <Badge variant="outline" className="bg-green-50">Yes</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={path.is_active}
                          onCheckedChange={(checked) => 
                            togglePathMutation.mutate({ pathId: path.id, isActive: checked })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPath(path);
                              setActiveTab('rules');
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPath(path);
                              setActiveTab('learners');
                            }}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="rules" className="mt-4">
            {!selectedPath ? (
              <div className="text-center py-8 text-muted-foreground">
                Select a path to manage rules
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedPath.path_name}</h3>
                    <p className="text-sm text-muted-foreground">Adaptation Rules</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectedPath(null)}>
                      Back
                    </Button>
                    <Dialog open={showNewRuleDialog} onOpenChange={setShowNewRuleDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Rule
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Adaptation Rule</DialogTitle>
                          <DialogDescription>
                            Define when and how the path should adapt
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Rule Name</Label>
                            <Input
                              placeholder="e.g., Low Score Remediation"
                              value={ruleConfig.name}
                              onChange={(e) => setRuleConfig({ ...ruleConfig, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Rule Type</Label>
                            <Select
                              value={ruleConfig.type}
                              onValueChange={(value) => setRuleConfig({ ...ruleConfig, type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="skip">Skip Ahead</SelectItem>
                                <SelectItem value="remediate">Remediate</SelectItem>
                                <SelectItem value="branch">Branch Path</SelectItem>
                                <SelectItem value="accelerate">Accelerate</SelectItem>
                                <SelectItem value="pause">Pause Progress</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Trigger Score (below %)</Label>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={ruleConfig.triggerScore}
                              onChange={(e) => setRuleConfig({ ...ruleConfig, triggerScore: parseInt(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Priority (lower = higher)</Label>
                            <Input
                              type="number"
                              min={1}
                              value={ruleConfig.priority}
                              onChange={(e) => setRuleConfig({ ...ruleConfig, priority: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowNewRuleDialog(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => createRuleMutation.mutate()}
                            disabled={createRuleMutation.isPending || !ruleConfig.name}
                          >
                            {createRuleMutation.isPending ? 'Creating...' : 'Create Rule'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                {loadingRules ? (
                  <div className="text-center py-8 text-muted-foreground">Loading rules...</div>
                ) : rules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No rules configured for this path
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Priority</TableHead>
                        <TableHead>Rule Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Trigger</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-mono">{rule.priority}</TableCell>
                          <TableCell className="font-medium">{rule.rule_name}</TableCell>
                          <TableCell>{getRuleTypeBadge(rule.rule_type)}</TableCell>
                          <TableCell>
                            Score &lt; {(rule.trigger_condition as { score_below?: number })?.score_below || 'N/A'}%
                          </TableCell>
                          <TableCell>
                            <Switch checked={rule.is_active} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="learners" className="mt-4">
            {!selectedPath ? (
              <div className="text-center py-8 text-muted-foreground">
                Select a path to view learners
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedPath.path_name}</h3>
                    <p className="text-sm text-muted-foreground">{learnerProgress.length} learners enrolled</p>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedPath(null)}>
                    Back
                  </Button>
                </div>
                {learnerProgress.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No learners enrolled in this path yet
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Learner</TableHead>
                        <TableHead>Pace</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead>Adaptations</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {learnerProgress.map((progress: Record<string, unknown>) => (
                        <TableRow key={progress.id as string}>
                          <TableCell className="font-medium">
                            {(progress.profiles as { full_name?: string })?.full_name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {((progress.actual_pace_multiplier as number) || 1).toFixed(1)}x
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {progress.engagement_score 
                              ? `${((progress.engagement_score as number) * 100).toFixed(0)}%`
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {(progress.adaptations_applied as unknown[])?.length || 0}
                          </TableCell>
                          <TableCell>
                            {progress.last_activity_at 
                              ? new Date(progress.last_activity_at as string).toLocaleDateString()
                              : 'Never'}
                          </TableCell>
                          <TableCell>
                            {progress.completed_at ? (
                              <Badge className="bg-green-100 text-green-800">Completed</Badge>
                            ) : (
                              <Badge variant="outline">In Progress</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
