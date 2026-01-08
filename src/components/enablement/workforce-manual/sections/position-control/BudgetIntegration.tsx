import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  Link,
  Building2,
  Users,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calculator,
  FileSpreadsheet
} from "lucide-react";
import { LearningObjectives } from "../lifecycle-workflows/LearningObjectives";
import { ScreenshotPlaceholder } from "@/components/enablement/manual/components/ScreenshotPlaceholder";

export function BudgetIntegration() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-primary pl-6">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline">Section 6.7</Badge>
          <Badge variant="secondary">Estimated: 8 min</Badge>
          <Badge>Integration</Badge>
        </div>
        <h2 className="text-2xl font-bold">Budget Integration</h2>
        <p className="text-muted-foreground mt-2">
          Linking headcount to financial budgets and finance system alignment
        </p>
      </div>

      <LearningObjectives
        items={[
          "Understand headcount-to-budget linkage",
          "Configure cost center alignment",
          "Monitor budget vs actual variance",
          "Integrate with financial systems"
        ]}
      />

      {/* Budget-Headcount Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Headcount-to-Budget Linkage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Every position in Intelli HRM can be linked to financial budgets through cost 
            centers and salary projections. This enables real-time budget tracking 
            as headcount changes occur.
          </p>
          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-semibold mb-3">Key Connections</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-sm">Position → Cost Center</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm">Job Grade → Salary Range</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm">Department → Budget Code</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Workforce Cost Projections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The system calculates projected workforce costs based on position data 
            and configured salary information:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Cost Component</th>
                  <th className="text-left py-2 font-medium">Calculation Basis</th>
                  <th className="text-center py-2 font-medium">Included</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Base Salary</td>
                  <td className="text-muted-foreground">Position salary or grade midpoint</td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Benefits Loading</td>
                  <td className="text-muted-foreground">Configurable % of base (typically 25-40%)</td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Employer Taxes</td>
                  <td className="text-muted-foreground">Country-specific statutory contributions</td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Variable Compensation</td>
                  <td className="text-muted-foreground">Target bonus/commission if applicable</td>
                  <td className="text-center"><Badge variant="outline">Optional</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Recruiting Costs</td>
                  <td className="text-muted-foreground">One-time cost for new hires</td>
                  <td className="text-center"><Badge variant="outline">Optional</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Budget vs Actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Budget vs Actual Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Compare budgeted headcount and costs against actuals to identify variances 
            and track budget utilization.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Department</th>
                  <th className="text-center py-2 font-medium">Budgeted HC</th>
                  <th className="text-center py-2 font-medium">Actual HC</th>
                  <th className="text-center py-2 font-medium">Variance</th>
                  <th className="text-center py-2 font-medium">Budget Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Engineering</td>
                  <td className="text-center">90</td>
                  <td className="text-center">85</td>
                  <td className="text-center">
                    <Badge variant="outline" className="text-amber-600">-5</Badge>
                  </td>
                  <td className="text-center text-green-600">+$425K saved</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Sales</td>
                  <td className="text-center">45</td>
                  <td className="text-center">48</td>
                  <td className="text-center">
                    <Badge variant="outline" className="text-red-600">+3</Badge>
                  </td>
                  <td className="text-center text-red-600">-$180K over</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Operations</td>
                  <td className="text-center">60</td>
                  <td className="text-center">58</td>
                  <td className="text-center">
                    <Badge variant="outline" className="text-amber-600">-2</Badge>
                  </td>
                  <td className="text-center text-green-600">+$110K saved</td>
                </tr>
                <tr className="border-b font-semibold">
                  <td className="py-2">Total</td>
                  <td className="text-center">195</td>
                  <td className="text-center">191</td>
                  <td className="text-center">
                    <Badge variant="outline">-4</Badge>
                  </td>
                  <td className="text-center text-green-600">+$355K under budget</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ScreenshotPlaceholder
            caption="Figure 6.7a: Budget vs Actual analysis showing headcount variance by department"
            alt="Budget variance table with headcount and cost impact columns"
          />
        </CardContent>
      </Card>

      {/* Scenario Cost Modeling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Scenario Cost Modeling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            When running workforce scenarios (Section 6.6), cost projections are 
            automatically calculated for each scenario to understand financial impact.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Conservative Growth</h4>
              <div className="text-2xl font-bold text-green-600">+$1.2M</div>
              <p className="text-xs text-muted-foreground">Annual cost increase</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Aggressive Expansion</h4>
              <div className="text-2xl font-bold text-amber-600">+$3.8M</div>
              <p className="text-xs text-muted-foreground">Annual cost increase</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Hiring Freeze</h4>
              <div className="text-2xl font-bold text-blue-600">-$450K</div>
              <p className="text-xs text-muted-foreground">Attrition savings</p>
            </div>
          </div>
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <h4 className="font-semibold mb-2">
              Cross-Module Link
            </h4>
            <p className="text-sm text-muted-foreground">
              Cost projections connect to the Compensation module for accurate salary 
              range data and the Payroll module for employer cost calculations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Finance System Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-primary" />
            Finance System Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Intelli HRM supports integration with external financial systems for 
            bidirectional budget synchronization:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-3">
              <h4 className="font-semibold">Data to Finance (Export)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Headcount by cost center</li>
                <li>• Salary commitments</li>
                <li>• Projected personnel costs</li>
                <li>• Variance reports</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg space-y-3">
              <h4 className="font-semibold">Data from Finance (Import)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Approved budgets per department</li>
                <li>• Cost center hierarchy</li>
                <li>• GL account mappings</li>
                <li>• Budget freeze flags</li>
              </ul>
            </div>
          </div>
          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-semibold mb-2">Common Integrations</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">SAP FI/CO</Badge>
              <Badge variant="outline">Oracle Financials</Badge>
              <Badge variant="outline">NetSuite</Badge>
              <Badge variant="outline">QuickBooks</Badge>
              <Badge variant="outline">Sage Intacct</Badge>
              <Badge variant="outline">Microsoft Dynamics</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Budget Alerts & Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Configure alerts to notify stakeholders when budget thresholds are 
            approached or exceeded:
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <div>
                  <div className="font-medium">Warning Threshold</div>
                  <div className="text-sm text-muted-foreground">80% of budget utilized</div>
                </div>
              </div>
              <Badge variant="outline" className="text-amber-600">Alert HR & Finance</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <div className="font-medium">Critical Threshold</div>
                  <div className="text-sm text-muted-foreground">95% of budget utilized</div>
                </div>
              </div>
              <Badge variant="outline" className="text-red-600">Block New Requests</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-medium">Over Budget</div>
                  <div className="text-sm text-muted-foreground">&gt;100% of budget utilized</div>
                </div>
              </div>
              <Badge variant="destructive">Escalate to Executive</Badge>
            </div>
          </div>
          <ScreenshotPlaceholder
            caption="Figure 6.7b: Budget alert configuration with threshold settings"
            alt="Alert thresholds for budget utilization warnings and escalations"
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Industry Context */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Industry Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Frequency:</span>
              <p className="text-muted-foreground">Annual budget, monthly reconciliation</p>
            </div>
            <div>
              <span className="font-medium">Benchmark:</span>
              <p className="text-muted-foreground">Workday Financials, SAP HR-FI integration</p>
            </div>
            <div>
              <span className="font-medium">Compliance:</span>
              <p className="text-muted-foreground">SOX controls, internal audit requirements</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
