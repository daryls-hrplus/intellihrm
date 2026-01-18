import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Copy, 
  Check, 
  Download, 
  Building2,
  ChevronDown 
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyRelationships } from "@/hooks/useCompanyRelationships";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface PositionReferenceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PositionItem {
  code: string;
  title: string;
  companyCode: string;
  companyName: string;
  supervisorCode: string | null;
  supervisorTitle: string | null;
  fullCode: string; // Format ready for import (e.g., "COMPANY:CODE" or just "CODE")
  isOwnCompany: boolean;
}

export function PositionReferenceDrawer({
  open,
  onOpenChange,
}: PositionReferenceDrawerProps) {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [isGroupOpen, setIsGroupOpen] = useState(true);

  const { groupCompanies } = useCompanyRelationships(profile?.company_id);

  // Fetch all positions from group companies
  const { data: positions = [], isLoading } = useQuery({
    queryKey: ["positions-reference-drawer", profile?.company_id, groupCompanies.map(c => c.id)],
    queryFn: async () => {
      if (!profile?.company_id) return [];
      
      const validCompanyIds = groupCompanies.length > 0 
        ? groupCompanies.map(c => c.id) 
        : [profile.company_id];

      const { data, error } = await supabase
        .from("positions")
        .select(`
          id, 
          code, 
          title, 
          company_id,
          reports_to_position_id,
          company:companies(id, code, name),
          supervisor:positions!reports_to_position_id(code, title)
        `)
        .in("company_id", validCompanyIds)
        .eq("is_active", true)
        .order("code");

      if (error) throw error;

      return data?.map(p => {
        const company = p.company as any;
        const supervisor = p.supervisor as any;
        const isOwnCompany = p.company_id === profile.company_id;
        
        return {
          code: p.code || "",
          title: p.title || "",
          companyCode: company?.code || "",
          companyName: company?.name || "",
          supervisorCode: supervisor?.code || null,
          supervisorTitle: supervisor?.title || null,
          fullCode: isOwnCompany ? p.code : `${company?.code}:${p.code}`,
          isOwnCompany,
        };
      }) || [];
    },
    enabled: open && !!profile?.company_id,
  });

  // Build items grouped by company
  const groupedPositions = useMemo(() => {
    const filtered = positions.filter(p => {
      if (companyFilter && p.companyCode !== companyFilter) return false;
      if (!search.trim()) return true;
      const lowerSearch = search.toLowerCase();
      return (
        p.code.toLowerCase().includes(lowerSearch) ||
        p.title.toLowerCase().includes(lowerSearch) ||
        p.fullCode.toLowerCase().includes(lowerSearch)
      );
    });

    const groups: Record<string, PositionItem[]> = {};
    filtered.forEach(p => {
      const key = p.companyCode;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });

    return groups;
  }, [positions, search, companyFilter]);

  const totalFiltered = Object.values(groupedPositions).flat().length;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const downloadPositionsCSV = () => {
    const csvHeaders = ["position_code", "title", "company_code", "company_name", "current_supervisor_code"];
    const csvRows = positions.map(p => [
      p.fullCode,
      `"${p.title.replace(/"/g, '""')}"`,
      p.companyCode,
      `"${p.companyName.replace(/"/g, '""')}"`,
      p.supervisorCode || ""
    ].join(","));

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "valid_positions.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Downloaded ${positions.length} positions`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[450px] sm:w-[600px]">
        <SheetHeader>
          <SheetTitle>Position Codes</SheetTitle>
          <SheetDescription>
            Use these position codes in your import file. For cross-company references, use the full format shown.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Company Filter & Download */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={companyFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setCompanyFilter(null)}
              >
                All Companies
              </Button>
              {groupCompanies.slice(0, 5).map(c => (
                <Button
                  key={c.id}
                  variant={companyFilter === c.code ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCompanyFilter(companyFilter === c.code ? null : c.code || null)}
                >
                  {c.code}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={downloadPositionsCSV} className="gap-1">
              <Download className="h-3 w-3" />
              CSV
            </Button>
          </div>

          {/* Count */}
          <div className="flex items-center justify-between text-sm">
            <Badge variant="secondary">
              {totalFiltered} of {positions.length} positions
            </Badge>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}

          {/* Positions List Grouped by Company */}
          {!isLoading && (
            <ScrollArea className="h-[calc(100vh-340px)]">
              <div className="space-y-4 pr-4">
                {Object.entries(groupedPositions).map(([companyCode, items]) => (
                  <Collapsible 
                    key={companyCode}
                    open={isGroupOpen}
                    onOpenChange={setIsGroupOpen}
                    className="border rounded-lg"
                  >
                    <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{companyCode}</span>
                        <Badge variant="secondary" className="text-xs">
                          {items.length}
                        </Badge>
                        {groupCompanies.find(c => c.code === companyCode)?.isCurrentCompany && (
                          <Badge variant="default" className="text-xs">Your Company</Badge>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t divide-y">
                        {items.map((item) => (
                          <div
                            key={item.fullCode}
                            className="flex items-center justify-between p-2 hover:bg-muted/30 group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <code className="px-2 py-0.5 bg-muted rounded text-sm font-mono font-medium">
                                  {item.fullCode}
                                </code>
                              </div>
                              <p className="text-sm text-muted-foreground truncate mt-0.5">
                                {item.title}
                              </p>
                              {item.supervisorCode && (
                                <p className="text-xs text-muted-foreground/70">
                                  Reports to: {item.supervisorCode}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyCode(item.fullCode)}
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {copiedCode === item.fullCode ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
