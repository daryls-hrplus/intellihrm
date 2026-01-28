import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  TipCallout,
  WarningCallout,
  type FieldDefinition
} from '@/components/enablement/manual/components';

export function LndSetupScormXapi() {
  const learningObjectives = [
    'Upload and configure SCORM packages',
    'Understand SCORM 1.2 and 2004 tracking parameters',
    'Configure xAPI statement storage for advanced analytics'
  ];

  const scormFields: FieldDefinition[] = [
    { name: 'course_id', required: true, type: 'uuid', description: 'Associated course reference' },
    { name: 'package_url', required: true, type: 'url', description: 'SCORM package storage location' },
    { name: 'scorm_version', required: true, type: 'enum', description: 'SCORM version: 1.2 or 2004', defaultValue: '1.2' },
    { name: 'entry_point', required: false, type: 'text', description: 'Launch file path within package' },
    { name: 'manifest_data', required: false, type: 'json', description: 'Parsed imsmanifest.xml data' },
    { name: 'is_active', required: true, type: 'boolean', description: 'Package availability', defaultValue: 'true' }
  ];

  return (
    <section id="sec-2-13" data-manual-anchor="sec-2-13" className="space-y-6">
      <h2 className="text-2xl font-bold">2.13 SCORM/xAPI Integration</h2>
      <LearningObjectives objectives={learningObjectives} />
      <p className="text-muted-foreground">
        SCORM (Sharable Content Object Reference Model) and xAPI enable integration of 
        third-party eLearning content with standardized progress tracking and reporting.
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Supported Standards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">SCORM 1.2</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Most widely supported format</li>
                <li>• Basic completion and score tracking</li>
                <li>• Simple implementation</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">SCORM 2004</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Advanced sequencing and navigation</li>
                <li>• Detailed interaction tracking</li>
                <li>• Better suspend/resume support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      <FieldReferenceTable fields={scormFields} title="lms_scorm_packages Table Schema" />
      <WarningCallout title="Testing Required">
        Always test SCORM packages in a staging environment before production deployment. 
        Different authoring tools may have compatibility quirks that affect tracking.
      </WarningCallout>
      <TipCallout title="SCORM Best Practices">
        <ul className="space-y-1 mt-2">
          <li>• Validate packages before upload using SCORM testing tools</li>
          <li>• Keep file sizes reasonable for faster load times</li>
          <li>• Test across browsers (Chrome, Firefox, Edge)</li>
        </ul>
      </TipCallout>
    </section>
  );
}
