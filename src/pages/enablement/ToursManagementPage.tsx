import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, BarChart3, Settings2, Video } from "lucide-react";
import { TourListManager } from "@/components/enablement/tours/TourListManager";
import { TourStepsEditor } from "@/components/enablement/tours/TourStepsEditor";
import { TourAnalyticsDashboard } from "@/components/enablement/tours/TourAnalyticsDashboard";
import { TooltipsManager } from "@/components/enablement/tours/TooltipsManager";

export default function ToursManagementPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("tours");
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Guided Tours" },
          ]}
        />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Map className="h-8 w-8 text-primary" />
              Guided Tours Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage interactive guided tours, tooltips, and contextual help
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="tours" className="gap-2">
              <Map className="h-4 w-4" />
              Tours
            </TabsTrigger>
            <TabsTrigger value="steps" className="gap-2" disabled={!selectedTourId}>
              <Settings2 className="h-4 w-4" />
              Steps Editor
            </TabsTrigger>
            <TabsTrigger value="tooltips" className="gap-2">
              <Video className="h-4 w-4" />
              Tooltips
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tours">
            <TourListManager
              onSelectTour={(tourId) => {
                setSelectedTourId(tourId);
                setActiveTab("steps");
              }}
            />
          </TabsContent>

          <TabsContent value="steps">
            {selectedTourId && (
              <TourStepsEditor
                tourId={selectedTourId}
                onBack={() => {
                  setSelectedTourId(null);
                  setActiveTab("tours");
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="tooltips">
            <TooltipsManager />
          </TabsContent>

          <TabsContent value="analytics">
            <TourAnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
