import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Share2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndVendorSharing() {
  return (
    <section className="space-y-6" id="sec-3-11" data-manual-anchor="sec-3-11">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Share2 className="h-6 w-6 text-emerald-600" />
          3.11 Multi-Company Vendor Sharing
        </h2>
        <p className="text-muted-foreground">
          Share vendor relationships and negotiate group-level discounts across subsidiaries.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure group-level vendor relationships</li>
            <li>Leverage volume discounts across entities</li>
            <li>Maintain per-company budget controls</li>
            <li>Track cross-company enrollment metrics</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Multi-Company Architecture</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
                    ┌─────────────────────┐
                    │   Company Group     │
                    │  (Aurelius Group)   │
                    └──────────┬──────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Trinidad   │         │   Jamaica   │         │  Barbados   │
│   Company   │         │   Company   │         │   Company   │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       └───────────────────────┼───────────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │   Shared Vendor:    │
                    │  Cisco Learning     │
                    │  (Group Discount)   │
                    └─────────────────────┘

Training requests draw from individual company budgets
while leveraging group-negotiated pricing.
          `}</pre>
        </CardContent>
      </Card>

      <Alert>
        <Building className="h-4 w-4" />
        <AlertTitle>Volume Discount Benefits</AlertTitle>
        <AlertDescription>
          When vendors are shared across a company group, total enrollments from all 
          subsidiaries count toward volume discount thresholds, enabling smaller 
          companies to benefit from enterprise pricing.
        </AlertDescription>
      </Alert>
    </section>
  );
}
