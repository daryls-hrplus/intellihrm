import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GraduationCap, Database, Star, DollarSign, Award } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndExternalInstructors() {
  return (
    <section className="space-y-6" id="sec-3-13" data-manual-anchor="sec-3-13">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-emerald-600" />
          3.13 External Instructors
        </h2>
        <p className="text-muted-foreground">
          Manage external training instructors, their specializations, qualifications, 
          and hourly rates. Assign instructors to vendor sessions and track performance.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Create and manage external instructor profiles</li>
            <li>Configure specializations and qualifications</li>
            <li>Set hourly rates and billing information</li>
            <li>Assign instructors to vendor sessions</li>
            <li>Track instructor performance and ratings</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Field Reference: training_instructors
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
                <TableCell className="font-mono text-sm">company_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Company scope</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">instructor_type</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>internal | external | vendor_provided</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">employee_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="outline">Conditional</Badge></TableCell>
                <TableCell>FK to profiles (for internal instructors)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">vendor_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="outline">Conditional</Badge></TableCell>
                <TableCell>FK to training_vendors (for vendor-provided)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">first_name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Instructor first name</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">last_name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Instructor last name</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">email</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Contact email address</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">phone</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Contact phone number</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">specializations</TableCell>
                <TableCell>Text[]</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Array of specialization areas</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">qualifications</TableCell>
                <TableCell>JSONB</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Certifications, degrees, credentials</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">hourly_rate</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Hourly rate for external instructors</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">currency</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Rate currency (default: USD)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">bio</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Professional biography</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">photo_url</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Profile photo URL</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">average_rating</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Average learner rating (1-5)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">sessions_delivered</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Total sessions delivered</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_active</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Whether instructor is available</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructor Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Linked To</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge className="bg-blue-100 text-blue-800">internal</Badge></TableCell>
                <TableCell>Company employee who delivers training</TableCell>
                <TableCell>employee_id (profiles)</TableCell>
                <TableCell>Time allocation only</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-green-100 text-green-800">external</Badge></TableCell>
                <TableCell>Independent contractor/consultant</TableCell>
                <TableCell>None (standalone)</TableCell>
                <TableCell>Hourly rate billed</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-purple-100 text-purple-800">vendor_provided</Badge></TableCell>
                <TableCell>Instructor provided by vendor</TableCell>
                <TableCell>vendor_id (training_vendors)</TableCell>
                <TableCell>Included in course cost</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step: Add External Instructor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">1</Badge>
              <div>
                <p className="font-medium">Navigate to Instructors</p>
                <p className="text-sm text-muted-foreground">Training → Instructors → Add New</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">2</Badge>
              <div>
                <p className="font-medium">Select Instructor Type</p>
                <p className="text-sm text-muted-foreground">Choose "External" for independent contractors</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">3</Badge>
              <div>
                <p className="font-medium">Enter Basic Information</p>
                <p className="text-sm text-muted-foreground">Name, contact details, profile photo</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">4</Badge>
              <div>
                <p className="font-medium">Add Specializations</p>
                <p className="text-sm text-muted-foreground">Tag subject areas (e.g., Leadership, Technical, Compliance)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">5</Badge>
              <div>
                <p className="font-medium">Add Qualifications</p>
                <p className="text-sm text-muted-foreground">Certifications, degrees, industry credentials</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">6</Badge>
              <div>
                <p className="font-medium">Set Hourly Rate</p>
                <p className="text-sm text-muted-foreground">Enter rate and currency for billing</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Qualifications JSON Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
QUALIFICATIONS JSONB STRUCTURE
══════════════════════════════

{
  "certifications": [
    {
      "name": "PMP - Project Management Professional",
      "issuer": "PMI",
      "issued_date": "2022-05-15",
      "expiry_date": "2025-05-15",
      "credential_id": "PMP-123456"
    },
    {
      "name": "Certified Scrum Master",
      "issuer": "Scrum Alliance",
      "issued_date": "2023-01-10",
      "expiry_date": null
    }
  ],
  "degrees": [
    {
      "degree": "MBA",
      "institution": "University of the West Indies",
      "year": 2018,
      "field": "Business Administration"
    }
  ],
  "languages": ["English", "Spanish"],
  "years_experience": 15
}
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Instructor Cost Calculation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
EXTERNAL INSTRUCTOR COST EXAMPLE
════════════════════════════════

Session: Leadership Fundamentals Workshop
Duration: 8 hours (1 day)
Instructor: Dr. Sarah Johnson
Hourly Rate: $150/hour

Cost Calculation:
├── Instruction Time: 8 hours × $150 = $1,200
├── Prep Time (standard 2:1): 4 hours × $150 = $600
├── Materials Review: 2 hours × $150 = $300
├── Travel Time: 3 hours × $75 (50% rate) = $225
└── Expenses: $200 (meals, parking)
─────────────────────────────────────────────
TOTAL INSTRUCTOR COST: $2,525

Note: Prep time ratio and expense policies are 
configurable in Company Settings → Training Policies.
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Instructor Performance Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Benchmark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Average Rating</TableCell>
                <TableCell>Learner evaluations (instructor_rating)</TableCell>
                <TableCell>≥ 4.0 / 5.0</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sessions Delivered</TableCell>
                <TableCell>Session assignment count</TableCell>
                <TableCell>Varies by role</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Completion Rate</TableCell>
                <TableCell>Learners completing session</TableCell>
                <TableCell>≥ 95%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Knowledge Transfer</TableCell>
                <TableCell>Post-training assessment scores</TableCell>
                <TableCell>≥ 80% pass rate</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Recommendation Rate</TableCell>
                <TableCell>Learner "would recommend" %</TableCell>
                <TableCell>≥ 90%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Alert>
        <GraduationCap className="h-4 w-4" />
        <AlertTitle>Instructor Assignment</AlertTitle>
        <AlertDescription>
          Instructors are assigned to vendor sessions via the training_vendor_sessions.instructor_id 
          field. When scheduling sessions, the system suggests instructors based on specialization 
          match, availability, and historical ratings. Internal instructors require manager approval 
          for time allocation.
        </AlertDescription>
      </Alert>
    </section>
  );
}
