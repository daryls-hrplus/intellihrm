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
  Scale,
  User,
  UserCheck,
  Briefcase,
  TrendingUp,
  Table
} from 'lucide-react';

export function ManualQuickReference() {
  return (
    <div id="quick-ref" data-manual-anchor="quick-ref" className="space-y-8 scroll-mt-32">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Quick Reference Cards</h2>
        <p className="text-muted-foreground">Condensed guides for common tasks — organized by user persona</p>
      </div>

      {/* Section: Persona Journey Cards */}
      <div className="space-y-2 mb-6">
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
          <Users className="h-5 w-5" />
          Persona Journey Cards
        </h3>
        <p className="text-sm text-muted-foreground">Role-specific guides aligned with Section 1.3 User Personas and Journeys</p>
      </div>

      {/* Employee Self-Service Journey Card */}
      <Card className="border-2 border-green-500/30">
        <CardHeader className="bg-green-500/10">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            <CardTitle>Employee Self-Service Journey</CardTitle>
            <Badge className="ml-auto bg-green-600 text-white">ESS</Badge>
          </div>
          <CardDescription>7-step journey from notification to final rating • 35-75 min total</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Template awareness note */}
          <div className="mb-4 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Components vary by cycle template. Your cycle may include 1-4 rating areas (Goals, Responsibilities, Competencies, Values).
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                <h4 className="font-semibold text-sm">NOTIFICATION</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Day 1</p>
              <div className="space-y-1">
                {['Receive cycle email', 'Review timeline & deadlines', 'Access ESS portal'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Checkbox className="h-3 w-3" /><span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                <h4 className="font-semibold text-sm">SELF-ASSESSMENT</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Week 1-2 • 15-30 min</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Review enabled components</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Rate <strong>Goals</strong> with evidence <span className="text-muted-foreground">(if enabled)</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Rate <strong>Responsibilities/KRAs</strong> <span className="text-muted-foreground">(if enabled)</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Rate <strong>Competencies</strong> <span className="text-muted-foreground">(if enabled)</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Rate <strong>Values</strong> <span className="text-muted-foreground">(if enabled)</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Complete self-reflection narrative</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Submit self-assessment</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center font-bold">3</span>
                <h4 className="font-semibold text-sm text-muted-foreground">AWAIT REVIEW</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Week 3-4</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• Manager reviews and rates</p>
                <p>• Calibration session held</p>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">4</span>
                <h4 className="font-semibold text-sm">REVIEW MEETING</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Scheduled</p>
              <div className="space-y-1">
                {['Receive interview invitation', 'Prepare discussion points', 'Attend review meeting'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Checkbox className="h-3 w-3" /><span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">5</span>
                <h4 className="font-semibold text-sm">ACKNOWLEDGMENT</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Within 5 days • 5-10 min</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Review manager's evaluation & final score</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Compare to your self-assessment</span>
                </div>
                <div className="text-xs mt-1 mb-1 font-medium">Select response:</div>
                <div className="pl-2 space-y-0.5 text-xs">
                  <p>• <strong>Agree</strong> – Accept as written</p>
                  <p>• <strong>Partially Disagree</strong> – Accept with concerns</p>
                  <p>• <strong>Disagree</strong> – Triggers HR notification</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Add comments explaining perspective</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Submit acknowledgment</span>
                </div>
              </div>
            </div>
            
            {/* NEW: Escalation/Dispute Step */}
            <div className="p-4 border rounded-lg bg-amber-500/10 border-amber-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">5a</span>
                <h4 className="font-semibold text-sm text-amber-700 dark:text-amber-400">ESCALATION</h4>
                <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">Optional</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Within dispute window • 10-15 min</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Click "File Dispute" if disagreeing</span>
                </div>
                <div className="text-xs mt-1 mb-1 font-medium">Select dispute category:</div>
                <div className="pl-2 space-y-0.5 text-xs text-muted-foreground">
                  <p>• Score Inaccuracy</p>
                  <p>• Missing Evidence</p>
                  <p>• Bias Concern</p>
                  <p>• Process Violation</p>
                  <p>• Missing Context</p>
                  <p>• Other</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Provide detailed justification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Attach supporting evidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Submit dispute (HR & Manager notified)</span>
                </div>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 italic">Note: Disputes are part of permanent record.</p>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">6</span>
                <h4 className="font-semibold text-sm">FINAL RATING</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">After cycle close</p>
              <div className="space-y-1">
                {['View finalized rating', 'Review performance category', 'Access development recommendations'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Checkbox className="h-3 w-3" /><span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 border-l-4 border-l-green-600 bg-green-500/10 rounded-r-lg">
            <h4 className="font-semibold text-sm mb-1">Success Indicators</h4>
            <p className="text-xs text-muted-foreground">Self-assessment submitted before deadline • All enabled components rated with evidence • Response submitted within acknowledgment window • Disputes filed with evidence and valid category (if applicable)</p>
          </div>
        </CardContent>
      </Card>

      {/* Manager Evaluation Journey Card */}
      <Card className="border-2 border-blue-500/30">
        <CardHeader className="bg-blue-500/10">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            <CardTitle>Manager Evaluation Journey</CardTitle>
            <Badge className="ml-auto bg-blue-600 text-white">MSS</Badge>
          </div>
          <CardDescription>10-step journey for evaluating direct reports • 3-5 hours per cycle</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Template awareness note */}
          <div className="mb-4 p-3 border-l-4 border-l-blue-500 bg-blue-500/10 rounded-r-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Template-Aware:</strong> Rating components (Goals, Responsibilities, Competencies, Values) vary by cycle template. 
              For role changes, use Role Segment Timeline. For multi-position employees, review Position Weights.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Step 1: Enrollment Review */}
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                <h4 className="font-semibold text-xs">ENROLLMENT REVIEW</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Cycle Start</p>
              <div className="space-y-1">
                {['Verify direct reports enrolled', 'Check dotted-line assignments', 'Review multi-position employees', 'Note any role changes mid-cycle'].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Checkbox className="h-3 w-3" /><span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Step 2: Review Self-Assessments */}
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                <h4 className="font-semibold text-xs">REVIEW SELF-ASSESSMENTS</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">After submissions</p>
              <div className="space-y-1">
                {['Access team dashboard', 'Read each self-assessment', 'Note agreement areas', 'Identify gaps for discussion'].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Checkbox className="h-3 w-3" /><span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Step 3: Rate Components - Template Aware */}
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                <h4 className="font-semibold text-xs">RATE COMPONENTS</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Week 2-3 • 20-30 min/emp</p>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Rate <strong>Goals</strong> (if enabled)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Rate <strong>Responsibilities/KRAs</strong> (if enabled)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Rate <strong>Competencies</strong> (if enabled)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Rate <strong>Values</strong> (if enabled)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Handle <strong>Role Segments</strong> if role changed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Adjust <strong>Position Weights</strong> if multi-position</span>
                </div>
              </div>
            </div>
            
            {/* Step 4: AI Assistant - Enhanced */}
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">4</span>
                <h4 className="font-semibold text-xs">USE AI ASSISTANT</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">5-10 min/employee</p>
              <div className="space-y-1">
                {[
                  'Generate narrative draft',
                  'Review AI confidence score',
                  'Edit and personalize',
                  'Address bias alert flags',
                  'Check comment quality (≥80%)',
                  'Review proficiency impact',
                  'Preview downstream actions'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Checkbox className="h-3 w-3" /><span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Step 5: Submit Evaluations - Approval Workflow */}
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">5</span>
                <h4 className="font-semibold text-xs">SUBMIT EVALUATIONS</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Before deadline</p>
              <div className="space-y-1">
                {[
                  'Review team score distribution',
                  'Verify all enabled components rated',
                  'Check comment quality ≥80%',
                  'Click "Submit for Approval"'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Checkbox className="h-3 w-3" /><span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 italic">Triggers approval workflow</p>
            </div>
            
            {/* Step 5a: Await Approval - NEW */}
            <div className="p-3 border rounded-lg bg-blue-500/10 border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center font-bold">5a</span>
                <h4 className="font-semibold text-xs">AWAIT APPROVAL</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">2-5 business days</p>
              <div className="space-y-1">
                {[
                  'Monitor status in workflow dashboard',
                  'Respond to approval queries',
                  'Justify outlier ratings if asked'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Checkbox className="h-3 w-3" /><span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs">
                <p className="font-medium">Approval Chain:</p>
                <p className="text-muted-foreground">• Skip-Level Manager (72h SLA)</p>
                <p className="text-muted-foreground">• HR Representative (48h SLA)</p>
              </div>
            </div>
            
            {/* Step 6: Calibration Session */}
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">6</span>
                <h4 className="font-semibold text-xs">CALIBRATION SESSION</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Scheduled</p>
              <div className="space-y-1">
                {[
                  'Review pre-calibration analysis',
                  'Prepare justification for extremes (1s/5s)',
                  'Bring evidence for borderline cases',
                  'Participate in calibration',
                  'Accept/contest adjustments',
                  'Document calibration rationale'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Checkbox className="h-3 w-3" /><span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Step 7: Conduct Meetings - Enhanced */}
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">7</span>
                <h4 className="font-semibold text-xs">CONDUCT MEETINGS</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Post-calibration • 45-60 min</p>
              <div className="space-y-1">
                {[
                  'Share evaluation 24h before',
                  'Schedule via interview module',
                  'Configure meeting format',
                  'Conduct performance discussion',
                  'Mark interview complete (required)',
                  'Log interview notes'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Checkbox className="h-3 w-3" /><span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Step 8: Process Acknowledgments - Response Types */}
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">8</span>
                <h4 className="font-semibold text-xs">PROCESS ACKNOWLEDGMENTS</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Final week</p>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Monitor team acknowledgment status</span>
                </div>
                <div className="text-xs mt-1 mb-1 font-medium">Review responses by type:</div>
                <div className="pl-2 space-y-0.5 text-xs text-muted-foreground">
                  <p>• <strong>Agree</strong> - No action required</p>
                  <p>• <strong>Partially Disagree</strong> - Review concerns</p>
                  <p>• <strong>Disagree</strong> - Await HR escalation</p>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Checkbox className="h-3 w-3" /><span className="text-xs">Address factual corrections</span>
                </div>
              </div>
            </div>
            
            {/* Step 8a: Dispute Rebuttal - NEW */}
            <div className="p-3 border rounded-lg bg-amber-500/10 border-amber-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">8a</span>
                <h4 className="font-semibold text-xs text-amber-700 dark:text-amber-400">DISPUTE REBUTTAL</h4>
                <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">If Filed</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Within dispute window • 15-30 min</p>
              <div className="space-y-1">
                {[
                  'Receive dispute notification',
                  'Review employee justification',
                  'Consider dispute category'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Checkbox className="h-3 w-3" /><span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs mt-2 font-medium">Resolution paths:</div>
              <div className="pl-2 space-y-0.5 text-xs text-muted-foreground">
                <p>• <strong>Accept</strong> - Revise rating with justification</p>
                <p>• <strong>Rebuttal</strong> - Submit counter-rationale</p>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 italic">If unresolved, HR makes final determination.</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 border-l-4 border-l-blue-600 bg-blue-500/10 rounded-r-lg">
            <h4 className="font-semibold text-sm mb-1">Success Indicators</h4>
            <p className="text-xs text-muted-foreground">All evaluations submitted before deadline • All enabled components rated with evidence • Comment quality ≥80% • Approval workflow completed within SLA • Team distribution aligns with calibration guidelines • All review meetings conducted and logged • 100% acknowledgment rate • Disputes resolved with documented rationale (if applicable)</p>
          </div>
        </CardContent>
      </Card>

      {/* HR Partner / HR Ops Cycle Management Journey Card */}
      <Card className="border-2 border-violet-500/30">
        <CardHeader className="bg-violet-500/10">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-violet-600" />
            <CardTitle>HR Partner / HR Ops Cycle Management Journey</CardTitle>
            <Badge className="ml-auto bg-violet-600 text-white">HR</Badge>
          </div>
          <CardDescription>8-step journey for managing the full appraisal cycle • 10-20 hours per cycle</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { step: 1, title: 'CONFIGURE CYCLE', time: 'Pre-cycle • 2-4 hrs', items: ['Set cycle dates', 'Configure rating scales', 'Update form templates', 'Define eligibility', 'Set component weights', 'Configure governance'] },
              { step: 2, title: 'ENROLL PARTICIPANTS', time: 'Cycle start • 1-2 hrs', items: ['Run eligibility check', 'Bulk enroll participants', 'Assign evaluators', 'Handle exceptions', 'Activate cycle'] },
              { step: 3, title: 'MONITOR PROGRESS', time: 'Ongoing • 30 min/day', items: ['Check completion rates', 'Review deadline compliance', 'Identify at-risk', 'Run progress reports'] },
              { step: 4, title: 'SEND REMINDERS', time: 'As needed', items: ['Configure templates', 'Send bulk notifications', 'Escalate overdue items'] },
              { step: 5, title: 'FACILITATE CALIBRATION', time: 'Mid-cycle • 2-4 hrs', items: ['Schedule sessions', 'Prepare distribution analysis', 'Run calibration meeting', 'Document adjustments', 'Apply governance rules'] },
              { step: 6, title: 'REVIEW AI ALERTS', time: 'During calibration', items: ['Check bias flags', 'Review manager patterns', 'Investigate alerts', 'Document interventions'] },
              { step: 7, title: 'PROCESS OUTCOMES', time: 'Post-calibration', items: ['Finalize scores', 'Execute action rules', 'Trigger IDP/PIP workflows', 'Update integrations'] },
              { step: 8, title: 'GENERATE REPORTS', time: 'Cycle end • 2-3 hrs', items: ['Run distribution reports', 'Generate nine-box', 'Create exec dashboards', 'Export compliance docs', 'Archive cycle data'] }
            ].map((phase) => (
              <div key={phase.step} className="p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-bold">{phase.step}</span>
                  <h4 className="font-semibold text-xs">{phase.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{phase.time}</p>
                <div className="space-y-1">
                  {phase.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <Checkbox className="h-3 w-3" /><span className="text-xs">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 border-l-4 border-l-violet-600 bg-violet-500/10 rounded-r-lg">
            <h4 className="font-semibold text-sm mb-1">Success Indicators</h4>
            <p className="text-xs text-muted-foreground">95%+ completion rate • All calibrations documented • Action rules executed • Reports delivered on time</p>
          </div>
        </CardContent>
      </Card>

      {/* Executive Strategic Insights Card */}
      <Card className="border-2 border-amber-500/30">
        <CardHeader className="bg-amber-500/10">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            <CardTitle>Executive Strategic Insights Guide</CardTitle>
            <Badge className="ml-auto bg-amber-600 text-white">EXEC</Badge>
          </div>
          <CardDescription>6 key dashboards and metrics for leadership • 1-2 hours per quarter</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { num: 1, title: 'PERFORMANCE DISTRIBUTION', metrics: ['Overall rating bell curve', 'Department comparisons', 'Year-over-year trends'], location: 'Analytics > Distribution Dashboard' },
              { num: 2, title: 'NINE-BOX SUMMARY', metrics: ['High performer/potential count', 'At-risk talent identification', 'Movement between boxes'], location: 'Talent > Nine-Box Grid' },
              { num: 3, title: 'HIGH PERFORMER RETENTION', metrics: ['Top performer by dept', 'Retention risk indicators', 'Flight risk alerts'], location: 'Analytics > Retention Dashboard' },
              { num: 4, title: 'SUCCESSION PIPELINE', metrics: ['Ready-now candidates', 'Coverage ratio', 'Development progress'], location: 'Succession > Pipeline Summary' },
              { num: 5, title: 'CALIBRATION ADJUSTMENTS', metrics: ['Pre vs post distribution', 'Adjustment magnitude', 'Governance rule triggers'], location: 'Calibration > Adjustment Report' },
              { num: 6, title: 'CYCLE COMPLETION RATE', metrics: ['Overall completion %', 'Department breakdown', 'Overdue/at-risk count'], location: 'Analytics > Completion Dashboard' }
            ].map((dash) => (
              <div key={dash.num} className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">{dash.num}</span>
                  <h4 className="font-semibold text-sm">{dash.title}</h4>
                </div>
                <div className="space-y-1 mb-3">
                  {dash.metrics.map((metric, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {metric}</p>
                  ))}
                </div>
                <p className="text-xs font-mono bg-background border px-2 py-1 rounded">{dash.location}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="p-3 border-l-4 border-l-amber-600 bg-amber-500/10 rounded-r-lg">
              <h4 className="font-semibold text-sm mb-2">Approval Responsibilities</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• Calibration session sign-off (when required)</p>
                <p>• High-stakes rating exceptions</p>
                <p>• Forced distribution overrides</p>
              </div>
            </div>
            <div className="p-3 border-l-4 border-l-amber-600 bg-amber-500/10 rounded-r-lg">
              <h4 className="font-semibold text-sm mb-2">Questions to Ask HR</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• What drove the rating distribution shift?</p>
                <p>• Who are our emerging high-potentials?</p>
                <p>• What's the plan for bottom-box performers?</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Cycle Phase Reference - Cross-Persona Matrix */}
      <Card className="border-2 border-primary/30">
        <CardHeader className="bg-primary/10">
          <div className="flex items-center gap-2">
            <Table className="h-5 w-5 text-primary" />
            <CardTitle>Performance Cycle Phase Reference</CardTitle>
          </div>
          <CardDescription>Who does what, when — cross-persona view by cycle phase</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-semibold">Phase</th>
                  <th className="text-left py-2 px-3"><Badge className="bg-green-600 text-white">Employee</Badge></th>
                  <th className="text-left py-2 px-3"><Badge className="bg-blue-600 text-white">Manager</Badge></th>
                  <th className="text-left py-2 px-3"><Badge className="bg-violet-600 text-white">HR Partner</Badge></th>
                  <th className="text-left py-2 px-3"><Badge className="bg-amber-600 text-white">Executive</Badge></th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {[
                  { phase: 'Pre-cycle', employee: '—', manager: '—', hr: 'Configure settings', exec: '—' },
                  { phase: 'Cycle Start', employee: 'Receive notification', manager: 'Review enrollment', hr: 'Enroll participants', exec: '—' },
                  { phase: 'Week 1-2', employee: 'Self-assessment', manager: 'Wait', hr: 'Monitor progress', exec: '—' },
                  { phase: 'Week 2-4', employee: 'Wait', manager: 'Evaluate team', hr: 'Send reminders', exec: '—' },
                  { phase: 'Mid-cycle', employee: '—', manager: 'Calibration prep', hr: 'Facilitate calibration', exec: 'Review distributions' },
                  { phase: 'Post-calibration', employee: 'Review meeting', manager: 'Conduct meetings', hr: 'Process outcomes', exec: 'Approve results' },
                  { phase: 'Final Week', employee: 'Acknowledge', manager: 'Address responses', hr: 'Generate reports', exec: 'Review dashboards' }
                ].map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 px-3 font-medium">{row.phase}</td>
                    <td className="py-2 px-3 text-muted-foreground">{row.employee}</td>
                    <td className="py-2 px-3 text-muted-foreground">{row.manager}</td>
                    <td className="py-2 px-3 text-muted-foreground">{row.hr}</td>
                    <td className="py-2 px-3 text-muted-foreground">{row.exec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-3 border rounded-lg bg-muted/50">
            <h4 className="font-semibold text-sm mb-2">Legend</h4>
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1"><Badge className="bg-green-600 text-white h-5">ESS</Badge> Employee Self-Service</div>
              <div className="flex items-center gap-1"><Badge className="bg-blue-600 text-white h-5">MSS</Badge> Manager Self-Service</div>
              <div className="flex items-center gap-1"><Badge className="bg-violet-600 text-white h-5">HR</Badge> HR Partner / HR Ops</div>
              <div className="flex items-center gap-1"><Badge className="bg-amber-600 text-white h-5">EXEC</Badge> Executive/Leadership</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Divider for Task-Based Cards */}
      <div className="space-y-2 mt-10 mb-6 pt-6 border-t">
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Task-Based Quick Reference Cards
        </h3>
        <p className="text-sm text-muted-foreground">Condensed guides for specific configuration and operational tasks</p>
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
          <div className="mt-4 p-4 border-l-4 border-l-primary bg-primary/20 rounded-r-lg">
            <h4 className="font-semibold text-sm mb-2">Response Status Options</h4>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-600 text-white hover:bg-green-700">agree</Badge>
              <Badge className="bg-red-600 text-white hover:bg-red-700">disagree</Badge>
              <Badge className="bg-amber-600 text-white hover:bg-amber-700">partial_agree</Badge>
              <Badge variant="outline" className="border-2 border-primary">pending</Badge>
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
              <h4 className="font-semibold mb-3">Interview Status Flow</h4>
              <div className="flex flex-wrap gap-2">
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
              <h4 className="font-semibold mb-3">Evaluation Modes</h4>
              <div className="space-y-3">
                <div className="p-3 border-2 border-primary bg-primary/20 rounded-lg">
                  <Badge className="mb-2 bg-primary text-primary-foreground">aggregate</Badge>
                  <p className="text-sm">Combine weighted scores from all positions into one overall score</p>
                </div>
                <div className="p-3 border-2 border-muted-foreground/30 bg-muted rounded-lg">
                  <Badge variant="outline" className="mb-2 border-2">separate</Badge>
                  <p className="text-sm">Evaluate each position independently with separate scores</p>
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
            <div className="p-4 border-2 border-primary bg-primary/20 rounded-lg">
              <h4 className="font-semibold mb-2">Role Segment Structure</h4>
              <p className="text-sm mb-3">Each segment represents a period where the employee held a specific position:</p>
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
            <div className="p-4 border-2 border-blue-500 bg-blue-500/20 rounded-lg">
              <h4 className="font-semibold mb-3">Score Calculation</h4>
              <p className="text-sm font-mono bg-background border-2 border-blue-500 px-3 py-2 rounded">Final score = Σ (Segment Score × Contribution %)</p>
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
              <h4 className="font-semibold mb-3">Scoring Components</h4>
              <div className="space-y-2 text-sm">
                <div className="p-2 border-2 border-primary bg-primary/20 rounded-lg font-mono">value_id - Reference to company value</div>
                <div className="p-2 border-2 border-primary bg-primary/20 rounded-lg font-mono">score - Numeric rating</div>
                <div className="p-2 border-2 border-primary bg-primary/20 rounded-lg font-mono">demonstrated_behaviors - Evidence text</div>
                <div className="p-2 border-2 border-primary bg-primary/20 rounded-lg font-mono">manager_comments - Additional feedback</div>
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
          <div className="mt-4 p-4 border-2 border-primary bg-primary/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Execution Status Flow</h4>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-amber-600 text-white">pending</Badge>
              <span className="font-bold text-lg">→</span>
              <Badge className="bg-green-600 text-white">executed</Badge>
              <span className="font-medium">or</span>
              <Badge className="bg-gray-600 text-white">overridden</Badge>
              <span className="font-bold text-lg">→</span>
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
