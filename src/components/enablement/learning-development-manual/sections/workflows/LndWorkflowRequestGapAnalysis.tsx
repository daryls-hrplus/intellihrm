import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export function LndWorkflowRequestGapAnalysis() {
  return (
    <section className="space-y-6" id="sec-4-3" data-manual-anchor="sec-4-3">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.3 Training Request by Gap Analysis</h2>
        <p className="text-muted-foreground">Automated training requests triggered by competency gap detection.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure competency-to-course mappings for auto-recommendations</li>
            <li>Set gap thresholds that trigger training requests</li>
            <li>Process AI-generated learning path suggestions</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Gap Analysis Flow</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Competency Assessment
         │
         ▼
┌─────────────────────┐
│   Gap Detection     │ Employee Level: 2
│   Required: 4       │ Gap: 2 levels
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Course Mapping     │ competency_course_mappings
│  Lookup             │ Find courses that close gap
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Training Request    │ source_type: gap_analysis
│ Auto-Created        │ status: pending_approval
└─────────────────────┘
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}
