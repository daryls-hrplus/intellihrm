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
import { countries as allCountries } from "@/lib/countries";

interface StatutoryDeductionType {
  id: string;
  statutory_code: string;
  statutory_name: string;
  country: string | null;
  statutory_type: string | null;
  description: string | null;
  is_active: boolean;
}

export function StatutoryDeductionsTab() {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create a map for quick country name lookup
  const countryNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    allCountries.forEach(c => {
      map[c.code] = c.name;
    });
    return map;
  }, []);

  const { data: deductions = [], isLoading } = useQuery({
    queryKey: ["statutory-deduction-types-reference"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("statutory_deduction_types")
        .select("id, statutory_code, statutory_name, country, statutory_type, description, is_active")
        .eq("is_active", true)
        .order("country", { ascending: true })
        .order("statutory_name", { ascending: true });
      if (error) throw error;
      return data as StatutoryDeductionType[];
    },
  });

  // Get unique country codes from deductions and sort by country name
  const countryCodes = useMemo(() => {
    const uniqueCountries = [...new Set(deductions.map((d) => d.country).filter(Boolean))] as string[];
    return uniqueCountries.sort((a, b) => {
      const nameA = countryNameMap[a] || a;
      const nameB = countryNameMap[b] || b;
      return nameA.localeCompare(nameB);
    });
  }, [deductions, countryNameMap]);

  // Helper to get country name from code
  const getCountryName = (code: string | null) => {
    if (!code) return "";
    return countryNameMap[code] || code;
  };

  const filteredDeductions = useMemo(() => {
    let result = deductions;
    
    if (selectedCountry !== "all") {
      result = result.filter((d) => d.country === selectedCountry);
    }
    
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.statutory_name.toLowerCase().includes(lowerSearch) ||
          d.statutory_code.toLowerCase().includes(lowerSearch) ||
          (d.statutory_type?.toLowerCase().includes(lowerSearch)) ||
          (getCountryName(d.country).toLowerCase().includes(lowerSearch))
      );
    }
    
    return result;
  }, [search, selectedCountry, deductions, countryNameMap]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["statutory_code", "statutory_name", "country", "country_name", "statutory_type", "description"];
    const rows = filteredDeductions.map((d) => [
      d.statutory_code, 
      d.statutory_name, 
      d.country || "",
      getCountryName(d.country),
      d.statutory_type || "",
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
    a.download = `statutory_deductions${selectedCountry !== "all" ? `_${selectedCountry}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded statutory deductions CSV");
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
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Select country">
                {selectedCountry === "all" ? "All Countries" : getCountryName(selectedCountry)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countryCodes.map((code) => (
                <SelectItem key={code} value={code}>
                  {getCountryName(code)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deductions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredDeductions.length} records
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
                <TableHead>Deduction Name</TableHead>
                <TableHead className="w-40">Country</TableHead>
                <TableHead className="w-32">Type</TableHead>
                <TableHead className="w-16 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeductions.map((deduction) => (
                <TableRow key={deduction.id}>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {deduction.statutory_code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{deduction.statutory_name}</span>
                      {deduction.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{deduction.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {deduction.country && (
                      <Badge variant="outline" className="font-normal">
                        {getCountryName(deduction.country)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {deduction.statutory_type || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(deduction.statutory_code)}
                      className="h-8 w-8"
                    >
                      {copiedCode === deduction.statutory_code ? (
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
        Country-specific statutory deduction types for payroll compliance.
      </p>
    </div>
  );
}
