import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building, Share2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndAgencyMultiCompany() {
  return (
    <section className="space-y-6" id="sec-3-8" data-manual-anchor="sec-3-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">3.8 Multi-Company Sharing</h2>
        <p className="text-muted-foreground">
          Share agency relationships and courses across companies within a corporate group.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure agency visibility across company group</li>
            <li>Manage group-level vs company-specific vendor relationships</li>
            <li>Leverage volume discounts across subsidiaries</li>
            <li>Maintain per-company budget controls</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Sharing Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">is_group_shared</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell>Agency visible to all companies in group</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">shared_with_companies</TableCell>
                <TableCell>UUID[]</TableCell>
                <TableCell>Specific companies with access (if not group-wide)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">owning_company_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>Company that manages the vendor relationship</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Multi-Company Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
                    ┌─────────────────────┐
                    │   Company Group     │
                    │  (Aurelius Group)   │
                    └──────────┬──────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Trinidad   │         │   Jamaica   │         │  Barbados   │
│   Company   │         │   Company   │         │   Company   │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Shared Agency:    │
                    │  Cisco Learning     │
                    │  (Group Discount)   │
                    └─────────────────────┘

Budget Allocation:
├── Trinidad Budget: $50,000 TTD
├── Jamaica Budget: $40,000 JMD
└── Barbados Budget: $30,000 BBD

Training requests draw from individual company budgets
while leveraging group-negotiated pricing.
          `}</pre>
        </CardContent>
      </Card>

      <Alert>
        <Building className="h-4 w-4" />
        <AlertTitle>Group Volume Discounts</AlertTitle>
        <AlertDescription>
          When agencies are shared across a company group, total enrollments from all 
          subsidiaries count toward volume discount thresholds. This enables smaller 
          companies to benefit from enterprise pricing.
        </AlertDescription>
      </Alert>
    </section>
  );
}
