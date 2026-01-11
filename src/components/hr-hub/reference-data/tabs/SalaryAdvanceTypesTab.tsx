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

interface SalaryAdvanceType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  max_amount: number | null;
  max_percentage_of_salary: number | null;
  max_repayment_periods: number | null;
  is_active: boolean;
}

export function SalaryAdvanceTypesTab() {
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: advanceTypes = [], isLoading } = useQuery({
    queryKey: ["salary-advance-types-reference"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_advance_types")
        .select("id, code, name, description, max_amount, max_percentage_of_salary, max_repayment_periods, is_active")
        .eq("is_active", true)
        .is("company_id", null)
        .order("name", { ascending: true });
      if (error) throw error;
      return data as SalaryAdvanceType[];
    },
  });

  const filteredAdvanceTypes = useMemo(() => {
    if (!search.trim()) return advanceTypes;
    
    const lowerSearch = search.toLowerCase();
    return advanceTypes.filter(
      (a) =>
        a.name.toLowerCase().includes(lowerSearch) ||
        a.code.toLowerCase().includes(lowerSearch) ||
        (a.description?.toLowerCase().includes(lowerSearch))
    );
  }, [search, advanceTypes]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "-";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleDownloadCSV = () => {
    const headers = ["code", "name", "description", "max_amount", "max_percentage_of_salary", "max_repayment_periods"];
    const rows = filteredAdvanceTypes.map((a) => [
      a.code,
      a.name,
      a.description || "",
      a.max_amount?.toString() || "",
      a.max_percentage_of_salary?.toString() || "",
      a.max_repayment_periods?.toString() || ""
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "salary_advance_types.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded salary advance types CSV");
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
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search advance types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredAdvanceTypes.length} records
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
                <TableHead className="w-32">Code</TableHead>
                <TableHead>Advance Type</TableHead>
                <TableHead className="w-28 text-right">Max Amount</TableHead>
                <TableHead className="w-24 text-center">Max %</TableHead>
                <TableHead className="w-24 text-center">Repayment</TableHead>
                <TableHead className="w-16 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdvanceTypes.map((advance) => (
                <TableRow key={advance.id}>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {advance.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{advance.name}</span>
                      {advance.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{advance.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(advance.max_amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    {advance.max_percentage_of_salary ? (
                      <Badge variant="outline" className="font-normal">
                        {advance.max_percentage_of_salary}%
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {advance.max_repayment_periods ? `${advance.max_repayment_periods} periods` : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(advance.code)}
                      className="h-8 w-8"
                    >
                      {copiedCode === advance.code ? (
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
        Salary advance and loan types for employee financial assistance programs.
      </p>
    </div>
  );
}
