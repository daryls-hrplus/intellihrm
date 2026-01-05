import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/intranet/RichTextEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Plus, Megaphone, Pin, Edit, Trash2, Building2 } from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  is_pinned: boolean;
  is_active: boolean;
  publish_at: string | null;
  expire_at: string | null;
  created_at: string;
  created_by: string | null;
  company_id: string | null;
  company?: Company | null;
}

export default function CompanyAnnouncementsPage() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal",
    is_pinned: false,
    is_active: true,
    publish_at: "",
    expire_at: "",
    company_id: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [announcementsRes, companiesRes] = await Promise.all([
        supabase
          .from("company_announcements")
          .select("*, company:companies(id, name)")
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("companies")
          .select("id, name")
          .eq("is_active", true)
          .order("name"),
      ]);

      setAnnouncements((announcementsRes.data || []) as Announcement[]);
      setCompanies((companiesRes.data || []) as Company[]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast({ title: "Error", description: "Title and content are required", variant: "destructive" });
      return;
    }
    if (!formData.company_id) {
      toast({ title: "Error", description: "Please select a company", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      const data = {
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        is_pinned: formData.is_pinned,
        is_active: formData.is_active,
        publish_at: formData.publish_at || null,
        expire_at: formData.expire_at || null,
        company_id: formData.company_id,
        created_by: user?.id,
      };

      if (editingId) {
        await supabase.from("company_announcements").update(data).eq("id", editingId);
        toast({ title: "Success", description: "Announcement updated" });
      } else {
        await supabase.from("company_announcements").insert(data);
        toast({ title: "Success", description: "Announcement created" });
      }

      closeDialog();
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save announcement", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      is_pinned: announcement.is_pinned,
      is_active: announcement.is_active,
      publish_at: announcement.publish_at ? format(new Date(announcement.publish_at), "yyyy-MM-dd'T'HH:mm") : "",
      expire_at: announcement.expire_at ? format(new Date(announcement.expire_at), "yyyy-MM-dd'T'HH:mm") : "",
      company_id: announcement.company_id || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await supabase.from("company_announcements").delete().eq("id", id);
      toast({ title: "Success", description: "Announcement deleted" });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete announcement", variant: "destructive" });
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      content: "",
      priority: "normal",
      is_pinned: false,
      is_active: true,
      publish_at: "",
      expire_at: "",
      company_id: "",
    });
  };

  const filteredAnnouncements = announcements.filter(ann => 
    selectedCompany === "all" || ann.company_id === selectedCompany
  );

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-muted text-muted-foreground",
      normal: "bg-blue-500/20 text-blue-700",
      high: "bg-orange-500/20 text-orange-700",
      urgent: "bg-red-500/20 text-red-700",
    };
    return <Badge className={colors[priority] || "bg-muted"}>{priority}</Badge>;
  };

  const breadcrumbItems = [
    { label: t("navigation.hrHub"), href: "/hr-hub" },
    { label: t("hrHub.announcements") },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Company Announcements</h1>
            <p className="text-muted-foreground">Manage organization-wide announcements</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        </div>

        <div className="flex gap-4">
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[220px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Announcements ({filteredAnnouncements.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No announcements yet</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnnouncements.map((ann) => (
                    <TableRow key={ann.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {ann.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                          <span className="font-medium">{ann.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{ann.company?.name || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(ann.priority)}</TableCell>
                      <TableCell>
                        <Badge variant={ann.is_active ? "default" : "secondary"}>
                          {ann.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateForDisplay(ann.created_at, "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(ann)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(ann.id)}>
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

        <Dialog open={dialogOpen} onOpenChange={closeDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Announcement" : "New Announcement"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Company <span className="text-destructive">*</span></Label>
                <Select value={formData.company_id} onValueChange={(v) => setFormData({ ...formData, company_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title <span className="text-destructive">*</span></Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <Label>Content <span className="text-destructive">*</span></Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(val) => setFormData({ ...formData, content: val })}
                  placeholder="Announcement content..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Pin to Top</Label>
                    <Switch
                      checked={formData.is_pinned}
                      onCheckedChange={(v) => setFormData({ ...formData, is_pinned: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Publish At (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={formData.publish_at}
                    onChange={(e) => setFormData({ ...formData, publish_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Expire At (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={formData.expire_at}
                    onChange={(e) => setFormData({ ...formData, expire_at: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
