import { lazy, Suspense } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { EnablementAccessGuard } from '@/components/auth/EnablementAccessGuard';
import { LoadingFallback } from './RouteConfig';

// Lazy load enablement pages
const EnablementHubPage = lazy(() => import('@/pages/enablement/EnablementHubPage'));
const ContentCreationStudioPage = lazy(() => import('@/pages/enablement/ContentCreationStudioPage'));
// Deprecated: FeatureAuditDashboard - now redirects to /enablement/release-center?activeTab=coverage
// Deprecated: EnablementAnalyticsPage - now redirects to Release Command Center overview
// Deprecated: EnablementSettingsPage - now redirects to Release Command Center settings
// Deprecated: EnablementAIToolsPage - now merged into Content Creation Studio
const SCORMGeneratorPage = lazy(() => import('@/pages/enablement/SCORMGeneratorPage'));
const ReleaseCommandCenterPage = lazy(() => import('@/pages/enablement/ReleaseCommandCenterPage'));
const EnablementGuidePage = lazy(() => import('@/pages/enablement/EnablementGuidePage'));
const EnablementArtifactsPage = lazy(() => import('@/pages/enablement/EnablementArtifactsPage'));
const ArtifactEditorPage = lazy(() => import('@/pages/enablement/ArtifactEditorPage'));
const ArtifactDetailPage = lazy(() => import('@/pages/enablement/ArtifactDetailPage'));
const ToursManagementPage = lazy(() => import('@/pages/enablement/ToursManagementPage'));
const ImplementationDetailPage = lazy(() => import('@/pages/enablement/ImplementationDetailPage'));
const AppraisalsManualPage = lazy(() => import('@/pages/enablement/AppraisalsManualPage'));
const AdminSecurityManualPage = lazy(() => import('@/pages/enablement/AdminSecurityManualPage'));
const GoalsManualPage = lazy(() => import('@/pages/enablement/GoalsManualPage'));
const WorkforceManualPage = lazy(() => import('@/pages/enablement/WorkforceManualPage'));
const HRHubManualPage = lazy(() => import('@/pages/enablement/HRHubManualPage'));
const BenefitsManualPage = lazy(() => import('@/pages/enablement/BenefitsManualPage'));
const TimeAttendanceManualPage = lazy(() => import('@/pages/enablement/TimeAttendanceManualPage'));
const Feedback360ManualPage = lazy(() => import('@/pages/enablement/Feedback360ManualPage'));
const ManualsIndexPage = lazy(() => import('@/pages/enablement/ManualsIndexPage'));
const ClientProvisioningGuidePage = lazy(() => import('@/pages/enablement/ClientProvisioningGuidePage'));
const ClientProvisioningTestingPage = lazy(() => import('@/pages/enablement/ClientProvisioningTestingPage'));
const ManualPublishingPage = lazy(() => import('@/pages/enablement/ManualPublishingPage'));
const RouteRegistryPage = lazy(() => import('@/pages/enablement/RouteRegistryPage'));
const QuickStartGuidesPage = lazy(() => import('@/pages/enablement/QuickStartGuidesPage'));
const QuickStartAdminPage = lazy(() => import('@/pages/enablement/QuickStartAdminPage'));
const ImplementationChecklistsPage = lazy(() => import('@/pages/enablement/ImplementationChecklistsPage'));
const ModulesIndexPage = lazy(() => import('@/pages/enablement/ModulesIndexPage'));
const ModuleDocumentationPage = lazy(() => import('@/pages/enablement/ModuleDocumentationPage'));
const LnDQuickStartPage = lazy(() => import('@/pages/enablement/LnDQuickStartPage'));
const TAQuickStartPage = lazy(() => import('@/pages/enablement/TAQuickStartPage'));
const CareerDevelopmentManualPage = lazy(() => import('@/pages/enablement/CareerDevelopmentManualPage'));
const SuccessionManualPage = lazy(() => import('@/pages/enablement/SuccessionManualPage'));
const LearningDevelopmentManualPage = lazy(() => import('@/pages/enablement/LearningDevelopmentManualPage'));

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
      {/* Core Hub */}
      <Route path="/enablement" element={<EnablementRoute><EnablementHubPage /></EnablementRoute>} />
      
      {/* Consolidated Content Creation Studio */}
      <Route path="/enablement/create" element={<EnablementRoute><ContentCreationStudioPage /></EnablementRoute>} />
      
      {/* Redirects for deprecated pages → Content Creation Studio */}
      <Route path="/enablement/docs-generator" element={<Navigate to="/enablement/create" replace />} />
      <Route path="/enablement/template-library" element={<Navigate to="/enablement/create?activeTab=templates" replace />} />
      
      {/* Feature Audit → Redirects to Release Command Center Coverage tab */}
      <Route path="/enablement/audit" element={<Navigate to="/enablement/release-center?activeTab=coverage" replace />} />
      
      {/* Redirects for deprecated pages → Release Command Center Coverage tab */}
      <Route path="/enablement/feature-catalog" element={<Navigate to="/enablement/release-center?activeTab=coverage" replace />} />
      <Route path="/enablement/feature-database" element={<Navigate to="/enablement/release-center?activeTab=coverage" replace />} />
      
      {/* Unified Release Command Center */}
      <Route path="/enablement/release-center" element={<EnablementRoute><ReleaseCommandCenterPage /></EnablementRoute>} />
      
      {/* Redirects for deprecated pages → Release Command Center */}
      <Route path="/enablement/release-calendar" element={<Navigate to="/enablement/release-center?activeTab=milestones" replace />} />
      <Route path="/enablement/content-lifecycle" element={<Navigate to="/enablement/release-center" replace />} />
      
      {/* Analytics & Settings - Redirect to Release Command Center */}
      <Route path="/enablement/analytics" element={<Navigate to="/enablement/release-center?activeTab=overview" replace />} />
      <Route path="/enablement/settings" element={<Navigate to="/enablement/release-center?activeTab=settings" replace />} />
      
      {/* AI Tools - Redirect to Content Creation Studio */}
      <Route path="/enablement/ai-tools" element={<Navigate to="/enablement/create?activeTab=ai-tools" replace />} />
      
      {/* User Guide (still accessible for deep-dive) */}
      <Route path="/enablement/guide" element={<EnablementRoute><EnablementGuidePage /></EnablementRoute>} />
      
      {/* External Integrations */}
      <Route path="/enablement/scorm-generator" element={<EnablementRoute><SCORMGeneratorPage /></EnablementRoute>} />
      <Route path="/enablement/tours" element={<EnablementRoute><ToursManagementPage /></EnablementRoute>} />
      
      {/* Artifacts */}
      <Route path="/enablement/artifacts" element={<EnablementRoute><EnablementArtifactsPage /></EnablementRoute>} />
      <Route path="/enablement/artifacts/:id/edit" element={<EnablementRoute><ArtifactEditorPage /></EnablementRoute>} />
      <Route path="/enablement/artifacts/:id" element={<EnablementRoute><ArtifactDetailPage /></EnablementRoute>} />
      
      {/* Implementation */}
      <Route path="/enablement/implementation/:featureId" element={<EnablementRoute><ImplementationDetailPage /></EnablementRoute>} />
      
      {/* Administrator Manuals (all 10) */}
      <Route path="/enablement/manuals" element={<EnablementRoute><ManualsIndexPage /></EnablementRoute>} />
      <Route path="/enablement/manuals/appraisals" element={<EnablementRoute><AppraisalsManualPage /></EnablementRoute>} />
      <Route path="/enablement/manuals/admin-security" element={<EnablementRoute><AdminSecurityManualPage /></EnablementRoute>} />
      <Route path="/enablement/manuals/goals" element={<EnablementRoute><GoalsManualPage /></EnablementRoute>} />
      <Route path="/enablement/manuals/workforce" element={<EnablementRoute><WorkforceManualPage /></EnablementRoute>} />
      <Route path="/enablement/manuals/hr-hub" element={<EnablementRoute><HRHubManualPage /></EnablementRoute>} />
      <Route path="/enablement/manuals/benefits" element={<EnablementRoute><BenefitsManualPage /></EnablementRoute>} />
      <Route path="/enablement/manuals/time-attendance" element={<EnablementRoute><TimeAttendanceManualPage /></EnablementRoute>} />
      <Route path="/enablement/manuals/feedback-360" element={<EnablementRoute><Feedback360ManualPage /></EnablementRoute>} />
      <Route path="/enablement/manuals/career-development" element={<EnablementRoute><CareerDevelopmentManualPage /></EnablementRoute>} />
      <Route path="/enablement/manuals/succession" element={<EnablementRoute><SuccessionManualPage /></EnablementRoute>} />
      <Route path="/enablement/manuals/learning-development" element={<EnablementRoute><LearningDevelopmentManualPage /></EnablementRoute>} />
      {/* Client Provisioning */}
      <Route path="/enablement/client-provisioning" element={<EnablementRoute><ClientProvisioningGuidePage /></EnablementRoute>} />
      <Route path="/enablement/client-provisioning/testing" element={<EnablementRoute><ClientProvisioningTestingPage /></EnablementRoute>} />
      
      {/* Publishing */}
      <Route path="/enablement/manual-publishing" element={<EnablementRoute><ManualPublishingPage /></EnablementRoute>} />
      
      {/* Route Registry */}
      <Route path="/enablement/route-registry" element={<EnablementRoute><RouteRegistryPage /></EnablementRoute>} />
      
      {/* Quick Start Guides */}
      <Route path="/enablement/quickstarts/admin" element={<EnablementRoute><QuickStartAdminPage /></EnablementRoute>} />
      <Route path="/enablement/quickstarts" element={<EnablementRoute><QuickStartGuidesPage /></EnablementRoute>} />
      <Route path="/enablement/quickstart/learning-development" element={<EnablementRoute><LnDQuickStartPage /></EnablementRoute>} />
      <Route path="/enablement/quickstart/time-attendance" element={<EnablementRoute><TAQuickStartPage /></EnablementRoute>} />
      
      {/* Implementation Checklists */}
      <Route path="/enablement/checklists" element={<EnablementRoute><ImplementationChecklistsPage /></EnablementRoute>} />
      
      {/* Module Documentation */}
      <Route path="/enablement/modules" element={<EnablementRoute><ModulesIndexPage /></EnablementRoute>} />
      <Route path="/enablement/modules/:moduleId" element={<EnablementRoute><ModuleDocumentationPage /></EnablementRoute>} />
    </>
  );
}
