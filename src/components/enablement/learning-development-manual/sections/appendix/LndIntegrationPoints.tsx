import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link2, ArrowRight, ArrowLeftRight } from 'lucide-react';

const INTEGRATION_POINTS = [
  {
    source: 'Onboarding',
    direction: 'bidirectional',
    target: 'L&D',
    trigger: 'onboarding_tasks.training_course_id',
    action: 'Auto-enroll new hire in onboarding courses',
    tables: ['onboarding_tasks', 'lms_enrollments'],
    frequency: 'Per new hire'
  },
  {
    source: 'Performance',
    direction: 'bidirectional',
    target: 'L&D',
    trigger: 'Appraisal completion with development actions',
    action: 'Create training requests from appraisal outcomes',
    tables: ['appraisal_integration_rules', 'training_requests'],
    frequency: 'Per appraisal cycle'
  },
  {
    source: 'Competency',
    direction: 'bidirectional',
    target: 'L&D',
    trigger: 'Skill gap analysis or course completion',
    action: 'Recommend courses for gaps; update skills on completion',
    tables: ['competency_course_mappings', 'employee_competencies'],
    frequency: 'Real-time'
  },
  {
    source: 'Succession',
    direction: 'outbound',
    target: 'L&D',
    trigger: 'Successor readiness assessment',
    action: 'Recommend training for succession candidates',
    tables: ['succession_candidates', 'learning_paths'],
    frequency: 'Per succession review'
  },
  {
    source: 'Career Development',
    direction: 'bidirectional',
    target: 'L&D',
    trigger: 'IDP goal creation or training completion',
    action: 'Link IDP goals to courses; track completion',
    tables: ['career_development_goals', 'lms_enrollments'],
    frequency: 'Real-time'
  },
  {
    source: 'Workflow Engine',
    direction: 'outbound',
    target: 'L&D',
    trigger: 'Training request submission',
    action: 'Route for approval via configured workflow',
    tables: ['workflow_instances', 'training_requests'],
    frequency: 'Per request'
  },
  {
    source: 'Notifications',
    direction: 'outbound',
    target: 'L&D',
    trigger: '34+ event types (enrollment, reminder, completion)',
    action: 'Send email/push notifications',
    tables: ['reminder_schedule', 'notification_queue'],
    frequency: 'Event-driven'
  },
  {
    source: 'Calendar',
    direction: 'outbound',
    target: 'External',
    trigger: 'ILT session scheduling',
    action: 'Sync training sessions to calendar (Google, Outlook)',
    tables: ['training_sessions', 'calendar_events'],
    frequency: 'Per session'
  },
  {
    source: 'Virtual Classroom',
    direction: 'bidirectional',
    target: 'External',
    trigger: 'vILT session creation',
    action: 'Create Teams/Zoom/Meet meeting; track attendance',
    tables: ['training_sessions', 'training_session_attendees'],
    frequency: 'Per session'
  },
  {
    source: 'SCORM/xAPI',
    direction: 'inbound',
    target: 'L&D',
    trigger: 'Content package launch',
    action: 'Track progress, completion, and score',
    tables: ['lms_scorm_packages', 'lms_scorm_tracking', 'lms_xapi_statements'],
    frequency: 'Real-time'
  },
  {
    source: 'SSO/SAML',
    direction: 'inbound',
    target: 'L&D',
    trigger: 'User login',
    action: 'Authenticate via identity provider',
    tables: ['sso_provider_configs', 'auth.users'],
    frequency: 'Per login'
  },
  {
    source: 'Payroll',
    direction: 'outbound',
    target: 'External',
    trigger: 'Training attendance for paid time',
    action: 'Export training hours for payroll processing',
    tables: ['training_sessions', 'training_session_attendees'],
    frequency: 'Per pay period'
  }
];

export function LndIntegrationPoints() {
  const getDirectionIcon = (direction: string) => {
    if (direction === 'bidirectional') return <ArrowLeftRight className="h-4 w-4 text-purple-600" />;
    if (direction === 'outbound') return <ArrowRight className="h-4 w-4 text-blue-600" />;
    return <ArrowRight className="h-4 w-4 text-green-600 rotate-180" />;
  };

  const getDirectionBadge = (direction: string) => {
    if (direction === 'bidirectional') return <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Bi-directional</Badge>;
    if (direction === 'outbound') return <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Outbound</Badge>;
    return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Inbound</Badge>;
  };

  return (
    <section id="app-e" data-manual-anchor="app-e" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Link2 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Appendix E: Integration Points Reference</h2>
          <p className="text-muted-foreground">Complete mapping of L&D integration touchpoints with internal modules and external systems</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Matrix</CardTitle>
          <CardDescription>12 integration points connecting L&D to the broader HRMS ecosystem</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Frequency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INTEGRATION_POINTS.map((point, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{point.source}</TableCell>
                  <TableCell>{getDirectionBadge(point.direction)}</TableCell>
                  <TableCell>{point.target}</TableCell>
                  <TableCell className="text-sm max-w-48">{point.trigger}</TableCell>
                  <TableCell className="text-sm max-w-64">{point.action}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{point.frequency}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Database Tables for Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Audit & Logging</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• appraisal_integration_log</li>
                <li>• compliance_audit_log</li>
                <li>• training_audit_trail</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Rules & Configuration</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• appraisal_integration_rules</li>
                <li>• competency_course_mappings</li>
                <li>• recertification_triggers</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">External Systems</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• sso_provider_configs</li>
                <li>• lms_scorm_packages</li>
                <li>• lms_xapi_statements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
