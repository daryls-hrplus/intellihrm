import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, CheckSquare, ListOrdered, Calendar } from 'lucide-react';

export function ManualQuickReference() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Quick Reference Cards</h2>
        <p className="text-muted-foreground">Condensed guides for common tasks</p>
      </div>

      {/* Cycle Setup Checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <CardTitle>Cycle Setup Checklist</CardTitle>
          </div>
          <CardDescription>Essential steps for launching an appraisal cycle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-3">4-6 Weeks Before</h4>
              <div className="space-y-2">
                {['Verify rating scales', 'Update form templates', 'Define eligibility criteria', 'Set cycle dates'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Checkbox /><span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">1-2 Weeks Before</h4>
              <div className="space-y-2">
                {['Enroll participants', 'Assign evaluators', 'Send communications', 'Activate cycle'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Checkbox /><span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manager Quick Guide */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5 text-primary" />
            <CardTitle>Manager Evaluation Quick Guide</CardTitle>
          </div>
          <CardDescription>10-step summary for completing evaluations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              '1. Access Team Appraisals',
              '2. Select Employee',
              '3. Review Self-Assessment',
              '4. Rate Goals',
              '5. Rate Competencies',
              '6. Rate Responsibilities',
              '7. Use AI Assistant',
              '8. Add Comments',
              '9. Submit Evaluation',
              '10. Schedule Interview'
            ].map((step, i) => (
              <div key={i} className="p-3 bg-muted rounded-lg text-center text-sm">
                {step}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Annual Performance Calendar</CardTitle>
          </div>
          <CardDescription>Timeline for the performance management year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { quarter: 'Q1', activities: 'Goal setting, prior year closeout, compensation processing' },
              { quarter: 'Q2', activities: 'Mid-year check-ins, goal progress reviews' },
              { quarter: 'Q3', activities: 'Development planning, calibration prep' },
              { quarter: 'Q4', activities: 'Annual evaluations, calibration sessions, employee responses' }
            ].map((q) => (
              <div key={q.quarter} className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                <Badge variant="outline" className="h-fit">{q.quarter}</Badge>
                <span className="text-sm">{q.activities}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
