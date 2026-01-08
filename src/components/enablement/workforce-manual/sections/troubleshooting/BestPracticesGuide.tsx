import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, Building2, Database, CheckCircle, Lightbulb, 
  TrendingUp, Target, Award, BookOpen
} from 'lucide-react';
import { FeatureCard } from '@/components/enablement/manual/components/FeatureCard';

export function BestPracticesGuide() {
  return (
    <div className="space-y-6" data-manual-anchor="wf-troubleshooting-best-practices">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Star className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <CardTitle>10.4 Best Practices Guide</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Industry-validated guidelines for organization design, data governance, and system optimization
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="secondary">All Roles</Badge>
            <Badge variant="outline">Est. 15 min</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Organization Design Best Practices */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-blue-500" />
              Organization Design Best Practices
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <FeatureCard
                variant="primary"
                icon={TrendingUp}
                title="Hierarchy Depth"
              >
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Maximum 7 levels recommended (CEO to front-line)</li>
                  <li>• Each additional level reduces communication efficiency by ~25%</li>
                  <li>• Consider matrix structures for cross-functional teams</li>
                </ul>
              </FeatureCard>
              <FeatureCard
                variant="success"
                icon={Target}
                title="Span of Control"
              >
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Optimal: 5-10 direct reports per manager</li>
                  <li>• Technical roles: 3-7 reports (complex work)</li>
                  <li>• Operational roles: 10-15 reports (routine work)</li>
                </ul>
              </FeatureCard>
            </div>
            
            <div className="mt-4 bg-muted/30 border rounded-lg p-4">
              <h5 className="font-medium mb-3">Position Naming Conventions</h5>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-green-600 dark:text-green-400">✓ Recommended</p>
                  <ul className="mt-1 text-muted-foreground space-y-1">
                    <li>• Senior Software Engineer</li>
                    <li>• HR Business Partner - Caribbean</li>
                    <li>• Finance Manager - Jamaica</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-red-600 dark:text-red-400">✗ Avoid</p>
                  <ul className="mt-1 text-muted-foreground space-y-1">
                    <li>• John's Position</li>
                    <li>• New Role TBD</li>
                    <li>• Position 1234</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-blue-600 dark:text-blue-400">💡 Pattern</p>
                  <ul className="mt-1 text-muted-foreground space-y-1">
                    <li>• [Level] [Function] [Specialty]</li>
                    <li>• [Role] - [Location/Region]</li>
                    <li>• [Job Title] - [Department]</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Data Governance Standards */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-purple-500" />
              Data Governance Standards
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium">Principle</th>
                    <th className="text-left p-3 font-medium">Standard</th>
                    <th className="text-left p-3 font-medium">Enforcement</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3 font-medium">Data Entry Quality</td>
                    <td className="p-3 text-muted-foreground">No placeholder or test data in production</td>
                    <td className="p-3">Validation rules block common test patterns</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Required Fields</td>
                    <td className="p-3 text-muted-foreground">Only truly mandatory fields marked required</td>
                    <td className="p-3">Quarterly review of field requirements</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Data Ownership</td>
                    <td className="p-3 text-muted-foreground">Each data domain has an assigned steward</td>
                    <td className="p-3">Documented in Settings → Data Governance</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Change Tracking</td>
                    <td className="p-3 text-muted-foreground">All changes logged with who/what/when</td>
                    <td className="p-3">Automatic audit trail (cannot be disabled)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Regular Cleansing</td>
                    <td className="p-3 text-muted-foreground">Monthly data quality reviews</td>
                    <td className="p-3">Scheduled Data Quality Report</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Industry Benchmarks */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-amber-500" />
              Industry Benchmarks (Workday/SAP SuccessFactors Standards)
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-muted/30 border rounded-lg p-4">
                <h5 className="font-medium text-sm mb-2">Data Completeness</h5>
                <div className="text-3xl font-bold text-green-500">95%+</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Required fields populated for active employees
                </p>
              </div>
              <div className="bg-muted/30 border rounded-lg p-4">
                <h5 className="font-medium text-sm mb-2">Org Chart Accuracy</h5>
                <div className="text-3xl font-bold text-blue-500">99%+</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Employees correctly assigned to managers
                </p>
              </div>
              <div className="bg-muted/30 border rounded-lg p-4">
                <h5 className="font-medium text-sm mb-2">Workflow Completion</h5>
                <div className="text-3xl font-bold text-purple-500">&lt;3 days</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average time to complete lifecycle workflows
                </p>
              </div>
            </div>
          </div>

          {/* Quarterly Review Checklist */}
          <div className="bg-muted/30 border rounded-lg p-4">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Quarterly Review Checklist
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-sm mb-2">Organization Structure</h5>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>Review and update department hierarchy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>Audit span of control for each manager</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>Verify cost center assignments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>Update location/branch information</span>
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-sm mb-2">Data Quality</h5>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>Run duplicate detection and resolve matches</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>Review incomplete employee records</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>Verify terminated employees are properly offboarded</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>Check integration sync status for all modules</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Context Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <FeatureCard
              variant="info"
              icon={BookOpen}
              title="Caribbean & Africa Context"
            >
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Support for multi-island organizational structures</li>
                <li>• Regional cost center groupings for reporting</li>
                <li>• Compliance with local labor law structures</li>
                <li>• Multi-currency position budgeting</li>
              </ul>
            </FeatureCard>
            <FeatureCard
              variant="warning"
              icon={TrendingUp}
              title="Growth Considerations"
            >
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Plan hierarchy for 2x current headcount</li>
                <li>• Design departments for future splits</li>
                <li>• Use position numbers for scale (P0001 vs names)</li>
                <li>• Consider automation thresholds early</li>
              </ul>
            </FeatureCard>
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Schedule a monthly "Data Hygiene Hour" where HR team members 
              spend focused time reviewing and correcting data quality issues. Small, regular maintenance 
              prevents major cleanup projects.
            </AlertDescription>
          </Alert>

        </CardContent>
      </Card>
    </div>
  );
}
