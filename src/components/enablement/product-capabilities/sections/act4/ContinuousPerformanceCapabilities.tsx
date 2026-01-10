import { MessageSquare, Award, TrendingUp, Heart, Calendar, Target, AlertTriangle, BarChart3, Users } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export const ContinuousPerformanceCapabilities = () => {
  return (
    <ModuleCapabilityCard
      icon={MessageSquare}
      title="Continuous Performance"
      tagline="Capture every performance signal in real-time"
      overview="Recognition flows instantly. Feedback is immediate. Pulse surveys track engagement. Performance indices provide always-on visibility. AI detects risks before they become terminations—and celebrates wins as they happen."
      accentColor="bg-emerald-500/10 text-emerald-600"
      badge="55+ Capabilities"
      id="continuous-performance"
    >
      <ValueStoryHeader
        challenge="Performance happens every day, but it's only measured once a year. High performers feel invisible between reviews. Problems fester for months before anyone notices. Without continuous visibility, organizations react to performance issues instead of preventing them."
        promise="HRplus Continuous Performance captures every performance signal in real-time. Recognition flows instantly. Feedback is immediate. Pulse surveys track engagement. Performance indices provide always-on visibility. AI detects risks before they become terminations—and celebrates wins as they happen."
        outcomes={[
          { metric: "Weekly", label: "Feedback Frequency", description: "Real-time recognition" },
          { metric: "Continuous", label: "Performance Visibility", description: "Index + signals" },
          { metric: "Pulse-based", label: "Engagement Tracking", description: "Regular check-ins" },
          { metric: "3 Months", label: "Early Risk Detection", description: "AI-powered alerts" },
        ]}
        personas={[
          { role: "Employee", value: "My contributions are recognized immediately, not annually" },
          { role: "Manager", value: "I see performance signals and can coach in real-time" },
          { role: "HR Leader", value: "Engagement trends visible before exit interviews" },
          { role: "Executive", value: "Organization-wide performance pulse at a glance" },
        ]}
      />

      <CapabilityCategory title="Continuous Feedback" icon={MessageSquare}>
        <li>Real-time feedback delivery between any employees</li>
        <li>Feedback request workflows ("Ask for feedback")</li>
        <li>Manager coaching notes and observations</li>
        <li>Writing quality suggestions for better feedback</li>
        <li>Achievement and milestone logging</li>
        <li>Peer-to-peer feedback channels</li>
        <li>Feedback visibility controls (private, shared with manager)</li>
        <li>Feedback history and timeline views</li>
      </CapabilityCategory>

      <CapabilityCategory title="Recognition & Awards" icon={Award}>
        <li>Recognition delivery platform with instant notifications</li>
        <li>Badge creation, design, and awarding rules</li>
        <li>Award category configuration (values, milestones, peer)</li>
        <li>Values-aligned recognition with tagging</li>
        <li>Points system integration (if configured)</li>
        <li>Recognition wall and social feed</li>
        <li>Recognition analytics and leaderboards</li>
        <li>Nomination-based awards with approval workflows</li>
        <li>Manager-to-employee and peer-to-peer recognition</li>
      </CapabilityCategory>

      <CapabilityCategory title="Performance Index & Signals" icon={TrendingUp}>
        <li>Continuous performance index calculation</li>
        <li>Real-time performance signal collection</li>
        <li>Risk identification with configurable thresholds</li>
        <li>Trajectory scoring (improving, stable, declining)</li>
        <li>Trend history tracking over time</li>
        <li>Index settings configuration by role/level</li>
        <li>Multi-factor performance sensing (goals, feedback, attendance)</li>
        <li>Performance index alerts for managers</li>
      </CapabilityCategory>

      <CapabilityCategory title="Pulse Surveys & Engagement" icon={Heart}>
        <li>Pulse survey creation with scheduling</li>
        <li>Survey template library (eNPS, engagement, wellbeing)</li>
        <li>Response collection with anonymity options</li>
        <li>Sentiment analysis of open-ended responses</li>
        <li>Sentiment metrics and trends over time</li>
        <li>Sentiment alerts for concerning patterns</li>
        <li>Coaching nudge generation from survey insights</li>
        <li>Department and team comparison views</li>
      </CapabilityCategory>

      <CapabilityCategory title="Check-ins & 1-on-1s" icon={Calendar}>
        <li>Check-in scheduling and calendar integration</li>
        <li>Discussion topic templates and prompts</li>
        <li>Notes capture during check-in conversations</li>
        <li>Action item tracking from check-ins</li>
        <li>Check-in frequency analytics</li>
        <li>Manager check-in reminders</li>
        <li>Employee-initiated check-in requests</li>
        <li>Check-in history and conversation log</li>
      </CapabilityCategory>

      <CapabilityCategory title="Individual Development Plans" icon={Target}>
        <li>IDP creation and management interface</li>
        <li>Development goal setting with timelines</li>
        <li>Activity and milestone tracking</li>
        <li>Feedback linkage to development areas</li>
        <li>Progress monitoring with status updates</li>
        <li>Manager collaboration and co-ownership</li>
        <li>Learning course linkage to IDP goals</li>
        <li>IDP templates by career track</li>
      </CapabilityCategory>

      <CapabilityCategory title="Performance Improvement Plans" icon={AlertTriangle}>
        <li>PIP creation with structured documentation</li>
        <li>Milestone configuration with clear expectations</li>
        <li>Progress tracking against improvement goals</li>
        <li>Check-in scheduling within PIP period</li>
        <li>Outcome documentation (successful, extended, terminated)</li>
        <li>HR oversight and approval workflows</li>
        <li>Legal documentation and audit trail</li>
        <li>Support resource assignment</li>
      </CapabilityCategory>

      <CapabilityCategory title="Calibration Sessions" icon={Users}>
        <li>Calibration session configuration and scheduling</li>
        <li>Participant management by department/level</li>
        <li>9-Box talent matrix workspace</li>
        <li>Rating distribution visualization</li>
        <li>Rating adjustment tracking with justification</li>
        <li>AI-assisted calibration analysis</li>
        <li>Override audit logging for compliance</li>
        <li>Manager alignment scoring</li>
        <li>Forced distribution enforcement (optional)</li>
      </CapabilityCategory>

      <CapabilityCategory title="Performance Analytics" icon={BarChart3}>
        <li>Recognition dashboards with trending</li>
        <li>Feedback frequency metrics by team/manager</li>
        <li>Engagement score correlation analysis</li>
        <li>AI-powered performance insights</li>
        <li>Predictive performance modeling</li>
        <li>Check-in completion analytics</li>
        <li>IDP progress reporting</li>
        <li>PIP outcome tracking</li>
      </CapabilityCategory>

      <AIFeatureHighlight>
        <AICapability type="predictive">Performance risk prediction based on signals and patterns</AICapability>
        <AICapability type="predictive">High-potential identification from performance trajectory</AICapability>
        <AICapability type="prescriptive">Calibration recommendations for fair rating distribution</AICapability>
        <AICapability type="automated">Sentiment trend detection from pulse surveys and feedback</AICapability>
        <AICapability type="prescriptive">Coaching prompt generation based on team dynamics</AICapability>
        <AICapability type="automated">Recognition pattern analysis for culture insights</AICapability>
      </AIFeatureHighlight>

      <ModuleIntegrations
        integrations={[
          { module: "Performance Appraisals", description: "Continuous feedback informs annual reviews" },
          { module: "Goals Management", description: "Goal progress feeds performance index" },
          { module: "Compensation", description: "Performance data drives pay decisions" },
          { module: "Succession Planning", description: "High performers identified for pipeline" },
          { module: "Learning", description: "Development gaps trigger training" },
        ]}
      />
    </ModuleCapabilityCard>
  );
};
