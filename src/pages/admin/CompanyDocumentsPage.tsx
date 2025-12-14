import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { Plus, FileText, Download, Trash2, Globe, Lock } from "lucide-react";

interface CompanyDocument {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string;
  file_type: string | null;
  version: string;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
}

const DOCUMENT_CATEGORIES = [
  "Policies",
  "Procedures",
  "Forms",
  "Handbooks",
  "Guidelines",
  "Templates",
  "Training Materials",
  "Other",
];

export default function CompanyDocumentsPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    file_url: "",
    version: "1.0",
    is_public: true,
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from("company_documents")
        .select("*")
        .eq("is_active", true)
        .order("category")
        .order("title");

      setDocuments((data || []) as CompanyDocument[]);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.file_url) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("company_documents").insert({
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        file_url: formData.file_url,
        version: formData.version,
        is_public: formData.is_public,
        company_id: profile?.company_id || null,
        uploaded_by: user?.id,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Document added successfully" });
      setDialogOpen(false);
      setFormData({ title: "", description: "", category: "", file_url: "", version: "1.0", is_public: true });
      loadDocuments();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add document", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await supabase.from("company_documents").update({ is_active: false }).eq("id", id);
      toast({ title: "Success", description: "Document deleted" });
      loadDocuments();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete document", variant: "destructive" });
    }
  };

  const filteredDocuments = selectedCategory === "all"
    ? documents
    : documents.filter(d => d.category === selectedCategory);

  const categories = [...new Set(documents.map(d => d.category))];

  const breadcrumbItems = [
    { label: "Admin & Security", href: "/admin" },
    { label: "Company Documents" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Company Documents</h1>
            <p className="text-muted-foreground">Manage organization documents and policies</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>

        <div className="flex gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No documents found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{doc.title}</div>
                            {doc.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                                {doc.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.category}</Badge>
                      </TableCell>
                      <TableCell>{doc.version}</TableCell>
                      <TableCell>
                        {doc.is_public ? (
                          <Badge className="bg-green-500/20 text-green-700">
                            <Globe className="h-3 w-3 mr-1" /> Public
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/20 text-yellow-700">
                            <Lock className="h-3 w-3 mr-1" /> Restricted
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(doc.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" asChild>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(doc.id)}>
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Document title"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>File URL</Label>
                <Input
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this document"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Version</Label>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0"
                  />
                </div>
                <div className="flex items-center justify-between pt-6">
                  <Label>Public Access</Label>
                  <Switch
                    checked={formData.is_public}
                    onCheckedChange={(v) => setFormData({ ...formData, is_public: v })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Document"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
