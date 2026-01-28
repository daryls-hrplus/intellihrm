import { Play } from 'lucide-react';
import {
  LndWorkflowCourseLifecycle,
  LndWorkflowEnrollment,
  LndWorkflowRequestGapAnalysis,
  LndWorkflowRequestAppraisal,
  LndWorkflowRequestSelfService,
  LndWorkflowRequestOnboarding,
  LndWorkflowRequestHR,
  LndWorkflowInvitations,
  LndWorkflowProgressTracking,
  LndWorkflowQuizDelivery,
  LndWorkflowCompletion,
  LndWorkflowCertification,
  LndWorkflowTrainingHistory,
  LndWorkflowExternalRecords,
  LndWorkflowCalendar,
  LndWorkflowSessionManagement,
  LndWorkflowVirtualClassroom,
  LndWorkflowWaitlist,
  LndWorkflowLearnerJourney,
  LndWorkflowHRHubIntegration,
  LndWorkflowCourseReviews
} from './sections/workflows';

export function LndWorkflowsSection() {
  return (
    <div className="space-y-12">
      {/* Chapter Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Play className="h-8 w-8 text-blue-600" />
          Chapter 4: Operational Workflows
        </h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Day-to-day training operations covering the complete learner journey,
          training request lifecycle, session delivery, and historical records.
          This chapter follows the ADDIE framework (Analysis, Design, Development,
          Implementation, Evaluation) for industry alignment.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-sm bg-muted px-3 py-1 rounded-full">21 Sections</span>
          <span className="text-sm bg-muted px-3 py-1 rounded-full">~120 min read</span>
          <span className="text-sm bg-muted px-3 py-1 rounded-full">12 Database Tables</span>
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">HR Hub Integration</span>
        </div>
      </div>

      {/* SECTION A: LEARNER JOURNEY */}
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <h2 className="text-xl font-semibold text-emerald-800 dark:text-emerald-200">
            Section A: Learner Journey (Demand-Side)
          </h2>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
            Sections 4.1–4.6 • End-to-end learner experience from discovery to certification
          </p>
        </div>
        <LndWorkflowLearnerJourney />
        <LndWorkflowEnrollment />
        <LndWorkflowProgressTracking />
        <LndWorkflowQuizDelivery />
        <LndWorkflowCompletion />
        <LndWorkflowCertification />
      </div>

      {/* SECTION B: TRAINING REQUEST LIFECYCLE */}
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200">
            Section B: Training Request Lifecycle (Approval Workflows)
          </h2>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            Sections 4.7–4.13 • Request sources, approval chains, and HR Hub integration
          </p>
        </div>
        <LndWorkflowRequestSelfService />
        <LndWorkflowRequestGapAnalysis />
        <LndWorkflowRequestAppraisal />
        <LndWorkflowRequestOnboarding />
        <LndWorkflowRequestHR />
        <LndWorkflowInvitations />
        <LndWorkflowHRHubIntegration />
      </div>

      {/* SECTION C: SESSION & DELIVERY OPERATIONS */}
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h2 className="text-xl font-semibold text-purple-800 dark:text-purple-200">
            Section C: Session & Delivery Operations (Supply-Side)
          </h2>
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
            Sections 4.14–4.18 • Course lifecycle, ILT sessions, virtual classrooms, and scheduling
          </p>
        </div>
        <LndWorkflowCourseLifecycle />
        <LndWorkflowSessionManagement />
        <LndWorkflowVirtualClassroom />
        <LndWorkflowWaitlist />
        <LndWorkflowCalendar />
      </div>

      {/* SECTION D: HISTORICAL RECORDS & TRANSCRIPTS */}
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
          <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-200">
            Section D: Historical Records & Transcripts
          </h2>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            Sections 4.19–4.21 • Training history, external records, and course reviews
          </p>
        </div>
        <LndWorkflowTrainingHistory />
        <LndWorkflowExternalRecords />
        <LndWorkflowCourseReviews />
      </div>
    </div>
  );
}
