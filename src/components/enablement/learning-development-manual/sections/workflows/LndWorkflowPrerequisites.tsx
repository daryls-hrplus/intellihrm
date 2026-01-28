import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  GitBranch, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  Lock,
  Unlock
} from 'lucide-react';

export function LndWorkflowPrerequisites() {
  return (
    <section className="space-y-6" id="sec-4-4" data-manual-anchor="sec-4-4">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-purple-600" />
          4.4 Prerequisites & Learning Paths
        </h2>
        <p className="text-muted-foreground">
          Configure course prerequisites, learning path dependencies, and unlock rules 
          to ensure structured skill progression.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure course prerequisites for sequential skill building</li>
            <li>Design multi-course learning paths with dependencies</li>
            <li>Understand prerequisite validation during enrollment</li>
            <li>Manage prerequisite waivers for experienced learners</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>lms_course_prerequisites</Badge>
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
                <TableCell>Unique prerequisite rule identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">course_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Course that requires the prerequisite</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">prerequisite_course_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Course that must be completed first</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_mandatory</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>If true, prerequisite cannot be waived (default: true)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">minimum_score</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Required quiz score in prerequisite (e.g., 80%)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">company_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Multi-tenant isolation</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">created_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Rule creation timestamp</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Prerequisite Validation Flow</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       PREREQUISITE VALIDATION WORKFLOW                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Enrollment Request                                                             │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────┐                                                            │
│   │ Check course    │                                                            │
│   │ prerequisites   │                                                            │
│   └────────┬────────┘                                                            │
│            │                                                                     │
│    ┌───────┴───────┐                                                             │
│    ▼               ▼                                                             │
│ [Has Prereqs]  [No Prereqs]                                                      │
│    │               │                                                             │
│    ▼               └──────────────────────────────────────────┐                  │
│ ┌─────────────────┐                                           │                  │
│ │ For each prereq │                                           │                  │
│ │ Check completion│                                           │                  │
│ └────────┬────────┘                                           │                  │
│          │                                                    │                  │
│  ┌───────┴───────┐                                            │                  │
│  ▼               ▼                                            │                  │
│[All Met]     [Some Unmet]                                     │                  │
│  │               │                                            │                  │
│  │               ▼                                            │                  │
│  │        ┌─────────────────┐                                 │                  │
│  │        │ is_mandatory?   │                                 │                  │
│  │        └───────┬─────────┘                                 │                  │
│  │          ┌─────┴─────┐                                     │                  │
│  │          ▼           ▼                                     │                  │
│  │       [Yes]        [No]                                    │                  │
│  │          │           │                                     │                  │
│  │          ▼           ▼                                     │                  │
│  │       BLOCKED    ALLOW WAIVER                              │                  │
│  │          │           │                                     │                  │
│  │          │     Manager Approval                            │                  │
│  │          │           │                                     │                  │
│  └──────────┼───────────┼─────────────────────────────────────┘                  │
│             │           │                                                        │
│             ▼           ▼                                                        │
│       ┌─────────────────────┐                                                    │
│       │   ENROLLMENT        │                                                    │
│       │   PROCEEDS          │                                                    │
│       └─────────────────────┘                                                    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Learning Path Dependencies</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Learning paths define structured journeys through multiple courses. Prerequisites 
              within a path are automatically enforced based on course sequence.
            </p>

            <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Learning Path: "Leadership Development Program"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Foundations │───▶│ Team Lead   │───▶│ Manager     │───▶│ Executive   │
│ of Leading  │    │ Essentials  │    │ Excellence  │    │ Leadership  │
│ (Tier 1)    │    │ (Tier 2)    │    │ (Tier 3)    │    │ (Tier 4)    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │
      ▼                  ▼                  ▼                  ▼
   Required:          Required:          Required:          Required:
   None               Tier 1 +           Tier 2 +           Tier 3 +
                      80% quiz           Manager role       Director role

Path Enrollment Rules:
├── sequence_enforced: true (must complete in order)
├── allow_skip: false (no course skipping)
├── certification_on_complete: Leadership Certificate
└── validity_months: 24 (recertification required)
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Unlock className="h-5 w-5" />
            Prerequisite Waiver Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-mono bg-muted px-3 py-2 rounded">
              <span>LMS Admin</span>
              <ArrowRight className="h-4 w-4" />
              <span>Course Prerequisites</span>
              <ArrowRight className="h-4 w-4" />
              <span>Grant Waiver</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-5 w-5 text-red-500" />
                  <span className="font-semibold">Mandatory Prerequisites</span>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Cannot be waived by managers</li>
                  <li>• Require LMS Admin override</li>
                  <li>• Used for compliance-critical paths</li>
                  <li>• Audit logged when overridden</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Unlock className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Optional Prerequisites</span>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Manager can grant waiver</li>
                  <li>• For experienced hires</li>
                  <li>• Waiver reason documented</li>
                  <li>• Learner still recommended to complete</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Business Rules</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Prerequisites are checked at enrollment time and before course access</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Circular dependencies are prevented at configuration time</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>minimum_score requires the prerequisite course to have a quiz</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Waivers are stored in lms_prerequisite_waivers for audit purposes</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Learning path enrollment auto-enrolls in all path courses sequentially</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Industry Benchmark</AlertTitle>
        <AlertDescription>
          Organizations using structured prerequisite chains report 32% higher knowledge retention 
          compared to unstructured course access (Training Industry, 2024). Prerequisites ensure 
          foundational concepts are mastered before advanced topics.
        </AlertDescription>
      </Alert>
    </section>
  );
}
