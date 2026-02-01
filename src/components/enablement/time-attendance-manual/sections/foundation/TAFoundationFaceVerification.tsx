import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Users, Shield, Camera, GraduationCap,
  CheckCircle, Settings, Eye, Smartphone
} from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  BusinessRules,
  WarningCallout,
  TipCallout,
  SecurityCallout,
  ComplianceCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function TAFoundationFaceVerification() {
  const learningObjectives = [
    'Configure face recognition enrollment for employees',
    'Set matching thresholds and anti-spoofing rules',
    'Understand liveness detection and its importance',
    'Review face verification logs and handle failures',
    'Comply with biometric data privacy requirements'
  ];

  const faceEnrollmentFields: FieldDefinition[] = [
    { name: 'enrollment_id', required: true, type: 'uuid', description: 'Unique enrollment record', defaultValue: 'Auto-generated', validation: 'UUID v4' },
    { name: 'employee_id', required: true, type: 'uuid', description: 'Employee being enrolled', defaultValue: '—', validation: 'Must reference valid employee' },
    { name: 'company_id', required: true, type: 'uuid', description: 'Company for data isolation', defaultValue: '—', validation: 'Must reference valid company' },
    { name: 'face_template', required: true, type: 'bytea', description: 'Encrypted facial feature vector', defaultValue: '—', validation: 'AI-generated, encrypted' },
    { name: 'enrollment_photo_url', required: false, type: 'text', description: 'Reference photo used for enrollment', defaultValue: 'null', validation: 'Secure storage URL' },
    { name: 'quality_score', required: false, type: 'decimal', description: 'Enrollment photo quality', defaultValue: '—', validation: '0.0-1.0' },
    { name: 'enrolled_by', required: false, type: 'uuid', description: 'Admin who performed enrollment', defaultValue: 'null', validation: 'Must reference valid user' },
    { name: 'enrolled_at', required: true, type: 'timestamp', description: 'Enrollment date/time', defaultValue: 'now()', validation: 'Auto-set' },
    { name: 'enrollment_method', required: false, type: 'enum', description: 'How enrollment was done', defaultValue: 'device', validation: 'device, mobile, admin_upload' },
    { name: 'is_primary', required: false, type: 'boolean', description: 'Primary face template', defaultValue: 'true', validation: 'One primary per employee' },
    { name: 'expires_at', required: false, type: 'timestamp', description: 'Template expiration date', defaultValue: 'null', validation: 'For periodic re-enrollment' },
    { name: 'is_active', required: false, type: 'boolean', description: 'Whether template is usable', defaultValue: 'true', validation: 'true/false' }
  ];

  const faceVerificationLogFields: FieldDefinition[] = [
    { name: 'verification_id', required: true, type: 'uuid', description: 'Unique verification record', defaultValue: 'Auto-generated', validation: 'UUID v4' },
    { name: 'time_clock_entry_id', required: true, type: 'uuid', description: 'Linked clock entry', defaultValue: '—', validation: 'Must reference valid entry' },
    { name: 'employee_id', required: true, type: 'uuid', description: 'Employee verified', defaultValue: '—', validation: 'Must reference valid employee' },
    { name: 'enrollment_id', required: true, type: 'uuid', description: 'Template matched against', defaultValue: '—', validation: 'Must reference valid enrollment' },
    { name: 'match_score', required: true, type: 'decimal', description: 'Similarity score', defaultValue: '—', validation: '0.0-1.0 (higher = more similar)' },
    { name: 'match_threshold', required: true, type: 'decimal', description: 'Required threshold for pass', defaultValue: '0.85', validation: 'Company-configured' },
    { name: 'verification_result', required: true, type: 'enum', description: 'Pass/fail result', defaultValue: '—', validation: 'passed, failed, spoof_detected, low_quality' },
    { name: 'liveness_check_passed', required: false, type: 'boolean', description: 'Anti-spoofing check result', defaultValue: 'null', validation: 'true/false/null' },
    { name: 'captured_photo_url', required: false, type: 'text', description: 'Photo taken during punch', defaultValue: 'null', validation: 'Secure storage URL' },
    { name: 'device_id', required: false, type: 'uuid', description: 'Device used for verification', defaultValue: 'null', validation: 'For device-based punches' },
    { name: 'processing_time_ms', required: false, type: 'integer', description: 'Time to process verification', defaultValue: '—', validation: 'Milliseconds' },
    { name: 'verified_at', required: true, type: 'timestamp', description: 'When verification occurred', defaultValue: 'now()', validation: 'Auto-set' }
  ];

  const businessRules: BusinessRule[] = [
    {
      rule: 'Matching Threshold',
      enforcement: 'System',
      description: 'A match score above the configured threshold (default 0.85) results in successful verification. Lower thresholds reduce false rejections but increase false acceptance risk.'
    },
    {
      rule: 'Liveness Detection Required',
      enforcement: 'System',
      description: 'To prevent photo/video spoofing, liveness detection ensures a real person is present. Punches with failed liveness are blocked.'
    },
    {
      rule: 'Low Quality Rejection',
      enforcement: 'System',
      description: 'Photos with quality scores below 0.6 (poor lighting, blur, occlusion) are rejected and the employee is prompted to retry.'
    },
    {
      rule: 'Multiple Enrollment Attempts',
      enforcement: 'Policy',
      description: 'After 3 failed verification attempts, the system locks and requires admin intervention or alternative verification method.'
    },
    {
      rule: 'Template Re-enrollment',
      enforcement: 'Advisory',
      description: 'Face templates should be refreshed periodically (e.g., annually) to account for appearance changes.'
    }
  ];

  const configurationSteps = [
    {
      title: 'Enable Face Verification',
      description: 'Navigate to T&A setup and enable face verification for the company.',
      notes: ['Time & Attendance → Setup → Verification Methods → Face Recognition']
    },
    {
      title: 'Configure Match Threshold',
      description: 'Set the minimum match score required for successful verification (0.80-0.95 typical).',
      notes: ['Higher = more secure but more false rejections']
    },
    {
      title: 'Enable Liveness Detection',
      description: 'Turn on anti-spoofing to prevent photo/video attacks.',
      notes: ['Recommended for all deployments']
    },
    {
      title: 'Enroll Employees',
      description: 'Employees can self-enroll via mobile app or be enrolled by admin at a terminal.',
      notes: ['Capture multiple angles for better accuracy']
    },
    {
      title: 'Set Re-enrollment Policy',
      description: 'Configure template expiration (e.g., 12 months) for periodic refresh.',
      notes: ['Balance security with user convenience']
    },
    {
      title: 'Test Verification',
      description: 'Have employees test face verification and review the verification logs.',
      notes: ['Check match scores and liveness results']
    }
  ];

  return (
    <Card id="ta-sec-2-5" data-manual-anchor="ta-sec-2-5" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.5</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>8 min read</span>
        </div>
        <CardTitle className="text-2xl">Face Verification Setup</CardTitle>
        <CardDescription>
          AI face recognition enrollment, matching thresholds, and liveness detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={learningObjectives} />

        {/* Conceptual Overview */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">How Face Verification Works</h3>
              <p className="text-muted-foreground leading-relaxed">
                Face verification uses AI to compare a live photo against an enrolled template. 
                During enrollment, the system captures the employee's face and generates a 
                mathematical representation (template) of key facial features. During clock-in, 
                a new photo is captured and compared against the stored template. If the 
                similarity score exceeds the threshold, the identity is confirmed. Liveness 
                detection ensures a real person is present, not a photo or video.
              </p>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder
          alt="Face Enrollment Screen"
          caption="Employee face enrollment showing photo capture with quality indicators"
        />

        {/* How It Works Diagram */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Verification Flow
          </h3>
          <div className="p-4 bg-muted/30 border rounded-lg">
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center min-w-[100px]">
                <Camera className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <div className="font-medium text-xs">Capture Photo</div>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center min-w-[100px]">
                <Shield className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                <div className="font-medium text-xs">Liveness Check</div>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center min-w-[100px]">
                <Users className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                <div className="font-medium text-xs">Match Template</div>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center min-w-[100px]">
                <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <div className="font-medium text-xs">Verify Identity</div>
              </div>
            </div>
          </div>
        </div>

        {/* Field Reference Tables */}
        <FieldReferenceTable 
          fields={faceEnrollmentFields}
          title="employee_face_enrollments Table Fields"
        />

        <FieldReferenceTable 
          fields={faceVerificationLogFields}
          title="face_verification_logs Table Fields"
        />

        {/* Threshold Guidelines */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Match Threshold Guidelines
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Threshold</th>
                  <th className="text-left p-3 font-medium">Security Level</th>
                  <th className="text-left p-3 font-medium">False Reject Rate</th>
                  <th className="text-left p-3 font-medium">Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { threshold: '0.95+', security: 'Maximum', frr: 'High (5-10%)', useCase: 'High-security facilities, financial' },
                  { threshold: '0.90', security: 'High', frr: 'Moderate (2-5%)', useCase: 'Most enterprise deployments' },
                  { threshold: '0.85', security: 'Standard', frr: 'Low (1-2%)', useCase: 'Recommended default' },
                  { threshold: '0.80', security: 'Lenient', frr: 'Very Low (<1%)', useCase: 'High convenience, lower security' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{row.threshold}</td>
                    <td className="p-3 text-muted-foreground">{row.security}</td>
                    <td className="p-3 text-muted-foreground">{row.frr}</td>
                    <td className="p-3 text-muted-foreground">{row.useCase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Callout */}
        <SecurityCallout>
          <strong>Biometric Data Protection:</strong> Face templates are encrypted at rest and 
          in transit. The actual facial image is not stored permanently—only the mathematical 
          template. Comply with GDPR Article 9 (special category data), BIPA, and local 
          biometric privacy laws. Obtain explicit employee consent before enrollment.
        </SecurityCallout>

        {/* Business Rules */}
        <BusinessRules rules={businessRules} />

        {/* Configuration Steps */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Step-by-Step Configuration
          </h3>
          <StepByStep steps={configurationSteps} />
        </div>

        {/* Compliance */}
        <ComplianceCallout>
          <strong>Consent Requirements:</strong> Before enrolling employees in face verification, 
          obtain written consent explaining: what data is collected, how it's used, retention 
          period, and right to opt-out. Many jurisdictions require affirmative opt-in for 
          biometric data collection.
        </ComplianceCallout>

        {/* Warning */}
        <WarningCallout>
          <strong>Enrollment Quality:</strong> Poor enrollment photos lead to frequent false 
          rejections. Ensure enrollment is done in good lighting, with the employee facing 
          directly at the camera, no glasses/hats, and neutral expression. Consider capturing 
          multiple angles for improved accuracy.
        </WarningCallout>

        {/* Tip */}
        <TipCallout>
          <strong>Fallback Method:</strong> Always configure a fallback verification method 
          (PIN, card) for cases where face verification fails repeatedly. This prevents 
          employees from being locked out while maintaining security.
        </TipCallout>
      </CardContent>
    </Card>
  );
}
