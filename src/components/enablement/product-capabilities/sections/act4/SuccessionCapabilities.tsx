import { Crown, Users, TrendingUp, Target, BarChart3, Shuffle, AlertTriangle, UserCheck, Heart, GraduationCap, Layers, GitBranch, Brain, LineChart } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export const SuccessionCapabilities = () => {
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
      <ValueStoryHeader
        challenge="Critical positions sit unprotected. When key leaders leave—and they will—organizations scramble to find replacements, losing months of productivity and institutional knowledge. Talent is identified by gut feel, not data. High potentials leave because they see no path forward. The bench is shallow, and succession planning is an annual checkbox exercise."
        promise="HRplus Succession Planning ensures leadership continuity through data-driven talent intelligence. Identify critical positions, build deep talent pipelines, and develop future leaders with AI-powered readiness assessments. The 9-Box becomes a living tool, flight risks are detected before resignations, and career paths light the way forward."
        outcomes={[
          { metric: "90%+", label: "Critical Position Coverage", description: "Identified successors for all key roles" },
          { metric: "70%+", label: "Internal Fill Rate", description: "Promoting from within" },
          { metric: "6 Months", label: "Early Flight Risk Detection", description: "AI-powered early warning" },
          { metric: "30%", label: "Faster Successor Readiness", description: "Targeted development" },
        ]}
        personas={[
          { role: "CHRO", value: "I know our leadership bench is deep and ready" },
          { role: "HR Partner", value: "Succession is proactive, not reactive" },
          { role: "Manager", value: "I can see and develop my team's potential" },
          { role: "High-Potential", value: "I see my path to leadership" },
        ]}
      />

      <CapabilityCategory title="Critical Position Management" icon={Target}>
        <li>Critical position identification and tagging</li>
        <li>Vacancy risk assessment scoring</li>
        <li>Business impact analysis for role criticality</li>
        <li>Position criticality matrix visualization</li>
        <li>Coverage gap reporting and alerts</li>
        <li>Time-to-fill risk analysis</li>
        <li>Incumbent tenure tracking and retirement forecasting</li>
        <li>Critical role categorization (leadership, technical, specialized)</li>
      </CapabilityCategory>

      <CapabilityCategory title="Succession Plans" icon={Layers}>
        <li>Plan creation with version control</li>
        <li>Position-based succession mapping</li>
        <li>Multiple successor nominations per position</li>
        <li>Readiness timeline tracking (now ready, 1-2 years, 3+ years)</li>
        <li>Plan approval workflows</li>
        <li>Historical plan comparison and evolution</li>
        <li>Plan effectiveness metrics</li>
        <li>Emergency succession planning</li>
      </CapabilityCategory>

      <CapabilityCategory title="Successor Candidates" icon={Users}>
        <li>Candidate nomination and ranking</li>
        <li>Readiness assessment capture (ready now, developing, future)</li>
        <li>Evidence documentation for succession decisions</li>
        <li>Development gap identification per candidate</li>
        <li>Readiness indicator tracking</li>
        <li>Candidate comparison tools</li>
        <li>Promotion readiness scoring</li>
        <li>Successor backup and contingency planning</li>
      </CapabilityCategory>

      <CapabilityCategory title="Nine-Box Assessment" icon={BarChart3}>
        <li>Configurable 9-Box framework</li>
        <li>Performance axis configuration and data sources</li>
        <li>Potential axis configuration with assessment criteria</li>
        <li>Rating source mapping (appraisals, assessments, manager input)</li>
        <li>Signal-based scoring from multiple data points</li>
        <li>Evidence source integration</li>
        <li>Assessment history tracking and movement analysis</li>
        <li>Box movement alerts and trending</li>
      </CapabilityCategory>

      <CapabilityCategory title="Potential Assessments" icon={Brain}>
        <li>Assessment template configuration</li>
        <li>Question bank management for potential evaluation</li>
        <li>Assessment scale definition</li>
        <li>Multi-rater potential assessment support</li>
        <li>Response aggregation and scoring</li>
        <li>Potential scoring algorithms</li>
        <li>Assessment analytics and validation</li>
        <li>Bias detection in potential ratings</li>
      </CapabilityCategory>

      <CapabilityCategory title="Talent Pools" icon={Shuffle}>
        <li>Talent pool creation and categorization</li>
        <li>Pool member management and tracking</li>
        <li>Entry criteria configuration</li>
        <li>Pool health metrics (size, readiness distribution)</li>
        <li>Review packet generation for talent discussions</li>
        <li>Pool-to-position mapping</li>
        <li>Development tracking by pool</li>
        <li>Pool progression and graduation tracking</li>
      </CapabilityCategory>

      <CapabilityCategory title="Flight Risk Management" icon={AlertTriangle}>
        <li>Flight risk indicator configuration</li>
        <li>Risk scoring algorithms from multiple signals</li>
        <li>Early warning alerts for high-risk employees</li>
        <li>Risk factor analysis and breakdown</li>
        <li>Retention action tracking</li>
        <li>Risk trend monitoring over time</li>
        <li>AI-powered intervention recommendations</li>
        <li>Critical employee watch lists</li>
      </CapabilityCategory>

      <CapabilityCategory title="Career Paths" icon={GitBranch}>
        <li>Career path configuration and visualization</li>
        <li>Path step definition with requirements</li>
        <li>Skill requirement mapping per step</li>
        <li>Experience milestone tracking</li>
        <li>Lateral move opportunity identification</li>
        <li>Career aspiration capture from employees</li>
        <li>Path visualization tools for employees</li>
        <li>Career ladder templates by function</li>
      </CapabilityCategory>

      <CapabilityCategory title="Career Development" icon={TrendingUp}>
        <li>Career conversation tracking</li>
        <li>Development theme identification</li>
        <li>Career goal alignment with succession needs</li>
        <li>Skill gap remediation planning</li>
        <li>Development resource matching</li>
        <li>Progress milestone tracking</li>
        <li>Manager coaching for career discussions</li>
      </CapabilityCategory>

      <CapabilityCategory title="Mentorship Programs" icon={Heart}>
        <li>Mentorship program configuration</li>
        <li>Mentor-mentee pairing workflows</li>
        <li>AI-assisted matching based on skills and goals</li>
        <li>Session scheduling and tracking</li>
        <li>Goal-based mentoring with milestones</li>
        <li>Mentorship effectiveness metrics</li>
        <li>Program analytics and participation tracking</li>
        <li>Mentor pool management</li>
      </CapabilityCategory>

      <CapabilityCategory title="Leadership Development" icon={GraduationCap}>
        <li>High-potential program management</li>
        <li>Leadership competency tracking</li>
        <li>Stretch assignment management and tracking</li>
        <li>Executive coaching integration</li>
        <li>Leadership pipeline visualization</li>
        <li>Development investment tracking</li>
        <li>Cohort-based development programs</li>
        <li>External leadership program tracking</li>
      </CapabilityCategory>

      <CapabilityCategory title="Readiness & Development Plans" icon={UserCheck}>
        <li>Successor development plan creation</li>
        <li>Gap-to-development activity linking</li>
        <li>Learning assignment integration</li>
        <li>Experience-based development tracking</li>
        <li>Readiness acceleration tracking</li>
        <li>Development milestone monitoring</li>
        <li>Action plan templates by readiness gap</li>
        <li>Progress reporting for successors</li>
      </CapabilityCategory>

      <CapabilityCategory title="Bench Strength Analytics" icon={BarChart3}>
        <li>Bench strength by position and department</li>
        <li>Coverage depth analysis (1st, 2nd, 3rd line successors)</li>
        <li>Diversity in pipeline metrics</li>
        <li>Readiness distribution visualization</li>
        <li>Succession risk heat maps</li>
        <li>Department and function comparison</li>
        <li>Trend analysis over time</li>
      </CapabilityCategory>

      <CapabilityCategory title="Succession Analytics & AI" icon={LineChart}>
        <li>Comprehensive succession dashboard</li>
        <li>Internal fill rate tracking and trending</li>
        <li>Time-to-readiness forecasting</li>
        <li>Talent movement pattern analysis</li>
        <li>AI-powered successor matching recommendations</li>
        <li>Predictive readiness scoring</li>
        <li>Flight risk correlation with succession gaps</li>
        <li>ROI analysis for development investments</li>
      </CapabilityCategory>

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
    </ModuleCapabilityCard>
  );
};
