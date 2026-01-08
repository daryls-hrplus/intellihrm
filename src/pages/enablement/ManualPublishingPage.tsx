// Manual Publishing Page - Dashboard for publishing manuals to Help Center

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ManualPublishCard } from "@/components/kb/ManualPublishCard";
import { useManualPublishing, MANUAL_CONFIGS } from "@/hooks/useManualPublishing";
import { Upload, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ManualPublishingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const { publishedManuals, isLoading, getManualStatus } = useManualPublishing();

  // Calculate stats
  const stats = MANUAL_CONFIGS.reduce(
    (acc, manual) => {
      const status = getManualStatus(manual.id);
      if (!status.isPublished) acc.notPublished++;
      else if (status.needsSync) acc.needsSync++;
      else acc.published++;
      return acc;
    },
    { notPublished: 0, published: 0, needsSync: 0 }
  );

  // Filter manuals by tab
  const filteredManuals = MANUAL_CONFIGS.filter(manual => {
    const status = getManualStatus(manual.id);
    if (activeTab === "all") return true;
    if (activeTab === "not-published") return !status.isPublished;
    if (activeTab === "needs-sync") return status.isPublished && status.needsSync;
    if (activeTab === "published") return status.isPublished && !status.needsSync;
    return true;
  });

  const handlePublish = (manualId: string) => {
    toast.info("Publishing wizard coming soon - database schema is ready!");
  };

  const handleSync = (manualId: string) => {
    toast.info("Sync functionality coming soon!");
  };

  const handleViewHistory = (manualId: string) => {
    toast.info("Version history coming soon!");
  };

  const handlePreview = (manualId: string) => {
    const config = MANUAL_CONFIGS.find(m => m.id === manualId);
    if (config) navigate(config.href);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Manual Publishing" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Upload className="h-6 w-6 text-primary" />
              Manual Publishing Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Publish administrator manuals to the Help Center Knowledge Base with version control
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{MANUAL_CONFIGS.length}</p>
                  <p className="text-xs text-muted-foreground">Total Manuals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.published}</p>
                  <p className="text-xs text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.needsSync}</p>
                  <p className="text-xs text-muted-foreground">Needs Sync</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-500/10">
                  <Clock className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.notPublished}</p>
                  <p className="text-xs text-muted-foreground">Not Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Manual List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              All Manuals
              <Badge variant="secondary" className="ml-2">{MANUAL_CONFIGS.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="not-published">
              Not Published
              {stats.notPublished > 0 && (
                <Badge variant="secondary" className="ml-2">{stats.notPublished}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="needs-sync">
              Needs Sync
              {stats.needsSync > 0 && (
                <Badge variant="outline" className="ml-2 border-amber-500 text-amber-600">
                  {stats.needsSync}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="published">
              Published
              {stats.published > 0 && (
                <Badge variant="secondary" className="ml-2">{stats.published}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredManuals.map(manual => (
                <ManualPublishCard
                  key={manual.id}
                  manual={manual}
                  status={getManualStatus(manual.id)}
                  onPublish={() => handlePublish(manual.id)}
                  onSync={() => handleSync(manual.id)}
                  onViewHistory={() => handleViewHistory(manual.id)}
                  onPreview={() => handlePreview(manual.id)}
                />
              ))}
              
              {filteredManuals.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No manuals match the current filter.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
