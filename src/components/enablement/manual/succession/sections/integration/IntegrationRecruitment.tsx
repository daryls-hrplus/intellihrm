import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Users,
  ArrowRight,
  Star,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  BusinessRules,
  StepByStep,
  type BusinessRule,
  type Step
} from '@/components/enablement/manual/components';

const internalMobilitySteps: Step[] = [
  {
    title: 'Key Position Vacancy Occurs',
    description: 'Position becomes vacant or succession plan indicates upcoming transition.',
    notes: ['Vacancy reason captured (resignation, promotion, retirement)', 'Expected date recorded'],
    expectedResult: 'Succession plan status updated to "active_search"'
  },
  {
    title: 'Internal Candidates Surfaced',
    description: 'System auto-identifies succession candidates for the position.',
    notes: ['Ranked by readiness score and Nine-Box position', 'Flight risk and availability status shown'],
    expectedResult: 'Candidate list generated with readiness indicators'
  },
  {
    title: 'Fast-Track Internal Posting',
    description: 'HR creates internal-only requisition with succession candidate visibility.',
    notes: ['Succession candidates see position before general population', 'Fast-track application workflow'],
    expectedResult: 'Internal requisition linked to succession plan'
  },
  {
    title: 'Hiring Manager Reviews Succession Data',
    description: 'Hiring manager sees Nine-Box, readiness, and development history for internal candidates.',
    notes: ['One-click access to succession profile', 'Comparison view for multiple candidates'],
    expectedResult: 'Informed hiring decision with succession context'
  },
  {
    title: 'Internal Hire Completes',
    description: 'Candidate selected and offer accepted.',
    notes: ['Succession plan updated to "filled_internal"', 'New vacancy created in source position'],
    expectedResult: 'Succession pipeline refreshed for both positions'
  },
  {
    title: 'Cascade Succession Updates',
    description: 'System updates all affected succession plans.',
    notes: ['Vacated position triggers new succession plan', 'Talent pool membership adjusted'],
    expectedResult: 'Succession ecosystem reflects organizational change'
  }
];

const recruitmentRules: BusinessRule[] = [
  { rule: 'Internal candidates see postings first', enforcement: 'Policy', description: 'Key positions posted internally for 5 business days before external posting' },
  { rule: 'Succession candidates are auto-notified', enforcement: 'System', description: 'Candidates on succession plans receive automated notification of relevant postings' },
  { rule: 'Readiness data informs hiring', enforcement: 'Policy', description: 'Hiring managers must review succession data before interviewing internal candidates' },
  { rule: 'Declined internal offers tracked', enforcement: 'System', description: 'If succession candidate declines, reason captured for flight risk analysis' },
  { rule: 'External hire triggers gap analysis', enforcement: 'System', description: 'If no internal candidate selected, system flags succession pipeline gap' },
  { rule: 'Promotion updates Nine-Box', enforcement: 'System', description: 'Internal hire triggers Nine-Box reassessment in new role context' }
];

export function IntegrationRecruitment() {
  return (
    <section id="sec-9-14" data-manual-anchor="sec-9-14" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <Briefcase className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">9.14 Internal Recruitment Integration</h3>
          <p className="text-sm text-muted-foreground">
            Fast-track succession candidates for internal mobility (Workday/Oracle pattern)
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Configure internal posting visibility for succession candidates',
        'Integrate succession readiness data into hiring workflows',
        'Automate succession plan updates on internal hire completion',
        'Track internal mobility metrics for succession effectiveness'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Succession → Recruitment Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Internal recruitment leverages succession data for faster, better hiring decisions:
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <Star className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <h4 className="font-medium">Ready Now Candidates</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Immediately eligible for position
              </p>
              <Badge className="mt-2 bg-green-500">Priority 1</Badge>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium">Ready 1-2 Years</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Development plan to close gaps
              </p>
              <Badge variant="secondary" className="mt-2">Priority 2</Badge>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-medium">Talent Pool Members</h4>
              <p className="text-xs text-muted-foreground mt-1">
                High-potential, multiple paths
              </p>
              <Badge variant="outline" className="mt-2">Priority 3</Badge>
            </div>
          </div>

          <InfoCallout>
            Succession candidate ranking in recruitment considers: readiness score (40%), 
            Nine-Box position (30%), manager recommendation (20%), and time in role (10%).
          </InfoCallout>
        </CardContent>
      </Card>

      <StepByStep steps={internalMobilitySteps} title="Internal Mobility Workflow" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Data Flow: Succession → Recruitment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The following data passes from succession to recruitment modules:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Succession Data</th>
                  <th className="text-left py-2 px-3">Recruitment Usage</th>
                  <th className="text-left py-2 px-3">Visibility</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3">Nine-Box Position</td>
                  <td className="py-2 px-3">Candidate ranking indicator</td>
                  <td className="py-2 px-3"><Badge variant="outline">Hiring Manager</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Readiness Score</td>
                  <td className="py-2 px-3">Role fit assessment</td>
                  <td className="py-2 px-3"><Badge variant="outline">Hiring Manager</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Competency Gaps</td>
                  <td className="py-2 px-3">Development plan preview</td>
                  <td className="py-2 px-3"><Badge variant="outline">HR Only</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Flight Risk Score</td>
                  <td className="py-2 px-3">Urgency prioritization</td>
                  <td className="py-2 px-3"><Badge variant="outline">HR Only</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Manager Endorsement</td>
                  <td className="py-2 px-3">Reference indicator</td>
                  <td className="py-2 px-3"><Badge variant="outline">Hiring Manager</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>

          <WarningCallout>
            Flight risk and detailed competency data should only be visible to HR partners, 
            not hiring managers, to prevent bias in selection decisions.
          </WarningCallout>
        </CardContent>
      </Card>

      <BusinessRules rules={recruitmentRules} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Integration Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Key Position Vacancy → Surface Candidates
              </h4>
              <div className="text-xs space-y-1 font-mono">
                <p>trigger_event: 'key_position_vacancy'</p>
                <p>condition_type: 'position_has_plan'</p>
                <p>target_module: 'recruitment'</p>
                <p>action_type: 'create_candidate_shortlist'</p>
                <p>action_config: {"{ include_readiness: true }"}</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                Internal Hire → Update Succession
              </h4>
              <div className="text-xs space-y-1 font-mono">
                <p>trigger_event: 'internal_hire_completed'</p>
                <p>condition_type: 'candidate_on_plan'</p>
                <p>target_module: 'succession'</p>
                <p>action_type: 'mark_candidate_promoted'</p>
                <p>action_config: {"{ cascade: true }"}</p>
              </div>
            </div>
          </div>

          <TipCallout>
            Enable <strong>Succession Visibility</strong> in Recruitment Settings to show 
            succession candidate indicators on internal applicant profiles. This feature 
            requires both Succession and Recruitment modules to be active.
          </TipCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Internal Mobility Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Track succession effectiveness through internal mobility analytics:
          </p>

          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">72%</p>
              <p className="text-xs text-muted-foreground">Key positions filled internally</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">14 days</p>
              <p className="text-xs text-muted-foreground">Avg. time-to-fill (internal)</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">89%</p>
              <p className="text-xs text-muted-foreground">Ready Now promotion success</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-amber-600">3.2x</p>
              <p className="text-xs text-muted-foreground">Succession bench ratio</p>
            </div>
          </div>

          <InfoCallout>
            Access internal mobility dashboards from <strong>Succession → Analytics → 
            Internal Mobility</strong>. Configure targets in <strong>Governance → 
            Success Metrics</strong>.
          </InfoCallout>
        </CardContent>
      </Card>
    </section>
  );
}
