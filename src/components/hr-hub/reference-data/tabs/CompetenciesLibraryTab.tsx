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

interface Competency {
  id: string;
  competency_name: string;
  competency_type: string | null;
  category: string | null;
  description: string | null;
  is_active: boolean;
}

export function CompetenciesLibraryTab() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: competencies = [], isLoading } = useQuery({
    queryKey: ["master-competencies-library"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_competencies_library")
        .select("id, competency_name, competency_type, category, description, is_active")
        .eq("is_active", true)
        .order("competency_type", { ascending: true })
        .order("competency_name", { ascending: true });
      if (error) throw error;
      return data as Competency[];
    },
  });

  const types = useMemo(() => {
    const uniqueTypes = [...new Set(competencies.map((c) => c.competency_type).filter(Boolean))];
    return uniqueTypes.sort() as string[];
  }, [competencies]);

  const filteredCompetencies = useMemo(() => {
    let result = competencies;
    
    if (selectedType !== "all") {
      result = result.filter((c) => c.competency_type === selectedType);
    }
    
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.competency_name.toLowerCase().includes(lowerSearch) ||
          (c.competency_type?.toLowerCase().includes(lowerSearch)) ||
          (c.description?.toLowerCase().includes(lowerSearch))
      );
    }
    
    return result;
  }, [search, selectedType, competencies]);

  const handleCopyCode = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedCode(name);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${name}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["competency_name", "competency_type", "category", "description"];
    const rows = filteredCompetencies.map((c) => [
      c.competency_name, 
      c.competency_type || "",
      c.category || "",
      c.description || ""
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `competencies_library${selectedType !== "all" ? `_${selectedType}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded competencies library CSV");
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
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search competencies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredCompetencies.length} records
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
                <TableHead>Competency</TableHead>
                <TableHead className="w-36">Type</TableHead>
                <TableHead className="w-36">Category</TableHead>
                <TableHead className="w-20 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompetencies.map((competency) => (
                <TableRow key={competency.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{competency.competency_name}</span>
                      {competency.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{competency.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {competency.competency_type && (
                      <Badge variant="outline" className="font-normal">
                        {competency.competency_type}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {competency.category && (
                      <span className="text-sm text-muted-foreground">{competency.category}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(competency.competency_name)}
                      className="h-8 w-8"
                    >
                      {copiedCode === competency.competency_name ? (
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
        Competency framework library for performance management, development plans, and talent assessments.
      </p>
    </div>
  );
}
