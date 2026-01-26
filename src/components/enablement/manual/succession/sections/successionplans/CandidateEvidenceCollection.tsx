import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { 
  FileCheck, 
  Settings, 
  ChevronRight, 
  CheckCircle,
  Info,
  Grid3x3,
  TrendingUp,
  Upload
} from 'lucide-react';

export function CandidateEvidenceCollection() {
  const candidateEvidenceFields: FieldDefinition[] = [
    { name: 'id', required: true, type: 'UUID', description: 'Primary key, auto-generated', validation: 'System-assigned' },
    { name: 'candidate_id', required: false, type: 'UUID', description: 'Reference to succession candidate', validation: 'Recommended but nullable' },
    { name: 'company_id', required: false, type: 'UUID', description: 'Reference to company', validation: 'Recommended but nullable' },
    { name: 'evidence_type', required: true, type: 'Text', description: 'Source type of the evidence', validation: 'nine_box, signal_snapshot, manual' },
    { name: 'source_snapshot_id', required: false, type: 'UUID', description: 'Reference to talent_signal_snapshots', validation: 'Required if evidence_type is signal_snapshot' },
    { name: 'source_nine_box_id', required: false, type: 'UUID', description: 'Reference to nine_box_assessments', validation: 'Required if evidence_type is nine_box' },
    { name: 'signal_summary', required: false, type: 'JSONB', description: 'Aggregated talent signal data and scores' },
    { name: 'leadership_indicators', required: false, type: 'JSONB', description: 'Leadership-specific behavioral indicators' },
    { name: 'readiness_contribution', required: false, type: 'Numeric', description: 'How this evidence contributes to readiness score', validation: '0-100' },
    { name: 'created_at', required: false, type: 'Timestamp', description: 'Record creation timestamp', defaultValue: 'now()' }
  ];

  const evidenceTypes = [
    { type: 'Nine-Box', icon: Grid3x3, description: 'Performance and potential ratings from Nine-Box assessment', source: 'nine_box_assessments table', color: 'bg-blue-500' },
    { type: 'Signal Snapshot', icon: TrendingUp, description: 'Point-in-time capture of talent signals and indicators', source: 'talent_signal_snapshots table', color: 'bg-green-500' },
    { type: 'Manual', icon: Upload, description: 'Manually uploaded evidence documents or notes', source: 'User input', color: 'bg-amber-500' }
  ];

  const viewEvidenceSteps: Step[] = [
    {
      title: 'Navigate to Candidate Evidence',
      description: 'Access the candidate\'s evidence collection.',
      substeps: [
        'Go to Performance → Succession → Succession Plans',
        'Click on the succession plan containing the candidate',
        'Click on the candidate to open their profile',
        'Navigate to the "Evidence" tab'
      ],
      expectedResult: 'Candidate evidence collection is displayed'
    },
    {
      title: 'Review Evidence Summary',
      description: 'View the aggregated evidence for the candidate.',
      substeps: [
        'Review the evidence cards showing each piece of evidence',
        'Check evidence type badges: Nine-Box, Signal Snapshot, Manual',
        'View the readiness contribution score for each evidence item'
      ],
      expectedResult: 'Evidence summary is visible with contribution scores'
    },
    {
      title: 'View Evidence Details',
      description: 'Drill into specific evidence items.',
      substeps: [
        'Click on an evidence card to view details',
        'For Nine-Box: see performance and potential ratings',
        'For Signal Snapshot: see individual signal scores and trends',
        'For Manual: view uploaded documents or entered notes'
      ],
      expectedResult: 'Detailed evidence information is displayed'
    },
    {
      title: 'Review Leadership Indicators',
      description: 'Examine leadership-specific behavioral evidence.',
      substeps: [
        'Locate the Leadership Indicators section',
        'Review indicators such as: Decision Quality, Strategic Thinking, Team Leadership',
        'Note the source of each indicator rating'
      ],
      expectedResult: 'Leadership indicators are reviewed'
    }
  ];

  const addManualEvidenceSteps: Step[] = [
    {
      title: 'Add Manual Evidence',
      description: 'Upload or document evidence manually.',
      substeps: [
        'Click "Add Evidence" in the Evidence tab',
        'Select "Manual" as the evidence type',
        'Enter a description of the evidence',
        'Optionally upload supporting documents'
      ],
      expectedResult: 'Manual evidence form is open'
    },
    {
      title: 'Document Evidence Details',
      description: 'Provide context for the evidence.',
      substeps: [
        'Enter evidence title and description',
        'Specify the date the evidence was observed or collected',
        'Note the source or witness of the evidence'
      ],
      expectedResult: 'Evidence details are documented'
    },
    {
      title: 'Set Readiness Contribution',
      description: 'Indicate how strongly this evidence supports readiness.',
      substeps: [
        'Set the readiness contribution score (0-100)',
        'Higher scores indicate stronger evidence of readiness',
        'Consider the relevance and recency of the evidence'
      ],
      expectedResult: 'Readiness contribution is set'
    },
    {
      title: 'Save Evidence',
      description: 'Save the manual evidence record.',
      substeps: [
        'Review all entered information',
        'Click "Save" to add the evidence',
        'Evidence appears in the candidate\'s evidence collection'
      ],
      expectedResult: 'Manual evidence is saved and visible'
    }
  ];

  const businessRules: BusinessRule[] = [
    { rule: 'Candidate recommended', enforcement: 'Advisory', description: 'Evidence should be linked to a succession candidate for tracking; nullable in DB.' },
    { rule: 'Evidence type required', enforcement: 'System', description: 'Each evidence record must have a type: nine_box, signal_snapshot, or manual.' },
    { rule: 'Source reference', enforcement: 'System', description: 'Nine-Box and Signal Snapshot types require the corresponding source ID.' },
    { rule: 'Auto-collection', enforcement: 'System', description: 'Nine-Box and Signal Snapshot evidence is automatically collected when assessments complete.' },
    { rule: 'Contribution validation', enforcement: 'System', description: 'Readiness contribution must be between 0 and 100.' },
    { rule: 'Immutable records', enforcement: 'System', description: 'Evidence records are typically immutable; new evidence is added rather than editing existing.' }
  ];

  return (
    <section id="sec-6-9" data-manual-anchor="sec-6-9" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">6.9 Candidate Evidence Collection</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Document accomplishments and readiness evidence for candidates
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Understand the three types of candidate evidence: Nine-Box, Signal Snapshot, Manual',
          'Review aggregated evidence for succession candidates',
          'Add manual evidence to supplement automated collection',
          'Interpret readiness contribution scores'
        ]}
      />

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-primary" />
            <span className="font-medium">Navigation:</span>
            <Badge variant="outline">Performance</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Succession</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Candidate</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">Evidence</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileCheck className="h-5 w-5 text-primary" />
            Evidence Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Candidate evidence comes from three sources, providing a comprehensive view of readiness.
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            {evidenceTypes.map((item) => (
              <div key={item.type} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${item.color}/10 flex items-center justify-center`}>
                    <item.icon className={`h-4 w-4 ${item.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h5 className="font-medium text-sm">{item.type}</h5>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                <Badge variant="outline" className="text-xs">{item.source}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileCheck className="h-5 w-5 text-primary" />
            succession_candidate_evidence Table Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={candidateEvidenceFields} />
        </CardContent>
      </Card>

      {/* Step-by-Step: View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            View Candidate Evidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={viewEvidenceSteps} title="" />
        </CardContent>
      </Card>

      {/* Step-by-Step: Add Manual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5 text-primary" />
            Add Manual Evidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={addManualEvidenceSteps} title="" />
        </CardContent>
      </Card>

      {/* Implementation Status Note */}
      <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="pt-4">
          <p className="text-sm text-foreground flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Implementation Note:</strong> Manual evidence upload functionality is currently 
              in development. The <code className="bg-muted mx-1 px-1 rounded text-xs">succession_candidate_evidence</code> 
              table supports manual evidence types, but the UI form for adding manual evidence is pending 
              implementation. Currently, evidence is automatically collected from Nine-Box Assessments 
              (when completed) and Talent Signal Snapshots (when captured).
            </span>
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evidence Summary Display
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The evidence summary shows all collected evidence with readiness contribution scores.
          </p>

          {/* Simulated Evidence Summary */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-3 bg-muted border-b">
              <span className="font-medium text-sm">Evidence Collection Summary</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="p-3 border rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Grid3x3 className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium">Nine-Box Assessment Q3 2024</h5>
                    <p className="text-xs text-muted-foreground">High Performance / High Potential (Box 1)</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">+85 contribution</Badge>
              </div>
              <div className="p-3 border rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium">Talent Signal Snapshot</h5>
                    <p className="text-xs text-muted-foreground">12 signals captured, 8 leadership indicators</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">+72 contribution</Badge>
              </div>
              <div className="p-3 border rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Upload className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium">Board Presentation Recognition</h5>
                    <p className="text-xs text-muted-foreground">CEO commendation for strategic initiative</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">+45 contribution</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <BusinessRules rules={businessRules} />

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Evidence Collection Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Rely primarily on system-generated evidence (Nine-Box, Signals) for objectivity',
              'Add manual evidence for significant accomplishments not captured elsewhere',
              'Include specific, measurable accomplishments rather than general statements',
              'Document the source and date of evidence for credibility',
              'Review evidence collection during succession planning meetings',
              'Ensure evidence is recent (within 12-18 months) for relevance'
            ].map((practice, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Industry Context */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="pt-4">
          <p className="text-sm text-foreground flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Industry Benchmark:</strong> Evidence-based succession decisions reduce 
              promotion failures by 40% and improve new leader time-to-productivity by 30% 
              (McKinsey Leadership Development Study 2024).
            </span>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
