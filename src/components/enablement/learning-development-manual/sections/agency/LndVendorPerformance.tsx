import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Star, TrendingUp } from 'lucide-react';

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
          </ul>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge className="bg-purple-100 text-purple-800">quarterly</Badge></TableCell>
                <TableCell>Every 3 months</TableCell>
                <TableCell>Strategic vendors</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-blue-100 text-blue-800">annual</Badge></TableCell>
                <TableCell>Yearly</TableCell>
                <TableCell>Operational & Transactional</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-orange-100 text-orange-800">incident</Badge></TableCell>
                <TableCell>As needed</TableCell>
                <TableCell>Any (triggered by issue)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-green-100 text-green-800">renewal</Badge></TableCell>
                <TableCell>Contract renewal</TableCell>
                <TableCell>Any with contracts</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5" />Scoring Dimensions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dimension</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Metrics</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Quality Score</TableCell>
                <TableCell>30%</TableCell>
                <TableCell>Content relevance, instructor expertise, materials quality</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Delivery Score</TableCell>
                <TableCell>25%</TableCell>
                <TableCell>On-time delivery, completion rates, session execution</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Value Score</TableCell>
                <TableCell>25%</TableCell>
                <TableCell>Cost effectiveness, ROI, learner outcomes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Responsiveness Score</TableCell>
                <TableCell>20%</TableCell>
                <TableCell>Communication, issue resolution, flexibility</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Performance Dashboard</CardTitle></CardHeader>
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
        </CardContent>
      </Card>
    </section>
  );
}
