// Visual tree component showing manual section structure

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  FolderOpen,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { ManualSection } from "@/hooks/useManualGeneration";

interface ManualStructurePreviewProps {
  sections: ManualSection[];
  selectedSections?: string[];
  onSelectionChange?: (sectionIds: string[]) => void;
  showStatus?: boolean;
  compact?: boolean;
}

interface SectionNode {
  section: ManualSection;
  children: SectionNode[];
}

export function ManualStructurePreview({
  sections,
  selectedSections = [],
  onSelectionChange,
  showStatus = true,
  compact = false,
}: ManualStructurePreviewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(
    sections.filter(s => !s.parent_section_id).map(s => s.id)
  ));

  // Build tree structure from flat sections
  const buildTree = (): SectionNode[] => {
    const nodeMap = new Map<string, SectionNode>();
    const roots: SectionNode[] = [];

    // First pass: create all nodes
    sections.forEach(section => {
      nodeMap.set(section.id, { section, children: [] });
    });

    // Second pass: build relationships
    sections.forEach(section => {
      const node = nodeMap.get(section.id)!;
      if (section.parent_section_id && nodeMap.has(section.parent_section_id)) {
        nodeMap.get(section.parent_section_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort by display_order
    const sortNodes = (nodes: SectionNode[]): SectionNode[] => {
      return nodes
        .sort((a, b) => a.section.display_order - b.section.display_order)
        .map(node => ({
          ...node,
          children: sortNodes(node.children),
        }));
    };

    return sortNodes(roots);
  };

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const toggleSelection = (sectionId: string) => {
    if (!onSelectionChange) return;
    
    const newSelection = selectedSections.includes(sectionId)
      ? selectedSections.filter(id => id !== sectionId)
      : [...selectedSections, sectionId];
    
    onSelectionChange(newSelection);
  };

  const renderNode = (node: SectionNode, depth: number = 0): React.ReactNode => {
    const { section, children } = node;
    const isExpanded = expandedNodes.has(section.id);
    const hasChildren = children.length > 0;
    const isSelected = selectedSections.includes(section.id);
    const hasContent = section.content && Object.keys(section.content).length > 0;

    return (
      <div key={section.id}>
        <div
          className={`flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 ${
            compact ? "py-1" : "py-1.5"
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {/* Expand/Collapse */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(section.id)}
              className="p-0.5 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Selection checkbox */}
          {onSelectionChange && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleSelection(section.id)}
              className="mr-1"
            />
          )}

          {/* Icon */}
          {hasChildren ? (
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}

          {/* Section number */}
          <Badge variant="outline" className="text-xs font-mono">
            {section.section_number}
          </Badge>

          {/* Title */}
          <span className={`flex-1 truncate ${compact ? "text-sm" : ""}`}>
            {section.title}
          </span>

          {/* Status indicators */}
          {showStatus && (
            <div className="flex items-center gap-1">
              {section.needs_regeneration && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Outdated
                </Badge>
              )}
              {hasContent && (
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Generated
                </Badge>
              )}
              {!hasContent && !section.needs_regeneration && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Empty
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree();

  if (sections.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No sections defined</p>
      </div>
    );
  }

  return (
    <ScrollArea className={compact ? "h-[300px]" : "h-[400px]"}>
      <div className="space-y-0.5">
        {tree.map(node => renderNode(node))}
      </div>
    </ScrollArea>
  );
}
