import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { LearningObjectives, TipCallout, InfoCallout } from '../../../manual/components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const AI_ISSUES = [
  {
    id: 'AIA-001',
    symptom: 'AI course recommendations not appearing for employees',
    severity: 'Medium',
    cause: 'Recommendation engine not enabled, insufficient employee data, or skill profile incomplete.',
    resolution: [
      'Verify AI recommendations are enabled in company L&D settings',
      'Check employee has completed skill profile assessment',
      'Ensure minimum courses are available for recommendation',
      'Review recommendation algorithm configuration',
      'Force refresh recommendation cache for user'
    ],
    prevention: 'Require skill profile during onboarding. Monitor recommendation coverage metrics.'
  },
  {
    id: 'AIA-002',
    symptom: 'Adaptive learning path not adjusting difficulty based on performance',
    severity: 'Medium',
    cause: 'Adaptation rules not triggered, mastery threshold misconfigured, or insufficient attempt data.',
    resolution: [
      'Verify adaptive_learning_paths is enabled for the path',
      'Check min_mastery_threshold and adaptation triggers',
      'Review learner progress in adaptive_learner_progress table',
      'Verify adaptation rules in adaptive_path_rules',
      'Test with sample learner showing varied performance'
    ],
    prevention: 'Configure adaptation rules during path creation. Test with diverse learner profiles.'
  },
  {
    id: 'AIA-003',
    symptom: 'Completion risk prediction showing 0% or 100% for all learners',
    severity: 'High',
    cause: 'Prediction model not calibrated, insufficient historical data, or feature extraction failing.',
    resolution: [
      'Verify completion_risk_predictions has valid data',
      'Check if historical completion data is available for training',
      'Review feature extraction queries for null values',
      'Recalibrate prediction model with updated data',
      'Check prediction model version and update if needed'
    ],
    prevention: 'Ensure sufficient historical data before enabling predictions. Monitor model accuracy.'
  },
  {
    id: 'AIA-004',
    symptom: 'AI chatbot not responding to training-related queries',
    severity: 'Medium',
    cause: 'Chatbot not enabled, knowledge base not indexed, or intent recognition failing.',
    resolution: [
      'Verify learning_chatbot_config is enabled for the tenant',
      'Check knowledge base index is up to date',
      'Review chatbot conversation logs for patterns',
      'Test with known working queries first',
      'Update chatbot training data if intent gaps exist'
    ],
    prevention: 'Maintain chatbot knowledge base. Review conversation logs for improvement opportunities.'
  },
  {
    id: 'AIA-005',
    symptom: 'Skills transfer assessment not calculating ROI correctly',
    severity: 'Medium',
    cause: 'Pre/post scores not available, ROI formula incorrect, or assessment not linked to training.',
    resolution: [
      'Verify skills_transfer_assessments has pre and post scores',
      'Check ROI calculation formula in configuration',
      'Ensure assessment is linked to training completion',
      'Review barrier and enabler identification logic',
      'Recalculate ROI for affected assessments'
    ],
    prevention: 'Require pre-training assessment. Configure ROI formula during setup.'
  },
  {
    id: 'AIA-006',
    symptom: 'AI quiz generation producing duplicate or low-quality questions',
    severity: 'Low',
    cause: 'Source content too short, generation parameters incorrect, or deduplication not running.',
    resolution: [
      'Provide more comprehensive source content for generation',
      'Review generation parameters (difficulty, bloom levels)',
      'Run deduplication check on generated questions',
      'Manually edit or regenerate poor quality questions',
      'Adjust AI model parameters for better output'
    ],
    prevention: 'Provide quality source content. Review and edit AI-generated content before publishing.'
  },
  {
    id: 'AIA-007',
    symptom: 'Natural language report query timing out',
    severity: 'Medium',
    cause: 'Query too complex, data volume too large, or NL-to-SQL translation inefficient.',
    resolution: [
      'Simplify the query or break into smaller parts',
      'Add date range filters to reduce data volume',
      'Review generated SQL for inefficiencies',
      'Increase query timeout if justified',
      'Use pre-built reports for complex analysis'
    ],
    prevention: 'Guide users on query best practices. Set appropriate timeout limits.'
  },
  {
    id: 'AIA-008',
    symptom: 'AI governance audit trail not logging explanations',
    severity: 'High',
    cause: 'Explainability logging disabled, ai_explainability_logs table not accessible, or logging trigger failed.',
    resolution: [
      'Verify AI explainability logging is enabled (ISO 42001)',
      'Check ai_explainability_logs table for recent entries',
      'Review logging trigger for errors',
      'Enable debug logging to identify gap',
      'Manually document explanation if critical'
    ],
    prevention: 'Enable explainability logging for all AI features. Monitor logging health.'
  },
];

const QUICK_REFERENCE = [
  { id: 'AIA-001', symptom: 'Recommendations not appearing', severity: 'Medium' },
  { id: 'AIA-003', symptom: 'Risk prediction showing extremes', severity: 'High' },
  { id: 'AIA-008', symptom: 'Governance logging missing', severity: 'High' },
];

export function LndAIAutomationIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-9-10" data-manual-anchor="sec-9-10" className="scroll-mt-32">
        <div className="border-l-4 border-primary pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~10 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, Consultant</span>
          </div>
          <h3 className="text-xl font-semibold">9.10 AI & Automation Issues</h3>
          <p className="text-muted-foreground mt-1">
            Course recommendations, adaptive paths, risk prediction, chatbot, quiz generation, and governance troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Diagnose AI recommendation and adaptive learning path issues',
          'Troubleshoot completion risk prediction model problems',
          'Resolve chatbot intent recognition and knowledge base issues',
          'Fix AI quiz generation quality and deduplication problems',
          'Address ISO 42001 AI governance and explainability logging'
        ]}
      />

      <InfoCallout title="ISO 42001 AI Governance">
        AIA-008 (governance logging) is critical for regulatory compliance. All AI-generated content and 
        recommendations must have explainability records for audit purposes.
      </InfoCallout>

      {/* Quick Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Issues Quick Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Issue ID</th>
                  <th className="text-left py-2 font-medium">Symptom</th>
                  <th className="text-left py-2 font-medium">Severity</th>
                </tr>
              </thead>
              <tbody>
                {QUICK_REFERENCE.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2">
                      <Badge variant="outline" className="font-mono">{item.id}</Badge>
                    </td>
                    <td className="py-2">{item.symptom}</td>
                    <td className="py-2">
                      <Badge variant={item.severity === 'High' ? 'destructive' : 'default'}>
                        {item.severity}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Issue Resolution (8 Issues)</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {AI_ISSUES.map((issue) => (
              <AccordionItem key={issue.id} value={issue.id} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`h-4 w-4 flex-shrink-0 ${issue.severity === 'High' ? 'text-destructive' : issue.severity === 'Medium' ? 'text-amber-500' : 'text-muted-foreground'}`} />
                    <Badge variant="outline" className="font-mono">{issue.id}</Badge>
                    <span className="text-sm font-medium">{issue.symptom}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4 pl-6">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Root Cause</span>
                      <p className="text-sm mt-1">{issue.cause}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resolution Steps</span>
                      <ol className="list-decimal list-inside text-sm mt-1 space-y-1">
                        {issue.resolution.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="flex items-start gap-2 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">Prevention</span>
                        <p className="text-sm mt-1">{issue.prevention}</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <TipCallout title="AI Model Monitoring">
        Monitor AI model performance using ai_governance_metrics. Key metrics: confidence scores, 
        drift detection, and human override rates. Review monthly for model health.
      </TipCallout>
    </div>
  );
}
