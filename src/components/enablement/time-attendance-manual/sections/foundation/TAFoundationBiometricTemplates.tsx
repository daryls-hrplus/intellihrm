import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Fingerprint, CreditCard, Smartphone, GraduationCap,
  Shield, Users, Key
} from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  BusinessRules,
  TipCallout,
  SecurityCallout,
  WarningCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function TAFoundationBiometricTemplates() {
  const learningObjectives = [
    'Configure biometric template types (fingerprint, card, PIN)',
    'Enroll employees with multiple verification methods',
    'Manage template lifecycle (creation, update, revocation)',
    'Understand template security and encryption requirements',
    'Set up fallback authentication methods'
  ];

  const biometricTemplateFields: FieldDefinition[] = [
    { name: 'template_id', required: true, type: 'uuid', description: 'Unique template identifier', defaultValue: 'Auto-generated', validation: 'UUID v4' },
    { name: 'employee_id', required: true, type: 'uuid', description: 'Employee owning this template', defaultValue: '—', validation: 'Must reference valid employee' },
    { name: 'company_id', required: true, type: 'uuid', description: 'Company for data isolation', defaultValue: '—', validation: 'Must reference valid company' },
    { name: 'template_type', required: true, type: 'enum', description: 'Type of biometric/credential', defaultValue: 'fingerprint', validation: 'fingerprint, card, pin, mobile_token' },
    { name: 'template_data', required: true, type: 'bytea', description: 'Encrypted template data', defaultValue: '—', validation: 'Encrypted binary' },
    { name: 'card_number', required: false, type: 'text', description: 'Badge/card number if card type', defaultValue: 'null', validation: 'Unique per company' },
    { name: 'pin_hash', required: false, type: 'text', description: 'Hashed PIN if PIN type', defaultValue: 'null', validation: 'bcrypt hash' },
    { name: 'finger_position', required: false, type: 'enum', description: 'Which finger if fingerprint', defaultValue: 'null', validation: 'right_index, left_index, etc.' },
    { name: 'quality_score', required: false, type: 'decimal', description: 'Template quality (0-1)', defaultValue: 'null', validation: 'Higher is better' },
    { name: 'enrolled_at', required: true, type: 'timestamp', description: 'When template was created', defaultValue: 'now()', validation: 'Auto-set' },
    { name: 'enrolled_by', required: false, type: 'uuid', description: 'Admin who enrolled template', defaultValue: 'null', validation: 'Audit trail' },
    { name: 'last_used_at', required: false, type: 'timestamp', description: 'Last successful use', defaultValue: 'null', validation: 'Auto-updated' },
    { name: 'expires_at', required: false, type: 'timestamp', description: 'Template expiration date', defaultValue: 'null', validation: 'Optional expiry' },
    { name: 'is_primary', required: false, type: 'boolean', description: 'Primary template for type', defaultValue: 'true', validation: 'One primary per type' },
    { name: 'is_active', required: false, type: 'boolean', description: 'Template is usable', defaultValue: 'true', validation: 'Deactivate to revoke' }
  ];

  const businessRules: BusinessRule[] = [
    {
      rule: 'One Primary Per Type',
      enforcement: 'System',
      description: 'Each employee can have one primary template per type (e.g., one primary fingerprint, one primary card). Additional templates are backups.'
    },
    {
      rule: 'Template Encryption',
      enforcement: 'System',
      description: 'All biometric templates are encrypted at rest using AES-256. Templates are never transmitted in plaintext.'
    },
    {
      rule: 'PIN Complexity',
      enforcement: 'System',
      description: 'PINs must be 4-8 digits. Consecutive sequences (1234) and repeated digits (1111) are rejected.'
    },
    {
      rule: 'Card Uniqueness',
      enforcement: 'System',
      description: 'Card numbers must be unique within a company. Duplicate card numbers are rejected during enrollment.'
    },
    {
      rule: 'Revocation Audit',
      enforcement: 'Policy',
      description: 'Template deactivation/deletion is logged with reason and admin who performed the action.'
    },
    {
      rule: 'Multi-Factor Support',
      enforcement: 'Advisory',
      description: 'High-security environments should require two methods (e.g., card + PIN, or fingerprint + PIN).'
    }
  ];

  const configurationSteps = [
    {
      title: 'Navigate to Biometric Templates',
      description: 'Access template management from employee profile or bulk enrollment.',
      notes: ['Time & Attendance → Setup → Biometric Templates']
    },
    {
      title: 'Select Template Type',
      description: 'Choose the credential type to enroll (fingerprint, card, PIN, mobile).',
      notes: ['Available types depend on deployed devices']
    },
    {
      title: 'Capture/Enter Template',
      description: 'For fingerprint: scan finger on device. For card: swipe/tap card. For PIN: enter code.',
      notes: ['Fingerprints require 3 scans for quality']
    },
    {
      title: 'Verify Quality Score',
      description: 'Ensure quality score meets minimum threshold (0.7+ recommended for fingerprints).',
      notes: ['Low quality leads to recognition failures']
    },
    {
      title: 'Set as Primary (Optional)',
      description: 'Mark this template as the primary method for this type if enrolling multiple.',
      notes: ['Primary is tried first during verification']
    },
    {
      title: 'Test Verification',
      description: 'Have the employee test clock-in using the newly enrolled credential.',
      notes: ['Verify successful match before dismissing']
    }
  ];

  return (
    <Card id="ta-sec-2-6" data-manual-anchor="ta-sec-2-6" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.6</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>8 min read</span>
        </div>
        <CardTitle className="text-2xl">Biometric Templates</CardTitle>
        <CardDescription>
          Fingerprint, card, PIN, and mobile token enrollment and management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={learningObjectives} />

        {/* Conceptual Overview */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Fingerprint className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">What Are Biometric Templates?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Biometric templates are stored credentials used to verify employee identity 
                during clock-in/out. Unlike face verification (Section 2.7), this section covers 
                fingerprint, proximity/RFID cards, PIN codes, and mobile tokens. Each employee 
                can have multiple templates across different types, enabling fallback methods 
                when one fails.
              </p>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder
          alt="Biometric Template Enrollment Screen"
          caption="Template enrollment interface showing fingerprint capture and card registration"
        />

        {/* Template Types */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Supported Template Types
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: Fingerprint,
                type: 'Fingerprint',
                description: 'Scanned fingerprint converted to mathematical template',
                security: 'High',
                enrollment: '3 scans required',
                considerations: 'Fails with wet/dirty hands'
              },
              {
                icon: CreditCard,
                type: 'Proximity Card (RFID)',
                description: 'Unique card number linked to employee',
                security: 'Medium',
                enrollment: 'Single tap/swipe',
                considerations: 'Can be shared or lost'
              },
              {
                icon: Shield,
                type: 'PIN Code',
                description: 'Secret numeric code entered on keypad',
                security: 'Low-Medium',
                enrollment: 'User chooses code',
                considerations: 'Can be shared, shoulder surfing risk'
              },
              {
                icon: Smartphone,
                type: 'Mobile Token',
                description: 'Cryptographic token on employee smartphone',
                security: 'High',
                enrollment: 'App registration',
                considerations: 'Requires smartphone, battery dependent'
              }
            ].map((item, i) => (
              <div key={i} className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">{item.type}</h4>
                  <Badge variant={item.security === 'High' ? 'default' : 'secondary'} className="ml-auto text-xs">
                    {item.security} Security
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <div className="text-xs space-y-1">
                  <div><span className="font-medium">Enrollment:</span> {item.enrollment}</div>
                  <div><span className="font-medium">Note:</span> {item.considerations}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Field Reference Table */}
        <FieldReferenceTable 
          fields={biometricTemplateFields}
          title="employee_biometric_templates Table Fields"
        />

        {/* Security Callout */}
        <SecurityCallout>
          <strong>Template Security:</strong> Biometric templates are encrypted at rest and 
          in transit. Fingerprint templates use one-way hashing—the original print cannot be 
          reconstructed. Card numbers are stored encrypted. PINs are bcrypt-hashed. Never 
          store raw biometric data or plaintext credentials.
        </SecurityCallout>

        {/* Business Rules */}
        <BusinessRules rules={businessRules} />

        {/* Configuration Steps */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Step-by-Step Enrollment
          </h3>
          <StepByStep steps={configurationSteps} />
        </div>

        {/* Multi-Factor Setup */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Multi-Factor Authentication Setup
          </h3>
          <div className="p-4 bg-muted/30 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              For high-security environments, configure devices to require two verification methods:
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { combo: 'Card + PIN', security: 'Medium-High', useCase: 'Standard enterprise' },
                { combo: 'Fingerprint + PIN', security: 'High', useCase: 'High-security areas' },
                { combo: 'Card + Fingerprint', security: 'High', useCase: 'Maximum security, no shared secrets' }
              ].map((item, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <div className="font-medium">{item.combo}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <div>Security: {item.security}</div>
                    <div>Use case: {item.useCase}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warning */}
        <WarningCallout>
          <strong>Template Revocation:</strong> When an employee is terminated or a card is 
          lost, immediately deactivate all their templates. Templates remain in the database 
          for audit purposes but are excluded from verification matching.
        </WarningCallout>

        {/* Tip */}
        <TipCallout>
          <strong>Backup Methods:</strong> Enroll at least two different template types per 
          employee (e.g., fingerprint + card). This prevents lockouts when one method fails 
          (dirty hands, forgotten card, etc.).
        </TipCallout>
      </CardContent>
    </Card>
  );
}
