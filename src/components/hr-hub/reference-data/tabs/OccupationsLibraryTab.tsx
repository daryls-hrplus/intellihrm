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

interface Occupation {
  id: string;
  isco_code: string | null;
  occupation_name: string;
  job_family: string | null;
  description: string | null;
  is_active: boolean;
}

export function OccupationsLibraryTab() {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: occupations = [], isLoading } = useQuery({
    queryKey: ["master-occupations-library"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_occupations_library")
        .select("id, isco_code, occupation_name, job_family, description, is_active")
        .eq("is_active", true)
        .order("job_family", { ascending: true })
        .order("occupation_name", { ascending: true });
      if (error) throw error;
      return data as Occupation[];
    },
  });

  const groups = useMemo(() => {
    const uniqueGroups = [...new Set(occupations.map((o) => o.job_family).filter(Boolean))];
    return uniqueGroups.sort() as string[];
  }, [occupations]);

  const filteredOccupations = useMemo(() => {
    let result = occupations;
    
    if (selectedGroup !== "all") {
      result = result.filter((o) => o.job_family === selectedGroup);
    }
    
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.occupation_name.toLowerCase().includes(lowerSearch) ||
          (o.isco_code?.toLowerCase().includes(lowerSearch)) ||
          (o.job_family?.toLowerCase().includes(lowerSearch))
      );
    }
    
    return result;
  }, [search, selectedGroup, occupations]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["isco_code", "occupation_name", "job_family", "description"];
    const rows = filteredOccupations.map((o) => [
      o.isco_code || "", 
      o.occupation_name, 
      o.job_family || "",
      o.description || ""
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `occupations_library${selectedGroup !== "all" ? `_${selectedGroup}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded occupations library CSV");
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
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Select job family" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Job Families</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search occupations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredOccupations.length} records
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
                <TableHead className="w-28">ISCO Code</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead className="w-40">Job Family</TableHead>
                <TableHead className="w-20 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOccupations.map((occupation) => (
                <TableRow key={occupation.id}>
                  <TableCell>
                    {occupation.isco_code && (
                      <code className="px-2 py-1 bg-primary/10 rounded text-sm font-mono">
                        {occupation.isco_code}
                      </code>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{occupation.occupation_name}</span>
                      {occupation.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{occupation.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {occupation.job_family && (
                      <Badge variant="outline" className="font-normal">
                        {occupation.job_family}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(occupation.isco_code || occupation.occupation_name)}
                      className="h-8 w-8"
                    >
                      {copiedCode === (occupation.isco_code || occupation.occupation_name) ? (
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
        ISCO-aligned occupation library for job classification and workforce analytics.
      </p>
    </div>
  );
}
