import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Award, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  Medal,
  Star,
  Shield
} from 'lucide-react';

export function LndWorkflowBadges() {
  return (
    <section className="space-y-6" id="sec-4-36" data-manual-anchor="sec-4-36">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Award className="h-6 w-6 text-purple-600" />
          4.36 Badges & Achievements
        </h2>
        <p className="text-muted-foreground">
          Visual recognition system for learning milestones through digital badges 
          with configurable criteria and display options.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure badge definitions and earning criteria</li>
            <li>Award badges automatically or manually</li>
            <li>Display badges on employee profiles</li>
            <li>Track badge distribution and engagement</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>lms_badges</Badge>
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
                <TableCell>Unique badge identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">badge_code</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Unique system identifier (e.g., FIRST_COURSE)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">name</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Display name (e.g., "First Steps")</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">description</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>How to earn this badge</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">image_url</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Badge icon/image URL</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">category</TableCell>
                <TableCell>ENUM</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>achievement | skill | milestone | special</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">rarity</TableCell>
                <TableCell>ENUM</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>common | uncommon | rare | epic | legendary</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">criteria</TableCell>
                <TableCell>JSONB</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Auto-award rules (see below)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">points_awarded</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Bonus points when earned</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_active</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Available for earning</TableCell>
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
            <Badge>lms_user_badges</Badge>
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
                <TableCell>Unique award record</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">employee_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Badge recipient</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">badge_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Badge definition reference</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">earned_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>When badge was earned</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">awarded_by</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Who awarded (if manual)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">source_type</TableCell>
                <TableCell>ENUM</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>automatic | manual | imported</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">source_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>What triggered the badge (course, quiz, etc.)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_featured</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Show prominently on profile</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Badge Criteria Configuration</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Badge Criteria JSON Structure:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Example 1: Complete first course
{
  "badge_code": "FIRST_COURSE",
  "name": "First Steps",
  "rarity": "common",
  "points_awarded": 50,
  "criteria": {
    "type": "course_completion",
    "count": 1,
    "any_course": true
  }
}

// Example 2: Complete 10 courses
{
  "badge_code": "DEDICATED_LEARNER",
  "name": "Dedicated Learner",
  "rarity": "uncommon",
  "points_awarded": 200,
  "criteria": {
    "type": "course_completion",
    "count": 10,
    "any_course": true
  }
}

// Example 3: Perfect quiz score
{
  "badge_code": "PERFECTIONIST",
  "name": "Perfectionist",
  "rarity": "rare",
  "points_awarded": 100,
  "criteria": {
    "type": "quiz_score",
    "score": 100,
    "count": 1
  }
}

// Example 4: 30-day learning streak
{
  "badge_code": "STREAK_MASTER",
  "name": "Streak Master",
  "rarity": "epic",
  "points_awarded": 500,
  "criteria": {
    "type": "streak",
    "days": 30
  }
}

// Example 5: Complete specific path
{
  "badge_code": "LEADERSHIP_GRADUATE",
  "name": "Leadership Graduate",
  "rarity": "legendary",
  "points_awarded": 1000,
  "criteria": {
    "type": "learning_path_completion",
    "learning_path_id": "uuid-of-leadership-path"
  }
}

// Example 6: Category completion
{
  "badge_code": "COMPLIANCE_CHAMPION",
  "name": "Compliance Champion",
  "rarity": "rare",
  "points_awarded": 300,
  "criteria": {
    "type": "category_completion",
    "category_id": "uuid-of-compliance-category",
    "count": 5
  }
}
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="h-5 w-5" />
            Badge Categories & Display
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Achievement Badges</span>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>🎯 First Course, 10 Courses, 50 Courses</li>
                <li>🔥 7-Day Streak, 30-Day Streak, 100-Day Streak</li>
                <li>⭐ Perfect Score, Quiz Master</li>
                <li>💬 First Review, Helpful Contributor</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <span className="font-semibold">Skill Badges</span>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>📊 Data Analytics Certified</li>
                <li>🔒 Security Awareness Certified</li>
                <li>👥 Leadership Program Graduate</li>
                <li>🛠️ Technical Expert (by domain)</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-amber-500" />
                <span className="font-semibold">Milestone Badges</span>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>🏆 Level 5 Achiever, Level 10 Legend</li>
                <li>📅 1-Year Learning Anniversary</li>
                <li>🎓 100th Hour of Learning</li>
                <li>🌟 Top 10% Learner (quarterly)</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-red-500" />
                <span className="font-semibold">Special Badges</span>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>🚀 Early Adopter (beta program)</li>
                <li>🏅 Annual Learning Champion</li>
                <li>🎖️ Mentor of the Quarter</li>
                <li>✨ CEO Recognition Award</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Profile Badge Display</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Employee Profile - Learning Badges:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────────┐
│  John Doe - Learning Profile                                         │
│  Level 4: Achiever  |  3,750 Points  |  12 Badges Earned            │
│                                                                      │
│  Featured Badges:                                                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                              │
│  │   🏆    │  │   🔒    │  │   🔥    │                              │
│  │ Leader  │  │Security │  │ 30-Day │                              │
│  │Graduate │  │Certified│  │ Streak │                              │
│  │ (Epic)  │  │ (Rare)  │  │ (Epic) │                              │
│  └─────────┘  └─────────┘  └─────────┘                              │
│                                                                      │
│  All Badges:                                                         │
│  ├── 🎯 First Steps (Common)         - Apr 2024                      │
│  ├── ⭐ Perfect Score (Rare)         - May 2024                      │
│  ├── 🔥 Week Warrior (Uncommon)      - May 2024                      │
│  ├── 📚 10 Courses (Uncommon)        - Jun 2024                      │
│  ├── 🔒 Security Certified (Rare)    - Jul 2024                      │
│  ├── 🔥 30-Day Streak (Epic)         - Aug 2024                      │
│  └── ... +6 more                                                     │
│                                                                      │
│  [Manage Featured]  [Share on LinkedIn]                              │
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
              <span>Each badge can only be earned once per user (unique constraint)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Badges are checked for award after each qualifying activity</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Manual badges require LMS Admin or HR role to award</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Users can feature up to 3 badges on their profile</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Badge notifications sent via LMS_BADGE_EARNED event type</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Open Badges Standard</AlertTitle>
        <AlertDescription>
          Badges can be exported in Open Badges 2.0 format for sharing on LinkedIn 
          and other platforms. This requires configuring the badge issuer URL and 
          verification endpoint in company settings.
        </AlertDescription>
      </Alert>
    </section>
  );
}
