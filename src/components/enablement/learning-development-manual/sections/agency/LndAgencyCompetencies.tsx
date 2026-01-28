import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp } from 'lucide-react';

export function LndAgencyCompetencies() {
  return (
    <section className="space-y-6" id="sec-3-7" data-manual-anchor="sec-3-7">
      <div>
        <h2 className="text-2xl font-bold mb-2">3.7 Competencies to be Gained</h2>
        <p className="text-muted-foreground">
          Map agency courses to organizational competencies for gap analysis integration.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Link agency courses to competency framework</li>
            <li>Configure expected proficiency gains</li>
            <li>Enable AI-driven course recommendations</li>
            <li>Track competency development through external training</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Competency Mapping Fields</CardTitle>
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
                <TableCell className="font-mono text-sm">agency_course_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Agency course reference</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">competency_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Organizational competency</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">proficiency_gain</TableCell>
                <TableCell>Number</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Expected level increase (1-5 scale)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">target_level</TableCell>
                <TableCell>Number</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Competency level achieved post-completion</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Mapping Example: PMP Certification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competency</TableHead>
                <TableHead>Before Course</TableHead>
                <TableHead>After Course</TableHead>
                <TableHead>Gain</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Project Planning</TableCell>
                <TableCell>Level 2</TableCell>
                <TableCell>Level 4</TableCell>
                <TableCell className="text-green-600">+2</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Risk Management</TableCell>
                <TableCell>Level 1</TableCell>
                <TableCell>Level 3</TableCell>
                <TableCell className="text-green-600">+2</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Stakeholder Communication</TableCell>
                <TableCell>Level 2</TableCell>
                <TableCell>Level 3</TableCell>
                <TableCell className="text-green-600">+1</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Budget Management</TableCell>
                <TableCell>Level 2</TableCell>
                <TableCell>Level 4</TableCell>
                <TableCell className="text-green-600">+2</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Gap Analysis Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Competency Gap Analysis → Agency Course Recommendation

Employee: John Smith
Role: Senior Developer → Target: Technical Lead

Gap Detected:
├── Project Management: Current 2, Required 4 (Gap: 2)
└── Risk Assessment: Current 1, Required 3 (Gap: 2)

AI Recommendation:
┌─────────────────────────────────────────────────────┐
│ Recommended Agency Course: PMP Certification        │
│ Provider: PMI Authorized Training Partner           │
│ Duration: 5 days                                    │
│ Cost: $2,955                                        │
│ Competency Coverage:                                │
│   ✓ Project Management: +2 levels                   │
│   ✓ Risk Assessment: +2 levels                      │
│ Gap Closure: 100%                                   │
└─────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}
