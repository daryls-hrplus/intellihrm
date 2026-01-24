import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CompensationCompanyFilter, useCompensationCompanyFilter } from "@/components/compensation/CompensationCompanyFilter";
import { CompensationReviewFlagsList } from "@/components/compensation/CompensationReviewFlagsList";
import { useCompensationReviewFlags } from "@/hooks/useCompensationReviewFlags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flag, ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export default function CompensationReviewFlagsPage() {
  const { selectedCompanyId, setSelectedCompanyId } = useCompensationCompanyFilter();
  const [activeTab, setActiveTab] = useState("pending");

  const { flags, loading, fetchFlags, approveFlag, rejectFlag, markProcessed } =
    useCompensationReviewFlags({
      companyId: selectedCompanyId,
      status: activeTab,
    });

  const pendingCount = flags.filter((f) => f.status === "pending").length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/compensation">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Flag className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Performance Review Flags
                </h1>
                <p className="text-muted-foreground">
                  Review and process compensation flags triggered by performance appraisals
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchFlags()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border border-border bg-card">
          <CompensationCompanyFilter
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={setSelectedCompanyId}
            showAllOption={true}
          />
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Review Flags
              {pendingCount > 0 && activeTab === "pending" && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-amber-500/10 px-2 py-0.5 text-sm font-medium text-amber-600">
                  {pendingCount} pending
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Compensation review flags are automatically created when employees meet specific
              performance criteria during appraisals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="processed">Processed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                <CompensationReviewFlagsList
                  flags={flags}
                  loading={loading}
                  onApprove={approveFlag}
                  onReject={rejectFlag}
                  onMarkProcessed={markProcessed}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
