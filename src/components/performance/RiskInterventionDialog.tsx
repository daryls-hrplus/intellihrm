import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';
import { useTalentRiskAnalysis } from '@/hooks/useTalentRiskAnalysis';

interface RiskInterventionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk: any;
  companyId?: string;
}

const INTERVENTION_TYPES = [
  { value: 'coaching', label: 'Coaching Session' },
  { value: 'training', label: 'Training Program' },
  { value: 'career_discussion', label: 'Career Development Discussion' },
  { value: 'compensation_review', label: 'Compensation Review' },
  { value: 'role_change', label: 'Role/Responsibility Change' },
  { value: 'mentoring', label: 'Mentoring Assignment' },
  { value: 'stretch_assignment', label: 'Stretch Assignment' },
  { value: 'retention_package', label: 'Retention Package' },
];

export function RiskInterventionDialog({
  open,
  onOpenChange,
  risk,
  companyId
}: RiskInterventionDialogProps) {
  const { createIntervention } = useTalentRiskAnalysis(companyId);
  
  const [interventionType, setInterventionType] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!interventionType || !description) return;

    setIsSubmitting(true);
    try {
      await createIntervention({
        employee_id: risk.employee_id,
        risk_id: risk.id,
        intervention_type: interventionType,
        description,
        due_date: dueDate || undefined
      });
      onOpenChange(false);
      setInterventionType('');
      setDescription('');
      setDueDate('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatCategory = (category: string) => {
    return category
      ?.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const contributingFactors = Array.isArray(risk.contributing_factors) 
    ? risk.contributing_factors 
    : [];
  
  const recommendedInterventions = Array.isArray(risk.recommended_interventions) 
    ? risk.recommended_interventions 
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Risk Assessment Details
          </DialogTitle>
          <DialogDescription>
            Review risk factors and create an intervention plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {risk.profiles?.first_name} {risk.profiles?.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {risk.profiles?.departments?.name || 'No department'}
              </p>
            </div>
            <div className="text-right">
              <Badge className={getRiskColor(risk.risk_level)}>
                {risk.risk_level?.toUpperCase()} RISK
              </Badge>
              <p className="text-sm mt-1">Score: {risk.risk_score}/100</p>
            </div>
          </div>

          {/* Risk Category */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="font-medium">Primary Risk Category</span>
              </div>
              <Badge variant="outline" className="text-sm">
                {formatCategory(risk.risk_category)}
              </Badge>
            </CardContent>
          </Card>

          {/* Contributing Factors */}
          {contributingFactors.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Contributing Factors</span>
                </div>
                <ul className="space-y-2">
                  {contributingFactors.map((factor: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground">•</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* AI Recommended Interventions */}
          {recommendedInterventions.length > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="font-medium">AI Recommended Actions</span>
                </div>
                <ul className="space-y-2">
                  {recommendedInterventions.map((action: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {action}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Create Intervention Form */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-4">Create Intervention</h4>
            <div className="space-y-4">
              <div>
                <Label>Intervention Type</Label>
                <Select value={interventionType} onValueChange={setInterventionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select intervention type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVENTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the intervention plan..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Due Date (Optional)</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!interventionType || !description || isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Intervention'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
