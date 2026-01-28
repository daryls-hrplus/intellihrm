import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck } from 'lucide-react';

export function LndWorkflowRequestAppraisal() {
  return (
    <section className="space-y-6" id="sec-4-22" data-manual-anchor="sec-4-22">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.4 Request via Appraisal</h2>
        <p className="text-muted-foreground">Training requests initiated through performance appraisal outcomes.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure appraisal integration rules for training triggers</li>
            <li>Auto-create requests based on development goals</li>
            <li>Link training completion back to appraisal records</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5" />Appraisal Integration</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Performance Appraisal Completion
              │
              ▼
┌──────────────────────────┐
│ appraisal_integration_   │
│ rules (action: training) │
└───────────┬──────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
[Rating < 3]    [Development Goal Set]
    │               │
    ▼               ▼
┌─────────────┐ ┌─────────────┐
│ PIP Course  │ │ Goal-Aligned│
│ Auto-Enroll │ │ Training    │
└─────────────┘ └─────────────┘
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}
