import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Shield, Clock, Plane, Edit, Loader2, Key, Plus } from 'lucide-react';
import { KeyPositionRisk, useSuccession } from '@/hooks/useSuccession';
import { supabase } from '@/integrations/supabase/client';

interface KeyPositionsTabProps {
  companyId: string;
}

interface KeyPosition {
  id: string;
  title: string;
  code: string;
  job_id: string;
  job?: {
    name: string;
    code: string;
  };
  current_holder?: {
    id: string;
    full_name: string;
  } | null;
  riskAssessment?: KeyPositionRisk | null;
}

const criticalityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  high: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const vacancyRiskColors: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function KeyPositionsTab({ companyId }: KeyPositionsTabProps) {
  const {
    loading,
    fetchKeyPositionRisks,
    createKeyPositionRisk,
    updateKeyPositionRisk,
  } = useSuccession(companyId);

  const [keyPositions, setKeyPositions] = useState<KeyPosition[]>([]);
  const [loadingKeyPositions, setLoadingKeyPositions] = useState(true);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPosition, setEditingPosition] = useState<KeyPosition | null>(null);
  const [formData, setFormData] = useState({
    position_id: '',
    criticality_level: 'high',
    vacancy_risk: 'medium',
    impact_if_vacant: '',
    current_incumbent_id: '',
    retirement_risk: false,
    flight_risk: false,
    risk_notes: '',
  });

  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    await Promise.all([
      loadKeyPositionsFromJobs(),
      loadEmployees(),
    ]);
  };

  const loadKeyPositionsFromJobs = async () => {
    setLoadingKeyPositions(true);
    
    // Get positions where the associated job is marked as key position
    const { data: positionsData } = await (supabase
      .from('positions') as any)
      .select(`
        id, 
        title, 
        code,
        job_id,
        jobs!inner(id, name, code, is_key_position)
      `)
      .eq('company_id', companyId)
      .eq('jobs.is_key_position', true)
      .is('end_date', null)
      .order('title');
    
    // Get risk assessments
    const riskAssessments = await fetchKeyPositionRisks();
    const riskMap = new Map(riskAssessments.map(r => [r.position_id, r]));
    
    // Get current holder for each position
    const keyPositionsWithData: KeyPosition[] = [];
    if (positionsData) {
      for (const pos of positionsData) {
        const { data: holder } = await supabase
          .from('employee_positions')
          .select('profiles(id, full_name)')
          .eq('position_id', pos.id)
          .is('end_date', null)
          .order('start_date', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        keyPositionsWithData.push({
          id: pos.id,
          title: pos.title,
          code: pos.code,
          job_id: pos.job_id,
          job: pos.jobs,
          current_holder: holder?.profiles || null,
          riskAssessment: riskMap.get(pos.id) || null,
        });
      }
    }
    
    setKeyPositions(keyPositionsWithData);
    setLoadingKeyPositions(false);
  };

  const loadEmployees = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('company_id', companyId)
      .order('full_name');
    setEmployees(data || []);
  };

  const handleSubmit = async () => {
    const submitData = {
      position_id: formData.position_id,
      criticality_level: formData.criticality_level,
      vacancy_risk: formData.vacancy_risk,
      impact_if_vacant: formData.impact_if_vacant || null,
      current_incumbent_id: formData.current_incumbent_id || null,
      retirement_risk: formData.retirement_risk,
      flight_risk: formData.flight_risk,
      risk_notes: formData.risk_notes || null,
    };

    const existingRisk = editingPosition?.riskAssessment;
    if (existingRisk) {
      await updateKeyPositionRisk(existingRisk.id, submitData);
    } else {
      await createKeyPositionRisk(submitData);
    }

    loadData();
    setShowDialog(false);
    setEditingPosition(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      position_id: '',
      criticality_level: 'high',
      vacancy_risk: 'medium',
      impact_if_vacant: '',
      current_incumbent_id: '',
      retirement_risk: false,
      flight_risk: false,
      risk_notes: '',
    });
  };

  const openRiskDialog = (keyPos: KeyPosition) => {
    setEditingPosition(keyPos);
    const risk = keyPos.riskAssessment;
    setFormData({
      position_id: keyPos.id,
      criticality_level: risk?.criticality_level || 'high',
      vacancy_risk: risk?.vacancy_risk || 'medium',
      impact_if_vacant: risk?.impact_if_vacant || '',
      current_incumbent_id: risk?.current_incumbent_id || keyPos.current_holder?.id || '',
      retirement_risk: risk?.retirement_risk || false,
      flight_risk: risk?.flight_risk || false,
      risk_notes: risk?.risk_notes || '',
    });
    setShowDialog(true);
  };

  // Stats
  const positionsWithRisk = keyPositions.filter(p => p.riskAssessment);
  const stats = {
    total: keyPositions.length,
    withRiskAssessment: positionsWithRisk.length,
    critical: positionsWithRisk.filter(p => p.riskAssessment?.criticality_level === 'critical').length,
    highVacancyRisk: positionsWithRisk.filter(p => p.riskAssessment?.vacancy_risk === 'high').length,
    retirementRisk: positionsWithRisk.filter(p => p.riskAssessment?.retirement_risk).length,
    flightRisk: positionsWithRisk.filter(p => p.riskAssessment?.flight_risk).length,
  };

  const isLoading = loading || loadingKeyPositions;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <div className="text-sm text-muted-foreground">Key Positions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.withRiskAssessment}</div>
            <div className="text-sm text-muted-foreground">Risk Assessed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{stats.highVacancyRisk}</div>
            <div className="text-sm text-muted-foreground">High Vacancy Risk</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{stats.retirementRisk}</span>
            </div>
            <div className="text-sm text-muted-foreground">Retirement Risk</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">{stats.flightRisk}</span>
            </div>
            <div className="text-sm text-muted-foreground">Flight Risk</div>
          </CardContent>
        </Card>
      </div>

      {/* Key Positions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Key Positions from Jobs
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Positions are marked as key based on their job configuration in Workforce &gt; Jobs
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : keyPositions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No key positions found.</p>
              <p className="text-sm">Mark jobs as "Key Position" in Workforce &gt; Jobs to see them here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Incumbent</TableHead>
                  <TableHead>Criticality</TableHead>
                  <TableHead>Vacancy Risk</TableHead>
                  <TableHead>Risk Indicators</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keyPositions.map((keyPos) => {
                  const risk = keyPos.riskAssessment;
                  return (
                    <TableRow key={keyPos.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{keyPos.title}</div>
                          <div className="text-sm text-muted-foreground">{keyPos.code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{keyPos.job?.name || '-'}</div>
                      </TableCell>
                      <TableCell>
                        {keyPos.current_holder?.full_name || (
                          <span className="text-muted-foreground italic">Vacant</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {risk ? (
                          <Badge className={criticalityColors[risk.criticality_level]}>
                            {risk.criticality_level}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not assessed</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {risk ? (
                          <Badge className={vacancyRiskColors[risk.vacancy_risk]}>
                            {risk.vacancy_risk}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {risk ? (
                          <div className="flex gap-2">
                            {risk.retirement_risk && (
                              <Badge variant="outline" className="border-blue-500 text-blue-600">
                                <Clock className="h-3 w-3 mr-1" />
                                Retirement
                              </Badge>
                            )}
                            {risk.flight_risk && (
                              <Badge variant="outline" className="border-purple-500 text-purple-600">
                                <Plane className="h-3 w-3 mr-1" />
                                Flight
                              </Badge>
                            )}
                            {!risk.retirement_risk && !risk.flight_risk && (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm truncate">{risk?.impact_if_vacant || '-'}</p>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant={risk ? "ghost" : "outline"} onClick={() => openRiskDialog(keyPos)}>
                          {risk ? (
                            <Edit className="h-4 w-4" />
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              Assess
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Risk Assessment Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPosition?.riskAssessment ? 'Edit Risk Assessment' : 'Add Risk Assessment'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingPosition && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">{editingPosition.title}</div>
                <div className="text-sm text-muted-foreground">{editingPosition.code}</div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Current Incumbent</Label>
              <Select
                value={formData.current_incumbent_id || 'none'}
                onValueChange={(value) => setFormData({ ...formData, current_incumbent_id: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None / Vacant</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Criticality Level</Label>
                <Select
                  value={formData.criticality_level}
                  onValueChange={(value) => setFormData({ ...formData, criticality_level: value })}
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

              <div className="space-y-2">
                <Label>Vacancy Risk</Label>
                <Select
                  value={formData.vacancy_risk}
                  onValueChange={(value) => setFormData({ ...formData, vacancy_risk: value })}
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
            </div>

            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.retirement_risk}
                  onCheckedChange={(checked) => setFormData({ ...formData, retirement_risk: checked })}
                />
                <Label>Retirement Risk</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.flight_risk}
                  onCheckedChange={(checked) => setFormData({ ...formData, flight_risk: checked })}
                />
                <Label>Flight Risk</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Impact if Vacant</Label>
              <Textarea
                value={formData.impact_if_vacant}
                onChange={(e) => setFormData({ ...formData, impact_if_vacant: e.target.value })}
                placeholder="Describe the business impact if this position becomes vacant..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Risk Notes</Label>
              <Textarea
                value={formData.risk_notes}
                onChange={(e) => setFormData({ ...formData, risk_notes: e.target.value })}
                placeholder="Additional risk assessment notes..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingPosition?.riskAssessment ? 'Update' : 'Save'} Assessment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
