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

interface CSMECertificate {
  id: string;
  code: string;
  name: string;
  description: string | null;
  requires_expiry: boolean | null;
  eligible_countries: string[] | null;
  is_active: boolean;
}

export function CSMECertificatesTab() {
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["csme-certificates-reference"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("csme_certificate_types")
        .select("id, code, name, description, requires_expiry, eligible_countries, is_active")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data as CSMECertificate[];
    },
  });

  const filteredCertificates = useMemo(() => {
    if (!search.trim()) return certificates;
    
    const lowerSearch = search.toLowerCase();
    return certificates.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerSearch) ||
        c.code.toLowerCase().includes(lowerSearch) ||
        (c.description?.toLowerCase().includes(lowerSearch))
    );
  }, [search, certificates]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["code", "name", "description", "requires_expiry", "eligible_countries"];
    const rows = filteredCertificates.map((c) => [
      c.code,
      c.name,
      c.description || "",
      c.requires_expiry ? "Yes" : "No",
      c.eligible_countries?.join(", ") || ""
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "csme_certificates.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded CSME certificates CSV");
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
              placeholder="Search CSME certificates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredCertificates.length} records
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
                <TableHead>Certificate Type</TableHead>
                <TableHead className="w-32">Expiry</TableHead>
                <TableHead className="w-16 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {cert.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{cert.name}</span>
                      {cert.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cert.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {cert.requires_expiry ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Required
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(cert.code)}
                      className="h-8 w-8"
                    >
                      {copiedCode === cert.code ? (
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
        CARICOM Single Market & Economy (CSME) certificate types for Caribbean free movement.
      </p>
    </div>
  );
}
