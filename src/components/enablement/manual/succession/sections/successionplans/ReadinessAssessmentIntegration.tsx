import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { 
  ClipboardCheck, 
  Settings, 
  ChevronRight, 
  CheckCircle,
  Info,
  Link,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export function ReadinessAssessmentIntegration() {
  const assessmentWorkflow = [
    { stage: 'Candidate Added', desc: 'Employee nominated to plan' },
    { stage: 'Event Created', desc: 'Assessment initiated in Ch 4 workflow' },
    { stage: 'Assessors Respond', desc: 'Manager, HR, Executive assess' },
    { stage: 'Score Calculated', desc: 'Weighted average computed' },
    { stage: 'Candidate Updated', desc: 'Score and band synced to candidate' }
  ];

  const syncedFields = [
    { field: 'latest_readiness_score', source: 'readiness_assessment_events.overall_score', description: 'Numeric score from latest assessment' },
    { field: 'latest_readiness_band', source: 'readiness_assessment_events.readiness_band_id → band name', description: 'Readiness band label (Ready Now, etc.)' },
    { field: 'readiness_assessed_at', source: 'readiness_assessment_events.completed_at', description: 'When assessment was completed' }
  ];

  const businessRules: BusinessRule[] = [
    { rule: 'Chapter 4 workflow', enforcement: 'Policy', description: 'Readiness assessment workflow is documented in Chapter 4 (Readiness Assessment Workflow).' },
    { rule: 'Automatic sync', enforcement: 'System', description: 'When an assessment event completes, candidate record is automatically updated.' },
    { rule: 'One active assessment', enforcement: 'System', description: 'Only one readiness assessment event can be active per candidate at a time.' },
    { rule: 'Historical retention', enforcement: 'System', description: 'Previous assessment events are retained for audit; only latest values sync to candidate.' },
    { rule: 'Band determines readiness_level', enforcement: 'System', description: 'The readiness_level field can be updated to match the assessed band.' },
    { rule: 'Workflow approval optional', enforcement: 'Policy', description: 'SUCCESSION_READINESS_APPROVAL workflow can be enabled for assessment completion.' }
  ];

  return (
    <section id="sec-6-6" data-manual-anchor="sec-6-6" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">6.6 Readiness Assessment Integration</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Link candidate assessments to Chapter 4 readiness workflow
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Understand how readiness assessments link to succession candidates',
          'Trace the data flow from assessment completion to candidate update',
          'Identify the fields synced from assessment events to candidates',
          'Configure the SUCCESSION_READINESS_APPROVAL workflow'
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
            <Badge variant="outline">Succession Plans</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Candidate</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">Readiness Assessment</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cross-Reference */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="pt-4">
          <p className="text-sm text-foreground flex items-start gap-2">
            <Link className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Cross-Reference:</strong> The readiness assessment workflow is fully documented 
              in <strong>Chapter 4: Readiness Assessment Workflow</strong>. This section covers 
              only the integration between assessments and succession candidates.
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Integration Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <RefreshCw className="h-5 w-5 text-primary" />
            Assessment-to-Candidate Integration Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            When a readiness assessment completes for a succession candidate, the results 
            are automatically synced to the candidate record.
          </p>
          
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {assessmentWorkflow.map((item, index, arr) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <span className="text-xs font-medium text-center">{item.stage}</span>
                  <span className="text-[10px] text-muted-foreground text-center mt-1">
                    {item.desc}
                  </span>
                </div>
                {index < arr.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Synced Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Synced Fields Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            These fields on the <code className="text-xs bg-muted px-1 rounded">succession_candidates</code> 
            table are automatically updated when an assessment completes.
          </p>

          <div className="space-y-3">
            {syncedFields.map((item) => (
              <div key={item.field} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono text-xs">{item.field}</Badge>
                </div>
                <div className="grid gap-2 md:grid-cols-2 text-xs">
                  <div>
                    <span className="font-medium">Source:</span>
                    <p className="text-muted-foreground font-mono">{item.source}</p>
                  </div>
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Trigger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            SUCCESSION_READINESS_APPROVAL Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Organizations can optionally require approval for readiness assessment completion. 
            This is configured via the transaction workflow settings.
          </p>

          <div className="p-4 border rounded-lg bg-muted/50">
            <h5 className="font-medium text-sm mb-2">Enable Approval Workflow</h5>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Navigate to HR Hub → Settings → Transaction Workflow Settings</li>
              <li>Locate the SUCC_READINESS_APPROVAL transaction type</li>
              <li>Toggle "Requires Workflow" to ON</li>
              <li>Select SUCCESSION_READINESS_APPROVAL template</li>
            </ol>
          </div>

          <div className="p-3 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 rounded-r-lg">
            <p className="text-sm text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> When workflow is enabled, the candidate record is not 
                updated until the approval workflow completes. This ensures HR review before 
                readiness levels are officially recorded.
              </span>
            </p>
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
            Assessment Integration Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Schedule readiness assessments annually or when candidate circumstances change significantly',
              'Ensure all designated assessors complete their portion before the deadline',
              'Review assessment results in succession planning meetings before finalizing',
              'Use the readiness band to update development plan priorities',
              'Monitor the time since last assessment (readiness_assessed_at) for staleness'
            ].map((practice, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
