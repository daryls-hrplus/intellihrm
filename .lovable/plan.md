

# Exclude Enablement Module from Production Build

## Problem
The production build consistently OOMs at ~3GB during the "rendering chunks" phase with 9,698 modules. The Enablement Center is the largest module (70+ components, 33 pages, product capabilities document with 30+ section files) and is only used by internal Intelli HRM staff, not client tenants.

## Approach
Conditionally exclude the Enablement Center routes from the production build using an environment variable flag. This removes hundreds of modules from the build graph, bringing memory usage well under the 3GB limit.

## Changes

### 1. Conditionally load Enablement routes in `src/App.tsx`
- Wrap the `{EnablementAppRoutes()}` call with a build-time check using `import.meta.env.VITE_INCLUDE_ENABLEMENT`
- When the variable is not set (production Lovable builds), enablement routes are excluded
- When set to `"true"` (e.g., local dev or GitHub CI), enablement routes are included
- In dev mode (`import.meta.env.DEV`), always include enablement routes so development is unaffected

### 2. Update `vite.config.ts` chunking
- Further split remaining large chunks (performance, admin, workforce pages) into dedicated chunks to ensure even without enablement, the build stays safely under limits
- Add splits for more page directories (admin, performance, workforce, employee-relations, payroll, etc.)

### 3. No code is deleted
- All enablement code stays in the codebase
- It simply won't be included in the production bundle unless opted in
- The `EnablementAccessGuard` already redirects non-internal users, so client tenants are unaffected
- Internal staff access enablement via the dev preview or a GitHub-deployed build

## Technical Details

**Files modified:**
- `src/App.tsx` -- conditional enablement route inclusion
- `vite.config.ts` -- more granular chunk splitting for remaining modules

**How it works:**
```text
Production (Lovable publish):
  VITE_INCLUDE_ENABLEMENT not set --> EnablementAppRoutes() skipped
  Result: ~9,000 modules removed from chunk rendering

Development (local/preview):
  import.meta.env.DEV = true --> EnablementAppRoutes() always included
  Result: Full functionality available

GitHub CI (optional):
  VITE_INCLUDE_ENABLEMENT=true --> EnablementAppRoutes() included
  Result: Full build with higher memory limit
```

