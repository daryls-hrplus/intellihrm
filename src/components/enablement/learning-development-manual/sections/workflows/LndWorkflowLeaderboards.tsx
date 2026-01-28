import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Trophy, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  Users,
  Building2,
  Target,
  Eye,
  EyeOff
} from 'lucide-react';

export function LndWorkflowLeaderboards() {
  return (
    <section className="space-y-6" id="sec-4-37" data-manual-anchor="sec-4-37">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-600" />
          4.37 Leaderboards
        </h2>
        <p className="text-muted-foreground">
          Competitive ranking displays to drive engagement through social comparison 
          with configurable scope, privacy controls, and time periods.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure leaderboard types and scope</li>
            <li>Set time periods for ranking calculations</li>
            <li>Manage privacy and opt-out preferences</li>
            <li>Display leaderboards on dashboards and portals</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>lms_leaderboards</Badge>
            <span className="text-sm font-normal text-muted-foreground">Field Reference</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Field</TableHead>
                <TableHead className="w-1/6">Type</TableHead>
                <TableHead className="w-1/12">Req</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="secondary">PK</Badge></TableCell>
                <TableCell>Unique leaderboard identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">name</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Display name (e.g., "Weekly Champions")</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">leaderboard_type</TableCell>
                <TableCell>ENUM</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>points | courses | certifications | streak</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">scope</TableCell>
                <TableCell>ENUM</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>company | department | team | course</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">scope_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Department/team/course ID if scoped</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">time_period</TableCell>
                <TableCell>ENUM</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>weekly | monthly | quarterly | yearly | all_time</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">display_count</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>How many ranks to show (default: 10)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_active</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Display this leaderboard</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">reset_day</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Day to reset (1=Monday for weekly)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">company_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Multi-tenant isolation</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Leaderboard Types</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">Points Leaderboard</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Ranks learners by total points earned in the period.
              </p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Most common gamification metric</li>
                <li>• Includes all point-earning activities</li>
                <li>• Resets at period end</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Courses Leaderboard</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Ranks by number of courses completed.
              </p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Focuses on completion volume</li>
                <li>• Can weight by course difficulty</li>
                <li>• Good for training campaigns</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-purple-500" />
                <span className="font-semibold">Certifications Leaderboard</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Ranks by certificates earned.
              </p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Emphasizes credential achievement</li>
                <li>• Can weight by cert importance</li>
                <li>• Great for compliance drives</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Streak Leaderboard</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Ranks by consecutive learning days.
              </p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Rewards consistency over volume</li>
                <li>• Shows current streak only</li>
                <li>• Encourages daily habits</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Leaderboard Display Examples</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────────┐
│  🏆 Weekly Learning Champions                                        │
│  Engineering Department | Resets Monday                              │
│                                                                      │
│  Rank  │  Learner          │  Points  │  Trend  │  Courses          │
│  ──────┼───────────────────┼──────────┼─────────┼───────────────────│
│  🥇 1  │  Sarah Chen       │   485    │   ▲ +2  │  4 completed      │
│  🥈 2  │  Mike Johnson     │   420    │   ▼ -1  │  3 completed      │
│  🥉 3  │  Anna Park        │   380    │   ▲ +5  │  3 completed      │
│     4  │  John Doe         │   340    │   ─     │  2 completed      │
│     5  │  Lisa Wang        │   285    │   ▲ +3  │  2 completed      │
│     6  │  Tom Smith        │   260    │   ▼ -2  │  2 completed      │
│     7  │  Emma Davis       │   230    │   ▲ +1  │  1 completed      │
│     8  │  Chris Lee        │   195    │   ─     │  1 completed      │
│     9  │  Rachel Kim       │   180    │   ▲ +4  │  1 completed      │
│    10  │  David Brown      │   155    │   ▼ -3  │  1 completed      │
│                                                                      │
│  Your Position: 4th  |  340 points  |  42 points to next rank       │
│                                                                      │
│  [View All Rankings]  [My Stats]  [Opt Out]                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  🔥 Streak Champions - All Time                                      │
│  Company-Wide                                                        │
│                                                                      │
│  Rank  │  Learner          │  Current Streak  │  Best Streak        │
│  ──────┼───────────────────┼──────────────────┼─────────────────────│
│  🥇 1  │  Maria Santos     │   127 days 🔥    │  127 days           │
│  🥈 2  │  James Wilson     │    89 days       │   94 days           │
│  🥉 3  │  Priya Patel      │    73 days       │   73 days           │
│     4  │  Robert Chen      │    65 days       │   82 days           │
│     5  │  Kim Nguyen       │    58 days       │   61 days           │
└─────────────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeOff className="h-5 w-5" />
            Privacy Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-mono bg-muted px-3 py-2 rounded">
              <span>ESS</span>
              <ArrowRight className="h-4 w-4" />
              <span>My Training</span>
              <ArrowRight className="h-4 w-4" />
              <span>Privacy Settings</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Visible (Default)</span>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Name appears on leaderboards</li>
                  <li>• Position visible to colleagues</li>
                  <li>• Eligible for recognition</li>
                  <li>• Can see others' profiles</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <EyeOff className="h-5 w-5 text-gray-500" />
                  <span className="font-semibold">Opted Out</span>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Excluded from public leaderboards</li>
                  <li>• Can still view leaderboards</li>
                  <li>• Own progress tracked privately</li>
                  <li>• Managers can still see progress</li>
                </ul>
              </div>
            </div>

            <Alert variant="default">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Privacy settings affect leaderboard visibility only. Managers and 
                HR always have access to individual learning data for reporting purposes.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Business Rules</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Leaderboards update in real-time as activities complete</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Weekly leaderboards reset Monday 00:00 company timezone</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Minimum 5 participants required to display leaderboard</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Ties are broken by earliest achievement timestamp</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Historical leaderboard snapshots stored for reporting</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Gamification Best Practice</AlertTitle>
        <AlertDescription>
          Research shows leaderboards are most effective when combined with 
          achievable goals (not just top-10 displays). Consider showing "points 
          to next rank" and "personal best" comparisons to motivate mid-tier learners.
        </AlertDescription>
      </Alert>
    </section>
  );
}
