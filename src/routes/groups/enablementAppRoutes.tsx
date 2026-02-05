import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { Navigate, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EnablementAccessGuard } from "@/components/auth/EnablementAccessGuard";
import { LazyPage } from "@/routes/LazyPage";

const EnablementHubPage = lazy(() => import("@/pages/enablement/EnablementHubPage"));
const ContentCreationStudioPage = lazy(() => import("@/pages/enablement/ContentCreationStudioPage"));
const EnablementAnalyticsPage = lazy(() => import("@/pages/enablement/EnablementAnalyticsPage"));
const SCORMGeneratorPage = lazy(() => import("@/pages/enablement/SCORMGeneratorPage"));
const EnablementSettingsPage = lazy(() => import("@/pages/enablement/EnablementSettingsPage"));
const EnablementAIToolsPage = lazy(() => import("@/pages/enablement/EnablementAIToolsPage"));
const ContentReviewCenterPage = lazy(() => import("@/pages/enablement/ContentReviewCenterPage"));
const EnablementGuidePage = lazy(() => import("@/pages/enablement/EnablementGuidePage"));
const EnablementArtifactsPage = lazy(() => import("@/pages/enablement/EnablementArtifactsPage"));
const ArtifactDetailPage = lazy(() => import("@/pages/enablement/ArtifactDetailPage"));
const ArtifactEditorPage = lazy(() => import("@/pages/enablement/ArtifactEditorPage"));
const ToursManagementPage = lazy(() => import("@/pages/enablement/ToursManagementPage"));
const ImplementationDetailPage = lazy(() => import("@/pages/enablement/ImplementationDetailPage"));
const ManualsIndexPage = lazy(() => import("@/pages/enablement/ManualsIndexPage"));

// Universal Manual Viewer - streams content from database (new architecture)
const ManualViewerPage = lazy(() => import("@/pages/enablement/ManualViewerPage"));

// Legacy manual pages - kept temporarily during migration (L&D migrated to streaming)
const AppraisalsManualPage = lazy(() => import("@/pages/enablement/AppraisalsManualPage"));
const AdminSecurityManualPage = lazy(() => import("@/pages/enablement/AdminSecurityManualPage"));
const GoalsManualPage = lazy(() => import("@/pages/enablement/GoalsManualPage"));
const WorkforceManualPage = lazy(() => import("@/pages/enablement/WorkforceManualPage"));
const HRHubManualPage = lazy(() => import("@/pages/enablement/HRHubManualPage"));
const BenefitsManualPage = lazy(() => import("@/pages/enablement/BenefitsManualPage"));
const TimeAttendanceManualPage = lazy(() => import("@/pages/enablement/TimeAttendanceManualPage"));
const Feedback360ManualPage = lazy(() => import("@/pages/enablement/Feedback360ManualPage"));
const SuccessionManualPage = lazy(() => import("@/pages/enablement/SuccessionManualPage"));
const CareerDevelopmentManualPage = lazy(() => import("@/pages/enablement/CareerDevelopmentManualPage"));

const ClientProvisioningGuidePage = lazy(() => import("@/pages/enablement/ClientProvisioningGuidePage"));
const ClientProvisioningTestingPage = lazy(() => import("@/pages/enablement/ClientProvisioningTestingPage"));
const ManualPublishingPage = lazy(() => import("@/pages/enablement/ManualPublishingPage"));
const RouteRegistryPage = lazy(() => import("@/pages/enablement/RouteRegistryPage"));
const ProductCapabilitiesPage = lazy(() => import("@/pages/enablement/ProductCapabilitiesPage"));
const UIColorSemanticsGuidePage = lazy(() => import("@/pages/enablement/UIColorSemanticsGuidePage"));
const QuickStartAdminPage = lazy(() => import("@/pages/enablement/QuickStartAdminPage"));
const QuickStartGuidesPage = lazy(() => import("@/pages/enablement/QuickStartGuidesPage"));
const LnDQuickStartPage = lazy(() => import("@/pages/enablement/LnDQuickStartPage"));
const TAQuickStartPage = lazy(() => import("@/pages/enablement/TAQuickStartPage"));
const DynamicQuickStartPage = lazy(() => import("@/pages/enablement/DynamicQuickStartPage"));
const ImplementationChecklistsPage = lazy(() => import("@/pages/enablement/ImplementationChecklistsPage"));
const ModulesIndexPage = lazy(() => import("@/pages/enablement/ModulesIndexPage"));
const ModuleDocumentationPage = lazy(() => import("@/pages/enablement/ModuleDocumentationPage"));
const PlatformStandardsPage = lazy(() => import("@/pages/enablement/PlatformStandardsPage"));
const WorkspaceNavigationStandardPage = lazy(() => import("@/pages/enablement/WorkspaceNavigationStandardPage"));
const ReleaseCommandCenterPage = lazy(() => import("@/pages/enablement/ReleaseCommandCenterPage"));
const ReleaseCommandCenterGuidePage = lazy(() => import("@/pages/enablement/ReleaseCommandCenterGuidePage"));

function enablementElement(Component: LazyExoticComponent<ComponentType<any>>) {
  return (
    <ProtectedRoute>
      <EnablementAccessGuard>
        <LazyPage>
          <Component />
        </LazyPage>
      </EnablementAccessGuard>
    </ProtectedRoute>
  );
}

export function EnablementAppRoutes() {
  const guardedRoutes: Array<{ path: string; Component: LazyExoticComponent<ComponentType<any>> }> = [
    { path: "/enablement", Component: EnablementHubPage },
    { path: "/enablement/create", Component: ContentCreationStudioPage },
    { path: "/enablement/analytics", Component: EnablementAnalyticsPage },
    { path: "/enablement/scorm-generator", Component: SCORMGeneratorPage },
    { path: "/enablement/settings", Component: EnablementSettingsPage },
    { path: "/enablement/ai-tools", Component: EnablementAIToolsPage },
    { path: "/enablement/review", Component: ContentReviewCenterPage },
    { path: "/enablement/guide", Component: EnablementGuidePage },
    { path: "/enablement/artifacts", Component: EnablementArtifactsPage },
    { path: "/enablement/artifacts/:id", Component: ArtifactDetailPage },
    { path: "/enablement/artifacts/:id/edit", Component: ArtifactEditorPage },
    { path: "/enablement/tours-management", Component: ToursManagementPage },
    { path: "/enablement/implementation/:moduleCode", Component: ImplementationDetailPage },
    { path: "/enablement/manuals", Component: ManualsIndexPage },
    { path: "/enablement/manuals/appraisals", Component: AppraisalsManualPage },
    { path: "/enablement/manuals/admin-security", Component: AdminSecurityManualPage },
    { path: "/enablement/manuals/goals", Component: GoalsManualPage },
    { path: "/enablement/manuals/workforce", Component: WorkforceManualPage },
    { path: "/enablement/manuals/hr-hub", Component: HRHubManualPage },
    { path: "/enablement/manuals/benefits", Component: BenefitsManualPage },
    { path: "/enablement/manuals/time-attendance", Component: TimeAttendanceManualPage },
    { path: "/enablement/manuals/feedback-360", Component: Feedback360ManualPage },
    { path: "/enablement/manuals/succession", Component: SuccessionManualPage },
    { path: "/enablement/manuals/career-development", Component: CareerDevelopmentManualPage },
    // Universal viewer for streamed content (new architecture) - supports both old and new URL patterns
    { path: "/enablement/manual/:manualId", Component: ManualViewerPage },
    { path: "/enablement/manuals/client-provisioning", Component: ClientProvisioningGuidePage },
    { path: "/enablement/manuals/client-provisioning/testing", Component: ClientProvisioningTestingPage },
    { path: "/enablement/manuals/publishing", Component: ManualPublishingPage },
    { path: "/enablement/manual-publishing", Component: ManualPublishingPage },
    { path: "/enablement/manual-publishing", Component: ManualPublishingPage },
    { path: "/enablement/route-registry", Component: RouteRegistryPage },
    { path: "/enablement/product-capabilities", Component: ProductCapabilitiesPage },
    { path: "/enablement/ui-color-semantics", Component: UIColorSemanticsGuidePage },
    { path: "/enablement/quickstarts/admin", Component: QuickStartAdminPage },
    { path: "/enablement/quickstarts", Component: QuickStartGuidesPage },
    { path: "/enablement/quickstart/learning-development", Component: LnDQuickStartPage },
    { path: "/enablement/quickstart/time-attendance", Component: TAQuickStartPage },
    { path: "/enablement/quickstart/:moduleSlug", Component: DynamicQuickStartPage },
    { path: "/enablement/checklists", Component: ImplementationChecklistsPage },
    { path: "/enablement/modules", Component: ModulesIndexPage },
    { path: "/enablement/modules/:moduleId", Component: ModuleDocumentationPage },
    { path: "/enablement/standards", Component: PlatformStandardsPage },
    { path: "/enablement/standards/workspace-navigation", Component: WorkspaceNavigationStandardPage },
    { path: "/enablement/release-center", Component: ReleaseCommandCenterPage },
    { path: "/enablement/release-center/guide", Component: ReleaseCommandCenterGuidePage },
  ];

  return (
    <>
      {guardedRoutes.map(({ path, Component }) => (
        <Route key={path} path={path} element={enablementElement(Component)} />
      ))}

      {/* Redirects */}
      <Route path="/enablement/docs-generator" element={<Navigate to="/enablement/create" replace />} />
      <Route path="/enablement/feature-catalog" element={<Navigate to="/enablement/release-center?activeTab=coverage" replace />} />
      <Route path="/enablement/feature-database" element={<Navigate to="/enablement/release-center?activeTab=coverage" replace />} />
      <Route path="/enablement/audit" element={<Navigate to="/enablement/release-center?activeTab=coverage" replace />} />
      <Route path="/enablement/template-library" element={<Navigate to="/enablement/create?activeTab=templates" replace />} />
      <Route path="/enablement/release-calendar" element={<Navigate to="/enablement/release-center?activeTab=milestones" replace />} />
      <Route path="/enablement/feature-audit" element={<Navigate to="/enablement/release-center?activeTab=coverage" replace />} />
      <Route path="/enablement/content-lifecycle" element={<Navigate to="/enablement/release-center" replace />} />
      {/* L&D Manual redirect to streaming viewer */}
      <Route path="/enablement/manuals/learning-development" element={<Navigate to="/enablement/manual/learning-development" replace />} />
    </>
  );
}
