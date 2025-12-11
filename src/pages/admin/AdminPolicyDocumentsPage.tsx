import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  Search,
  Building2,
  Globe,
  Settings,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

interface PolicyCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  icon: string | null;
}

interface PolicyDocument {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  company_id: string | null;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  version: string | null;
  effective_date: string | null;
  is_active: boolean;
  is_global: boolean;
  processing_status: string;
  processing_error: string | null;
  chunk_count: number;
  created_at: string;
  policy_categories?: PolicyCategory;
  companies?: { name: string } | null;
}

interface PolicyRule {
  id: string;
  document_id: string;
  rule_type: string;
  rule_context: string;
  rule_description: string;
  rule_condition: any;
  severity: string;
  is_active: boolean;
  policy_documents?: { title: string };
}

interface Company {
  id: string;
  name: string;
  code: string;
}

export default function AdminPolicyDocumentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [categories, setCategories] = useState<PolicyCategory[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [rules, setRules] = useState<PolicyRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [scopeFilter, setScopeFilter] = useState<string>("all");

  // Dialog states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewRulesDocId, setViewRulesDocId] = useState<string | null>(null);

  // Form state
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category_id: "",
    company_id: "",
    is_global: false,
    version: "1.0",
    effective_date: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [docsRes, catsRes, compsRes, rulesRes] = await Promise.all([
        supabase
          .from("policy_documents")
          .select("*, policy_categories(*), companies(name)")
          .order("created_at", { ascending: false }),
        supabase.from("policy_categories").select("*").eq("is_active", true).order("display_order"),
        supabase.from("companies").select("id, name, code").eq("is_active", true),
        supabase
          .from("policy_rules")
          .select("*, policy_documents(title)")
          .order("created_at", { ascending: false }),
      ]);

      if (docsRes.data) setDocuments(docsRes.data);
      if (catsRes.data) setCategories(catsRes.data);
      if (compsRes.data) setCompanies(compsRes.data);
      if (rulesRes.data) setRules(rulesRes.data as PolicyRule[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load policy documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/markdown"];
      const allowedExtensions = [".pdf", ".docx", ".txt", ".md"];
      const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
      
      if (!allowedExtensions.includes(extension)) {
        toast.error("Please upload a PDF, DOCX, TXT, or MD file");
        return;
      }
      
      setSelectedFile(file);
      if (!uploadForm.title) {
        setUploadForm(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, "") }));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadForm.title) {
      toast.error("Please provide a file and title");
      return;
    }

    setIsUploading(true);
    try {
      const extension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf(".") + 1);
      const filePath = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("policy-documents")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: doc, error: docError } = await supabase
        .from("policy_documents")
        .insert({
          title: uploadForm.title,
          description: uploadForm.description || null,
          category_id: uploadForm.category_id || null,
          company_id: uploadForm.is_global ? null : (uploadForm.company_id || null),
          is_global: uploadForm.is_global,
          file_name: selectedFile.name,
          file_path: filePath,
          file_type: extension,
          file_size: selectedFile.size,
          version: uploadForm.version || "1.0",
          effective_date: uploadForm.effective_date || null,
          uploaded_by: user?.id,
        })
        .select()
        .single();

      if (docError) throw docError;

      toast.success("Document uploaded successfully");

      // Trigger processing
      try {
        const { error: processError } = await supabase.functions.invoke("process-policy-document", {
          body: { documentId: doc.id },
        });
        
        if (processError) {
          console.error("Processing error:", processError);
          toast.warning("Document uploaded but processing may take some time");
        } else {
          toast.success("Document is being processed for AI training");
        }
      } catch (e) {
        console.error("Failed to trigger processing:", e);
      }

      // Reset form and refresh
      setIsUploadOpen(false);
      setSelectedFile(null);
      setUploadForm({
        title: "",
        description: "",
        category_id: "",
        company_id: "",
        is_global: false,
        version: "1.0",
        effective_date: "",
      });
      fetchData();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const doc = documents.find(d => d.id === deleteId);
      if (doc) {
        await supabase.storage.from("policy-documents").remove([doc.file_path]);
      }

      const { error } = await supabase
        .from("policy_documents")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast.success("Document deleted successfully");
      setDeleteId(null);
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
    }
  };

  const handleReprocess = async (docId: string) => {
    try {
      await supabase
        .from("policy_documents")
        .update({ processing_status: "pending" })
        .eq("id", docId);

      const { error } = await supabase.functions.invoke("process-policy-document", {
        body: { documentId: docId },
      });

      if (error) throw error;

      toast.success("Document reprocessing started");
      fetchData();
    } catch (error) {
      console.error("Reprocess error:", error);
      toast.error("Failed to reprocess document");
    }
  };

  const toggleRuleActive = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("policy_rules")
        .update({ is_active: !isActive })
        .eq("id", ruleId);

      if (error) throw error;

      toast.success(`Rule ${isActive ? "disabled" : "enabled"}`);
      fetchData();
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("Failed to update rule");
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category_id === categoryFilter;
    const matchesScope = scopeFilter === "all" || 
      (scopeFilter === "global" && doc.is_global) ||
      (scopeFilter === "company" && !doc.is_global);
    return matchesSearch && matchesCategory && matchesScope;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Processed</Badge>;
      case "processing":
        return <Badge className="bg-blue-500/10 text-blue-600"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "error":
        return <Badge variant="destructive">Blocking</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500/10 text-yellow-600">Warning</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const docRules = viewRulesDocId ? rules.filter(r => r.document_id === viewRulesDocId) : [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Policy Documents</h1>
            <p className="text-muted-foreground">
              Upload and manage company policies for AI-powered assistance and enforcement
            </p>
          </div>
          <Button onClick={() => setIsUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        <Tabs defaultValue="documents">
          <TabsList>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
              Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="rules">
              <Settings className="h-4 w-4 mr-2" />
              Extracted Rules ({rules.length})
            </TabsTrigger>
            <TabsTrigger value="categories">
              <BookOpen className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={scopeFilter} onValueChange={setScopeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scopes</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="company">Company-specific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No policy documents found</p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsUploadOpen(true)}>
                      Upload your first document
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Scope</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Chunks</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{doc.title}</p>
                                <p className="text-xs text-muted-foreground">{doc.file_name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {doc.policy_categories?.name || "-"}
                          </TableCell>
                          <TableCell>
                            {doc.is_global ? (
                              <Badge variant="outline"><Globe className="h-3 w-3 mr-1" />Global</Badge>
                            ) : (
                              <Badge variant="outline"><Building2 className="h-3 w-3 mr-1" />{doc.companies?.name || "Unassigned"}</Badge>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(doc.processing_status)}</TableCell>
                          <TableCell>{doc.chunk_count}</TableCell>
                          <TableCell>{format(new Date(doc.created_at), "MMM d, yyyy")}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewRulesDocId(doc.id)}
                                title="View extracted rules"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReprocess(doc.id)}
                                title="Reprocess document"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(doc.id)}
                                title="Delete document"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Extracted Policy Rules</CardTitle>
                <CardDescription>
                  Rules automatically extracted from policy documents for enforcement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No policy rules extracted yet</p>
                    <p className="text-sm">Upload and process policy documents to extract enforceable rules</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Context</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Source Document</TableHead>
                        <TableHead>Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="max-w-xs">
                            <p className="truncate">{rule.rule_description}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{rule.rule_type.replace(/_/g, " ")}</Badge>
                          </TableCell>
                          <TableCell className="capitalize">{rule.rule_context}</TableCell>
                          <TableCell>{getSeverityBadge(rule.severity)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {rule.policy_documents?.title || "-"}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={rule.is_active}
                              onCheckedChange={() => toggleRuleActive(rule.id, rule.is_active)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Policy Categories</CardTitle>
                <CardDescription>
                  Categories for organizing policy documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat) => {
                    const docCount = documents.filter(d => d.category_id === cat.id).length;
                    return (
                      <Card key={cat.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{cat.name}</h3>
                              <p className="text-sm text-muted-foreground">{cat.description}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {docCount} document{docCount !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <Badge variant="secondary">{cat.code}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Policy Document</DialogTitle>
            <DialogDescription>
              Upload a policy document to train the AI assistant and enable rule enforcement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>File *</Label>
              <Input
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground">Supported: PDF, DOCX, TXT, MD</p>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Employee Handbook 2024"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the document..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={uploadForm.category_id}
                  onValueChange={(v) => setUploadForm(prev => ({ ...prev, category_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Version</Label>
                <Input
                  value={uploadForm.version}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="1.0"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_global"
                  checked={uploadForm.is_global}
                  onCheckedChange={(v) => setUploadForm(prev => ({ ...prev, is_global: v }))}
                />
                <Label htmlFor="is_global">Global Policy (applies to all companies)</Label>
              </div>
            </div>
            {!uploadForm.is_global && (
              <div className="space-y-2">
                <Label>Company</Label>
                <Select
                  value={uploadForm.company_id}
                  onValueChange={(v) => setUploadForm(prev => ({ ...prev, company_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((comp) => (
                      <SelectItem key={comp.id} value={comp.id}>{comp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Effective Date</Label>
              <Input
                type="date"
                value={uploadForm.effective_date}
                onChange={(e) => setUploadForm(prev => ({ ...prev, effective_date: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={isUploading || !selectedFile || !uploadForm.title}>
              {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Upload & Process
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Rules Dialog */}
      <Dialog open={!!viewRulesDocId} onOpenChange={() => setViewRulesDocId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Extracted Rules</DialogTitle>
            <DialogDescription>
              Rules extracted from this policy document
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            {docRules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No rules extracted from this document</p>
              </div>
            ) : (
              <div className="space-y-4">
                {docRules.map((rule) => (
                  <Card key={rule.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium">{rule.rule_description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{rule.rule_type.replace(/_/g, " ")}</Badge>
                            <Badge variant="secondary" className="capitalize">{rule.rule_context}</Badge>
                            {getSeverityBadge(rule.severity)}
                          </div>
                          <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                            {JSON.stringify(rule.rule_condition, null, 2)}
                          </pre>
                        </div>
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={() => toggleRuleActive(rule.id, rule.is_active)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Policy Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the document and all its extracted rules. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
