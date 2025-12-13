import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ArrowRight, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface CareerPathsTabProps {
  companyId: string;
}

interface CareerPath {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  steps?: CareerPathStep[];
}

interface CareerPathStep {
  id: string;
  career_path_id: string;
  job_id: string;
  step_order: number;
  typical_duration_months: number | null;
  requirements: string | null;
  job?: { id: string; title: string; code: string };
}

interface Job {
  id: string;
  title: string;
  code: string;
}

export function CareerPathsTab({ companyId }: CareerPathsTabProps) {
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [editingPath, setEditingPath] = useState<CareerPath | null>(null);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  const [stepFormData, setStepFormData] = useState({
    job_id: '',
    typical_duration_months: '',
    requirements: ''
  });

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadPaths(), loadJobs()]);
    setLoading(false);
  };

  const loadPaths = async () => {
    const { data } = await (supabase.from('career_paths') as any)
      .select('*')
      .eq('company_id', companyId)
      .order('name');
    
    if (data) {
      const pathsWithSteps = await Promise.all(data.map(async (path: any) => {
        const { data: steps } = await (supabase.from('career_path_steps') as any)
          .select(`
            *,
            job:jobs(id, title, code)
          `)
          .eq('career_path_id', path.id)
          .order('step_order');
        return { ...path, steps: steps || [] };
      }));
      setPaths(pathsWithSteps);
    }
  };

  const loadJobs = async () => {
    const { data } = await (supabase.from('jobs') as any)
      .select('id, title, code')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('title');
    setJobs(data || []);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Please enter a name');
      return;
    }

    const payload = {
      ...formData,
      company_id: companyId
    };

    if (editingPath) {
      const { error } = await (supabase.from('career_paths') as any)
        .update(payload)
        .eq('id', editingPath.id);
      if (error) toast.error('Failed to update career path');
      else toast.success('Career path updated');
    } else {
      const { error } = await (supabase.from('career_paths') as any)
        .insert([payload]);
      if (error) toast.error('Failed to create career path');
      else toast.success('Career path created');
    }
    
    setDialogOpen(false);
    resetForm();
    loadPaths();
  };

  const handleStepSubmit = async () => {
    if (!stepFormData.job_id || !selectedPathId) return;

    // Get next step order
    const path = paths.find(p => p.id === selectedPathId);
    const nextOrder = (path?.steps?.length || 0) + 1;

    const payload = {
      career_path_id: selectedPathId,
      job_id: stepFormData.job_id,
      step_order: nextOrder,
      typical_duration_months: stepFormData.typical_duration_months ? parseInt(stepFormData.typical_duration_months) : null,
      requirements: stepFormData.requirements || null
    };

    const { error } = await (supabase.from('career_path_steps') as any)
      .insert([payload]);
    if (error) toast.error('Failed to add step');
    else toast.success('Step added');

    setStepDialogOpen(false);
    resetStepForm();
    loadPaths();
  };

  const deletePath = async (id: string) => {
    const { error } = await (supabase.from('career_paths') as any)
      .delete()
      .eq('id', id);
    if (error) toast.error('Failed to delete career path');
    else {
      toast.success('Career path deleted');
      loadPaths();
    }
  };

  const deleteStep = async (id: string) => {
    const { error } = await (supabase.from('career_path_steps') as any)
      .delete()
      .eq('id', id);
    if (error) toast.error('Failed to delete step');
    else {
      toast.success('Step deleted');
      loadPaths();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', is_active: true });
    setEditingPath(null);
  };

  const resetStepForm = () => {
    setStepFormData({ job_id: '', typical_duration_months: '', requirements: '' });
    setSelectedPathId(null);
  };

  const openEditPath = (path: CareerPath) => {
    setEditingPath(path);
    setFormData({
      name: path.name,
      description: path.description || '',
      is_active: path.is_active
    });
    setDialogOpen(true);
  };

  const openAddStep = (pathId: string) => {
    setSelectedPathId(pathId);
    resetStepForm();
    setSelectedPathId(pathId);
    setStepDialogOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Career Paths</h3>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Path</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPath ? 'Edit' : 'Create'} Career Path</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Engineering Track" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.is_active} 
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded"
                />
                <Label>Active</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full">{editingPath ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Step Dialog */}
      <Dialog open={stepDialogOpen} onOpenChange={(open) => { setStepDialogOpen(open); if (!open) resetStepForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Step to Path</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Job *</Label>
              <Select value={stepFormData.job_id} onValueChange={(v) => setStepFormData({...stepFormData, job_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                <SelectContent>
                  {jobs.map(j => (
                    <SelectItem key={j.id} value={j.id}>{j.title} ({j.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Typical Duration (months)</Label>
              <Input 
                type="number" 
                value={stepFormData.typical_duration_months} 
                onChange={(e) => setStepFormData({...stepFormData, typical_duration_months: e.target.value})}
                placeholder="e.g., 24"
              />
            </div>
            <div>
              <Label>Requirements</Label>
              <Textarea 
                value={stepFormData.requirements} 
                onChange={(e) => setStepFormData({...stepFormData, requirements: e.target.value})}
                placeholder="Skills, certifications, or experience needed"
              />
            </div>
            <Button onClick={handleStepSubmit} className="w-full">Add Step</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Career Paths List */}
      <div className="space-y-4">
        {paths.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No career paths defined yet</CardContent></Card>
        ) : (
          paths.map(path => (
            <Card key={path.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{path.name}</CardTitle>
                    {!path.is_active && <Badge variant="outline">Inactive</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => openAddStep(path.id)}>
                      <Plus className="h-3 w-3 mr-1" /> Add Step
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEditPath(path)}><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => deletePath(path.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                {path.description && <p className="text-sm text-muted-foreground">{path.description}</p>}
              </CardHeader>
              <CardContent>
                {path.steps?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No steps defined</p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {path.steps?.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-2">
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 relative group">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary bg-primary/20 rounded-full w-5 h-5 flex items-center justify-center">
                              {step.step_order}
                            </span>
                            <div>
                              <div className="font-medium text-sm">{step.job?.title}</div>
                              {step.typical_duration_months && (
                                <div className="text-xs text-muted-foreground">{step.typical_duration_months} months</div>
                              )}
                            </div>
                          </div>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground rounded-full"
                            onClick={() => deleteStep(step.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        {index < (path.steps?.length || 0) - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
