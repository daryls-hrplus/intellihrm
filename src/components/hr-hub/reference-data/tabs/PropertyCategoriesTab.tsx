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
import { Search, Download, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PropertyCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  depreciation_years: number | null;
  is_active: boolean;
}

export function PropertyCategoriesTab() {
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["property-categories-reference"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_categories")
        .select("id, code, name, description, depreciation_years, is_active")
        .eq("is_active", true)
        .is("company_id", null)
        .order("name", { ascending: true });
      if (error) throw error;
      return data as PropertyCategory[];
    },
  });

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    
    const lowerSearch = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerSearch) ||
        c.code.toLowerCase().includes(lowerSearch) ||
        (c.description?.toLowerCase().includes(lowerSearch))
    );
  }, [search, categories]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["code", "name", "description", "depreciation_years"];
    const rows = filteredCategories.map((c) => [
      c.code,
      c.name,
      c.description || "",
      c.depreciation_years?.toString() || ""
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "property_categories.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded property categories CSV");
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
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search property categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredCategories.length} records
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
                <TableHead>Category Name</TableHead>
                <TableHead className="w-36 text-center">Depreciation</TableHead>
                <TableHead className="w-16 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {category.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{category.name}</span>
                      {category.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{category.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {category.depreciation_years ? (
                      <Badge variant="outline" className="font-normal">
                        {category.depreciation_years} years
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(category.code)}
                      className="h-8 w-8"
                    >
                      {copiedCode === category.code ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        IT equipment and asset categories for property assignment tracking.
      </p>
    </div>
  );
}
