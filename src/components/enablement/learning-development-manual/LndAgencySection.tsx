import { Building2 } from 'lucide-react';
import {
  LndVendorConcepts,
  LndVendorRegistry,
  LndVendorSelection,
  LndVendorCourses,
  LndVendorSessions,
  LndVendorCosts,
  LndTrainingRequests,
  LndExternalRecords,
  LndVendorPerformance,
  LndExternalCertifications,
  LndVendorSharing,
  LndVendorIntegration
} from './sections/agency';

export function LndAgencySection() {
  return (
    <div className="space-y-12">
      {/* Chapter Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Building2 className="h-8 w-8 text-emerald-600" />
          Chapter 3: External Training & Vendor Management
        </h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Comprehensive guide to managing external training vendors, course catalogs, 
          session scheduling, cost tracking, and performance management. Follows 
          industry-standard vendor lifecycle methodology aligned with Workday and 
          Cornerstone best practices.
        </p>
        <div className="flex gap-2 mt-4">
          <span className="text-sm bg-muted px-3 py-1 rounded-full">12 Sections</span>
          <span className="text-sm bg-muted px-3 py-1 rounded-full">~90 min read</span>
          <span className="text-sm bg-muted px-3 py-1 rounded-full">5 Database Tables</span>
        </div>
      </div>

      {/* All 12 Sections */}
      <LndVendorConcepts />
      <LndVendorRegistry />
      <LndVendorSelection />
      <LndVendorCourses />
      <LndVendorSessions />
      <LndVendorCosts />
      <LndTrainingRequests />
      <LndExternalRecords />
      <LndVendorPerformance />
      <LndExternalCertifications />
      <LndVendorSharing />
      <LndVendorIntegration />
    </div>
  );
}
