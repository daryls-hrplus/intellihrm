import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  CheckSquare, 
  ListOrdered, 
  Calendar, 
  MessageSquare,
  Video,
  Users,
  Star,
  Zap,
  Scale
} from 'lucide-react';

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

      {/* Employee Response Quick Guide */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>Employee Response Quick Guide</CardTitle>
          </div>
          <CardDescription>Steps for reviewing and responding to your evaluation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              '1. Receive Notification',
              '2. Review Manager Rating',
              '3. Compare to Self-Score',
              '4. Select Response Type',
              '5. Add Comments'
            ].map((step, i) => (
              <div key={i} className="p-3 bg-muted rounded-lg text-center text-sm">
                {step}
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 border-l-4 border-l-primary bg-primary/5 rounded-r-lg">
            <h4 className="font-medium text-sm mb-2 text-primary">Response Status Options</h4>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-600 text-white hover:bg-green-700">agree</Badge>
              <Badge className="bg-red-600 text-white hover:bg-red-700">disagree</Badge>
              <Badge className="bg-amber-600 text-white hover:bg-amber-700">partial_agree</Badge>
              <Badge variant="outline" className="border-primary/50">pending</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interview Scheduling Checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <CardTitle>Interview Scheduling Checklist</CardTitle>
          </div>
          <CardDescription>Scheduling and conducting performance review meetings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Meeting Types</h4>
              <div className="space-y-2">
                {['in_person', 'video_call', 'phone_call'].map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <Badge variant="outline">{type}</Badge>
                  </div>
                ))}
              </div>
              <h4 className="font-medium mt-4 mb-3">Video Platforms</h4>
              <div className="flex gap-2">
                <Badge>Zoom</Badge>
                <Badge>Microsoft Teams</Badge>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-primary">Interview Status Flow</h4>
              <div className="space-y-2">
                {[
                  { status: 'scheduled', color: 'bg-blue-600 text-white' },
                  { status: 'confirmed', color: 'bg-green-600 text-white' },
                  { status: 'completed', color: 'bg-emerald-600 text-white' },
                  { status: 'cancelled', color: 'bg-gray-600 text-white' },
                  { status: 'rescheduled', color: 'bg-amber-600 text-white' },
                  { status: 'no_show', color: 'bg-red-600 text-white' }
                ].map((item) => (
                  <Badge key={item.status} className={item.color}>
                    {item.status}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Position Evaluation Guide */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Multi-Position Evaluation Guide</CardTitle>
          </div>
          <CardDescription>Handling employees with multiple concurrent positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-primary">Evaluation Modes</h4>
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-l-primary bg-primary/5 rounded-r-lg">
                  <Badge className="mb-2 bg-primary text-primary-foreground">aggregate</Badge>
                  <p className="text-sm text-muted-foreground">Combine weighted scores from all positions into one overall score</p>
                </div>
                <div className="p-3 border-l-4 border-l-muted-foreground/50 bg-muted/50 rounded-r-lg">
                  <Badge variant="outline" className="mb-2 border-primary/50">separate</Badge>
                  <p className="text-sm text-muted-foreground">Evaluate each position independently with separate scores</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Position Weight Setup</h4>
              <div className="space-y-2">
                {['Identify all active positions', 'Assign weight percentage (must sum to 100%)', 'Configure component weights per position', 'Review aggregated calculation'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Checkbox /><span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Change Handling Guide */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Role Change Handling Guide</CardTitle>
          </div>
          <CardDescription>Managing evaluations when employees change roles mid-cycle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-l-primary bg-primary/5 rounded-r-lg">
              <h4 className="font-medium mb-2 text-primary">Role Segment Structure</h4>
              <p className="text-sm text-muted-foreground mb-3">Each segment represents a period where the employee held a specific position:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <Badge className="bg-primary text-primary-foreground justify-center">position_id</Badge>
                <Badge className="bg-primary text-primary-foreground justify-center">start_date</Badge>
                <Badge className="bg-primary text-primary-foreground justify-center">end_date</Badge>
                <Badge className="bg-primary text-primary-foreground justify-center">contribution_%</Badge>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-3">Setup Steps</h4>
                <div className="space-y-2">
                  {['Enable has_role_change flag', 'Define role segments with dates', 'Set contribution percentages', 'Assign evaluators per segment'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{i+1}</span>
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            <div className="p-4 border-l-4 border-l-blue-500 bg-blue-500/5 rounded-r-lg">
              <h4 className="font-medium mb-3 text-blue-600 dark:text-blue-400">Score Calculation</h4>
              <p className="text-sm font-mono bg-muted px-3 py-2 rounded">Final score = Σ (Segment Score × Contribution %)</p>
            </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Values Assessment Quick Guide */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <CardTitle>Values Assessment Quick Guide</CardTitle>
          </div>
          <CardDescription>Evaluating employee alignment with organizational values</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Configuration</h4>
              <div className="space-y-2">
                {['Enable include_values_assessment on cycle', 'Set values_weight percentage', 'Configure value items from company values', 'Define behavioral indicators'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Checkbox /><span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-primary">Scoring Components</h4>
              <div className="space-y-2 text-sm">
                <div className="p-2 border-l-4 border-l-primary bg-primary/5 rounded-r-lg font-mono">value_id - Reference to company value</div>
                <div className="p-2 border-l-4 border-l-primary bg-primary/5 rounded-r-lg font-mono">score - Numeric rating</div>
                <div className="p-2 border-l-4 border-l-primary bg-primary/5 rounded-r-lg font-mono">demonstrated_behaviors - Evidence text</div>
                <div className="p-2 border-l-4 border-l-primary bg-primary/5 rounded-r-lg font-mono">manager_comments - Additional feedback</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outcome Action Rules Reference */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>Outcome Action Rules Reference</CardTitle>
          </div>
          <CardDescription>Automated actions triggered by appraisal outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-primary">Condition Types</h4>
              <div className="flex flex-wrap gap-2">
                {['score_below', 'score_above', 'repeated_low', 'gap_detected', 'improvement_trend', 'competency_gap', 'goal_not_met'].map((type) => (
                  <Badge key={type} className="bg-amber-600 text-white hover:bg-amber-700">{type}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-primary">Action Types</h4>
              <div className="flex flex-wrap gap-2">
                {['create_idp', 'create_pip', 'suggest_succession', 'block_finalization', 'require_comment', 'notify_hr', 'schedule_coaching', 'require_development_plan'].map((type) => (
                  <Badge key={type} className="bg-primary text-primary-foreground">{type}</Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 border-l-4 border-l-primary bg-primary/5 rounded-r-lg">
            <h4 className="font-medium text-sm mb-2 text-primary">Execution Status Flow</h4>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-amber-600 text-white">pending</Badge>
              <span className="text-primary font-bold">→</span>
              <Badge className="bg-green-600 text-white">executed</Badge>
              <span className="text-muted-foreground">or</span>
              <Badge className="bg-gray-600 text-white">overridden</Badge>
              <span className="text-primary font-bold">→</span>
              <Badge className="bg-primary text-primary-foreground">acknowledged</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calibration Session Checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <CardTitle>Calibration Session Checklist</CardTitle>
          </div>
          <CardDescription>Facilitating fair and consistent rating calibration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Badge className="bg-gray-600 text-white">Pre-Session</Badge>
              </h4>
              <div className="space-y-2">
                {['Gather all submitted evaluations', 'Run distribution analysis', 'Identify rating outliers', 'Prepare nine-box view'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Checkbox /><span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Badge>During Session</Badge>
              </h4>
              <div className="space-y-2">
                {['Review distribution vs targets', 'Discuss outlier cases', 'Apply forced distribution (if enabled)', 'Document adjustment reasons'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Checkbox /><span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Badge className="bg-green-600 text-white">Post-Session</Badge>
              </h4>
              <div className="space-y-2">
                {['Finalize calibrated scores', 'Update post_calibration_score', 'Generate audit trail', 'Communicate to managers'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Checkbox /><span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
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
