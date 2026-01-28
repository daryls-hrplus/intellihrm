import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Zap, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  Star,
  Trophy,
  TrendingUp
} from 'lucide-react';

export function LndWorkflowGamificationPoints() {
  return (
    <section className="space-y-6" id="sec-4-35" data-manual-anchor="sec-4-35">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-600" />
          4.35 Points & Rewards System
        </h2>
        <p className="text-muted-foreground">
          Gamification system to incentivize learning through points accumulation, 
          with configurable earning rules and optional rewards redemption.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure point earning rules for learning activities</li>
            <li>Track point balances and transaction history</li>
            <li>Enable bonus points for streaks and achievements</li>
            <li>Set up point tiers and level progression</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>lms_user_points</Badge>
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
                <TableCell>Unique record identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">employee_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Learner profile reference</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">total_points</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Cumulative points earned (all-time)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">available_points</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Current redeemable balance</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">current_level</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Current learner level (1-10)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">current_streak_days</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Consecutive days with learning activity</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">longest_streak_days</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Personal best streak record</TableCell>
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>lms_point_transactions</Badge>
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
                <TableCell>Unique transaction identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">user_points_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Link to user's point record</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">transaction_type</TableCell>
                <TableCell>ENUM</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>earn | spend | expire | adjustment</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">points</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Points added (+) or removed (-)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">source_type</TableCell>
                <TableCell>ENUM</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>course_completion | quiz_pass | badge_earned | streak_bonus | referral</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">source_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Reference to source record (course, quiz, etc.)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">description</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Human-readable transaction description</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">created_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Transaction timestamp</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Point Earning Rules</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          POINT EARNING CONFIGURATION                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Activity-Based Points:                                                         │
│   ━━━━━━━━━━━━━━━━━━━━━━                                                         │
│   │ Activity                    │ Base Points │ Bonus Multiplier               │
│   ├─────────────────────────────┼─────────────┼────────────────────────────────┤
│   │ Complete lesson             │     10      │ +5 if first time               │
│   │ Complete course             │    100      │ +25 if under expected time     │
│   │ Pass quiz (80%+)            │     50      │ +25 if 100% score              │
│   │ Pass quiz (first attempt)   │     75      │ +50 bonus                      │
│   │ Earn certificate            │    200      │ +100 if compliance cert        │
│   │ Submit course review        │     25      │ +10 if detailed (100+ chars)   │
│   │ Helpful forum answer        │     15      │ +25 if marked "Best Answer"    │
│   │ Refer colleague to course   │     50      │ Upon referral's completion     │
│   └─────────────────────────────┴─────────────┴────────────────────────────────┘
│                                                                                  │
│   Streak Bonuses:                                                                │
│   ━━━━━━━━━━━━━━━                                                                │
│   │ Streak Days │ Daily Bonus │ Milestone Bonus                                 │
│   ├─────────────┼─────────────┼─────────────────────────────────────────────────┤
│   │ 1-6 days    │     +5      │ -                                               │
│   │ 7 days      │    +10      │ +50 (Week streak)                               │
│   │ 8-29 days   │    +10      │ -                                               │
│   │ 30 days     │    +15      │ +200 (Month streak)                             │
│   │ 31-89 days  │    +15      │ -                                               │
│   │ 90 days     │    +20      │ +500 (Quarter streak)                           │
│   │ 365 days    │    +25      │ +2000 (Year streak) + Badge                     │
│   └─────────────┴─────────────┴─────────────────────────────────────────────────┘
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Learner Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Points Required</TableHead>
                <TableHead>Perks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge className="bg-gray-100 text-gray-800">1</Badge></TableCell>
                <TableCell>Newcomer</TableCell>
                <TableCell>0</TableCell>
                <TableCell>Access to basic courses</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-green-100 text-green-800">2</Badge></TableCell>
                <TableCell>Explorer</TableCell>
                <TableCell>500</TableCell>
                <TableCell>Profile badge unlocked</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-blue-100 text-blue-800">3</Badge></TableCell>
                <TableCell>Learner</TableCell>
                <TableCell>1,500</TableCell>
                <TableCell>Early access to new courses</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-purple-100 text-purple-800">4</Badge></TableCell>
                <TableCell>Achiever</TableCell>
                <TableCell>3,500</TableCell>
                <TableCell>Priority session registration</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-100 text-amber-800">5</Badge></TableCell>
                <TableCell>Expert</TableCell>
                <TableCell>7,500</TableCell>
                <TableCell>Mentor nomination eligible</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-red-100 text-red-800">6-10</Badge></TableCell>
                <TableCell>Master → Legend</TableCell>
                <TableCell>15K → 100K</TableCell>
                <TableCell>Recognition, special events</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Learner Dashboard View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────────┐
│  My Learning Points                                                  │
│  ═══════════════════════════════════════════════════════════════════│
│                                                                      │
│  ⚡ 3,750 Total Points           🎯 Level 4: Achiever                │
│                                                                      │
│  Progress to Level 5:                                                │
│  ████████████████████░░░░░░░░░░  3,750 / 7,500 points               │
│                                  50% to Expert                       │
│                                                                      │
│  🔥 Current Streak: 12 days     📅 Best Streak: 28 days             │
│     +10 bonus per activity!        Set on: Oct 2024                 │
│                                                                      │
│  Recent Activity:                                                    │
│  ├── +100  Completed "Project Management 101"         Today         │
│  ├──  +50  Passed Quiz (92%)                          Today         │
│  ├──  +10  Streak bonus (Day 12)                      Today         │
│  ├── +200  Earned Safety Certification                Yesterday     │
│  └──  +25  Course review submitted                    2 days ago    │
│                                                                      │
│  [View Full History]  [Leaderboard]  [Badges]                        │
└─────────────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Business Rules</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Points are awarded immediately upon qualifying action completion</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Streak resets if no learning activity within 24 hours (configurable)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Duplicate course completions award reduced points (25% after first)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Points can expire after 24 months if configured (available_points only)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Level downgrades are not applied (once achieved, level is permanent)</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Gamification Effectiveness</AlertTitle>
        <AlertDescription>
          Organizations with gamified learning report 60% higher engagement and 
          43% higher completion rates (TalentLMS, 2024). Points and levels provide 
          intrinsic motivation alongside extrinsic rewards.
        </AlertDescription>
      </Alert>
    </section>
  );
}
