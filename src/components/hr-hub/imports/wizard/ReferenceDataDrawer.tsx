import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Import data sources
import { countries } from "@/lib/countries";
import { ISO_LANGUAGES } from "@/constants/languageConstants";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ReferenceDataType = "country" | "currency" | "language" | "lookup" | "master_job_family" | "job_family";

interface ReferenceDataDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataType: ReferenceDataType;
  lookupCategory?: string;
  title?: string;
}

interface ReferenceItem {
  code: string;
  name: string;
  extra?: string;
}

export function ReferenceDataDrawer({
  open,
  onOpenChange,
  dataType,
  lookupCategory,
  title,
}: ReferenceDataDrawerProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch currencies from database
  const { data: currencies = [] } = useQuery({
    queryKey: ["currencies-reference-drawer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("code, name, symbol")
        .eq("is_active", true)
        .order("code");
      if (error) throw error;
      return data;
    },
    enabled: open && dataType === "currency",
  });

  // Fetch master job families from database
  const { data: masterJobFamilies = [] } = useQuery({
    queryKey: ["master-job-families-reference-drawer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_job_families")
        .select("code, name, industry_category")
        .eq("is_active", true)
        .order("code");
      if (error) throw error;
      return data;
    },
    enabled: open && dataType === "master_job_family",
  });

  // Fetch job families from database (company-scoped)
  const { data: jobFamilies = [] } = useQuery({
    queryKey: ["job-families-reference-drawer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_families")
        .select("code, name, companies(code, name)")
        .eq("is_active", true)
        .order("code");
      if (error) throw error;
      return data;
    },
    enabled: open && dataType === "job_family",
  });

  // Fetch lookup values from database
  const { data: lookupValues = [] } = useQuery({
    queryKey: ["lookup-values-reference-drawer", lookupCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lookup_values")
        .select("code, name, description")
        .eq("category", lookupCategory as any)
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: open && dataType === "lookup" && !!lookupCategory,
  });

  // Build items based on data type
  const items: ReferenceItem[] = useMemo(() => {
    switch (dataType) {
      case "country":
        return countries.map((c) => ({ code: c.code, name: c.name }));
      case "currency":
        return currencies.map((c) => ({
          code: c.code,
          name: c.name,
          extra: c.symbol || undefined,
        }));
      case "language":
        return ISO_LANGUAGES.map((l) => ({ code: l.code, name: l.name }));
      case "lookup":
        return lookupValues.map((v) => ({
          code: v.code,
          name: v.name,
          extra: v.description || undefined,
        }));
      case "master_job_family":
        return masterJobFamilies.map((m) => ({
          code: m.code,
          name: m.name,
          extra: m.industry_category || undefined,
        }));
      case "job_family":
        return jobFamilies.map((jf) => ({
          code: jf.code,
          name: jf.name,
          extra: (jf.companies as any)?.code || undefined,
        }));
      default:
        return [];
    }
  }, [dataType, currencies, lookupValues, masterJobFamilies, jobFamilies]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const lowerSearch = search.toLowerCase();
    return items.filter(
      (item) =>
        item.code.toLowerCase().includes(lowerSearch) ||
        item.name.toLowerCase().includes(lowerSearch)
    );
  }, [items, search]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const getTitle = () => {
    if (title) return title;
    switch (dataType) {
      case "country":
        return "Country Codes (ISO 3166-1)";
      case "currency":
        return "Currency Codes (ISO 4217)";
      case "language":
        return "Language Codes (ISO 639-1)";
      case "lookup":
        return lookupCategory
          ? `${lookupCategory.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} Values`
          : "Lookup Values";
      case "master_job_family":
        return "Master Job Family Codes";
      case "job_family":
        return "Job Family Codes";
      default:
        return "Reference Data";
    }
  };

  const getDescription = () => {
    switch (dataType) {
      case "country":
        return "Use these 2-letter ISO country codes in your import file.";
      case "currency":
        return "Use these 3-letter ISO currency codes in your import file.";
      case "language":
        return "Use these language codes for language preference fields.";
      case "lookup":
        return "Use the CODE column values (not the display name) in your import file.";
      case "master_job_family":
        return "Use these master codes in the master_code field to link job families to global standards.";
      case "job_family":
        return "Use the job family code that exists for the target company. The extra column shows the company code.";
      default:
        return "Copy codes to use in your import file.";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{getTitle()}</SheetTitle>
          <SheetDescription>{getDescription()}</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Count */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {filteredItems.length} of {items.length} values
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/hr-hub/reference-data")}
              className="text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Full Catalog
            </Button>
          </div>

          {/* Items List */}
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-1 pr-4">
              {filteredItems.map((item) => (
                <div
                  key={item.code}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-0.5 bg-muted rounded text-sm font-mono font-medium">
                        {item.code}
                      </code>
                      {item.extra && (
                        <span className="text-muted-foreground text-sm">
                          {item.extra}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {item.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyCode(item.code)}
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedCode === item.code ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
