// Visual diff viewer for comparing article versions

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  generateSideBySideDiff, 
  calculateDiffStats,
  computeLineDiff,
  type DiffSegment 
} from "@/utils/diffUtils";
import { Copy, Download, Plus, Minus, Equal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentDiffViewerProps {
  oldContent: string;
  newContent: string;
  oldVersionLabel?: string;
  newVersionLabel?: string;
  showStats?: boolean;
}

export function ContentDiffViewer({
  oldContent,
  newContent,
  oldVersionLabel = "Previous Version",
  newVersionLabel = "Current Version",
  showStats = true,
}: ContentDiffViewerProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'inline' | 'unified'>('side-by-side');

  const stats = useMemo(() => calculateDiffStats(oldContent, newContent), [oldContent, newContent]);
  const lineDiffs = useMemo(() => computeLineDiff(oldContent, newContent), [oldContent, newContent]);
  const sideBySide = useMemo(() => generateSideBySideDiff(oldContent, newContent), [oldContent, newContent]);

  const copyDiff = () => {
    const diffText = lineDiffs
      .map(d => {
        if (d.type === 'add') return `+ ${d.content}`;
        if (d.type === 'remove') return `- ${d.content}`;
        return `  ${d.content}`;
      })
      .join('\n');
    navigator.clipboard.writeText(diffText);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Content Comparison</CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList className="h-8">
                <TabsTrigger value="side-by-side" className="text-xs px-2">Side by Side</TabsTrigger>
                <TabsTrigger value="inline" className="text-xs px-2">Inline</TabsTrigger>
                <TabsTrigger value="unified" className="text-xs px-2">Unified</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="ghost" size="sm" onClick={copyDiff}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {showStats && (
          <div className="flex items-center gap-4 text-sm mt-2">
            <span className="flex items-center gap-1 text-green-600">
              <Plus className="h-3 w-3" />
              {stats.additions} additions
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <Minus className="h-3 w-3" />
              {stats.deletions} deletions
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Equal className="h-3 w-3" />
              {stats.unchanged} unchanged
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {viewMode === 'side-by-side' && (
          <SideBySideView 
            left={sideBySide.left} 
            right={sideBySide.right}
            leftLabel={oldVersionLabel}
            rightLabel={newVersionLabel}
          />
        )}
        
        {viewMode === 'inline' && (
          <InlineView diffs={lineDiffs} />
        )}
        
        {viewMode === 'unified' && (
          <UnifiedView diffs={lineDiffs} />
        )}
      </CardContent>
    </Card>
  );
}

// Side-by-side view component
function SideBySideView({ 
  left, 
  right,
  leftLabel,
  rightLabel
}: { 
  left: any[]; 
  right: any[];
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 divide-x">
      <div>
        <div className="px-4 py-2 bg-muted/50 border-b text-sm font-medium">
          {leftLabel}
        </div>
        <ScrollArea className="h-[400px]">
          <div className="font-mono text-xs">
            {left.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "flex px-4 py-0.5 min-h-[24px]",
                  line.type === 'remove' && "bg-red-100 dark:bg-red-900/20",
                  line.type === 'add' && "bg-muted/30"
                )}
              >
                <span className="w-8 text-muted-foreground select-none">
                  {line.oldLineNumber || ''}
                </span>
                <span className={cn(
                  "flex-1",
                  line.type === 'remove' && "text-red-700 dark:text-red-400"
                )}>
                  {line.type === 'remove' && '- '}{line.oldLine}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <div>
        <div className="px-4 py-2 bg-muted/50 border-b text-sm font-medium">
          {rightLabel}
        </div>
        <ScrollArea className="h-[400px]">
          <div className="font-mono text-xs">
            {right.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "flex px-4 py-0.5 min-h-[24px]",
                  line.type === 'add' && "bg-green-100 dark:bg-green-900/20",
                  line.type === 'remove' && "bg-muted/30"
                )}
              >
                <span className="w-8 text-muted-foreground select-none">
                  {line.newLineNumber || ''}
                </span>
                <span className={cn(
                  "flex-1",
                  line.type === 'add' && "text-green-700 dark:text-green-400"
                )}>
                  {line.type === 'add' && '+ '}{line.newLine}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// Inline view component
function InlineView({ diffs }: { diffs: DiffSegment[] }) {
  return (
    <ScrollArea className="h-[400px]">
      <div className="font-mono text-xs p-4">
        {diffs.map((diff, i) => (
          <div
            key={i}
            className={cn(
              "flex py-0.5 px-2 -mx-2 rounded",
              diff.type === 'add' && "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
              diff.type === 'remove' && "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
            )}
          >
            <span className="w-8 text-muted-foreground select-none">
              {diff.lineNumber?.old || diff.lineNumber?.new || ''}
            </span>
            <span className="w-4 select-none">
              {diff.type === 'add' && '+'}
              {diff.type === 'remove' && '-'}
              {diff.type === 'unchanged' && ' '}
            </span>
            <span className="flex-1">{diff.content}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// Unified view component
function UnifiedView({ diffs }: { diffs: DiffSegment[] }) {
  // Group consecutive changes together
  const groups: DiffSegment[][] = [];
  let currentGroup: DiffSegment[] = [];
  let lastType: DiffSegment['type'] | null = null;

  for (const diff of diffs) {
    if (diff.type === 'unchanged') {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }
      groups.push([diff]);
    } else {
      currentGroup.push(diff);
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="font-mono text-xs p-4 space-y-1">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.length === 1 && group[0].type === 'unchanged' ? (
              <div className="py-0.5 text-muted-foreground">
                {group[0].content}
              </div>
            ) : (
              <div className="border-l-2 border-amber-500 pl-2 my-2">
                {group.map((diff, i) => (
                  <div
                    key={i}
                    className={cn(
                      "py-0.5",
                      diff.type === 'add' && "text-green-700 dark:text-green-400",
                      diff.type === 'remove' && "text-red-700 dark:text-red-400 line-through"
                    )}
                  >
                    {diff.type === 'add' && '+ '}
                    {diff.type === 'remove' && '- '}
                    {diff.content}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
