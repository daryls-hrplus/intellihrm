import { useState } from "react";
import { useReleaseLifecycle, Milestone } from "@/hooks/useReleaseLifecycle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Calendar,
  Loader2,
  Target,
} from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";

export function MilestoneTimeline() {
  const { 
    lifecycle, 
    isLoading, 
    addMilestone, 
    completeMilestone, 
    removeMilestone 
  } = useReleaseLifecycle();
  
  const [newMilestone, setNewMilestone] = useState({ name: '', targetDate: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const milestones = lifecycle?.milestones || [];

  const handleAddMilestone = async () => {
    if (!newMilestone.name.trim()) return;
    
    await addMilestone.mutateAsync({
      name: newMilestone.name,
      targetDate: newMilestone.targetDate || null,
      completed: false,
    });
    
    setNewMilestone({ name: '', targetDate: '' });
    setDialogOpen(false);
  };

  const handleCompleteMilestone = async (milestoneId: string) => {
    await completeMilestone.mutateAsync(milestoneId);
  };

  const handleRemoveMilestone = async (milestoneId: string) => {
    await removeMilestone.mutateAsync(milestoneId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Release Milestones
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Release Milestone</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="milestone-name">Milestone Name</Label>
                <Input
                  id="milestone-name"
                  placeholder="e.g., Beta Release, RC1, GA"
                  value={newMilestone.name}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="milestone-date">Target Date (Optional)</Label>
                <Input
                  id="milestone-date"
                  type="date"
                  value={newMilestone.targetDate}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, targetDate: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={handleAddMilestone}
                disabled={!newMilestone.name.trim() || addMilestone.isPending}
              >
                {addMilestone.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Add Milestone
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No milestones configured yet.</p>
            <p className="text-sm">Add milestones to track your release progress.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            
            {/* Milestones */}
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative flex items-start gap-4 pl-10">
                  {/* Timeline dot */}
                  <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${
                    milestone.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'bg-background border-muted-foreground'
                  }`} />
                  
                  {/* Milestone content */}
                  <div className="flex-1 flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {milestone.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <div className="font-medium">{milestone.name}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {milestone.targetDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateForDisplay(milestone.targetDate, 'MMM d, yyyy')}
                            </span>
                          )}
                          {milestone.completed && milestone.completedAt && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              Completed {formatDateForDisplay(milestone.completedAt, 'MMM d')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!milestone.completed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompleteMilestone(milestone.id)}
                          disabled={completeMilestone.isPending}
                        >
                          {completeMilestone.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveMilestone(milestone.id)}
                        disabled={removeMilestone.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
