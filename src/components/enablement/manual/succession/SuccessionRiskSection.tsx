import { Shield, Clock } from 'lucide-react';
import {
  RiskOverview,
  RiskTerminologyStandards,
  FlightRiskWorkflow,
  RetentionStrategyPlanning,
  VacancyRiskMonitoring,
  RiskReviewGovernance,
  RiskMitigationPlaybooks,
  AIAssistedRiskPrediction,
  CrossModuleRiskIntegration,
  RiskTroubleshooting,
} from './sections/risk';

export function SuccessionRiskSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-7" data-manual-anchor="part-7" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Shield className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">7. Risk Management</h2>
            <p className="text-muted-foreground">
              Operational risk workflows, retention strategies, governance, and AI-assisted prediction
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~75 min read
          </span>
          <span>Target: Admin, HR Partner, Manager</span>
        </div>
      </section>

      {/* Section 7.1: Risk Management Overview */}
      <RiskOverview />

      {/* Section 7.2: Risk Terminology & Standards */}
      <RiskTerminologyStandards />

      {/* Section 7.3: Flight Risk Assessment Workflow */}
      <FlightRiskWorkflow />

      {/* Section 7.4: Retention Strategy & Action Planning */}
      <RetentionStrategyPlanning />

      {/* Section 7.5: Position Vacancy Risk Monitoring */}
      <VacancyRiskMonitoring />

      {/* Section 7.6: Risk Review Cadence & Governance */}
      <RiskReviewGovernance />

      {/* Section 7.7: Risk Mitigation Playbooks */}
      <RiskMitigationPlaybooks />

      {/* Section 7.8: AI-Assisted Risk Prediction */}
      <AIAssistedRiskPrediction />

      {/* Section 7.9: Cross-Module Risk Integration */}
      <CrossModuleRiskIntegration />

      {/* Section 7.10: Risk Management Troubleshooting */}
      <RiskTroubleshooting />
    </div>
  );
}
