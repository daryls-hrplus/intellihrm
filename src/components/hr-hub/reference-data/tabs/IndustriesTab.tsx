import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, Copy, Check, Loader2, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface Industry {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  parent_industry_id: string | null;
  is_active: boolean;
  display_order: number;
}

export function IndustriesTab() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

  const { data: industries = [], isLoading } = useQuery({
    queryKey: ["industries-reference"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_industries")
        .select("id, code, name, description, icon_name, parent_industry_id, is_active, display_order")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Industry[];
    },
  });

  // Organize industries into parent/child structure
  const { parentIndustries, childrenByParent, filteredIndustries } = useMemo(() => {
    const parents = industries.filter((i) => !i.parent_industry_id);
    const children: Record<string, Industry[]> = {};
    
    industries.forEach((i) => {
      if (i.parent_industry_id) {
        if (!children[i.parent_industry_id]) {
          children[i.parent_industry_id] = [];
        }
        children[i.parent_industry_id].push(i);
      }
    });

    // Apply search filter
    let filtered = industries;
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      filtered = industries.filter(
        (i) =>
          i.name.toLowerCase().includes(lowerSearch) ||
          i.code.toLowerCase().includes(lowerSearch) ||
          (i.description && i.description.toLowerCase().includes(lowerSearch))
      );
    }

    return {
      parentIndustries: parents,
      childrenByParent: children,
      filteredIndustries: filtered,
    };
  }, [industries, search]);

  const toggleParent = (parentId: string) => {
    setExpandedParents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) {
        newSet.delete(parentId);
      } else {
        newSet.add(parentId);
      }
      return newSet;
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["code", "name", "description", "parent_code"];
    const rows = filteredIndustries.map((i) => {
      const parent = industries.find((p) => p.id === i.parent_industry_id);
      return [
        i.code,
        i.name,
        i.description || "",
        parent?.code || "",
      ];
    });
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => `"${r.join('","')}"`),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "industry_codes.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("hrHub.refData.downloadSuccess"));
  };

  const getChildCount = (parentId: string): number => {
    return childrenByParent[parentId]?.length || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If searching, show flat list
  const isSearching = search.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search industries by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {parentIndustries.length} categories
          </Badge>
          <Badge variant="outline" className="text-sm">
            {industries.length} total
          </Badge>
          <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
            <Download className="h-4 w-4 mr-2" />
            {t("hrHub.refData.downloadCSV")}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-32">{t("hrHub.refData.code")}</TableHead>
                <TableHead>{t("hrHub.refData.name")}</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="w-20 text-center">{t("hrHub.refData.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isSearching ? (
                // Flat list when searching
                filteredIndustries.map((industry) => {
                  const parent = industries.find((p) => p.id === industry.parent_industry_id);
                  return (
                    <TableRow key={industry.id}>
                      <TableCell>
                        <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                          {industry.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={cn(!industry.parent_industry_id && "font-medium")}>
                            {industry.name}
                          </span>
                          {parent && (
                            <span className="text-xs text-muted-foreground">
                              in {parent.name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {industry.description || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyCode(industry.code)}
                          className="h-8 w-8"
                        >
                          {copiedCode === industry.code ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                // Hierarchical view when not searching
                parentIndustries.map((parent) => {
                  const isExpanded = expandedParents.has(parent.id);
                  const children = childrenByParent[parent.id] || [];
                  const childCount = getChildCount(parent.id);
                  
                  return (
                    <>
                      <TableRow 
                        key={parent.id} 
                        className={cn(
                          "cursor-pointer hover:bg-muted/50",
                          isExpanded && "bg-muted/30"
                        )}
                        onClick={() => childCount > 0 && toggleParent(parent.id)}
                      >
                        <TableCell>
                          <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                            {parent.code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {childCount > 0 && (
                              isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )
                            )}
                            <span className="font-medium">{parent.name}</span>
                            {childCount > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {childCount} sub
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {parent.description || "—"}
                        </TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyCode(parent.code)}
                            className="h-8 w-8"
                          >
                            {copiedCode === parent.code ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isExpanded && children.map((child) => (
                        <TableRow key={child.id} className="bg-muted/20">
                          <TableCell className="pl-8">
                            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                              {child.code}
                            </code>
                          </TableCell>
                          <TableCell className="pl-10">
                            {child.name}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                            {child.description || "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyCode(child.code)}
                              className="h-8 w-8"
                            >
                              {copiedCode === child.code ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Industry classification codes for organizational categorization. Click parent industries to expand sub-industries.
      </p>
    </div>
  );
}
