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
import { useLanguage } from "@/hooks/useLanguage";

interface LookupValue {
  id: string;
  category: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  employee_status: "Employee Statuses",
  termination_reason: "Termination Reasons",
  employee_type: "Employee Types",
  employment_action: "Employment Actions",
  leave_type: "Leave Types",
  contract_type: "Contract Types",
  qualification_type: "Qualification Types",
  education_level: "Education Levels",
  field_of_study: "Fields of Study",
  institution_name: "Institution Names",
  certification_type: "Certification Types",
  certification_name: "Certification Names",
  accrediting_body: "Accrediting Bodies",
  gender: "Gender",
  marital_status: "Marital Status",
  title: "Titles",
  blood_type: "Blood Types",
  relationship_type: "Relationship Types",
};

export function LookupValuesTab() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: lookupValues = [], isLoading } = useQuery({
    queryKey: ["lookup-values-reference"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lookup_values")
        .select("id, category, code, name, description, is_active")
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as LookupValue[];
    },
  });

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(lookupValues.map((v) => v.category))];
    return uniqueCategories.sort();
  }, [lookupValues]);

  const filteredValues = useMemo(() => {
    let result = lookupValues;
    
    if (selectedCategory !== "all") {
      result = result.filter((v) => v.category === selectedCategory);
    }
    
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(lowerSearch) ||
          v.code.toLowerCase().includes(lowerSearch) ||
          v.category.toLowerCase().includes(lowerSearch)
      );
    }
    
    return result;
  }, [search, selectedCategory, lookupValues]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const dataToExport = selectedCategory === "all" ? lookupValues : filteredValues;
    const headers = ["category", "code", "name", "description"];
    const rows = dataToExport.map((v) => [v.category, v.code, v.name, v.description || ""]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lookup_values${selectedCategory !== "all" ? `_${selectedCategory}` : ""}.csv`;
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
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder={t("hrHub.refData.selectCategory")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("hrHub.refData.allCategories")}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CATEGORY_LABELS[cat] || cat.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("hrHub.refData.searchLookups")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredValues.length} {t("hrHub.refData.records")}
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
                <TableHead className="w-40">{t("hrHub.refData.category")}</TableHead>
                <TableHead className="w-32">{t("hrHub.refData.code")}</TableHead>
                <TableHead>{t("hrHub.refData.name")}</TableHead>
                <TableHead className="w-20 text-center">{t("hrHub.refData.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredValues.map((value) => (
                <TableRow key={value.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {CATEGORY_LABELS[value.category] || value.category.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {value.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span>{value.name}</span>
                      {value.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{value.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(value.code)}
                      className="h-8 w-8"
                    >
                      {copiedCode === value.code ? (
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
        {t("hrHub.refData.lookupValuesNote")}
      </p>
    </div>
  );
}
