import {
  AIFeedbackOverview,
  GeneratingStrengthStatements,
  DevelopmentSuggestionsIDP,
  BiasDetectionRemediation,
  CommentQualityAnalysis,
  AIAnalyticsPredictions,
  AICoachingNudges,
  AIPerformanceRiskDetection
} from './sections/ai';

export function ManualAISection() {
  return (
    <div className="space-y-8">
      <AIFeedbackOverview />
      <GeneratingStrengthStatements />
      <DevelopmentSuggestionsIDP />
      <BiasDetectionRemediation />
      <CommentQualityAnalysis />
      <AIAnalyticsPredictions />
      <AICoachingNudges />
      <AIPerformanceRiskDetection />
    </div>
  );
}
