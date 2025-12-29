import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Scale, Loader2, ShieldAlert, ShieldCheck, AlertTriangle, Clock, Users } from 'lucide-react';
import { useCBARules, useCreateCBARule, useUpdateCBARule, type CBARule } from '@/hooks/useCBAData';

interface CBARulesTabProps {
  agreementId: string;
}

const RULE_TYPES = [
  { value: 'max_hours', label: 'Maximum Hours', icon: Clock, description: 'Daily/weekly hour limits' },
  { value: 'min_rest_period', label: 'Minimum Rest Period', icon: Clock, description: 'Required rest between shifts' },
  { value: 'overtime_threshold', label: 'Overtime Threshold', icon: Clock, description: 'Hours before overtime applies' },
  { value: 'seniority_bidding', label: 'Seniority Bidding', icon: Users, description: 'Shift selection by seniority' },
  { value: 'shift_premium', label: 'Shift Premium', icon: Scale, description: 'Premium pay for certain shifts' },
  { value: 'weekend_limit', label: 'Weekend Limit', icon: Clock, description: 'Maximum weekend shifts' },
  { value: 'holiday_premium', label: 'Holiday Premium', icon: Scale, description: 'Holiday pay multipliers' },
  { value: 'break_requirement', label: 'Break Requirement', icon: Clock, description: 'Required break periods' },
];

export function CBARulesTab({ agreementId }: CBARulesTabProps) {
  const { t } = useTranslation();
  const { data: rules = [], isLoading } = useCBARules(agreementId);
  const createRule = useCreateCBARule();
  const updateRule = useUpdateCBARule();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [form, setForm] = useState({
    rule_type: 'max_hours',
    rule_name: '',
    description: '',
    threshold_value: '',
    threshold_unit: 'hours',
    enforcement_action: 'warn',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createRule.mutate({
      agreement_id: agreementId,
      rule_type: form.rule_type,
      rule_name: form.rule_name,
      description: form.description,
      parameters: {
        threshold_value: parseFloat(form.threshold_value),
        threshold_unit: form.threshold_unit,
      },
      enforcement_action: form.enforcement_action,
      is_active: true,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setForm({ rule_type: 'max_hours', rule_name: '', description: '', threshold_value: '', threshold_unit: 'hours', enforcement_action: 'warn' });
      }
    });
  };

  const handleToggleActive = (rule: CBARule) => {
    updateRule.mutate({
      id: rule.id,
      is_active: !rule.is_active,
    });
  };

  const getEnforcementIcon = (action: string) => {
    switch (action) {
      case 'block': return <ShieldAlert className="h-4 w-4 text-destructive" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'log': return <ShieldCheck className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  const getEnforcementColor = (action: string) => {
    switch (action) {
      case 'block': return 'bg-destructive/20 text-destructive';
      case 'warn': return 'bg-yellow-500/20 text-yellow-600';
      case 'log': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted';
    }
  };

  const getRuleTypeInfo = (type: string) => {
    return RULE_TYPES.find(rt => rt.value === type);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-muted-foreground">
            {rules.length} enforceable rule{rules.length !== 1 ? 's' : ''} • 
            {rules.filter(r => r.is_active).length} active
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Enforceable Rule</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Rule Type *</Label>
                <Select value={form.rule_type} onValueChange={(v) => setForm({ ...form, rule_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RULE_TYPES.map(rt => (
                      <SelectItem key={rt.value} value={rt.value}>
                        <div className="flex items-center gap-2">
                          <rt.icon className="h-4 w-4" />
                          <span>{rt.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {getRuleTypeInfo(form.rule_type)?.description}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Rule Name *</Label>
                <Input
                  value={form.rule_name}
                  onChange={(e) => setForm({ ...form, rule_name: e.target.value })}
                  placeholder="e.g., Maximum 8 Hours Per Day"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe when this rule applies"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Threshold Value *</Label>
                  <Input
                    type="number"
                    value={form.threshold_value}
                    onChange={(e) => setForm({ ...form, threshold_value: e.target.value })}
                    placeholder="e.g., 8"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={form.threshold_unit} onValueChange={(v) => setForm({ ...form, threshold_unit: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="percent">Percent</SelectItem>
                      <SelectItem value="count">Count</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Enforcement Action *</Label>
                <Select value={form.enforcement_action} onValueChange={(v) => setForm({ ...form, enforcement_action: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-destructive" />
                        <span>Block - Prevent scheduling violation</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="warn">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span>Warn - Alert but allow override</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="log">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        <span>Log - Record only, no blocking</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createRule.isPending}>
                  {createRule.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Rule
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Scale className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No enforceable rules defined yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Rules are automatically checked during scheduling and time tracking.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Active</TableHead>
              <TableHead>Rule Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Enforcement</TableHead>
              <TableHead>Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => {
              const typeInfo = getRuleTypeInfo(rule.rule_type);
              const params = rule.parameters as { threshold_value?: number; threshold_unit?: string };
              
              return (
                <TableRow key={rule.id} className={!rule.is_active ? 'opacity-50' : ''}>
                  <TableCell>
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={() => handleToggleActive(rule)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{rule.rule_name}</p>
                      {rule.description && (
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {typeInfo && <typeInfo.icon className="h-4 w-4 text-muted-foreground" />}
                      <span>{typeInfo?.label || rule.rule_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {params?.threshold_value} {params?.threshold_unit}
                  </TableCell>
                  <TableCell>
                    <Badge className={getEnforcementColor(rule.enforcement_action)}>
                      <span className="flex items-center gap-1">
                        {getEnforcementIcon(rule.enforcement_action)}
                        {rule.enforcement_action}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>{rule.priority}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
