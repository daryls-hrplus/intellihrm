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

interface TravelDocumentType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export function TravelDocumentsTab() {
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: docTypes = [], isLoading } = useQuery({
    queryKey: ["travel-document-types-reference"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("travel_document_types")
        .select("id, code, name, description, is_active")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data as TravelDocumentType[];
    },
  });

  const filteredDocTypes = useMemo(() => {
    if (!search.trim()) return docTypes;
    
    const lowerSearch = search.toLowerCase();
    return docTypes.filter(
      (d) =>
        d.name.toLowerCase().includes(lowerSearch) ||
        d.code.toLowerCase().includes(lowerSearch) ||
        (d.description?.toLowerCase().includes(lowerSearch))
    );
  }, [search, docTypes]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["code", "name", "description"];
    const rows = filteredDocTypes.map((d) => [
      d.code,
      d.name,
      d.description || ""
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "travel_document_types.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded travel document types CSV");
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
              placeholder="Search travel documents..."
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
                <TableHead className="w-40">Code</TableHead>
                <TableHead>Document Type</TableHead>
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
                        <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                      )}
                    </div>
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
        Travel document types for international travel and immigration tracking.
      </p>
    </div>
  );
}
