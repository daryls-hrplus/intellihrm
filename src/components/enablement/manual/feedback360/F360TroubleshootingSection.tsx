import { AlertTriangle, Clock, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  F360CommonIssuesSection,
  F360CycleManagementIssues,
  F360AnonymityPrivacyIssues,
  F360ResponseCollectionIssues,
  F360ReportGenerationIssues,
  F360IntegrationFailures,
  F360AITroubleshootingSection,
  F360SecurityAccessSection,
  F360EscalationProcedures,
  F360BestPracticesSection,
} from './sections/troubleshooting';

export function F360TroubleshootingSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section data-manual-anchor="part-8" id="part-8" className="scroll-mt-32">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-primary" />
          Part 8: Troubleshooting & FAQs
        </h2>
        <p className="text-muted-foreground mb-4">
          Comprehensive troubleshooting guide for resolving common issues, diagnosing complex problems,
          and implementing industry best practices for 360 feedback cycle management.
        </p>
        
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~120 min total read time
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            10 sections
          </span>
          <span>50+ issues documented</span>
          <span>SHRM/CCL aligned</span>
        </div>

        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">How to Use This Chapter</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            Each section includes an <strong>Issue Database</strong> with symptoms, causes, and resolution steps.
            Use the <strong>Field Reference Tables</strong> to understand database configurations.
            For complex issues, follow the <strong>Diagnostic Procedures</strong> step-by-step.
          </AlertDescription>
        </Alert>
      </section>

      {/* 8.1 Common Configuration Issues */}
      <F360CommonIssuesSection />

      {/* 8.2 Cycle Management Issues */}
      <F360CycleManagementIssues />

      {/* 8.3 Anonymity & Privacy Problems */}
      <F360AnonymityPrivacyIssues />

      {/* 8.4 Response Collection Issues */}
      <F360ResponseCollectionIssues />

      {/* 8.5 Report Generation Problems */}
      <F360ReportGenerationIssues />

      {/* 8.6 Integration Failures */}
      <F360IntegrationFailures />

      {/* 8.7 AI Feature Troubleshooting */}
      <F360AITroubleshootingSection />

      {/* 8.8 Security & Access Control */}
      <F360SecurityAccessSection />

      {/* 8.9 Escalation Procedures */}
      <F360EscalationProcedures />

      {/* 8.10 Best Practices & Success Factors */}
      <F360BestPracticesSection />
    </div>
  );
}
