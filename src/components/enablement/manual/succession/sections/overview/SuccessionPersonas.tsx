import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Users, 
  Shield, 
  UserCog, 
  Briefcase, 
  User,
  Clock,
  CheckCircle,
  XCircle,
  Minus,
  Info,
  Calendar
} from 'lucide-react';

export function SuccessionPersonas() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">1.3 User Personas & Journeys</h3>
        <p className="text-muted-foreground mt-1">
          Role-based workflows, access rights, and typical user journeys
        </p>
      </div>

      {/* Persona Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* HR Administrator */}
        <Card className="border-orange-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <UserCog className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <span>HR Administrator</span>
                <Badge variant="outline" className="ml-2 text-xs">Full Access</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-muted/50 rounded">
                <div className="text-muted-foreground">Login Frequency</div>
                <div className="font-semibold">Daily</div>
              </div>
              <div className="p-2 bg-muted/50 rounded">
                <div className="text-muted-foreground">Time in Module</div>
                <div className="font-semibold">4-6 hrs/week</div>
              </div>
            </div>
            <div className="text-sm">
              <div className="font-semibold mb-1">Primary Goals</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Configure and maintain succession planning infrastructure</li>
                <li>• Conduct organization-wide talent reviews and calibration</li>
                <li>• Generate succession reports for leadership</li>
                <li>• Monitor flight risk and bench strength metrics</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Manager */}
        <Card className="border-blue-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <span>Manager (MSS)</span>
                <Badge variant="outline" className="ml-2 text-xs">Team Access</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-muted/50 rounded">
                <div className="text-muted-foreground">Login Frequency</div>
                <div className="font-semibold">Weekly</div>
              </div>
              <div className="p-2 bg-muted/50 rounded">
                <div className="text-muted-foreground">Time in Module</div>
                <div className="font-semibold">1-2 hrs/week</div>
              </div>
            </div>
            <div className="text-sm">
              <div className="font-semibold mb-1">Primary Goals</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Nominate and rank succession candidates for team positions</li>
                <li>• Complete readiness assessments for direct reports</li>
                <li>• View team Nine-Box placements and development gaps</li>
                <li>• Participate in calibration sessions</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Executive */}
        <Card className="border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <span>Executive</span>
                <Badge variant="outline" className="ml-2 text-xs">Strategic View</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-muted/50 rounded">
                <div className="text-muted-foreground">Login Frequency</div>
                <div className="font-semibold">Monthly</div>
              </div>
              <div className="p-2 bg-muted/50 rounded">
                <div className="text-muted-foreground">Time in Module</div>
                <div className="font-semibold">2-4 hrs/quarter</div>
              </div>
            </div>
            <div className="text-sm">
              <div className="font-semibold mb-1">Primary Goals</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Review organization-wide Nine-Box distribution</li>
                <li>• Validate succession plans for critical leadership roles</li>
                <li>• Participate in talent review and calibration sessions</li>
                <li>• Monitor strategic workforce planning metrics</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Employee */}
        <Card className="border-teal-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 bg-teal-500/10 rounded-lg">
                <User className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <span>Employee (ESS)</span>
                <Badge variant="outline" className="ml-2 text-xs">Self-Service</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-muted/50 rounded">
                <div className="text-muted-foreground">Login Frequency</div>
                <div className="font-semibold">Quarterly</div>
              </div>
              <div className="p-2 bg-muted/50 rounded">
                <div className="text-muted-foreground">Time in Module</div>
                <div className="font-semibold">15-30 min/quarter</div>
              </div>
            </div>
            <div className="text-sm">
              <div className="font-semibold mb-1">Primary Goals</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• View available career paths and progression steps</li>
                <li>• Express career aspirations and interests</li>
                <li>• Track development progress against succession gaps</li>
                <li>• Participate in mentorship programs</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HR Administrator Journey */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-orange-600" />
            HR Administrator Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold w-12">Step</th>
                  <th className="text-left p-3 font-semibold">Action</th>
                  <th className="text-left p-3 font-semibold">Timing</th>
                  <th className="text-left p-3 font-semibold">System Path</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { step: 1, action: 'Configure assessor types (Manager, HR, Executive)', timing: 'Initial Setup', path: 'Setup → Assessor Types' },
                  { step: 2, action: 'Define readiness rating bands and score ranges', timing: 'Initial Setup', path: 'Setup → Readiness Bands' },
                  { step: 3, action: 'Create weighted readiness indicators by staff type', timing: 'Initial Setup', path: 'Setup → Indicators' },
                  { step: 4, action: 'Configure Nine-Box rating sources and weights', timing: 'Initial Setup', path: 'Setup → 9-Box Config' },
                  { step: 5, action: 'Identify and flag key positions in org structure', timing: 'Annual', path: 'Key Positions → Mark as Key' },
                  { step: 6, action: 'Assess key position risks and criticality levels', timing: 'Annual', path: 'Key Positions → Risk Assessment' },
                  { step: 7, action: 'Trigger Nine-Box calculations from performance data', timing: 'Post-Appraisal', path: 'Nine-Box → Calculate' },
                  { step: 8, action: 'Facilitate calibration sessions with managers', timing: 'Quarterly', path: 'Nine-Box → Calibration' },
                  { step: 9, action: 'Create succession plans for key positions', timing: 'Annual', path: 'Plans → Create New' },
                  { step: 10, action: 'Initiate readiness assessments for candidates', timing: 'Per Candidate', path: 'Plans → Assess Readiness' },
                  { step: 11, action: 'Review and finalize candidate rankings', timing: 'Quarterly', path: 'Plans → Rank Candidates' },
                  { step: 12, action: 'Link development plans to identified gaps', timing: 'Ongoing', path: 'Plans → Development' },
                  { step: 13, action: 'Monitor flight risk indicators across talent pools', timing: 'Monthly', path: 'Flight Risk → Dashboard' },
                  { step: 14, action: 'Generate bench strength reports for leadership', timing: 'Quarterly', path: 'Analytics → Bench Strength' },
                  { step: 15, action: 'Archive and update succession plans as needed', timing: 'Ongoing', path: 'Plans → Archive/Update' },
                ].map((row) => (
                  <tr key={row.step} className="border-b">
                    <td className="p-3">
                      <Badge variant="outline">{row.step}</Badge>
                    </td>
                    <td className="p-3">{row.action}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">{row.timing}</Badge>
                    </td>
                    <td className="p-3">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{row.path}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Manager Journey */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            Manager (MSS) Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold w-12">Step</th>
                  <th className="text-left p-3 font-semibold">Action</th>
                  <th className="text-left p-3 font-semibold">Timing</th>
                  <th className="text-left p-3 font-semibold">System Path</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { step: 1, action: 'Review team members\' Nine-Box placements', timing: 'Quarterly', path: 'MSS → Team Nine-Box' },
                  { step: 2, action: 'Nominate direct reports as succession candidates', timing: 'Annual', path: 'MSS → Succession → Nominate' },
                  { step: 3, action: 'Complete readiness assessments for nominated candidates', timing: 'Per Request', path: 'MSS → Assessments → Complete' },
                  { step: 4, action: 'Participate in calibration sessions with HR', timing: 'Quarterly', path: 'Calibration Meeting' },
                  { step: 5, action: 'Review development plans for high-potential team members', timing: 'Monthly', path: 'MSS → Development Plans' },
                  { step: 6, action: 'Provide career coaching based on succession gaps', timing: 'Ongoing', path: '1:1 Conversations' },
                  { step: 7, action: 'Monitor flight risk indicators for key team members', timing: 'Monthly', path: 'MSS → Flight Risk Alerts' },
                  { step: 8, action: 'Update succession nominations based on performance changes', timing: 'As Needed', path: 'MSS → Succession → Update' },
                ].map((row) => (
                  <tr key={row.step} className="border-b">
                    <td className="p-3">
                      <Badge variant="outline">{row.step}</Badge>
                    </td>
                    <td className="p-3">{row.action}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">{row.timing}</Badge>
                    </td>
                    <td className="p-3">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{row.path}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Executive & Employee Journeys */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Executive Journey */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Executive Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { step: 1, action: 'Review organization Nine-Box distribution', path: 'Dashboard → Talent Overview' },
                { step: 2, action: 'Validate critical position succession plans', path: 'Plans → Leadership Roles' },
                { step: 3, action: 'Participate in executive talent review', path: 'Talent Review Sessions' },
                { step: 4, action: 'Approve high-potential pool nominations', path: 'Talent Pools → Approve' },
                { step: 5, action: 'Review bench strength for division', path: 'Analytics → Bench Strength' },
                { step: 6, action: 'Provide readiness input for key candidates', path: 'Assessments → Executive Input' },
              ].map((row) => (
                <div key={row.step} className="flex items-start gap-3 p-2 bg-muted/30 rounded">
                  <Badge variant="outline" className="shrink-0">{row.step}</Badge>
                  <div className="flex-1">
                    <div className="text-sm">{row.action}</div>
                    <code className="text-xs text-muted-foreground">{row.path}</code>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Employee Journey */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5 text-teal-600" />
              Employee (ESS) Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { step: 1, action: 'View available career paths in organization', path: 'ESS → Career Paths' },
                { step: 2, action: 'Express career aspirations and interests', path: 'ESS → My Career → Aspirations' },
                { step: 3, action: 'View pipeline status (if visible to employee)', path: 'ESS → My Development' },
                { step: 4, action: 'Track IDP progress against succession gaps', path: 'ESS → Development Plan' },
                { step: 5, action: 'Participate in mentorship program', path: 'ESS → Mentorship' },
                { step: 6, action: 'Complete learning for development gaps', path: 'ESS → Learning → Required' },
              ].map((row) => (
                <div key={row.step} className="flex items-start gap-3 p-2 bg-muted/30 rounded">
                  <Badge variant="outline" className="shrink-0">{row.step}</Badge>
                  <div className="flex-1">
                    <div className="text-sm">{row.action}</div>
                    <code className="text-xs text-muted-foreground">{row.path}</code>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-Based Access Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Role-Based Access Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Capability</th>
                  <th className="text-center p-3 font-semibold">Employee</th>
                  <th className="text-center p-3 font-semibold">Manager</th>
                  <th className="text-center p-3 font-semibold">HR Admin</th>
                  <th className="text-center p-3 font-semibold">Executive</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { capability: 'View own Nine-Box placement', employee: 'limited', manager: 'full', hr: 'full', exec: 'full' },
                  { capability: 'View team Nine-Box placements', employee: 'none', manager: 'full', hr: 'full', exec: 'full' },
                  { capability: 'View organization Nine-Box distribution', employee: 'none', manager: 'limited', hr: 'full', exec: 'full' },
                  { capability: 'Create succession plans', employee: 'none', manager: 'limited', hr: 'full', exec: 'none' },
                  { capability: 'Nominate succession candidates', employee: 'none', manager: 'full', hr: 'full', exec: 'full' },
                  { capability: 'Rank succession candidates', employee: 'none', manager: 'limited', hr: 'full', exec: 'limited' },
                  { capability: 'Conduct readiness assessment', employee: 'none', manager: 'full', hr: 'full', exec: 'full' },
                  { capability: 'Configure Nine-Box sources', employee: 'none', manager: 'none', hr: 'full', exec: 'none' },
                  { capability: 'Configure readiness indicators', employee: 'none', manager: 'none', hr: 'full', exec: 'none' },
                  { capability: 'Manage talent pools', employee: 'none', manager: 'limited', hr: 'full', exec: 'limited' },
                  { capability: 'View flight risk dashboard', employee: 'none', manager: 'limited', hr: 'full', exec: 'full' },
                  { capability: 'Access succession analytics', employee: 'none', manager: 'limited', hr: 'full', exec: 'full' },
                  { capability: 'Generate bench strength reports', employee: 'none', manager: 'none', hr: 'full', exec: 'limited' },
                  { capability: 'Manage career paths', employee: 'none', manager: 'none', hr: 'full', exec: 'none' },
                  { capability: 'View own career paths', employee: 'full', manager: 'full', hr: 'full', exec: 'full' },
                ].map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">{row.capability}</td>
                    <td className="p-3 text-center">
                      {row.employee === 'full' && <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />}
                      {row.employee === 'limited' && <Minus className="h-4 w-4 text-amber-600 mx-auto" />}
                      {row.employee === 'none' && <XCircle className="h-4 w-4 text-muted-foreground/50 mx-auto" />}
                    </td>
                    <td className="p-3 text-center">
                      {row.manager === 'full' && <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />}
                      {row.manager === 'limited' && <Minus className="h-4 w-4 text-amber-600 mx-auto" />}
                      {row.manager === 'none' && <XCircle className="h-4 w-4 text-muted-foreground/50 mx-auto" />}
                    </td>
                    <td className="p-3 text-center">
                      {row.hr === 'full' && <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />}
                      {row.hr === 'limited' && <Minus className="h-4 w-4 text-amber-600 mx-auto" />}
                      {row.hr === 'none' && <XCircle className="h-4 w-4 text-muted-foreground/50 mx-auto" />}
                    </td>
                    <td className="p-3 text-center">
                      {row.exec === 'full' && <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />}
                      {row.exec === 'limited' && <Minus className="h-4 w-4 text-amber-600 mx-auto" />}
                      {row.exec === 'none' && <XCircle className="h-4 w-4 text-muted-foreground/50 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Full Access</span>
            </div>
            <div className="flex items-center gap-1">
              <Minus className="h-3 w-3 text-amber-600" />
              <span>Limited (Own/Team Only)</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-muted-foreground/50" />
              <span>No Access</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day-in-the-Life Scenario */}
      <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Day-in-the-Life: HR Admin During Talent Review Season
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-blue-500/30 bg-blue-500/5">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-700">Scenario Context</AlertTitle>
            <AlertDescription className="text-blue-600/80">
              It's Q2 and Sarah, an HR Business Partner, is preparing for the annual talent review 
              for the Technology division (150 employees, 8 key positions).
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
              <Badge variant="outline" className="shrink-0">8:00 AM</Badge>
              <div>
                <div className="font-semibold text-sm">Review Nine-Box Calculations</div>
                <div className="text-xs text-muted-foreground">
                  Checks the Nine-Box grid for the division. 12 employees are flagged as "Stars" 
                  and 8 as "High Performers". Notices 3 employees moved from "Core Player" to "Effective" 
                  based on latest appraisal scores.
                </div>
                <code className="text-xs text-primary mt-1 block">Succession → Nine-Box → Technology Division</code>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
              <Badge variant="outline" className="shrink-0">9:30 AM</Badge>
              <div>
                <div className="font-semibold text-sm">Prepare Calibration Materials</div>
                <div className="text-xs text-muted-foreground">
                  Generates a review packet for the 8 key positions. Exports Nine-Box distribution, 
                  bench strength summary, and flight risk alerts to share with the VP of Technology.
                </div>
                <code className="text-xs text-primary mt-1 block">Analytics → Generate Report → Talent Review Packet</code>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
              <Badge variant="outline" className="shrink-0">11:00 AM</Badge>
              <div>
                <div className="font-semibold text-sm">Calibration Session with Managers</div>
                <div className="text-xs text-muted-foreground">
                  Facilitates a 2-hour session with 5 engineering managers. Three Nine-Box placements 
                  are adjusted based on manager input. Documents calibration notes in the system.
                </div>
                <code className="text-xs text-primary mt-1 block">Nine-Box → Calibration → Record Adjustments</code>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
              <Badge variant="outline" className="shrink-0">2:00 PM</Badge>
              <div>
                <div className="font-semibold text-sm">Update Succession Plans</div>
                <div className="text-xs text-muted-foreground">
                  Reviews succession plans for 3 Director-level roles. Adds 2 new candidates nominated 
                  during calibration. Initiates readiness assessments for the new nominees.
                </div>
                <code className="text-xs text-primary mt-1 block">Plans → Director of Engineering → Add Candidates</code>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
              <Badge variant="outline" className="shrink-0">4:00 PM</Badge>
              <div>
                <div className="font-semibold text-sm">Address Flight Risk Alert</div>
                <div className="text-xs text-muted-foreground">
                  Notices a high-flight-risk alert for a key successor. Schedules a retention conversation 
                  with the employee's manager and documents the action in the system.
                </div>
                <code className="text-xs text-primary mt-1 block">Flight Risk → Maria Chen → Log Retention Action</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
