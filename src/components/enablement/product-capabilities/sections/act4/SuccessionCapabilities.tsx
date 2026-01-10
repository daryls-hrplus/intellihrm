import { Crown, Users, TrendingUp, Target, BarChart3, Shuffle, AlertTriangle, UserCheck, Heart, GraduationCap, Layers, GitBranch, Brain, LineChart } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export const SuccessionCapabilities = () => {
  const outcomes = [
    { metric: "90%+", label: "Critical Position Coverage", description: "Identified successors for all key roles" },
    { metric: "70%+", label: "Internal Fill Rate", description: "Promoting from within" },
    { metric: "6 Months", label: "Early Flight Risk Detection", description: "AI-powered early warning" },
    { metric: "30%", label: "Faster Successor Readiness", description: "Targeted development" },
  ];

  const personas = [
    { role: "CHRO", value: "I know our leadership bench is deep and ready" },
    { role: "HR Partner", value: "Succession is proactive, not reactive" },
    { role: "Manager", value: "I can see and develop my team's potential" },
    { role: "High-Potential", value: "I see my path to leadership" },
  ];

  return (
    <ModuleCapabilityCard
      icon={Crown}
      title="Succession Planning"
      tagline="Ensure leadership continuity through data-driven talent intelligence"
      overview="Identify critical positions, build deep talent pipelines, and develop future leaders with AI-powered readiness assessments. The 9-Box becomes a living tool, flight risks are detected before resignations, and career paths light the way forward."
      accentColor="bg-purple-500/10 text-purple-600"
      badge="95+ Capabilities"
      id="succession"
    >
      <div className="space-y-6">
        <ValueStoryHeader
          challenge="Critical positions sit unprotected. When key leaders leave—and they will—organizations scramble to find replacements, losing months of productivity and institutional knowledge. Talent is identified by gut feel, not data. High potentials leave because they see no path forward. The bench is shallow, and succession planning is an annual checkbox exercise."
          promise="Intelli HRM Succession Planning ensures leadership continuity through data-driven talent intelligence. Identify critical positions, build deep talent pipelines, and develop future leaders with AI-powered readiness assessments. The 9-Box becomes a living tool, flight risks are detected before resignations, and career paths light the way forward."
          outcomes={outcomes}
          personas={personas}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Critical Position Management" icon={Target}>
            <CapabilityItem>Critical position identification and tagging</CapabilityItem>
            <CapabilityItem>Vacancy risk assessment scoring</CapabilityItem>
            <CapabilityItem>Business impact analysis for role criticality</CapabilityItem>
            <CapabilityItem>Position criticality matrix visualization</CapabilityItem>
            <CapabilityItem>Coverage gap reporting and alerts</CapabilityItem>
            <CapabilityItem>Time-to-fill risk analysis</CapabilityItem>
            <CapabilityItem>Incumbent tenure tracking and retirement forecasting</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Succession Plans" icon={Layers}>
            <CapabilityItem>Plan creation with version control</CapabilityItem>
            <CapabilityItem>Position-based succession mapping</CapabilityItem>
            <CapabilityItem>Multiple successor nominations per position</CapabilityItem>
            <CapabilityItem>Readiness timeline tracking (now ready, 1-2 years, 3+ years)</CapabilityItem>
            <CapabilityItem>Plan approval workflows</CapabilityItem>
            <CapabilityItem>Historical plan comparison and evolution</CapabilityItem>
            <CapabilityItem>Emergency succession planning</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Successor Candidates" icon={Users}>
            <CapabilityItem>Candidate nomination and ranking</CapabilityItem>
            <CapabilityItem>Readiness assessment capture (ready now, developing, future)</CapabilityItem>
            <CapabilityItem>Evidence documentation for succession decisions</CapabilityItem>
            <CapabilityItem>Development gap identification per candidate</CapabilityItem>
            <CapabilityItem>Readiness indicator tracking</CapabilityItem>
            <CapabilityItem>Candidate comparison tools</CapabilityItem>
            <CapabilityItem>Successor backup and contingency planning</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Nine-Box Assessment" icon={BarChart3}>
            <CapabilityItem>Configurable 9-Box framework</CapabilityItem>
            <CapabilityItem>Performance axis configuration and data sources</CapabilityItem>
            <CapabilityItem>Potential axis configuration with assessment criteria</CapabilityItem>
            <CapabilityItem>Rating source mapping (appraisals, assessments, manager input)</CapabilityItem>
            <CapabilityItem>Signal-based scoring from multiple data points</CapabilityItem>
            <CapabilityItem>Assessment history tracking and movement analysis</CapabilityItem>
            <CapabilityItem>Box movement alerts and trending</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Potential Assessments" icon={Brain}>
            <CapabilityItem>Assessment template configuration</CapabilityItem>
            <CapabilityItem>Question bank management for potential evaluation</CapabilityItem>
            <CapabilityItem>Assessment scale definition</CapabilityItem>
            <CapabilityItem>Multi-rater potential assessment support</CapabilityItem>
            <CapabilityItem>Response aggregation and scoring</CapabilityItem>
            <CapabilityItem>Potential scoring algorithms</CapabilityItem>
            <CapabilityItem>Bias detection in potential ratings</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Talent Pools" icon={Shuffle}>
            <CapabilityItem>Talent pool creation and categorization</CapabilityItem>
            <CapabilityItem>Pool member management and tracking</CapabilityItem>
            <CapabilityItem>Entry criteria configuration</CapabilityItem>
            <CapabilityItem>Pool health metrics (size, readiness distribution)</CapabilityItem>
            <CapabilityItem>Review packet generation for talent discussions</CapabilityItem>
            <CapabilityItem>Pool-to-position mapping</CapabilityItem>
            <CapabilityItem>Pool progression and graduation tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Flight Risk Management" icon={AlertTriangle}>
            <CapabilityItem>Flight risk indicator configuration</CapabilityItem>
            <CapabilityItem>Risk scoring algorithms from multiple signals</CapabilityItem>
            <CapabilityItem>Early warning alerts for high-risk employees</CapabilityItem>
            <CapabilityItem>Risk factor analysis and breakdown</CapabilityItem>
            <CapabilityItem>Retention action tracking</CapabilityItem>
            <CapabilityItem>Risk trend monitoring over time</CapabilityItem>
            <CapabilityItem>AI-powered intervention recommendations</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Career Paths" icon={GitBranch}>
            <CapabilityItem>Career path configuration and visualization</CapabilityItem>
            <CapabilityItem>Path step definition with requirements</CapabilityItem>
            <CapabilityItem>Skill requirement mapping per step</CapabilityItem>
            <CapabilityItem>Experience milestone tracking</CapabilityItem>
            <CapabilityItem>Lateral move opportunity identification</CapabilityItem>
            <CapabilityItem>Career aspiration capture from employees</CapabilityItem>
            <CapabilityItem>Career ladder templates by function</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Career Development" icon={TrendingUp}>
            <CapabilityItem>Career conversation tracking</CapabilityItem>
            <CapabilityItem>Development theme identification</CapabilityItem>
            <CapabilityItem>Career goal alignment with succession needs</CapabilityItem>
            <CapabilityItem>Skill gap remediation planning</CapabilityItem>
            <CapabilityItem>Development resource matching</CapabilityItem>
            <CapabilityItem>Progress milestone tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Mentorship Programs" icon={Heart}>
            <CapabilityItem>Mentorship program configuration</CapabilityItem>
            <CapabilityItem>Mentor-mentee pairing workflows</CapabilityItem>
            <CapabilityItem>AI-assisted matching based on skills and goals</CapabilityItem>
            <CapabilityItem>Session scheduling and tracking</CapabilityItem>
            <CapabilityItem>Goal-based mentoring with milestones</CapabilityItem>
            <CapabilityItem>Mentorship effectiveness metrics</CapabilityItem>
            <CapabilityItem>Mentor pool management</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Leadership Development" icon={GraduationCap}>
            <CapabilityItem>High-potential program management</CapabilityItem>
            <CapabilityItem>Leadership competency tracking</CapabilityItem>
            <CapabilityItem>Stretch assignment management and tracking</CapabilityItem>
            <CapabilityItem>Executive coaching integration</CapabilityItem>
            <CapabilityItem>Leadership pipeline visualization</CapabilityItem>
            <CapabilityItem>Development investment tracking</CapabilityItem>
            <CapabilityItem>External leadership program tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Readiness & Development Plans" icon={UserCheck}>
            <CapabilityItem>Successor development plan creation</CapabilityItem>
            <CapabilityItem>Gap-to-development activity linking</CapabilityItem>
            <CapabilityItem>Learning assignment integration</CapabilityItem>
            <CapabilityItem>Experience-based development tracking</CapabilityItem>
            <CapabilityItem>Readiness acceleration tracking</CapabilityItem>
            <CapabilityItem>Development milestone monitoring</CapabilityItem>
            <CapabilityItem>Progress reporting for successors</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Bench Strength Analytics" icon={BarChart3}>
            <CapabilityItem>Bench strength by position and department</CapabilityItem>
            <CapabilityItem>Coverage depth analysis (1st, 2nd, 3rd line successors)</CapabilityItem>
            <CapabilityItem>Diversity in pipeline metrics</CapabilityItem>
            <CapabilityItem>Readiness distribution visualization</CapabilityItem>
            <CapabilityItem>Succession risk heat maps</CapabilityItem>
            <CapabilityItem>Department and function comparison</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Succession Analytics & AI" icon={LineChart}>
            <CapabilityItem>Comprehensive succession dashboard</CapabilityItem>
            <CapabilityItem>Internal fill rate tracking and trending</CapabilityItem>
            <CapabilityItem>Time-to-readiness forecasting</CapabilityItem>
            <CapabilityItem>Talent movement pattern analysis</CapabilityItem>
            <CapabilityItem>AI-powered successor matching recommendations</CapabilityItem>
            <CapabilityItem>Predictive readiness scoring</CapabilityItem>
            <CapabilityItem>Flight risk correlation with succession gaps</CapabilityItem>
          </CapabilityCategory>
        </div>

        <AIFeatureHighlight>
          <AICapability type="predictive">Flight risk prediction for key talent based on signals</AICapability>
          <AICapability type="prescriptive">AI-matched successor recommendations for critical roles</AICapability>
          <AICapability type="automated">Readiness scoring based on performance and competency data</AICapability>
          <AICapability type="prescriptive">Development gap prioritization for fastest readiness</AICapability>
          <AICapability type="predictive">Leadership potential identification from career patterns</AICapability>
          <AICapability type="automated">Mentor matching optimization based on skills and chemistry</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Performance", description: "Performance data for readiness assessment" },
            { module: "Learning", description: "Development program enrollment and tracking" },
            { module: "Workforce", description: "Position and org structure data" },
            { module: "Compensation", description: "Retention planning for key successors" },
            { module: "360 Feedback", description: "Leadership competency assessment" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
};
