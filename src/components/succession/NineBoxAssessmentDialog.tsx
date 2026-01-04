import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NineBoxAssessment } from '@/hooks/useSuccession';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { getTodayString } from '@/utils/dateUtils';
import { NineBoxEvidencePanel } from './NineBoxEvidencePanel';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NineBoxAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment?: NineBoxAssessment | null;
  companyId: string;
  onSuccess: () => void;
  onCreate: (data: Partial<NineBoxAssessment>) => Promise<any>;
  onUpdate: (id: string, data: Partial<NineBoxAssessment>) => Promise<any>;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
}

interface SuggestedRating {
  rating: number;
  confidence: number;
  sources: string[];
}

export function NineBoxAssessmentDialog({
  open,
  onOpenChange,
  assessment,
  companyId,
  onSuccess,
  onCreate,
  onUpdate,
}: NineBoxAssessmentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState<'assessment' | 'evidence'>('assessment');
  const [suggestedPerformance, setSuggestedPerformance] = useState<SuggestedRating | null>(null);
  const [suggestedPotential, setSuggestedPotential] = useState<SuggestedRating | null>(null);
  const [hasOverride, setHasOverride] = useState({ performance: false, potential: false });
  
  const [formData, setFormData] = useState({
    employee_id: '',
    performance_rating: '2',
    potential_rating: '2',
    performance_notes: '',
    potential_notes: '',
    overall_notes: '',
    assessment_period: '',
    assessment_date: getTodayString(),
  });

  useEffect(() => {
    if (open && companyId) {
      fetchEmployees();
    }
  }, [open, companyId]);

  useEffect(() => {
    if (assessment) {
      setFormData({
        employee_id: assessment.employee_id,
        performance_rating: String(assessment.performance_rating),
        potential_rating: String(assessment.potential_rating),
        performance_notes: assessment.performance_notes || '',
        potential_notes: assessment.potential_notes || '',
        overall_notes: assessment.overall_notes || '',
        assessment_period: assessment.assessment_period || '',
        assessment_date: assessment.assessment_date,
      });
      setHasOverride({ performance: false, potential: false });
    } else {
      setFormData({
        employee_id: '',
        performance_rating: '2',
        potential_rating: '2',
        performance_notes: '',
        potential_notes: '',
        overall_notes: '',
        assessment_period: '',
        assessment_date: getTodayString(),
      });
      setSuggestedPerformance(null);
      setSuggestedPotential(null);
      setHasOverride({ performance: false, potential: false });
    }
  }, [assessment]);

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('company_id', companyId)
      .order('full_name');
    
    setEmployees(data || []);
  };

  const handleSuggestedRatings = (performance: SuggestedRating | null, potential: SuggestedRating | null) => {
    setSuggestedPerformance(performance);
    setSuggestedPotential(potential);
    
    // Auto-apply suggested ratings if available and not editing
    if (!assessment) {
      if (performance && performance.confidence >= 0.6) {
        setFormData(prev => ({ ...prev, performance_rating: String(performance.rating) }));
      }
      if (potential && potential.confidence >= 0.6) {
        setFormData(prev => ({ ...prev, potential_rating: String(potential.rating) }));
      }
    }
  };

  const handlePerformanceChange = (value: string) => {
    setFormData({ ...formData, performance_rating: value });
    if (suggestedPerformance && parseInt(value) !== suggestedPerformance.rating) {
      setHasOverride(prev => ({ ...prev, performance: true }));
    } else {
      setHasOverride(prev => ({ ...prev, performance: false }));
    }
  };

  const handlePotentialChange = (value: string) => {
    setFormData({ ...formData, potential_rating: value });
    if (suggestedPotential && parseInt(value) !== suggestedPotential.rating) {
      setHasOverride(prev => ({ ...prev, potential: true }));
    } else {
      setHasOverride(prev => ({ ...prev, potential: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        employee_id: formData.employee_id,
        performance_rating: parseInt(formData.performance_rating),
        potential_rating: parseInt(formData.potential_rating),
        performance_notes: formData.performance_notes || null,
        potential_notes: formData.potential_notes || null,
        overall_notes: formData.overall_notes || null,
        assessment_period: formData.assessment_period || null,
        assessment_date: formData.assessment_date,
      };

      if (assessment) {
        await onUpdate(assessment.id, submitData);
      } else {
        await onCreate(submitData);
      }

      onSuccess();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (rating: string) => {
    const labels = { '1': 'Low', '2': 'Medium', '3': 'High' };
    return labels[rating as keyof typeof labels] || rating;
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge variant="default" className="bg-green-500">High Confidence</Badge>;
    if (confidence >= 0.6) return <Badge variant="secondary">Medium Confidence</Badge>;
    return <Badge variant="outline">Low Confidence</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assessment ? 'Edit Assessment' : 'New Nine Box Assessment'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'assessment' | 'evidence')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="evidence" disabled={!formData.employee_id}>
              Evidence & Signals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assessment" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                  disabled={!!assessment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* AI Suggested Ratings Alert */}
              {(suggestedPerformance || suggestedPotential) && (
                <Alert className="border-primary/20 bg-primary/5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <AlertDescription className="flex flex-col gap-2">
                    <span className="font-medium">AI-Suggested Ratings Based on Evidence</span>
                    <div className="flex gap-4 text-sm">
                      {suggestedPerformance && (
                        <span>
                          Performance: <strong>{getRatingLabel(String(suggestedPerformance.rating))}</strong>
                          {' '}{getConfidenceBadge(suggestedPerformance.confidence)}
                        </span>
                      )}
                      {suggestedPotential && (
                        <span>
                          Potential: <strong>{getRatingLabel(String(suggestedPotential.rating))}</strong>
                          {' '}{getConfidenceBadge(suggestedPotential.confidence)}
                        </span>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Performance Rating *</Label>
                    {hasOverride.performance && (
                      <Badge variant="outline" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Override
                      </Badge>
                    )}
                  </div>
                  <Select
                    value={formData.performance_rating}
                    onValueChange={handlePerformanceChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Low</SelectItem>
                      <SelectItem value="2">2 - Medium</SelectItem>
                      <SelectItem value="3">3 - High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Potential Rating *</Label>
                    {hasOverride.potential && (
                      <Badge variant="outline" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Override
                      </Badge>
                    )}
                  </div>
                  <Select
                    value={formData.potential_rating}
                    onValueChange={handlePotentialChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Low</SelectItem>
                      <SelectItem value="2">2 - Medium</SelectItem>
                      <SelectItem value="3">3 - High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assessment Date *</Label>
                  <Input
                    type="date"
                    value={formData.assessment_date}
                    onChange={(e) => setFormData({ ...formData, assessment_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Assessment Period</Label>
                  <Input
                    value={formData.assessment_period}
                    onChange={(e) => setFormData({ ...formData, assessment_period: e.target.value })}
                    placeholder="e.g., Q4 2024"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Performance Notes {hasOverride.performance && <span className="text-muted-foreground">(Explain override reason)</span>}</Label>
                <Textarea
                  value={formData.performance_notes}
                  onChange={(e) => setFormData({ ...formData, performance_notes: e.target.value })}
                  placeholder="Notes about performance rating..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Potential Notes {hasOverride.potential && <span className="text-muted-foreground">(Explain override reason)</span>}</Label>
                <Textarea
                  value={formData.potential_notes}
                  onChange={(e) => setFormData({ ...formData, potential_notes: e.target.value })}
                  placeholder="Notes about potential rating..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Overall Notes</Label>
                <Textarea
                  value={formData.overall_notes}
                  onChange={(e) => setFormData({ ...formData, overall_notes: e.target.value })}
                  placeholder="Overall assessment notes..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !formData.employee_id}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {assessment ? 'Update' : 'Create'} Assessment
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="evidence" className="mt-4">
            {formData.employee_id ? (
              <NineBoxEvidencePanel
                employeeId={formData.employee_id}
                companyId={companyId}
                onSuggestedRatings={handleSuggestedRatings}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select an employee to view evidence and signals
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
