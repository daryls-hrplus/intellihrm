import { LearningObjectives } from '../../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { TrendingDown, Activity, AlertTriangle, BarChart3, Shield, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const learningObjectives = [
  'Understand what model performance drift is and why it matters',
  'Monitor confidence score trends across AI features',
  'Configure drift detection thresholds',
  'Respond to drift alerts appropriately'
];

const driftFields: FieldDefinition[] = [
  {
    name: 'performance_drift_score',
    required: false,
    type: 'decimal',
    description: 'Calculated drift from baseline performance (0 = no drift, 1 = complete drift)',
    defaultValue: 'null',
    validation: '0.0 - 1.0'
  },
  {
    name: 'drift_threshold_breached',
    required: false,
    type: 'boolean',
    description: 'Whether the drift score exceeds configured threshold',
    defaultValue: 'false',
    validation: 'Boolean'
  },
  {
    name: 'model_version',
    required: false,
    type: 'text',
    description: 'Version of AI model for this metric period',
    defaultValue: 'null',
    validation: 'Semantic version'
  },
  {
    name: 'drift_alert_sent_at',
    required: false,
    type: 'timestamp',
    description: 'When drift breach alert was sent',
    defaultValue: 'null',
    validation: 'Valid timestamp'
  },
  {
    name: 'avg_confidence_score',
    required: false,
    type: 'decimal',
    description: 'Average confidence score for the metric period',
    defaultValue: 'null',
    validation: '0.0 - 1.0'
  }
];

const driftIndicators = [
  {
    indicator: 'Confidence Score Decline',
    description: 'Average confidence scores dropping over time',
    detection: 'Compare rolling 7-day avg vs. 30-day baseline',
    threshold: '> 10% decline'
  },
  {
    indicator: 'Human Override Rate Increase',
    description: 'More AI outputs being corrected by humans',
    detection: 'Track override percentage per action type',
    threshold: '> 15% override rate'
  },
  {
    indicator: 'Error Rate Spike',
    description: 'Increase in AI processing failures',
    detection: 'Monitor error_rate in ai_governance_metrics',
    threshold: '> 5% error rate'
  },
  {
    indicator: 'Theme Rejection Rate',
    description: 'Managers not confirming AI-generated themes',
    detection: 'Track is_confirmed=false percentage',
    threshold: '> 30% rejection'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Daily drift calculation',
    enforcement: 'System',
    description: 'Drift scores calculated daily during off-peak hours'
  },
  {
    rule: 'Threshold: 0.15 default',
    enforcement: 'System',
    description: 'Drift breach triggered when performance_drift_score > 0.15'
  },
  {
    rule: 'Alert on breach',
    enforcement: 'System',
    description: 'Drift breach sends notification to AI governance team'
  },
  {
    rule: 'Version tracking required',
    enforcement: 'System',
    description: 'Model version recorded with all metrics for correlation analysis'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Drift alert triggered but performance seems fine',
    cause: 'Seasonal variation or temporary data quality issue',
    solution: 'Check for unusual input patterns; compare against multiple baseline periods'
  },
  {
    issue: 'No drift metrics appearing',
    cause: 'Insufficient data volume for calculation',
    solution: 'Drift metrics require minimum 100 AI actions per period to calculate reliably'
  },
  {
    issue: 'Drift persisting after model update',
    cause: 'New model may have different confidence calibration',
    solution: 'Reset baseline after major model updates; allow 2-week stabilization period'
  }
];

export function AIModelDriftMonitoring() {
  return (
    <section id="sec-5-15" data-manual-anchor="sec-5-15" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-primary" />
          5.15 Model Performance Drift Monitoring
        </h3>
        <p className="text-muted-foreground mt-2">
          Continuous monitoring of AI model performance to detect degradation and trigger remediation.
        </p>
      </div>

      {/* Industry Standard Badge */}
      <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/50">
        <Shield className="h-4 w-4 text-purple-600" />
        <AlertTitle className="flex items-center gap-2">
          <span>MLOps Best Practice</span>
          <Badge variant="outline" className="text-xs">ISO 42001</Badge>
          <Badge variant="outline" className="text-xs">NIST AI RMF</Badge>
        </AlertTitle>
        <AlertDescription>
          Model drift monitoring is essential for maintaining AI system reliability. ISO 42001 requires 
          ongoing performance monitoring and NIST AI RMF emphasizes continuous measurement of AI system 
          behavior against established baselines.
        </AlertDescription>
      </Alert>

      <LearningObjectives objectives={learningObjectives} />

      {/* Navigation Path */}
      <div className="p-3 bg-muted rounded-lg">
        <span className="text-sm font-medium">Navigation Path: </span>
        <span className="text-sm text-muted-foreground">
          Performance → 360 Feedback → Governance → AI Performance Dashboard
        </span>
      </div>

      {/* What is Drift? */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4" />
            Understanding Model Drift
          </h4>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Model drift occurs when AI performance degrades over time due to changes in input data 
              patterns, organizational context, or model staleness. In 360 Feedback, drift may manifest as:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h5 className="font-medium text-sm text-amber-600 mb-2">Data Drift</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• New competencies not in training data</li>
                  <li>• Changed organizational vocabulary</li>
                  <li>• Different feedback writing styles</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h5 className="font-medium text-sm text-red-600 mb-2">Concept Drift</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Changed meaning of performance terms</li>
                  <li>• New bias patterns emerging</li>
                  <li>• Shifted organizational expectations</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drift Indicators */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4" />
            Drift Detection Indicators
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Indicator</th>
                  <th className="text-left p-2 font-medium">What It Measures</th>
                  <th className="text-left p-2 font-medium">Detection Method</th>
                  <th className="text-center p-2 font-medium">Alert Threshold</th>
                </tr>
              </thead>
              <tbody>
                {driftIndicators.map((ind) => (
                  <tr key={ind.indicator} className="border-b">
                    <td className="p-2 font-medium">{ind.indicator}</td>
                    <td className="p-2 text-muted-foreground text-xs">{ind.description}</td>
                    <td className="p-2 text-xs">{ind.detection}</td>
                    <td className="p-2 text-center">
                      <Badge variant="outline" className="text-xs text-amber-600">
                        {ind.threshold}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Drift Score Visualization */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Drift Score Interpretation</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-full h-8 bg-gradient-to-r from-green-500 via-amber-500 to-red-500 rounded flex items-center justify-between px-2 text-xs font-bold text-white">
                <span>0.0</span>
                <span>0.15</span>
                <span>0.30</span>
                <span>1.0</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="font-bold text-green-600">0.0 - 0.10</div>
                <div className="text-xs text-muted-foreground">Healthy</div>
                <div className="text-xs text-muted-foreground mt-1">No action needed</div>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="font-bold text-amber-600">0.10 - 0.20</div>
                <div className="text-xs text-muted-foreground">Warning</div>
                <div className="text-xs text-muted-foreground mt-1">Monitor closely</div>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="font-bold text-red-600">{"> 0.20"}</div>
                <div className="text-xs text-muted-foreground">Critical</div>
                <div className="text-xs text-muted-foreground mt-1">Investigate immediately</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Protocol */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4" />
            Drift Response Protocol
          </h4>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/50 rounded-r-lg">
              <h5 className="font-medium text-sm">When Warning Threshold Reached (0.10-0.20):</h5>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>1. Review recent AI action logs for patterns</li>
                <li>2. Check for unusual input data characteristics</li>
                <li>3. Compare confidence distributions to baseline</li>
                <li>4. Document findings; schedule review if persists 7+ days</li>
              </ul>
            </div>
            <div className="p-4 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/50 rounded-r-lg">
              <h5 className="font-medium text-sm">When Critical Threshold Reached ({">"}0.20):</h5>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>1. <strong>Immediate:</strong> Create incident in ai_incident_response_log</li>
                <li>2. Increase human review requirements for affected action types</li>
                <li>3. Consider disabling AI features if quality unacceptable</li>
                <li>4. Escalate to AI governance team for model evaluation</li>
                <li>5. Plan model retraining or version rollback if needed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={driftFields} 
        title="Drift Monitoring Fields (ai_governance_metrics additions)" 
      />

      <BusinessRules rules={businessRules} />

      <TroubleshootingSection items={troubleshootingItems} />

      {/* Best Practice */}
      <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
        <div className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h5 className="font-medium text-sm">Baseline Reset Best Practice</h5>
            <p className="text-sm text-muted-foreground mt-1">
              After a model update or significant organizational change (new competency framework, 
              restructuring), reset your drift baseline. Allow 30 days of data collection before 
              re-enabling drift alerts to establish a new "normal" pattern.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
