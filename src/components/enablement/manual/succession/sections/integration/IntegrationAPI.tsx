import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Webhook, 
  Code,
  Shield,
  RefreshCw,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  FieldReferenceTable,
  type FieldDefinition
} from '@/components/enablement/manual/components';

const webhookEventTypes = [
  { event: 'succession.candidate.created', description: 'New candidate added to succession plan', payload: 'candidate_id, plan_id, position_id, employee_id' },
  { event: 'succession.candidate.updated', description: 'Candidate readiness or status changed', payload: 'candidate_id, changes, previous_values' },
  { event: 'succession.plan.activated', description: 'Succession plan moved to active status', payload: 'plan_id, position_id, key_position_risk' },
  { event: 'nine_box.assessment.created', description: 'New Nine-Box assessment recorded', payload: 'assessment_id, employee_id, performance_rating, potential_rating' },
  { event: 'nine_box.assessment.calibrated', description: 'Assessment updated via calibration', payload: 'assessment_id, calibration_session_id, changes' },
  { event: 'talent_pool.member.added', description: 'Employee added to talent pool', payload: 'pool_id, employee_id, nomination_source' },
  { event: 'talent_pool.member.graduated', description: 'Member graduated from pool', payload: 'pool_id, employee_id, graduation_reason' },
  { event: 'readiness.assessment.completed', description: 'Readiness assessment finalized', payload: 'event_id, candidate_id, overall_score, band' }
];

const apiEndpoints: FieldDefinition[] = [
  { name: 'GET /api/v1/succession/plans', required: false, type: 'endpoint', description: 'List succession plans with filters', defaultValue: '—', validation: 'company_id, status, position_id' },
  { name: 'GET /api/v1/succession/candidates', required: false, type: 'endpoint', description: 'List candidates with readiness data', defaultValue: '—', validation: 'plan_id, min_readiness, nine_box_position' },
  { name: 'GET /api/v1/nine-box/assessments', required: false, type: 'endpoint', description: 'Retrieve Nine-Box assessments', defaultValue: '—', validation: 'employee_id, is_current, date_range' },
  { name: 'GET /api/v1/talent-pools/{id}/members', required: false, type: 'endpoint', description: 'List talent pool members', defaultValue: '—', validation: 'status, readiness_band' },
  { name: 'POST /api/v1/succession/candidates', required: false, type: 'endpoint', description: 'Create succession candidate', defaultValue: '—', validation: 'plan_id, employee_id, rank required' },
  { name: 'PATCH /api/v1/nine-box/assessments/{id}', required: false, type: 'endpoint', description: 'Update assessment (with audit)', defaultValue: '—', validation: 'reason required for rating changes' }
];

const securityHeaders = [
  { header: 'Authorization', description: 'Bearer token from OAuth 2.0 flow', required: true },
  { header: 'X-Company-ID', description: 'Company context for multi-tenant isolation', required: true },
  { header: 'X-Request-ID', description: 'Unique request ID for tracing', required: false },
  { header: 'X-Webhook-Signature', description: 'HMAC-SHA256 signature for webhook payloads', required: true }
];

export function IntegrationAPI() {
  return (
    <section id="sec-9-15" data-manual-anchor="sec-9-15" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <Webhook className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">9.15 Integration API & Webhooks</h3>
          <p className="text-sm text-muted-foreground">
            External system integration via REST API and event-driven webhooks
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Configure webhook endpoints for real-time event streaming',
        'Understand API authentication and security requirements',
        'Implement external system integrations (HRIS, LMS, external analytics)',
        'Handle webhook delivery failures and retries'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Event Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Subscribe to real-time events for external system synchronization:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Event Type</th>
                  <th className="text-left py-2 px-3">Description</th>
                  <th className="text-left py-2 px-3">Payload Fields</th>
                </tr>
              </thead>
              <tbody>
                {webhookEventTypes.map(evt => (
                  <tr key={evt.event} className="border-b">
                    <td className="py-2 px-3 font-mono text-xs">{evt.event}</td>
                    <td className="py-2 px-3">{evt.description}</td>
                    <td className="py-2 px-3 text-xs text-muted-foreground">{evt.payload}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <InfoCallout>
            Webhook subscriptions are configured per company in <strong>Governance → 
            Integrations → Webhook Subscriptions</strong>. Each subscription can filter 
            by event type and include custom headers.
          </InfoCallout>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={apiEndpoints} 
        title="REST API Endpoints (Succession Domain)" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            All API and webhook interactions require proper authentication:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Header</th>
                  <th className="text-left py-2 px-3">Description</th>
                  <th className="text-left py-2 px-3">Required</th>
                </tr>
              </thead>
              <tbody>
                {securityHeaders.map(h => (
                  <tr key={h.header} className="border-b">
                    <td className="py-2 px-3 font-mono text-xs">{h.header}</td>
                    <td className="py-2 px-3">{h.description}</td>
                    <td className="py-2 px-3">
                      <Badge variant={h.required ? "default" : "outline"}>
                        {h.required ? 'Required' : 'Optional'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Webhook Signature Verification
            </h4>
            <div className="text-xs font-mono space-y-1">
              <p>// Compute expected signature</p>
              <p>const expectedSig = crypto.createHmac('sha256', webhookSecret)</p>
              <p>  .update(JSON.stringify(payload))</p>
              <p>  .digest('hex');</p>
              <p></p>
              <p>// Compare with header</p>
              <p>if (req.headers['x-webhook-signature'] !== expectedSig) {"{"}</p>
              <p>  throw new Error('Invalid webhook signature');</p>
              <p>{"}"}</p>
            </div>
          </div>

          <WarningCallout>
            Always verify webhook signatures before processing payloads. Store webhook 
            secrets securely and rotate them quarterly.
          </WarningCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Retry & Error Handling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Webhook delivery includes automatic retry with exponential backoff:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Retry Schedule</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Badge variant="outline">1</Badge> Immediate retry
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">2</Badge> After 1 minute
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">3</Badge> After 5 minutes
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">4</Badge> After 30 minutes
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">5</Badge> After 2 hours
                </li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Success Criteria</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>HTTP 2xx response within 30 seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <span>4xx errors: no retry (client error)</span>
                </li>
                <li className="flex items-start gap-2">
                  <RefreshCw className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>5xx errors: retry with backoff</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <span>Max retries exceeded: alert sent to admins</span>
                </li>
              </ul>
            </div>
          </div>

          <TipCallout>
            Monitor webhook delivery health in <strong>Governance → Integrations → 
            Webhook Logs</strong>. Failed webhooks can be manually retried or the 
            endpoint can be temporarily disabled.
          </TipCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Example Integration: External LMS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Sync succession development plans with external Learning Management Systems:
          </p>

          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-950/20">
            <h4 className="font-medium mb-2">Webhook Handler (Node.js)</h4>
            <div className="text-xs font-mono space-y-1 overflow-x-auto">
              <pre>{`app.post('/webhooks/succession', async (req, res) => {
  // Verify signature
  verifyWebhookSignature(req);
  
  const { event, data } = req.body;
  
  switch (event) {
    case 'succession.candidate.created':
      // Create learning path in external LMS
      await externalLMS.createLearningPath({
        userId: data.employee_id,
        pathName: \`Succession: \${data.position_title}\`,
        competencyGaps: data.gaps
      });
      break;
      
    case 'readiness.assessment.completed':
      // Update progress in external LMS
      await externalLMS.updateProgress({
        userId: data.candidate_id,
        readinessScore: data.overall_score
      });
      break;
  }
  
  res.status(200).json({ received: true });
});`}</pre>
            </div>
          </div>

          <InfoCallout>
            For complex integrations, consider using the batch API endpoints to sync 
            large datasets efficiently. Batch endpoints support pagination and support 
            up to 1000 records per request.
          </InfoCallout>
        </CardContent>
      </Card>
    </section>
  );
}
