import { Shield } from 'lucide-react';
import {
  GovernanceAnonymityArchitecture,
  GovernanceThresholdConfiguration,
  GovernanceConsentFramework,
  GovernanceConsentWorkflows,
  GovernanceDataPolicies,
  GovernanceDataRetention,
  GovernanceExceptionHandling,
  GovernanceInvestigationMode,
  GovernanceAIExplainability,
  GovernanceAuditReporting,
} from './sections/governance';

export function F360GovernanceSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <div data-manual-anchor="part-4" id="part-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
          <Shield className="h-6 w-6 text-primary" />
          4. Governance & Compliance
        </h2>
        <p className="text-muted-foreground">
          Complete governance framework for 360 feedback: anonymity protection, consent management, 
          data policies, exception handling, investigation procedures, AI governance (ISO 42001), 
          and comprehensive audit compliance.
        </p>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Estimated Read Time:</strong> ~100 minutes | 
            <strong className="ml-2">Target Roles:</strong> Admin, HR Partner, Compliance, Legal
          </p>
        </div>
      </div>

      {/* Group A: Anonymity Foundation (4.1-4.2) */}
      <GovernanceAnonymityArchitecture />
      <GovernanceThresholdConfiguration />

      {/* Group B: Consent Framework (4.3-4.4) */}
      <GovernanceConsentFramework />
      <GovernanceConsentWorkflows />

      {/* Group C: Data Policies (4.5-4.6) */}
      <GovernanceDataPolicies />
      <GovernanceDataRetention />

      {/* Group D: Exception Handling (4.7) */}
      <GovernanceExceptionHandling />

      {/* Group E: Investigation Mode (4.8) */}
      <GovernanceInvestigationMode />

      {/* Group F: AI Governance (4.9) */}
      <GovernanceAIExplainability />

      {/* Group G: Audit & Compliance (4.10) */}
      <GovernanceAuditReporting />
    </div>
  );
}
