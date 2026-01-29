import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, PieChart, TrendingUp, Users, Building, BarChart3 } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components';

export function LndAnalyticsBudgetUtilization() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Budget Utilization Reports track training expenditure against allocated budgets via the
          <code>training_budgets</code> table. Financial analytics enable department-level breakdown,
          fiscal year comparison, and variance analysis.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Budget Data Model</h3>
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
              <TableCell><code>company_id</code></TableCell>
              <TableCell>uuid</TableCell>
              <TableCell>Legal entity for multi-company budgets</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>department_id</code></TableCell>
              <TableCell>uuid (nullable)</TableCell>
              <TableCell>Department-specific budget (null = company-wide)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>fiscal_year</code></TableCell>
              <TableCell>integer</TableCell>
              <TableCell>Budget year (e.g., 2025, 2026)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>allocated_amount</code></TableCell>
              <TableCell>numeric</TableCell>
              <TableCell>Total budget allocation</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>spent_amount</code></TableCell>
              <TableCell>numeric</TableCell>
              <TableCell>Amount consumed (updated on transactions)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>currency</code></TableCell>
              <TableCell>text</TableCell>
              <TableCell>Currency code (USD, EUR, JMD, etc.)</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Budget Analytics Views</h3>
        <FeatureCardGrid columns={3}>
          <FeatureCard variant="primary" icon={PieChart} title="Utilization Rate">
            <p className="text-sm mt-2">spent_amount / allocated_amount × 100</p>
            <div className="mt-2 text-xs">
              <Badge variant="default">≥90%</Badge>{' '}
              <Badge variant="secondary">70-89%</Badge>{' '}
              <Badge variant="outline">&lt;70%</Badge>
            </div>
          </FeatureCard>
          <FeatureCard variant="info" icon={Building} title="By Department">
            <p className="text-sm mt-2">Department-level spend breakdown with variance from allocation</p>
          </FeatureCard>
          <FeatureCard variant="warning" icon={TrendingUp} title="Year-over-Year">
            <p className="text-sm mt-2">Fiscal year comparison showing spend trends</p>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.10.1: Budget Utilization Dashboard with department breakdown"
        alt="Pie chart of spend by category, bar chart by department, utilization gauge"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Budget Report Dimensions</h3>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Slice budget data by the following dimensions:
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Company/Entity</Badge>
              <Badge variant="outline">Department</Badge>
              <Badge variant="outline">Fiscal Year</Badge>
              <Badge variant="outline">Quarter</Badge>
              <Badge variant="outline">Training Category</Badge>
              <Badge variant="outline">Delivery Method</Badge>
              <Badge variant="outline">Vendor</Badge>
              <Badge variant="outline">Internal vs External</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Variance Analysis</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variance Type</TableHead>
              <TableHead>Calculation</TableHead>
              <TableHead>Action Trigger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Under Budget</TableCell>
              <TableCell>Utilization &lt; 80% at Q3</TableCell>
              <TableCell>Review training plan execution</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>At Budget</TableCell>
              <TableCell>Utilization 80-100%</TableCell>
              <TableCell>On track - monitor</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Over Budget</TableCell>
              <TableCell>Utilization &gt; 100%</TableCell>
              <TableCell>Requires budget exception approval</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <TipCallout title="Budget Exception Workflow">
        When spend exceeds allocation, the TRAINING_BUDGET_EXCEPTION workflow triggers a 3-step
        approval process: Manager → HR → Finance. Configure in Admin → Workflows.
      </TipCallout>

      <InfoCallout title="Multi-Currency Support">
        For organizations operating across countries, budgets are stored in local currency.
        Consolidation reports use exchange rates defined in company settings for group-level views.
      </InfoCallout>
    </div>
  );
}

export function LndAnalyticsCostPerLearner() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Cost-Per-Learner analysis measures training investment efficiency by calculating the 
          average spend per unique learner. This metric enables vendor comparison, category 
          optimization, and investment prioritization decisions.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Cost-Per-Learner Formula</h3>
        <Card>
          <CardContent className="pt-4">
            <div className="bg-muted p-4 rounded-lg text-center mb-4">
              <p className="text-lg font-mono">
                CPL = Total Training Spend / Unique Learners
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Spend Components:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Course/content costs</li>
                  <li>• Platform/LMS fees</li>
                  <li>• Instructor/facilitation</li>
                  <li>• Venue/travel expenses</li>
                  <li>• Materials/equipment</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Learner Count Methods:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Unique enrollees (any activity)</li>
                  <li>• Course completers only</li>
                  <li>• Active learners (≥1 hour)</li>
                  <li>• Certified learners</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">CPL Analysis Dimensions</h3>
        <FeatureCardGrid columns={2}>
          <FeatureCard variant="primary" icon={BarChart3} title="By Category">
            <p className="text-sm mt-2">Compare CPL across training categories (compliance, leadership, technical, etc.)</p>
          </FeatureCard>
          <FeatureCard variant="info" icon={Users} title="By Vendor">
            <p className="text-sm mt-2">Evaluate vendor cost-effectiveness for similar content types</p>
          </FeatureCard>
          <FeatureCard variant="success" icon={Building} title="By Department">
            <p className="text-sm mt-2">Identify departments with high/low training investment</p>
          </FeatureCard>
          <FeatureCard variant="warning" icon={TrendingUp} title="Trend Analysis">
            <p className="text-sm mt-2">Track CPL changes over quarters/years</p>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Industry Benchmarks</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization Size</TableHead>
              <TableHead>Typical CPL Range (Annual)</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Small (&lt;500)</TableCell>
              <TableCell>$800 - $1,500</TableCell>
              <TableCell>Higher per-person cost, less economy of scale</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Medium (500-5,000)</TableCell>
              <TableCell>$500 - $1,000</TableCell>
              <TableCell>Balanced investment with some scale benefits</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Large (&gt;5,000)</TableCell>
              <TableCell>$300 - $700</TableCell>
              <TableCell>Economies of scale, enterprise agreements</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.11.1: Cost-Per-Learner Analysis with category and vendor comparison"
        alt="Bar chart comparing CPL across categories and vendors with benchmark line"
      />

      <WarningCallout title="Quality vs Cost Balance">
        Low CPL isn't always optimal. Consider CPL alongside completion rates, satisfaction scores,
        and learning outcomes to avoid sacrificing quality for cost savings.
      </WarningCallout>
    </div>
  );
}
