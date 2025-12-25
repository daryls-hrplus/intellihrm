import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, CheckCircle, Link2, ExternalLink, Users, FileText, Shield, ArrowRight, ArrowDown } from "lucide-react";
import type { GoalDependency, DependencyType, ImpactLevel } from "@/types/goalDependencies";
import { 
  DEPENDENCY_TYPE_LABELS, 
  DEPENDENCY_TYPE_DESCRIPTIONS,
  IMPACT_LEVEL_LABELS,
  IMPACT_LEVEL_COLORS 
} from "@/types/goalDependencies";
import { cn } from "@/lib/utils";

interface GoalDependencyManagerProps {
  goalId: string;
  goalTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const dependencyTypeIcons: Record<DependencyType, React.ReactNode> = {
  sequential: <ArrowRight className="h-4 w-4" />,
  resource: <FileText className="h-4 w-4" />,
  skill: <Users className="h-4 w-4" />,
  external: <ExternalLink className="h-4 w-4" />,
  cross_team: <Users className="h-4 w-4" />,
  regulatory: <Shield className="h-4 w-4" />,
};

export function GoalDependencyManager({ goalId, goalTitle, open, onOpenChange }: GoalDependencyManagerProps) {
  const { toast } = useToast();
  const [dependencies, setDependencies] = useState<GoalDependency[]>([]);
  const [reverseDependencies, setReverseDependencies] = useState<GoalDependency[]>([]);
  const [availableGoals, setAvailableGoals] = useState<{ id: string; title: string; status: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [dependencyType, setDependencyType] = useState<DependencyType>('sequential');
  const [dependsOnGoalId, setDependsOnGoalId] = useState<string>('');
  const [externalName, setExternalName] = useState('');
  const [externalContact, setExternalContact] = useState('');
  const [description, setDescription] = useState('');
  const [expectedResolutionDate, setExpectedResolutionDate] = useState('');
  const [impactLevel, setImpactLevel] = useState<ImpactLevel>('medium');

  useEffect(() => {
    if (open) {
      loadDependencies();
      loadReverseDependencies();
      loadAvailableGoals();
    }
  }, [open, goalId]);

  const loadDependencies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('goal_dependencies')
        .select(`
          *,
          depends_on_goal:performance_goals!goal_dependencies_depends_on_goal_id_fkey(
            id, title, status, progress_percentage
          )
        `)
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDependencies((data || []) as GoalDependency[]);
    } catch (error) {
      console.error('Error loading dependencies:', error);
      toast({
        title: "Error",
        description: "Failed to load dependencies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReverseDependencies = async () => {
    try {
      const { data, error } = await supabase
        .from('goal_dependencies')
        .select(`
          *,
          goal:performance_goals!goal_dependencies_goal_id_fkey(
            id, title, status, progress_percentage
          )
        `)
        .eq('depends_on_goal_id', goalId)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReverseDependencies((data || []) as any[]);
    } catch (error) {
      console.error('Error loading reverse dependencies:', error);
    }
  };

  const loadAvailableGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('performance_goals')
        .select('id, title, status')
        .neq('id', goalId)
        .in('status', ['draft', 'active', 'in_progress'])
        .order('title');

      if (error) throw error;
      setAvailableGoals(data || []);
    } catch (error) {
      console.error('Error loading available goals:', error);
    }
  };

  const handleAddDependency = async () => {
    const isExternal = dependencyType === 'external';
    
    if (!isExternal && !dependsOnGoalId) {
      toast({
        title: "Validation Error",
        description: "Please select a goal to depend on",
        variant: "destructive",
      });
      return;
    }

    if (isExternal && !externalName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter the external dependency name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('goal_dependencies')
        .insert({
          goal_id: goalId,
          depends_on_goal_id: isExternal ? null : dependsOnGoalId,
          dependency_type: dependencyType,
          external_dependency_name: isExternal ? externalName : null,
          external_dependency_contact: isExternal ? externalContact : null,
          description: description || null,
          expected_resolution_date: expectedResolutionDate || null,
          impact_if_blocked: impactLevel,
        });

      if (error) throw error;

      toast({
        title: "Dependency Added",
        description: "The dependency has been added successfully",
      });

      resetForm();
      loadDependencies();
    } catch (error) {
      console.error('Error adding dependency:', error);
      toast({
        title: "Error",
        description: "Failed to add dependency",
        variant: "destructive",
      });
    }
  };

  const handleResolveDependency = async (depId: string) => {
    try {
      const { error } = await supabase
        .from('goal_dependencies')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', depId);

      if (error) throw error;

      toast({
        title: "Dependency Resolved",
        description: "The dependency has been marked as resolved",
      });

      loadDependencies();
    } catch (error) {
      console.error('Error resolving dependency:', error);
      toast({
        title: "Error",
        description: "Failed to resolve dependency",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDependency = async (depId: string) => {
    try {
      const { error } = await supabase
        .from('goal_dependencies')
        .delete()
        .eq('id', depId);

      if (error) throw error;

      toast({
        title: "Dependency Removed",
        description: "The dependency has been removed",
      });

      loadDependencies();
    } catch (error) {
      console.error('Error deleting dependency:', error);
      toast({
        title: "Error",
        description: "Failed to delete dependency",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setDependencyType('sequential');
    setDependsOnGoalId('');
    setExternalName('');
    setExternalContact('');
    setDescription('');
    setExpectedResolutionDate('');
    setImpactLevel('medium');
  };

  const unresolvedDeps = dependencies.filter(d => !d.is_resolved);
  const resolvedDeps = dependencies.filter(d => d.is_resolved);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Goal Dependencies
          </DialogTitle>
          <DialogDescription>
            Manage dependencies for: {goalTitle}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="active" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              Depends On ({unresolvedDeps.length})
            </TabsTrigger>
            <TabsTrigger value="blocking">
              Blocking ({reverseDependencies.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({resolvedDeps.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {!showAddForm && (
                  <Button onClick={() => setShowAddForm(true)} className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Dependency
                  </Button>
                )}

                {showAddForm && (
                  <Card>
                    <CardContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Dependency Type</Label>
                          <Select value={dependencyType} onValueChange={(v) => setDependencyType(v as DependencyType)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(DEPENDENCY_TYPE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  <div className="flex items-center gap-2">
                                    {dependencyTypeIcons[value as DependencyType]}
                                    {label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            {DEPENDENCY_TYPE_DESCRIPTIONS[dependencyType]}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Impact if Blocked</Label>
                          <Select value={impactLevel} onValueChange={(v) => setImpactLevel(v as ImpactLevel)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(IMPACT_LEVEL_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {dependencyType === 'external' ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>External Dependency Name *</Label>
                            <Input
                              value={externalName}
                              onChange={(e) => setExternalName(e.target.value)}
                              placeholder="e.g., Vendor API delivery"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Contact Info</Label>
                            <Input
                              value={externalContact}
                              onChange={(e) => setExternalContact(e.target.value)}
                              placeholder="Email or phone"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>Depends On Goal *</Label>
                          <Select value={dependsOnGoalId} onValueChange={setDependsOnGoalId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a goal..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableGoals.map((goal) => (
                                <SelectItem key={goal.id} value={goal.id}>
                                  {goal.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Expected Resolution Date</Label>
                        <Input
                          type="date"
                          value={expectedResolutionDate}
                          onChange={(e) => setExpectedResolutionDate(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe this dependency..."
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={resetForm}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddDependency}>
                          Add Dependency
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {unresolvedDeps.length === 0 && !showAddForm ? (
                  <p className="text-center text-muted-foreground py-8">
                    No active dependencies
                  </p>
                ) : (
                  unresolvedDeps.map((dep) => (
                    <Card key={dep.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {dependencyTypeIcons[dep.dependency_type]}
                              <span className="font-medium">
                                {dep.external_dependency_name || dep.depends_on_goal?.title}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {DEPENDENCY_TYPE_LABELS[dep.dependency_type]}
                              </Badge>
                              <Badge className={cn("text-xs", IMPACT_LEVEL_COLORS[dep.impact_if_blocked])}>
                                {IMPACT_LEVEL_LABELS[dep.impact_if_blocked]}
                              </Badge>
                            </div>
                            {dep.description && (
                              <p className="text-sm text-muted-foreground">{dep.description}</p>
                            )}
                            {dep.expected_resolution_date && (
                              <p className="text-xs text-muted-foreground">
                                Expected resolution: {new Date(dep.expected_resolution_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleResolveDependency(dep.id)}
                              title="Mark as resolved"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteDependency(dep.id)}
                              title="Remove dependency"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="blocking" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {reverseDependencies.length === 0 ? (
                  <div className="text-center py-8">
                    <ArrowDown className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">No goals are waiting on this goal</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      These goals are waiting for "{goalTitle}" to complete:
                    </p>
                    {reverseDependencies.map((dep: any) => (
                      <Card key={dep.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            {dependencyTypeIcons[dep.dependency_type as DependencyType]}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{dep.goal?.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {DEPENDENCY_TYPE_LABELS[dep.dependency_type as DependencyType]}
                                </Badge>
                                <Badge className={cn("text-xs", IMPACT_LEVEL_COLORS[dep.impact_if_blocked as ImpactLevel])}>
                                  {IMPACT_LEVEL_LABELS[dep.impact_if_blocked as ImpactLevel]}
                                </Badge>
                              </div>
                              {dep.description && (
                                <p className="text-sm text-muted-foreground mt-1">{dep.description}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="resolved" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {resolvedDeps.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No resolved dependencies
                  </p>
                ) : (
                  resolvedDeps.map((dep) => (
                    <Card key={dep.id} className="opacity-70">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="font-medium line-through">
                                {dep.external_dependency_name || dep.depends_on_goal?.title}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {DEPENDENCY_TYPE_LABELS[dep.dependency_type]}
                              </Badge>
                            </div>
                            {dep.resolved_at && (
                              <p className="text-xs text-muted-foreground">
                                Resolved: {new Date(dep.resolved_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteDependency(dep.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
