import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndExternalCertifications() {
  return (
    <section className="space-y-6" id="sec-3-10" data-manual-anchor="sec-3-10">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Award className="h-6 w-6 text-emerald-600" />
          3.10 Certifications & Credentials
        </h2>
        <p className="text-muted-foreground">
          Track external certifications, manage expiry dates, and configure renewal workflows.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Record external certifications with validity tracking</li>
            <li>Configure expiry reminder windows</li>
            <li>Automate recertification request generation</li>
            <li>Integrate with employee profiles</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Certification Lifecycle</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
CERTIFICATION TRACKING WORKFLOW
═══════════════════════════════

Training Completed → Certificate Issued → Expiry Date Set
                                                │
                    ┌───────────────────────────┘
                    ▼
         ┌──────────────────────┐
         │  REMINDER WINDOWS    │
         │                      │
         │  90 days: Alert L&D  │
         │  60 days: Email Emp  │
         │  30 days: Manager    │
         │   0 days: EXPIRED    │
         └──────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Auto-Create Training │
         │ Recertification Req  │
         └──────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Compliance Critical</AlertTitle>
        <AlertDescription>
          For compliance-required certifications (e.g., OSHA, industry licenses), expired 
          credentials may impact job eligibility. Configure mandatory recertification rules 
          in Compliance Settings to prevent lapses.
        </AlertDescription>
      </Alert>
    </section>
  );
}
