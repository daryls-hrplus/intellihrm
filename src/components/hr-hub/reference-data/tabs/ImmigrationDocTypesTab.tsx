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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImmigrationDocType {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string | null;
  requires_expiry: boolean;
  requires_fee: boolean;
  is_active: boolean;
}

export function ImmigrationDocTypesTab() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: docTypes = [], isLoading } = useQuery({
    queryKey: ["immigration-doc-types-reference"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("immigration_document_types")
        .select("id, code, name, category, description, requires_expiry, requires_fee, is_active")
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as ImmigrationDocType[];
    },
  });

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(docTypes.map((d) => d.category).filter(Boolean))];
    return uniqueCategories.sort() as string[];
  }, [docTypes]);

  const filteredDocTypes = useMemo(() => {
    let result = docTypes;

    if (selectedCategory !== "all") {
      result = result.filter((d) => d.category === selectedCategory);
    }
    
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(lowerSearch) ||
          d.code.toLowerCase().includes(lowerSearch) ||
          (d.category?.toLowerCase().includes(lowerSearch)) ||
          (d.description?.toLowerCase().includes(lowerSearch))
      );
    }
    
    return result;
  }, [search, selectedCategory, docTypes]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["code", "name", "category", "description", "requires_expiry", "requires_fee"];
    const rows = filteredDocTypes.map((d) => [
      d.code,
      d.name,
      d.category,
      d.description || "",
      d.requires_expiry ? "Yes" : "No",
      d.requires_fee ? "Yes" : "No"
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "immigration_document_types.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded immigration document types CSV");
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
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search immigration documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredDocTypes.length} records
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
                <TableHead>Document Type</TableHead>
                <TableHead className="w-32">Category</TableHead>
                <TableHead className="w-24 text-center">Expiry</TableHead>
                <TableHead className="w-16 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocTypes.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {doc.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{doc.name}</span>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{doc.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal capitalize">
                      {doc.category.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {doc.requires_expiry ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Required
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(doc.code)}
                      className="h-8 w-8"
                    >
                      {copiedCode === doc.code ? (
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
        Immigration and work permit document types for global mobility compliance.
      </p>
    </div>
  );
}
