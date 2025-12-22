import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, AlertTriangle, Shield, Clock, Plane, Edit, Loader2 } from 'lucide-react';
import { KeyPositionRisk, useSuccession } from '@/hooks/useSuccession';
import { supabase } from '@/integrations/supabase/client';

interface KeyPositionsTabProps {
  companyId: string;
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

  const [positions, setPositions] = useState<KeyPositionRisk[]>([]);
  const [allPositions, setAllPositions] = useState<{ id: string; title: string; code: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPosition, setEditingPosition] = useState<KeyPositionRisk | null>(null);
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
    const [keyPositions] = await Promise.all([
      fetchKeyPositionRisks(),
      loadPositions(),
      loadEmployees(),
    ]);
    setPositions(keyPositions);
  };

  const loadPositions = async () => {
    const { data } = await (supabase
      .from('positions') as any)
      .select('id, title, code')
      .eq('company_id', companyId)
      .order('title');
    setAllPositions(data || []);
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

    if (editingPosition) {
      await updateKeyPositionRisk(editingPosition.id, submitData);
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

  const openEditDialog = (position: KeyPositionRisk) => {
    setEditingPosition(position);
    setFormData({
      position_id: position.position_id,
      criticality_level: position.criticality_level,
      vacancy_risk: position.vacancy_risk,
      impact_if_vacant: position.impact_if_vacant || '',
      current_incumbent_id: position.current_incumbent_id || '',
      retirement_risk: position.retirement_risk,
      flight_risk: position.flight_risk,
      risk_notes: position.risk_notes || '',
    });
    setShowDialog(true);
  };

  const existingPositionIds = positions.map(p => p.position_id);
  const availablePositions = allPositions.filter(p => !existingPositionIds.includes(p.id) || editingPosition?.position_id === p.id);

  const stats = {
    total: positions.length,
    critical: positions.filter(p => p.criticality_level === 'critical').length,
    highVacancyRisk: positions.filter(p => p.vacancy_risk === 'high').length,
    retirementRisk: positions.filter(p => p.retirement_risk).length,
    flightRisk: positions.filter(p => p.flight_risk).length,
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Key Positions</div>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Key Position Risk Assessment</CardTitle>
          <Button onClick={() => { resetForm(); setEditingPosition(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Key Position
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : positions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No key positions identified yet.</p>
              <p className="text-sm">Add key positions to assess succession risk.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Incumbent</TableHead>
                  <TableHead>Criticality</TableHead>
                  <TableHead>Vacancy Risk</TableHead>
                  <TableHead>Risk Indicators</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{position.position?.title}</div>
                        <div className="text-sm text-muted-foreground">{position.position?.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {position.incumbent?.full_name || (
                        <span className="text-muted-foreground italic">Vacant</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={criticalityColors[position.criticality_level]}>
                        {position.criticality_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={vacancyRiskColors[position.vacancy_risk]}>
                        {position.vacancy_risk}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {position.retirement_risk && (
                          <Badge variant="outline" className="border-blue-500 text-blue-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Retirement
                          </Badge>
                        )}
                        {position.flight_risk && (
                          <Badge variant="outline" className="border-purple-500 text-purple-600">
                            <Plane className="h-3 w-3 mr-1" />
                            Flight
                          </Badge>
                        )}
                        {!position.retirement_risk && !position.flight_risk && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-sm truncate">{position.impact_if_vacant || '-'}</p>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(position)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPosition ? 'Edit Key Position' : 'Add Key Position'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Position *</Label>
              <Select
                value={formData.position_id}
                onValueChange={(value) => setFormData({ ...formData, position_id: value })}
                disabled={!!editingPosition}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {availablePositions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>
                      {pos.title} ({pos.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
              <Button onClick={handleSubmit} disabled={!formData.position_id}>
                {editingPosition ? 'Update' : 'Add'} Position
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
