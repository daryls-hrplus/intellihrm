
# Vendor Management UI Implementation Plan

## Overview

Implement the 6 planned UI components documented in Chapter 3's UI Roadmap:
1. `VendorManagementPage` - CRUD registry at `/training/vendors`
2. `VendorDetailPage` - Profile with tabs at `/training/vendors/:id`
3. `VendorCoursesTab` - Course catalog management (embedded)
4. `VendorSessionsTab` - Session scheduling (embedded)
5. `VendorContactsTab` - Contact management (embedded)
6. `VendorReviewsTab` - Performance reviews (embedded)

---

## Phase 1: Create Vendor Type Definitions

### File: `src/types/vendor.ts`

Define TypeScript interfaces matching the database schema:

```typescript
// Core vendor interface (31 fields from training_vendors)
interface Vendor {
  id: string;
  company_id: string;
  code: string;
  name: string;
  description: string | null;
  vendor_type: string;
  status: 'active' | 'pending' | 'suspended' | 'terminated';
  is_preferred: boolean;
  is_shared: boolean | null;
  // Contact info (legacy single contact)
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  // Contract details
  contract_start_date: string | null;
  contract_end_date: string | null;
  contract_value: number | null;
  // ... additional fields
}

// Related entity interfaces
interface VendorCourse { ... }  // 17 fields
interface VendorSession { ... } // 25 fields  
interface VendorContact { ... } // 11 fields
interface VendorReview { ... }  // 17 fields
```

---

## Phase 2: Create Vendor Data Hooks

### File: `src/hooks/useVendors.ts`

Custom hook for vendor CRUD operations:

```typescript
export function useVendors(companyId: string) {
  // Fetch vendors list with filters
  const { data: vendors, isLoading, refetch } = useQuery({
    queryKey: ['vendors', companyId],
    queryFn: () => supabase
      .from('training_vendors')
      .select('*')
      .eq('company_id', companyId)
  });

  // Create vendor mutation
  const createVendor = useMutation({ ... });
  
  // Update vendor mutation
  const updateVendor = useMutation({ ... });

  return { vendors, isLoading, createVendor, updateVendor, refetch };
}
```

### Additional hooks:
- `useVendorCourses(vendorId)` - Course catalog operations
- `useVendorSessions(vendorId)` - Session scheduling operations
- `useVendorContacts(vendorId)` - Multi-contact management
- `useVendorReviews(vendorId)` - Performance review operations

---

## Phase 3: Create VendorManagementPage

### File: `src/pages/training/VendorManagementPage.tsx`

Full CRUD registry following existing patterns (similar to `InstructorsPage`):

**Features:**
- Company filter selector (multi-company support)
- Data table with sortable columns
- Status badges (Active, Pending, Suspended, Terminated)
- Preferred vendor indicator
- Contract expiry warnings
- Performance score display
- Search and filter capabilities
- Add/Edit vendor dialog

**Key Components:**
```tsx
<AppLayout>
  <Breadcrumbs items={[
    { label: "Learning & Development", href: "/training" },
    { label: "Vendor Management" }
  ]} />
  
  <PageHeader 
    title="Training Vendors"
    icon={Building2}
    actions={<Button onClick={openAddDialog}>Add Vendor</Button>}
  />
  
  <CompanySelector />
  
  <VendorDataTable 
    vendors={vendors}
    onRowClick={navigateToVendorDetail}
  />
  
  <VendorFormDialog />
</AppLayout>
```

---

## Phase 4: Create VendorDetailPage

### File: `src/pages/training/VendorDetailPage.tsx`

Profile page with tabbed interface (similar to `EmployeeProfilePage` pattern):

**Layout:**
```tsx
<AppLayout>
  <Breadcrumbs items={[...]} />
  
  {/* Vendor Header Card */}
  <Card>
    <VendorProfileHeader vendor={vendor} />
    <VendorQuickStats vendor={vendor} />
  </Card>
  
  {/* Tabbed Content */}
  <Tabs value={activeTab} onValueChange={handleTabChange}>
    <TabsList>
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="courses">Courses</TabsTrigger>
      <TabsTrigger value="sessions">Sessions</TabsTrigger>
      <TabsTrigger value="contacts">Contacts</TabsTrigger>
      <TabsTrigger value="reviews">Reviews</TabsTrigger>
    </TabsList>
    
    <TabsContent value="overview">
      <VendorOverviewTab vendor={vendor} />
    </TabsContent>
    <TabsContent value="courses">
      <VendorCoursesTab vendorId={vendorId} />
    </TabsContent>
    <TabsContent value="sessions">
      <VendorSessionsTab vendorId={vendorId} />
    </TabsContent>
    <TabsContent value="contacts">
      <VendorContactsTab vendorId={vendorId} />
    </TabsContent>
    <TabsContent value="reviews">
      <VendorReviewsTab vendorId={vendorId} />
    </TabsContent>
  </Tabs>
</AppLayout>
```

**Tab State Persistence:**
- Use `useTabState` for active tab
- Sync tab to URL (`?tab=courses`)

---

## Phase 5: Create Embedded Tab Components

### 5.1 VendorCoursesTab

**File:** `src/components/training/vendor/VendorCoursesTab.tsx`

**Features:**
- Course catalog table (17 fields)
- Add/Edit course dialog
- Delivery method badges (Classroom, Virtual, Hybrid, Online)
- Certification tracking
- Base pricing display
- Course activation toggle

### 5.2 VendorSessionsTab

**File:** `src/components/training/vendor/VendorSessionsTab.tsx`

**Features:**
- Session calendar/table view
- Status badges (Scheduled, Confirmed, Completed, Cancelled)
- Capacity indicators (registered vs capacity)
- Waitlist count display
- Instructor assignment
- Registration deadline warnings
- Session enrollment details

### 5.3 VendorContactsTab

**File:** `src/components/training/vendor/VendorContactsTab.tsx`

**Features:**
- Multi-contact management (11 fields)
- Contact type categorization (Primary, Billing, Technical, Escalation)
- Primary contact designation
- Quick actions (email, call)
- Add/Edit contact dialog

### 5.4 VendorReviewsTab

**File:** `src/components/training/vendor/VendorReviewsTab.tsx`

**Features:**
- Review history table (17 fields)
- Score visualization (Quality, Delivery, Value, Responsiveness)
- Overall score trending chart
- Action items tracking
- Add review dialog
- Review status (Draft, Submitted, Approved)

---

## Phase 6: Routing and Navigation

### 6.1 Update `src/routes/lazyPages.ts`

Add lazy exports:
```typescript
// Vendor Management
export const VendorManagementPage = lazy(() => import('@/pages/training/VendorManagementPage'));
export const VendorDetailPage = lazy(() => import('@/pages/training/VendorDetailPage'));
```

### 6.2 Update `src/App.tsx`

Add routes in Training section:
```tsx
<Route path="/training/vendors" element={
  <ProtectedRoute moduleCode="training">
    <LazyPage><Pages.VendorManagementPage /></LazyPage>
  </ProtectedRoute>
} />
<Route path="/training/vendors/:id" element={
  <ProtectedRoute moduleCode="training">
    <LazyPage><Pages.VendorDetailPage /></LazyPage>
  </ProtectedRoute>
} />
```

### 6.3 Update Icon Registry

Add vendor-specific icons to `src/lib/iconRegistry.ts`:
```typescript
// Already present: Building2, Users, Calendar, Star
// Ensure: Handshake, FileContract (if needed)
```

---

## Phase 7: Integration Points

### 7.1 Training Dashboard Link

Add vendor management card to `TrainingDashboardPage.tsx`:
```tsx
<ModuleCard
  title="Vendor Management"
  description="Manage external training providers"
  icon={Building2}
  onClick={() => navigateToList({
    route: "/training/vendors",
    title: "Training Vendors",
    moduleCode: "training",
    icon: Building2,
  })}
/>
```

### 7.2 External Training Link

Update `ExternalTrainingPage.tsx` to link to vendor detail when provider matches a vendor.

---

## Phase 8: Update Documentation

### 8.1 Update UI Roadmap in `LndVendorConcepts.tsx`

Change status from "PLANNED" to "IMPLEMENTED":
```tsx
<Badge className="bg-green-100 text-green-800">IMPLEMENTED</Badge>
```

---

## File Summary

| File | Action | Lines (Est.) |
|------|--------|-------------|
| `src/types/vendor.ts` | CREATE | ~120 |
| `src/hooks/useVendors.ts` | CREATE | ~180 |
| `src/hooks/useVendorCourses.ts` | CREATE | ~80 |
| `src/hooks/useVendorSessions.ts` | CREATE | ~90 |
| `src/hooks/useVendorContacts.ts` | CREATE | ~60 |
| `src/hooks/useVendorReviews.ts` | CREATE | ~70 |
| `src/pages/training/VendorManagementPage.tsx` | CREATE | ~350 |
| `src/pages/training/VendorDetailPage.tsx` | CREATE | ~400 |
| `src/components/training/vendor/VendorCoursesTab.tsx` | CREATE | ~280 |
| `src/components/training/vendor/VendorSessionsTab.tsx` | CREATE | ~320 |
| `src/components/training/vendor/VendorContactsTab.tsx` | CREATE | ~200 |
| `src/components/training/vendor/VendorReviewsTab.tsx` | CREATE | ~280 |
| `src/components/training/vendor/VendorFormDialog.tsx` | CREATE | ~300 |
| `src/components/training/vendor/VendorOverviewTab.tsx` | CREATE | ~150 |
| `src/components/training/vendor/index.ts` | CREATE | ~20 |
| `src/routes/lazyPages.ts` | MODIFY | +3 |
| `src/App.tsx` | MODIFY | +6 |
| `src/pages/training/TrainingDashboardPage.tsx` | MODIFY | +15 |
| `LndVendorConcepts.tsx` | MODIFY | +5 |
| **TOTAL** | | **~2,900 lines** |

---

## Technical Implementation Notes

1. **State Management**: Use `useTabState` for all filter/search persistence
2. **Navigation**: Use `navigateToRecord` with `contextType: "vendor"` for duplicate tab prevention
3. **Data Fetching**: Use TanStack Query with proper cache invalidation
4. **Form Handling**: Use React Hook Form + Zod for validation
5. **Multi-Company**: Respect `company_id` scoping with optional `group_id` for shared vendors
6. **RLS**: Existing policies on vendor tables will enforce access control

---

## Implementation Order

1. **Phase 1-2**: Types and hooks (foundation)
2. **Phase 3**: VendorManagementPage (entry point)
3. **Phase 4**: VendorDetailPage with overview
4. **Phase 5**: Embedded tabs (courses, sessions, contacts, reviews)
5. **Phase 6**: Routing integration
6. **Phase 7**: Dashboard integration
7. **Phase 8**: Documentation update
