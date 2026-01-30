import { AlertTriangle, Clock } from 'lucide-react';
import {
  LndTroubleshootingOverview,
  LndSetupConfigurationIssues,
  LndEnrollmentAccessIssues,
  LndProgressTrackingIssues,
  LndQuizAssessmentIssues,
  LndCertificateCredentialIssues,
  LndComplianceTrainingIssues,
  LndExternalVendorIssues,
  LndIntegrationSyncIssues,
  LndAIAutomationIssues,
  LndPerformanceDataIssues,
  LndEscalationProcedures,
  LndAccessibilityMobileIssues,
  LndDataManagementIssues,
} from './sections/troubleshooting';

export function LndTroubleshootingSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="chapter-9" data-manual-anchor="chapter-9" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">9. Troubleshooting & Best Practices</h2>
            <p className="text-muted-foreground">
              Comprehensive diagnostic procedures, issue resolution guides, and escalation paths for Learning & Development
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~150 min read
          </span>
          <span>Target: Admin, L&D Admin, Consultant</span>
          <span>144 documented issues</span>
        </div>
      </section>

      {/* 9.1 Troubleshooting Overview */}
      <LndTroubleshootingOverview />

      {/* 9.2 Setup & Configuration Issues */}
      <LndSetupConfigurationIssues />

      {/* 9.3 Enrollment & Access Issues */}
      <LndEnrollmentAccessIssues />

      {/* 9.4 Progress Tracking Issues */}
      <LndProgressTrackingIssues />

      {/* 9.5 Quiz & Assessment Issues */}
      <LndQuizAssessmentIssues />

      {/* 9.6 Certificate & Credential Issues */}
      <LndCertificateCredentialIssues />

      {/* 9.7 Compliance Training Issues */}
      <LndComplianceTrainingIssues />

      {/* 9.8 External Training & Vendor Issues */}
      <LndExternalVendorIssues />

      {/* 9.9 Integration & Sync Issues */}
      <LndIntegrationSyncIssues />

      {/* 9.10 AI & Automation Issues */}
      <LndAIAutomationIssues />

      {/* 9.11 Performance & Data Issues */}
      <LndPerformanceDataIssues />

      {/* 9.12 Escalation Procedures & FAQs */}
      <LndEscalationProcedures />

      {/* 9.13 Accessibility, Mobile & Localization Issues */}
      <LndAccessibilityMobileIssues />

      {/* 9.14 Data Management, Privacy & Retention Issues */}
      <LndDataManagementIssues />
    </div>
  );
}
