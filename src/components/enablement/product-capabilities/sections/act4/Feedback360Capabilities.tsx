import { Users, MessageSquare, FileText, Shield, BarChart3, Target, ClipboardCheck } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export const Feedback360Capabilities = () => {
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
      <ValueStoryHeader
        challenge="Managers have blind spots. Self-perception rarely matches reality. Without multi-source feedback, leaders don't know how they're truly perceived—and development efforts miss the mark. Traditional feedback is filtered, infrequent, and incomplete."
        promise="HRplus 360 Feedback provides the complete picture. Peers, direct reports, and stakeholders contribute anonymous insights that reveal strengths, blind spots, and development priorities. Configurable anonymity, aggregated reporting, and AI-powered action recommendations transform feedback into growth."
        outcomes={[
          { metric: "85%+", label: "Response Rate", description: "Easy, mobile-friendly collection" },
          { metric: "Multi-source", label: "Insight Accuracy", description: "Reduced single-rater bias" },
          { metric: "Targeted", label: "Development Focus", description: "Data-driven priorities" },
          { metric: "+50%", label: "Self-Awareness", description: "Gap identification" },
        ]}
        personas={[
          { role: "Employee", value: "I understand how others perceive my work and leadership" },
          { role: "Rater", value: "My feedback is confidential and contributes to real change" },
          { role: "Manager", value: "I see blind spots I couldn't discover on my own" },
          { role: "L&D Pro", value: "360 data drives targeted development programs" },
        ]}
      />

      <CapabilityCategory title="360 Cycle Configuration" icon={Target}>
        <li>Cycle creation with start and end dates</li>
        <li>Timeline and phase management (nomination, collection, reporting)</li>
        <li>Participant selection rules by level, role, tenure</li>
        <li>Rater category configuration (peers, directs, skip-level, external)</li>
        <li>Anonymity threshold settings (minimum raters for aggregation)</li>
        <li>Cycle template library for recurring programs</li>
        <li>Custom cycle naming and branding</li>
      </CapabilityCategory>

      <CapabilityCategory title="Rater Management" icon={Users}>
        <li>Peer rater nomination by participant or manager</li>
        <li>Upward (direct report) rater auto-selection</li>
        <li>Skip-level manager feedback collection</li>
        <li>External rater support (customers, partners)</li>
        <li>Stakeholder identification and invitation</li>
        <li>Rater assignment workflows with approval</li>
        <li>Rater exclusion rules (conflict of interest)</li>
        <li>Minimum and maximum rater requirements per category</li>
      </CapabilityCategory>

      <CapabilityCategory title="Questionnaire Design" icon={FileText}>
        <li>Question template library with proven items</li>
        <li>Competency-based question sets aligned to framework</li>
        <li>Behavioral question sets with specific examples</li>
        <li>Rating scale configuration (frequency, agreement, etc.)</li>
        <li>Open-ended questions for qualitative feedback</li>
        <li>Question category organization (leadership, communication, etc.)</li>
        <li>Multi-language support for global deployments</li>
        <li>Question randomization to reduce order bias</li>
      </CapabilityCategory>

      <CapabilityCategory title="Response Collection" icon={MessageSquare}>
        <li>Mobile-friendly survey interface</li>
        <li>Response tracking dashboards with completion rates</li>
        <li>Automated reminder emails with escalation</li>
        <li>Partial save capability with resume later</li>
        <li>Response deadline enforcement with late notices</li>
        <li>Rater progress monitoring for HR</li>
        <li>Bulk reminder sending for low response rates</li>
        <li>Anonymous submission confirmation</li>
      </CapabilityCategory>

      <CapabilityCategory title="Anonymity & Confidentiality" icon={Shield}>
        <li>Configurable anonymity thresholds (e.g., 3+ raters to show)</li>
        <li>Rater category aggregation rules</li>
        <li>Identifiable vs. anonymous report settings</li>
        <li>Confidentiality messaging and agreements</li>
        <li>Response masking rules for small groups</li>
        <li>Comment attribution controls</li>
        <li>Data access restrictions for sensitive feedback</li>
      </CapabilityCategory>

      <CapabilityCategory title="Feedback Reports" icon={BarChart3}>
        <li>Aggregated feedback reports by rater category</li>
        <li>Self vs. others comparison (blind spot analysis)</li>
        <li>Rater category breakdown (peers vs. directs vs. manager)</li>
        <li>Strength and gap summary with rankings</li>
        <li>Trend comparison with prior 360 cycles</li>
        <li>Competency radar charts and visualizations</li>
        <li>PDF report generation for sharing and archiving</li>
        <li>Benchmark comparison to peers at same level</li>
      </CapabilityCategory>

      <CapabilityCategory title="Development Actions" icon={ClipboardCheck}>
        <li>AI-generated action recommendations from feedback</li>
        <li>Gap-to-development goal linking</li>
        <li>Learning resource suggestions based on gaps</li>
        <li>Coach and mentor recommendations</li>
        <li>Action tracking with progress updates</li>
        <li>Follow-up feedback scheduling for progress check</li>
        <li>IDP integration for development planning</li>
        <li>Manager coaching conversation guides</li>
      </CapabilityCategory>

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
    </ModuleCapabilityCard>
  );
};
