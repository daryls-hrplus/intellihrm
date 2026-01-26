import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Settings, Clock, CheckCircle, Info, Users, Target, Calendar } from 'lucide-react';

export function SuccessionFoundationSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-2" data-manual-anchor="part-2" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Settings className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">2. Foundation Setup</h2>
            <p className="text-muted-foreground">
              Prerequisites, assessor types, readiness bands, availability reasons, and company-specific settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~60 min read
          </span>
          <span>Target: Admin, Consultant</span>
        </div>
      </section>

      {/* Section 2.1: Prerequisites Checklist */}
      <section id="sec-2-1" data-manual-anchor="sec-2-1" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">2.1 Prerequisites Checklist</h3>
          <p className="text-muted-foreground">
            Required configurations from Workforce, Performance, and Competency modules before succession setup
          </p>
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Before You Begin</AlertTitle>
          <AlertDescription>
            Complete all prerequisites to ensure succession planning functions correctly with accurate data from connected modules.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Module Prerequisites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Workforce</Badge>
                  <span className="font-medium">Organization Structure</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>□ Job families and job codes defined</li>
                  <li>□ Position hierarchy established</li>
                  <li>□ Key positions flagged (is_key_position = true)</li>
                  <li>□ Reporting relationships configured</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Competencies</Badge>
                  <span className="font-medium">Skills Framework</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>□ Competency library populated</li>
                  <li>□ Leadership competencies identified</li>
                  <li>□ Job-to-competency mappings complete</li>
                  <li>□ Proficiency levels defined</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Performance</Badge>
                  <span className="font-medium">Appraisal Data</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>□ At least one completed appraisal cycle</li>
                  <li>□ Final ratings available for Nine-Box</li>
                  <li>□ Goal achievement scores calculated</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 2.2: Assessor Types Configuration */}
      <section id="sec-2-2" data-manual-anchor="sec-2-2" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">2.2 Assessor Types Configuration</h3>
          <p className="text-muted-foreground">
            Configure Manager, HR, Executive, and Skip-Level assessor roles with permissions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Standard Assessor Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Assessor Type</th>
                    <th className="text-left py-2">Code</th>
                    <th className="text-left py-2">Weight</th>
                    <th className="text-left py-2">Scope</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Direct Manager</td>
                    <td className="py-2 font-mono text-xs">MANAGER</td>
                    <td className="py-2">40%</td>
                    <td className="py-2">Direct reports only</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">HR Business Partner</td>
                    <td className="py-2 font-mono text-xs">HR_PARTNER</td>
                    <td className="py-2">30%</td>
                    <td className="py-2">Assigned business units</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Executive Sponsor</td>
                    <td className="py-2 font-mono text-xs">EXECUTIVE</td>
                    <td className="py-2">20%</td>
                    <td className="py-2">Division/function level</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Skip-Level Manager</td>
                    <td className="py-2 font-mono text-xs">SKIP_LEVEL</td>
                    <td className="py-2">10%</td>
                    <td className="py-2">Manager's manager view</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">Database Table</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300 font-mono text-xs">
            succession_assessor_types (code, name, weight, display_order, is_active, company_id)
          </AlertDescription>
        </Alert>
      </section>

      {/* Section 2.3: Readiness Rating Bands */}
      <section id="sec-2-3" data-manual-anchor="sec-2-3" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">2.3 Readiness Rating Bands</h3>
          <p className="text-muted-foreground">
            Define Ready Now, 1-2 Years, 3+ Years, Developing, and Not a Successor bands with score ranges
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              5-Band Readiness Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-green-500/10 rounded-lg">
                <Badge className="bg-green-600">Ready Now</Badge>
                <span className="text-sm">Score: 85-100%</span>
                <span className="text-sm text-muted-foreground">Can assume role within 0-12 months</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-blue-500/10 rounded-lg">
                <Badge className="bg-blue-600">Ready 1-2 Years</Badge>
                <span className="text-sm">Score: 70-84%</span>
                <span className="text-sm text-muted-foreground">Needs 1-2 years of development</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-amber-500/10 rounded-lg">
                <Badge className="bg-amber-600">Ready 3+ Years</Badge>
                <span className="text-sm">Score: 55-69%</span>
                <span className="text-sm text-muted-foreground">Needs 3+ years of development</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-orange-500/10 rounded-lg">
                <Badge className="bg-orange-600">Developing</Badge>
                <span className="text-sm">Score: 40-54%</span>
                <span className="text-sm text-muted-foreground">Long-term potential, significant gaps</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-red-500/10 rounded-lg">
                <Badge variant="destructive">Not a Successor</Badge>
                <span className="text-sm">Score: 0-39%</span>
                <span className="text-sm text-muted-foreground">Not suitable for this succession path</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">Database Table</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300 font-mono text-xs">
            readiness_rating_bands (code, name, min_score, max_score, color, display_order, company_id)
          </AlertDescription>
        </Alert>
      </section>

      {/* Section 2.4: Availability Reasons */}
      <section id="sec-2-4" data-manual-anchor="sec-2-4" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">2.4 Availability Reasons</h3>
          <p className="text-muted-foreground">
            Configure Retirement, Promotion, Resignation, Transfer, and custom availability reasons
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Standard Availability Reasons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Planned Departures</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Retirement (mandatory/voluntary)</li>
                  <li>• Internal Promotion</li>
                  <li>• Lateral Transfer</li>
                  <li>• Expatriate Assignment</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Unplanned Departures</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Resignation</li>
                  <li>• Termination</li>
                  <li>• Extended Leave</li>
                  <li>• Disability</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">Database Table</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300 font-mono text-xs">
            succession_availability_reasons (code, name, category, is_planned, display_order, company_id)
          </AlertDescription>
        </Alert>
      </section>

      {/* Section 2.5: Company-Specific Settings */}
      <section id="sec-2-5" data-manual-anchor="sec-2-5" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">2.5 Company-Specific Settings</h3>
          <p className="text-muted-foreground">
            Multi-company configuration, inheritance rules, and regional compliance settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration Hierarchy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Succession planning configuration follows a hierarchical inheritance model:
              </p>
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Badge>1</Badge>
                  <span className="text-sm">System defaults (global baseline)</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge>2</Badge>
                  <span className="text-sm">Company group overrides</span>
                </div>
                <div className="flex items-center gap-2 ml-8">
                  <Badge>3</Badge>
                  <span className="text-sm">Individual company settings</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Each level inherits from its parent and can override specific settings. 
                This allows global consistency with local flexibility.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
