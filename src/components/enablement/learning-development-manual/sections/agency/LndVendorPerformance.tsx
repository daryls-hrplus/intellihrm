import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Star, TrendingUp, Database, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndVendorPerformance() {
  return (
    <section className="space-y-6" id="sec-3-9" data-manual-anchor="sec-3-9">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-emerald-600" />
          3.9 Vendor Performance Management
        </h2>
        <p className="text-muted-foreground">
          Track and evaluate vendor performance through structured reviews, scorecards, and KPIs.
          Integrates learner feedback with vendor assessments for comprehensive performance visibility.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure vendor review schedules by tier</li>
            <li>Apply multi-dimension scoring methodology</li>
            <li>Track action items and improvement plans</li>
            <li>Generate vendor performance reports</li>
            <li>Link learner evaluations to vendor scores</li>
            <li>Manage review workflow and approvals</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Field Reference: training_vendor_reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Auto</Badge></TableCell>
                <TableCell>Primary key</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">vendor_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>FK to training_vendors</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">review_type</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>quarterly | annual | incident | renewal</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">review_period_start</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Review period start date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">review_period_end</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Review period end date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">quality_score</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Content quality rating (0-100)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">delivery_score</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Delivery reliability rating (0-100)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">value_score</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Value for money rating (0-100)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">responsiveness_score</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Communication/support rating (0-100)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">overall_score</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Weighted composite score (0-100)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">reviewer_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>User who conducted review</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">review_date</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Date review was completed</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">status</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>draft | submitted | approved</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">strengths</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Vendor strengths narrative</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">improvement_areas</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Areas needing improvement</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">action_items</TableCell>
                <TableCell>JSONB</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Structured improvement actions</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">recommendation</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>continue | probation | terminate</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Field Reference: training_evaluations (Learner Feedback)
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
                <TableCell className="font-mono text-sm">training_record_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>Link to external_training_records</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">evaluation_type</TableCell>
                <TableCell>Text</TableCell>
                <TableCell>level_1 | level_2 | level_3 | level_4 (Kirkpatrick)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">overall_rating</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell>1-5 star rating</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">content_rating</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell>Content quality (1-5)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">instructor_rating</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell>Instructor effectiveness (1-5)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">materials_rating</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell>Materials quality (1-5)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">would_recommend</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell>Would recommend to colleagues</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">comments</TableCell>
                <TableCell>Text</TableCell>
                <TableCell>Open-ended feedback</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Review Types & Frequency</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Review Type</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Vendor Tier</TableHead>
                <TableHead>Trigger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge className="bg-purple-100 text-purple-800">quarterly</Badge></TableCell>
                <TableCell>Every 3 months</TableCell>
                <TableCell>Strategic vendors</TableCell>
                <TableCell>Scheduled (calendar)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-blue-100 text-blue-800">annual</Badge></TableCell>
                <TableCell>Yearly</TableCell>
                <TableCell>Operational & Transactional</TableCell>
                <TableCell>Contract anniversary</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-orange-100 text-orange-800">incident</Badge></TableCell>
                <TableCell>As needed</TableCell>
                <TableCell>Any (triggered by issue)</TableCell>
                <TableCell>Service failure or complaint</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-green-100 text-green-800">renewal</Badge></TableCell>
                <TableCell>Contract renewal</TableCell>
                <TableCell>Any with contracts</TableCell>
                <TableCell>30 days before contract end</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5" />Scoring Dimensions & Weights</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dimension</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Metrics</TableHead>
                <TableHead>Data Sources</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Quality Score</TableCell>
                <TableCell>30%</TableCell>
                <TableCell>Content relevance, instructor expertise, materials quality</TableCell>
                <TableCell>Learner evaluations, L&D assessment</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Delivery Score</TableCell>
                <TableCell>25%</TableCell>
                <TableCell>On-time delivery, completion rates, session execution</TableCell>
                <TableCell>Session data, attendance records</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Value Score</TableCell>
                <TableCell>25%</TableCell>
                <TableCell>Cost effectiveness, ROI, learner outcomes</TableCell>
                <TableCell>Cost data, skill assessments</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Responsiveness Score</TableCell>
                <TableCell>20%</TableCell>
                <TableCell>Communication, issue resolution, flexibility</TableCell>
                <TableCell>L&D assessment, incident logs</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono mt-4">{`
OVERALL SCORE CALCULATION
═════════════════════════
overall_score = (quality_score × 0.30) +
                (delivery_score × 0.25) +
                (value_score × 0.25) +
                (responsiveness_score × 0.20)

EXAMPLE:
Quality: 85 × 0.30 = 25.5
Delivery: 90 × 0.25 = 22.5
Value: 80 × 0.25 = 20.0
Responsiveness: 88 × 0.20 = 17.6
─────────────────────────
OVERALL: 85.6
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Review Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
VENDOR PERFORMANCE REVIEW WORKFLOW
══════════════════════════════════

Scheduled Review Due
       │
       ▼
┌─────────────────────┐
│ Gather Data         │
│ • Learner evals     │
│ • Session metrics   │
│ • Cost analysis     │
│ • Incident history  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Status: DRAFT       │
│ L&D Admin completes │
│ dimension scoring   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Add Action Items    │
│ • Improvement areas │
│ • Deadlines         │
│ • Owner assigned    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Status: SUBMITTED   │
│ Awaiting approval   │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐  ┌──────────┐
│ APPROVE │  │ REVISE   │
└────┬────┘  └────┬─────┘
     │            │
     ▼            │
┌─────────┐       │
│ APPROVED│◄──────┘
│ Vendor  │
│ Notified│
└─────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Action Item Tracking</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
ACTION ITEMS JSONB STRUCTURE
════════════════════════════

action_items: [
  {
    "id": "action-001",
    "title": "Improve instructor availability",
    "description": "Provide backup instructors for schedule conflicts",
    "priority": "high",
    "due_date": "2026-03-31",
    "owner": "Vendor Account Manager",
    "status": "open",
    "created_at": "2026-01-15",
    "completed_at": null,
    "notes": []
  },
  {
    "id": "action-002",
    "title": "Update course materials",
    "description": "Refresh 2025 content to reflect new regulations",
    "priority": "medium",
    "due_date": "2026-02-28",
    "owner": "Content Team",
    "status": "in_progress",
    "created_at": "2026-01-15",
    "completed_at": null,
    "notes": ["Draft received 2026-01-20"]
  }
]
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Performance Dashboard Metrics</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">87</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">92%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">4.5</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-orange-600">$42</div>
              <div className="text-sm text-muted-foreground">Cost/Hour</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Dashboard aggregates data from vendor reviews, learner evaluations, session
            attendance, and cost tracking tables for real-time performance visibility.
          </p>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Performance Thresholds</AlertTitle>
        <AlertDescription>
          Vendors scoring below 70 for two consecutive review periods are automatically
          flagged for probation review. Scores below 50 trigger immediate escalation to
          HR leadership with contract termination consideration.
        </AlertDescription>
      </Alert>
    </section>
  );
}
