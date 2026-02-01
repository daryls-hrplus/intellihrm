// Quick Start Template System Exports

// Main template component
export { QuickStartTemplate } from "./QuickStartTemplate";

// Data files for each module
export { LND_QUICKSTART_DATA } from "./data/learning-development";
export { TA_QUICKSTART_DATA } from "./data/time-attendance";

// Re-export types for convenience
export type {
  QuickStartData,
  QuickStartRole,
  QuickStartPrerequisite,
  QuickStartSetupStep,
  QuickStartPitfall,
  QuickStartSuccessMetric,
  QuickStartIntegrationItem,
  QuickStartRolloutOption,
  QuickStartNextStep,
} from "@/types/quickstart";
