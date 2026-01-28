import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Star, BarChart3 } from 'lucide-react';

export function LndAgencyRatings() {
  return (
    <section className="space-y-6" id="sec-3-9" data-manual-anchor="sec-3-9">
      <div>
        <h2 className="text-2xl font-bold mb-2">3.9 Agency Ratings</h2>
        <p className="text-muted-foreground">
          Track agency performance through learner feedback and completion metrics.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure post-training evaluation collection</li>
            <li>Aggregate ratings across courses and sessions</li>
            <li>Use ratings to inform preferred vendor status</li>
            <li>Generate agency performance reports</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Rating Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Calculation</TableHead>
                <TableHead>Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Overall Rating</TableCell>
                <TableCell>Average of all course ratings (1-5)</TableCell>
                <TableCell>≥ 4.0</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Completion Rate</TableCell>
                <TableCell>Completions / Enrollments × 100</TableCell>
                <TableCell>≥ 90%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Certification Pass Rate</TableCell>
                <TableCell>Passed / Attempted × 100</TableCell>
                <TableCell>≥ 85%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">NPS Score</TableCell>
                <TableCell>% Promoters - % Detractors</TableCell>
                <TableCell>≥ 50</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cost Effectiveness</TableCell>
                <TableCell>Competency Gain / Cost</TableCell>
                <TableCell>Benchmark by category</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Agency Performance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">4.6</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
              <div className="flex justify-center mt-2">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`h-4 w-4 ${i <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">94%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
              <Badge variant="outline" className="mt-2">Above Target</Badge>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">87%</div>
              <div className="text-sm text-muted-foreground">Cert Pass Rate</div>
              <Badge variant="outline" className="mt-2">Above Target</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evaluation Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Weight</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>How would you rate the course content quality?</TableCell>
                <TableCell>1-5 Scale</TableCell>
                <TableCell>25%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>How effective was the instructor?</TableCell>
                <TableCell>1-5 Scale</TableCell>
                <TableCell>25%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>How relevant was the training to your role?</TableCell>
                <TableCell>1-5 Scale</TableCell>
                <TableCell>20%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>How well-organized was the training session?</TableCell>
                <TableCell>1-5 Scale</TableCell>
                <TableCell>15%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Would you recommend this agency to colleagues?</TableCell>
                <TableCell>NPS (0-10)</TableCell>
                <TableCell>15%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
