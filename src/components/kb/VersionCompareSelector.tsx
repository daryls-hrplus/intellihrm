// Version Compare Selector - Compare any two article versions

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContentDiffViewer } from "./ContentDiffViewer";
import { GitBranch, Maximize2, ArrowRight } from "lucide-react";
import type { ArticleVersion } from "@/services/kb/types";

interface VersionCompareSelectorProps {
  versions: ArticleVersion[];
  onCompare?: (oldVersionId: string, newVersionId: string) => void;
  defaultOldVersion?: string;
  defaultNewVersion?: string;
}

type QuickCompareOption = 'current-vs-previous' | 'current-vs-published' | 'published-vs-original' | 'custom';

export function VersionCompareSelector({
  versions,
  onCompare,
  defaultOldVersion,
  defaultNewVersion,
}: VersionCompareSelectorProps) {
  const [oldVersionId, setOldVersionId] = useState(defaultOldVersion || '');
  const [newVersionId, setNewVersionId] = useState(defaultNewVersion || '');
  const [quickOption, setQuickOption] = useState<QuickCompareOption>('custom');
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  // Sort versions by date (newest first)
  const sortedVersions = useMemo(() => 
    [...versions].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
    [versions]
  );

  // Find specific versions
  const latestVersion = sortedVersions[0];
  const previousVersion = sortedVersions[1];
  const publishedVersion = sortedVersions.find(v => v.status === 'published');
  const originalVersion = sortedVersions[sortedVersions.length - 1];

  // Get selected versions
  const oldVersion = versions.find(v => v.id === oldVersionId);
  const newVersion = versions.find(v => v.id === newVersionId);

  // Handle quick option changes
  const handleQuickOption = (option: QuickCompareOption) => {
    setQuickOption(option);
    
    switch (option) {
      case 'current-vs-previous':
        if (latestVersion && previousVersion) {
          setOldVersionId(previousVersion.id);
          setNewVersionId(latestVersion.id);
        }
        break;
      case 'current-vs-published':
        if (latestVersion && publishedVersion) {
          setOldVersionId(publishedVersion.id);
          setNewVersionId(latestVersion.id);
        }
        break;
      case 'published-vs-original':
        if (publishedVersion && originalVersion) {
          setOldVersionId(originalVersion.id);
          setNewVersionId(publishedVersion.id);
        }
        break;
    }
  };

  const handleCompare = () => {
    if (oldVersionId && newVersionId && onCompare) {
      onCompare(oldVersionId, newVersionId);
    }
  };

  const canCompare = oldVersionId && newVersionId && oldVersionId !== newVersionId;

  return (
    <div className="space-y-4">
      {/* Quick Options */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={quickOption === 'current-vs-previous' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleQuickOption('current-vs-previous')}
          disabled={!previousVersion}
        >
          Current vs Previous
        </Button>
        <Button
          variant={quickOption === 'current-vs-published' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleQuickOption('current-vs-published')}
          disabled={!publishedVersion || publishedVersion.id === latestVersion?.id}
        >
          Current vs Published
        </Button>
        <Button
          variant={quickOption === 'published-vs-original' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleQuickOption('published-vs-original')}
          disabled={!publishedVersion || publishedVersion.id === originalVersion?.id}
        >
          Published vs Original
        </Button>
      </div>

      {/* Version Selectors */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">From Version</label>
          <Select
            value={oldVersionId}
            onValueChange={(v) => {
              setOldVersionId(v);
              setQuickOption('custom');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select version..." />
            </SelectTrigger>
            <SelectContent>
              {sortedVersions.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">v{v.version_number}</span>
                    <Badge variant="outline" className="text-xs">
                      {v.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(v.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ArrowRight className="h-5 w-5 text-muted-foreground mt-6" />

        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">To Version</label>
          <Select
            value={newVersionId}
            onValueChange={(v) => {
              setNewVersionId(v);
              setQuickOption('custom');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select version..." />
            </SelectTrigger>
            <SelectContent>
              {sortedVersions.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">v{v.version_number}</span>
                    <Badge variant="outline" className="text-xs">
                      {v.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(v.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6">
          <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canCompare}>
                <GitBranch className="h-4 w-4 mr-2" />
                Compare
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Version Comparison
                  {oldVersion && newVersion && (
                    <span className="text-muted-foreground font-normal">
                      v{oldVersion.version_number} → v{newVersion.version_number}
                    </span>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden">
                {oldVersion && newVersion && (
                  <ContentDiffViewer
                    oldContent={oldVersion.content || ''}
                    newContent={newVersion.content || ''}
                    oldVersionLabel={`v${oldVersion.version_number} (${oldVersion.status})`}
                    newVersionLabel={`v${newVersion.version_number} (${newVersion.status})`}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Version Metadata Preview */}
      {canCompare && oldVersion && newVersion && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <h4 className="font-medium text-sm mb-2">From: v{oldVersion.version_number}</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Status: {oldVersion.status}</p>
              <p>Created: {format(new Date(oldVersion.created_at), "MMM d, yyyy h:mm a")}</p>
              {oldVersion.change_summary && (
                <p className="line-clamp-2">{oldVersion.change_summary}</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2">To: v{newVersion.version_number}</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Status: {newVersion.status}</p>
              <p>Created: {format(new Date(newVersion.created_at), "MMM d, yyyy h:mm a")}</p>
              {newVersion.change_summary && (
                <p className="line-clamp-2">{newVersion.change_summary}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
