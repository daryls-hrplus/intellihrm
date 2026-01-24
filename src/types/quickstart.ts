// Quick Start Guide Template Types
import { LucideIcon } from "lucide-react";

export interface QuickStartRole {
  role: string;
  title: string;
  icon: LucideIcon;
  responsibility: string;
}

export interface QuickStartPrerequisite {
  id: string;
  title: string;
  description: string;
  required: boolean;
  href?: string;
  module?: string;
}

export interface QuickStartSetupStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  substeps?: string[];
  expectedResult?: string;
  href?: string;
}

export interface QuickStartPitfall {
  issue: string;
  prevention: string;
}

export interface QuickStartSuccessMetric {
  metric: string;
  target: string;
  howToMeasure: string;
}

export interface QuickStartIntegrationItem {
  id: string;
  label: string;
  required: boolean;
}

export interface QuickStartRolloutOption {
  id: string;
  label: string;
  description: string;
}

export interface QuickStartNextStep {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface QuickStartData {
  // Module identity
  moduleCode: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  colorClass: string; // e.g., "emerald", "blue", "purple"
  
  // Time estimates
  quickSetupTime: string; // e.g., "15-30 minutes"
  fullConfigTime: string; // e.g., "2-4 hours"
  
  // Content sections
  roles: QuickStartRole[];
  prerequisites: QuickStartPrerequisite[];
  pitfalls: QuickStartPitfall[];
  contentStrategyQuestions: string[];
  setupSteps: QuickStartSetupStep[];
  rolloutOptions: QuickStartRolloutOption[];
  rolloutRecommendation: string;
  verificationChecks: string[];
  integrationChecklist: QuickStartIntegrationItem[];
  successMetrics: QuickStartSuccessMetric[];
  nextSteps: QuickStartNextStep[];
  
  // Breadcrumb configuration
  breadcrumbLabel: string;
}
