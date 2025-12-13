import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Briefcase, Users, AlertTriangle, ChevronRight, UserPlus, Loader2, Trash2 } from 'lucide-react';
import { SuccessionPlan, SuccessionCandidate, useSuccession } from '@/hooks/useSuccession';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface SuccessionPlansTabProps {
  companyId: string;
}

const riskColors: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  high: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const readinessColors: Record<string, string> = {
  ready_now: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  ready_1_year: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ready_2_years: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  developing: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
};

export function SuccessionPlansTab({ companyId }: SuccessionPlansTabProps) {
  const {
    loading,
    fetchSuccessionPlans,
    createSuccessionPlan,
    updateSuccessionPlan,
    deleteSuccessionPlan,
    fetchSuccessionCandidates,
    addSuccessionCandidate,
    updateSuccessionCandidate,
    removeSuccessionCandidate,
  } = useSuccession(companyId);

  const [plans, setPlans] = useState<SuccessionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SuccessionPlan | null>(null);
  const [candidates, setCandidates] = useState<SuccessionCandidate[]>([]);
  const [positions, setPositions] = useState<{ id: string; title: string; code: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SuccessionPlan | null>(null);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const [planForm, setPlanForm] = useState({
    position_id: '',
    plan_name: '',
    description: '',
    risk_level: 'medium',
    priority: 'medium',
    target_date: '',
    notes: '',
  });

  const [candidateForm, setCandidateForm] = useState({
    employee_id: '',
    readiness_level: 'developing',
    readiness_timeline: '',
    strengths: '',
    development_areas: '',
    notes: '',
  });

  useEffect(() => {
    loadPlans();
    loadPositions();
    loadEmployees();
  }, [companyId]);

  const loadPlans = async () => {
    const data = await fetchSuccessionPlans();
    setPlans(data);
  };

  const loadPositions = async () => {
    const { data } = await supabase
      .from('positions')
      .select('id, title, code')
      .eq('company_id', companyId)
      .order('title');
    setPositions(data || []);
  };

  const loadEmployees = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('company_id', companyId)
      .order('full_name');
    setEmployees(data || []);
  };

  const loadCandidates = async (planId: string) => {
    setLoadingCandidates(true);
    const data = await fetchSuccessionCandidates(planId);
    setCandidates(data);
    setLoadingCandidates(false);
  };

  const handleSelectPlan = async (plan: SuccessionPlan) => {
    setSelectedPlan(plan);
    await loadCandidates(plan.id);
  };

  const handleCreatePlan = async () => {
    const result = await createSuccessionPlan(planForm);
    if (result) {
      loadPlans();
      setShowPlanDialog(false);
      resetPlanForm();
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;
    const result = await updateSuccessionPlan(editingPlan.id, planForm);
    if (result) {
      loadPlans();
      setShowPlanDialog(false);
      setEditingPlan(null);
      resetPlanForm();
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this succession plan?')) return;
    const result = await deleteSuccessionPlan(planId);
    if (result) {
      loadPlans();
      if (selectedPlan?.id === planId) {
        setSelectedPlan(null);
        setCandidates([]);
      }
    }
  };

  const handleAddCandidate = async () => {
    if (!selectedPlan) return;
    const result = await addSuccessionCandidate({
      plan_id: selectedPlan.id,
      ...candidateForm,
      ranking: candidates.length + 1,
    });
    if (result) {
      loadCandidates(selectedPlan.id);
      loadPlans();
      setShowCandidateDialog(false);
      resetCandidateForm();
    }
  };

  const handleRemoveCandidate = async (candidateId: string) => {
    if (!confirm('Remove this candidate from the succession plan?')) return;
    const result = await removeSuccessionCandidate(candidateId);
    if (result && selectedPlan) {
      loadCandidates(selectedPlan.id);
      loadPlans();
    }
  };

  const resetPlanForm = () => {
    setPlanForm({
      position_id: '',
      plan_name: '',
      description: '',
      risk_level: 'medium',
      priority: 'medium',
      target_date: '',
      notes: '',
    });
  };

  const resetCandidateForm = () => {
    setCandidateForm({
      employee_id: '',
      readiness_level: 'developing',
      readiness_timeline: '',
      strengths: '',
      development_areas: '',
      notes: '',
    });
  };

  const openEditDialog = (plan: SuccessionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      position_id: plan.position_id,
      plan_name: plan.plan_name,
      description: plan.description || '',
      risk_level: plan.risk_level,
      priority: plan.priority,
      target_date: plan.target_date || '',
      notes: plan.notes || '',
    });
    setShowPlanDialog(true);
  };

  const existingCandidateIds = candidates.map(c => c.employee_id);
  const availableEmployees = employees.filter(e => !existingCandidateIds.includes(e.id));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{plans.length}</div>
            <div className="text-sm text-muted-foreground">Active Plans</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">
              {plans.filter(p => p.risk_level === 'high').length}
            </div>
            <div className="text-sm text-muted-foreground">High Risk</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600">
              {candidates.filter(c => c.readiness_level === 'ready_now').length}
            </div>
            <div className="text-sm text-muted-foreground">Ready Now</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">
              {plans.filter(p => (p.candidate_count || 0) === 0).length}
            </div>
            <div className="text-sm text-muted-foreground">No Successors</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plans List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Succession Plans</h3>
            <Button size="sm" onClick={() => { resetPlanForm(); setEditingPlan(null); setShowPlanDialog(true); }}>
              <Plus className="h-4 w-4 mr-1" />
              New Plan
            </Button>
          </div>

          <div className="space-y-2">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-colors ${
                  selectedPlan?.id === plan.id ? 'border-primary' : 'hover:border-primary/50'
                }`}
                onClick={() => handleSelectPlan(plan)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{plan.plan_name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {plan.position?.title || 'Unknown Position'}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={riskColors[plan.risk_level]}>
                      {plan.risk_level} risk
                    </Badge>
                    <Badge className={priorityColors[plan.priority]}>
                      {plan.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {plan.candidate_count || 0} candidate{(plan.candidate_count || 0) !== 1 ? 's' : ''}
                    {(plan.candidate_count || 0) === 0 && (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {plans.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No succession plans yet. Create one to get started.
              </div>
            )}
          </div>
        </div>

        {/* Candidates */}
        <div className="lg:col-span-2">
          {selectedPlan ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{selectedPlan.plan_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedPlan.position?.title} • {selectedPlan.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(selectedPlan)}>
                    Edit Plan
                  </Button>
                  <Button size="sm" onClick={() => setShowCandidateDialog(true)} disabled={availableEmployees.length === 0}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Candidate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingCandidates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : candidates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No candidates identified yet.</p>
                    <p className="text-sm">Add potential successors to this plan.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {candidates.map((candidate, index) => (
                      <Card key={candidate.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                                {index + 1}
                              </div>
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={candidate.employee?.avatar_url || undefined} />
                                <AvatarFallback>
                                  {candidate.employee?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{candidate.employee?.full_name}</div>
                                <div className="text-sm text-muted-foreground">{candidate.employee?.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={readinessColors[candidate.readiness_level]}>
                                {candidate.readiness_level.replace('_', ' ')}
                              </Badge>
                              <Button size="sm" variant="ghost" onClick={() => handleRemoveCandidate(candidate.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          
                          {(candidate.strengths || candidate.development_areas) && (
                            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                              {candidate.strengths && (
                                <div>
                                  <div className="font-medium text-emerald-600 mb-1">Strengths</div>
                                  <p className="text-muted-foreground">{candidate.strengths}</p>
                                </div>
                              )}
                              {candidate.development_areas && (
                                <div>
                                  <div className="font-medium text-amber-600 mb-1">Development Areas</div>
                                  <p className="text-muted-foreground">{candidate.development_areas}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {candidate.development_plans && candidate.development_plans.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm font-medium mb-2">Development Progress</div>
                              <div className="space-y-2">
                                {candidate.development_plans.map(dp => (
                                  <div key={dp.id} className="flex items-center gap-2">
                                    <Progress value={dp.progress} className="flex-1 h-2" />
                                    <span className="text-xs text-muted-foreground w-12">{dp.progress}%</span>
                                    <span className="text-xs truncate max-w-[120px]">{dp.title}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a succession plan to view candidates</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Succession Plan' : 'Create Succession Plan'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Position *</Label>
              <Select
                value={planForm.position_id}
                onValueChange={(value) => setPlanForm({ ...planForm, position_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>
                      {pos.title} ({pos.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Plan Name *</Label>
              <Input
                value={planForm.plan_name}
                onChange={(e) => setPlanForm({ ...planForm, plan_name: e.target.value })}
                placeholder="e.g., CEO Succession Plan"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Risk Level</Label>
                <Select
                  value={planForm.risk_level}
                  onValueChange={(value) => setPlanForm({ ...planForm, risk_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={planForm.priority}
                  onValueChange={(value) => setPlanForm({ ...planForm, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Date</Label>
              <Input
                type="date"
                value={planForm.target_date}
                onChange={(e) => setPlanForm({ ...planForm, target_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={planForm.notes}
                onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPlanDialog(false)}>Cancel</Button>
              <Button onClick={editingPlan ? handleUpdatePlan : handleCreatePlan} disabled={!planForm.position_id || !planForm.plan_name}>
                {editingPlan ? 'Update' : 'Create'} Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Candidate Dialog */}
      <Dialog open={showCandidateDialog} onOpenChange={setShowCandidateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Succession Candidate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Select
                value={candidateForm.employee_id}
                onValueChange={(value) => setCandidateForm({ ...candidateForm, employee_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Readiness Level</Label>
                <Select
                  value={candidateForm.readiness_level}
                  onValueChange={(value) => setCandidateForm({ ...candidateForm, readiness_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ready_now">Ready Now</SelectItem>
                    <SelectItem value="ready_1_year">Ready in 1 Year</SelectItem>
                    <SelectItem value="ready_2_years">Ready in 2+ Years</SelectItem>
                    <SelectItem value="developing">Developing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timeline</Label>
                <Input
                  value={candidateForm.readiness_timeline}
                  onChange={(e) => setCandidateForm({ ...candidateForm, readiness_timeline: e.target.value })}
                  placeholder="e.g., Q2 2025"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Strengths</Label>
              <Textarea
                value={candidateForm.strengths}
                onChange={(e) => setCandidateForm({ ...candidateForm, strengths: e.target.value })}
                placeholder="Key strengths for this role..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Development Areas</Label>
              <Textarea
                value={candidateForm.development_areas}
                onChange={(e) => setCandidateForm({ ...candidateForm, development_areas: e.target.value })}
                placeholder="Areas needing development..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={candidateForm.notes}
                onChange={(e) => setCandidateForm({ ...candidateForm, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCandidateDialog(false)}>Cancel</Button>
              <Button onClick={handleAddCandidate} disabled={!candidateForm.employee_id}>
                Add Candidate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
