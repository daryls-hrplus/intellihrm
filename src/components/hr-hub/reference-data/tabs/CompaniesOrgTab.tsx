import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserAccessibleCompanies } from "@/hooks/useUserAccessibleCompanies";
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
import { Search, Download, Copy, Check, Loader2, Building2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export function CompaniesOrgTab() {
  const { profile } = useAuth();
  const { companies, isLoading } = useUserAccessibleCompanies();
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return companies;
    const lowerSearch = search.toLowerCase();
    return companies.filter(
      c =>
        c.code?.toLowerCase().includes(lowerSearch) ||
        c.name?.toLowerCase().includes(lowerSearch)
    );
  }, [companies, search]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["company_code", "company_name", "is_your_company"];
    const rows = filteredCompanies.map(c => {
      return [
        c.code || "",
        `"${(c.name || "").replace(/"/g, '""')}"`,
        c.isCurrentCompany ? "Yes" : "No",
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "accessible_companies.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Downloaded ${filteredCompanies.length} companies`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="secondary" className="gap-1">
            <Building2 className="h-3 w-3" />
            {filteredCompanies.length} companies
          </Badge>
          <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-32">Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="w-20 text-center">Copy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No companies found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => {
                  return (
                    <TableRow key={company.id}>
                      <TableCell>
                        <code className="px-2 py-1 bg-muted rounded text-sm font-mono font-medium">
                          {company.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{company.name}</span>
                          {company.isCurrentCompany && (
                            <Badge variant="default" className="text-xs">Your Company</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {company.isCurrentCompany ? (
                          <Badge variant="secondary" className="text-xs">Primary</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Accessible</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyCode(company.code || "")}
                          className="h-8 w-8"
                        >
                          {copiedCode === company.code ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground">
          Companies you have access to based on your permissions. Use the company code prefix for cross-company references.
        </p>
        <Link to="/admin/company-relationships">
          <Button variant="link" size="sm" className="gap-1 text-xs">
            Manage Relationships
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
