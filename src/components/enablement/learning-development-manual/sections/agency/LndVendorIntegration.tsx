import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Zap, Target, Brain, Database, GitBranch } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndVendorIntegration() {
  return (
    <section className="space-y-6" id="sec-3-12" data-manual-anchor="sec-3-12">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Zap className="h-6 w-6 text-emerald-600" />
          3.12 Integration with Training Needs
        </h2>
        <p className="text-muted-foreground">
          Connect vendor courses to competency gaps for AI-powered recommendations.
          Automates gap-based training request generation with intelligent course matching.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Map vendor courses to competency framework</li>
            <li>Enable AI-driven course recommendations</li>
            <li>Automate gap-based training requests</li>
            <li>Track competency development through external training</li>
            <li>Configure recommendation algorithm weights</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Field Reference: training_needs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>Primary key</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">employee_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>Employee with training need</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">competency_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>FK to competencies table</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">current_level</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell>Employee's current competency level (1-5)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">required_level</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell>Required level for role (1-5)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">gap_score</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell>Gap magnitude (required - current)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">priority</TableCell>
                <TableCell>Text</TableCell>
                <TableCell>critical | high | medium | low</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">source_type</TableCell>
                <TableCell>Text</TableCell>
                <TableCell>gap_analysis | appraisal | self_assessment | manager</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">source_reference_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>Link to source record</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">recommended_course_ids</TableCell>
                <TableCell>UUID[]</TableCell>
                <TableCell>AI-recommended courses (internal + vendor)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">status</TableCell>
                <TableCell>Text</TableCell>
                <TableCell>identified | in_progress | completed | cancelled</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">target_date</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Target date for gap closure</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">created_at</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>When need was identified</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Field Reference: competency_course_mappings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>Primary key</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">competency_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>FK to competencies</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">course_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>FK to lms_courses (internal)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">vendor_course_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>FK to training_vendor_courses (external)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">level_increase</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell>Expected competency level increase (1-3)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">min_starting_level</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell>Minimum level to take this course</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">max_starting_level</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell>Maximum level for this course to be beneficial</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_primary</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell>Primary course for this competency</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">effectiveness_score</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell>Historical effectiveness rating (0-100)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Gap-to-Course Mapping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
COMPETENCY GAP → VENDOR COURSE RECOMMENDATION
═════════════════════════════════════════════

Employee: John Smith
Role: Senior Developer → Target: Technical Lead

Gap Detected:
├── Project Management: Current 2, Required 4 (Gap: 2)
└── Risk Assessment: Current 1, Required 3 (Gap: 2)

AI Recommendation:
┌─────────────────────────────────────────────────────┐
│ Recommended Vendor Course: PMP Certification        │
│ Provider: PMI Authorized Training Partner           │
│ Duration: 5 days | Cost: $2,955                     │
│ Competency Coverage:                                │
│   ✓ Project Management: +2 levels                   │
│   ✓ Risk Assessment: +2 levels                      │
│ Gap Closure: 100%                                   │
│ Effectiveness Score: 92                             │
│ Historical Success Rate: 87%                        │
└─────────────────────────────────────────────────────┘

Alternative Options:
1. Agile PM Certification (Scrum Alliance) - 70% gap closure
2. Internal PM Workshop + Risk Training - 60% gap closure
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Recommendation Algorithm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
AI RECOMMENDATION ALGORITHM
═══════════════════════════

INPUT:
├── Employee training_needs (competency gaps)
├── competency_course_mappings (course → competency links)
├── Employee preferences (location, format, schedule)
└── Budget constraints

SCORING FACTORS:
┌────────────────────────┬────────┬──────────────────────────┐
│ Factor                 │ Weight │ Description              │
├────────────────────────┼────────┼──────────────────────────┤
│ Gap Coverage           │ 35%    │ % of gaps addressed      │
│ Cost Efficiency        │ 20%    │ Cost per competency gain │
│ Historical Success     │ 20%    │ Past learner outcomes    │
│ Time to Complete       │ 15%    │ Duration efficiency      │
│ Preference Match       │ 10%    │ Location, format match   │
└────────────────────────┴────────┴──────────────────────────┘

OUTPUT:
├── Ranked course recommendations
├── Gap closure percentage per option
├── Cost vs. benefit analysis
└── Alternative course bundles
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automated Request Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
GAP-BASED TRAINING REQUEST WORKFLOW
═══════════════════════════════════

Gap Analysis Complete
       │
       ▼
┌─────────────────────────┐
│ AI Recommendations      │
│ Generated               │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Employee Reviews        │
│ Recommendations         │
│ (ESS Portal)            │
└───────────┬─────────────┘
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
┌─────────┐  ┌──────────────┐
│ Accept  │  │ Request      │
│ Default │  │ Alternative  │
└────┬────┘  └──────┬───────┘
     │              │
     └──────┬───────┘
            ▼
┌─────────────────────────┐
│ Create Training Request │
│ source_type: gap_analysis
│ source_reference_id:    │
│   → training_need.id    │
└───────────┬─────────────┘
            │
            ▼
    Standard Approval Flow
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Competency Development Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Competency Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Gap Identified</TableCell>
                <TableCell><Badge variant="outline">identified</Badge></TableCell>
                <TableCell>No change</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Training Enrolled</TableCell>
                <TableCell><Badge className="bg-blue-100 text-blue-800">in_progress</Badge></TableCell>
                <TableCell>No change</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Training Completed</TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">completed</Badge></TableCell>
                <TableCell>Competency level updated based on level_increase</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Gap Re-assessed</TableCell>
                <TableCell>—</TableCell>
                <TableCell>New gap calculated, new recommendations if needed</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Alert>
        <Brain className="h-4 w-4" />
        <AlertTitle>AI-Powered Recommendations</AlertTitle>
        <AlertDescription>
          The system uses competency_course_mappings to match employee skill gaps with 
          appropriate vendor courses. AI considers cost, duration, location preferences, 
          and past learner success rates to optimize recommendations. The algorithm
          continuously learns from completion data and post-training assessments.
        </AlertDescription>
      </Alert>

      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
        <Database className="h-4 w-4" />
        <AlertTitle>Schema Note: training_needs vs Database</AlertTitle>
        <AlertDescription>
          The <code className="text-xs bg-muted px-1 rounded">training_needs</code> table 
          documented above represents the canonical design. Some implementations may use 
          simpler structures initially. The <code className="text-xs bg-muted px-1 rounded">competency_course_mappings</code> table 
          supports both internal (<code>course_id</code>) and external (<code>vendor_course_id</code>) 
          course references for comprehensive gap-to-course matching.
        </AlertDescription>
      </Alert>
    </section>
  );
}
