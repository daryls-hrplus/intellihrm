import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { ClipboardCheck, ArrowRight, Shield, AlertTriangle, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const learningObjectives = [
  'Identify when a DPIA is required for 360 feedback processing',
  'Conduct a structured Data Protection Impact Assessment',
  'Document risk mitigation measures and residual risks',
  'Obtain DPO consultation and supervisory authority guidance when needed'
];

const dpiaTriggers = [
  {
    trigger: 'systematic_evaluation',
    label: 'Systematic Evaluation',
    description: 'Evaluating personal aspects based on automated processing',
    f360Application: '360 feedback scoring, signal extraction, competency ratings',
    required: 'Yes'
  },
  {
    trigger: 'large_scale_special',
    label: 'Large-Scale Special Categories',
    description: 'Processing special category data at scale',
    f360Application: 'Behavioral assessments, performance data (if considered special)',
    required: 'Case-by-case'
  },
  {
    trigger: 'systematic_monitoring',
    label: 'Systematic Monitoring',
    description: 'Systematic monitoring of employees',
    f360Application: 'Continuous feedback cycles, real-time performance tracking',
    required: 'Yes'
  },
  {
    trigger: 'innovative_technology',
    label: 'Innovative Technology',
    description: 'Using new technologies for data processing',
    f360Application: 'AI-powered analysis, sentiment detection, bias detection',
    required: 'Yes'
  },
  {
    trigger: 'profiling_significant_effect',
    label: 'Profiling with Significant Effect',
    description: 'Profiling that significantly affects individuals',
    f360Application: 'Succession planning signals, readiness scoring, talent flags',
    required: 'Yes'
  }
];

const dpiaFields: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Unique identifier for the DPIA record',
    defaultValue: 'gen_random_uuid()',
    validation: 'Auto-generated'
  },
  {
    name: 'company_id',
    required: true,
    type: 'UUID',
    description: 'Reference to the company',
    validation: 'Must exist in companies table'
  },
  {
    name: 'assessment_name',
    required: true,
    type: 'text',
    description: 'Name of the DPIA',
    validation: 'Descriptive title for the assessment'
  },
  {
    name: 'processing_description',
    required: true,
    type: 'text',
    description: 'Description of the processing activity',
    validation: 'Detailed description of what, how, and why'
  },
  {
    name: 'data_categories',
    required: false,
    type: 'JSONB',
    description: 'Categories of personal data processed',
    validation: 'JSON array of data types'
  },
  {
    name: 'processing_purposes',
    required: false,
    type: 'JSONB',
    description: 'Purposes for the processing',
    validation: 'JSON array of purposes'
  },
  {
    name: 'necessity_assessment',
    required: false,
    type: 'text',
    description: 'Assessment of necessity and proportionality',
    validation: 'Why this processing is necessary'
  },
  {
    name: 'risk_assessment',
    required: false,
    type: 'JSONB',
    description: 'Identified risks with likelihood, severity, and mitigation',
    validation: 'JSON array of risk objects'
  },
  {
    name: 'residual_risk_level',
    required: true,
    type: 'text',
    description: 'Risk level after mitigation measures',
    defaultValue: 'medium',
    validation: 'One of: low, medium, high, critical'
  },
  {
    name: 'dpo_consultation_date',
    required: false,
    type: 'date',
    description: 'When DPO was consulted',
    validation: 'Required before approval'
  },
  {
    name: 'dpo_recommendation',
    required: false,
    type: 'text',
    description: 'DPO recommendation and advice',
    validation: 'DPO input documented'
  },
  {
    name: 'supervisory_consultation_required',
    required: true,
    type: 'boolean',
    description: 'Whether prior consultation with supervisory authority is required',
    defaultValue: 'false',
    validation: 'Required when residual risk is high/critical'
  },
  {
    name: 'approval_status',
    required: true,
    type: 'text',
    description: 'Current approval status',
    defaultValue: 'draft',
    validation: 'One of: draft, pending_review, pending_dpo, approved, rejected, requires_update'
  },
  {
    name: 'next_review_date',
    required: false,
    type: 'date',
    description: 'Scheduled date for next DPIA review',
    validation: 'Typically annual or on significant change'
  },
  {
    name: 'version',
    required: true,
    type: 'integer',
    description: 'Version number of the assessment',
    defaultValue: '1',
    validation: 'Incremented on each revision'
  }
];

const dpiaSteps: Step[] = [
  {
    title: 'Determine DPIA Necessity',
    description: 'Assess whether a DPIA is required for the processing activity.',
    substeps: [
      'Check if processing matches any DPIA trigger criteria',
      'Consider whether processing involves profiling or automated decisions',
      'Evaluate scale and scope of processing',
      'Document the necessity decision with reasoning'
    ],
    expectedResult: 'Clear determination whether DPIA is required'
  },
  {
    title: 'Describe the Processing',
    description: 'Document the proposed processing in detail.',
    substeps: [
      'Define what personal data will be processed',
      'Describe how data will be collected and used',
      'Identify data recipients and retention periods',
      'Map data flows including any cross-border transfers'
    ],
    expectedResult: 'Complete processing description documented'
  },
  {
    title: 'Assess Necessity and Proportionality',
    description: 'Evaluate whether processing is necessary and proportionate.',
    substeps: [
      'Confirm lawful basis for processing',
      'Assess whether processing achieves the intended purpose',
      'Consider less intrusive alternatives',
      'Evaluate data minimization compliance'
    ],
    expectedResult: 'Necessity and proportionality assessment complete'
  },
  {
    title: 'Identify and Assess Risks',
    description: 'Identify risks to data subject rights and freedoms.',
    substeps: [
      'List potential risks (bias, discrimination, privacy, security)',
      'Assess likelihood of each risk (unlikely, possible, likely)',
      'Assess severity of each risk (minor, significant, severe)',
      'Calculate risk level: likelihood × severity'
    ],
    expectedResult: 'Risk register with likelihood and severity scores'
  },
  {
    title: 'Identify Mitigation Measures',
    description: 'Define measures to address identified risks.',
    substeps: [
      'For each risk, identify mitigating controls',
      'Document technical measures (encryption, access controls)',
      'Document organizational measures (policies, training)',
      'Assess residual risk after mitigation'
    ],
    expectedResult: 'Mitigation measures documented with residual risk levels'
  },
  {
    title: 'Consult DPO',
    description: 'Obtain Data Protection Officer input.',
    substeps: [
      'Submit DPIA to DPO for review',
      'Incorporate DPO recommendations',
      'Document DPO consultation date and advice',
      'Update DPIA based on DPO feedback'
    ],
    expectedResult: 'DPO consultation complete and documented'
  },
  {
    title: 'Seek Supervisory Authority Consultation (if required)',
    description: 'Consult supervisory authority when residual risk remains high.',
    substeps: [
      'Determine if prior consultation is required (GDPR Article 36)',
      'Prepare consultation submission',
      'Submit to supervisory authority and await response',
      'Incorporate authority guidance into processing plans'
    ],
    expectedResult: 'Supervisory authority consultation complete (if required)'
  },
  {
    title: 'Approve and Schedule Review',
    description: 'Finalize DPIA and plan for ongoing review.',
    substeps: [
      'Obtain final approval from accountable owner',
      'Set next_review_date (typically annual)',
      'Communicate DPIA outcome to stakeholders',
      'Monitor for changes that would require DPIA update'
    ],
    expectedResult: 'DPIA approved with scheduled review date'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'DPIA required before AI features are enabled',
    enforcement: 'System',
    description: 'AI analysis, signal extraction, and automated insights require approved DPIA'
  },
  {
    rule: 'DPO consultation is mandatory',
    enforcement: 'System',
    description: 'Cannot approve DPIA without documented DPO consultation'
  },
  {
    rule: 'High residual risk requires supervisory consultation',
    enforcement: 'Policy',
    description: 'When residual risk remains high after mitigation, consult supervisory authority'
  },
  {
    rule: 'DPIA must be reviewed annually or on significant change',
    enforcement: 'System',
    description: 'System alerts when review_due_date approaches or processing changes'
  },
  {
    rule: 'Version history must be maintained',
    enforcement: 'System',
    description: 'Each revision creates new version; previous versions preserved for audit'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Unclear whether DPIA is required',
    cause: 'Processing does not clearly match trigger criteria',
    solution: 'When in doubt, conduct DPIA. Document the reasoning. Consider if processing could affect data subject rights. Consult DPO for guidance.'
  },
  {
    issue: 'Residual risk remains high after all mitigations',
    cause: 'Nature of processing inherently carries risk',
    solution: 'Consult supervisory authority per GDPR Article 36. Consider whether processing should proceed. Document decision rationale. Implement enhanced monitoring.'
  },
  {
    issue: 'DPIA needs update but processing already underway',
    cause: 'Significant change occurred without DPIA review',
    solution: 'Pause new processing aspects if possible. Conduct expedited DPIA update. Document gap and remediation. Assess if breach has occurred.'
  },
  {
    issue: 'Stakeholders resist implementing mitigation measures',
    cause: 'Measures perceived as too costly or disruptive',
    solution: 'Explain regulatory requirement and potential fines. Quantify risk of non-compliance. Escalate to senior management. Document any accepted risks.'
  }
];

export function GovernanceDPIA() {
  return (
    <section id="sec-4-14" data-manual-anchor="sec-4-14" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          4.14 Data Protection Impact Assessment (DPIA)
        </h3>
        <p className="text-muted-foreground mt-2">
          GDPR Article 35 compliance: conducting DPIAs for high-risk 360 feedback processing including AI analysis and automated decision-making.
        </p>
      </div>

      {/* Industry Standard Badge */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">Industry Standard: GDPR Article 35</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          This section implements DPIA requirements per GDPR and aligns with ISO 42001 AI risk assessment 
          for responsible use of AI in 360 feedback systems.
        </AlertDescription>
      </Alert>

      <LearningObjectives objectives={learningObjectives} />

      {/* AI DPIA Alert */}
      <Alert variant="destructive" className="border-amber-500 bg-amber-50 dark:bg-amber-950">
        <Brain className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">AI Features Require DPIA</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          Before enabling AI-powered features (signal extraction, bias detection, sentiment analysis, readiness scoring), 
          a DPIA must be completed and approved. This applies to new AI features and significant changes to existing ones.
        </AlertDescription>
      </Alert>

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2">Navigation Path</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Performance</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">360 Feedback</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Governance</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Impact Assessments</span>
          </div>
        </CardContent>
      </Card>

      {/* DPIA Triggers Table */}
      <div>
        <h4 className="font-medium mb-4">DPIA Trigger Criteria for 360 Feedback</h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-medium">Trigger</TableHead>
                <TableHead className="font-medium">Description</TableHead>
                <TableHead className="font-medium">360 Feedback Application</TableHead>
                <TableHead className="font-medium">DPIA Required?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dpiaTriggers.map((trigger) => (
                <TableRow key={trigger.trigger}>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{trigger.trigger}</code>
                    <p className="text-xs text-muted-foreground mt-1">{trigger.label}</p>
                  </TableCell>
                  <TableCell className="text-sm max-w-xs">{trigger.description}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">{trigger.f360Application}</TableCell>
                  <TableCell>
                    <Badge 
                      className={trigger.required === 'Yes' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-amber-500 text-white'
                      }
                    >
                      {trigger.required}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* DPIA Process Diagram */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">DPIA Process Flow</h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────┐
│                    DPIA PROCESS FLOW                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐    ┌──────────┐    ┌───────────┐    ┌───────────────┐   │
│  │  DRAFT   │ ─▶ │ PENDING  │ ─▶ │ PENDING   │ ─▶ │   APPROVED    │   │
│  │          │    │  REVIEW  │    │   DPO     │    │               │   │
│  └──────────┘    └──────────┘    └───────────┘    └───────────────┘   │
│       │                                                  │              │
│       │                                                  ▼              │
│       │                                          ┌───────────────┐     │
│       │                                          │ ANNUAL REVIEW │     │
│       │                                          │  (Ongoing)    │     │
│       │                                          └───────────────┘     │
│       │                                                                 │
│       ▼                                                                 │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ DPIA CONTENT CHECKLIST                                            │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ ✓ Processing description (what, how, why)                         │ │
│  │ ✓ Necessity and proportionality assessment                        │ │
│  │ ✓ Risk identification (likelihood × severity)                     │ │
│  │ ✓ Mitigation measures                                             │ │
│  │ ✓ Residual risk assessment                                        │ │
│  │ ✓ DPO consultation                                                │ │
│  │ ✓ Supervisory consultation (if residual risk high)                │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  RISK MATRIX:                                                           │
│  ─────────────                                                          │
│                 │ Minor     │ Significant │ Severe                     │
│  ───────────────┼───────────┼─────────────┼──────────                  │
│  Unlikely       │ LOW       │ LOW         │ MEDIUM                     │
│  Possible       │ LOW       │ MEDIUM      │ HIGH                       │
│  Likely         │ MEDIUM    │ HIGH        │ CRITICAL                   │
│                                                                         │
│  ⚠️ HIGH/CRITICAL: Consult supervisory authority before processing     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <StepByStep 
        steps={dpiaSteps} 
        title="Conducting a Data Protection Impact Assessment" 
      />

      <FieldReferenceTable 
        fields={dpiaFields} 
        title="DPIA Record Schema (feedback_dpia_records)" 
      />

      <BusinessRules rules={businessRules} />

      <TroubleshootingSection 
        items={troubleshootingItems} 
        title="DPIA Process Issues" 
      />
    </section>
  );
}
