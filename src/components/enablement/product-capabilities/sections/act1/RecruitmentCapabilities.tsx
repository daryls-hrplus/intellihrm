import { Briefcase, Users, FileSearch, Calendar, Mail, CheckSquare } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";

export function RecruitmentCapabilities() {
  return (
    <ModuleCapabilityCard
      id="recruitment"
      icon={Briefcase}
      title="Recruitment"
      tagline="Find, attract, and hire the best talent faster"
      overview="Complete Applicant Tracking System with requisition management, candidate pipeline, and seamless onboarding integration."
      accentColor="bg-blue-500/10 text-blue-500"
      badge="55+ Capabilities"
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Requisition Management" icon={FileSearch}>
            <CapabilityItem>Job requisition creation and approval</CapabilityItem>
            <CapabilityItem>Multi-level approval workflows</CapabilityItem>
            <CapabilityItem>Budget tracking and headcount control</CapabilityItem>
            <CapabilityItem>Position linking and vacancy management</CapabilityItem>
            <CapabilityItem>Hiring manager collaboration</CapabilityItem>
            <CapabilityItem>Requisition templates</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Job Posting & Sourcing" icon={Mail}>
            <CapabilityItem>Branded career portal</CapabilityItem>
            <CapabilityItem>Multi-channel job distribution</CapabilityItem>
            <CapabilityItem>Custom application forms</CapabilityItem>
            <CapabilityItem>Job board integrations</CapabilityItem>
            <CapabilityItem>Employee referral program</CapabilityItem>
            <CapabilityItem>Social media sharing</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Candidate Pipeline" icon={Users}>
            <CapabilityItem>Visual pipeline management</CapabilityItem>
            <CapabilityItem>Stage-based candidate tracking</CapabilityItem>
            <CapabilityItem>Bulk actions and updates</CapabilityItem>
            <CapabilityItem>Talent pool management</CapabilityItem>
            <CapabilityItem>Duplicate candidate detection</CapabilityItem>
            <CapabilityItem>Candidate communication history</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Selection & Assessment" icon={CheckSquare}>
            <CapabilityItem>Configurable scorecards</CapabilityItem>
            <CapabilityItem>Interview scheduling with calendar sync</CapabilityItem>
            <CapabilityItem>Panel review workflows</CapabilityItem>
            <CapabilityItem>Assessment integrations</CapabilityItem>
            <CapabilityItem>Offer comparison tools</CapabilityItem>
            <CapabilityItem>Background check tracking</CapabilityItem>
          </CapabilityCategory>
        </div>

        <AIFeatureHighlight>
          <AICapability type="automated">Resume parsing and data extraction</AICapability>
          <AICapability type="predictive">Candidate-job matching scores</AICapability>
          <AICapability type="compliance">Bias detection in screening</AICapability>
          <AICapability type="analytics">Time-to-hire predictions</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Workforce", description: "Automatic employee record creation on hire" },
            { module: "Onboarding", description: "Pre-boarding task assignment" },
            { module: "Compensation", description: "Salary benchmarking for offers" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}
