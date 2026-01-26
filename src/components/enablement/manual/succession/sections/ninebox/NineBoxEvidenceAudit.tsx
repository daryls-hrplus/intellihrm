// Section 3.8: Evidence & Audit Trail (NEW)
// Evidence capture, traceability, SOC 2 compliance

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  WarningCallout,
  ComplianceCallout,
  FieldReferenceTable,
  TroubleshootingSection,
  type FieldDefinition,
  type TroubleshootingItem,
} from '../../../components';
import { FileCheck, Shield, History, Eye, Database, AlertTriangle } from 'lucide-react';

const EVIDENCE_SOURCES_FIELDS: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Primary key, auto-generated',
    defaultValue: 'gen_random_uuid()',
  },
  {
    name: 'assessment_id',
    required: true,
    type: 'UUID',
    description: 'Foreign key to nine_box_assessments table',
    validation: 'Must reference valid assessment',
  },
  {
    name: 'company_id',
    required: true,
    type: 'UUID',
    description: 'Foreign key to companies table',
    validation: 'Must reference valid company',
  },
  {
    name: 'axis',
    required: true,
    type: "Text ('performance' | 'potential')",
    description: 'Which Nine-Box axis this evidence applies to',
    validation: "Must be 'performance' or 'potential'",
  },
  {
    name: 'source_type',
    required: true,
    type: 'Text',
    description: 'Type identifier for the evidence source (e.g., appraisal_overall_score, leadership_signals)',
  },
  {
    name: 'source_id',
    required: false,
    type: 'UUID',
    description: 'Optional reference to the actual source record (e.g., appraisal_participant_id)',
  },
  {
    name: 'source_value',
    required: false,
    type: 'Numeric',
    description: 'Normalized score value from this source (0-1 scale)',
  },
  {
    name: 'weight_applied',
    required: false,
    type: 'Numeric',
    description: 'Weight that was applied to this source in the calculation',
  },
  {
    name: 'confidence_score',
    required: false,
    type: 'Numeric',
    description: 'Confidence score for this evidence source (0-1 scale)',
  },
  {
    name: 'contribution_summary',
    required: false,
    type: 'Text',
    description: 'Human-readable description of how this source contributed to the rating',
  },
  {
    name: 'created_at',
    required: true,
    type: 'Timestamp',
    description: 'Record creation timestamp',
    defaultValue: 'now()',
  },
];

const TROUBLESHOOTING_ITEMS: TroubleshootingItem[] = [
  {
    issue: 'No evidence records after saving assessment',
    cause: 'Evidence save failed silently or no sources were available',
    solution: 'Check console for errors; verify rating sources are configured and have data',
  },
  {
    issue: 'Override reason not appearing in evidence',
    cause: 'contribution_summary not populated during override flow',
    solution: 'Ensure notes are entered when overriding; check useSaveNineBoxEvidence hook',
  },
  {
    issue: 'Confidence score shows 0 despite having evidence',
    cause: 'Evidence sources missing confidence_score values',
    solution: 'Verify source data has confidence metrics; check calculation logic',
  },
  {
    issue: 'Historical evidence not matching assessment ratings',
    cause: 'Evidence was captured at assessment time but sources have since changed',
    solution: 'Evidence is a point-in-time snapshot; historical records reflect past state',
  },
];

export function NineBoxEvidenceAudit() {
  return (
    <div className="space-y-8">
      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Understand how evidence is captured and linked to Nine-Box assessments",
          "Review the evidence structure for both auto-calculated and override scenarios",
          "Access the Evidence Panel UI to examine source contributions",
          "Meet SOC 2 audit compliance requirements for talent decisions",
          "Troubleshoot missing or incorrect evidence records"
        ]}
      />

      {/* Navigation Path */}
      <InfoCallout title="Navigation Path">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          Performance → Succession → Nine-Box Grid → [Select Employee] → Evidence & Signals Tab
        </code>
      </InfoCallout>

      {/* Field Reference Table */}
      <FieldReferenceTable
        title="nine_box_evidence_sources Table Schema"
        fields={EVIDENCE_SOURCES_FIELDS}
      />

      {/* Evidence Capture Process */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Evidence Capture on Save
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            When a Nine-Box assessment is saved, the system automatically captures a snapshot 
            of all sources that contributed to the rating calculation. This creates an 
            immutable audit trail.
          </p>

          <div className="p-4 bg-muted/30 rounded-lg font-mono text-sm">
            <pre className="whitespace-pre-wrap">
{`// Evidence capture flow (from useSaveNineBoxEvidence hook)
async function saveAssessmentWithEvidence(params) {
  const {
    assessmentId,
    companyId,
    performanceRating,
    potentialRating,
    isOverridePerformance,
    isOverridePotential,
    overridePerformanceReason,
    overridePotentialReason,
  } = params;

  // Step 1: Delete existing evidence for this assessment
  await supabase
    .from('nine_box_evidence_sources')
    .delete()
    .eq('assessment_id', assessmentId);

  // Step 2: Create evidence records for each source
  const evidenceToInsert = [];

  // Add performance evidence
  if (performanceRating) {
    performanceRating.sources.forEach(source => {
      evidenceToInsert.push({
        assessment_id: assessmentId,
        company_id: companyId,
        axis: 'performance',
        source_type: source.type,
        source_value: source.value,
        weight_applied: source.weight,
        confidence_score: performanceRating.confidence,
        contribution_summary: isOverridePerformance 
          ? \`Override: \${overridePerformanceReason || 'Manual adjustment'}\`
          : \`Auto-calculated from \${source.label}\`,
      });
    });
  }

  // Add potential evidence (similar pattern)
  // ...

  // Step 3: Insert all evidence records
  await supabase
    .from('nine_box_evidence_sources')
    .insert(evidenceToInsert);
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Record Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Evidence Record Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Scenario</th>
                  <th className="text-left py-3 px-4 font-medium">contribution_summary Format</th>
                  <th className="text-left py-3 px-4 font-medium">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-600">Auto-Calculated</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">Auto-calculated from [source label]</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">"Auto-calculated from Appraisal Score"</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-amber-600">Manual Override</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">Override: [user reason]</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">"Override: Recent project success not yet reflected in appraisal"</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge variant="secondary">No Reason Given</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">Override: Manual adjustment</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">"Override: Manual adjustment" (fallback)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Panel UI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Evidence Panel UI Components
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Evidence Panel in the assessment dialog displays source contributions 
            organized by axis, allowing reviewers to understand how ratings were calculated.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Performance Tab</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Appraisal Score contribution</li>
                <li>• Goal Achievement contribution</li>
                <li>• Competency/Technical signals</li>
                <li>• Per-source weight and value</li>
                <li>• Overall confidence badge</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Potential Tab</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Potential Assessment contribution</li>
                <li>• Leadership signals (aggregated)</li>
                <li>• Values & Adaptability signals</li>
                <li>• Bias risk indicators</li>
                <li>• Signal count and confidence</li>
              </ul>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Signal Detail View</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Clicking a signal category expands to show individual signals:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-2 px-3 font-medium">Signal Name</th>
                    <th className="text-left py-2 px-3 font-medium">Score</th>
                    <th className="text-left py-2 px-3 font-medium">Weight</th>
                    <th className="text-left py-2 px-3 font-medium">Confidence</th>
                    <th className="text-left py-2 px-3 font-medium">Bias Risk</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3">Strategic Vision</td>
                    <td className="py-2 px-3">0.82</td>
                    <td className="py-2 px-3">1.0</td>
                    <td className="py-2 px-3">0.85</td>
                    <td className="py-2 px-3"><Badge className="bg-emerald-600 text-xs">Low</Badge></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Team Development</td>
                    <td className="py-2 px-3">0.75</td>
                    <td className="py-2 px-3">1.0</td>
                    <td className="py-2 px-3">0.72</td>
                    <td className="py-2 px-3"><Badge className="bg-amber-600 text-xs">Medium</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SOC 2 Compliance */}
      <ComplianceCallout>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <strong>SOC 2 Audit Compliance</strong>
          </div>
          <p className="text-sm">
            The Nine-Box evidence trail meets SOC 2 Type II requirements for talent 
            decision documentation:
          </p>
          <ul className="text-sm list-disc list-inside space-y-1">
            <li><strong>Traceability:</strong> Every rating linked to specific source data</li>
            <li><strong>Immutability:</strong> Evidence captured at save time, not derived later</li>
            <li><strong>Override Justification:</strong> All manual changes require documented reasons</li>
            <li><strong>Timestamps:</strong> created_at provides audit chronology</li>
            <li><strong>User Attribution:</strong> assessed_by tracks who made the assessment</li>
          </ul>
        </div>
      </ComplianceCallout>

      {/* Historical Evidence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Historical Evidence Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Evidence is preserved for all assessments, including historical ones. This allows 
            auditors and HR to reconstruct why a particular rating was given at any point in time.
          </p>

          <div className="p-4 bg-muted/30 rounded-lg font-mono text-sm">
            <pre className="whitespace-pre-wrap">
{`// Query historical evidence for an assessment
async function getAssessmentEvidence(assessmentId: string) {
  const { data, error } = await supabase
    .from('nine_box_evidence_sources')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('axis')
    .order('created_at');

  if (error) throw error;
  return data as NineBoxEvidenceSource[];
}`}
            </pre>
          </div>

          <WarningCallout title="Evidence is Point-in-Time">
            Evidence reflects the state of source data when the assessment was saved. 
            If underlying sources (appraisals, goals, signals) are later modified, 
            historical evidence remains unchanged—preserving the audit trail.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />

      {/* Best Practices */}
      <TipCallout title="Evidence & Audit Best Practices">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Always review the Evidence Panel before finalizing assessments</li>
          <li>Provide detailed override reasons for future reference</li>
          <li>Use evidence data during calibration to ensure consistency</li>
          <li>Export evidence reports for external audit reviews</li>
          <li>Monitor low-confidence assessments for additional review</li>
          <li>Track override frequency by manager for calibration coaching</li>
        </ul>
      </TipCallout>
    </div>
  );
}
