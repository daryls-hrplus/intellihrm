

# Plan: Replace Landing Page with Login Screen as Default

## Overview

Change the root route (`/`) to show the login screen (AuthPage) instead of the marketing landing page when users visit intellicohrm.net.

---

## Current Behavior

| Route | Current Component | Behavior |
|-------|-------------------|----------|
| `/` | `LandingPage` (in `MarketingLayout`) | Shows marketing content; redirects to `/dashboard` if logged in |
| `/auth` | `AuthPage` | Shows login/signup form; redirects to `/dashboard` if logged in |

---

## Proposed Behavior

| Route | New Component | Behavior |
|-------|---------------|----------|
| `/` | `AuthPage` | Shows login/signup form; redirects to `/dashboard` if logged in |
| `/auth` | `AuthPage` | Keep as alias for login (backwards compatibility) |
| `/landing` | `LandingPage` (optional) | Keep marketing page accessible at different URL if needed |

---

## Implementation Changes

### File: `src/App.tsx`

**Change 1: Remove MarketingLayout wrapper for root route**

Remove lines 54-57:
```tsx
// REMOVE THIS
<Route element={<MarketingLayout />}>
  <Route path="/" element={<LazyPage><Pages.LandingPage /></LazyPage>} />
</Route>
```

**Change 2: Make AuthPage the root route**

Add after line 58:
```tsx
// Root route - Login page
<Route path="/" element={<AuthPage />} />
```

**Change 3: Keep /auth as an alias (optional, for backwards compatibility)**

Keep the existing:
```tsx
<Route path="/auth" element={<AuthPage />} />
```

**Change 4: (Optional) Move landing page to /landing**

If you want to keep the marketing page accessible:
```tsx
<Route element={<MarketingLayout />}>
  <Route path="/landing" element={<LazyPage><Pages.LandingPage /></LazyPage>} />
</Route>
```

---

## AuthPage Already Handles Auth Redirect

The `AuthPage` component (lines 52-57) already has proper redirect logic:

```tsx
useEffect(() => {
  if (user) {
    const from = location.state?.from?.pathname || "/dashboard";
    navigate(from, { replace: true });
  }
}, [user, navigate, location.state]);
```

This means:
- **Not logged in**: Shows login form
- **Already logged in**: Automatically redirects to `/dashboard`

---

## User Flow After Change

```text
User visits intellicohrm.net
         |
         v
    [AuthPage]
         |
    +----+----+
    |         |
 Not logged  Already
    in       logged in
    |         |
    v         v
 [Login    [Redirect to
  Form]    /dashboard]
```

---

## Files Changed

| File | Action | Changes |
|------|--------|---------|
| `src/App.tsx` | Update | Remove MarketingLayout for `/`, add AuthPage at `/`, optionally move landing page to `/landing` |

---

## Considerations

1. **SEO Impact**: The landing page had SEO meta tags. If you still need a public-facing marketing page, keeping it at `/landing` or a subdomain is recommended.

2. **Product Tour**: The product tour (`/product-tour`) still links to the system - this will continue to work as it's a separate route.

3. **Index.html**: The meta tags in `index.html` may need updating if you want login page SEO.

