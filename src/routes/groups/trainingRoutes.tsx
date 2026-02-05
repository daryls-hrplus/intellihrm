import { lazy } from "react";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const TrainingDashboardPage = lazy(() => import("@/pages/training/TrainingDashboardPage"));
const CourseCatalogPage = lazy(() => import("@/pages/training/CourseCatalogPage"));
const MyLearningPage = lazy(() => import("@/pages/training/MyLearningPage"));
const CourseViewerPage = lazy(() => import("@/pages/training/CourseViewerPage"));
const QuizPage = lazy(() => import("@/pages/training/QuizPage"));
const CertificationsPage = lazy(() => import("@/pages/training/CertificationsPage"));
const LiveSessionsPage = lazy(() => import("@/pages/training/LiveSessionsPage"));
const TrainingCalendarPage = lazy(() => import("@/pages/training/TrainingCalendarPage"));
const CompetencyGapAnalysisPage = lazy(() => import("@/pages/training/CompetencyGapAnalysisPage"));
const TrainingRequestsPage = lazy(() => import("@/pages/training/TrainingRequestsPage"));
const ExternalTrainingPage = lazy(() => import("@/pages/training/ExternalTrainingPage"));
const TrainingBudgetsPage = lazy(() => import("@/pages/training/TrainingBudgetsPage"));
const InstructorsPage = lazy(() => import("@/pages/training/InstructorsPage"));
const TrainingEvaluationsPage = lazy(() => import("@/pages/training/TrainingEvaluationsPage"));
const LearningPathsPage = lazy(() => import("@/pages/training/LearningPathsPage"));
const ComplianceTrainingPage = lazy(() => import("@/pages/training/ComplianceTrainingPage"));
const InteractiveTrainingPage = lazy(() => import("@/pages/training/InteractiveTrainingPage"));
const InteractiveTrainingAdminPage = lazy(() => import("@/pages/training/InteractiveTrainingAdminPage"));
const CourseCompetenciesPage = lazy(() => import("@/pages/training/CourseCompetenciesPage"));
const RecertificationPage = lazy(() => import("@/pages/training/RecertificationPage"));
const TrainingNeedsPage = lazy(() => import("@/pages/training/TrainingNeedsPage"));
const TrainingAnalyticsPage = lazy(() => import("@/pages/training/TrainingAnalyticsPage"));
const VirtualClassroomPage = lazy(() => import("@/pages/training/VirtualClassroomPage"));
const ContentAuthoringPage = lazy(() => import("@/pages/training/ContentAuthoringPage"));
const EmployeeLearningPage = lazy(() => import("@/pages/training/EmployeeLearningPage"));
const EmployeeCertificationsPage = lazy(() => import("@/pages/training/EmployeeCertificationsPage"));
const TrainingCareerPathsPage = lazy(() => import("@/pages/training/TrainingCareerPathsPage"));
const TrainingMentorshipPage = lazy(() => import("@/pages/training/TrainingMentorshipPage"));
const VendorManagementPage = lazy(() => import("@/pages/training/VendorManagementPage"));
const VendorDetailPage = lazy(() => import("@/pages/training/VendorDetailPage"));

export function TrainingRoutes() {
  return (
    <>
      {renderProtectedLazyRoutes([
        { path: "/training", moduleCode: "training", Component: TrainingDashboardPage },
        { path: "/training/catalog", moduleCode: "training", Component: CourseCatalogPage },
        { path: "/training/my-learning", moduleCode: "training", Component: MyLearningPage },
        { path: "/training/course/:courseId", moduleCode: "training", Component: CourseViewerPage },
        { path: "/training/quiz/:quizId", moduleCode: "training", Component: QuizPage },
        { path: "/training/certifications", moduleCode: "training", Component: CertificationsPage },
        { path: "/training/live-sessions", moduleCode: "training", Component: LiveSessionsPage },
        { path: "/training/calendar", moduleCode: "training", Component: TrainingCalendarPage },
        { path: "/training/competency-gap", moduleCode: "training", Component: CompetencyGapAnalysisPage },
        { path: "/training/requests", moduleCode: "training", Component: TrainingRequestsPage },
        { path: "/training/external", moduleCode: "training", Component: ExternalTrainingPage },
        { path: "/training/budgets", moduleCode: "training", Component: TrainingBudgetsPage },
        { path: "/training/instructors", moduleCode: "training", Component: InstructorsPage },
        { path: "/training/evaluations", moduleCode: "training", Component: TrainingEvaluationsPage },
        { path: "/training/learning-paths", moduleCode: "training", Component: LearningPathsPage },
        { path: "/training/compliance", moduleCode: "training", Component: ComplianceTrainingPage },
        { path: "/training/interactive", moduleCode: "training", Component: InteractiveTrainingPage },
        { path: "/training/interactive/admin", moduleCode: "training", Component: InteractiveTrainingAdminPage },
        { path: "/training/course-competencies", moduleCode: "training", Component: CourseCompetenciesPage },
        { path: "/training/recertification", moduleCode: "training", Component: RecertificationPage },
        { path: "/training/needs", moduleCode: "training", Component: TrainingNeedsPage },
        { path: "/training/analytics", moduleCode: "training", Component: TrainingAnalyticsPage },
        { path: "/training/virtual-classroom", moduleCode: "training", Component: VirtualClassroomPage },
        { path: "/training/content-authoring", moduleCode: "training", Component: ContentAuthoringPage },
        { path: "/training/employee-learning", moduleCode: "training", Component: EmployeeLearningPage },
        { path: "/training/employee-certifications", moduleCode: "training", Component: EmployeeCertificationsPage },
        { path: "/training/career-paths", moduleCode: "training", Component: TrainingCareerPathsPage },
        { path: "/training/mentorship", moduleCode: "training", Component: TrainingMentorshipPage },
        { path: "/training/vendors", moduleCode: "training", Component: VendorManagementPage },
        { path: "/training/vendors/:id", moduleCode: "training", Component: VendorDetailPage },
      ])}
    </>
  );
}
