import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUpdateDocumentStatus } from "@/hooks/useComplianceDocument";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, Search, Eye, MoreVertical, Clock, CheckCircle, AlertCircle, Archive, XCircle, Send } from "lucide-react";
import { format } from "date-fns";

interface ComplianceDocumentLibraryProps {
  companyId: string;
  employeeId?: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  draft: { label: "Draft", icon: FileText, className: "bg-muted text-muted-foreground" },
  pending_review: { label: "Pending Review", icon: Clock, className: "bg-yellow-500/10 text-yellow-600" },
  pending_signatures: { label: "Pending Signatures", icon: Send, className: "bg-blue-500/10 text-blue-600" },
  signed: { label: "Signed", icon: CheckCircle, className: "bg-green-500/10 text-green-600" },
  archived: { label: "Archived", icon: Archive, className: "bg-gray-500/10 text-gray-600" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-destructive/10 text-destructive" },
};

const SOURCE_LABELS: Record<string, string> = {
  disciplinary: "Disciplinary Action",
  grievance: "Grievance",
  appraisal: "Performance Appraisal",
  termination: "Termination",
  pip: "Performance Improvement Plan",
  manual: "Manual Entry",
};

export function ComplianceDocumentLibrary({ companyId, employeeId }: ComplianceDocumentLibraryProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);

  // Fetch documents with employee info
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["compliance-documents-library", companyId, employeeId, statusFilter, sourceFilter],
    queryFn: async () => {
      let query = supabase
        .from("compliance_document_instances")
        .select(`
          *,
          template:compliance_document_templates(*)
        `)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (sourceFilter !== "all") {
        query = query.eq("source_type", sourceFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch employee names separately
      if (data && data.length > 0) {
        const employeeIds = [...new Set(data.map(d => d.employee_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", employeeIds);
        
        const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
        return data.map(d => ({
          ...d,
          employee_name: profileMap.get(d.employee_id) || "Unknown"
        }));
      }
      return data || [];
    },
  });

  const updateStatus = useUpdateDocumentStatus();

  const filteredDocuments = documents.filter((doc: any) => {
    const templateName = doc.template?.name || "";
    const employeeName = doc.employee_name || "";
    return (
      templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employeeName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleStatusChange = async (documentId: string, newStatus: string) => {
    await updateStatus.mutateAsync({ id: documentId, status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("compliance.documentLibrary", "Compliance Documents")}
          </CardTitle>
          <CardDescription>
            {t("compliance.documentLibraryDesc", "View and manage generated compliance documents")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("compliance.searchDocuments", "Search documents...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Documents Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <FileText className="h-10 w-10 mb-2 opacity-50" />
              <p>{t("compliance.noDocuments", "No documents found")}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc: any) => {
                    const template = doc.template;
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{template?.name || "Unknown Template"}</p>
                            <p className="text-xs text-muted-foreground">
                              {template?.category} • {template?.country_code || template?.jurisdiction}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {doc.employee_name || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {SOURCE_LABELS[doc.source_type] || doc.source_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(doc.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedDocument(doc)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Document
                              </DropdownMenuItem>
                              {doc.status === "draft" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(doc.id, "pending_signatures")}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Send for Signatures
                                </DropdownMenuItem>
                              )}
                              {doc.status !== "archived" && doc.status !== "cancelled" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(doc.id, "archived")}
                                >
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Viewer Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {(selectedDocument?.template as any)?.name || "Document"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-4">
            {selectedDocument && getStatusBadge(selectedDocument.status)}
            <Badge variant="secondary">
              {SOURCE_LABELS[selectedDocument?.source_type || ""] || selectedDocument?.source_type}
            </Badge>
          </div>
          <ScrollArea className="h-[500px] border rounded-lg p-4">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedDocument?.generated_content || "" }}
            />
          </ScrollArea>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Created: {selectedDocument && format(new Date(selectedDocument.created_at), "PPP")}
            </span>
            {selectedDocument?.retention_expires_at && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Retention until: {format(new Date(selectedDocument.retention_expires_at), "PPP")}
              </span>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
