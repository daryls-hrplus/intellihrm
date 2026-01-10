import { Users, MessageSquare, FileText, Shield, BarChart3, Target, ClipboardCheck } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export const Feedback360Capabilities = () => {
  const outcomes = [
    { metric: "85%+", label: "Response Rate", description: "Easy, mobile-friendly collection" },
    { metric: "Multi-source", label: "Insight Accuracy", description: "Reduced single-rater bias" },
    { metric: "Targeted", label: "Development Focus", description: "Data-driven priorities" },
    { metric: "+50%", label: "Self-Awareness", description: "Gap identification" },
  ];

  const personas = [
    { role: "Employee", value: "I understand how others perceive my work and leadership" },
    { role: "Rater", value: "My feedback is confidential and contributes to real change" },
    { role: "Manager", value: "I see blind spots I couldn't discover on my own" },
    { role: "L&D Pro", value: "360 data drives targeted development programs" },
  ];

  return (
    <ModuleCapabilityCard
      icon={Users}
      title="360 Feedback"
      tagline="The complete picture from every perspective"
      overview="Peers, direct reports, and stakeholders contribute anonymous insights that reveal strengths, blind spots, and development priorities. Configurable anonymity, aggregated reporting, and AI-powered action recommendations transform feedback into growth."
      accentColor="bg-cyan-500/10 text-cyan-600"
      badge="35+ Capabilities"
      id="feedback-360"
    >
      <div className="space-y-6">
        <ValueStoryHeader
          challenge="Managers have blind spots. Self-perception rarely matches reality. Without multi-source feedback, leaders don't know how they're truly perceived—and development efforts miss the mark. Traditional feedback is filtered, infrequent, and incomplete."
          promise="HRplus 360 Feedback provides the complete picture. Peers, direct reports, and stakeholders contribute anonymous insights that reveal strengths, blind spots, and development priorities. Configurable anonymity, aggregated reporting, and AI-powered action recommendations transform feedback into growth."
          outcomes={outcomes}
          personas={personas}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="360 Cycle Configuration" icon={Target}>
            <CapabilityItem>Cycle creation with start and end dates</CapabilityItem>
            <CapabilityItem>Timeline and phase management (nomination, collection, reporting)</CapabilityItem>
            <CapabilityItem>Participant selection rules by level, role, tenure</CapabilityItem>
            <CapabilityItem>Rater category configuration (peers, directs, skip-level, external)</CapabilityItem>
            <CapabilityItem>Anonymity threshold settings (minimum raters for aggregation)</CapabilityItem>
            <CapabilityItem>Cycle template library for recurring programs</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Rater Management" icon={Users}>
            <CapabilityItem>Peer rater nomination by participant or manager</CapabilityItem>
            <CapabilityItem>Upward (direct report) rater auto-selection</CapabilityItem>
            <CapabilityItem>Skip-level manager feedback collection</CapabilityItem>
            <CapabilityItem>External rater support (customers, partners)</CapabilityItem>
            <CapabilityItem>Stakeholder identification and invitation</CapabilityItem>
            <CapabilityItem>Rater exclusion rules (conflict of interest)</CapabilityItem>
            <CapabilityItem>Minimum and maximum rater requirements per category</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Questionnaire Design" icon={FileText}>
            <CapabilityItem>Question template library with proven items</CapabilityItem>
            <CapabilityItem>Competency-based question sets aligned to framework</CapabilityItem>
            <CapabilityItem>Behavioral question sets with specific examples</CapabilityItem>
            <CapabilityItem>Rating scale configuration (frequency, agreement, etc.)</CapabilityItem>
            <CapabilityItem>Open-ended questions for qualitative feedback</CapabilityItem>
            <CapabilityItem>Question category organization (leadership, communication, etc.)</CapabilityItem>
            <CapabilityItem>Multi-language support for global deployments</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Response Collection" icon={MessageSquare}>
            <CapabilityItem>Mobile-friendly survey interface</CapabilityItem>
            <CapabilityItem>Response tracking dashboards with completion rates</CapabilityItem>
            <CapabilityItem>Automated reminder emails with escalation</CapabilityItem>
            <CapabilityItem>Partial save capability with resume later</CapabilityItem>
            <CapabilityItem>Response deadline enforcement with late notices</CapabilityItem>
            <CapabilityItem>Rater progress monitoring for HR</CapabilityItem>
            <CapabilityItem>Anonymous submission confirmation</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Anonymity & Confidentiality" icon={Shield}>
            <CapabilityItem>Configurable anonymity thresholds (e.g., 3+ raters to show)</CapabilityItem>
            <CapabilityItem>Rater category aggregation rules</CapabilityItem>
            <CapabilityItem>Identifiable vs. anonymous report settings</CapabilityItem>
            <CapabilityItem>Confidentiality messaging and agreements</CapabilityItem>
            <CapabilityItem>Response masking rules for small groups</CapabilityItem>
            <CapabilityItem>Comment attribution controls</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Feedback Reports" icon={BarChart3}>
            <CapabilityItem>Aggregated feedback reports by rater category</CapabilityItem>
            <CapabilityItem>Self vs. others comparison (blind spot analysis)</CapabilityItem>
            <CapabilityItem>Rater category breakdown (peers vs. directs vs. manager)</CapabilityItem>
            <CapabilityItem>Strength and gap summary with rankings</CapabilityItem>
            <CapabilityItem>Trend comparison with prior 360 cycles</CapabilityItem>
            <CapabilityItem>Competency radar charts and visualizations</CapabilityItem>
            <CapabilityItem>PDF report generation for sharing and archiving</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Development Actions" icon={ClipboardCheck}>
            <CapabilityItem>AI-generated action recommendations from feedback</CapabilityItem>
            <CapabilityItem>Gap-to-development goal linking</CapabilityItem>
            <CapabilityItem>Learning resource suggestions based on gaps</CapabilityItem>
            <CapabilityItem>Coach and mentor recommendations</CapabilityItem>
            <CapabilityItem>Action tracking with progress updates</CapabilityItem>
            <CapabilityItem>Follow-up feedback scheduling for progress check</CapabilityItem>
            <CapabilityItem>IDP integration for development planning</CapabilityItem>
          </CapabilityCategory>
        </div>

        <AIFeatureHighlight>
          <AICapability type="automated">Sentiment analysis of open-ended feedback comments</AICapability>
          <AICapability type="predictive">Theme extraction across all raters for pattern detection</AICapability>
          <AICapability type="prescriptive">Blind spot identification comparing self to others</AICapability>
          <AICapability type="prescriptive">Development priority recommendations from gap analysis</AICapability>
          <AICapability type="predictive">Trend detection across multiple 360 cycles</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Performance Appraisals", description: "360 insights inform annual reviews" },
            { module: "Learning", description: "Feedback gaps drive training recommendations" },
            { module: "Succession Planning", description: "Leadership competency assessment" },
            { module: "Continuous Performance", description: "360 complements ongoing feedback" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
};
