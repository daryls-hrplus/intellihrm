import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Search, 
  Globe, 
  Shield, 
  Calculator, 
  Receipt, 
  Download,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePageAudit } from "@/hooks/usePageAudit";

// Country name mapping
const COUNTRY_NAMES: Record<string, string> = {
  AG: "Antigua and Barbuda", AI: "Anguilla", AO: "Angola", AR: "Argentina", AU: "Australia",
  AW: "Aruba", BB: "Barbados", BM: "Bermuda", BO: "Bolivia", BQ: "Bonaire",
  BR: "Brazil", BS: "Bahamas", BW: "Botswana", BZ: "Belize", CD: "DR Congo",
  CI: "Côte d'Ivoire", CL: "Chile", CM: "Cameroon", CO: "Colombia", CR: "Costa Rica",
  CU: "Cuba", CW: "Curaçao", DM: "Dominica", DO: "Dominican Republic", DZ: "Algeria",
  EC: "Ecuador", EG: "Egypt", ET: "Ethiopia", GB: "United Kingdom", GD: "Grenada",
  GF: "French Guiana", GH: "Ghana", GT: "Guatemala", GY: "Guyana", HN: "Honduras",
  HT: "Haiti", JM: "Jamaica", KE: "Kenya", KN: "St. Kitts and Nevis", KY: "Cayman Islands",
  LC: "Saint Lucia", LY: "Libya", MA: "Morocco", MS: "Montserrat", MU: "Mauritius",
  MX: "Mexico", MZ: "Mozambique", NA: "Namibia", NG: "Nigeria", NI: "Nicaragua",
  NZ: "New Zealand", PA: "Panama", PE: "Peru", PR: "Puerto Rico", PY: "Paraguay",
  RW: "Rwanda", SD: "Sudan", SN: "Senegal", SR: "Suriname", SV: "El Salvador",
  SX: "Sint Maarten", TC: "Turks and Caicos", TN: "Tunisia", TT: "Trinidad and Tobago",
  TZ: "Tanzania", UG: "Uganda", UY: "Uruguay", VC: "St. Vincent", VE: "Venezuela",
  VG: "British Virgin Islands", VI: "US Virgin Islands", ZA: "South Africa", ZM: "Zambia", ZW: "Zimbabwe"
};

// Region mapping
const COUNTRY_REGIONS: Record<string, string> = {
  // Caribbean
  AG: "Caribbean", AI: "Caribbean", AW: "Caribbean", BB: "Caribbean", BM: "Caribbean",
  BQ: "Caribbean", BS: "Caribbean", CU: "Caribbean", CW: "Caribbean", DM: "Caribbean",
  DO: "Caribbean", GD: "Caribbean", GY: "Caribbean", HT: "Caribbean", JM: "Caribbean",
  KN: "Caribbean", KY: "Caribbean", LC: "Caribbean", MS: "Caribbean", PR: "Caribbean",
  SR: "Caribbean", SX: "Caribbean", TC: "Caribbean", TT: "Caribbean", VC: "Caribbean",
  VG: "Caribbean", VI: "Caribbean",
  // Central America
  BZ: "Central America", CR: "Central America", GT: "Central America", HN: "Central America",
  NI: "Central America", PA: "Central America", SV: "Central America",
  // South America
  AR: "South America", BO: "South America", BR: "South America", CL: "South America",
  CO: "South America", EC: "South America", GF: "South America", PE: "South America",
  PY: "South America", UY: "South America", VE: "South America",
  // Africa
  AO: "Africa", BW: "Africa", CD: "Africa", CI: "Africa", CM: "Africa", DZ: "Africa",
  EG: "Africa", ET: "Africa", GH: "Africa", KE: "Africa", LY: "Africa", MA: "Africa",
  MU: "Africa", MZ: "Africa", NA: "Africa", NG: "Africa", RW: "Africa", SD: "Africa",
  SN: "Africa", TN: "Africa", TZ: "Africa", UG: "Africa", ZA: "Africa", ZM: "Africa", ZW: "Africa",
  // Other
  AU: "Asia Pacific", GB: "Europe", MX: "North America", NZ: "Asia Pacific"
};

export default function PayrollCountryDocumentationPage() {
  usePageAudit('payroll_country_documentation', 'Payroll');
  
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  // Fetch statutory deduction types
  const { data: statutoryTypes } = useQuery({
    queryKey: ["statutory-types-doc"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("statutory_deduction_types")
        .select("*")
        .eq("is_active", true)
        .order("country")
        .order("statutory_code");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch tax settings
  const { data: taxSettings } = useQuery({
    queryKey: ["tax-settings-doc"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("country_tax_settings")
        .select("*")
        .eq("is_active", true)
        .order("country");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch statutory tax relief rules
  const { data: taxReliefRules } = useQuery({
    queryKey: ["tax-relief-rules-doc"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("statutory_tax_relief_rules")
        .select("*")
        .eq("is_active", true)
        .order("country")
        .order("statutory_type_code");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch tax relief schemes
  const { data: taxReliefSchemes } = useQuery({
    queryKey: ["tax-relief-schemes-doc"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_relief_schemes")
        .select("*")
        .eq("is_active", true)
        .order("country")
        .order("scheme_code");
      if (error) throw error;
      return data || [];
    },
  });

  // Group data by country
  const countriesData = useMemo(() => {
    const countries = new Set<string>();
    statutoryTypes?.forEach(s => countries.add(s.country));
    taxSettings?.forEach(t => countries.add(t.country));
    taxReliefRules?.forEach(r => countries.add(r.country));
    taxReliefSchemes?.forEach(s => countries.add(s.country));

    const result = Array.from(countries).map(countryCode => {
      const countryStatutory = statutoryTypes?.filter(s => s.country === countryCode) || [];
      const countryTaxSettings = taxSettings?.find(t => t.country === countryCode);
      const countryTaxReliefRules = taxReliefRules?.filter(r => r.country === countryCode) || [];
      const countryTaxSchemes = taxReliefSchemes?.filter(s => s.country === countryCode) || [];

      const hasStatutory = countryStatutory.length > 0;
      const hasTaxSettings = !!countryTaxSettings;
      const hasTaxRelief = countryTaxReliefRules.length > 0 || countryTaxSchemes.length > 0;
      
      // Configuration status
      let status: 'complete' | 'partial' | 'basic' = 'basic';
      if (hasStatutory && hasTaxSettings && hasTaxRelief) {
        status = 'complete';
      } else if (hasStatutory && (hasTaxSettings || hasTaxRelief)) {
        status = 'partial';
      }

      return {
        code: countryCode,
        name: COUNTRY_NAMES[countryCode] || countryCode,
        region: COUNTRY_REGIONS[countryCode] || "Other",
        status,
        hasStatutory,
        hasTaxSettings,
        hasTaxRelief,
        statutory: countryStatutory,
        taxSettings: countryTaxSettings,
        taxReliefRules: countryTaxReliefRules,
        taxSchemes: countryTaxSchemes,
      };
    });

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [statutoryTypes, taxSettings, taxReliefRules, taxReliefSchemes]);

  // Filter countries
  const filteredCountries = useMemo(() => {
    return countriesData.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = selectedRegion === "all" || c.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [countriesData, searchTerm, selectedRegion]);

  // Get unique regions
  const regions = useMemo(() => {
    const uniqueRegions = new Set(countriesData.map(c => c.region));
    return Array.from(uniqueRegions).sort();
  }, [countriesData]);

  // Stats
  const stats = useMemo(() => {
    const total = countriesData.length;
    const complete = countriesData.filter(c => c.status === 'complete').length;
    const partial = countriesData.filter(c => c.status === 'partial').length;
    const basic = countriesData.filter(c => c.status === 'basic').length;
    const caribbean = countriesData.filter(c => c.region === 'Caribbean').length;
    const africa = countriesData.filter(c => c.region === 'Africa').length;
    return { total, complete, partial, basic, caribbean, africa };
  }, [countriesData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-500/10 text-green-600 border-green-200">Complete</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Partial</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-200">Basic</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/payroll")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Payroll Country Documentation</h1>
          <p className="text-muted-foreground">
            Complete reference of statutory deductions, tax settings, and reliefs by country
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Countries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.complete}</p>
            <p className="text-sm text-muted-foreground">Complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.partial}</p>
            <p className="text-sm text-muted-foreground">Partial</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-gray-600">{stats.basic}</p>
            <p className="text-sm text-muted-foreground">Basic</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.caribbean}</p>
            <p className="text-sm text-muted-foreground">Caribbean</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-orange-600">{stats.africa}</p>
            <p className="text-sm text-muted-foreground">Africa</p>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-6 items-center text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span><strong>Complete:</strong> Statutory types, tax settings, and tax reliefs configured</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span><strong>Partial:</strong> Statutory types and either tax settings or reliefs configured</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-gray-600" />
              <span><strong>Basic:</strong> Only statutory types configured</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Region:</span>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Regions</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Countries List */}
      <div className="space-y-4">
        {filteredCountries.map((country) => (
          <Card key={country.code}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {country.name}
                      <span className="text-sm font-normal text-muted-foreground">({country.code})</span>
                    </CardTitle>
                    <CardDescription>{country.region}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(country.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="statutory" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="statutory" className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Statutory ({country.statutory.length})
                  </TabsTrigger>
                  <TabsTrigger value="tax" className="flex items-center gap-1">
                    <Calculator className="h-4 w-4" />
                    Tax Settings
                  </TabsTrigger>
                  <TabsTrigger value="relief-rules" className="flex items-center gap-1">
                    <Receipt className="h-4 w-4" />
                    Relief Rules ({country.taxReliefRules.length})
                  </TabsTrigger>
                  <TabsTrigger value="schemes" className="flex items-center gap-1">
                    <Receipt className="h-4 w-4" />
                    Schemes ({country.taxSchemes.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="statutory" className="mt-4">
                  {country.statutory.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No statutory deduction types configured
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {country.statutory.map((s: any) => (
                          <TableRow key={s.id}>
                            <TableCell className="font-mono font-medium">{s.statutory_code}</TableCell>
                            <TableCell>{s.statutory_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{s.statutory_type}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {s.description || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="tax" className="mt-4">
                  {!country.taxSettings ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No tax settings configured
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground">Calculation Method</p>
                        <p className="font-medium capitalize">{country.taxSettings.tax_calculation_method}</p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground">Mid-Year Refunds</p>
                        <p className="font-medium">
                          {country.taxSettings.allow_mid_year_refunds ? "Allowed" : "Not Allowed"}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground">Refund Method</p>
                        <p className="font-medium capitalize">{country.taxSettings.refund_method || "N/A"}</p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground">Description</p>
                        <p className="font-medium text-sm">{country.taxSettings.description || "N/A"}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="relief-rules" className="mt-4">
                  {country.taxReliefRules.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No statutory tax relief rules configured
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Statutory Code</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="text-right">Relief %</TableHead>
                          <TableHead className="text-right">Annual Cap</TableHead>
                          <TableHead className="text-right">Monthly Cap</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {country.taxReliefRules.map((r: any) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-mono font-medium">{r.statutory_type_code}</TableCell>
                            <TableCell>{r.statutory_type_name}</TableCell>
                            <TableCell className="text-right">{r.relief_percentage}%</TableCell>
                            <TableCell className="text-right font-mono">
                              {r.annual_cap ? `$${r.annual_cap.toLocaleString()}` : "-"}</TableCell>
                            <TableCell className="text-right font-mono">
                              {r.monthly_cap ? `$${r.monthly_cap.toLocaleString()}` : "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="schemes" className="mt-4">
                  {country.taxSchemes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No tax relief schemes configured
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                          <TableHead className="text-right">Annual Cap</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {country.taxSchemes.map((s: any) => (
                          <TableRow key={s.id}>
                            <TableCell className="font-mono font-medium">{s.scheme_code}</TableCell>
                            <TableCell>{s.scheme_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {s.scheme_category?.replace(/_/g, " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize">{s.relief_type}</TableCell>
                            <TableCell className="text-right font-mono">
                              {s.relief_percentage 
                                ? `${s.relief_percentage}%` 
                                : s.relief_value 
                                  ? `$${s.relief_value.toLocaleString()}` 
                                  : "-"}</TableCell>
                            <TableCell className="text-right font-mono">
                              {s.annual_cap ? `$${s.annual_cap.toLocaleString()}` : "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCountries.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No countries found matching your search criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
