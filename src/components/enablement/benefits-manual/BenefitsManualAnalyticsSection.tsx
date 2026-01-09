import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BarChart3, 
  TrendingUp,
  Shield,
  FileText,
  Search,
  Lightbulb
} from "lucide-react";
import { ScreenshotPlaceholder } from "@/components/enablement/shared/ScreenshotPlaceholder";

export function BenefitsManualAnalyticsSection() {
  return (
    <div className="space-y-8">
      {/* Section 7.1: Analytics Dashboard */}
      <Card id="ben-sec-7-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 7.1</Badge>
            <Badge variant="secondary" className="text-xs">10 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Benefits Analytics Dashboard
          </CardTitle>
          <CardDescription>
            Key metrics, enrollment trends, utilization rates, cost analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              The Benefits Analytics Dashboard provides real-time visibility into your benefits 
              program performance. Use these insights to make data-driven decisions about plan 
              design, vendor management, and employee communications.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Enrollment Metrics</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-1">
                  <li>• Total enrolled employees</li>
                  <li>• Enrollment by plan</li>
                  <li>• Coverage level distribution</li>
                  <li>• Opt-out rates</li>
                  <li>• New hire enrollment %</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-green-500/5 border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cost Metrics</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-1">
                  <li>• Total employer cost</li>
                  <li>• Cost per employee</li>
                  <li>• Cost by plan/category</li>
                  <li>• Year-over-year change</li>
                  <li>• Budget vs. actual</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-purple-500/5 border-purple-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Utilization Metrics</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-1">
                  <li>• Claims volume</li>
                  <li>• FSA/HSA usage rates</li>
                  <li>• Wellness participation</li>
                  <li>• Preventive care usage</li>
                  <li>• High-cost claimants</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KPI</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Benchmark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Participation Rate</TableCell>
                <TableCell>% of eligible employees enrolled in at least one plan</TableCell>
                <TableCell>85-95%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cost Per Employee</TableCell>
                <TableCell>Total employer benefit cost / total employees</TableCell>
                <TableCell>Industry varies</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Claims Ratio</TableCell>
                <TableCell>Claims paid / premiums paid</TableCell>
                <TableCell>70-85%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">FSA Forfeiture Rate</TableCell>
                <TableCell>% of FSA funds forfeited at year end</TableCell>
                <TableCell>&lt;5%</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <ScreenshotPlaceholder 
            title="Benefits Analytics Dashboard"
            description="Executive dashboard with enrollment charts, cost trends, and key metrics summary"
            height="h-48"
          />
        </CardContent>
      </Card>

      {/* Section 7.2: Cost Projections */}
      <Card id="ben-sec-7-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 7.2</Badge>
            <Badge variant="secondary" className="text-xs">12 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Cost Projections & Forecasting
          </CardTitle>
          <CardDescription>
            Budget planning, renewal projections, cost modeling scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Cost projection tools help you plan for future benefit expenses, model different 
              scenarios, and prepare for renewal negotiations. Accurate forecasting supports 
              better budgeting and strategic decision-making.
            </p>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Projection Scenarios</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3 text-muted-foreground">
              <div>
                <span className="font-medium">Baseline Projection</span>
                <p>Current enrollment continues with trend adjustment (typically 5-8% medical inflation)</p>
              </div>
              <div>
                <span className="font-medium">Headcount Change</span>
                <p>Model impact of workforce growth or reduction on benefit costs</p>
              </div>
              <div>
                <span className="font-medium">Plan Design Change</span>
                <p>Project costs if contribution levels or plan options change</p>
              </div>
              <div>
                <span className="font-medium">Vendor Change</span>
                <p>Compare current costs to alternative provider quotes</p>
              </div>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factor</TableHead>
                <TableHead>Impact on Costs</TableHead>
                <TableHead>How to Model</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Medical Trend</TableCell>
                <TableCell>5-10% annual increase typical</TableCell>
                <TableCell>Apply trend factor to current costs</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Demographics</TableCell>
                <TableCell>Older workforce = higher costs</TableCell>
                <TableCell>Age-band analysis of population</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Plan Migration</TableCell>
                <TableCell>Shift to HDHP can reduce employer cost</TableCell>
                <TableCell>Model enrollment shifts</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Geographic Mix</TableCell>
                <TableCell>Regional cost differences</TableCell>
                <TableCell>Apply location factors</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Renewal Planning</AlertTitle>
            <AlertDescription>
              Start renewal projections 4-6 months before plan year end. Use claims experience 
              data, enrollment trends, and market benchmarks to negotiate effectively with providers.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Cost Projection Tool"
            description="Interactive cost forecasting screen with scenario modeling and comparison charts"
            height="h-48"
          />
        </CardContent>
      </Card>

      {/* Section 7.3: Plan Comparison */}
      <Card id="ben-sec-7-3">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 7.3</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Plan Comparison Analytics
          </CardTitle>
          <CardDescription>
            Comparing plan performance, cost-effectiveness, employee satisfaction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Gold PPO</TableHead>
                <TableHead>Silver PPO</TableHead>
                <TableHead>HDHP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Enrollment</TableCell>
                <TableCell>45%</TableCell>
                <TableCell>35%</TableCell>
                <TableCell>20%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Employer Cost/EE</TableCell>
                <TableCell>$850/mo</TableCell>
                <TableCell>$650/mo</TableCell>
                <TableCell>$450/mo</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Employee Cost/EE</TableCell>
                <TableCell>$150/mo</TableCell>
                <TableCell>$100/mo</TableCell>
                <TableCell>$50/mo</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Claims Ratio</TableCell>
                <TableCell>82%</TableCell>
                <TableCell>78%</TableCell>
                <TableCell>65%</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <ScreenshotPlaceholder 
            title="Plan Comparison Report"
            description="Side-by-side plan comparison with enrollment, cost, and utilization metrics"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 7.4: Compliance Monitoring */}
      <Card id="ben-sec-7-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 7.4</Badge>
            <Badge variant="secondary" className="text-xs">10 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Shield className="h-5 w-5 text-primary" />
            Compliance Monitoring
          </CardTitle>
          <CardDescription>
            ACA, ERISA, HIPAA compliance tracking, regulatory updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Benefits compliance monitoring ensures your organization meets all regulatory 
              requirements. The system tracks key deadlines, generates required reports, and 
              alerts you to potential compliance issues.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Regulation</TableHead>
                <TableHead>Key Requirements</TableHead>
                <TableHead>System Support</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">ACA</TableCell>
                <TableCell>Offer affordable coverage, 1095-C reporting</TableCell>
                <TableCell>Affordability calculator, ACA reporting</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">ERISA</TableCell>
                <TableCell>SPD distribution, plan document maintenance</TableCell>
                <TableCell>Document management, distribution tracking</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">HIPAA</TableCell>
                <TableCell>Special enrollment rights, privacy protections</TableCell>
                <TableCell>SEP tracking, access controls</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">COBRA</TableCell>
                <TableCell>Continuation coverage notices, election tracking</TableCell>
                <TableCell>COBRA event triggers, notice generation</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Compliance Calendar</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-1">
                <li>• <strong>January:</strong> Distribute 1095-C forms to employees</li>
                <li>• <strong>February:</strong> File 1094-C/1095-C with IRS</li>
                <li>• <strong>July:</strong> Distribute SBC 60 days before open enrollment</li>
                <li>• <strong>September:</strong> Medicare Part D creditable coverage notices</li>
                <li>• <strong>Ongoing:</strong> COBRA notices within 14 days of qualifying event</li>
              </ul>
            </CardContent>
          </Card>

          <ScreenshotPlaceholder 
            title="Compliance Dashboard"
            description="Compliance monitoring screen showing upcoming deadlines, status indicators, and alerts"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 7.5: Coverage Reports */}
      <Card id="ben-sec-7-5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 7.5</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <FileText className="h-5 w-5 text-primary" />
            Coverage Reports
          </CardTitle>
          <CardDescription>
            Enrollment reports, coverage summaries, dependent coverage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Use Case</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Census Report</TableCell>
                <TableCell>Full enrollment listing with demographics</TableCell>
                <TableCell>Carrier file, renewal quotes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Coverage Summary</TableCell>
                <TableCell>Enrollment counts by plan and coverage level</TableCell>
                <TableCell>Executive reporting</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Dependent Roster</TableCell>
                <TableCell>All covered dependents with relationship</TableCell>
                <TableCell>Dependent audit, verification</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cost Report</TableCell>
                <TableCell>Employer and employee contributions by period</TableCell>
                <TableCell>Financial reconciliation</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <ScreenshotPlaceholder 
            title="Coverage Reports"
            description="Report library showing available coverage reports with export options"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 7.6: Eligibility Audit */}
      <Card id="ben-sec-7-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 7.6</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Search className="h-5 w-5 text-primary" />
            Eligibility Audit Trail
          </CardTitle>
          <CardDescription>
            Audit logs, eligibility history, compliance documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              The eligibility audit trail provides a complete history of enrollment changes, 
              eligibility determinations, and administrative actions for compliance and 
              dispute resolution.
            </p>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Audit Log Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Enrollment add/change/termination events</li>
                <li>• Eligibility date calculations</li>
                <li>• Waiting period tracking</li>
                <li>• Life event approvals</li>
                <li>• Administrative overrides with justification</li>
                <li>• System-generated eligibility changes</li>
              </ul>
            </CardContent>
          </Card>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Retention</AlertTitle>
            <AlertDescription>
              Maintain audit logs for at least 7 years to support potential audits, legal 
              proceedings, or employee inquiries about historical coverage.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Eligibility Audit Trail"
            description="Audit log viewer showing eligibility changes with timestamps, users, and details"
            height="h-40"
          />
        </CardContent>
      </Card>
    </div>
  );
}
