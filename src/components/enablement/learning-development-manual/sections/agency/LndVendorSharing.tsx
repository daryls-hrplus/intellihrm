import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building, Share2, Database, TrendingDown, Shield } from 'lucide-react';
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
          Enables enterprise-wide vendor management while maintaining per-company budget controls.
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
            <li>Manage vendor access permissions by company</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Multi-Company Schema Fields
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">training_vendors</TableCell>
                <TableCell className="font-mono text-sm">company_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>Owning company (if single-company)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">training_vendors</TableCell>
                <TableCell className="font-mono text-sm">group_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>FK to company_groups (for shared vendors)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">training_vendors</TableCell>
                <TableCell className="font-mono text-sm">is_shared</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell>Whether vendor is shared across group</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">vendor_volume_discounts</TableCell>
                <TableCell className="font-mono text-sm">vendor_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>FK to training_vendors</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">vendor_volume_discounts</TableCell>
                <TableCell className="font-mono text-sm">min_enrollments</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell>Minimum enrollments for discount tier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">vendor_volume_discounts</TableCell>
                <TableCell className="font-mono text-sm">discount_percentage</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell>Discount percent (e.g., 15.00 = 15%)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Multi-Company Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
                    ┌─────────────────────┐
                    │   Company Group     │
                    │  (Aurelius Group)   │
                    │  group_id: abc-123  │
                    └──────────┬──────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Trinidad   │         │   Jamaica   │         │  Barbados   │
│   Company   │         │   Company   │         │   Company   │
│  Budget: $50K         │  Budget: $30K         │  Budget: $25K
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       └───────────────────────┼───────────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │   Shared Vendor:    │
                    │  Cisco Learning     │
                    │  group_id: abc-123  │
                    │  (Group Discount)   │
                    └─────────────────────┘

• Vendor is linked to group_id, not individual company_id
• Each company maintains its own training budget
• Enrollments from all companies count toward volume tiers
• Costs charged to respective company budgets
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Volume Discount Tiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead>Min Enrollments</TableHead>
                <TableHead>Max Enrollments</TableHead>
                <TableHead>Discount %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="outline">Standard</Badge></TableCell>
                <TableCell>1</TableCell>
                <TableCell>10</TableCell>
                <TableCell>0%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-blue-100 text-blue-800">Bronze</Badge></TableCell>
                <TableCell>11</TableCell>
                <TableCell>25</TableCell>
                <TableCell>5%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-gray-100 text-gray-800">Silver</Badge></TableCell>
                <TableCell>26</TableCell>
                <TableCell>50</TableCell>
                <TableCell>10%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-yellow-100 text-yellow-800">Gold</Badge></TableCell>
                <TableCell>51</TableCell>
                <TableCell>100</TableCell>
                <TableCell>15%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-purple-100 text-purple-800">Enterprise</Badge></TableCell>
                <TableCell>101</TableCell>
                <TableCell>NULL (unlimited)</TableCell>
                <TableCell>20%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono mt-4">{`
DISCOUNT CALCULATION EXAMPLE
════════════════════════════

Company Group: Aurelius Group
Vendor: Cisco Learning
Period: Q1 2026

Enrollments by Company:
├── Trinidad: 35 enrollments
├── Jamaica: 22 enrollments
└── Barbados: 18 enrollments
─────────────────────────────
TOTAL: 75 enrollments → GOLD TIER (15% discount)

Cost Calculation:
├── Trinidad: 35 × $500 = $17,500 → $14,875 after 15%
├── Jamaica: 22 × $500 = $11,000 → $9,350 after 15%
└── Barbados: 18 × $500 = $9,000 → $7,650 after 15%

Each company charged to their own budget at discounted rate.
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cross-Company Enrollment Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
GROUP-LEVEL REPORTING VIEW
══════════════════════════

SELECT 
  v.vendor_name,
  c.name AS company,
  COUNT(e.id) AS enrollments,
  SUM(e.cost) AS total_cost,
  AVG(e.rating) AS avg_rating
FROM vendor_session_enrollments e
JOIN training_vendor_sessions s ON e.session_id = s.id
JOIN training_vendor_courses vc ON s.vendor_course_id = vc.id
JOIN training_vendors v ON vc.vendor_id = v.id
JOIN profiles p ON e.employee_id = p.id
JOIN companies c ON p.company_id = c.id
WHERE v.group_id = :group_id
  AND s.session_date >= :period_start
  AND s.session_date <= :period_end
GROUP BY v.vendor_name, c.name
ORDER BY v.vendor_name, enrollments DESC;
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>View Shared Vendors</TableHead>
                <TableHead>Enroll Employees</TableHead>
                <TableHead>Manage Vendor</TableHead>
                <TableHead>View Group Metrics</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Company L&D Admin</TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">Yes</Badge></TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">Own company</Badge></TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell><Badge variant="outline">Own company only</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Group L&D Admin</TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">Yes</Badge></TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">All companies</Badge></TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">Yes</Badge></TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">All companies</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>HR Partner</TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">Yes</Badge></TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">Own company</Badge></TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell><Badge variant="outline">Own company only</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Alert>
        <Building className="h-4 w-4" />
        <AlertTitle>Volume Discount Benefits</AlertTitle>
        <AlertDescription>
          When vendors are shared across a company group, total enrollments from all 
          subsidiaries count toward volume discount thresholds, enabling smaller 
          companies to benefit from enterprise pricing. Budget impact is calculated
          per-company while leveraging group-negotiated rates.
        </AlertDescription>
      </Alert>
    </section>
  );
}
