import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTabState } from "@/hooks/useTabState";
import { useContentReview } from "@/hooks/useContentReview";
import { PendingReviewQueue } from "@/components/enablement/PendingReviewQueue";
import { ContentReviewPanel } from "@/components/enablement/ContentReviewPanel";
import { 
  ClipboardCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle,
  FileText,
  History,
  Filter
} from "lucide-react";
import { Loader2 } from "lucide-react";

export default function ContentReviewCenterPage() {
  const [tabState, setTabState] = useTabState({
    defaultState: {
      activeTab: "pending",
      selectedManual: "all",
      selectedSectionId: null as string | null,
      searchTerm: "",
    },
  });

  const {
    pendingReviews,
    approvedSections,
    pendingCount,
    approvedCount,
    isLoadingPending,
    isLoadingApproved,
    approve,
    reject,
    editAndApprove,
    isApproving,
    isRejecting,
    isEditing,
  } = useContentReview();

  // Get unique manuals from pending reviews
  const uniqueManuals = Array.from(
    new Set(pendingReviews.map(r => r.manual_name).filter(Boolean))
  );

  // Filter reviews based on selected manual and search
  const filteredPending = pendingReviews.filter(review => {
    const matchesManual = tabState.selectedManual === "all" || review.manual_name === tabState.selectedManual;
    const matchesSearch = !tabState.searchTerm || 
      review.title?.toLowerCase().includes(tabState.searchTerm.toLowerCase()) ||
      review.section_number?.toLowerCase().includes(tabState.searchTerm.toLowerCase());
    return matchesManual && matchesSearch;
  });

  const filteredApproved = approvedSections.filter(section => {
    const matchesManual = tabState.selectedManual === "all" || section.manual_name === tabState.selectedManual;
    const matchesSearch = !tabState.searchTerm || 
      section.title?.toLowerCase().includes(tabState.searchTerm.toLowerCase()) ||
      section.section_number?.toLowerCase().includes(tabState.searchTerm.toLowerCase());
    return matchesManual && matchesSearch;
  });

  const handleApprove = async (sectionId: string) => {
    await approve({ sectionId });
    setTabState({ selectedSectionId: null });
  };

  const handleReject = async (sectionId: string, reason: string) => {
    await reject({ sectionId, reason });
    setTabState({ selectedSectionId: null });
  };

  const handleEditAndApprove = async (sectionId: string, editedContent: string) => {
    await editAndApprove({ sectionId, editedContent });
    setTabState({ selectedSectionId: null });
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Content Review Center" },
          ]}
        />

        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ClipboardCheck className="h-8 w-8 text-primary" />
              Content Review Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and approve AI-generated content before publishing to Help Center
            </p>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{approvedCount}</p>
                  <p className="text-xs text-muted-foreground">Ready to Publish</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount + approvedCount}</p>
                  <p className="text-xs text-muted-foreground">Total in Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sections..."
                  value={tabState.searchTerm}
                  onChange={(e) => setTabState({ searchTerm: e.target.value })}
                  className="max-w-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={tabState.selectedManual}
                  onValueChange={(value) => setTabState({ selectedManual: value })}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Manuals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Manuals</SelectItem>
                    {uniqueManuals.map(manual => (
                      <SelectItem key={manual} value={manual!}>
                        {manual}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs
          value={tabState.activeTab}
          onValueChange={(v) => setTabState({ activeTab: v })}
        >
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Review
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Ready to Publish
              {approvedCount > 0 && (
                <Badge variant="outline" className="ml-1">
                  {approvedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Review History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            {isLoadingPending ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPending.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">All caught up!</h3>
                  <p className="text-muted-foreground">
                    No content pending review. Generate new content in the Content Creation Studio.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <PendingReviewQueue
                reviews={filteredPending}
                onSelectSection={(id) => setTabState({ selectedSectionId: id })}
                selectedSectionId={tabState.selectedSectionId}
              />
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-4">
            {isLoadingApproved ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredApproved.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No approved content</h3>
                  <p className="text-muted-foreground">
                    Approve pending content to see it here before publishing.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredApproved.map(section => (
                  <Card key={section.id} className="hover:bg-muted/50 cursor-pointer transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{section.section_number}</Badge>
                          <span className="font-medium">{section.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {section.manual_name}
                        </p>
                      </div>
                      <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Review History</CardTitle>
                <CardDescription>
                  Complete audit trail of all review actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Select a section to view its review history
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Side Panel for Review */}
        <ContentReviewPanel
          sectionId={tabState.selectedSectionId}
          onClose={() => setTabState({ selectedSectionId: null })}
          onApprove={handleApprove}
          onReject={handleReject}
          onEdit={handleEditAndApprove}
          isApproving={isApproving}
          isRejecting={isRejecting}
          isEditing={isEditing}
        />
      </div>
    </AppLayout>
  );
}
