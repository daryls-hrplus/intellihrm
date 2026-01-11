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
import { Search, Download, Copy, Check, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string | null;
  region: string | null;
  is_active: boolean;
}

const REGIONS = [
  { value: "all", label: "All Regions", icon: "🌍" },
  { value: "caribbean", label: "Caribbean", icon: "🏝️" },
  { value: "latin_america", label: "Latin America", icon: "🌎" },
  { value: "africa", label: "Africa", icon: "🌍" },
  { value: "europe", label: "Europe", icon: "🇪🇺" },
  { value: "asia_pacific", label: "Asia Pacific", icon: "🌏" },
  { value: "middle_east", label: "Middle East", icon: "🕌" },
  { value: "north_america", label: "North America", icon: "🇺🇸" },
] as const;

const getRegionLabel = (region: string | null): string => {
  if (!region) return "—";
  const found = REGIONS.find((r) => r.value === region);
  return found ? found.label : region;
};

const getRegionIcon = (region: string | null): string => {
  if (!region) return "";
  const found = REGIONS.find((r) => r.value === region);
  return found ? found.icon : "";
};

export function CurrenciesTab() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: currencies = [], isLoading } = useQuery({
    queryKey: ["currencies-reference"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("id, code, name, symbol, region, is_active")
        .eq("is_active", true)
        .order("code", { ascending: true });
      if (error) throw error;
      return data as Currency[];
    },
  });

  const filteredCurrencies = useMemo(() => {
    let result = currencies;

    // Apply region filter
    if (regionFilter !== "all") {
      result = result.filter((c) => c.region === regionFilter);
    }

    // Apply search filter
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(lowerSearch) ||
          c.code.toLowerCase().includes(lowerSearch) ||
          (c.symbol && c.symbol.toLowerCase().includes(lowerSearch))
      );
    }

    return result;
  }, [search, regionFilter, currencies]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["code", "name", "symbol", "region"];
    const rows = filteredCurrencies.map((c) => [
      c.code,
      c.name,
      c.symbol || "",
      getRegionLabel(c.region),
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => `"${r.join('","')}"`).map((r) => r.replace(/""/g, '"')),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "currency_codes.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("hrHub.refData.downloadSuccess"));
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
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("hrHub.refData.searchCurrencies")}
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
              {REGIONS.map((region) => (
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
            {filteredCurrencies.length} {t("hrHub.refData.records")}
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
                <TableHead className="w-24">{t("hrHub.refData.symbol")}</TableHead>
                <TableHead className="w-36">Region</TableHead>
                <TableHead className="w-20 text-center">{t("hrHub.refData.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCurrencies.map((currency) => (
                <TableRow key={currency.id}>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {currency.code}
                    </code>
                  </TableCell>
                  <TableCell>{currency.name}</TableCell>
                  <TableCell>
                    {currency.symbol && (
                      <span className="text-lg">{currency.symbol}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {currency.region && (
                      <Badge variant="outline" className="text-xs font-normal">
                        {getRegionIcon(currency.region)} {getRegionLabel(currency.region)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(currency.code)}
                      className="h-8 w-8"
                    >
                      {copiedCode === currency.code ? (
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
        {t("hrHub.refData.currenciesNote")}
      </p>
    </div>
  );
}
