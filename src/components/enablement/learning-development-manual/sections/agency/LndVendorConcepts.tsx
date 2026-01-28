import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, LayoutGrid, ArrowRight, Target, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function LndVendorConcepts() {
  return (
    <section className="space-y-6" id="sec-3-1" data-manual-anchor="sec-3-1">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-emerald-600" />
          3.1 External Training & Vendor Concepts
        </h2>
        <p className="text-muted-foreground">
          Understand the vendor management lifecycle, terminology, and strategic framework for managing external training providers.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Understand external training vs internal LMS usage scenarios</li>
            <li>Apply the 4-stage vendor lifecycle methodology</li>
            <li>Classify vendors using the Strategic/Operational/Transactional tier model</li>
            <li>Navigate the vendor management data model</li>
            <li>Apply industry benchmarks for external training spend</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Terminology Clarification</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Term</TableHead>
                <TableHead>Definition</TableHead>
                <TableHead>Examples</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Training Vendor</TableCell>
                <TableCell>External organization providing training services</TableCell>
                <TableCell>Coursera, LinkedIn Learning, PMI, Cisco</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Training Agency</TableCell>
                <TableCell>Alternative term for vendor (legacy systems)</TableCell>
                <TableCell>Same as Vendor - used interchangeably</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Vendor Course</TableCell>
                <TableCell>Training offering available from a vendor</TableCell>
                <TableCell>PMP Certification, CCNA, AWS Solutions Architect</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Session</TableCell>
                <TableCell>Scheduled instance of a vendor course</TableCell>
                <TableCell>PMP Prep - March 15-19, 2026 (Virtual)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">External Training Record</TableCell>
                <TableCell>Historical record of completed external training</TableCell>
                <TableCell>John Smith completed PMP on 2025-06-15</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Vendor Lifecycle Methodology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Based on Workday and industry best practices, vendor management follows a 4-stage lifecycle:
          </p>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                      VENDOR MANAGEMENT LIFECYCLE                             │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌───────────────┐      ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
    │   SELECTION   │ ──▶  │   ONBOARDING  │ ──▶  │  PERFORMANCE  │ ──▶  │  OFFBOARDING  │
    │               │      │               │      │               │      │               │
    │ • RFP/RFI     │      │ • Contracting │      │ • Monitoring  │      │ • Renewal     │
    │ • Evaluation  │      │ • Setup       │      │ • Reviews     │      │ • Termination │
    │ • Scoring     │      │ • Integration │      │ • Scorecards  │      │ • Transition  │
    └───────────────┘      └───────────────┘      └───────────────┘      └───────────────┘
           │                      │                      │                      │
           ▼                      ▼                      ▼                      ▼
    ┌───────────────┐      ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
    │ Status: -     │      │ Status: ACTIVE│      │ Status: ACTIVE│      │ Status:       │
    │               │      │               │      │ or UNDER_REV  │      │ TERMINATED    │
    │ Duration:     │      │ Duration:     │      │               │      │               │
    │ 2-4 weeks     │      │ 1-2 weeks     │      │ Ongoing       │      │ 2-4 weeks     │
    └───────────────┘      └───────────────┘      └───────────────┘      └───────────────┘

CYCLE REPEATS FOR RENEWALS
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Vendor Tier Classification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead>Criteria</TableHead>
                <TableHead>Review Frequency</TableHead>
                <TableHead>Governance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Badge className="bg-purple-100 text-purple-800">Strategic</Badge>
                </TableCell>
                <TableCell>
                  <ul className="text-sm space-y-1">
                    <li>Annual spend &gt; $50,000</li>
                    <li>Core business capability</li>
                    <li>Multi-year contract</li>
                  </ul>
                </TableCell>
                <TableCell>Quarterly</TableCell>
                <TableCell>Executive sponsor, L&D owner, Legal review</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge className="bg-blue-100 text-blue-800">Operational</Badge>
                </TableCell>
                <TableCell>
                  <ul className="text-sm space-y-1">
                    <li>Annual spend $10,000-$50,000</li>
                    <li>Standard training needs</li>
                    <li>Annual contract</li>
                  </ul>
                </TableCell>
                <TableCell>Semi-Annual</TableCell>
                <TableCell>L&D owner, standard monitoring</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge variant="outline">Transactional</Badge>
                </TableCell>
                <TableCell>
                  <ul className="text-sm space-y-1">
                    <li>Annual spend &lt; $10,000</li>
                    <li>Ad-hoc training</li>
                    <li>Per-course purchase</li>
                  </ul>
                </TableCell>
                <TableCell>Annual (automated)</TableCell>
                <TableCell>Automated tracking, exception-based review</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Model Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VENDOR MANAGEMENT DATA MODEL                              │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────────┐
                              │  training_vendors   │
                              │  (25 fields)        │
                              │                     │
                              │  code, name, type,  │
                              │  status, contract,  │
                              │  performance_score  │
                              └──────────┬──────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
              ▼                          ▼                          ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ training_vendor_    │    │ training_vendor_    │    │ external_training_  │
│ courses (15 fields) │    │ reviews (17 fields) │    │ records (21 fields) │
│                     │    │                     │    │                     │
│ course_name,        │    │ review_type,        │    │ training_name,      │
│ delivery_method,    │    │ overall_score,      │    │ provider_name,      │
│ certification_name  │    │ quality_score,      │    │ certificate_url     │
└──────────┬──────────┘    │ recommendations     │    └─────────────────────┘
           │               └─────────────────────┘
           │
           ▼
┌─────────────────────┐    ┌─────────────────────┐
│ training_vendor_    │───▶│ training_vendor_    │
│ sessions (21 fields)│    │ costs (11 fields)   │
│                     │    │                     │
│ start_date, end_date│    │ cost_type, amount,  │
│ capacity, status,   │    │ is_per_person       │
│ cost_per_person     │    │                     │
└─────────────────────┘    └─────────────────────┘

INTEGRATION POINTS:
├── training_requests: Links vendor sessions to approval workflow
├── training_budgets: Validates spend against departmental budgets
├── training_evaluations: Captures post-training feedback
└── competency_course_mappings: Maps vendor courses to competencies
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>When to Use External Training</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Use External Vendors For:
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Industry certifications (PMP, CCNA, CPA)</li>
                <li>• Specialized technical training</li>
                <li>• Executive leadership programs</li>
                <li>• Regulatory compliance (OSHA, SOC2)</li>
                <li>• New technology adoption</li>
                <li>• Skills not available internally</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <LayoutGrid className="h-4 w-4 text-blue-600" />
                Use Internal LMS For:
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Company-specific processes</li>
                <li>• Onboarding programs</li>
                <li>• Product knowledge</li>
                <li>• Internal policy training</li>
                <li>• Culture and values</li>
                <li>• Repeatable high-volume training</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Target className="h-4 w-4" />
        <AlertTitle>Industry Benchmark: External Training Spend</AlertTitle>
        <AlertDescription>
          According to ATD (Association for Talent Development), organizations spend on average 
          <strong> 21% of their training budget on external providers</strong>. Best-in-class 
          organizations maintain a strategic vendor panel of 10-15 approved providers to 
          balance specialization with volume discounts.
        </AlertDescription>
      </Alert>
    </section>
  );
}
