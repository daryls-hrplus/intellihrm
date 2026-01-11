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

interface SavingsProgramType {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string | null;
  has_employer_match: boolean;
  is_active: boolean;
}

export function SavingsProgramsTab() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ["savings-programs-reference"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("savings_program_types")
        .select("id, code, name, category, description, has_employer_match, is_active")
        .eq("is_active", true)
        .is("company_id", null)
        .order("category", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as SavingsProgramType[];
    },
  });

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(programs.map((p) => p.category).filter(Boolean))];
    return uniqueCategories.sort() as string[];
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    let result = programs;

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }
    
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerSearch) ||
          p.code.toLowerCase().includes(lowerSearch) ||
          (p.category?.toLowerCase().includes(lowerSearch)) ||
          (p.description?.toLowerCase().includes(lowerSearch))
      );
    }
    
    return result;
  }, [search, selectedCategory, programs]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["code", "name", "category", "description", "has_employer_match"];
    const rows = filteredPrograms.map((p) => [
      p.code,
      p.name,
      p.category,
      p.description || "",
      p.has_employer_match ? "Yes" : "No"
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "savings_programs.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded savings programs CSV");
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
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search savings programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredPrograms.length} records
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
                <TableHead className="w-36">Code</TableHead>
                <TableHead>Program Name</TableHead>
                <TableHead className="w-36">Category</TableHead>
                <TableHead className="w-28 text-center">Employer Match</TableHead>
                <TableHead className="w-16 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrograms.map((program) => (
                <TableRow key={program.id}>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {program.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{program.name}</span>
                      {program.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{program.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal capitalize">
                      {program.category.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {program.has_employer_match ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(program.code)}
                      className="h-8 w-8"
                    >
                      {copiedCode === program.code ? (
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
        Employee savings and pension program types for benefits administration.
      </p>
    </div>
  );
}
