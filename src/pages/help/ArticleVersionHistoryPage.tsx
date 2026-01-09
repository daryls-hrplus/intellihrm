// Article Version History Page - Admin page for full version history management

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VersionTimeline } from "@/components/kb/VersionTimeline";
import { VersionCompareSelector } from "@/components/kb/VersionCompareSelector";
import { ContentDiffViewer } from "@/components/kb/ContentDiffViewer";
import { RollbackDialog } from "@/components/kb/RollbackDialog";
import { useArticleVersions } from "@/hooks/useArticleVersions";
import { supabase } from "@/integrations/supabase/client";
import {
  History,
  GitBranch,
  RotateCcw,
  FileText,
  Download,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import type { ArticleVersion } from "@/services/kb/types";

export default function ArticleVersionHistoryPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'timeline' | 'compare'>('timeline');
  const [selectedVersion, setSelectedVersion] = useState<ArticleVersion | null>(null);
  const [compareVersions, setCompareVersions] = useState<{ old: ArticleVersion; new: ArticleVersion } | null>(null);
  const [rollbackVersion, setRollbackVersion] = useState<ArticleVersion | null>(null);

  // Fetch article details
  const { data: article } = useQuery({
    queryKey: ['kb-article', articleId],
    queryFn: async () => {
      if (!articleId) return null;
      const { data, error } = await supabase
        .from('kb_articles')
        .select('*')
        .eq('id', articleId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!articleId,
  });

  // Fetch versions
  const { versions, isLoading, rollback } = useArticleVersions(articleId || null);

  const handleSelectVersion = (version: ArticleVersion) => {
    setSelectedVersion(version);
  };

  const handleCompare = (oldVersion: ArticleVersion, newVersion: ArticleVersion) => {
    setCompareVersions({ old: oldVersion, new: newVersion });
    setActiveTab('compare');
  };

  const handleRollback = (version: ArticleVersion) => {
    setRollbackVersion(version);
  };

  const handleConfirmRollback = async (reason: string) => {
    if (!rollbackVersion) return;
    
    // Get current user - in real app would come from auth context
    const userId = 'current-user-id';
    
    await rollback.mutateAsync({
      targetVersionId: rollbackVersion.id,
      reason,
      userId,
    });
    
    setRollbackVersion(null);
  };

  const handleDownloadVersion = (version: ArticleVersion) => {
    const content = `# ${version.title}\n\nVersion: ${version.version_number}\nStatus: ${version.status}\nCreated: ${format(new Date(version.created_at), 'MMMM d, yyyy')}\n\n---\n\n${version.content}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${version.title?.replace(/\s+/g, '-')}-v${version.version_number}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Help Center", href: "/help/kb" },
            { label: article?.title || "Article", href: `/help/kb/articles/${articleId}` },
            { label: "Version History" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <History className="h-6 w-6 text-primary" />
                Version History
              </h1>
              <p className="text-muted-foreground mt-1">
                {article?.title || 'Loading...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {versions.length} versions
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Version Timeline
              </CardTitle>
              <CardDescription>
                All versions of this article
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VersionTimeline
                versions={versions}
                currentVersionId={article?.current_version_id}
                onSelectVersion={handleSelectVersion}
                onCompare={handleCompare}
                onRollback={handleRollback}
                maxHeight="500px"
              />
            </CardContent>
          </Card>

          {/* Detail Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList>
                  <TabsTrigger value="timeline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Version Details
                  </TabsTrigger>
                  <TabsTrigger value="compare" className="gap-2">
                    <GitBranch className="h-4 w-4" />
                    Compare Versions
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <TabsContent value="timeline" className="m-0">
                {selectedVersion ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedVersion.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">v{selectedVersion.version_number}</Badge>
                          <Badge variant={selectedVersion.status === 'published' ? 'default' : 'secondary'}>
                            {selectedVersion.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(selectedVersion.created_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadVersion(selectedVersion)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        {selectedVersion.status === 'published' && selectedVersion.id !== article?.current_version_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRollback(selectedVersion)}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Rollback
                          </Button>
                        )}
                      </div>
                    </div>

                    {selectedVersion.change_summary && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">Change Summary</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedVersion.change_summary}
                        </p>
                      </div>
                    )}

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Content Preview</h4>
                      <div className="prose prose-sm dark:prose-invert max-w-none max-h-[400px] overflow-auto">
                        <pre className="whitespace-pre-wrap text-sm">
                          {selectedVersion.content}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a version from the timeline to view details</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="compare" className="m-0">
                <div className="space-y-4">
                  <VersionCompareSelector
                    versions={versions}
                    defaultOldVersion={compareVersions?.old.id}
                    defaultNewVersion={compareVersions?.new.id}
                  />

                  {compareVersions && (
                    <ContentDiffViewer
                      oldContent={compareVersions.old.content || ''}
                      newContent={compareVersions.new.content || ''}
                      oldVersionLabel={`v${compareVersions.old.version_number}`}
                      newVersionLabel={`v${compareVersions.new.version_number}`}
                    />
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </div>

        {/* Rollback Dialog */}
        {rollbackVersion && (
          <RollbackDialog
            isOpen={!!rollbackVersion}
            onClose={() => setRollbackVersion(null)}
            onConfirm={handleConfirmRollback}
            targetVersion={rollbackVersion}
            isLoading={rollback.isPending}
          />
        )}
      </div>
    </AppLayout>
  );
}
