import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, ExternalLink, Award, DollarSign, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndAgencyConcepts() {
  return (
    <section className="space-y-6" id="sec-3-1" data-manual-anchor="sec-3-1">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-emerald-600" />
          3.1 Training Agency Concepts
        </h2>
        <p className="text-muted-foreground">
          External training agencies extend your L&D capabilities beyond internal courses.
          Manage vendor relationships, track certifications, and control training costs.
        </p>
      </div>

      {/* Learning Objectives */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Understand the role of external training agencies in enterprise L&D</li>
            <li>Differentiate between internal LMS content and agency-delivered training</li>
            <li>Identify key agency management workflows and data models</li>
            <li>Plan agency integration with budget tracking and compliance</li>
          </ul>
        </CardContent>
      </Card>

      {/* What Are Training Agencies */}
      <Card>
        <CardHeader>
          <CardTitle>What Are Training Agencies?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Training agencies are external organizations that deliver professional development
            services outside your organization's internal Learning Management System. They include:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4" />
                Professional Training Providers
              </h4>
              <ul className="text-sm space-y-1">
                <li>• Corporate training companies</li>
                <li>• Industry certification bodies</li>
                <li>• Professional associations</li>
                <li>• University continuing education</li>
              </ul>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                Specialized Vendors
              </h4>
              <ul className="text-sm space-y-1">
                <li>• Technical certification providers (Cisco, Microsoft)</li>
                <li>• Safety and compliance trainers</li>
                <li>• Leadership development firms</li>
                <li>• Software vendor training</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agency vs Internal Training */}
      <Card>
        <CardHeader>
          <CardTitle>Agency vs. Internal Training Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aspect</TableHead>
                <TableHead>Internal LMS</TableHead>
                <TableHead>Training Agency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Content Creation</TableCell>
                <TableCell>Organization creates/uploads content</TableCell>
                <TableCell>Agency provides curriculum</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Delivery Method</TableCell>
                <TableCell>Self-paced online, virtual sessions</TableCell>
                <TableCell>Instructor-led, workshops, bootcamps</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Progress Tracking</TableCell>
                <TableCell>Automatic via LMS</TableCell>
                <TableCell>Manual entry or integration</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Certification</TableCell>
                <TableCell>Internal certificates</TableCell>
                <TableCell>Industry-recognized credentials</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cost Model</TableCell>
                <TableCell>Platform licensing</TableCell>
                <TableCell>Per-seat, per-course, or contract</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Budget Impact</TableCell>
                <TableCell>Fixed infrastructure cost</TableCell>
                <TableCell>Variable per enrollment</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Agency Data Model */}
      <Card>
        <CardHeader>
          <CardTitle>Agency Data Model Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────┐
│                    training_agencies                         │
│    (name, contact_info, specializations, is_preferred)       │
└─────────────────────┬────────────────────────────────────────┘
                      │ 1:N
┌─────────────────────▼────────────────────────────────────────┐
│                 training_agency_courses                       │
│    (course_name, description, duration, delivery_method)      │
└─────────────────────┬────────────────────────────────────────┘
                      │ 1:N
┌─────────────────────▼────────────────────────────────────────┐
│              training_agency_course_dates                     │
│         (start_date, end_date, location, capacity)            │
└─────────────────────┬────────────────────────────────────────┘
                      │ 1:N
┌─────────────────────▼────────────────────────────────────────┐
│                   training_requests                           │
│    (employee_id, agency_course_id, status, actual_cost)       │
└─────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      {/* Key Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Key Benefits of Agency Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <Award className="h-8 w-8 text-amber-500 mb-2" />
              <h4 className="font-semibold mb-1">Recognized Credentials</h4>
              <p className="text-sm text-muted-foreground">
                Industry certifications that enhance employee value and organizational credibility.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 text-green-500 mb-2" />
              <h4 className="font-semibold mb-1">Budget Control</h4>
              <p className="text-sm text-muted-foreground">
                Track costs per employee, department, and course with approval workflows.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <ExternalLink className="h-8 w-8 text-blue-500 mb-2" />
              <h4 className="font-semibold mb-1">Vendor Management</h4>
              <p className="text-sm text-muted-foreground">
                Centralized vendor ratings, performance tracking, and contract management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* When to Use Agencies */}
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertTitle>When to Use Training Agencies</AlertTitle>
        <AlertDescription>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Specialized certifications not available internally (PMP, CISSP, AWS)</li>
            <li>• Regulatory compliance requiring accredited providers</li>
            <li>• Leadership development with external perspectives</li>
            <li>• Technical training on proprietary vendor systems</li>
            <li>• High-volume training needs exceeding internal capacity</li>
          </ul>
        </AlertDescription>
      </Alert>
    </section>
  );
}
