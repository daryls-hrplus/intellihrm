import { Card, CardContent } from '@/components/ui/card';

export function LndIntegrationOnboarding() { return (<section id="sec-8-1" data-manual-anchor="sec-8-1"><h2 className="text-2xl font-bold mb-2">8.1 Onboarding Integration</h2><Card><CardContent className="pt-6"><p>Auto-enroll new hires in training via onboarding task triggers.</p></CardContent></Card></section>); }
export function LndIntegrationAppraisal() { return (<section id="sec-8-2" data-manual-anchor="sec-8-2"><h2 className="text-2xl font-bold mb-2">8.2 Appraisal Integration</h2><Card><CardContent className="pt-6"><p>Create training requests from performance appraisal outcomes.</p></CardContent></Card></section>); }
export function LndIntegrationCompetencySync() { return (<section id="sec-8-3" data-manual-anchor="sec-8-3"><h2 className="text-2xl font-bold mb-2">8.3 Competency Sync</h2><Card><CardContent className="pt-6"><p>Update competency levels based on course completions.</p></CardContent></Card></section>); }
export function LndIntegrationSuccession() { return (<section id="sec-8-4" data-manual-anchor="sec-8-4"><h2 className="text-2xl font-bold mb-2">8.4 Succession Link</h2><Card><CardContent className="pt-6"><p>Align training with succession planning readiness requirements.</p></CardContent></Card></section>); }
export function LndIntegrationCareerDevelopment() { return (<section id="sec-8-5" data-manual-anchor="sec-8-5"><h2 className="text-2xl font-bold mb-2">8.5 Career Development</h2><Card><CardContent className="pt-6"><p>Link learning paths to career progression tracks.</p></CardContent></Card></section>); }
export function LndIntegrationExternalLMS() { return (<section id="sec-8-6" data-manual-anchor="sec-8-6"><h2 className="text-2xl font-bold mb-2">8.6 External LMS</h2><Card><CardContent className="pt-6"><p>Federate with external learning platforms via LTI or API.</p></CardContent></Card></section>); }
export function LndIntegrationCalendar() { return (<section id="sec-8-7" data-manual-anchor="sec-8-7"><h2 className="text-2xl font-bold mb-2">8.7 Calendar Integration</h2><Card><CardContent className="pt-6"><p>Sync training sessions with organizational calendars.</p></CardContent></Card></section>); }
export function LndIntegrationWorkflowEngine() { 
  return (
    <section id="sec-8-8" data-manual-anchor="sec-8-8" className="space-y-4">
      <h2 className="text-2xl font-bold mb-2">8.8 Workflow Engine Integration</h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p>
            The L&D module integrates with the HR Hub workflow engine through 5 pre-configured workflow templates 
            that handle approvals, cost routing, and verification processes.
          </p>
          <div className="border rounded-lg p-4 bg-muted/50">
            <h4 className="font-semibold mb-2">Seeded Workflow Templates</h4>
            <ul className="space-y-2 text-sm">
              <li>• <code className="bg-muted px-1 rounded">TRAINING_REQUEST_APPROVAL</code> — Manager → HR → Finance (3 steps)</li>
              <li>• <code className="bg-muted px-1 rounded">CERTIFICATION_REQUEST_APPROVAL</code> — Manager → HR (2 steps)</li>
              <li>• <code className="bg-muted px-1 rounded">EXTERNAL_TRAINING_VERIFICATION</code> — HR verification (1 step)</li>
              <li>• <code className="bg-muted px-1 rounded">RECERTIFICATION_REQUEST_APPROVAL</code> — Manager approval (1 step)</li>
              <li>• <code className="bg-muted px-1 rounded">TRAINING_BUDGET_EXCEPTION</code> — Dept Head → HR → Finance (3 steps)</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            Templates include SLA tracking, escalation rules, and cost-based routing logic. 
            Enable templates in <strong>Performance → Setup → Approval Workflows</strong>. 
            See Section 4.13 for detailed template specifications.
          </p>
        </CardContent>
      </Card>
    </section>
  ); 
}
export function LndIntegrationCalendarSync() { return (<section id="sec-8-9" data-manual-anchor="sec-8-9"><h2 className="text-2xl font-bold mb-2">8.9 Calendar Sync (Google/Outlook)</h2><Card><CardContent className="pt-6"><p>Export sessions to personal calendars via iCal/OAuth.</p></CardContent></Card></section>); }
export function LndIntegrationVideoPlatform() { return (<section id="sec-8-10" data-manual-anchor="sec-8-10"><h2 className="text-2xl font-bold mb-2">8.10 Video Platform Integration</h2><Card><CardContent className="pt-6"><p>Connect with Teams, Zoom, Meet for virtual classrooms.</p></CardContent></Card></section>); }
