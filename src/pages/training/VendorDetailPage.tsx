import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVendor } from "@/hooks/useVendors";
import { useTabState } from "@/hooks/useTabState";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { useLanguage } from "@/hooks/useLanguage";
import {
  VendorFormDialog,
  VendorOverviewTab,
  VendorCoursesTab,
  VendorSessionsTab,
  VendorContactsTab,
  VendorReviewsTab,
} from "@/components/training/vendor";
import {
  Building2,
  ArrowLeft,
  Star,
  Edit,
  Loader2,
  GraduationCap,
} from "lucide-react";

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { navigateToList } = useWorkspaceNavigation();
  const { data: vendor, isLoading } = useVendor(id);

  const [tabState, setTabState] = useTabState({
    defaultState: {
      activeTab: "overview",
      isEditDialogOpen: false,
    },
    syncToUrl: ["activeTab"],
  });

  const { activeTab, isEditDialogOpen } = tabState;

  const breadcrumbItems = [
    { label: t("training.dashboard.title"), href: "/training" },
    { label: "Vendor Management", href: "/training/vendors" },
    { label: vendor?.name || "Vendor" },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!vendor) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Vendor not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              navigateToList({
                route: "/training/vendors",
                title: "Training Vendors",
                moduleCode: "training",
                icon: Building2,
              })
            }
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Card className="flex-1">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold">{vendor.name}</h1>
                      {vendor.is_preferred && (
                        <Star className="h-5 w-5 text-warning fill-warning" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{vendor.code}</span>
                      <span>•</span>
                      <span className="capitalize">{vendor.vendor_type?.replace(/_/g, " ")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      vendor.status === "active"
                        ? "bg-success/10 text-success"
                        : vendor.status === "pending"
                        ? "bg-warning/10 text-warning"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {vendor.status}
                  </Badge>
                  <Button
                    variant="outline"
                    onClick={() => setTabState({ isEditDialogOpen: true })}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setTabState({ activeTab: value })}
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <VendorOverviewTab
              vendor={vendor}
              onEdit={() => setTabState({ isEditDialogOpen: true })}
            />
          </TabsContent>

          <TabsContent value="courses" className="mt-6">
            <VendorCoursesTab vendorId={vendor.id} />
          </TabsContent>

          <TabsContent value="sessions" className="mt-6">
            <VendorSessionsTab vendorId={vendor.id} />
          </TabsContent>

          <TabsContent value="contacts" className="mt-6">
            <VendorContactsTab vendorId={vendor.id} />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <VendorReviewsTab vendorId={vendor.id} companyId={vendor.company_id} />
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <VendorFormDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => setTabState({ isEditDialogOpen: open })}
          companyId={vendor.company_id}
          vendor={vendor}
        />
      </div>
    </AppLayout>
  );
}
