import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  Upload,
  Play,
  Database
} from 'lucide-react';

export function LndWorkflowSCORMxAPI() {
  return (
    <section className="space-y-6" id="sec-4-8" data-manual-anchor="sec-4-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Package className="h-6 w-6 text-indigo-600" />
          4.8 SCORM/xAPI Content Delivery
        </h2>
        <p className="text-muted-foreground">
          Import and deliver standardized e-learning content using SCORM 1.2, SCORM 2004, 
          and xAPI (Tin Can) protocols with full progress tracking.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Upload and configure SCORM packages</li>
            <li>Understand SCORM 1.2 vs SCORM 2004 differences</li>
            <li>Track learner progress through SCORM/xAPI APIs</li>
            <li>Troubleshoot common SCORM delivery issues</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>lms_scorm_packages</Badge>
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
                <TableCell>Unique package identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">course_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Course containing this package</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">package_type</TableCell>
                <TableCell>ENUM</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>scorm_12 | scorm_2004 | xapi</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">storage_path</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Path to extracted package files</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">manifest_data</TableCell>
                <TableCell>JSONB</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Parsed imsmanifest.xml data</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">launch_url</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Entry point URL from manifest</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">version</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Package version string</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">file_size_bytes</TableCell>
                <TableCell>BIGINT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Original ZIP file size</TableCell>
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
            <Badge>lms_scorm_tracking</Badge>
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
                <TableCell>Unique tracking record</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">enrollment_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Learner's enrollment record</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">package_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>SCORM package reference</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">sco_id</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Shareable Content Object identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">cmi_core_lesson_status</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>not attempted | incomplete | completed | passed | failed</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">cmi_core_score_raw</TableCell>
                <TableCell>DECIMAL</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Learner's score (0-100)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">cmi_core_session_time</TableCell>
                <TableCell>INTERVAL</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Time spent in current session</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">cmi_core_total_time</TableCell>
                <TableCell>INTERVAL</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Cumulative time across sessions</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">cmi_suspend_data</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Content's bookmark/state data (max 4096 chars)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">cmi_location</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Content's bookmark position</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">updated_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Last tracking update</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>SCORM Upload & Launch Workflow</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SCORM PACKAGE WORKFLOW                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Content Author                                                                 │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────┐                                                            │
│   │ Upload ZIP      │  .zip file containing imsmanifest.xml                      │
│   │ Package         │  and content files                                         │
│   └────────┬────────┘                                                            │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ Parse Manifest  │  Extract: title, launch URL, SCO list                      │
│   │                 │  Detect: SCORM 1.2 vs 2004                                 │
│   └────────┬────────┘                                                            │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ Extract Files   │  Unzip to storage                                          │
│   │ to Storage      │  Set correct permissions                                   │
│   └────────┬────────┘                                                            │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ Create Package  │  lms_scorm_packages record                                 │
│   │ Record          │  Link to course/lesson                                     │
│   └────────┬────────┘                                                            │
│            │                                                                     │
│            ▼                                                                     │
│   LEARNER LAUNCH FLOW:                                                           │
│   ┌─────────────────┐                                                            │
│   │ Open SCORM      │  Launch in iframe/popup                                    │
│   │ Content         │  Initialize SCORM API                                      │
│   └────────┬────────┘                                                            │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────────────────────────────────────────────────────┐            │
│   │ SCORM Runtime API Communication                                  │            │
│   │ ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐   │            │
│   │ │Initialize│───▶│ GetValue │───▶│ SetValue │───▶│ Commit   │   │            │
│   │ │          │    │LMSGetValue│   │LMSSetValue│   │LMSCommit │   │            │
│   │ └──────────┘    └──────────┘    └──────────┘    └──────────┘   │            │
│   │                                                                 │            │
│   │ Common CMI Elements:                                            │            │
│   │ ├── cmi.core.lesson_status    (progress state)                  │            │
│   │ ├── cmi.core.score.raw        (quiz score)                      │            │
│   │ ├── cmi.core.session_time     (time this session)               │            │
│   │ └── cmi.suspend_data          (bookmark/state)                  │            │
│   └─────────────────────────────────────────────────────────────────┘            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            xAPI (Tin Can) Statements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              xAPI provides richer tracking than SCORM with a flexible statement structure:
            </p>

            <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
xAPI Statement Structure (lms_xapi_statements):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "actor": {
    "mbox": "mailto:john.doe@company.com",
    "name": "John Doe"
  },
  "verb": {
    "id": "http://adlnet.gov/expapi/verbs/completed",
    "display": { "en-US": "completed" }
  },
  "object": {
    "id": "https://lms.company.com/courses/pm-101/lesson-3",
    "definition": {
      "name": { "en-US": "Risk Assessment Basics" },
      "type": "http://adlnet.gov/expapi/activities/lesson"
    }
  },
  "result": {
    "score": { "scaled": 0.85, "raw": 85, "max": 100 },
    "success": true,
    "completion": true,
    "duration": "PT1H23M"
  },
  "timestamp": "2024-01-15T14:32:00Z"
}

Common xAPI Verbs:
├── launched     - Content started
├── progressed   - Progress update
├── completed    - Finished content
├── passed       - Assessment passed
├── failed       - Assessment failed
└── answered     - Question response
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>SCORM Version Comparison</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>SCORM 1.2</TableHead>
                <TableHead>SCORM 2004</TableHead>
                <TableHead>xAPI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Tracking Data Size</TableCell>
                <TableCell>4KB suspend_data</TableCell>
                <TableCell>64KB suspend_data</TableCell>
                <TableCell>Unlimited</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sequencing</TableCell>
                <TableCell>Basic</TableCell>
                <TableCell>Advanced (rollup, prerequisites)</TableCell>
                <TableCell>N/A (content controls)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Offline Support</TableCell>
                <TableCell>No</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Yes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Cross-Domain</TableCell>
                <TableCell>Same origin only</TableCell>
                <TableCell>Same origin only</TableCell>
                <TableCell>Any origin</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Business Rules</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>SCORM packages are validated on upload (manifest must exist)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Maximum package size: 500MB (configurable per company)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>SCORM completion status syncs to lms_enrollments.progress</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>xAPI statements are stored indefinitely for compliance</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>SCORM content launches in sandboxed iframe for security</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Content Compatibility</AlertTitle>
        <AlertDescription>
          When purchasing third-party content, request SCORM 2004 3rd Edition or xAPI 
          for maximum tracking capability. SCORM 1.2 remains widely used but has 
          significant limitations for complex learning paths.
        </AlertDescription>
      </Alert>
    </section>
  );
}
