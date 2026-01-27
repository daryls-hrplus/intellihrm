import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Clock, Users, Database, Route, Target, Briefcase, Network, Info, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CareerDevOverviewSection() {
  return (
    <div className="space-y-12">
      {/* Chapter Header */}
      <section id="chapter-1" data-manual-anchor="chapter-1" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">1. System Overview</h2>
            <p className="text-muted-foreground">
              Introduction to Career Development, business value, core concepts, and data architecture
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~55 min read
          </span>
          <span>Target: Admin, Consultant, HR Partner</span>
        </div>
      </section>

      {/* Section 1.1: Introduction & Business Value */}
      <section id="sec-1-1" data-manual-anchor="sec-1-1" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-emerald-500 pl-4">
          <h3 className="text-xl font-semibold">1.1 Introduction & Business Value</h3>
          <p className="text-muted-foreground">Strategic value of career development, employee engagement impact, and retention benefits</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-500" />
              Module Purpose
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The <strong>Career Development Module</strong> provides a comprehensive platform for managing employee career 
              progression, individual development plans (IDPs), and mentorship programs. Following the Workday Career Hub 
              architecture, this standalone module serves ALL employees—not just succession candidates—enabling organization-wide 
              career visibility and development.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Route className="h-4 w-4 text-emerald-500" />
                  Career Paths
                </h4>
                <p className="text-sm text-muted-foreground">
                  Define structured progression routes that show employees potential career trajectories within the organization.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Individual Development Plans
                </h4>
                <p className="text-sm text-muted-foreground">
                  Create personalized development roadmaps with goals, activities, and progress tracking for every employee.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  Mentorship Programs
                </h4>
                <p className="text-sm text-muted-foreground">
                  Pair mentors with mentees, track sessions, and measure mentorship program effectiveness.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-orange-500" />
                  AI-Driven Themes
                </h4>
                <p className="text-sm text-muted-foreground">
                  Leverage AI to generate development themes from talent signals and recommend learning activities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Value & ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Industry Benchmark</TableHead>
                  <TableHead>Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Employee Engagement</TableCell>
                  <TableCell>+34% with career development</TableCell>
                  <TableCell>Gallup research on engagement drivers</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Retention</TableCell>
                  <TableCell>+25% with mentorship programs</TableCell>
                  <TableCell>SHRM mentorship impact study</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Internal Mobility</TableCell>
                  <TableCell>2x higher with visible career paths</TableCell>
                  <TableCell>LinkedIn Workplace Learning Report</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Development ROI</TableCell>
                  <TableCell>$4.53 return per $1 invested</TableCell>
                  <TableCell>ATD State of the Industry</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Industry Alignment:</strong> This module follows the Workday Career Hub architecture where Career Development 
            is a standalone module serving all employees. Succession Planning integration is handled via cross-module references 
            (see Chapter 6).
          </AlertDescription>
        </Alert>
      </section>

      {/* Section 1.2: Core Concepts */}
      <section id="sec-1-2" data-manual-anchor="sec-1-2" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-emerald-500 pl-4">
          <h3 className="text-xl font-semibold">1.2 Core Concepts & Terminology</h3>
          <p className="text-muted-foreground">Career paths, IDPs, mentorship programs, and lifecycle states</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Career Path Hierarchy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">Career Path</p>
                  <p className="text-sm text-muted-foreground">Top-level container defining a progression route (e.g., "Engineering Track")</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">Career Path Step</p>
                  <p className="text-sm text-muted-foreground">Individual position within a path with sequence order and duration</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">Job Linkage</p>
                  <p className="text-sm text-muted-foreground">Connection between path steps and actual job positions in the organization</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">IDP Hierarchy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">Individual Development Plan</p>
                  <p className="text-sm text-muted-foreground">Container for employee's development goals and timeline</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">IDP Goal</p>
                  <p className="text-sm text-muted-foreground">Specific development objective (skill, knowledge, certification, etc.)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">IDP Activity</p>
                  <p className="text-sm text-muted-foreground">Concrete action to achieve a goal (training, project, mentoring)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mentorship Hierarchy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">Mentorship Program</p>
                  <p className="text-sm text-muted-foreground">Organizational initiative with type and duration</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">Mentorship Pairing</p>
                  <p className="text-sm text-muted-foreground">Formal relationship between mentor and mentee</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">Mentorship Session</p>
                  <p className="text-sm text-muted-foreground">Scheduled meeting with topics and action items</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">70-20-10 Development Model</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className="bg-emerald-500">70%</Badge>
                <div>
                  <p className="font-medium">Experiential Learning</p>
                  <p className="text-sm text-muted-foreground">On-the-job projects, stretch assignments, job rotations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-blue-500">20%</Badge>
                <div>
                  <p className="font-medium">Social Learning</p>
                  <p className="text-sm text-muted-foreground">Mentoring, coaching, peer learning, feedback</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-purple-500">10%</Badge>
                <div>
                  <p className="font-medium">Formal Training</p>
                  <p className="text-sm text-muted-foreground">Courses, certifications, workshops, e-learning</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 1.3: User Personas */}
      <section id="sec-1-3" data-manual-anchor="sec-1-3" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-emerald-500 pl-4">
          <h3 className="text-xl font-semibold">1.3 User Personas & Journeys</h3>
          <p className="text-muted-foreground">HR Admin, Manager, and Employee workflows and access patterns</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-red-500" />
                </div>
                <CardTitle className="text-base">HR Administrator</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">Primary Responsibilities:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Create and manage career paths
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Configure mentorship programs
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Review AI-generated themes
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Generate analytics reports
                  </li>
                </ul>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Access:</strong> /succession/career-paths, /succession/mentorship, /succession/career-development
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Briefcase className="h-5 w-5 text-blue-500" />
                </div>
                <CardTitle className="text-base">Manager</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">Primary Responsibilities:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Create IDPs for team members
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Assign development goals
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Serve as mentor
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Confirm development themes
                  </li>
                </ul>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Access:</strong> MSS Team pages, Career Development tab
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-emerald-500" />
                </div>
                <CardTitle className="text-base">Employee</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">Primary Activities:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    View career paths
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Update IDP progress
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Log mentorship sessions
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    View skill gaps
                  </li>
                </ul>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Access:</strong> /ess/career-paths, /ess/career-plan, /ess/mentorship
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 1.4: Database Architecture */}
      <section id="sec-1-4" data-manual-anchor="sec-1-4" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-emerald-500 pl-4">
          <h3 className="text-xl font-semibold">1.4 Database Architecture</h3>
          <p className="text-muted-foreground">10 core tables across career pathing, IDP, and mentorship domains</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-500" />
              Core Tables by Domain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Columns</TableHead>
                  <TableHead>Purpose</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-emerald-50/50 dark:bg-emerald-950/20">
                  <TableCell rowSpan={2} className="font-medium">Career Paths</TableCell>
                  <TableCell><code className="text-xs">career_paths</code></TableCell>
                  <TableCell>8</TableCell>
                  <TableCell>Career path definitions</TableCell>
                </TableRow>
                <TableRow className="bg-emerald-50/50 dark:bg-emerald-950/20">
                  <TableCell><code className="text-xs">career_path_steps</code></TableCell>
                  <TableCell>8</TableCell>
                  <TableCell>Steps within paths</TableCell>
                </TableRow>
                <TableRow className="bg-blue-50/50 dark:bg-blue-950/20">
                  <TableCell rowSpan={3} className="font-medium">IDP</TableCell>
                  <TableCell><code className="text-xs">individual_development_plans</code></TableCell>
                  <TableCell>13</TableCell>
                  <TableCell>Development plan containers</TableCell>
                </TableRow>
                <TableRow className="bg-blue-50/50 dark:bg-blue-950/20">
                  <TableCell><code className="text-xs">idp_goals</code></TableCell>
                  <TableCell>13</TableCell>
                  <TableCell>Development goals</TableCell>
                </TableRow>
                <TableRow className="bg-blue-50/50 dark:bg-blue-950/20">
                  <TableCell><code className="text-xs">idp_activities</code></TableCell>
                  <TableCell>11</TableCell>
                  <TableCell>Goal activities</TableCell>
                </TableRow>
                <TableRow className="bg-purple-50/50 dark:bg-purple-950/20">
                  <TableCell rowSpan={3} className="font-medium">Mentorship</TableCell>
                  <TableCell><code className="text-xs">mentorship_programs</code></TableCell>
                  <TableCell>11</TableCell>
                  <TableCell>Program definitions</TableCell>
                </TableRow>
                <TableRow className="bg-purple-50/50 dark:bg-purple-950/20">
                  <TableCell><code className="text-xs">mentorship_pairings</code></TableCell>
                  <TableCell>11</TableCell>
                  <TableCell>Mentor-mentee relationships</TableCell>
                </TableRow>
                <TableRow className="bg-purple-50/50 dark:bg-purple-950/20">
                  <TableCell><code className="text-xs">mentorship_sessions</code></TableCell>
                  <TableCell>10</TableCell>
                  <TableCell>Session tracking</TableCell>
                </TableRow>
                <TableRow className="bg-orange-50/50 dark:bg-orange-950/20">
                  <TableCell rowSpan={2} className="font-medium">AI</TableCell>
                  <TableCell><code className="text-xs">development_themes</code></TableCell>
                  <TableCell>15</TableCell>
                  <TableCell>AI-generated themes</TableCell>
                </TableRow>
                <TableRow className="bg-orange-50/50 dark:bg-orange-950/20">
                  <TableCell><code className="text-xs">development_recommendations</code></TableCell>
                  <TableCell>10</TableCell>
                  <TableCell>Learning recommendations</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Alert>
          <Network className="h-4 w-4" />
          <AlertDescription>
            <strong>Integration Tables:</strong> Succession integration uses additional tables 
            (<code>succession_development_plans</code>, <code>succession_gap_development_links</code>) 
            documented in the Succession Manual Chapter 8.
          </AlertDescription>
        </Alert>
      </section>

      {/* Section 1.5: Module Access Points */}
      <section id="sec-1-5" data-manual-anchor="sec-1-5" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-emerald-500 pl-4">
          <h3 className="text-xl font-semibold">1.5 Module Access Points</h3>
          <p className="text-muted-foreground">Admin, L&D, and ESS routes for Career Development features</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Access Routes by Persona</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Persona</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Feature</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium" rowSpan={3}>HR Admin</TableCell>
                  <TableCell><code className="text-xs">/succession/career-paths</code></TableCell>
                  <TableCell>Career path configuration</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs">/succession/mentorship</code></TableCell>
                  <TableCell>Mentorship program management</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs">/succession/career-development</code></TableCell>
                  <TableCell>IDP administration</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium" rowSpan={2}>L&D Admin</TableCell>
                  <TableCell><code className="text-xs">/training/career-paths</code></TableCell>
                  <TableCell>Career paths (read access)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs">/training/mentorship</code></TableCell>
                  <TableCell>Mentorship (read access)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium" rowSpan={3}>Employee (ESS)</TableCell>
                  <TableCell><code className="text-xs">/ess/career-paths</code></TableCell>
                  <TableCell>View assigned career paths</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs">/ess/career-plan</code></TableCell>
                  <TableCell>View/update IDP</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs">/ess/mentorship</code></TableCell>
                  <TableCell>Mentorship self-service</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
