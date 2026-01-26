import { Users, Clock } from 'lucide-react';
import {
  TalentPoolOverview,
  TalentPoolTypes,
  TalentPoolCreation,
  TalentPoolMembers,
  TalentPoolNomination,
  TalentPoolHRReview,
  TalentPoolEvidence,
  TalentPoolAnalytics,
  TalentPoolNotifications,
  TalentPoolHRHubIntegration
} from './sections/talentpools';

export function SuccessionTalentPoolsSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-5" data-manual-anchor="part-5" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Users className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">5. Talent Pool Management</h2>
            <p className="text-muted-foreground">
              Create, configure, and manage talent pools including nomination workflows, 
              HR review processes, evidence-based decision support, and HR Hub integration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~110 min read
          </span>
          <span>Target: Admin, HR Partner, Manager</span>
        </div>
      </section>

      {/* Section 5.1: Overview */}
      <TalentPoolOverview />

      {/* Section 5.2: Pool Types */}
      <TalentPoolTypes />

      {/* Section 5.3: Pool Creation */}
      <TalentPoolCreation />

      {/* Section 5.4: Member Management */}
      <TalentPoolMembers />

      {/* Section 5.5: Manager Nomination */}
      <TalentPoolNomination />

      {/* Section 5.6: HR Review */}
      <TalentPoolHRReview />

      {/* Section 5.7: Evidence-Based Decisions */}
      <TalentPoolEvidence />

      {/* Section 5.8: Analytics */}
      <TalentPoolAnalytics />

      {/* Section 5.9: Notifications & Reminders */}
      <TalentPoolNotifications />

      {/* Section 5.10: HR Hub Integration */}
      <TalentPoolHRHubIntegration />
    </div>
  );
}
