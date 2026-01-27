import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Briefcase, Clock, Info, ExternalLink, Link2, Database, Users, ArrowRight, CheckCircle, AlertTriangle, Workflow } from 'lucide-react';

export function SuccessionCareerSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-8" data-manual-anchor="part-8" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Briefcase className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">8. Succession-Career Integration</h2>
            <p className="text-muted-foreground">
              Integration between Succession Planning and Career Development modules
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~35 min read
          </span>
          <span>Target: Admin, HR Partner</span>
        </div>
      </section>

      {/* Section 8.1: Integration Overview */}
      <section id="sec-8-1" data-manual-anchor="sec-8-1" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">8.1 Integration Overview</h3>
          <p className="text-muted-foreground">Cross-reference to Career Development Manual</p>
        </div>

        <Alert className="border-blue-500/50 bg-blue-500/5">
          <ExternalLink className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <strong>Module Separation (Industry Standard):</strong> Following industry best practices, Career Development 
            is a standalone module serving ALL employees. This chapter documents only the succession-specific 
            integration points. For complete career pathing, IDP, and mentorship documentation, see the 
            <strong className="text-primary"> Career Development Administrator Manual</strong> at 
            <code className="mx-1 px-1 bg-muted rounded text-xs">/enablement/manuals/career-development</code>.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Succession-Specific Use Cases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The Succession module integrates with Career Development to provide targeted development 
              for succession candidates. These integration points focus on accelerating readiness for 
              critical roles.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold">Candidate Development Tracking</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Link succession candidates to IDPs and track development progress inline on candidate cards.
                  View completion percentage directly in the Succession Plans interface.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold">Gap-to-IDP Linking</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect readiness gaps identified during assessment to specific IDP goals, 
                  creating traceable development pathways.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <h4 className="font-semibold">Succession Mentorship</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Filter mentorship programs by <code className="text-xs bg-muted px-1 rounded">program_type='succession'</code> for 
                  candidate-specific executive pairing.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Workflow className="h-4 w-4 text-orange-600" />
                  <h4 className="font-semibold">Progress Visualization</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Display IDP completion progress and development plan status directly on 
                  succession candidate cards for at-a-glance readiness assessment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Flow Diagram */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Data Flow: Succession → Career Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/30 rounded-lg border">
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                  Succession Candidate
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-500/30">
                  Readiness Gap Identified
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/30">
                  IDP Goal Created
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30">
                  L&D Course Assigned
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/30">
                  Progress Synced Back
                </Badge>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-3">
                Bi-directional sync ensures succession readiness reflects actual development progress
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 8.2: Succession Development Plans */}
      <section id="sec-8-2" data-manual-anchor="sec-8-2" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">8.2 Succession Development Plans</h3>
          <p className="text-muted-foreground">Link succession candidates to development plans</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <code className="text-sm bg-muted px-2 py-1 rounded">succession_development_plans</code>
              <Badge variant="outline">13 columns</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This table links succession candidates to their development plans, enabling inline progress 
              tracking within the Succession Plans view. Each plan represents a specific development 
              initiative for accelerating candidate readiness.
            </p>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Field</TableHead>
                    <TableHead className="w-[120px]">Type</TableHead>
                    <TableHead className="w-[80px]">Required</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell><code className="text-xs">id</code></TableCell>
                    <TableCell>UUID</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">PK</Badge></TableCell>
                    <TableCell>Primary key, auto-generated</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">candidate_id</code></TableCell>
                    <TableCell>UUID</TableCell>
                    <TableCell><Badge variant="destructive" className="text-xs">Yes</Badge></TableCell>
                    <TableCell>FK to succession_candidates - the candidate this plan is for</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">title</code></TableCell>
                    <TableCell>Text</TableCell>
                    <TableCell><Badge variant="destructive" className="text-xs">Yes</Badge></TableCell>
                    <TableCell>Plan title (e.g., "Leadership Development Program")</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">description</code></TableCell>
                    <TableCell>Text</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">No</Badge></TableCell>
                    <TableCell>Detailed description of development objectives</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">development_type</code></TableCell>
                    <TableCell>Text</TableCell>
                    <TableCell><Badge variant="destructive" className="text-xs">Yes</Badge></TableCell>
                    <TableCell>Type: training, mentoring, stretch_assignment, education, certification</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">status</code></TableCell>
                    <TableCell>Text</TableCell>
                    <TableCell><Badge variant="destructive" className="text-xs">Yes</Badge></TableCell>
                    <TableCell>Status: draft, active, completed, cancelled. Default: 'draft'</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">progress</code></TableCell>
                    <TableCell>Integer</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">No</Badge></TableCell>
                    <TableCell>Completion percentage (0-100). Synced from linked IDP if applicable</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">target_date</code></TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">No</Badge></TableCell>
                    <TableCell>Target completion date for the development plan</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">completion_date</code></TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">No</Badge></TableCell>
                    <TableCell>Actual completion date (set when status = 'completed')</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">notes</code></TableCell>
                    <TableCell>Text</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">No</Badge></TableCell>
                    <TableCell>Additional notes or comments on the development plan</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">created_by</code></TableCell>
                    <TableCell>UUID</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">No</Badge></TableCell>
                    <TableCell>FK to profiles - user who created the plan</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">created_at</code></TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">Auto</Badge></TableCell>
                    <TableCell>Record creation timestamp</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">updated_at</code></TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">Auto</Badge></TableCell>
                    <TableCell>Last update timestamp</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Procedures */}
        <Card>
          <CardHeader>
            <CardTitle>Procedures: Creating Development Plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Badge className="mt-0.5">1</Badge>
                <div>
                  <h4 className="font-medium">Navigate to Candidate Detail</h4>
                  <p className="text-sm text-muted-foreground">
                    Open the succession candidate card from Succession Plans → Candidates tab → select candidate.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Badge className="mt-0.5">2</Badge>
                <div>
                  <h4 className="font-medium">Add Development Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    Click "Add Development Plan" in the Development section. Select the development type 
                    that best matches the intervention (training, mentoring, stretch assignment, etc.).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Badge className="mt-0.5">3</Badge>
                <div>
                  <h4 className="font-medium">Set Target Date</h4>
                  <p className="text-sm text-muted-foreground">
                    Define target completion date aligned with succession timeline. Plans without 
                    target dates will be flagged for review.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Badge className="mt-0.5">4</Badge>
                <div>
                  <h4 className="font-medium">Track Progress</h4>
                  <p className="text-sm text-muted-foreground">
                    Progress percentage displays on the candidate card. If linked to an IDP, 
                    progress syncs automatically from IDP goal completion.
                  </p>
                </div>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Best Practice:</strong> Link succession development plans to IDP goals 
                (via Career Development module) for automated progress tracking and L&D integration.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {/* Section 8.3: Gap-to-Development Linking */}
      <section id="sec-8-3" data-manual-anchor="sec-8-3" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">8.3 Gap-to-Development Linking</h3>
          <p className="text-muted-foreground">Link identified skill gaps to IDP goals</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <code className="text-sm bg-muted px-2 py-1 rounded">succession_gap_development_links</code>
              <Badge variant="outline">12 columns</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This table connects readiness gaps identified during succession assessment to specific IDP goals, 
              creating a traceable path from gap identification to development action. Each link represents 
              a specific gap-to-remediation relationship.
            </p>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Field</TableHead>
                    <TableHead className="w-[120px]">Type</TableHead>
                    <TableHead className="w-[80px]">Required</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell><code className="text-xs">id</code></TableCell>
                    <TableCell>UUID</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">PK</Badge></TableCell>
                    <TableCell>Primary key, auto-generated</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">company_id</code></TableCell>
                    <TableCell>UUID</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">No</Badge></TableCell>
                    <TableCell>FK to companies - company scope for RLS</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">candidate_id</code></TableCell>
                    <TableCell>UUID</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">No</Badge></TableCell>
                    <TableCell>FK to succession_candidates - the candidate with the gap</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">gap_type</code></TableCell>
                    <TableCell>Text</TableCell>
                    <TableCell><Badge variant="destructive" className="text-xs">Yes</Badge></TableCell>
                    <TableCell>Gap category: skill, experience, competency, education, certification</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">gap_description</code></TableCell>
                    <TableCell>Text</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">No</Badge></TableCell>
                    <TableCell>Detailed description of the identified gap</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">gap_severity</code></TableCell>
                    <TableCell>Text</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">No</Badge></TableCell>
                    <TableCell>Severity: low, medium, high, critical. Affects prioritization</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">linked_idp_item_id</code></TableCell>
                    <TableCell>UUID</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">No</Badge></TableCell>
                    <TableCell>FK to idp_goals - the IDP goal addressing this gap</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">linked_learning_id</code></TableCell>
                    <TableCell>UUID</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">No</Badge></TableCell>
                    <TableCell>FK to training_courses - direct L&D course link</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">recommended_experience</code></TableCell>
                    <TableCell>Text</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">No</Badge></TableCell>
                    <TableCell>Suggested experiential development (e.g., "Lead Q3 product launch")</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">status</code></TableCell>
                    <TableCell>Text</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">No</Badge></TableCell>
                    <TableCell>Link status: identified, in_progress, addressed, closed</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">created_at</code></TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">Auto</Badge></TableCell>
                    <TableCell>Record creation timestamp</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code className="text-xs">updated_at</code></TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">Auto</Badge></TableCell>
                    <TableCell>Last update timestamp</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Cross-Module Workflow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Cross-Module Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The gap-to-development linking creates a complete workflow spanning three modules:
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg bg-amber-500/5 border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-amber-500">1</Badge>
                  <h4 className="font-semibold text-amber-700">Succession Module</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Gap identified during readiness assessment</li>
                  <li>• Severity classified (low → critical)</li>
                  <li>• Record created in succession_gap_development_links</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg bg-blue-500/5 border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-500">2</Badge>
                  <h4 className="font-semibold text-blue-700">Career Development</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• IDP goal created to address gap</li>
                  <li>• linked_idp_item_id populated</li>
                  <li>• Activities defined with target dates</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg bg-green-500/5 border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-500">3</Badge>
                  <h4 className="font-semibold text-green-700">Learning & Development</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Courses assigned via IDP activity</li>
                  <li>• linked_learning_id populated</li>
                  <li>• Completion updates gap status</li>
                </ul>
              </div>
            </div>

            <Alert className="border-orange-500/50 bg-orange-500/5">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <strong>Implementation Note:</strong> Gaps with severity "critical" should have 
                linked_idp_item_id populated within 14 days of identification. This is monitored 
                via the Succession Analytics dashboard.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {/* Section 8.4: Mentorship for Succession */}
      <section id="sec-8-4" data-manual-anchor="sec-8-4" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">8.4 Mentorship for Succession Candidates</h3>
          <p className="text-muted-foreground">Succession-specific mentorship programs</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <p>
              Mentorship programs with <code className="px-1.5 py-0.5 bg-muted rounded text-sm">program_type='succession'</code> are 
              specifically designed for succession candidates and appear in the Succession module for easy access.
              These programs pair high-potential successors with executive mentors for accelerated leadership development.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  Succession Mentorship Features
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Executive mentors paired with high-potential successors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Leadership readiness focus with structured session agendas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Knowledge transfer from incumbent to successor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Filtered view in Succession module sidebar</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Mentorship Program Types</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <code className="bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded">succession</code>
                    <span className="text-muted-foreground">For succession candidates</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <code className="bg-blue-500/10 text-blue-700 px-2 py-0.5 rounded">development</code>
                    <span className="text-muted-foreground">General career development</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <code className="bg-green-500/10 text-green-700 px-2 py-0.5 rounded">onboarding</code>
                    <span className="text-muted-foreground">New hire orientation</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <code className="bg-purple-500/10 text-purple-700 px-2 py-0.5 rounded">leadership</code>
                    <span className="text-muted-foreground">Leadership development</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-semibold mb-2">Accessing Succession Mentorship</h4>
              <p className="text-sm text-muted-foreground mb-3">
                From the Succession module, navigate to Mentorship in the sidebar. The view is 
                automatically filtered to show only programs with <code>program_type='succession'</code>.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">Route</Badge>
                <code className="px-2 py-0.5 bg-background rounded">/succession/mentorship</code>
              </div>
            </div>

            <Alert className="border-blue-500/50 bg-blue-500/5">
              <ExternalLink className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                For complete mentorship program configuration, mentor-mentee pairings, session tracking, 
                and effectiveness reporting, see <strong className="text-primary">Career Development Manual Chapter 3: Mentorship Programs</strong>.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
