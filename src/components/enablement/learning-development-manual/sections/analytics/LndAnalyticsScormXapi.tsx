import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Activity, Database, BarChart3, FileCode } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components';

export function LndAnalyticsScormXapi() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          SCORM and xAPI analytics provide granular tracking of third-party eLearning content interactions.
          Data is captured in <code>lms_scorm_tracking</code> for SCORM 1.2/2004 packages and 
          <code>lms_xapi_statements</code> for Experience API (xAPI/Tin Can) content. This section 
          extends Chapter 2.13 (SCORM/xAPI Integration) with analytics-focused guidance.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">SCORM Standards Comparison</h3>
        <FeatureCardGrid columns={2}>
          <FeatureCard variant="primary" icon={Package} title="SCORM 1.2">
            <ul className="space-y-1 mt-2 text-sm">
              <li>• Most widely deployed standard</li>
              <li>• Basic completion and score tracking</li>
              <li>• CMI data model (cmi.core.*)</li>
              <li>• lesson_status: passed, failed, completed, incomplete</li>
            </ul>
          </FeatureCard>
          <FeatureCard variant="info" icon={Package} title="SCORM 2004 (3rd/4th Edition)">
            <ul className="space-y-1 mt-2 text-sm">
              <li>• Advanced sequencing and navigation</li>
              <li>• Detailed interaction tracking</li>
              <li>• CMI data model (cmi.completion_status, cmi.success_status)</li>
              <li>• Supports complex branching scenarios</li>
            </ul>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">lms_scorm_tracking Table Schema</h3>
        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code>id</code></TableCell>
                  <TableCell>uuid (PK)</TableCell>
                  <TableCell>Unique tracking record identifier</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>enrollment_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Reference to lms_enrollments.id</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>scorm_package_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Reference to lms_scorm_packages.id</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>sco_id</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>Sharable Content Object identifier from manifest</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>lesson_status</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>passed, failed, completed, incomplete, not attempted</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>completion_status</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>SCORM 2004: completed, incomplete, not attempted, unknown</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>success_status</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>SCORM 2004: passed, failed, unknown</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>score_raw</code></TableCell>
                  <TableCell>numeric</TableCell>
                  <TableCell>Raw score achieved</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>score_min</code></TableCell>
                  <TableCell>numeric</TableCell>
                  <TableCell>Minimum possible score</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>score_max</code></TableCell>
                  <TableCell>numeric</TableCell>
                  <TableCell>Maximum possible score</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>score_scaled</code></TableCell>
                  <TableCell>numeric</TableCell>
                  <TableCell>Normalized score (-1 to 1)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>total_time</code></TableCell>
                  <TableCell>interval</TableCell>
                  <TableCell>Cumulative time spent in content</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>session_time</code></TableCell>
                  <TableCell>interval</TableCell>
                  <TableCell>Time for current session</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>suspend_data</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>Bookmark data for resume capability</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>cmi_data</code></TableCell>
                  <TableCell>jsonb</TableCell>
                  <TableCell>Complete CMI data model snapshot</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>created_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>First interaction timestamp</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>updated_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>Last interaction timestamp</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">lms_xapi_statements Table Schema</h3>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              xAPI (Experience API / Tin Can) enables tracking of learning experiences beyond traditional LMS:
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code>id</code></TableCell>
                  <TableCell>uuid (PK)</TableCell>
                  <TableCell>Statement UUID (from xAPI spec)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>actor</code></TableCell>
                  <TableCell>jsonb</TableCell>
                  <TableCell>Actor object (mbox, account, openid)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>verb</code></TableCell>
                  <TableCell>jsonb</TableCell>
                  <TableCell>Verb object (id, display) - e.g., completed, experienced, passed</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>object</code></TableCell>
                  <TableCell>jsonb</TableCell>
                  <TableCell>Activity object (id, definition, type)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>result</code></TableCell>
                  <TableCell>jsonb</TableCell>
                  <TableCell>Result object (score, success, completion, duration)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>context</code></TableCell>
                  <TableCell>jsonb</TableCell>
                  <TableCell>Context object (registration, instructor, team)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>timestamp</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>When the experience occurred</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>stored</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>When statement was stored in LRS</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>authority</code></TableCell>
                  <TableCell>jsonb</TableCell>
                  <TableCell>Agent/Group asserting statement truth</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>user_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Linked profiles.id (derived from actor)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>company_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Multi-tenant scope</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.19.1: SCORM/xAPI Analytics Dashboard showing completion rates and interaction data"
        alt="Dashboard with SCORM completion funnel, score distribution, and xAPI verb frequency chart"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Key SCORM Analytics Metrics</h3>
        <FeatureCardGrid columns={3}>
          <FeatureCard variant="success" icon={Activity} title="Completion Rate">
            <p className="text-sm mt-2">% of SCOs with lesson_status = 'completed' or 'passed'</p>
          </FeatureCard>
          <FeatureCard variant="info" icon={BarChart3} title="Avg Score">
            <p className="text-sm mt-2">AVG(score_raw / score_max) across attempts</p>
          </FeatureCard>
          <FeatureCard variant="warning" icon={Database} title="Avg Time">
            <p className="text-sm mt-2">Mean total_time per completed enrollment</p>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">xAPI Verb Analytics</h3>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">Common xAPI verbs for learning analytics:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">completed</Badge>
              <Badge variant="default">passed</Badge>
              <Badge variant="default">failed</Badge>
              <Badge variant="secondary">experienced</Badge>
              <Badge variant="secondary">attempted</Badge>
              <Badge variant="secondary">interacted</Badge>
              <Badge variant="outline">answered</Badge>
              <Badge variant="outline">commented</Badge>
              <Badge variant="outline">shared</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <TipCallout title="xAPI Aggregation Queries">
        Use verb frequency analysis to identify engagement patterns:
        <code className="block mt-2 text-xs">
          {`SELECT verb->>'id', COUNT(*) FROM lms_xapi_statements GROUP BY verb->>'id'`}
        </code>
      </TipCallout>

      <WarningCallout title="Data Volume Considerations">
        xAPI can generate high statement volumes. Consider archival policies for statements older than 
        2 years and use materialized views for performance-critical dashboards.
      </WarningCallout>

      <InfoCallout title="Cross-Reference">
        For SCORM package upload and configuration, see <strong>Chapter 2.13: SCORM/xAPI Integration</strong>.
      </InfoCallout>
    </div>
  );
}
