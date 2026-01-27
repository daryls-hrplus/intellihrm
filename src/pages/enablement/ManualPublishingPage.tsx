// Manual Publishing Page - Redirects to Release Command Center Publishing tab
import { Navigate } from "react-router-dom";

export default function ManualPublishingPage() {
  return <Navigate to="/enablement/release-center?activeTab=publishing" replace />;
}
