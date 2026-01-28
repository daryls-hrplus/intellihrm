import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link2, BookOpen } from 'lucide-react';

export function LndAgencyCourseLinking() {
  return (
    <section className="space-y-6" id="sec-3-3" data-manual-anchor="sec-3-3">
      <div>
        <h2 className="text-2xl font-bold mb-2">3.3 Agency-Course Linking</h2>
        <p className="text-muted-foreground">
          Link external training offerings to agencies for catalog management and request processing.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Create agency course offerings with complete metadata</li>
            <li>Configure delivery methods and duration estimates</li>
            <li>Link courses to competencies for gap analysis integration</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Field Reference: training_agency_courses</CardTitle>
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
                <TableCell className="font-mono text-sm">agency_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Parent agency reference</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">course_name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Course title</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">course_code</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Agency's course identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">description</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Course description and objectives</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">delivery_method</TableCell>
                <TableCell>Enum</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>in_person, virtual, hybrid, self_paced</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">duration_hours</TableCell>
                <TableCell>Number</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Total course duration</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">duration_days</TableCell>
                <TableCell>Number</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Duration in days (for multi-day courses)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">certification_name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Resulting certification credential</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_active</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Course availability</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Step-by-Step: Linking a Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</span>
              <div>
                <p className="font-medium">Open agency profile</p>
                <p className="text-sm text-muted-foreground">Navigate to Training → Agencies → Select agency</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</span>
              <div>
                <p className="font-medium">Go to "Courses" tab</p>
                <p className="text-sm text-muted-foreground">View existing courses or add new ones</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</span>
              <div>
                <p className="font-medium">Click "Add Course"</p>
                <p className="text-sm text-muted-foreground">Enter course details from agency catalog</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">4</span>
              <div>
                <p className="font-medium">Configure delivery method and duration</p>
                <p className="text-sm text-muted-foreground">Select appropriate delivery type</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">5</span>
              <div>
                <p className="font-medium">Save course</p>
                <p className="text-sm text-muted-foreground">Course is now available for training requests</p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Delivery Method Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Typical Duration</TableHead>
                <TableHead>Use Case</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">In-Person</TableCell>
                <TableCell>Face-to-face classroom training</TableCell>
                <TableCell>1-5 days</TableCell>
                <TableCell>Hands-on skills, team workshops</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Virtual</TableCell>
                <TableCell>Live online instructor-led</TableCell>
                <TableCell>2-8 hours</TableCell>
                <TableCell>Remote teams, cost savings</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Hybrid</TableCell>
                <TableCell>Mix of in-person and virtual</TableCell>
                <TableCell>Variable</TableCell>
                <TableCell>Certification bootcamps</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Self-Paced</TableCell>
                <TableCell>On-demand content access</TableCell>
                <TableCell>1-40 hours</TableCell>
                <TableCell>Technical certifications</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
