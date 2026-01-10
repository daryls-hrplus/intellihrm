import { MessageSquare, Award, TrendingUp, Heart, Calendar, Target, AlertTriangle, BarChart3, Users } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export const ContinuousPerformanceCapabilities = () => {
  const outcomes = [
    { metric: "Weekly", label: "Feedback Frequency", description: "Real-time recognition" },
    { metric: "Continuous", label: "Performance Visibility", description: "Index + signals" },
    { metric: "Pulse-based", label: "Engagement Tracking", description: "Regular check-ins" },
    { metric: "3 Months", label: "Early Risk Detection", description: "AI-powered alerts" },
  ];

  const personas = [
    { role: "Employee", value: "My contributions are recognized immediately, not annually" },
    { role: "Manager", value: "I see performance signals and can coach in real-time" },
    { role: "HR Leader", value: "Engagement trends visible before exit interviews" },
    { role: "Executive", value: "Organization-wide performance pulse at a glance" },
  ];

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
      <div className="space-y-6">
        <ValueStoryHeader
          challenge="Performance happens every day, but it's only measured once a year. High performers feel invisible between reviews. Problems fester for months before anyone notices. Without continuous visibility, organizations react to performance issues instead of preventing them."
          promise="HRplus Continuous Performance captures every performance signal in real-time. Recognition flows instantly. Feedback is immediate. Pulse surveys track engagement. Performance indices provide always-on visibility. AI detects risks before they become terminations—and celebrates wins as they happen."
          outcomes={outcomes}
          personas={personas}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Continuous Feedback" icon={MessageSquare}>
            <CapabilityItem>Real-time feedback delivery between any employees</CapabilityItem>
            <CapabilityItem>Feedback request workflows ("Ask for feedback")</CapabilityItem>
            <CapabilityItem>Manager coaching notes and observations</CapabilityItem>
            <CapabilityItem>Writing quality suggestions for better feedback</CapabilityItem>
            <CapabilityItem>Achievement and milestone logging</CapabilityItem>
            <CapabilityItem>Peer-to-peer feedback channels</CapabilityItem>
            <CapabilityItem>Feedback visibility controls (private, shared with manager)</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Recognition & Awards" icon={Award}>
            <CapabilityItem>Recognition delivery platform with instant notifications</CapabilityItem>
            <CapabilityItem>Badge creation, design, and awarding rules</CapabilityItem>
            <CapabilityItem>Award category configuration (values, milestones, peer)</CapabilityItem>
            <CapabilityItem>Values-aligned recognition with tagging</CapabilityItem>
            <CapabilityItem>Points system integration (if configured)</CapabilityItem>
            <CapabilityItem>Recognition wall and social feed</CapabilityItem>
            <CapabilityItem>Manager-to-employee and peer-to-peer recognition</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Performance Index & Signals" icon={TrendingUp}>
            <CapabilityItem>Continuous performance index calculation</CapabilityItem>
            <CapabilityItem>Real-time performance signal collection</CapabilityItem>
            <CapabilityItem>Risk identification with configurable thresholds</CapabilityItem>
            <CapabilityItem>Trajectory scoring (improving, stable, declining)</CapabilityItem>
            <CapabilityItem>Trend history tracking over time</CapabilityItem>
            <CapabilityItem>Index settings configuration by role/level</CapabilityItem>
            <CapabilityItem>Multi-factor performance sensing (goals, feedback, attendance)</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Pulse Surveys & Engagement" icon={Heart}>
            <CapabilityItem>Pulse survey creation with scheduling</CapabilityItem>
            <CapabilityItem>Survey template library (eNPS, engagement, wellbeing)</CapabilityItem>
            <CapabilityItem>Response collection with anonymity options</CapabilityItem>
            <CapabilityItem>Sentiment analysis of open-ended responses</CapabilityItem>
            <CapabilityItem>Sentiment metrics and trends over time</CapabilityItem>
            <CapabilityItem>Sentiment alerts for concerning patterns</CapabilityItem>
            <CapabilityItem>Coaching nudge generation from survey insights</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Check-ins & 1-on-1s" icon={Calendar}>
            <CapabilityItem>Check-in scheduling and calendar integration</CapabilityItem>
            <CapabilityItem>Discussion topic templates and prompts</CapabilityItem>
            <CapabilityItem>Notes capture during check-in conversations</CapabilityItem>
            <CapabilityItem>Action item tracking from check-ins</CapabilityItem>
            <CapabilityItem>Check-in frequency analytics</CapabilityItem>
            <CapabilityItem>Manager check-in reminders</CapabilityItem>
            <CapabilityItem>Employee-initiated check-in requests</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Individual Development Plans" icon={Target}>
            <CapabilityItem>IDP creation and management interface</CapabilityItem>
            <CapabilityItem>Development goal setting with timelines</CapabilityItem>
            <CapabilityItem>Activity and milestone tracking</CapabilityItem>
            <CapabilityItem>Feedback linkage to development areas</CapabilityItem>
            <CapabilityItem>Progress monitoring with status updates</CapabilityItem>
            <CapabilityItem>Manager collaboration and co-ownership</CapabilityItem>
            <CapabilityItem>Learning course linkage to IDP goals</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Performance Improvement Plans" icon={AlertTriangle}>
            <CapabilityItem>PIP creation with structured documentation</CapabilityItem>
            <CapabilityItem>Milestone configuration with clear expectations</CapabilityItem>
            <CapabilityItem>Progress tracking against improvement goals</CapabilityItem>
            <CapabilityItem>Check-in scheduling within PIP period</CapabilityItem>
            <CapabilityItem>Outcome documentation (successful, extended, terminated)</CapabilityItem>
            <CapabilityItem>HR oversight and approval workflows</CapabilityItem>
            <CapabilityItem>Legal documentation and audit trail</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Calibration Sessions" icon={Users}>
            <CapabilityItem>Calibration session configuration and scheduling</CapabilityItem>
            <CapabilityItem>Participant management by department/level</CapabilityItem>
            <CapabilityItem>9-Box talent matrix workspace</CapabilityItem>
            <CapabilityItem>Rating distribution visualization</CapabilityItem>
            <CapabilityItem>Rating adjustment tracking with justification</CapabilityItem>
            <CapabilityItem>AI-assisted calibration analysis</CapabilityItem>
            <CapabilityItem>Override audit logging for compliance</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Performance Analytics" icon={BarChart3}>
            <CapabilityItem>Recognition dashboards with trending</CapabilityItem>
            <CapabilityItem>Feedback frequency metrics by team/manager</CapabilityItem>
            <CapabilityItem>Engagement score correlation analysis</CapabilityItem>
            <CapabilityItem>AI-powered performance insights</CapabilityItem>
            <CapabilityItem>Predictive performance modeling</CapabilityItem>
            <CapabilityItem>Check-in completion analytics</CapabilityItem>
            <CapabilityItem>IDP and PIP outcome tracking</CapabilityItem>
          </CapabilityCategory>
        </div>

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
      </div>
    </ModuleCapabilityCard>
  );
};
