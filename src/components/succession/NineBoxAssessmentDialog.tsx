import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NineBoxAssessment } from '@/hooks/useSuccession';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    employee_id: '',
    performance_rating: '2',
    potential_rating: '2',
    performance_notes: '',
    potential_notes: '',
    overall_notes: '',
    assessment_period: '',
    assessment_date: new Date().toISOString().split('T')[0],
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
    } else {
      setFormData({
        employee_id: '',
        performance_rating: '2',
        potential_rating: '2',
        performance_notes: '',
        potential_notes: '',
        overall_notes: '',
        assessment_period: '',
        assessment_date: new Date().toISOString().split('T')[0],
      });
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

  const ratingLabels = {
    performance: ['Low', 'Medium', 'High'],
    potential: ['Low', 'Medium', 'High'],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {assessment ? 'Edit Assessment' : 'New Nine Box Assessment'}
          </DialogTitle>
        </DialogHeader>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Performance Rating *</Label>
              <Select
                value={formData.performance_rating}
                onValueChange={(value) => setFormData({ ...formData, performance_rating: value })}
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
              <Label>Potential Rating *</Label>
              <Select
                value={formData.potential_rating}
                onValueChange={(value) => setFormData({ ...formData, potential_rating: value })}
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
            <Label>Performance Notes</Label>
            <Textarea
              value={formData.performance_notes}
              onChange={(e) => setFormData({ ...formData, performance_notes: e.target.value })}
              placeholder="Notes about performance rating..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Potential Notes</Label>
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
      </DialogContent>
    </Dialog>
  );
}
