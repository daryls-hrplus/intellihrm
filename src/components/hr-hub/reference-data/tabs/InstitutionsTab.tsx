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
import { Search, Download, Copy, Check, Loader2, ExternalLink, Globe } from "lucide-react";
import { toast } from "sonner";
import { countries as allCountries, COUNTRY_REGIONS } from "@/lib/countries";

interface Institution {
  id: string;
  code: string;
  name: string;
  short_name: string | null;
  institution_type: string | null;
  country: string | null;
  city: string | null;
  website: string | null;
  is_accredited: boolean;
  is_active: boolean;
}

export function InstitutionsTab() {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const countryNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    allCountries.forEach(c => {
      map[c.code] = c.name;
    });
    return map;
  }, []);

  const countryRegionMap = useMemo(() => {
    const map: Record<string, string> = {};
    allCountries.forEach(c => {
      map[c.code] = c.region;
    });
    return map;
  }, []);

  const { data: institutions = [], isLoading } = useQuery({
    queryKey: ["institutions-reference"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institutions")
        .select("id, code, name, short_name, institution_type, country, city, website, is_accredited, is_active")
        .eq("is_active", true)
        .order("country", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Institution[];
    },
  });

  const countryCodes = useMemo(() => {
    const uniqueCountries = [...new Set(institutions.map((i) => i.country).filter(Boolean))] as string[];
    let filtered = uniqueCountries;
    if (selectedRegion !== "all") {
      filtered = filtered.filter(code => countryRegionMap[code] === selectedRegion);
    }
    return filtered.sort((a, b) => {
      const nameA = countryNameMap[a] || a;
      const nameB = countryNameMap[b] || b;
      return nameA.localeCompare(nameB);
    });
  }, [institutions, countryNameMap, countryRegionMap, selectedRegion]);

  const institutionTypes = useMemo(() => {
    const types = [...new Set(institutions.map((i) => i.institution_type).filter(Boolean))];
    return types.sort() as string[];
  }, [institutions]);

  const getCountryName = (code: string | null) => {
    if (!code) return "";
    return countryNameMap[code] || code;
  };

  const filteredInstitutions = useMemo(() => {
    let result = institutions;

    if (selectedRegion !== "all") {
      result = result.filter((i) => 
        i.country && countryRegionMap[i.country] === selectedRegion
      );
    }

    if (selectedCountry !== "all") {
      result = result.filter((i) => i.country === selectedCountry);
    }

    if (selectedType !== "all") {
      result = result.filter((i) => i.institution_type === selectedType);
    }
    
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(lowerSearch) ||
          i.code.toLowerCase().includes(lowerSearch) ||
          (i.short_name?.toLowerCase().includes(lowerSearch)) ||
          (i.city?.toLowerCase().includes(lowerSearch)) ||
          (getCountryName(i.country).toLowerCase().includes(lowerSearch))
      );
    }
    
    return result;
  }, [search, selectedCountry, selectedRegion, selectedType, institutions, countryNameMap, countryRegionMap]);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedCountry("all");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["code", "name", "short_name", "institution_type", "country", "country_name", "city", "is_accredited", "website"];
    const rows = filteredInstitutions.map((i) => [
      i.code, 
      i.name, 
      i.short_name || "",
      i.institution_type || "",
      i.country || "",
      getCountryName(i.country),
      i.city || "",
      i.is_accredited ? "Yes" : "No",
      i.website || ""
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `institutions${selectedCountry !== "all" ? `_${selectedCountry}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded institutions CSV");
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
          <Select value={selectedRegion} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_REGIONS.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  <span className="flex items-center gap-2">
                    <span>{region.icon}</span>
                    <span>{region.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full sm:w-[200px]">
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

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {institutionTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search institutions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredInstitutions.length} records
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
                <TableHead>Institution</TableHead>
                <TableHead className="w-32">Type</TableHead>
                <TableHead className="w-40">Location</TableHead>
                <TableHead className="w-24 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstitutions.map((institution) => (
                <TableRow key={institution.id}>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {institution.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{institution.name}</span>
                      {institution.short_name && (
                        <span className="text-muted-foreground ml-2">({institution.short_name})</span>
                      )}
                      {institution.is_accredited && (
                        <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">
                          Accredited
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal capitalize">
                      {institution.institution_type?.replace(/_/g, ' ') || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {institution.city && <span>{institution.city}, </span>}
                      <span className="text-muted-foreground">{getCountryName(institution.country)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyCode(institution.code)}
                        className="h-8 w-8"
                      >
                        {copiedCode === institution.code ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      {institution.website && (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8"
                        >
                          <a href={institution.website} target="_blank" rel="noopener noreferrer">
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
        Educational institutions for qualification and certification verification.
      </p>
    </div>
  );
}
