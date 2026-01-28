import { Award } from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  TipCallout,
  type FieldDefinition
} from '@/components/enablement/manual/components';

export function LndSetupCertificates() {
  const learningObjectives = [
    'Create certificate templates for course completion',
    'Configure certificate generation triggers',
    'Set up expiration policies for recertification'
  ];

  const templateFields: FieldDefinition[] = [
    { name: 'company_id', required: false, type: 'uuid', description: 'Company-specific template (null = global)' },
    { name: 'name', required: true, type: 'text', description: 'Template name', validation: '3-200 characters' },
    { name: 'template_html', required: false, type: 'text', description: 'HTML template with placeholders' },
    { name: 'background_image_url', required: false, type: 'url', description: 'Certificate background image' },
    { name: 'expiry_months', required: false, type: 'number', description: 'Months until certificate expires' },
    { name: 'is_default', required: false, type: 'boolean', description: 'Default template for company', defaultValue: 'false' },
    { name: 'is_active', required: false, type: 'boolean', description: 'Template availability', defaultValue: 'true' }
  ];

  return (
    <section id="sec-2-14" data-manual-anchor="sec-2-14" className="space-y-6">
      <h2 className="text-2xl font-bold">2.14 Certificate Templates</h2>
      <LearningObjectives objectives={learningObjectives} />
      <p className="text-muted-foreground">
        Certificates recognize learner achievements and provide documentation for compliance 
        and professional development. Configure templates with company branding and appropriate 
        expiration policies.
      </p>
      <FieldReferenceTable fields={templateFields} title="training_certificate_templates Table Schema" />
      <TipCallout title="Certificate Design Tips">
        <ul className="space-y-1 mt-2">
          <li>• Include company logo and branding for professional appearance</li>
          <li>• Use clear, readable fonts for printed certificates</li>
          <li>• Include unique certificate ID for verification</li>
          <li>• Set expiry for compliance certifications that require recertification</li>
        </ul>
      </TipCallout>
    </section>
  );
}
