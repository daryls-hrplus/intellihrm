import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { LazyPage } from "@/routes/LazyPage";
import AuthPage from "@/pages/AuthPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";

const LandingPage = lazy(() => import("@/pages/marketing/LandingPage"));
const MFAChallengePage = lazy(() => import("@/pages/auth/MFAChallengePage"));

const DemoLoginPage = lazy(() => import("@/pages/demo/DemoLoginPage"));
const DemoExpiredPage = lazy(() => import("@/pages/demo/DemoExpiredPage"));
const DemoConversionPage = lazy(() => import("@/pages/demo/DemoConversionPage"));

const SubscriptionPage = lazy(() => import("@/pages/subscription/SubscriptionPage"));
const UpgradePage = lazy(() => import("@/pages/subscription/UpgradePage"));

const RegisterDemoPage = lazy(() => import("@/pages/marketing/RegisterDemoPage"));
const RegisterDemoSuccessPage = lazy(() => import("@/pages/marketing/RegisterDemoSuccessPage"));
const FeaturesPage = lazy(() => import("@/pages/marketing/FeaturesPage"));
const AboutPage = lazy(() => import("@/pages/marketing/AboutPage"));

const ProductTourLandingPage = lazy(() => import("@/pages/product-tour/ProductTourLandingPage"));
const ProductTourPlayerPage = lazy(() => import("@/pages/product-tour/ProductTourPlayerPage"));

export function PublicRoutes() {
  return (
    <>
      {/* Marketing Landing Page (optional access) */}
      <Route element={<MarketingLayout />}>
        <Route
          path="/landing"
          element={
            <LazyPage>
              <LandingPage />
            </LazyPage>
          }
        />
      </Route>

      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/auth/mfa"
        element={
          <LazyPage>
            <MFAChallengePage />
          </LazyPage>
        }
      />

      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Demo Routes (public) */}
      <Route path="/demo/login" element={<LazyPage><DemoLoginPage /></LazyPage>} />
      <Route path="/demo/expired" element={<LazyPage><DemoExpiredPage /></LazyPage>} />
      <Route path="/demo/convert" element={<LazyPage><DemoConversionPage /></LazyPage>} />

      {/* Subscription Routes */}
      <Route path="/subscription" element={<LazyPage><SubscriptionPage /></LazyPage>} />
      <Route path="/subscription/upgrade" element={<LazyPage><UpgradePage /></LazyPage>} />

      {/* Marketing Routes (Public) */}
      <Route element={<MarketingLayout />}>
        <Route path="/landing" element={<Navigate to="/" replace />} />
        <Route path="/register-demo" element={<LazyPage><RegisterDemoPage /></LazyPage>} />
        <Route path="/register-demo/success" element={<LazyPage><RegisterDemoSuccessPage /></LazyPage>} />
        <Route path="/features" element={<LazyPage><FeaturesPage /></LazyPage>} />
        <Route path="/about" element={<LazyPage><AboutPage /></LazyPage>} />
      </Route>

      {/* Product Tour Routes (Public) */}
      <Route path="/product-tour" element={<LazyPage><ProductTourLandingPage /></LazyPage>} />
      <Route path="/product-tour/:experienceCode" element={<LazyPage><ProductTourPlayerPage /></LazyPage>} />
    </>
  );
}
