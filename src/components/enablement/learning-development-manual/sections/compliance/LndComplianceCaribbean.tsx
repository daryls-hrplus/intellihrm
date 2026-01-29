import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Globe, Scale, Calendar, FileText } from 'lucide-react';

export function LndComplianceCaribbean() {
  return (
    <section id="sec-5-23" data-manual-anchor="sec-5-23" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-500/10">
          <Globe className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.23 Caribbean Regional Requirements</h2>
          <p className="text-sm text-muted-foreground">
            Jamaica, Trinidad, Barbados, Dominican Republic, and OECS compliance
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Configure region-specific compliance requirements by jurisdiction</li>
            <li>Map local labor law training mandates to LMS courses</li>
            <li>Track multi-jurisdiction certifications for cross-border employees</li>
            <li>Generate jurisdiction-specific regulatory reports</li>
            <li>Manage regional compliance calendar with local holidays</li>
          </ul>
        </CardContent>
      </Card>

      {/* Regional Requirements Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Caribbean Regional Compliance Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>Primary Legislation</TableHead>
                <TableHead>Regulatory Body</TableHead>
                <TableHead>Key Training Mandates</TableHead>
                <TableHead>Retention</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge className="bg-green-600">Jamaica</Badge></TableCell>
                <TableCell>OSHA (Jamaica) Act 2017</TableCell>
                <TableCell>Ministry of Labour & Social Security</TableCell>
                <TableCell>OSH induction, First Aid, Fire Safety</TableCell>
                <TableCell>10 years</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-red-600">Trinidad & Tobago</Badge></TableCell>
                <TableCell>OSH Act 2004</TableCell>
                <TableCell>OSHA Trinidad</TableCell>
                <TableCell>General OSH, Hazard-specific, Committee training</TableCell>
                <TableCell>7 years</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-blue-600">Barbados</Badge></TableCell>
                <TableCell>Safety & Health at Work Act 2005</TableCell>
                <TableCell>Labour Department</TableCell>
                <TableCell>Workplace safety, Machinery operation</TableCell>
                <TableCell>5 years</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-orange-600">Dominican Republic</Badge></TableCell>
                <TableCell>Código de Trabajo (Art. 42-44)</TableCell>
                <TableCell>SISALRIL / Ministerio de Trabajo</TableCell>
                <TableCell>Riesgos laborales, Seguridad industrial</TableCell>
                <TableCell>5 years</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-purple-600">OECS States</Badge></TableCell>
                <TableCell>Harmonized OSH Framework</TableCell>
                <TableCell>OECS Commission</TableCell>
                <TableCell>Varies by member state</TableCell>
                <TableCell>5-7 years</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Jamaica Specifics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge className="bg-green-600">JM</Badge>
            Jamaica OSHA Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Training Type</TableHead>
                  <TableHead>Legal Reference</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>OSH Induction</TableCell>
                  <TableCell>OSHA Act §16</TableCell>
                  <TableCell>On hire + annual</TableCell>
                  <TableCell>All employees</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>First Aid</TableCell>
                  <TableCell>OSHA Reg. §24</TableCell>
                  <TableCell>Every 2 years</TableCell>
                  <TableCell>Designated responders</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Fire Warden</TableCell>
                  <TableCell>Fire Brigade Act</TableCell>
                  <TableCell>Annual</TableCell>
                  <TableCell>Floor wardens</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Safety Committee</TableCell>
                  <TableCell>OSHA Act §18</TableCell>
                  <TableCell>On appointment</TableCell>
                  <TableCell>Committee members</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium">Configuration:</p>
              <code className="text-xs">compliance_training.region_code = 'JM'</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trinidad Specifics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge className="bg-red-600">TT</Badge>
            Trinidad & Tobago OSH Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Training Type</TableHead>
                  <TableHead>Legal Reference</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>General OSH Awareness</TableCell>
                  <TableCell>OSH Act §6(2)(f)</TableCell>
                  <TableCell>On hire + annual</TableCell>
                  <TableCell>All employees</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Hazard-Specific Training</TableCell>
                  <TableCell>OSH Act §6(2)(g)</TableCell>
                  <TableCell>As required by hazard</TableCell>
                  <TableCell>Exposed workers</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Safety Committee Training</TableCell>
                  <TableCell>OSH Act §31</TableCell>
                  <TableCell>On appointment</TableCell>
                  <TableCell>Committee members</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Ergonomics</TableCell>
                  <TableCell>Ergonomics Regulations</TableCell>
                  <TableCell>Initial + when tasks change</TableCell>
                  <TableCell>VDU users, manual handlers</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium">Configuration:</p>
              <code className="text-xs">compliance_training.region_code = 'TT'</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Multi-Jurisdiction Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`compliance_regional_config
├── id: UUID PK
├── company_id: UUID FK
├── region_code: TEXT ('JM', 'TT', 'BB', 'DO', 'OECS', 'LC', 'VC', 'GD')
├── primary_legislation: TEXT
├── regulatory_body: TEXT
├── reporting_requirements: JSONB
│   ├── annual_report: BOOLEAN
│   ├── incident_reporting_hours: INT (e.g., 24 for immediate)
│   ├── report_submission_portal: TEXT (URL)
│   └── required_forms: TEXT[]
├── training_mandates: JSONB[]
│   ├── training_type: TEXT
│   ├── legal_reference: TEXT
│   ├── frequency_months: INT
│   ├── target_audience: TEXT
│   └── lms_course_id: UUID FK
├── retention_years: INT
├── public_holidays: DATE[] (affects due date calculations)
├── data_residency_required: BOOLEAN
├── local_language: TEXT (e.g., 'es' for DR)
└── is_active: BOOLEAN

-- Example: Configure Jamaica requirements
INSERT INTO compliance_regional_config (
  company_id, 
  region_code, 
  primary_legislation,
  training_mandates,
  retention_years
) VALUES (
  '[company_uuid]',
  'JM',
  'OSHA (Jamaica) Act 2017',
  '[
    {"training_type": "OSH Induction", "legal_reference": "OSHA Act §16", "frequency_months": 12},
    {"training_type": "First Aid", "legal_reference": "OSHA Reg. §24", "frequency_months": 24}
  ]'::jsonb,
  10
);`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Regional Compliance Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deadline</TableHead>
                <TableHead>Requirement</TableHead>
                <TableHead>Jurisdictions</TableHead>
                <TableHead>Submission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>January 31</TableCell>
                <TableCell>Annual OSH Report</TableCell>
                <TableCell>Jamaica</TableCell>
                <TableCell>Ministry of Labour portal</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>February 1</TableCell>
                <TableCell>OSH Statistics Summary</TableCell>
                <TableCell>Trinidad</TableCell>
                <TableCell>OSHA TT online</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>March 31</TableCell>
                <TableCell>Safety Committee Report</TableCell>
                <TableCell>Barbados</TableCell>
                <TableCell>Labour Department</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>April 15</TableCell>
                <TableCell>Training Records Audit</TableCell>
                <TableCell>Dominican Republic</TableCell>
                <TableCell>SISALRIL</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>December 15</TableCell>
                <TableCell>Next Year Training Plan</TableCell>
                <TableCell>All Caribbean</TableCell>
                <TableCell>Internal requirement</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cross-Border Employees */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Cross-Border Employee Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Employees working across Caribbean jurisdictions must maintain compliance with all applicable regions.
            The system tracks primary work location and secondary assignments.
          </p>
          
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`employee_regional_compliance
├── employee_id: UUID FK → profiles.id
├── primary_region: TEXT (main work jurisdiction)
├── secondary_regions: TEXT[] (travel/assignment locations)
├── compliance_status: JSONB
│   ├── JM: {status: 'compliant', last_checked: DATE}
│   ├── TT: {status: 'pending', items_due: 2}
│   └── BB: {status: 'not_applicable'}
└── travel_training_complete: BOOLEAN

-- Query: Find employees needing Trinidad compliance for upcoming assignment
SELECT p.full_name, erc.compliance_status->'TT'
FROM employee_regional_compliance erc
JOIN profiles p ON erc.employee_id = p.id
WHERE 'TT' = ANY(erc.secondary_regions)
  AND (erc.compliance_status->'TT'->>'status') != 'compliant';`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Regional Compliance Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="p-3 border rounded-lg">
              <p className="font-medium">1. Localized Course Content</p>
              <p className="text-sm text-muted-foreground">
                Create region-specific course versions referencing local legislation and examples.
                Use local_language field for Spanish content in Dominican Republic.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">2. Holiday-Aware Due Dates</p>
              <p className="text-sm text-muted-foreground">
                System automatically extends due dates falling on regional public holidays.
                Configure public_holidays array per region.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">3. Mutual Recognition</p>
              <p className="text-sm text-muted-foreground">
                Some CARICOM certifications are mutually recognized. Configure equivalency rules
                in compliance_cert_equivalencies table.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">4. Data Residency</p>
              <p className="text-sm text-muted-foreground">
                Some jurisdictions require training records stored in-country. System respects
                data_residency_required flag when archiving.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
