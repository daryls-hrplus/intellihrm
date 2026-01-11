import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Globe, Coins, Languages, Search, Download, Copy, Check, Info } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

// Import data sources
import { countries } from "@/lib/countries";
import { ISO_LANGUAGES } from "@/constants/languageConstants";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SystemReferenceDataTabsProps {
  onGoToFullCatalog?: () => void;
}

export function SystemReferenceDataTabs({ onGoToFullCatalog }: SystemReferenceDataTabsProps) {
  const [activeTab, setActiveTab] = useState("countries");
  const [searchCountries, setSearchCountries] = useState("");
  const [searchCurrencies, setSearchCurrencies] = useState("");
  const [searchLanguages, setSearchLanguages] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch currencies from database
  const { data: currencies = [] } = useQuery({
    queryKey: ["currencies-system-ref"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("id, code, name, symbol, is_active")
        .eq("is_active", true)
        .order("code");
      if (error) throw error;
      return data;
    },
  });

  // Filter functions
  const filteredCountries = useMemo(() => {
    if (!searchCountries.trim()) return countries;
    const search = searchCountries.toLowerCase();
    return countries.filter(
      (c) => c.name.toLowerCase().includes(search) || c.code.toLowerCase().includes(search)
    );
  }, [searchCountries]);

  const filteredCurrencies = useMemo(() => {
    if (!searchCurrencies.trim()) return currencies;
    const search = searchCurrencies.toLowerCase();
    return currencies.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.code.toLowerCase().includes(search) ||
        (c.symbol && c.symbol.toLowerCase().includes(search))
    );
  }, [searchCurrencies, currencies]);

  const filteredLanguages = useMemo(() => {
    if (!searchLanguages.trim()) return ISO_LANGUAGES;
    const search = searchLanguages.toLowerCase();
    return ISO_LANGUAGES.filter(
      (l) => l.name.toLowerCase().includes(search) || l.code.toLowerCase().includes(search)
    );
  }, [searchLanguages]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const downloadCSV = (data: { code: string; name: string }[], filename: string) => {
    const headers = ["code", "name"];
    const rows = data.map((d) => [d.code, d.name]);
    const csvContent = [headers.join(","), ...rows.map((r) => `"${r.join('","')}"`).map(r => r.replace(/""/g, '"'))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded successfully");
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These are read-only system reference values used throughout the application. 
          Use these codes when importing data.{" "}
          <Link to="/hr-hub/reference-data" className="text-primary underline">
            View full Reference Data Catalog
          </Link>
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="countries" className="gap-2">
            <Globe className="h-4 w-4" />
            Countries
            <Badge variant="secondary" className="ml-1 text-xs">{countries.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="currencies" className="gap-2">
            <Coins className="h-4 w-4" />
            Currencies
            <Badge variant="secondary" className="ml-1 text-xs">{currencies.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="languages" className="gap-2">
            <Languages className="h-4 w-4" />
            Languages
            <Badge variant="secondary" className="ml-1 text-xs">{ISO_LANGUAGES.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Countries Tab */}
        <TabsContent value="countries" className="mt-4">
          <div className="space-y-4">
            <div className="flex gap-4 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search countries..."
                  value={searchCountries}
                  onChange={(e) => setSearchCountries(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => downloadCSV(countries, "country_codes.csv")}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
            <div className="border rounded-lg max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-20">Code</TableHead>
                    <TableHead>Country Name</TableHead>
                    <TableHead className="w-16 text-center">Copy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCountries.map((country) => (
                    <TableRow key={country.code}>
                      <TableCell>
                        <code className="px-2 py-0.5 bg-muted rounded text-xs font-mono">{country.code}</code>
                      </TableCell>
                      <TableCell>{country.name}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyCode(country.code)}>
                          {copiedCode === country.code ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">ISO 3166-1 alpha-2 country codes. These codes are used for country fields in imports.</p>
          </div>
        </TabsContent>

        {/* Currencies Tab */}
        <TabsContent value="currencies" className="mt-4">
          <div className="space-y-4">
            <div className="flex gap-4 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search currencies..."
                  value={searchCurrencies}
                  onChange={(e) => setSearchCurrencies(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => downloadCSV(currencies, "currency_codes.csv")}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
            <div className="border rounded-lg max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-20">Code</TableHead>
                    <TableHead>Currency Name</TableHead>
                    <TableHead className="w-20">Symbol</TableHead>
                    <TableHead className="w-16 text-center">Copy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCurrencies.map((currency) => (
                    <TableRow key={currency.id}>
                      <TableCell>
                        <code className="px-2 py-0.5 bg-muted rounded text-xs font-mono">{currency.code}</code>
                      </TableCell>
                      <TableCell>{currency.name}</TableCell>
                      <TableCell>{currency.symbol}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyCode(currency.code)}>
                          {copiedCode === currency.code ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">ISO 4217 currency codes. These codes are used for currency fields in imports.</p>
          </div>
        </TabsContent>

        {/* Languages Tab */}
        <TabsContent value="languages" className="mt-4">
          <div className="space-y-4">
            <div className="flex gap-4 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search languages..."
                  value={searchLanguages}
                  onChange={(e) => setSearchLanguages(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => downloadCSV(ISO_LANGUAGES.map(l => ({ code: l.code, name: l.name })), "language_codes.csv")}
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
            <div className="border rounded-lg max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-20">Code</TableHead>
                    <TableHead>Language Name</TableHead>
                    <TableHead className="w-16 text-center">Copy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLanguages.map((language) => (
                    <TableRow key={language.code}>
                      <TableCell>
                        <code className="px-2 py-0.5 bg-muted rounded text-xs font-mono">{language.code}</code>
                      </TableCell>
                      <TableCell>{language.name}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyCode(language.code)}>
                          {copiedCode === language.code ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">ISO 639-1 language codes including Caribbean and African languages.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
