import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationPath } from '../../../NavigationPath';
import { TipCallout, WarningCallout, FutureCallout } from '../../../components/Callout';
import { WorkflowDiagram } from '../../../components/WorkflowDiagram';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { LearningObjectives } from '../../../../workforce-manual/sections/lifecycle-workflows/LearningObjectives';
import { ExternalLink, Mail, Shield, Clock } from 'lucide-react';

const LEARNING_OBJECTIVES = [
  'Configure external rater capabilities for customer/vendor feedback',
  'Manage invitation workflows and access token security',
  'Process consent and data privacy requirements',
  'Monitor external response collection and reminders',
  'Handle external rater issues and access problems'
];

const EXTERNAL_DIAGRAM = `
flowchart TD
    subgraph Initiation["Invitation Process"]
        A[HR Creates External Request] --> B[Enter Email & Details]
        B --> C[Generate Secure Token]
        C --> D[Send Invitation Email]
    end
    
    subgraph Consent["Consent Management"]
        D --> E[External Rater Clicks Link]
        E --> F[View Consent Page]
        F --> G{Accept Terms?}
        G -->|Yes| H[Record Consent]
        G -->|No| I[Access Denied]
        H --> J[Access Feedback Form]
    end
    
    subgraph Response["Feedback Collection"]
        J --> K[Complete Questions]
        K --> L[Submit Feedback]
        L --> M[Thank You Page]
        M --> N[Token Invalidated]
    end
    
    subgraph Security["Security Controls"]
        E --> O{Token Valid?}
        O -->|Expired| P[Redirect to Error]
        O -->|Invalid| P
        O -->|Valid| F
        N --> Q[Data Encrypted]
    end
    
    style A fill:#3b82f6,stroke:#2563eb,color:#fff
    style L fill:#10b981,stroke:#059669,color:#fff
    style I fill:#ef4444,stroke:#dc2626,color:#fff
    style P fill:#ef4444,stroke:#dc2626,color:#fff
`;

const EXTERNAL_FIELDS: FieldDefinition[] = [
  {
    name: 'external_email',
    required: true,
    type: 'string',
    description: 'Email address of external rater',
    defaultValue: '—',
    validation: 'Valid email format, not internal domain'
  },
  {
    name: 'external_name',
    required: true,
    type: 'string',
    description: 'Display name of external rater',
    defaultValue: '—',
    validation: 'Max 100 characters'
  },
  {
    name: 'external_organization',
    required: false,
    type: 'string',
    description: 'Company or organization name',
    defaultValue: '—',
    validation: 'Max 100 characters'
  },
  {
    name: 'external_relationship',
    required: true,
    type: 'enum',
    description: 'Type of external relationship',
    defaultValue: '—',
    validation: 'customer | vendor | partner | consultant | other'
  },
  {
    name: 'access_token',
    required: true,
    type: 'string',
    description: 'Secure token for unauthenticated access',
    defaultValue: 'Generated UUID',
    validation: 'Unique, cryptographically random'
  },
  {
    name: 'access_token_expires_at',
    required: true,
    type: 'timestamp',
    description: 'When the access token becomes invalid',
    defaultValue: 'cycle.end_date + 7 days',
    validation: 'Must be after cycle end'
  },
  {
    name: 'consent_given',
    required: true,
    type: 'boolean',
    description: 'Whether external rater accepted terms',
    defaultValue: 'false',
    validation: '—'
  },
  {
    name: 'consent_given_at',
    required: false,
    type: 'timestamp',
    description: 'When consent was recorded',
    defaultValue: '—',
    validation: 'Set when consent_given becomes true'
  },
  // Note: consent_ip_address is documented but not yet implemented in database
  // {
  //   name: 'consent_ip_address',
  //   required: false,
  //   type: 'inet',
  //   description: 'IP address at time of consent (for audit)',
  //   defaultValue: '—',
  //   validation: 'Captured automatically'
  // },
  {
    name: 'invitation_sent_at',
    required: true,
    type: 'timestamp',
    description: 'When invitation email was sent',
    defaultValue: 'now()',
    validation: '—'
  },
  {
    name: 'invitation_resent_count',
    required: true,
    type: 'integer',
    description: 'Number of times invitation was resent',
    defaultValue: '0',
    validation: 'Max 3 resends'
  }
];

const STEPS: Step[] = [
  {
    title: 'Enable External Raters for Cycle',
    description: 'Configure the cycle to allow external feedback collection.',
    substeps: [
      'Open cycle configuration in Draft status',
      'Navigate to "Rater Types" section',
      'Enable "External/Customer Raters" option',
      'Set maximum external raters per participant',
      'Configure external rater question set (may differ from internal)',
      'Save cycle configuration'
    ],
    expectedResult: 'Cycle is configured to accept external rater invitations'
  },
  {
    title: 'Create External Rater Invitation',
    description: 'HR invites an external person to provide feedback.',
    substeps: [
      'Navigate to participant\'s rater assignments',
      'Click "Add External Rater"',
      'Enter external rater\'s email address',
      'Enter name and organization',
      'Select relationship type (customer, vendor, etc.)',
      'Review and confirm invitation'
    ],
    expectedResult: 'Invitation created, secure access token generated'
  },
  {
    title: 'Send Invitation Email',
    description: 'System sends personalized invitation to external rater.',
    substeps: [
      'System generates unique access URL with token',
      'Invitation email includes: participant name, cycle context, deadline',
      'Email also includes data privacy notice',
      'External rater clicks link to begin process',
      'Track delivery status in invitation log'
    ],
    expectedResult: 'External rater receives invitation with secure access link'
  },
  {
    title: 'Process Consent',
    description: 'External rater must accept terms before providing feedback.',
    substeps: [
      'External rater lands on consent page',
      'Page displays: purpose, data handling, anonymity information',
      'Rater reviews and accepts terms',
      'Consent recorded with timestamp and IP',
      'Access granted to feedback form'
    ],
    expectedResult: 'Consent recorded in database, rater can proceed'
  },
  {
    title: 'Monitor External Responses',
    description: 'Track external rater completion and send reminders.',
    substeps: [
      'View external raters in "External" filter',
      'Check invitation status: sent, opened, consented, submitted',
      'Identify non-responsive external raters',
      'Send reminder emails (max 3 per rater)',
      'Escalate if no response near deadline'
    ],
    expectedResult: 'Clear visibility of external response progress'
  },
  {
    title: 'Handle Access Issues',
    description: 'Resolve external rater access problems.',
    substeps: [
      'If token expired: Generate new token and resend invitation',
      'If email bounced: Verify email address, update if needed',
      'If consent declined: Document as declined, no retry',
      'If technical issues: Provide support contact information'
    ],
    expectedResult: 'Access issues resolved or properly documented'
  }
];

const TROUBLESHOOTING: TroubleshootingItem[] = [
  {
    issue: 'External rater says they did not receive invitation',
    cause: 'Email may be in spam/junk folder, or blocked by corporate filter',
    solution: 'Check email delivery status. Ask rater to check spam folder. Resend invitation to alternate email if available.'
  },
  {
    issue: 'Access token expired before external rater could respond',
    cause: 'Default expiration may be too short for external parties',
    solution: 'Generate new token and resend invitation. Consider extending default expiration for future cycles.'
  },
  {
    issue: 'External rater declined consent',
    cause: 'May have concerns about data privacy or purpose',
    solution: 'Document the decline. If appropriate, have the participant reach out personally to explain the process.'
  },
  {
    issue: 'Multiple invitations sent to same external rater',
    cause: 'External rater may be nominated by multiple participants',
    solution: 'Each participant-rater pair requires separate feedback. External rater must complete each request separately.'
  }
];

export function WorkflowExternalRaters() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">Section 3.6</Badge>
          <Badge variant="secondary">~10 min read</Badge>
          <Badge variant="secondary">HR Admin</Badge>
        </div>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-primary" />
          External Rater Invitations
        </CardTitle>
        <CardDescription>
          Managing customer and vendor feedback with secure access and consent management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', '360 Feedback', 'Cycles', '[Cycle Name]', 'External Raters']} />
        
        <LearningObjectives items={LEARNING_OBJECTIVES} />

        <WorkflowDiagram
          title="External Rater Invitation & Consent Flow"
          description="Complete process from invitation through secure feedback submission"
          diagram={EXTERNAL_DIAGRAM}
        />

        {/* Security Highlights */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Controls
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 space-y-2">
              <h5 className="font-medium">Token-Based Access</h5>
              <p className="text-sm text-muted-foreground">
                Each external rater receives a unique cryptographic token. No login required,
                but token provides secure, single-use access.
              </p>
            </div>
            <div className="border rounded-lg p-4 space-y-2">
              <h5 className="font-medium">Time-Limited Access</h5>
              <p className="text-sm text-muted-foreground">
                Tokens expire automatically after cycle end date plus buffer period.
                Expired tokens cannot be reused.
              </p>
            </div>
            <div className="border rounded-lg p-4 space-y-2">
              <h5 className="font-medium">Consent Recording</h5>
              <p className="text-sm text-muted-foreground">
                GDPR-compliant consent capture with timestamp and terms version.
                No feedback can be submitted without explicit consent.
              </p>
            </div>
            <div className="border rounded-lg p-4 space-y-2">
              <h5 className="font-medium">Data Encryption</h5>
              <p className="text-sm text-muted-foreground">
                All external feedback is encrypted at rest and in transit. External rater
                identity visible only to authorized HR personnel.
              </p>
            </div>
          </div>
        </div>

        <TipCallout title="External Rater Communication">
          Consider having the participant reach out personally to external raters before the formal
          invitation is sent. This increases response rates and sets appropriate expectations.
        </TipCallout>

        <StepByStep steps={STEPS} title="Operational Procedures" />

        <FieldReferenceTable 
          fields={EXTERNAL_FIELDS} 
          title="External Rater Fields (feedback_360_requests table)" 
        />

        <FutureCallout title="IP Address Tracking (Planned)">
          For enhanced GDPR audit trails, a future update will add <code className="text-xs bg-muted px-1 rounded">consent_ip_address</code> to 
          capture the IP address when external raters give consent.
        </FutureCallout>

        <WarningCallout title="Data Privacy Compliance">
          External rater data is subject to GDPR and other privacy regulations. Ensure your consent
          language covers data handling, retention, and the external rater's rights. Legal review recommended.
        </WarningCallout>

        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}
