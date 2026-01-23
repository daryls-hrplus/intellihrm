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
      <section id="sec-5-1" data-manual-anchor="sec-5-1" className="scroll-mt-32">
        <AIFeedbackOverview />
      </section>
      <section id="sec-5-2" data-manual-anchor="sec-5-2" className="scroll-mt-32">
        <GeneratingStrengthStatements />
      </section>
      <section id="sec-5-3" data-manual-anchor="sec-5-3" className="scroll-mt-32">
        <DevelopmentSuggestionsIDP />
      </section>
      <section id="sec-5-4" data-manual-anchor="sec-5-4" className="scroll-mt-32">
        <BiasDetectionRemediation />
      </section>
      <section id="sec-5-5" data-manual-anchor="sec-5-5" className="scroll-mt-32">
        <CommentQualityAnalysis />
      </section>
      <section id="sec-5-6" data-manual-anchor="sec-5-6" className="scroll-mt-32">
        <AIAnalyticsPredictions />
      </section>
      <section id="sec-5-7" data-manual-anchor="sec-5-7" className="scroll-mt-32">
        <AICoachingNudges />
      </section>
      <section id="sec-5-8" data-manual-anchor="sec-5-8" className="scroll-mt-32">
        <AIPerformanceRiskDetection />
      </section>
    </div>
  );
}
