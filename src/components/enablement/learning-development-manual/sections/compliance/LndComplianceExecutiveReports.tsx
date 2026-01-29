import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Presentation, CheckCircle2, TrendingUp, FileText } from 'lucide-react';

export function LndComplianceExecutiveReports() {
  return (
    <section id="sec-5-11" data-manual-anchor="sec-5-11" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-500/10">
          <Presentation className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.11 Executive Compliance Reports</h2>
          <p className="text-muted-foreground">C-suite reporting, board presentations, and strategic insights</p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Generate executive-level compliance summary reports</li>
            <li>Understand board-ready compliance metrics and KPIs</li>
            <li>Configure automated executive report scheduling</li>
            <li>Interpret risk exposure and regulatory compliance indicators</li>
          </ul>
        </CardContent>
      </Card>

      {/* Executive Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Executive Compliance Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`Navigation: Analytics → Compliance → Executive View

┌─────────────────────────────────────────────────────────────────────────────┐
│                    EXECUTIVE COMPLIANCE OVERVIEW                             │
│                    Period: Q1 2026 | Generated: 2026-02-15                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ORGANIZATION COMPLIANCE SCORECARD                                          │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│   │  94.2%   │ │  98.5%   │ │  $12.5K  │ │    3     │ │   LOW    │         │
│   │ Overall  │ │   HSE    │ │ Training │ │Regulatory│ │  Risk    │         │
│   │Compliance│ │Compliance│ │   Cost   │ │  Audits  │ │ Exposure │         │
│   │  ↑ 2.1%  │ │  ↑ 0.5%  │ │  ↓ 8%   │ │  Passed  │ │          │         │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ COMPLIANCE TREND (12 MONTHS)                                         │   │
│   │                                                                       │   │
│   │  100%┤                              ╭────────────╮                   │   │
│   │   95%├───────────╭────────────────╯              │                   │   │
│   │   90%├──────────╯                                 ╰─────             │   │
│   │   85%├────╮                                                          │   │
│   │   80%├────╯                                                          │   │
│   │      └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴  │   │
│   │        M   A   M   J   J   A   S   O   N   D   J   F                 │   │
│   │        2025                                         2026             │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌────────────────────────────────┐ ┌────────────────────────────────┐    │
│   │ BY BUSINESS UNIT               │ │ RISK EXPOSURE SUMMARY          │    │
│   │                                │ │                                │    │
│   │ Corporate HQ        ████ 97%  │ │ ⚠️ 2 Regulatory deadlines      │    │
│   │ Manufacturing       ███░ 95%  │ │    approaching (OSHA, GDPR)    │    │
│   │ Distribution        ███░ 93%  │ │                                │    │
│   │ Retail Operations   ██░░ 88%  │ │ 🔴 1 Business unit below 90%   │    │
│   │ Caribbean Region    ███░ 92%  │ │    (Retail - action required)  │    │
│   │                                │ │                                │    │
│   └────────────────────────────────┘ └────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Executive KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Executive KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KPI</TableHead>
                <TableHead>Definition</TableHead>
                <TableHead>Board Target</TableHead>
                <TableHead>Frequency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Organization Compliance Rate</TableCell>
                <TableCell>% of mandatory training completed on time</TableCell>
                <TableCell><Badge className="bg-green-500">≥ 95%</Badge></TableCell>
                <TableCell>Monthly</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">HSE Compliance Rate</TableCell>
                <TableCell>% of safety-critical training completed</TableCell>
                <TableCell><Badge className="bg-green-500">≥ 98%</Badge></TableCell>
                <TableCell>Monthly</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Regulatory Audit Readiness</TableCell>
                <TableCell>Score based on documentation completeness</TableCell>
                <TableCell><Badge className="bg-green-500">≥ 90%</Badge></TableCell>
                <TableCell>Quarterly</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Training Cost per Employee</TableCell>
                <TableCell>Total training spend / headcount</TableCell>
                <TableCell>Benchmark varies</TableCell>
                <TableCell>Quarterly</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Compliance Risk Exposure</TableCell>
                <TableCell>Aggregate risk score across org</TableCell>
                <TableCell><Badge className="bg-green-500">Low</Badge></TableCell>
                <TableCell>Monthly</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Regulatory Violations</TableCell>
                <TableCell>Count of compliance-related violations</TableCell>
                <TableCell><Badge className="bg-green-500">0</Badge></TableCell>
                <TableCell>Real-time</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Executive Report Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Format</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Monthly Compliance Summary</TableCell>
                <TableCell>C-Suite, HR Director</TableCell>
                <TableCell>Monthly (1st week)</TableCell>
                <TableCell>PDF, PowerPoint</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Quarterly Board Report</TableCell>
                <TableCell>Board of Directors</TableCell>
                <TableCell>Quarterly</TableCell>
                <TableCell>PowerPoint, Excel</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Annual Compliance Review</TableCell>
                <TableCell>Board, Auditors</TableCell>
                <TableCell>Annually</TableCell>
                <TableCell>PDF, Word</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Regulatory Audit Package</TableCell>
                <TableCell>External Auditors</TableCell>
                <TableCell>On-demand</TableCell>
                <TableCell>PDF, Excel, Zip</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Risk Exposure Report</TableCell>
                <TableCell>Risk Committee</TableCell>
                <TableCell>Monthly</TableCell>
                <TableCell>PDF</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">HSE Compliance Report</TableCell>
                <TableCell>Safety Committee, Board</TableCell>
                <TableCell>Monthly</TableCell>
                <TableCell>PDF, PowerPoint</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Automated Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`Navigation: Analytics → Reports → Scheduled Reports → New Executive Report

Step 1: Select Report Template
├── Monthly Compliance Summary
├── Quarterly Board Report
├── Annual Compliance Review
└── Custom Executive Report

Step 2: Configure Scope
├── Companies:        [Select companies in group]
├── Business Units:   [All or specific]
├── Training Types:   [All, Mandatory Only, HSE Only]
└── Time Period:      [Last month, Quarter, Year, Custom]

Step 3: Schedule Delivery
├── Frequency:        Monthly | Quarterly | Annually
├── Delivery Day:     [Day of month/quarter]
├── Time:             [08:00 UTC]
└── Format:           [PDF, PowerPoint, Both]

Step 4: Distribution
├── Email Recipients: [CEO, CFO, CHRO, Board Secretary]
├── CC:              [HR Director, Compliance Officer]
├── Subject Template: "Compliance Report - {period} - {company_name}"
└── Include:         [Executive Summary, Detailed Metrics, Appendix]

Step 5: Review & Activate
├── Preview report with sample data
├── Save as draft or activate immediately
└── Set expiry date (optional)`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Board Presentation Template */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Board Presentation Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`QUARTERLY COMPLIANCE REPORT - BOARD PRESENTATION

Slide 1: Executive Summary
├── Overall compliance rate with trend
├── Key achievements this quarter
├── Areas requiring attention
└── Regulatory update highlights

Slide 2: Compliance Scorecard
├── KPI dashboard with RAG status
├── Comparison to prior quarter
├── Comparison to industry benchmark
└── Target vs actual

Slide 3: Regional/Business Unit Breakdown
├── Compliance by region/BU
├── Top and bottom performers
├── Improvement initiatives
└── Resource requirements

Slide 4: HSE & Safety Compliance
├── Safety training completion rates
├── OSHA/regulatory status
├── Incident-training correlation
└── Certification status

Slide 5: Risk & Compliance Exposure
├── Current risk level
├── Regulatory deadlines
├── Audit findings (if any)
└── Mitigation actions

Slide 6: Recommendations
├── Strategic priorities
├── Resource requests
├── Policy changes needed
└── Next quarter focus`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Executive Report Access Control</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>View</TableHead>
                <TableHead>Create</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Distribute</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Super Admin</TableCell>
                <TableCell><Badge className="bg-green-500">✓</Badge></TableCell>
                <TableCell><Badge className="bg-green-500">✓</Badge></TableCell>
                <TableCell><Badge className="bg-green-500">✓</Badge></TableCell>
                <TableCell><Badge className="bg-green-500">✓</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">HR Director</TableCell>
                <TableCell><Badge className="bg-green-500">✓</Badge></TableCell>
                <TableCell><Badge className="bg-green-500">✓</Badge></TableCell>
                <TableCell><Badge className="bg-green-500">✓</Badge></TableCell>
                <TableCell><Badge className="bg-green-500">✓</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Compliance Officer</TableCell>
                <TableCell><Badge className="bg-green-500">✓</Badge></TableCell>
                <TableCell><Badge className="bg-green-500">✓</Badge></TableCell>
                <TableCell><Badge className="bg-green-500">✓</Badge></TableCell>
                <TableCell><Badge variant="secondary">Limited</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">L&D Admin</TableCell>
                <TableCell><Badge className="bg-green-500">✓</Badge></TableCell>
                <TableCell><Badge className="bg-green-500">✓</Badge></TableCell>
                <TableCell><Badge variant="secondary">Own only</Badge></TableCell>
                <TableCell><Badge variant="destructive">✗</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Department Head</TableCell>
                <TableCell><Badge variant="secondary">Dept only</Badge></TableCell>
                <TableCell><Badge variant="destructive">✗</Badge></TableCell>
                <TableCell><Badge variant="destructive">✗</Badge></TableCell>
                <TableCell><Badge variant="destructive">✗</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Industry Benchmark */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Executive Reporting Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Monthly</div>
              <div className="text-sm text-muted-foreground">C-Suite reporting</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Quarterly</div>
              <div className="text-sm text-muted-foreground">Board reporting</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">5 slides</div>
              <div className="text-sm text-muted-foreground">Max board deck</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1 page</div>
              <div className="text-sm text-muted-foreground">Executive summary</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
