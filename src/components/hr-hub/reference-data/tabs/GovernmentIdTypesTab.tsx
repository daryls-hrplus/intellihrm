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

interface GovernmentIdType {
  id: string;
  code: string;
  name: string;
  country_code: string | null;
  description: string | null;
  is_active: boolean;
}

export function GovernmentIdTypesTab() {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: idTypes = [], isLoading } = useQuery({
    queryKey: ["government-id-types-reference"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("government_id_types")
        .select("id, code, name, country_code, description, is_active")
        .eq("is_active", true)
        .order("country_code", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as GovernmentIdType[];
    },
  });

  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(idTypes.map((i) => i.country_code).filter(Boolean))];
    return uniqueCountries.sort() as string[];
  }, [idTypes]);

  const filteredIdTypes = useMemo(() => {
    let result = idTypes;
    
    if (selectedCountry !== "all") {
      result = result.filter((i) => i.country_code === selectedCountry);
    }
    
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(lowerSearch) ||
          i.code.toLowerCase().includes(lowerSearch) ||
          (i.country_code?.toLowerCase().includes(lowerSearch))
      );
    }
    
    return result;
  }, [search, selectedCountry, idTypes]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["code", "name", "country_code", "description"];
    const rows = filteredIdTypes.map((i) => [
      i.code, 
      i.name, 
      i.country_code || "",
      i.description || ""
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `government_id_types${selectedCountry !== "all" ? `_${selectedCountry}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded government ID types CSV");
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
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ID types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredIdTypes.length} records
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
                <TableHead>ID Type Name</TableHead>
                <TableHead className="w-28">Country</TableHead>
                <TableHead className="w-20 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIdTypes.map((idType) => (
                <TableRow key={idType.id}>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {idType.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{idType.name}</span>
                      {idType.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{idType.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {idType.country_code && (
                      <Badge variant="outline" className="font-normal">
                        {idType.country_code}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(idType.code)}
                      className="h-8 w-8"
                    >
                      {copiedCode === idType.code ? (
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
        Country-specific government identification document types for employee identity verification.
      </p>
    </div>
  );
}
