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

interface LeaveType {
  id: string;
  code: string;
  name: string;
  is_paid: boolean | null;
  is_accrual_based: boolean | null;
  description: string | null;
  is_active: boolean;
}

export function LeaveTypesTab() {
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: leaveTypes = [], isLoading } = useQuery({
    queryKey: ["leave-types-reference"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leave_types")
        .select("id, code, name, is_paid, is_accrual_based, description, is_active")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data as LeaveType[];
    },
  });

  const filteredLeaveTypes = useMemo(() => {
    if (!search.trim()) return leaveTypes;
    
    const lowerSearch = search.toLowerCase();
    return leaveTypes.filter(
      (l) =>
        l.name.toLowerCase().includes(lowerSearch) ||
        l.code.toLowerCase().includes(lowerSearch)
    );
  }, [search, leaveTypes]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["code", "name", "is_paid", "is_accrual_based", "description"];
    const rows = filteredLeaveTypes.map((l) => [
      l.code, 
      l.name, 
      l.is_paid ? "Yes" : "No",
      l.is_accrual_based ? "Yes" : "No",
      l.description || ""
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leave_types.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded leave types CSV");
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
            placeholder="Search leave types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredLeaveTypes.length} records
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
                <TableHead>Leave Type</TableHead>
                <TableHead className="w-24 text-center">Paid</TableHead>
                <TableHead className="w-28 text-center">Accrual Based</TableHead>
                <TableHead className="w-20 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaveTypes.map((leaveType) => (
                <TableRow key={leaveType.id}>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {leaveType.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{leaveType.name}</span>
                      {leaveType.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{leaveType.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={leaveType.is_paid ? "default" : "secondary"}>
                      {leaveType.is_paid ? "Paid" : "Unpaid"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm text-muted-foreground">
                      {leaveType.is_accrual_based ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(leaveType.code)}
                      className="h-8 w-8"
                    >
                      {copiedCode === leaveType.code ? (
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
        Standard leave type definitions for time-off management and absence tracking.
      </p>
    </div>
  );
}
