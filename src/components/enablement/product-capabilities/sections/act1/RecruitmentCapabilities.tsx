import { 
  Briefcase, 
  Users, 
  FileSearch, 
  Mail, 
  CheckSquare, 
  Calendar, 
  Gift, 
  BarChart3,
  Send,
  User,
  UserCog,
  Target,
  FileText
} from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ChallengePromise } from "../../components/ChallengePromise";
import { PersonaValueCard, PersonaGrid } from "../../components/PersonaValueCard";
import { KeyOutcomeMetrics } from "../../components/KeyOutcomeMetrics";
import { RegionalAdvantage } from "../../components/RegionalAdvantage";
import { Separator } from "@/components/ui/separator";

export function RecruitmentCapabilities() {
  return (
    <ModuleCapabilityCard
      id="recruitment"
      icon={Briefcase}
      title="Recruitment"
      tagline="Find, attract, and hire the best talent faster"
      overview="Complete Applicant Tracking System with AI-powered sourcing, structured assessments, interview coordination, offer management, and seamless onboarding integration. Your end-to-end talent acquisition command center."
      accentColor="bg-blue-500/10 text-blue-500"
      badge="85+ Capabilities"
    >
      <div className="space-y-6">
        {/* Challenge & Promise */}
        <ChallengePromise
          challenge="Every open position costs $500 per day unfilled. Manual resume screening misses qualified candidates, interview chaos frustrates hiring managers, and disjointed communication damages your employer brand. Without a unified system, great talent slips through the cracks while competitors move faster."
          promise="Intelli HRM Recruitment is your complete talent acquisition command center. From requisition to offer acceptance, AI-powered sourcing, structured interviews, and seamless candidate experiences ensure you hire the best talent 50% faster—while maintaining full compliance and eliminating bias."
        />

        {/* Key Outcomes */}
        <KeyOutcomeMetrics
          outcomes={[
            { value: "50%", label: "Faster Time-to-Hire", description: "AI screening + automated workflows", trend: "up" },
            { value: "35%", label: "Higher Candidate Quality", description: "AI matching + structured assessment", trend: "up" },
            { value: "40%", label: "Lower Cost-per-Hire", description: "Job board optimization + referrals", trend: "down" },
            { value: "85%+", label: "Offer Acceptance Rate", description: "Streamlined offer management", trend: "up" },
          ]}
        />

        {/* Persona Value Cards */}
        <PersonaGrid>
          <PersonaValueCard
            icon={Target}
            persona="Recruiter"
            benefit="AI handles the noise so I focus on the best candidates"
            accentColor="text-blue-500 bg-blue-500/10"
            outcomes={[
              "AI-powered candidate matching and ranking",
              "Automated screening with skill extraction",
              "One-click candidate communication tools",
            ]}
          />
          <PersonaValueCard
            icon={Briefcase}
            persona="Hiring Manager"
            benefit="I see exactly who's in my pipeline and why"
            accentColor="text-purple-500 bg-purple-500/10"
            outcomes={[
              "Real-time pipeline visibility with stage tracking",
              "Structured scorecards for consistent evaluation",
              "Interview feedback aggregation and insights",
            ]}
          />
          <PersonaValueCard
            icon={UserCog}
            persona="HR Leader"
            benefit="Complete visibility into hiring metrics and compliance"
            accentColor="text-teal-500 bg-teal-500/10"
            outcomes={[
              "Source effectiveness and diversity analytics",
              "Time-to-fill tracking by department and role",
              "Bias detection in screening and job postings",
            ]}
          />
          <PersonaValueCard
            icon={User}
            persona="Candidate"
            benefit="Professional experience that reflects the company brand"
            accentColor="text-emerald-500 bg-emerald-500/10"
            outcomes={[
              "Branded career portal with easy application",
              "Self-service interview scheduling",
              "Real-time status updates and communication",
            ]}
          />
        </PersonaGrid>

        <Separator className="my-6" />

        {/* Capability Deep Dive */}
        <div className="space-y-1 mb-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Capability Deep Dive
          </h4>
          <p className="text-xs text-muted-foreground">
            Explore the complete talent acquisition capabilities from requisition to hire
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory 
            title="Requisition Management" 
            icon={FileSearch}
            context="Every hire starts with proper authorization and budget alignment. Requisitions ensure headcount control and approval compliance."
          >
            <CapabilityItem>Job requisition creation with position linking</CapabilityItem>
            <CapabilityItem>Multi-level approval workflows with configurable routing</CapabilityItem>
            <CapabilityItem>Budget tracking and headcount control validation</CapabilityItem>
            <CapabilityItem>Hiring manager collaboration portal</CapabilityItem>
            <CapabilityItem>Requisition templates by job family</CapabilityItem>
            <CapabilityItem>Headcount request integration with workforce planning</CapabilityItem>
            <CapabilityItem>Requisition cloning and bulk creation</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Job Posting & Sourcing" 
            icon={Mail}
            context="Reach the right candidates across every channel with consistent branding. Multi-channel distribution maximizes qualified applicant flow."
          >
            <CapabilityItem>Branded career portal with SEO optimization</CapabilityItem>
            <CapabilityItem>Multi-channel job distribution (job boards, social)</CapabilityItem>
            <CapabilityItem>Custom application forms by job type</CapabilityItem>
            <CapabilityItem>Job board API integrations (Indeed, LinkedIn, etc.)</CapabilityItem>
            <CapabilityItem>Posting performance analytics by channel</CapabilityItem>
            <CapabilityItem>Social media amplification and sharing</CapabilityItem>
            <CapabilityItem>AI-powered job description optimization</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Candidate Pipeline" 
            icon={Users}
            context="Visual pipeline management ensures no candidate falls through the cracks. Real-time tracking keeps hiring on schedule."
          >
            <CapabilityItem>Kanban-style pipeline visualization</CapabilityItem>
            <CapabilityItem>Stage-based candidate tracking with SLAs</CapabilityItem>
            <CapabilityItem>Bulk actions and stage transitions</CapabilityItem>
            <CapabilityItem>Talent pool management for future opportunities</CapabilityItem>
            <CapabilityItem>Duplicate candidate detection and merging</CapabilityItem>
            <CapabilityItem>Communication history with full audit trail</CapabilityItem>
            <CapabilityItem>Candidate tagging and custom field tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Selection & Assessment" 
            icon={CheckSquare}
            context="Structured evaluation eliminates bias and improves hire quality. Consistent assessment frameworks ensure fair candidate comparison."
          >
            <CapabilityItem>Configurable interview scorecards by role</CapabilityItem>
            <CapabilityItem>Built-in assessment creation and administration</CapabilityItem>
            <CapabilityItem>Competency-based evaluation frameworks</CapabilityItem>
            <CapabilityItem>Video interview support and recording</CapabilityItem>
            <CapabilityItem>Assessment scoring and comparative analytics</CapabilityItem>
            <CapabilityItem>Panel review consensus tools</CapabilityItem>
            <CapabilityItem>Background check integration and tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Interview Scheduling" 
            icon={Calendar}
            context="Scheduling chaos kills candidate experience. Automation fixes it and frees recruiters for higher-value activities."
          >
            <CapabilityItem>Calendar integration (Google, Outlook, Office 365)</CapabilityItem>
            <CapabilityItem>Self-service candidate scheduling links</CapabilityItem>
            <CapabilityItem>Interview panel coordination and availability</CapabilityItem>
            <CapabilityItem>Room and resource booking integration</CapabilityItem>
            <CapabilityItem>Automated reminders and confirmations</CapabilityItem>
            <CapabilityItem>Time zone intelligent scheduling</CapabilityItem>
            <CapabilityItem>Rescheduling workflows with notifications</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Offer Management" 
            icon={Send}
            context="The offer stage is where deals are won or lost. Streamlined offers with competitive benchmarking close candidates faster."
          >
            <CapabilityItem>Digital offer letter generation with templates</CapabilityItem>
            <CapabilityItem>Offer approval workflows with compensation validation</CapabilityItem>
            <CapabilityItem>Counter-offer negotiation tracking</CapabilityItem>
            <CapabilityItem>Compensation benchmarking integration</CapabilityItem>
            <CapabilityItem>Equity, bonus, and benefits configuration</CapabilityItem>
            <CapabilityItem>Offer expiry tracking and acceptance management</CapabilityItem>
            <CapabilityItem>E-signature integration for offer acceptance</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Referral Program" 
            icon={Gift}
            context="Employee referrals deliver 4x better retention at 50% lower cost. A structured program amplifies your best sourcing channel."
          >
            <CapabilityItem>Employee referral submission portal</CapabilityItem>
            <CapabilityItem>Reward tier configuration by role/level</CapabilityItem>
            <CapabilityItem>Referral tracking and status updates</CapabilityItem>
            <CapabilityItem>Referrer notifications at each stage</CapabilityItem>
            <CapabilityItem>Payout tracking and approval workflows</CapabilityItem>
            <CapabilityItem>Program analytics and leaderboards</CapabilityItem>
            <CapabilityItem>Referral source attribution in hiring reports</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Recruitment Analytics" 
            icon={BarChart3}
            context="Data-driven recruitment optimizes every stage of the funnel. Insights turn hiring from art into science."
          >
            <CapabilityItem>Source effectiveness tracking and ROI</CapabilityItem>
            <CapabilityItem>Time-to-fill and time-to-hire metrics</CapabilityItem>
            <CapabilityItem>Pipeline conversion rates by stage</CapabilityItem>
            <CapabilityItem>Diversity analytics and EEO reporting</CapabilityItem>
            <CapabilityItem>Hiring manager performance metrics</CapabilityItem>
            <CapabilityItem>Cost-per-hire analysis by source</CapabilityItem>
            <CapabilityItem>Quality-of-hire tracking post-hire</CapabilityItem>
          </CapabilityCategory>
        </div>

        {/* Regional Advantage */}
        <RegionalAdvantage
          regions={["Caribbean", "Africa", "LatAm"]}
          advantages={[
            "Local job board integrations for Caribbean and African markets",
            "Multi-language career portals and applications",
            "Regional compliance for background checks and references",
            "Work permit and immigration status tracking",
          ]}
        />

        <AIFeatureHighlight>
          <AICapability type="automated">Resume parsing and skill extraction with 95%+ accuracy</AICapability>
          <AICapability type="predictive">Candidate-job matching scores with explainable recommendations</AICapability>
          <AICapability type="compliance">Bias detection in job postings and screening criteria</AICapability>
          <AICapability type="analytics">Time-to-hire predictions and bottleneck identification</AICapability>
          <AICapability type="prescriptive">Optimal job posting timing and channel recommendations</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Workforce", description: "Automatic employee record creation on hire", bidirectional: true },
            { module: "Onboarding", description: "Pre-boarding task assignment on offer acceptance" },
            { module: "Compensation", description: "Salary benchmarking for competitive offers" },
            { module: "Position Management", description: "Vacancy tracking and headcount control" },
            { module: "Learning", description: "Required certification validation in screening" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}
