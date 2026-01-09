import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { EnablementAccessGuard } from '@/components/auth/EnablementAccessGuard';
import { LoadingFallback } from './RouteConfig';

// Lazy load enablement pages
const EnablementHubPage = lazy(() => import('@/pages/enablement/EnablementHubPage'));
const ApplicationDocsGeneratorPage = lazy(() => import('@/pages/enablement/ApplicationDocsGeneratorPage'));
const FeatureCatalogPage = lazy(() => import('@/pages/enablement/FeatureCatalogPage'));
const FeatureDatabasePage = lazy(() => import('@/pages/enablement/FeatureDatabasePage'));
const TemplateLibraryPage = lazy(() => import('@/pages/enablement/TemplateLibraryPage'));
const EnablementAnalyticsPage = lazy(() => import('@/pages/enablement/EnablementAnalyticsPage'));
const SCORMGeneratorPage = lazy(() => import('@/pages/enablement/SCORMGeneratorPage'));
const ReleaseCalendarPage = lazy(() => import('@/pages/enablement/ReleaseCalendarPage'));
const EnablementSettingsPage = lazy(() => import('@/pages/enablement/EnablementSettingsPage'));
const EnablementAIToolsPage = lazy(() => import('@/pages/enablement/EnablementAIToolsPage'));
const EnablementGuidePage = lazy(() => import('@/pages/enablement/EnablementGuidePage'));
const EnablementArtifactsPage = lazy(() => import('@/pages/enablement/EnablementArtifactsPage'));
const ArtifactEditorPage = lazy(() => import('@/pages/enablement/ArtifactEditorPage'));
const ArtifactDetailPage = lazy(() => import('@/pages/enablement/ArtifactDetailPage'));
const ToursManagementPage = lazy(() => import('@/pages/enablement/ToursManagementPage'));
const FeatureAuditDashboard = lazy(() => import('@/pages/enablement/FeatureAuditDashboard'));
const ImplementationDetailPage = lazy(() => import('@/pages/enablement/ImplementationDetailPage'));
const AppraisalsManualPage = lazy(() => import('@/pages/enablement/AppraisalsManualPage'));
const AdminSecurityManualPage = lazy(() => import('@/pages/enablement/AdminSecurityManualPage'));
const GoalsManualPage = lazy(() => import('@/pages/enablement/GoalsManualPage'));
const WorkforceManualPage = lazy(() => import('@/pages/enablement/WorkforceManualPage'));
const HRHubManualPage = lazy(() => import('@/pages/enablement/HRHubManualPage'));
const ManualsIndexPage = lazy(() => import('@/pages/enablement/ManualsIndexPage'));
const ClientProvisioningGuidePage = lazy(() => import('@/pages/enablement/ClientProvisioningGuidePage'));
const ClientProvisioningTestingPage = lazy(() => import('@/pages/enablement/ClientProvisioningTestingPage'));
const ManualPublishingPage = lazy(() => import('@/pages/enablement/ManualPublishingPage'));
const ContentLifecyclePage = lazy(() => import('@/pages/enablement/ContentLifecyclePage'));

// Wrapper for enablement routes with guards
function EnablementRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <EnablementAccessGuard>
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
      </EnablementAccessGuard>
    </ProtectedRoute>
  );
}

export function EnablementRoutes() {
  return (
    <>
      <Route path="/enablement" element={<EnablementRoute><EnablementHubPage /></EnablementRoute>} />
      <Route path="/enablement/docs-generator" element={<EnablementRoute><ApplicationDocsGeneratorPage /></EnablementRoute>} />
      <Route path="/enablement/feature-catalog" element={<EnablementRoute><FeatureCatalogPage /></EnablementRoute>} />
      <Route path="/enablement/feature-database" element={<EnablementRoute><FeatureDatabasePage /></EnablementRoute>} />
      <Route path="/enablement/template-library" element={<EnablementRoute><TemplateLibraryPage /></EnablementRoute>} />
      <Route path="/enablement/analytics" element={<EnablementRoute><EnablementAnalyticsPage /></EnablementRoute>} />
      <Route path="/enablement/scorm-generator" element={<EnablementRoute><SCORMGeneratorPage /></EnablementRoute>} />
      <Route path="/enablement/release-calendar" element={<EnablementRoute><ReleaseCalendarPage /></EnablementRoute>} />
      <Route path="/enablement/settings" element={<EnablementRoute><EnablementSettingsPage /></EnablementRoute>} />
      <Route path="/enablement/ai-tools" element={<EnablementRoute><EnablementAIToolsPage /></EnablementRoute>} />
      <Route path="/enablement/guide" element={<EnablementRoute><EnablementGuidePage /></EnablementRoute>} />
      <Route path="/enablement/artifacts" element={<EnablementRoute><EnablementArtifactsPage /></EnablementRoute>} />
      <Route path="/enablement/artifacts/:id/edit" element={<EnablementRoute><ArtifactEditorPage /></EnablementRoute>} />
      <Route path="/enablement/artifacts/:id" element={<EnablementRoute><ArtifactDetailPage /></EnablementRoute>} />
      <Route path="/enablement/audit" element={<EnablementRoute><FeatureAuditDashboard /></EnablementRoute>} />
      <Route path="/enablement/implementation/:featureId" element={<EnablementRoute><ImplementationDetailPage /></EnablementRoute>} />
      <Route path="/enablement/tours" element={<EnablementRoute><ToursManagementPage /></EnablementRoute>} />
      <Route path="/enablement/manuals" element={<EnablementRoute><ManualsIndexPage /></EnablementRoute>} />
      <Route path="/enablement/manuals/appraisals" element={<EnablementRoute><AppraisalsManualPage /></EnablementRoute>} />
      <Route path="/enablement/manuals/admin-security" element={<EnablementRoute><AdminSecurityManualPage /></EnablementRoute>} />
      <Route path="/enablement/manuals/goals" element={<EnablementRoute><GoalsManualPage /></EnablementRoute>} />
      <Route path="/enablement/manuals/workforce" element={<EnablementRoute><WorkforceManualPage /></EnablementRoute>} />
      <Route path="/enablement/manuals/hr-hub" element={<EnablementRoute><HRHubManualPage /></EnablementRoute>} />
      <Route path="/enablement/client-provisioning" element={<EnablementRoute><ClientProvisioningGuidePage /></EnablementRoute>} />
      <Route path="/enablement/client-provisioning/testing" element={<EnablementRoute><ClientProvisioningTestingPage /></EnablementRoute>} />
      <Route path="/enablement/manual-publishing" element={<EnablementRoute><ManualPublishingPage /></EnablementRoute>} />
      <Route path="/enablement/content-lifecycle" element={<EnablementRoute><ContentLifecyclePage /></EnablementRoute>} />
    </>
  );
}
