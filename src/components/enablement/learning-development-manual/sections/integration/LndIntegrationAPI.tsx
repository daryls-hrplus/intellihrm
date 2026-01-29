import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code2, 
  Webhook,
  Clock,
  Shield
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  FutureCallout
} from '@/components/enablement/manual/components';
import { ScreenshotPlaceholder } from '@/components/enablement/shared/ScreenshotPlaceholder';

export function LndIntegrationAPI() {
  return (
    <section id="sec-8-10" data-manual-anchor="sec-8-10" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Code2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">8.10 API & Data Sync Patterns</h3>
          <p className="text-sm text-muted-foreground">
            REST API patterns, webhook configuration, and LTI 1.3 roadmap
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Understand available REST API endpoints for L&D data',
        'Configure webhook notifications for external systems',
        'Plan for LTI 1.3 integration (roadmap)',
        'Implement secure API authentication patterns'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            REST API Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The L&D module exposes REST endpoints for integration with external systems:
          </p>

          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">GET</Badge>
                <code className="text-sm">/api/lms/courses</code>
              </div>
              <p className="text-sm text-muted-foreground">List courses with filtering and pagination</p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">GET</Badge>
                <code className="text-sm">/api/lms/enrollments</code>
              </div>
              <p className="text-sm text-muted-foreground">List enrollments by user, course, or status</p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge>POST</Badge>
                <code className="text-sm">/api/lms/enrollments</code>
              </div>
              <p className="text-sm text-muted-foreground">Create new enrollment (requires auth)</p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">PATCH</Badge>
                <code className="text-sm">/api/lms/enrollments/:id/progress</code>
              </div>
              <p className="text-sm text-muted-foreground">Update enrollment progress from external source</p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">GET</Badge>
                <code className="text-sm">/api/lms/certificates</code>
              </div>
              <p className="text-sm text-muted-foreground">List certificates with verification codes</p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">GET</Badge>
                <code className="text-sm">/api/training/requests</code>
              </div>
              <p className="text-sm text-muted-foreground">List training requests with approval status</p>
            </div>
          </div>

          <InfoCallout>
            All API endpoints require authentication via Bearer token (API key) or session cookie. 
            Rate limits apply: 100 requests/minute for standard tier, 1000/minute for enterprise.
          </InfoCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Configure webhooks to notify external systems of L&D events:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Available Events</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <code>enrollment.created</code></li>
                <li>• <code>enrollment.completed</code></li>
                <li>• <code>certificate.issued</code></li>
                <li>• <code>course.published</code></li>
                <li>• <code>training_request.approved</code></li>
                <li>• <code>compliance.overdue</code></li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Webhook Payload</h4>
              <div className="text-xs font-mono bg-muted/50 p-2 rounded">
                {`{
  "event": "enrollment.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "enrollment_id": "uuid",
    "user_id": "uuid",
    "course_id": "uuid",
    "completed_at": "2024-01-15T10:30:00Z"
  }
}`}
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Webhook Security
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• HTTPS required for all webhook endpoints</li>
              <li>• Signature verification via HMAC-SHA256 header</li>
              <li>• Retry logic: 3 attempts with exponential backoff</li>
              <li>• Timeout: 30 seconds per request</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Data Sync Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Incremental Sync</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Use <code>updated_since</code> parameter for efficient delta updates.
              </p>
              <div className="text-xs font-mono bg-muted/50 p-2 rounded">
                GET /api/lms/enrollments?updated_since=2024-01-15T00:00:00Z
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Full Sync</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Use pagination for complete data export.
              </p>
              <div className="text-xs font-mono bg-muted/50 p-2 rounded">
                GET /api/lms/enrollments?page=1&per_page=100
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Sync Scheduling Recommendations</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Badge variant="outline">Real-time</Badge>
                <span className="text-muted-foreground">Use webhooks for enrollment/completion events</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline">Hourly</Badge>
                <span className="text-muted-foreground">Incremental sync for progress updates</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline">Daily</Badge>
                <span className="text-muted-foreground">Full sync for data warehouse/BI systems</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <FutureCallout>
        <strong>LTI 1.3 Integration (Planned Q3 2025)</strong>
        <p className="mt-2 text-sm">
          Learning Tools Interoperability (LTI) 1.3 will enable secure content launch and 
          grade passback from external content providers. Features include:
        </p>
        <ul className="mt-2 text-sm space-y-1">
          <li>• Deep linking for content selection</li>
          <li>• Assignment and grade services</li>
          <li>• Names and roles provisioning</li>
          <li>• Proctoring services integration</li>
        </ul>
      </FutureCallout>

      <ScreenshotPlaceholder 
        title="API Configuration"
        description="Shows the API key management and webhook configuration interface"
      />

      <WarningCallout>
        API keys should be treated as secrets. Rotate keys periodically and use environment 
        variables rather than hardcoding in client applications.
      </WarningCallout>

      <TipCallout>
        <strong>Integration Pattern:</strong> For complex integrations, use webhooks for 
        real-time events and scheduled API calls for reconciliation. This ensures data 
        consistency even if webhook delivery fails.
      </TipCallout>
    </section>
  );
}
