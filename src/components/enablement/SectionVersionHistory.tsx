// Version history and diff viewer for manual sections

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  History, 
  RotateCcw, 
  GitCompare, 
  Clock,
  User,
  FileText,
  ChevronDown,
  ChevronRight,
  Loader2,
  Check
} from "lucide-react";
import { 
  useSectionVersions, 
  useRollbackToVersion,
  SectionVersion 
} from "@/hooks/useManualVersions";
import { formatDistanceToNow, format } from "date-fns";
import { ManualSection } from "@/hooks/useManualGeneration";

interface SectionVersionHistoryProps {
  section: ManualSection;
  onClose: () => void;
  onVersionRestored?: () => void;
}

export function SectionVersionHistory({ 
  section, 
  onClose,
  onVersionRestored 
}: SectionVersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<SectionVersion | null>(null);
  const [compareVersion, setCompareVersion] = useState<SectionVersion | null>(null);
  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);

  const { data: versions = [], isLoading } = useSectionVersions(section.id);
  const rollback = useRollbackToVersion();

  const getChangeTypeBadge = (type: SectionVersion['change_type']) => {
    switch (type) {
      case 'content':
        return <Badge variant="secondary">Content</Badge>;
      case 'structure':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Structure</Badge>;
      case 'branding':
        return <Badge variant="outline" className="border-purple-500 text-purple-500">Branding</Badge>;
      case 'import':
        return <Badge variant="outline" className="border-green-500 text-green-500">Import</Badge>;
      case 'rollback':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Rollback</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleRollback = async () => {
    if (!selectedVersion) return;
    
    await rollback.mutateAsync({
      sectionId: section.id,
      versionId: selectedVersion.id,
      changeSummary: `Rolled back to version ${selectedVersion.version_number}`
    });
    
    setShowRollbackConfirm(false);
    setSelectedVersion(null);
    onVersionRestored?.();
  };

  const renderContentPreview = (content: Record<string, any> | null) => {
    if (!content) return <span className="text-muted-foreground">No content</span>;
    
    const preview = JSON.stringify(content, null, 2);
    return (
      <pre className="text-xs bg-muted/30 p-3 rounded-lg overflow-auto max-h-[200px] whitespace-pre-wrap">
        {preview.length > 500 ? preview.slice(0, 500) + '...' : preview}
      </pre>
    );
  };

  const renderDiff = () => {
    if (!selectedVersion || !compareVersion) return null;

    const v1Content = JSON.stringify(selectedVersion.content, null, 2);
    const v2Content = JSON.stringify(compareVersion.content, null, 2);

    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <h4 className="font-medium text-sm mb-2">Version {selectedVersion.version_number}</h4>
          <pre className="text-xs bg-muted/30 p-3 rounded-lg overflow-auto max-h-[300px] whitespace-pre-wrap">
            {v1Content}
          </pre>
        </div>
        <div>
          <h4 className="font-medium text-sm mb-2">Version {compareVersion.version_number}</h4>
          <pre className="text-xs bg-muted/30 p-3 rounded-lg overflow-auto max-h-[300px] whitespace-pre-wrap">
            {v2Content}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Version History
              </CardTitle>
              <CardDescription>
                {section.section_number} - {section.title}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium">No version history</h3>
              <p className="text-sm text-muted-foreground">
                Versions are created automatically when content is saved
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Compare mode indicator */}
              {selectedVersion && (
                <div className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      Version {selectedVersion.version_number} selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {compareVersion ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCompareVersion(null)}
                      >
                        <GitCompare className="h-4 w-4 mr-2" />
                        Exit Compare
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowRollbackConfirm(true)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Rollback
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedVersion(null);
                        setCompareVersion(null);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              {/* Diff view */}
              {selectedVersion && compareVersion && renderDiff()}

              {/* Version timeline */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-4">
                  {versions.map((version, index) => (
                    <div
                      key={version.id}
                      className={`
                        border rounded-lg p-3 transition-colors cursor-pointer
                        ${selectedVersion?.id === version.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}
                        ${compareVersion?.id === version.id ? 'border-blue-500 bg-blue-500/5' : ''}
                      `}
                      onClick={() => {
                        if (selectedVersion && selectedVersion.id !== version.id) {
                          setCompareVersion(version);
                        } else {
                          setSelectedVersion(version);
                          setCompareVersion(null);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono">
                            v{version.version_number}
                          </Badge>
                          {getChangeTypeBadge(version.change_type)}
                          {index === 0 && (
                            <Badge variant="default" className="text-xs">Latest</Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedVersionId(
                              expandedVersionId === version.id ? null : version.id
                            );
                          }}
                        >
                          {expandedVersionId === version.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                        </div>
                        {version.changed_by && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            User
                          </div>
                        )}
                      </div>

                      {version.change_summary && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {version.change_summary}
                        </p>
                      )}

                      {/* Expanded content preview */}
                      {expandedVersionId === version.id && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm font-medium">Content Preview</span>
                          </div>
                          {renderContentPreview(version.content)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rollback Confirmation Dialog */}
      <Dialog open={showRollbackConfirm} onOpenChange={setShowRollbackConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Rollback</DialogTitle>
            <DialogDescription>
              Are you sure you want to rollback to version {selectedVersion?.version_number}? 
              This will replace the current content with the selected version.
            </DialogDescription>
          </DialogHeader>
          
          {selectedVersion && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">v{selectedVersion.version_number}</Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(selectedVersion.created_at), 'PPP')}
                </span>
              </div>
              <p className="text-sm">{selectedVersion.change_summary || 'No description'}</p>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRollbackConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRollback}
              disabled={rollback.isPending}
            >
              {rollback.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Rollback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
