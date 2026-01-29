import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Users, ClipboardCheck, Settings, History, FileText, Calendar, Medal } from 'lucide-react';

// Section A: Course Delivery Lifecycle (4.1-4.6)
import {
  LndWorkflowLearnerJourney,
  LndWorkflowEnrollment,
  LndWorkflowProgressTracking,
  LndWorkflowQuizDelivery,
  LndWorkflowCompletion,
  LndWorkflowCertification,
} from './sections/workflows';

// Section B: Training Request Lifecycle (4.7-4.13)
import {
  LndWorkflowRequestSelfService,
  LndWorkflowRequestGapAnalysis,
  LndWorkflowRequestAppraisal,
  LndWorkflowRequestOnboarding,
  LndWorkflowRequestHR,
  LndWorkflowInvitations,
  LndWorkflowHRHubIntegration,
} from './sections/workflows';

// Section C: Session & Delivery Operations (4.14-4.18)
import {
  LndWorkflowCourseLifecycle,
  LndWorkflowSessionManagement,
  LndWorkflowVirtualClassroom,
  LndWorkflowWaitlist,
  LndWorkflowCalendar,
} from './sections/workflows';

// Section D: Historical Records & Transcripts (4.19-4.21)
import {
  LndWorkflowTrainingHistory,
  LndWorkflowExternalRecords,
  LndWorkflowCourseReviews,
} from './sections/workflows';

export function LndWorkflowsSection() {
  return (
    <div className="space-y-8">
      {/* Chapter Header */}
      <Card id="lnd-ch-4" data-manual-anchor="lnd-ch-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Play className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Chapter 4: Operational Workflows</CardTitle>
              <CardDescription>
                Day-to-day training operations covering the complete learner journey,
                training request lifecycle, session delivery, and historical records
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">L&D Administrator</Badge>
            <Badge variant="outline">HR Partner</Badge>
            <Badge variant="outline">Manager</Badge>
            <Badge variant="outline">Employee</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            This chapter follows the ADDIE framework (Analysis, Design, Development,
            Implementation, Evaluation) for industry alignment. It covers 21 operational 
            workflows across 4 functional areas with HR Hub integration.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs bg-muted px-2 py-1 rounded">21 Sections</span>
            <span className="text-xs bg-muted px-2 py-1 rounded">~120 min read</span>
            <span className="text-xs bg-muted px-2 py-1 rounded">12 Database Tables</span>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">HR Hub Integration</span>
          </div>
        </CardContent>
      </Card>

      {/* Section A: Learner Journey / Course Delivery Lifecycle */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg">Section A: Course Delivery Lifecycle (4.1-4.6)</CardTitle>
          </div>
          <CardDescription>End-to-end learner experience from discovery through certification</CardDescription>
        </CardHeader>
      </Card>

      <LndWorkflowLearnerJourney />
      <Separator />
      <LndWorkflowEnrollment />
      <Separator />
      <LndWorkflowProgressTracking />
      <Separator />
      <LndWorkflowQuizDelivery />
      <Separator />
      <LndWorkflowCompletion />
      <Separator />
      <LndWorkflowCertification />

      {/* Section B: Training Request Lifecycle */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Section B: Training Request Lifecycle (4.7-4.13)</CardTitle>
          </div>
          <CardDescription>Request sources, approval chains, and HR Hub integration</CardDescription>
        </CardHeader>
      </Card>

      <Separator />
      <LndWorkflowRequestSelfService />
      <Separator />
      <LndWorkflowRequestGapAnalysis />
      <Separator />
      <LndWorkflowRequestAppraisal />
      <Separator />
      <LndWorkflowRequestOnboarding />
      <Separator />
      <LndWorkflowRequestHR />
      <Separator />
      <LndWorkflowInvitations />
      <Separator />
      <LndWorkflowHRHubIntegration />

      {/* Section C: Session & Delivery Operations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Section C: Session & Delivery Operations (4.14-4.18)</CardTitle>
          </div>
          <CardDescription>Course lifecycle, ILT sessions, virtual classrooms, and scheduling</CardDescription>
        </CardHeader>
      </Card>

      <Separator />
      <LndWorkflowCourseLifecycle />
      <Separator />
      <LndWorkflowSessionManagement />
      <Separator />
      <LndWorkflowVirtualClassroom />
      <Separator />
      <LndWorkflowWaitlist />
      <Separator />
      <LndWorkflowCalendar />

      {/* Section D: Historical Records & Transcripts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg">Section D: Historical Records & Transcripts (4.19-4.21)</CardTitle>
          </div>
          <CardDescription>Training history, external records, and course reviews</CardDescription>
        </CardHeader>
      </Card>

      <Separator />
      <LndWorkflowTrainingHistory />
      <Separator />
      <LndWorkflowExternalRecords />
      <Separator />
      <LndWorkflowCourseReviews />
    </div>
  );
}
