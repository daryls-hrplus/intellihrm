import { lazy } from "react";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const RecruitmentDashboardPage = lazy(() => import("@/pages/recruitment/RecruitmentDashboardPage"));
const RecruitmentFullPage = lazy(() => import("@/pages/recruitment/RecruitmentFullPage"));
const RecruitmentAnalyticsPage = lazy(() => import("@/pages/recruitment/RecruitmentAnalyticsPage"));
const RequisitionsPage = lazy(() => import("@/pages/recruitment/RequisitionsPage"));
const CandidatesPage = lazy(() => import("@/pages/recruitment/CandidatesPage"));
const ApplicationsPage = lazy(() => import("@/pages/recruitment/ApplicationsPage"));
const PipelinePage = lazy(() => import("@/pages/recruitment/PipelinePage"));
const ScorecardsPage = lazy(() => import("@/pages/recruitment/ScorecardsPage"));
const OffersPage = lazy(() => import("@/pages/recruitment/OffersPage"));
const ReferralsPage = lazy(() => import("@/pages/recruitment/ReferralsPage"));
const AssessmentsPage = lazy(() => import("@/pages/recruitment/AssessmentsPage"));
const InterviewPanelsPage = lazy(() => import("@/pages/recruitment/InterviewPanelsPage"));
const EmailTemplatesPage = lazy(() => import("@/pages/recruitment/EmailTemplatesPage"));
const SourcesPage = lazy(() => import("@/pages/recruitment/SourcesPage"));
const JobBoardsPage = lazy(() => import("@/pages/recruitment/JobBoardsPage"));

export function RecruitmentRoutes() {
  return (
    <>
      {renderProtectedLazyRoutes([
        { path: "/recruitment", moduleCode: "recruitment", Component: RecruitmentDashboardPage },
        { path: "/recruitment/full", moduleCode: "recruitment", Component: RecruitmentFullPage },
        { path: "/recruitment/analytics", moduleCode: "recruitment", Component: RecruitmentAnalyticsPage },
        { path: "/recruitment/requisitions", moduleCode: "recruitment", Component: RequisitionsPage },
        { path: "/recruitment/candidates", moduleCode: "recruitment", Component: CandidatesPage },
        { path: "/recruitment/applications", moduleCode: "recruitment", Component: ApplicationsPage },
        { path: "/recruitment/pipeline", moduleCode: "recruitment", Component: PipelinePage },
        { path: "/recruitment/scorecards", moduleCode: "recruitment", Component: ScorecardsPage },
        { path: "/recruitment/offers", moduleCode: "recruitment", Component: OffersPage },
        { path: "/recruitment/referrals", moduleCode: "recruitment", Component: ReferralsPage },
        { path: "/recruitment/assessments", moduleCode: "recruitment", Component: AssessmentsPage },
        { path: "/recruitment/interview-panels", moduleCode: "recruitment", Component: InterviewPanelsPage },
        { path: "/recruitment/email-templates", moduleCode: "recruitment", Component: EmailTemplatesPage },
        { path: "/recruitment/sources", moduleCode: "recruitment", Component: SourcesPage },
        { path: "/recruitment/job-boards", moduleCode: "recruitment", Component: JobBoardsPage },
      ])}
    </>
  );
}
