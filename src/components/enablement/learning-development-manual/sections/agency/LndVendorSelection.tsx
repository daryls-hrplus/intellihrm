import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, Scale, FileCheck, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndVendorSelection() {
  return (
    <section className="space-y-6" id="sec-3-3" data-manual-anchor="sec-3-3">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-emerald-600" />
          3.3 Vendor Selection & Onboarding
        </h2>
        <p className="text-muted-foreground">
          Establish structured vendor selection criteria, evaluation processes, and onboarding workflows.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Apply structured vendor selection criteria</li>
            <li>Execute weighted scoring evaluations</li>
            <li>Complete due diligence requirements</li>
            <li>Configure vendor contracts in the system</li>
            <li>Conduct effective vendor kickoff meetings</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Selection Criteria Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Criteria</TableHead>
                <TableHead>Evidence Required</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Qualifications</TableCell>
                <TableCell>
                  <ul className="text-sm space-y-1">
                    <li>• Industry accreditations</li>
                    <li>• Instructor certifications</li>
                    <li>• Years in business</li>
                  </ul>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Certificates, accreditation letters, company profile
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Experience</TableCell>
                <TableCell>
                  <ul className="text-sm space-y-1">
                    <li>• Client references (3+ similar size)</li>
                    <li>• Industry-specific experience</li>
                    <li>• Geographic coverage</li>
                  </ul>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Reference list, case studies, client testimonials
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Delivery Capability</TableCell>
                <TableCell>
                  <ul className="text-sm space-y-1">
                    <li>• Delivery methods offered</li>
                    <li>• Scalability (# of learners)</li>
                    <li>• Technology platform</li>
                  </ul>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Platform demo, capacity documentation
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Compliance</TableCell>
                <TableCell>
                  <ul className="text-sm space-y-1">
                    <li>• Data privacy (GDPR, local laws)</li>
                    <li>• Insurance coverage</li>
                    <li>• Background checks available</li>
                  </ul>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Privacy policy, insurance certificates, compliance statements
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Financial</TableCell>
                <TableCell>
                  <ul className="text-sm space-y-1">
                    <li>• Pricing structure clarity</li>
                    <li>• Volume discount availability</li>
                    <li>• Payment flexibility</li>
                  </ul>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Rate card, discount schedule, payment terms
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Weighted Scoring Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evaluation Criterion</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Score (1-5)</TableHead>
                <TableHead>Weighted Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Course Quality & Content</TableCell>
                <TableCell>25%</TableCell>
                <TableCell className="font-mono">___</TableCell>
                <TableCell className="font-mono">___</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Instructor Expertise</TableCell>
                <TableCell>20%</TableCell>
                <TableCell className="font-mono">___</TableCell>
                <TableCell className="font-mono">___</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Price Competitiveness</TableCell>
                <TableCell>20%</TableCell>
                <TableCell className="font-mono">___</TableCell>
                <TableCell className="font-mono">___</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Flexibility & Customization</TableCell>
                <TableCell>15%</TableCell>
                <TableCell className="font-mono">___</TableCell>
                <TableCell className="font-mono">___</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Client References</TableCell>
                <TableCell>10%</TableCell>
                <TableCell className="font-mono">___</TableCell>
                <TableCell className="font-mono">___</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Technology & Reporting</TableCell>
                <TableCell>10%</TableCell>
                <TableCell className="font-mono">___</TableCell>
                <TableCell className="font-mono">___</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-bold">TOTAL</TableCell>
                <TableCell className="font-bold">100%</TableCell>
                <TableCell></TableCell>
                <TableCell className="font-bold font-mono">___/5.0</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Scoring Thresholds:</strong> ≥4.0 = Proceed | 3.0-3.9 = Conditional | &lt;3.0 = Decline
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Due Diligence Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Strategic Vendors</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>☐ Financial statements (2 years)</li>
                <li>☐ Legal/compliance review</li>
                <li>☐ Data security assessment</li>
                <li>☐ Executive reference calls (3+)</li>
                <li>☐ Site visit (if applicable)</li>
                <li>☐ Pilot program results</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Operational Vendors</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>☐ Business registration verification</li>
                <li>☐ Insurance certificate</li>
                <li>☐ Standard reference check (2+)</li>
                <li>☐ Sample course review</li>
                <li>☐ Pricing validation</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Transactional Vendors</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>☐ Basic business verification</li>
                <li>☐ Accreditation check</li>
                <li>☐ Published reviews/ratings</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2">All Vendors (Required)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>☐ W-9 / Tax ID verification</li>
                <li>☐ Privacy policy review</li>
                <li>☐ Terms & conditions acceptance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contract Setup Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
CONTRACT SETUP PROCESS
══════════════════════

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 1. NEGOTIATION  │────▶│ 2. LEGAL REVIEW │────▶│ 3. SIGNATURES   │
│                 │     │                 │     │                 │
│ • Rate card     │     │ • Terms review  │     │ • Vendor signs  │
│ • Volume tiers  │     │ • Risk assess   │     │ • Company signs │
│ • Payment terms │     │ • Compliance    │     │ • Countersign   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
         ┌──────────────────────────────────────────────┘
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 4. SYSTEM SETUP │────▶│ 5. KICKOFF      │────▶│ 6. GO-LIVE      │
│                 │     │                 │     │                 │
│ • Create vendor │     │ • Intro meeting │     │ • First booking │
│ • Add courses   │     │ • Process align │     │ • Monitoring    │
│ • Set costs     │     │ • Escalation    │     │ • Feedback loop │
└─────────────────┘     └─────────────────┘     └─────────────────┘

TIMELINE: Strategic (4-6 weeks) | Operational (2-3 weeks) | Transactional (1 week)
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kickoff Meeting Agenda Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Welcome & Introductions</TableCell>
                <TableCell>5 min</TableCell>
                <TableCell>L&D Manager</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Partnership Overview & Goals</TableCell>
                <TableCell>10 min</TableCell>
                <TableCell>L&D Manager</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Training Catalog Review</TableCell>
                <TableCell>15 min</TableCell>
                <TableCell>Vendor</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Booking & Registration Process</TableCell>
                <TableCell>10 min</TableCell>
                <TableCell>L&D Admin</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Invoicing & Payment Process</TableCell>
                <TableCell>10 min</TableCell>
                <TableCell>Finance</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Reporting Requirements</TableCell>
                <TableCell>10 min</TableCell>
                <TableCell>L&D Manager</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Escalation Contacts & SLAs</TableCell>
                <TableCell>5 min</TableCell>
                <TableCell>Both</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Q&A and Next Steps</TableCell>
                <TableCell>10 min</TableCell>
                <TableCell>All</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-bold">Total Duration</TableCell>
                <TableCell className="font-bold">75 min</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Alert>
        <Scale className="h-4 w-4" />
        <AlertTitle>Compliance Reminder</AlertTitle>
        <AlertDescription>
          For Strategic vendors, ensure Legal and Procurement teams are involved in contract 
          negotiations. Data processing agreements (DPAs) may be required if vendor will 
          access employee PII. Document all due diligence findings in vendor notes field.
        </AlertDescription>
      </Alert>
    </section>
  );
}
