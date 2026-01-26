import {
  AICapabilitiesOverview,
  AISignalProcessingEngine,
  AIDevelopmentThemeGeneration,
  AIWritingQualityAnalysis,
  AIBiasDetectionWarnings,
  AISentimentAnalysis,
  AIBlindSpotIdentification,
  AICoachingPromptsGeneration,
  AIIDPLearningIntegration,
  AIRemeasurementTracking,
  AICrossModuleIntelligence,
  AIExplainabilityHumanOverride,
  AIIncidentResponseProcedure,
  AISLAHumanReviewConfig,
  AIModelDriftMonitoring
} from './sections/ai';
import { Brain } from 'lucide-react';

export function F360AISection() {
  return (
    <div className="space-y-12">
      <div data-manual-anchor="part-5" id="part-5">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          5. AI & Intelligence Features
        </h2>
        <p className="text-muted-foreground mb-6">
          Comprehensive AI-powered capabilities for 360 feedback: signal processing, theme generation, 
          writing quality analysis, bias detection, coaching prompts, and cross-module intelligence 
          with full ISO 42001 governance and explainability.
        </p>
      </div>

      {/* Group A: Foundation */}
      <AICapabilitiesOverview />
      
      {/* Group B: Core Processing */}
      <AISignalProcessingEngine />
      <AIDevelopmentThemeGeneration />
      
      {/* Group C: Real-Time Analysis */}
      <AIWritingQualityAnalysis />
      <AIBiasDetectionWarnings />
      <AISentimentAnalysis />
      
      {/* Group D: Insight Generation */}
      <AIBlindSpotIdentification />
      <AICoachingPromptsGeneration />
      
      {/* Group E: Development Integration */}
      <AIIDPLearningIntegration />
      <AIRemeasurementTracking />
      
      {/* Group F: Cross-Module Intelligence */}
      <AICrossModuleIntelligence />
      
      {/* Group G: AI Governance */}
      <AIExplainabilityHumanOverride />
      <AIIncidentResponseProcedure />
      <AISLAHumanReviewConfig />
      <AIModelDriftMonitoring />
    </div>
  );
}
