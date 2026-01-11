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
import { Search, Download, Copy, Check, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface AccreditingBody {
  id: string;
  code: string | null;
  name: string;
  short_name: string | null;
  body_type: string | null;
  country: string | null;
  industry: string | null;
  website: string | null;
  is_active: boolean;
}

export function AccreditingBodiesTab() {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: bodies = [], isLoading } = useQuery({
    queryKey: ["accrediting-bodies-reference"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accrediting_bodies")
        .select("id, code, name, short_name, body_type, country, industry, website, is_active")
        .eq("is_active", true)
        .order("country", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as AccreditingBody[];
    },
  });

  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(bodies.map((b) => b.country).filter(Boolean))];
    return uniqueCountries.sort() as string[];
  }, [bodies]);

  const filteredBodies = useMemo(() => {
    let result = bodies;
    
    if (selectedCountry !== "all") {
      result = result.filter((b) => b.country === selectedCountry);
    }
    
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(lowerSearch) ||
          (b.code?.toLowerCase().includes(lowerSearch)) ||
          (b.short_name?.toLowerCase().includes(lowerSearch)) ||
          (b.industry?.toLowerCase().includes(lowerSearch))
      );
    }
    
    return result;
  }, [search, selectedCountry, bodies]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["code", "name", "short_name", "body_type", "country", "industry", "website"];
    const rows = filteredBodies.map((b) => [
      b.code || "", 
      b.name, 
      b.short_name || "",
      b.body_type || "",
      b.country || "",
      b.industry || "",
      b.website || ""
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accrediting_bodies${selectedCountry !== "all" ? `_${selectedCountry}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded accrediting bodies CSV");
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
              placeholder="Search accrediting bodies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredBodies.length} records
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
                <TableHead>Organization</TableHead>
                <TableHead className="w-28">Country</TableHead>
                <TableHead className="w-32">Industry</TableHead>
                <TableHead className="w-24 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBodies.map((body) => (
                <TableRow key={body.id}>
                  <TableCell>
                    {body.code && (
                      <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                        {body.code}
                      </code>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{body.name}</span>
                      {body.short_name && (
                        <span className="text-muted-foreground ml-2">({body.short_name})</span>
                      )}
                      {body.body_type && (
                        <p className="text-xs text-muted-foreground mt-0.5">{body.body_type}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {body.country && (
                      <Badge variant="outline" className="font-normal">
                        {body.country}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{body.industry || "-"}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {body.code && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyCode(body.code!)}
                          className="h-8 w-8"
                        >
                          {copiedCode === body.code ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {body.website && (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8"
                        >
                          <a href={body.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Professional and educational accrediting organizations for certification verification.
      </p>
    </div>
  );
}
