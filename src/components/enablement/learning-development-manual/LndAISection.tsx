import { 
  LndAIOverview,
  LndAISkillGapDetection,
  LndAITrainingNeedsAnalysis,
  LndAICourseRecommendations,
  LndAILearningAnalytics,
  LndAIContentGeneration,
  LndAIGovernance,
  LndAIModelRegistry,
} from './sections/ai';

export function LndAISection() {
  return (
    <div className="space-y-12">
      {/* Chapter Introduction */}
      <div className="pb-6 border-b">
        <h1 className="text-3xl font-bold mb-2">Chapter 6: AI-Powered Learning Intelligence</h1>
        <p className="text-muted-foreground">
          This chapter documents the AI capabilities within the Learning & Development module, including 
          skill gap detection, course recommendations, training analytics, and ISO 42001 governance compliance.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs bg-muted px-2 py-1 rounded">8 Sections</span>
          <span className="text-xs bg-muted px-2 py-1 rounded">~30 min read</span>
          <span className="text-xs bg-muted px-2 py-1 rounded">7 Database Tables</span>
        </div>
      </div>

      {/* Section A: Foundation */}
      <div className="space-y-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wide">
          <span className="h-px flex-1 bg-border"></span>
          <span>Section A: Foundation</span>
          <span className="h-px flex-1 bg-border"></span>
        </div>
        <LndAIOverview />
      </div>

      {/* Section B: Skill & Gap Analysis */}
      <div className="space-y-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wide">
          <span className="h-px flex-1 bg-border"></span>
          <span>Section B: Skill & Gap Analysis</span>
          <span className="h-px flex-1 bg-border"></span>
        </div>
        <LndAISkillGapDetection />
        <LndAITrainingNeedsAnalysis />
      </div>

      {/* Section C: Recommendations & Learning Paths */}
      <div className="space-y-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wide">
          <span className="h-px flex-1 bg-border"></span>
          <span>Section C: Recommendations</span>
          <span className="h-px flex-1 bg-border"></span>
        </div>
        <LndAICourseRecommendations />
      </div>

      {/* Section D: Analytics & Insights */}
      <div className="space-y-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wide">
          <span className="h-px flex-1 bg-border"></span>
          <span>Section D: Analytics & Insights</span>
          <span className="h-px flex-1 bg-border"></span>
        </div>
        <LndAILearningAnalytics />
      </div>

      {/* Section E: Content Generation */}
      <div className="space-y-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wide">
          <span className="h-px flex-1 bg-border"></span>
          <span>Section E: Content Generation</span>
          <span className="h-px flex-1 bg-border"></span>
        </div>
        <LndAIContentGeneration />
      </div>

      {/* Section F: Governance & Compliance */}
      <div className="space-y-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wide">
          <span className="h-px flex-1 bg-border"></span>
          <span>Section F: Governance & Compliance</span>
          <span className="h-px flex-1 bg-border"></span>
        </div>
        <LndAIGovernance />
        <LndAIModelRegistry />
      </div>
    </div>
  );
}
