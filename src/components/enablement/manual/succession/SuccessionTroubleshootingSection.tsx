import { AlertTriangle, Clock } from 'lucide-react';
import {
  TroubleshootingOverview,
  ConfigurationIssues,
  NineBoxAssessmentIssues,
  ReadinessAssessmentIssues,
  TalentPoolSuccessionIssues,
  WorkflowApprovalIssues,
  DataQualityMigrationIssues,
  SecurityPermissionIssues,
  AIAutomationIssues,
  EscalationProcedures,
} from './sections/troubleshooting';

export function SuccessionTroubleshootingSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-11" data-manual-anchor="part-11" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">11. Troubleshooting & FAQs</h2>
            <p className="text-muted-foreground">
              Comprehensive diagnostic procedures, issue resolution guides, and escalation paths for succession planning
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~60 min read
          </span>
          <span>Target: Admin, Consultant, HR Partner</span>
          <span>100+ documented issues</span>
        </div>
      </section>

      {/* 11.1 Troubleshooting Overview */}
      <TroubleshootingOverview />

      {/* 11.2 Configuration Issues */}
      <ConfigurationIssues />

      {/* 11.3 Nine-Box & Talent Assessment Issues */}
      <NineBoxAssessmentIssues />

      {/* 11.4 Readiness Assessment Issues */}
      <ReadinessAssessmentIssues />

      {/* 11.5 Talent Pool & Succession Plan Issues */}
      <TalentPoolSuccessionIssues />

      {/* 11.6 Workflow & Approval Issues */}
      <WorkflowApprovalIssues />

      {/* 11.7 Data Quality & Migration Issues */}
      <DataQualityMigrationIssues />

      {/* 11.8 Security & Permission Issues */}
      <SecurityPermissionIssues />

      {/* 11.9 AI & Automation Issues */}
      <AIAutomationIssues />

      {/* 11.10 Escalation Procedures & Support Resources */}
      <EscalationProcedures />
    </div>
  );
}
