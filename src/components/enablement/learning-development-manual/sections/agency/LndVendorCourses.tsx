import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Database, Settings, Award } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndVendorCourses() {
  return (
    <section className="space-y-6" id="sec-3-4" data-manual-anchor="sec-3-4">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-emerald-600" />
          3.4 Vendor Course Catalog
        </h2>
        <p className="text-muted-foreground">
          Configure and manage the catalog of courses offered by external training vendors.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Add vendor courses with complete metadata</li>
            <li>Configure delivery methods and duration estimates</li>
            <li>Link certifications and validity periods</li>
            <li>Set prerequisites and target audience</li>
            <li>Manage course activation status</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Field Reference: training_vendor_courses
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
                <TableCell>Primary key, auto-generated</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">vendor_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Reference to training_vendors</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">course_code</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Vendor's course code (e.g., "PMP-PREP")</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">course_name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Display name of the course</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">description</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Detailed course description</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">delivery_method</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>in_person | virtual | hybrid | self_paced</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">duration_hours</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Total course hours</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">duration_days</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Total course days (for ILT)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">certification_name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Certification earned upon completion</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">certification_validity_months</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Months before certification expires</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">target_audience</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Intended audience description</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">prerequisites</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Required prior knowledge/courses</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_active</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Course available for booking (default: true)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">created_at</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell><Badge variant="destructive">Auto</Badge></TableCell>
                <TableCell>Record creation timestamp</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">updated_at</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell><Badge variant="destructive">Auto</Badge></TableCell>
                <TableCell>Last update timestamp</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Step-by-Step: Adding Vendor Courses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Badge className="shrink-0">1</Badge>
              <div>
                <p className="font-medium">Navigate to Vendor Detail</p>
                <p className="text-sm text-muted-foreground">Training → Vendors → Select vendor → Courses tab</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">2</Badge>
              <div>
                <p className="font-medium">Click "Add Course" button</p>
                <p className="text-sm text-muted-foreground">Opens the course creation form</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">3</Badge>
              <div>
                <p className="font-medium">Enter Course Identification</p>
                <ul className="text-sm text-muted-foreground list-disc pl-4">
                  <li>Course Code: Vendor's catalog code</li>
                  <li>Course Name: Full display name</li>
                  <li>Description: Learning objectives, topics covered</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">4</Badge>
              <div>
                <p className="font-medium">Select Delivery Method</p>
                <ul className="text-sm text-muted-foreground list-disc pl-4">
                  <li><strong>In-Person</strong>: Physical classroom training</li>
                  <li><strong>Virtual</strong>: Live online (VILT)</li>
                  <li><strong>Hybrid</strong>: Combination of in-person and virtual</li>
                  <li><strong>Self-Paced</strong>: On-demand online access</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">5</Badge>
              <div>
                <p className="font-medium">Set Duration</p>
                <ul className="text-sm text-muted-foreground list-disc pl-4">
                  <li>Duration Hours: Total contact hours</li>
                  <li>Duration Days: Number of training days (for ILT)</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">6</Badge>
              <div>
                <p className="font-medium">Configure Certification (if applicable)</p>
                <ul className="text-sm text-muted-foreground list-disc pl-4">
                  <li>Certification Name: Official credential name</li>
                  <li>Validity Months: Expiration period (e.g., 36 for 3 years)</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">7</Badge>
              <div>
                <p className="font-medium">Define Target Audience & Prerequisites</p>
                <p className="text-sm text-muted-foreground">Helps with course recommendations and eligibility</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">8</Badge>
              <div>
                <p className="font-medium">Save Course</p>
                <p className="text-sm text-muted-foreground">Course is created with is_active = true</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Method Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Best For</TableHead>
                <TableHead>Considerations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Badge variant="outline">In-Person</Badge>
                </TableCell>
                <TableCell>
                  <ul className="text-sm space-y-1">
                    <li>• Hands-on technical skills</li>
                    <li>• Team building / leadership</li>
                    <li>• Equipment-based training</li>
                  </ul>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Travel costs, scheduling constraints, venue requirements
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge variant="outline">Virtual</Badge>
                </TableCell>
                <TableCell>
                  <ul className="text-sm space-y-1">
                    <li>• Geographically dispersed teams</li>
                    <li>• Knowledge-based training</li>
                    <li>• Quick deployment needs</li>
                  </ul>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Timezone coordination, technology requirements, engagement challenges
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge variant="outline">Hybrid</Badge>
                </TableCell>
                <TableCell>
                  <ul className="text-sm space-y-1">
                    <li>• Extended programs</li>
                    <li>• Blended learning journeys</li>
                    <li>• Certification preparation</li>
                  </ul>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Coordination complexity, consistent experience across formats
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge variant="outline">Self-Paced</Badge>
                </TableCell>
                <TableCell>
                  <ul className="text-sm space-y-1">
                    <li>• Individual skill gaps</li>
                    <li>• Reference/refresher training</li>
                    <li>• High-volume standardized content</li>
                  </ul>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Completion rates, limited interaction, requires self-motivation
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Example: Vendor Course Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
VENDOR COURSE EXAMPLE: PMP Certification Prep
═════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│ COURSE IDENTIFICATION                                           │
├─────────────────────────────────────────────────────────────────┤
│ Vendor:          PMI Authorized Training Partner                │
│ Course Code:     PMP-PREP-2026                                  │
│ Course Name:     PMP® Certification Preparation Course          │
│ Description:     Comprehensive 35-hour training program         │
│                  covering PMBOK Guide 7th Edition and the       │
│                  Project Management Professional exam content.  │
├─────────────────────────────────────────────────────────────────┤
│ DELIVERY                                                        │
├─────────────────────────────────────────────────────────────────┤
│ Delivery Method: Hybrid (Virtual + In-Person option)            │
│ Duration Hours:  35                                             │
│ Duration Days:   5                                              │
├─────────────────────────────────────────────────────────────────┤
│ CERTIFICATION                                                   │
├─────────────────────────────────────────────────────────────────┤
│ Certification:   Project Management Professional (PMP®)         │
│ Validity:        36 months (Requires 60 PDUs to renew)          │
├─────────────────────────────────────────────────────────────────┤
│ AUDIENCE                                                        │
├─────────────────────────────────────────────────────────────────┤
│ Target Audience: Project managers, team leads, program managers │
│ Prerequisites:   - 4-year degree + 3 years PM experience, OR    │
│                  - High school diploma + 5 years PM experience  │
│                  - 35 hours of project management education     │
├─────────────────────────────────────────────────────────────────┤
│ STATUS                                                          │
├─────────────────────────────────────────────────────────────────┤
│ Is Active:       ✓ Yes                                          │
└─────────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Alert>
        <BookOpen className="h-4 w-4" />
        <AlertTitle>Course Catalog Best Practice</AlertTitle>
        <AlertDescription>
          Regularly review vendor course catalogs (quarterly) to ensure offerings are current. 
          Vendors may discontinue courses, update content, or change certification requirements. 
          Inactive courses should be set to is_active = false to prevent new enrollments 
          while preserving historical records.
        </AlertDescription>
      </Alert>
    </section>
  );
}
