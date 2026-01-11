import { useState, useMemo } from "react";
import { countries, COUNTRY_REGIONS, getRegionLabel, getRegionIcon } from "@/lib/countries";
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
import { Search, Download, Copy, Check, Globe } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

export function CountriesTab() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredCountries = useMemo(() => {
    let result = countries;

    // Apply region filter
    if (regionFilter !== "all") {
      result = result.filter(c => c.region === regionFilter);
    }

    // Apply search filter
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        c =>
          c.name.toLowerCase().includes(lowerSearch) ||
          c.code.toLowerCase().includes(lowerSearch)
      );
    }

    return result;
  }, [search, regionFilter]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["code", "name", "region"];
    const rows = filteredCountries.map((c) => [c.code, c.name, getRegionLabel(c.region)]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "country_codes.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("hrHub.refData.downloadSuccess"));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("hrHub.refData.searchCountries")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[180px]">
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
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredCountries.length} {t("hrHub.refData.records")}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
            <Download className="h-4 w-4 mr-2" />
            {t("hrHub.refData.downloadCSV")}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-24">{t("hrHub.refData.code")}</TableHead>
                <TableHead>{t("hrHub.refData.name")}</TableHead>
                <TableHead className="w-40">{t("hrHub.refData.region") || "Region"}</TableHead>
                <TableHead className="w-20 text-center">{t("hrHub.refData.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCountries.map((country) => (
                <TableRow key={country.code}>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {country.code}
                    </code>
                  </TableCell>
                  <TableCell>{country.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      <span className="mr-1">{getRegionIcon(country.region)}</span>
                      {getRegionLabel(country.region)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(country.code)}
                      className="h-8 w-8"
                    >
                      {copiedCode === country.code ? (
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
        {t("hrHub.refData.countriesNote")}
      </p>
    </div>
  );
}
