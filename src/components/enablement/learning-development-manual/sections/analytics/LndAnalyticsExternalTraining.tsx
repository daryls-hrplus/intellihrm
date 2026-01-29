import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, DollarSign, Award, Building, TrendingUp, FileText } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components';

export function LndAnalyticsExternalTraining() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          External Training Analytics provide visibility into learning activities conducted outside the LMS,
          including vendor-delivered courses, conferences, workshops, and self-directed learning. Data is 
          captured in <code>external_training_records</code> with integration to training budgets and 
          skills tracking. Extends Chapter 3 (External Training & Vendor Management) with analytics focus.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">external_training_records Table Schema (Full)</h3>
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
                  <TableCell>Unique record identifier</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>employee_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Reference to profiles.id</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>company_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Multi-tenant company scope</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>training_name</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>Title of external training</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>training_type</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>conference, workshop, course, certification, webinar, self_study</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>provider_name</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>Training provider/vendor name</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>vendor_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Optional link to training_vendors.id</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>start_date</code></TableCell>
                  <TableCell>date</TableCell>
                  <TableCell>Training start date</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>end_date</code></TableCell>
                  <TableCell>date</TableCell>
                  <TableCell>Training end date</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>duration_hours</code></TableCell>
                  <TableCell>numeric</TableCell>
                  <TableCell>Total training hours (for training hour reports)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>status</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>planned, in_progress, completed, cancelled</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>completion_date</code></TableCell>
                  <TableCell>date</TableCell>
                  <TableCell>Actual completion date</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>cost_amount</code></TableCell>
                  <TableCell>numeric</TableCell>
                  <TableCell>Training cost</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>cost_currency</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>Currency code (USD, EUR, JMD, etc.)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>budget_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Link to training_budgets.id for spend tracking</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>certificate_url</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>URL to uploaded certificate/credential</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>certificate_expiry</code></TableCell>
                  <TableCell>date</TableCell>
                  <TableCell>Certificate expiration date</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>skills_acquired</code></TableCell>
                  <TableCell>text[]</TableCell>
                  <TableCell>Array of skill names learned</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>description</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>Training description and objectives</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>verified_by</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Manager/HR who verified completion</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>verified_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>Verification timestamp</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>created_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>Record creation timestamp</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>updated_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>Last modification timestamp</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.22.1: External Training Analytics Dashboard with spend analysis and provider comparison"
        alt="Dashboard showing external training spend by category, provider performance, and ROI metrics"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Key External Training Metrics</h3>
        <FeatureCardGrid columns={3}>
          <FeatureCard variant="primary" icon={DollarSign} title="External Spend">
            <p className="text-sm mt-2">SUM(cost_amount) by period, category, or department</p>
          </FeatureCard>
          <FeatureCard variant="info" icon={TrendingUp} title="Hours Logged">
            <p className="text-sm mt-2">SUM(duration_hours) for total external training hours</p>
          </FeatureCard>
          <FeatureCard variant="success" icon={Award} title="Certifications Earned">
            <p className="text-sm mt-2">COUNT where certificate_url IS NOT NULL</p>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">External vs Internal Training Comparison</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Internal (LMS)</TableHead>
              <TableHead>External (Records)</TableHead>
              <TableHead>Comparison Insight</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Training Hours</TableCell>
              <TableCell><code>SUM(lms_enrollments.time_spent)</code></TableCell>
              <TableCell><code>SUM(external_training_records.duration_hours)</code></TableCell>
              <TableCell>Total learning investment ratio</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Cost per Hour</TableCell>
              <TableCell>Platform cost / internal hours</TableCell>
              <TableCell><code>SUM(cost_amount) / SUM(duration_hours)</code></TableCell>
              <TableCell>Cost efficiency comparison</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Certifications</TableCell>
              <TableCell><code>lms_certificates.count()</code></TableCell>
              <TableCell>Records with certificate_url</TableCell>
              <TableCell>Credential acquisition by channel</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Training Type Distribution</h3>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Analyze external training by type for budget allocation decisions:
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">conference</Badge>
              <Badge variant="default">workshop</Badge>
              <Badge variant="secondary">course</Badge>
              <Badge variant="secondary">certification</Badge>
              <Badge variant="outline">webinar</Badge>
              <Badge variant="outline">self_study</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Query: <code>SELECT training_type, COUNT(*), SUM(cost_amount) FROM external_training_records GROUP BY training_type</code>
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Budget Integration</h3>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              External training costs are tracked against training budgets via <code>budget_id</code>:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Badge variant="outline">Allocated</Badge>
                <span><code>training_budgets.allocated_amount</code></span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="secondary">Committed</Badge>
                <span>SUM of approved but not completed external records</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="default">Spent</Badge>
                <span>SUM of completed external records linked to budget</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Provider Performance Analysis</h3>
        <FeatureCardGrid columns={2}>
          <FeatureCard variant="info" icon={Building} title="By Provider">
            <ul className="space-y-1 mt-2 text-sm">
              <li>• Total spend per provider</li>
              <li>• Employees trained</li>
              <li>• Certifications earned</li>
              <li>• Cost per certification</li>
            </ul>
          </FeatureCard>
          <FeatureCard variant="warning" icon={FileText} title="By Category">
            <ul className="space-y-1 mt-2 text-sm">
              <li>• Technical training ROI</li>
              <li>• Leadership program effectiveness</li>
              <li>• Compliance certification costs</li>
              <li>• Conference value analysis</li>
            </ul>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <TipCallout title="Unified Training History">
        The Employee Training History view combines lms_enrollments and external_training_records
        into a single timeline. Ensure duration_hours is populated for accurate training hour totals.
      </TipCallout>

      <WarningCallout title="Certificate Expiry Tracking">
        External certifications with certificate_expiry dates should be monitored alongside
        lms_certificates. The recertification reminder system handles both sources.
      </WarningCallout>

      <InfoCallout title="Cross-Reference">
        For external training request workflows and vendor management, see <strong>Chapter 3: External Training & Vendor Management</strong>.
      </InfoCallout>
    </div>
  );
}
