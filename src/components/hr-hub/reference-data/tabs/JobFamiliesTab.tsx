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
import { Search, Download, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface JobFamily {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  master_job_family_id: string | null;
  master_job_families?: {
    code: string;
    name: string;
  } | null;
}

export function JobFamiliesTab() {
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: jobFamilies = [], isLoading } = useQuery({
    queryKey: ["job-families-reference"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_families")
        .select("id, code, name, description, is_active, master_job_family_id, master_job_families(code, name)")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data as JobFamily[];
    },
  });

  const filteredJobFamilies = useMemo(() => {
    if (!search.trim()) return jobFamilies;
    
    const lowerSearch = search.toLowerCase();
    return jobFamilies.filter(
      (j) =>
        j.name.toLowerCase().includes(lowerSearch) ||
        j.code.toLowerCase().includes(lowerSearch) ||
        (j.description?.toLowerCase().includes(lowerSearch))
    );
  }, [search, jobFamilies]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["code", "name", "description"];
    const rows = filteredJobFamilies.map((j) => [
      j.code, 
      j.name, 
      j.description || ""
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "job_families.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded job families CSV");
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
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search job families..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredJobFamilies.length} records
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
                <TableHead>Job Family</TableHead>
                <TableHead className="w-28">Source</TableHead>
                <TableHead className="w-20 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobFamilies.map((jobFamily) => (
                <TableRow key={jobFamily.id}>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {jobFamily.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{jobFamily.name}</span>
                      {jobFamily.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{jobFamily.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {jobFamily.master_job_family_id ? (
                      <Badge variant="outline" className="text-xs">
                        🔗 {jobFamily.master_job_families?.code || "Master"}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Custom</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(jobFamily.code)}
                      className="h-8 w-8"
                    >
                      {copiedCode === jobFamily.code ? (
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
        Job families for organizational structure, career pathing, and workforce analytics.
      </p>
    </div>
  );
}
