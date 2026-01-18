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
import { Search, Copy, Check, Download, Building2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyRelationships } from "@/hooks/useCompanyRelationships";
import { Link } from "react-router-dom";

interface CompanyReferenceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyReferenceDrawer({
  open,
  onOpenChange,
}: CompanyReferenceDrawerProps) {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { groupCompanies, relationships } = useCompanyRelationships(profile?.company_id);

  // Filter companies
  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return groupCompanies;
    const lowerSearch = search.toLowerCase();
    return groupCompanies.filter(
      c =>
        c.code?.toLowerCase().includes(lowerSearch) ||
        c.name?.toLowerCase().includes(lowerSearch)
    );
  }, [groupCompanies, search]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const downloadCompaniesCSV = () => {
    const csvHeaders = ["company_code", "company_name", "is_your_company", "relationship_type"];
    const csvRows = groupCompanies.map(c => {
      const rel = relationships.find(r => 
        r.source_company_id === c.id || r.target_company_id === c.id
      );
      return [
        c.code || "",
        `"${(c.name || "").replace(/"/g, '""')}"`,
        c.isCurrentCompany ? "Yes" : "No",
        rel?.relationship_type || "same_group"
      ].join(",");
    });

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "group_companies.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Downloaded ${groupCompanies.length} companies`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Group Companies</SheetTitle>
          <SheetDescription>
            Companies in your corporate group. Use the company code prefix for cross-company position references (e.g., <code className="text-xs bg-muted px-1 rounded">CORP:CFO-001</code>).
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Count & Download */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {filteredCompanies.length} of {groupCompanies.length} companies
            </Badge>
            <Button variant="outline" size="sm" onClick={downloadCompaniesCSV} className="gap-1">
              <Download className="h-3 w-3" />
              CSV
            </Button>
          </div>

          {/* Companies List */}
          <ScrollArea className="h-[calc(100vh-340px)]">
            <div className="space-y-2 pr-4">
              {filteredCompanies.map((company) => {
                const rel = relationships.find(r =>
                  r.source_company_id === company.id || r.target_company_id === company.id
                );
                
                return (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <code className="px-2 py-0.5 bg-muted rounded text-sm font-mono font-medium">
                          {company.code}
                        </code>
                        {company.isCurrentCompany && (
                          <Badge variant="default" className="text-xs">Your Company</Badge>
                        )}
                        {rel && !company.isCurrentCompany && (
                          <Badge variant="outline" className="text-xs">
                            {rel.relationship_type?.replace(/_/g, " ")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {company.name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(company.code || "")}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedCode === company.code ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Link to Relationships */}
          <div className="pt-4 border-t">
            <Link to="/admin/company-relationships">
              <Button variant="outline" className="w-full gap-2">
                Manage Company Relationships
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
