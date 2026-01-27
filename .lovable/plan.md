
# Fix: Hard Refresh Keeps Authenticated Users on Landing Page

## Problem Analysis

When an authenticated user performs a hard refresh while on the root route (`/`), they are shown the public marketing landing page instead of being redirected to their dashboard at `/dashboard`.

**Root Cause:**
The routing architecture was updated to serve a public marketing landing page at `/`:

```text
Route Structure:
├── / (public) → MarketingLayout → LandingPage  ← No auth check!
├── /auth → AuthPage (has auth redirect)
├── /dashboard (protected) → ProtectedLayout → Index
└── /ess, /mss, etc. (protected) → ProtectedLayout → ...
```

The `LandingPage` component does not check authentication state, so authenticated users see the marketing page instead of being redirected to their dashboard.

**Previous Behavior:**
- Root route was likely protected or had auth-aware redirect
- Authenticated users landing on `/` were automatically sent to `/dashboard`

## Solution

Add authentication-aware redirect to the LandingPage component that detects an authenticated user and redirects them to `/dashboard`.

---

## Technical Implementation

### File to Modify

`src/pages/marketing/LandingPage.tsx`

### Changes Required

1. Import `useAuth` hook and `Navigate` component
2. Add auth state check at component start
3. Show loading spinner while auth is loading
4. Redirect authenticated users to `/dashboard`

### Code Change

```tsx
// src/pages/marketing/LandingPage.tsx (updated)
import { Helmet } from "react-helmet";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { HeroSection } from "@/components/marketing/HeroSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { BenefitsSection } from "@/components/marketing/BenefitsSection";
import { CTASection } from "@/components/marketing/CTASection";

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Helmet>
        <title>intellihrm | AI-Powered HRMS for Caribbean & Africa</title>
        {/* ... rest of helmet tags ... */}
      </Helmet>

      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <CTASection />
    </>
  );
}
```

---

## Behavior After Fix

| Scenario | Before Fix | After Fix |
|----------|------------|-----------|
| Authenticated user hard-refreshes on `/` | Shows marketing landing page | Redirects to `/dashboard` |
| Authenticated user navigates to `/` | Shows marketing landing page | Redirects to `/dashboard` |
| Unauthenticated user visits `/` | Shows marketing landing page | Shows marketing landing page (unchanged) |
| User logs in via `/auth` | Redirects to `/` (landing) | `/` redirects to `/dashboard` |

---

## Alternative Consideration

An alternative approach would be to add the auth check in `MarketingLayout` instead, which would apply to all marketing pages. However, some marketing pages (like `/features`, `/about`, `/product-tour`) should remain accessible to authenticated users if they want to browse them. Therefore, the redirect should be specific to the `LandingPage` only.

---

## Files Impacted

| File | Change Type |
|------|-------------|
| `src/pages/marketing/LandingPage.tsx` | Modify - Add auth-aware redirect |

---

## Testing Verification

1. Log in to the application
2. Navigate to a protected route (e.g., `/dashboard`)
3. Perform a hard refresh (F5 or Ctrl+R)
4. Verify you remain on the dashboard (not redirected to landing page)
5. Navigate directly to `/` in the URL bar
6. Verify you are redirected to `/dashboard`
7. Log out
8. Navigate to `/`
9. Verify you see the marketing landing page
