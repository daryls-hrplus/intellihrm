// Section Selector component for manual publishing
// Tree view with multi-select capability

import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronRight, 
  ChevronDown, 
  Search, 
  FileText,
  FolderOpen,
  Folder
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ManualSection } from "@/types/kb.types";

export type { ManualSection };

interface SectionSelectorProps {
  sections: ManualSection[];
  selectedSections: string[];
  onSelectionChange: (selected: string[]) => void;
  showStatusBadges?: boolean;
}

export function SectionSelector({
  sections,
  selectedSections,
  onSelectionChange,
  showStatusBadges = true,
}: SectionSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Build tree structure from flat sections
  const sectionTree = useMemo(() => {
    const map = new Map<string, ManualSection>();
    const roots: ManualSection[] = [];

    // First pass: create map
    sections.forEach(section => {
      map.set(section.id, { ...section, children: [] });
    });

    // Second pass: build tree
    sections.forEach(section => {
      const node = map.get(section.id)!;
      if (section.parentId && map.has(section.parentId)) {
        map.get(section.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort by order
    const sortChildren = (nodes: ManualSection[]): ManualSection[] => {
      return nodes
        .sort((a, b) => a.order - b.order)
        .map(node => ({
          ...node,
          children: sortChildren(node.children || []),
        }));
    };

    return sortChildren(roots);
  }, [sections]);

  // Filter sections by search
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return sectionTree;

    const query = searchQuery.toLowerCase();

    const filterNode = (node: ManualSection): ManualSection | null => {
      const matchesQuery = node.title.toLowerCase().includes(query);
      const filteredChildren = (node.children || [])
        .map(filterNode)
        .filter(Boolean) as ManualSection[];

      if (matchesQuery || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    };

    return sectionTree.map(filterNode).filter(Boolean) as ManualSection[];
  }, [sectionTree, searchQuery]);

  // Get all descendant IDs
  const getAllDescendantIds = (section: ManualSection): string[] => {
    const ids: string[] = [section.id];
    (section.children || []).forEach(child => {
      ids.push(...getAllDescendantIds(child));
    });
    return ids;
  };

  // Get all section IDs
  const allSectionIds = useMemo(() => {
    return sections.map(s => s.id);
  }, [sections]);

  // Check if all sections are selected
  const allSelected = allSectionIds.length > 0 && 
    allSectionIds.every(id => selectedSections.includes(id));

  // Toggle section selection
  const toggleSection = (section: ManualSection, checked: boolean) => {
    const descendantIds = getAllDescendantIds(section);
    
    if (checked) {
      const newSelection = [...new Set([...selectedSections, ...descendantIds])];
      onSelectionChange(newSelection);
    } else {
      const newSelection = selectedSections.filter(id => !descendantIds.includes(id));
      onSelectionChange(newSelection);
    }
  };

  // Toggle all sections
  const toggleAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(allSectionIds);
    } else {
      onSelectionChange([]);
    }
  };

  // Toggle section expansion
  const toggleExpanded = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Expand all
  const expandAll = () => {
    const allIds = sections.filter(s => s.children && s.children.length > 0).map(s => s.id);
    setExpandedSections(new Set(allIds));
  };

  // Get status badge
  const getStatusBadge = (status?: ManualSection['status']) => {
    if (!showStatusBadges || !status) return null;

    const variants: Record<string, { label: string; className: string }> = {
      new: { label: 'New', className: 'bg-green-500/10 text-green-600' },
      changed: { label: 'Changed', className: 'bg-amber-500/10 text-amber-600' },
      unchanged: { label: 'Unchanged', className: 'bg-muted text-muted-foreground' },
      published: { label: 'Published', className: 'bg-blue-500/10 text-blue-600' },
    };

    const variant = variants[status];
    if (!variant) return null;

    return (
      <Badge variant="outline" className={cn("ml-2 text-xs", variant.className)}>
        {variant.label}
      </Badge>
    );
  };

  // Render section node
  const renderSection = (section: ManualSection, depth: number = 0) => {
    const hasChildren = section.children && section.children.length > 0;
    const isExpanded = expandedSections.has(section.id);
    const isSelected = selectedSections.includes(section.id);

    // Check if all children are selected
    const allChildrenSelected = hasChildren && 
      getAllDescendantIds(section).every(id => selectedSections.includes(id));

    // Check if some children are selected (indeterminate state)
    const someChildrenSelected = hasChildren && 
      getAllDescendantIds(section).some(id => selectedSections.includes(id)) &&
      !allChildrenSelected;

    return (
      <div key={section.id}>
        <div
          className={cn(
            "flex items-center gap-2 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors",
            depth > 0 && "ml-6"
          )}
        >
          {/* Expand/Collapse button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpanded(section.id)}
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

          {/* Checkbox */}
          <Checkbox
            checked={hasChildren ? allChildrenSelected : isSelected}
            onCheckedChange={(checked) => toggleSection(section, checked as boolean)}
            className={someChildrenSelected ? "data-[state=checked]:bg-primary/50" : ""}
          />

          {/* Icon */}
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}

          {/* Title */}
          <span className="flex-1 text-sm truncate">{section.title}</span>

          {/* Status badge */}
          {getStatusBadge(section.status)}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="border-l border-muted ml-4">
            {section.children!.map(child => renderSection(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => toggleAll(checked as boolean)}
            id="select-all"
          />
          <label htmlFor="select-all" className="text-sm cursor-pointer">
            Select All
          </label>
        </div>
      </div>

      {/* Selection count */}
      <div className="text-sm text-muted-foreground">
        {selectedSections.length} of {sections.length} sections selected
      </div>

      {/* Section tree */}
      <ScrollArea className="h-[400px] border rounded-lg p-2">
        {filteredTree.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            {searchQuery ? "No sections match your search" : "No sections available"}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTree.map(section => renderSection(section))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
