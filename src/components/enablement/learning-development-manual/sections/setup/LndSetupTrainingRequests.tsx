import { FileText } from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  TipCallout,
  type FieldDefinition
} from '@/components/enablement/manual/components';

export function LndSetupTrainingRequests() {
  const learningObjectives = [
    'Configure training request approval workflows',
    'Set up request types and cost thresholds',
    'Enable integration with HR Hub approval workflows'
  ];

  const requestFields: FieldDefinition[] = [
    { name: 'employee_id', required: true, type: 'uuid', description: 'Requesting employee' },
    { name: 'course_id', required: false, type: 'uuid', description: 'Internal course (if applicable)' },
    { name: 'external_training_name', required: false, type: 'text', description: 'External training title' },
    { name: 'estimated_cost', required: false, type: 'number', description: 'Estimated training cost' },
    { name: 'justification', required: false, type: 'text', description: 'Business justification' },
    { name: 'status', required: true, type: 'enum', description: 'Request status', defaultValue: 'pending' },
    { name: 'approved_by', required: false, type: 'uuid', description: 'Approving manager/HR' },
    { name: 'budget_id', required: false, type: 'uuid', description: 'Budget to charge against' }
  ];

  return (
    <section id="sec-2-15" data-manual-anchor="sec-2-15" className="space-y-6">
      <h2 className="text-2xl font-bold">2.15 Training Requests Configuration</h2>
      <LearningObjectives objectives={learningObjectives} />
      <p className="text-muted-foreground">
        Training requests enable employees to request enrollment in courses or external 
        training programs. Configure approval workflows based on cost thresholds and 
        management hierarchy.
      </p>
      <FieldReferenceTable fields={requestFields} title="training_requests Table Schema" />
      <TipCallout title="Request Workflow Tips">
        <ul className="space-y-1 mt-2">
          <li>• Set cost thresholds for different approval levels</li>
          <li>• Require business justification for external training</li>
          <li>• Auto-approve low-cost internal courses to reduce friction</li>
          <li>• Integrate with budget tracking for spend visibility</li>
        </ul>
      </TipCallout>
    </section>
  );
}
