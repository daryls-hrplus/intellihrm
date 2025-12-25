import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link2, Plus, Trash2, ArrowUp, ArrowDown, Target, Unlink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Goal {
  id: string;
  title: string;
  goal_level: string;
  progress_percentage: number;
  status: string;
}

interface Alignment {
  id: string;
  source_goal_id: string;
  target_goal_id: string;
  alignment_type: string;
  contribution_weight: number;
  is_active: boolean;
  source_goal?: Goal;
  target_goal?: Goal;
}

interface GoalAlignmentManagerProps {
  goalId: string;
  companyId: string;
  goalTitle: string;
  direction: 'upstream' | 'downstream' | 'both';
}

const ALIGNMENT_TYPES = [
  { value: 'contributes_to', label: 'Contributes To', description: 'This goal contributes progress to the target goal' },
  { value: 'supports', label: 'Supports', description: 'This goal supports but does not directly contribute to target' },
  { value: 'depends_on', label: 'Depends On', description: 'This goal depends on the target goal for success' },
];

export function GoalAlignmentManager({ goalId, companyId, goalTitle, direction = 'both' }: GoalAlignmentManagerProps) {
  const [alignments, setAlignments] = useState<Alignment[]>([]);
  const [availableGoals, setAvailableGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [alignmentType, setAlignmentType] = useState<string>('contributes_to');
  const [contributionWeight, setContributionWeight] = useState<number>(10);
  const [alignDirection, setAlignDirection] = useState<'upstream' | 'downstream'>('upstream');

  useEffect(() => {
    fetchAlignments();
    fetchAvailableGoals();
  }, [goalId, companyId]);

  const fetchAlignments = async () => {
    try {
      // Fetch upstream alignments (goals this goal contributes to)
      const { data: upstreamData, error: upstreamError } = await supabase
        .from('goal_alignments')
        .select(`
          id, source_goal_id, target_goal_id, alignment_type, contribution_weight, is_active,
          target_goal:performance_goals!goal_alignments_target_goal_id_fkey(id, title, goal_level, progress_percentage, status)
        `)
        .eq('source_goal_id', goalId)
        .eq('is_active', true);

      // Fetch downstream alignments (goals that contribute to this goal)
      const { data: downstreamData, error: downstreamError } = await supabase
        .from('goal_alignments')
        .select(`
          id, source_goal_id, target_goal_id, alignment_type, contribution_weight, is_active,
          source_goal:performance_goals!goal_alignments_source_goal_id_fkey(id, title, goal_level, progress_percentage, status)
        `)
        .eq('target_goal_id', goalId)
        .eq('is_active', true);

      if (upstreamError) throw upstreamError;
      if (downstreamError) throw downstreamError;

      const formattedUpstream = (upstreamData || []).map(a => ({
        ...a,
        target_goal: Array.isArray(a.target_goal) ? a.target_goal[0] : a.target_goal
      }));

      const formattedDownstream = (downstreamData || []).map(a => ({
        ...a,
        source_goal: Array.isArray(a.source_goal) ? a.source_goal[0] : a.source_goal
      }));

      setAlignments([...formattedUpstream, ...formattedDownstream]);
    } catch (error) {
      console.error('Error fetching alignments:', error);
      toast.error('Failed to load goal alignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('performance_goals')
        .select('id, title, goal_level, progress_percentage, status')
        .eq('company_id', companyId)
        .neq('id', goalId)
        .neq('status', 'cancelled')
        .order('goal_level')
        .order('title');

      if (error) throw error;
      setAvailableGoals(data || []);
    } catch (error) {
      console.error('Error fetching available goals:', error);
    }
  };

  const handleAddAlignment = async () => {
    if (!selectedGoalId) {
      toast.error('Please select a goal to align with');
      return;
    }

    try {
      const alignmentData = alignDirection === 'upstream'
        ? { source_goal_id: goalId, target_goal_id: selectedGoalId }
        : { source_goal_id: selectedGoalId, target_goal_id: goalId };

      const { error } = await supabase
        .from('goal_alignments')
        .insert({
          ...alignmentData,
          alignment_type: alignmentType,
          contribution_weight: contributionWeight,
          is_active: true,
        });

      if (error) throw error;

      toast.success('Goal alignment created');
      setDialogOpen(false);
      setSelectedGoalId('');
      setContributionWeight(10);
      fetchAlignments();
    } catch (error) {
      console.error('Error creating alignment:', error);
      toast.error('Failed to create goal alignment');
    }
  };

  const handleRemoveAlignment = async (alignmentId: string) => {
    try {
      const { error } = await supabase
        .from('goal_alignments')
        .update({ is_active: false })
        .eq('id', alignmentId);

      if (error) throw error;

      toast.success('Goal alignment removed');
      fetchAlignments();
    } catch (error) {
      console.error('Error removing alignment:', error);
      toast.error('Failed to remove alignment');
    }
  };

  const handleUpdateWeight = async (alignmentId: string, newWeight: number) => {
    try {
      const { error } = await supabase
        .from('goal_alignments')
        .update({ contribution_weight: newWeight })
        .eq('id', alignmentId);

      if (error) throw error;

      setAlignments(alignments.map(a => 
        a.id === alignmentId ? { ...a, contribution_weight: newWeight } : a
      ));
      toast.success('Contribution weight updated');
    } catch (error) {
      console.error('Error updating weight:', error);
      toast.error('Failed to update weight');
    }
  };

  const upstreamAlignments = alignments.filter(a => a.source_goal_id === goalId);
  const downstreamAlignments = alignments.filter(a => a.target_goal_id === goalId);

  const getLevelBadgeColor = (level: string) => {
    const colors: Record<string, string> = {
      company: 'bg-primary/10 text-primary',
      department: 'bg-info/10 text-info',
      team: 'bg-warning/10 text-warning',
      individual: 'bg-success/10 text-success',
    };
    return colors[level] || 'bg-muted text-muted-foreground';
  };

  if (loading) {
    return <div className="text-muted-foreground text-sm">Loading alignments...</div>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Link2 className="h-5 w-5" />
              Goal Alignments
            </CardTitle>
            <CardDescription className="mt-1">
              Manage how "{goalTitle}" aligns with other goals
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Alignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Goal Alignment</DialogTitle>
                <DialogDescription>
                  Link this goal with another goal to establish alignment
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Alignment Direction</Label>
                  <Select value={alignDirection} onValueChange={(v: 'upstream' | 'downstream') => setAlignDirection(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upstream">
                        <div className="flex items-center gap-2">
                          <ArrowUp className="h-4 w-4" />
                          This goal contributes to...
                        </div>
                      </SelectItem>
                      <SelectItem value="downstream">
                        <div className="flex items-center gap-2">
                          <ArrowDown className="h-4 w-4" />
                          Another goal contributes to this...
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Goal</Label>
                  <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a goal to align with..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGoals.map(goal => (
                        <SelectItem key={goal.id} value={goal.id}>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${getLevelBadgeColor(goal.goal_level)}`}>
                              {goal.goal_level}
                            </Badge>
                            <span className="truncate">{goal.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Alignment Type</Label>
                  <Select value={alignmentType} onValueChange={setAlignmentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALIGNMENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {ALIGNMENT_TYPES.find(t => t.value === alignmentType)?.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Contribution Weight: {contributionWeight}%</Label>
                  <Slider
                    value={[contributionWeight]}
                    onValueChange={([v]) => setContributionWeight(v)}
                    min={5}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    How much this goal contributes to the parent goal's progress
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAlignment}>
                  Create Alignment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Upstream Alignments - Goals this contributes to */}
        {(direction === 'both' || direction === 'upstream') && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-primary" />
              Contributes To ({upstreamAlignments.length})
            </h4>
            {upstreamAlignments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                This goal doesn't contribute to any parent goals yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parent Goal</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upstreamAlignments.map(alignment => (
                    <TableRow key={alignment.id}>
                      <TableCell className="font-medium">
                        {alignment.target_goal?.title || 'Unknown Goal'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getLevelBadgeColor(alignment.target_goal?.goal_level || '')}>
                          {alignment.target_goal?.goal_level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground capitalize">
                        {alignment.alignment_type?.replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={alignment.contribution_weight}
                            onChange={(e) => handleUpdateWeight(alignment.id, parseInt(e.target.value) || 0)}
                            className="w-16 h-8"
                            min={0}
                            max={100}
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveAlignment(alignment.id)}
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}

        {/* Downstream Alignments - Goals that contribute to this */}
        {(direction === 'both' || direction === 'downstream') && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-success" />
              Contributing Goals ({downstreamAlignments.length})
            </h4>
            {downstreamAlignments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No goals are contributing to this goal yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contributing Goal</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {downstreamAlignments.map(alignment => (
                    <TableRow key={alignment.id}>
                      <TableCell className="font-medium">
                        {alignment.source_goal?.title || 'Unknown Goal'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getLevelBadgeColor(alignment.source_goal?.goal_level || '')}>
                          {alignment.source_goal?.goal_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{alignment.source_goal?.progress_percentage || 0}%</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{alignment.contribution_weight}%</span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveAlignment(alignment.id)}
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
