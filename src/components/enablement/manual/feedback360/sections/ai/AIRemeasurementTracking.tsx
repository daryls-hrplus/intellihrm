import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { RefreshCw, Calendar, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const learningObjectives = [
  'Understand when and why to schedule remeasurement',
  'Configure remeasurement plans with focus areas',
  'Compare progress between measurement cycles',
  'Choose between pulse, manager check, and full 360'
];

const measurementTypes = [
  {
    type: 'full_360',
    icon: '🔄',
    duration: '3-4 weeks',
    questions: '15-40 questions',
    raters: 'All categories (Manager, Peer, DR, Self)',
    useCase: 'Annual comprehensive assessment',
    effort: 'High'
  },
  {
    type: 'pulse',
    icon: '⚡',
    duration: '1 week',
    questions: '5-7 questions',
    raters: 'Subset (Manager + 2-3 peers)',
    useCase: 'Quarterly progress check on specific themes',
    effort: 'Low'
  },
  {
    type: 'manager_check',
    icon: '👤',
    duration: '1-2 days',
    questions: '3-5 questions',
    raters: 'Manager only',
    useCase: 'Monthly development conversation input',
    effort: 'Minimal'
  }
];

const remeasurementFields: FieldDefinition[] = [
  {
    name: 'source_cycle_id',
    required: false,
    type: 'UUID',
    description: 'Original 360 cycle being followed up',
    defaultValue: 'null',
    validation: 'Valid cycle ID'
  },
  {
    name: 'focus_areas',
    required: false,
    type: 'JSONB',
    description: 'Specific themes, signals, or competencies to remeasure',
    defaultValue: 'null',
    validation: 'Valid JSON with themes/signals/competencies arrays'
  },
  {
    name: 'scheduled_date',
    required: true,
    type: 'date',
    description: 'When the remeasurement cycle should launch',
    defaultValue: '—',
    validation: 'Future date'
  },
  {
    name: 'measurement_type',
    required: true,
    type: 'enum',
    description: 'Type of measurement: full_360, pulse, manager_check',
    defaultValue: 'pulse',
    validation: 'Valid type'
  },
  {
    name: 'status',
    required: true,
    type: 'enum',
    description: 'Current status: scheduled, in_progress, completed, cancelled',
    defaultValue: 'scheduled',
    validation: 'Valid status'
  }
];

const createPlanSteps: Step[] = [
  {
    title: 'Access Remeasurement Planning',
    description: 'Navigate to your development themes or IDP.',
    substeps: [
      'Go to ESS → My Development → Remeasurement Plans',
      'Or access from a linked IDP goal with 360 context',
      'Click "Create Remeasurement Plan"'
    ],
    expectedResult: 'Remeasurement planning wizard opens'
  },
  {
    title: 'Select Focus Areas',
    description: 'Choose what to measure in the follow-up.',
    substeps: [
      'Select from confirmed development themes',
      'Or choose specific competencies/signals',
      'AI suggests based on development priorities'
    ],
    expectedResult: 'Focus areas selected and summarized'
  },
  {
    title: 'Choose Measurement Type',
    description: 'Select appropriate assessment depth.',
    substeps: [
      'Full 360: Comprehensive annual follow-up',
      'Pulse: Quick quarterly check (recommended)',
      'Manager Check: Lightweight monthly input'
    ],
    expectedResult: 'Measurement type configured'
  },
  {
    title: 'Schedule and Confirm',
    description: 'Set the timing and finalize the plan.',
    substeps: [
      'Select scheduled date (recommend 6-12 months from original)',
      'Review plan summary',
      'Click "Create Plan"'
    ],
    expectedResult: 'Remeasurement plan saved; reminders scheduled'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Cannot create remeasurement plan',
    cause: 'No completed 360 cycle or no confirmed themes',
    solution: 'Remeasurement requires a baseline. Complete a 360 cycle and confirm themes first.'
  },
  {
    issue: 'Scheduled remeasurement not launching',
    cause: 'System job may have failed or date passed',
    solution: 'Contact HR to check automation status or manually initiate the cycle.'
  },
  {
    issue: 'Progress comparison not available',
    cause: 'Different questions or competencies between cycles',
    solution: 'Comparison requires matching questions. Review cycle configurations.'
  }
];

export function AIRemeasurementTracking() {
  return (
    <section id="sec-5-10" data-manual-anchor="sec-5-10" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          5.10 Remeasurement & Progress Tracking
        </h3>
        <p className="text-muted-foreground mt-2">
          AI-recommended follow-up assessments to track development progress and validate improvement.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Navigation Path */}
      <div className="p-3 bg-muted rounded-lg">
        <span className="text-sm font-medium">Navigation Path: </span>
        <span className="text-sm text-muted-foreground">
          ESS → My Development → Remeasurement Plans
        </span>
      </div>

      {/* Remeasurement Flow */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4" />
            Remeasurement Lifecycle
          </h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                    REMEASUREMENT LIFECYCLE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐                                                         │
│  │ Initial 360    │                                                         │
│  │ Cycle Complete │                                                         │
│  └───────┬────────┘                                                         │
│          │                                                                   │
│          ▼                                                                   │
│  ┌────────────────┐     ┌────────────────┐                                 │
│  │ Development    │────▶│ IDP Goals      │                                 │
│  │ Themes         │     │ Created/Linked │                                 │
│  │ Confirmed      │     │                │                                 │
│  └───────┬────────┘     └───────┬────────┘                                 │
│          │                      │                                           │
│          └──────────┬───────────┘                                           │
│                     │                                                        │
│                     ▼                                                        │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │              REMEASUREMENT PLAN                                 │        │
│  │  • Focus areas: specific themes/competencies                   │        │
│  │  • Measurement type: full_360 / pulse / manager_check          │        │
│  │  • Scheduled date: 6-12 months recommended                     │        │
│  └───────────────────────────┬────────────────────────────────────┘        │
│                              │                                              │
│                              │ (scheduled_date arrives)                     │
│                              ▼                                              │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │              FOLLOW-UP ASSESSMENT                               │        │
│  │  • Targeted questions on focus areas                           │        │
│  │  • Same raters or subset based on type                         │        │
│  │  • Completion tracked                                          │        │
│  └───────────────────────────┬────────────────────────────────────┘        │
│                              │                                              │
│                              ▼                                              │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │              PROGRESS COMPARISON                                │        │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │        │
│  │  │ Baseline    │ vs │ Current     │ =  │ Change Δ    │        │        │
│  │  │ Score       │    │ Score       │    │ (+/-/=)     │        │        │
│  │  └─────────────┘    └─────────────┘    └─────────────┘        │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Measurement Types */}
      <div>
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <Target className="h-4 w-4" />
          Measurement Types
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          {measurementTypes.map((m) => (
            <Card key={m.type}>
              <CardContent className="pt-4">
                <div className="text-center mb-3">
                  <span className="text-3xl">{m.icon}</span>
                  <div className="mt-2">
                    <Badge variant="outline">{m.type.replace('_', ' ')}</Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{m.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Questions:</span>
                    <span>{m.questions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Effort:</span>
                    <Badge variant={m.effort === 'High' ? 'destructive' : m.effort === 'Low' ? 'secondary' : 'outline'}>
                      {m.effort}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    <strong>Use case:</strong> {m.useCase}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Progress Comparison Example */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4" />
            Progress Comparison View (Example)
          </h4>
          <div className="space-y-4">
            {[
              { theme: 'Communication Clarity', baseline: 3.2, current: 3.8, change: '+0.6' },
              { theme: 'Delegation Skills', baseline: 2.8, current: 3.4, change: '+0.6' },
              { theme: 'Strategic Thinking', baseline: 3.9, current: 3.7, change: '-0.2' }
            ].map((item) => (
              <div key={item.theme} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{item.theme}</p>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Baseline: {item.baseline}</span>
                    <span>Current: {item.current}</span>
                  </div>
                </div>
                <Badge className={
                  item.change.startsWith('+') ? 'bg-green-500' :
                  item.change.startsWith('-') ? 'bg-red-500' : 'bg-gray-500'
                }>
                  {item.change}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StepByStep steps={createPlanSteps} title="Creating a Remeasurement Plan" />

      <FieldReferenceTable 
        fields={remeasurementFields} 
        title="Remeasurement Plan Fields (feedback_remeasurement_plans)" 
      />

      <TroubleshootingSection items={troubleshootingItems} />

      {/* Tip Callout */}
      <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
        <div className="flex items-start gap-2">
          <RefreshCw className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h5 className="font-medium text-sm">Pulse Checks Are Your Friend</h5>
            <p className="text-sm text-muted-foreground mt-1">
              Pulse measurements (5-7 targeted questions) provide quick progress validation without 
              survey fatigue. Use them quarterly to maintain momentum on development priorities. 
              Reserve full 360s for annual comprehensive assessment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
