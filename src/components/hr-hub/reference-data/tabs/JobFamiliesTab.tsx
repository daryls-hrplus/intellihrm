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
import { Search, Download, Copy, Check, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";

interface MasterJobFamily {
  id: string;
  code: string;
  name: string;
  description: string | null;
  industry_category: string | null;
  is_active: boolean;
}

export function JobFamiliesTab() {
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Query master_job_families for reference data - these are the global standards
  const { data: masterFamilies = [], isLoading } = useQuery({
    queryKey: ["master-job-families-reference"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_job_families")
        .select("id, code, name, description, industry_category, is_active")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data as MasterJobFamily[];
    },
  });

  const filteredFamilies = useMemo(() => {
    if (!search.trim()) return masterFamilies;
    
    const lowerSearch = search.toLowerCase();
    return masterFamilies.filter(
      (j) =>
        j.name.toLowerCase().includes(lowerSearch) ||
        j.code.toLowerCase().includes(lowerSearch) ||
        j.description?.toLowerCase().includes(lowerSearch) ||
        j.industry_category?.toLowerCase().includes(lowerSearch)
    );
  }, [search, masterFamilies]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["code", "name", "industry_category", "description"];
    const rows = filteredFamilies.map((j) => [
      j.code, 
      j.name,
      j.industry_category || "",
      j.description || ""
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "master_job_families.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded master job families CSV");
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
      <div className="flex items-center gap-2 mb-2">
        <Globe className="h-5 w-5 text-primary" />
        <span className="text-sm text-muted-foreground">
          Use these master codes in the <code className="px-1 bg-muted rounded">master_code</code> field when importing job families.
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search master job families..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredFamilies.length} records
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
                <TableHead className="w-28">Code</TableHead>
                <TableHead>Job Family</TableHead>
                <TableHead className="w-36">Industry</TableHead>
                <TableHead className="w-20 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFamilies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No master job families found
                  </TableCell>
                </TableRow>
              ) : (
                filteredFamilies.map((family) => (
                  <TableRow key={family.id}>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                        {family.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{family.name}</span>
                        {family.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{family.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {family.industry_category && (
                        <Badge variant="outline" className="text-xs">
                          {family.industry_category}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyCode(family.code)}
                        className="h-8 w-8"
                      >
                        {copiedCode === family.code ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Master job families provide global, industry-standard definitions. Use these codes to link company job families to global standards.
      </p>
    </div>
  );
}
