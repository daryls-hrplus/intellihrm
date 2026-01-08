import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { 
  Megaphone, 
  Image, 
  FileText, 
  Plus,
  Pencil,
  Trash2,
  Pin,
  Building2,
  Globe,
  Eye,
  CheckCircle2
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { RichTextEditor } from "@/components/intranet/RichTextEditor";
import { usePageAudit } from "@/hooks/usePageAudit";
import { useAnnouncementStats } from "@/hooks/useAnnouncementReads";

interface Company {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

// Unified announcement type that works with both tables
interface UnifiedAnnouncement {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_active: boolean;
  created_at: string;
  company_id: string | null;
  company_name?: string;
  priority?: string;
  announcement_type?: string;
  publish_at?: string | null;
  expire_at?: string | null;
  target_departments?: string[] | null;
  source: "company" | "intranet";
}

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  album_name: string | null;
  is_published: boolean;
  created_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  tags: string[];
  view_count: number;
  created_at: string;
}

export default function CompanyCommunicationsPage() {
  usePageAudit("company-communications", "Admin");
  const { t } = useLanguage();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<UnifiedAnnouncement[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>("all");
  
  // Get announcement IDs for stats
  const companyAnnouncementIds = announcements.filter(a => a.source === "company").map(a => a.id);
  const { stats: announcementStats } = useAnnouncementStats(companyAnnouncementIds);
  
  // Announcement form state
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<UnifiedAnnouncement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    announcement_type: "general",
    priority: "normal",
    is_pinned: false,
    is_active: true,
    requires_acknowledgement: false,
    company_id: "",
    target_departments: [] as string[],
    visibility: "company" as "company" | "departments",
    publish_at: "",
    expire_at: "",
  });

  // Gallery form state
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [galleryForm, setGalleryForm] = useState({
    title: "",
    description: "",
    image_url: "",
    album_name: "",
    is_published: true,
  });

  // Blog form state
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image_url: "",
    is_published: false,
    tags: "",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string; source?: string } | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [companyAnnouncementsRes, intranetAnnouncementsRes, galleryRes, blogRes, companiesRes, departmentsRes] = await Promise.all([
        supabase
          .from("company_announcements")
          .select("*, company:companies(id, name)")
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("intranet_announcements")
          .select("*")
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("intranet_gallery")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("intranet_blog_posts")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("companies")
          .select("id, name")
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("departments")
          .select("id, name, code")
          .eq("is_active", true)
          .order("name"),
      ]);

      // Merge announcements from both sources
      const companyAnnouncements: UnifiedAnnouncement[] = (companyAnnouncementsRes.data || []).map((ann: any) => ({
        id: ann.id,
        title: ann.title,
        content: ann.content,
        is_pinned: ann.is_pinned,
        is_active: ann.is_active,
        created_at: ann.created_at,
        company_id: ann.company_id,
        company_name: ann.company?.name,
        priority: ann.priority,
        publish_at: ann.publish_at,
        expire_at: ann.expire_at,
        source: "company" as const,
      }));

      const intranetAnnouncements: UnifiedAnnouncement[] = (intranetAnnouncementsRes.data || []).map((ann: any) => ({
        id: ann.id,
        title: ann.title,
        content: ann.content,
        is_pinned: ann.is_pinned,
        is_active: ann.is_published,
        created_at: ann.created_at,
        company_id: null,
        announcement_type: ann.announcement_type,
        target_departments: ann.target_departments,
        source: "intranet" as const,
      }));

      // Combine and sort by pinned first, then by date
      const allAnnouncements = [...companyAnnouncements, ...intranetAnnouncements].sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setAnnouncements(allAnnouncements);
      if (galleryRes.data) setGallery(galleryRes.data);
      if (blogRes.data) setBlogPosts(blogRes.data);
      if (companiesRes.data) setCompanies(companiesRes.data);
      if (departmentsRes.data) setDepartments(departmentsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  // Announcement handlers
  const handleSaveAnnouncement = async () => {
    if (!user) return;
    if (!announcementForm.title || !announcementForm.content) {
      toast.error(t("common.fillRequired"));
      return;
    }
    if (!announcementForm.company_id) {
      toast.error("Please select a company");
      return;
    }
    
    try {
      const targetDepts = announcementForm.visibility === "company" 
        ? null 
        : announcementForm.target_departments.length > 0 
          ? announcementForm.target_departments 
          : null;

      if (editingAnnouncement) {
        if (editingAnnouncement.source === "company") {
          const { error } = await supabase
            .from("company_announcements")
            .update({
              title: announcementForm.title,
              content: announcementForm.content,
              priority: announcementForm.priority,
              is_pinned: announcementForm.is_pinned,
              is_active: announcementForm.is_active,
              company_id: announcementForm.company_id,
              publish_at: announcementForm.publish_at || null,
              expire_at: announcementForm.expire_at || null,
            })
            .eq("id", editingAnnouncement.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("intranet_announcements")
            .update({
              title: announcementForm.title,
              content: announcementForm.content,
              announcement_type: announcementForm.announcement_type,
              is_pinned: announcementForm.is_pinned,
              is_published: announcementForm.is_active,
              target_departments: targetDepts,
              updated_at: new Date().toISOString(),
            })
            .eq("id", editingAnnouncement.id);
          if (error) throw error;
        }
        toast.success(t("common.success"));
      } else {
        // New announcements go to company_announcements table
        const { error } = await supabase
          .from("company_announcements")
          .insert({
            title: announcementForm.title,
            content: announcementForm.content,
            priority: announcementForm.priority,
            is_pinned: announcementForm.is_pinned,
            is_active: announcementForm.is_active,
            company_id: announcementForm.company_id,
            publish_at: announcementForm.publish_at || null,
            expire_at: announcementForm.expire_at || null,
            created_by: user.id,
          });
        if (error) throw error;
        toast.success(t("common.success"));
      }
      
      setAnnouncementDialogOpen(false);
      resetAnnouncementForm();
      fetchAllData();
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast.error(t("common.error"));
    }
  };

  const resetAnnouncementForm = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({
      title: "",
      content: "",
      announcement_type: "general",
      priority: "normal",
      is_pinned: false,
      is_active: true,
      requires_acknowledgement: false,
      company_id: "",
      target_departments: [],
      visibility: "company",
      publish_at: "",
      expire_at: "",
    });
  };

  const editAnnouncement = (item: UnifiedAnnouncement) => {
    setEditingAnnouncement(item);
    setAnnouncementForm({
      title: item.title,
      content: item.content,
      announcement_type: item.announcement_type || "general",
      priority: item.priority || "normal",
      is_pinned: item.is_pinned,
      is_active: item.is_active,
      requires_acknowledgement: false,
      company_id: item.company_id || "",
      target_departments: item.target_departments || [],
      visibility: item.target_departments && item.target_departments.length > 0 ? "departments" : "company",
      publish_at: item.publish_at || "",
      expire_at: item.expire_at || "",
    });
    setAnnouncementDialogOpen(true);
  };

  const getDepartmentNames = (deptIds: string[] | null | undefined): string => {
    if (!deptIds || deptIds.length === 0) return t("hrHub.companyComms.companyWide");
    const names = deptIds.map(id => departments.find(d => d.id === id)?.name).filter(Boolean);
    return names.length > 0 ? names.join(", ") : t("hrHub.companyComms.companyWide");
  };

  const toggleDepartment = (deptId: string) => {
    setAnnouncementForm(prev => ({
      ...prev,
      target_departments: prev.target_departments.includes(deptId)
        ? prev.target_departments.filter(id => id !== deptId)
        : [...prev.target_departments, deptId]
    }));
  };

  // Gallery handlers
  const handleSaveGallery = async () => {
    if (!user) return;
    
    try {
      if (editingGallery) {
        const { error } = await supabase
          .from("intranet_gallery")
          .update({
            ...galleryForm,
            description: galleryForm.description || null,
            album_name: galleryForm.album_name || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingGallery.id);
        if (error) throw error;
        toast.success(t("common.success"));
      } else {
        const { error } = await supabase
          .from("intranet_gallery")
          .insert({
            ...galleryForm,
            description: galleryForm.description || null,
            album_name: galleryForm.album_name || null,
            uploaded_by: user.id,
          });
        if (error) throw error;
        toast.success(t("common.success"));
      }
      
      setGalleryDialogOpen(false);
      resetGalleryForm();
      fetchAllData();
    } catch (error) {
      console.error("Error saving gallery item:", error);
      toast.error(t("common.error"));
    }
  };

  const resetGalleryForm = () => {
    setEditingGallery(null);
    setGalleryForm({
      title: "",
      description: "",
      image_url: "",
      album_name: "",
      is_published: true,
    });
  };

  const editGalleryItem = (item: GalleryItem) => {
    setEditingGallery(item);
    setGalleryForm({
      title: item.title,
      description: item.description || "",
      image_url: item.image_url,
      album_name: item.album_name || "",
      is_published: item.is_published,
    });
    setGalleryDialogOpen(true);
  };

  // Blog handlers
  const handleSaveBlog = async () => {
    if (!user) return;
    
    try {
      const tagsArray = blogForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      if (editingBlog) {
        const { error } = await supabase
          .from("intranet_blog_posts")
          .update({
            title: blogForm.title,
            slug: blogForm.slug,
            excerpt: blogForm.excerpt || null,
            content: blogForm.content,
            featured_image_url: blogForm.featured_image_url || null,
            is_published: blogForm.is_published,
            tags: tagsArray,
            published_at: blogForm.is_published && !editingBlog.published_at 
              ? new Date().toISOString() 
              : editingBlog.published_at,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingBlog.id);
        if (error) throw error;
        toast.success(t("common.success"));
      } else {
        const { error } = await supabase
          .from("intranet_blog_posts")
          .insert({
            title: blogForm.title,
            slug: blogForm.slug,
            excerpt: blogForm.excerpt || null,
            content: blogForm.content,
            featured_image_url: blogForm.featured_image_url || null,
            is_published: blogForm.is_published,
            tags: tagsArray,
            author_id: user.id,
            published_at: blogForm.is_published ? new Date().toISOString() : null,
          });
        if (error) throw error;
        toast.success(t("common.success"));
      }
      
      setBlogDialogOpen(false);
      resetBlogForm();
      fetchAllData();
    } catch (error) {
      console.error("Error saving blog post:", error);
      toast.error(t("common.error"));
    }
  };

  const resetBlogForm = () => {
    setEditingBlog(null);
    setBlogForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image_url: "",
      is_published: false,
      tags: "",
    });
  };

  const editBlogPost = (item: BlogPost) => {
    setEditingBlog(item);
    setBlogForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || "",
      content: item.content,
      featured_image_url: item.featured_image_url || "",
      is_published: item.is_published,
      tags: item.tags.join(", "),
    });
    setBlogDialogOpen(true);
  };

  // Delete handler
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      let error;
      if (itemToDelete.type === "announcement") {
        if (itemToDelete.source === "company") {
          ({ error } = await supabase
            .from("company_announcements")
            .delete()
            .eq("id", itemToDelete.id));
        } else {
          ({ error } = await supabase
            .from("intranet_announcements")
            .delete()
            .eq("id", itemToDelete.id));
        }
      } else if (itemToDelete.type === "gallery") {
        ({ error } = await supabase
          .from("intranet_gallery")
          .delete()
          .eq("id", itemToDelete.id));
      } else if (itemToDelete.type === "blog") {
        ({ error } = await supabase
          .from("intranet_blog_posts")
          .delete()
          .eq("id", itemToDelete.id));
      }
      
      if (error) throw error;
      toast.success(t("common.success"));
      fetchAllData();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(t("common.error"));
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const confirmDelete = (type: string, id: string, source?: string) => {
    setItemToDelete({ type, id, source });
    setDeleteDialogOpen(true);
  };

  const filteredAnnouncements = announcements.filter(ann => 
    selectedCompanyFilter === "all" || ann.company_id === selectedCompanyFilter
  );

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    const colors: Record<string, string> = {
      low: "bg-muted text-muted-foreground",
      normal: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
      high: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
      urgent: "bg-destructive/20 text-destructive",
    };
    return <Badge className={colors[priority] || "bg-muted"}>{priority}</Badge>;
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: t("hrHub.title"), href: "/hr-hub" },
            { label: t("hrHub.companyComms.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("hrHub.companyComms.title")}</h1>
            <p className="text-muted-foreground">
              {t("hrHub.companyComms.subtitle")}
            </p>
          </div>
        </div>

        <Tabs defaultValue="announcements" className="space-y-4">
          <TabsList>
            <TabsTrigger value="announcements" className="gap-2">
              <Megaphone className="h-4 w-4" />
              {t("hrHub.companyComms.announcements")}
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <Image className="h-4 w-4" />
              {t("hrHub.companyComms.photoGallery")}
            </TabsTrigger>
            <TabsTrigger value="blog" className="gap-2">
              <FileText className="h-4 w-4" />
              {t("hrHub.companyComms.blogPosts")}
            </TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Select value={selectedCompanyFilter} onValueChange={setSelectedCompanyFilter}>
                <SelectTrigger className="w-[220px]">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t("common.allCompanies")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.allCompanies")}</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={announcementDialogOpen} onOpenChange={(open) => {
                setAnnouncementDialogOpen(open);
                if (!open) resetAnnouncementForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("hrHub.companyComms.newAnnouncement")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAnnouncement ? t("common.edit") : t("common.create")} {t("hrHub.companyComms.announcement")}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("common.company")} <span className="text-destructive">*</span></Label>
                      <Select value={announcementForm.company_id} onValueChange={(v) => setAnnouncementForm({ ...announcementForm, company_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("common.selectCompany")} />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.name")} <span className="text-destructive">*</span></Label>
                      <Input
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                        placeholder={t("hrHub.companyComms.titlePlaceholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.description")} <span className="text-destructive">*</span></Label>
                      <RichTextEditor
                        value={announcementForm.content}
                        onChange={(val) => setAnnouncementForm({ ...announcementForm, content: val })}
                        placeholder={t("hrHub.companyComms.contentPlaceholder")}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("common.type")}</Label>
                        <Select
                          value={announcementForm.announcement_type}
                          onValueChange={(val) => setAnnouncementForm({ ...announcementForm, announcement_type: val })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">{t("hrHub.companyComms.types.general")}</SelectItem>
                            <SelectItem value="urgent">{t("hrHub.companyComms.types.urgent")}</SelectItem>
                            <SelectItem value="event">{t("hrHub.companyComms.types.event")}</SelectItem>
                            <SelectItem value="policy">{t("hrHub.companyComms.types.policy")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("common.priority")}</Label>
                        <Select value={announcementForm.priority} onValueChange={(v) => setAnnouncementForm({ ...announcementForm, priority: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">{t("hrHub.companyComms.priority.low")}</SelectItem>
                            <SelectItem value="normal">{t("hrHub.companyComms.priority.normal")}</SelectItem>
                            <SelectItem value="high">{t("hrHub.companyComms.priority.high")}</SelectItem>
                            <SelectItem value="urgent">{t("hrHub.companyComms.priority.urgent")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("hrHub.companyComms.visibility")}</Label>
                      <Select
                        value={announcementForm.visibility}
                        onValueChange={(val: "company" | "departments") => setAnnouncementForm({ ...announcementForm, visibility: val })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="company">{t("hrHub.companyComms.companyWide")}</SelectItem>
                          <SelectItem value="departments">{t("hrHub.companyComms.specificDepartments")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {announcementForm.visibility === "departments" && (
                      <div className="space-y-2">
                        <Label>{t("hrHub.companyComms.selectDepartments")}</Label>
                        <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                          {departments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
                          ) : (
                            departments.map((dept) => (
                              <div key={dept.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`dept-${dept.id}`}
                                  checked={announcementForm.target_departments.includes(dept.id)}
                                  onCheckedChange={() => toggleDepartment(dept.id)}
                                />
                                <label
                                  htmlFor={`dept-${dept.id}`}
                                  className="text-sm font-medium leading-none cursor-pointer"
                                >
                                  {dept.name} ({dept.code})
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={announcementForm.is_pinned}
                          onCheckedChange={(val) => setAnnouncementForm({ ...announcementForm, is_pinned: val })}
                        />
                        <Label>{t("hrHub.companyComms.pinToTop")}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={announcementForm.is_active}
                          onCheckedChange={(val) => setAnnouncementForm({ ...announcementForm, is_active: val })}
                        />
                        <Label>{t("common.active")}</Label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("hrHub.companyComms.publishAt")}</Label>
                        <Input
                          type="datetime-local"
                          value={announcementForm.publish_at}
                          onChange={(e) => setAnnouncementForm({ ...announcementForm, publish_at: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("hrHub.companyComms.expireAt")}</Label>
                        <Input
                          type="datetime-local"
                          value={announcementForm.expire_at}
                          onChange={(e) => setAnnouncementForm({ ...announcementForm, expire_at: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAnnouncementDialogOpen(false)}>
                      {t("common.cancel")}
                    </Button>
                    <Button onClick={handleSaveAnnouncement}>
                      {editingAnnouncement ? t("common.update") : t("common.create")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">{t("common.loading")}</div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t("common.noData")}</div>
            ) : (
              <div className="grid gap-4">
                {filteredAnnouncements.map((item) => (
                  <Card key={`${item.source}-${item.id}`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {item.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.is_active ? t("common.active") : t("common.inactive")}
                          </Badge>
                          {item.source === "company" ? (
                            <>
                              {getPriorityBadge(item.priority)}
                              {item.company_name && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {item.company_name}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <>
                              {item.announcement_type && (
                                <Badge variant="outline">{item.announcement_type}</Badge>
                              )}
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {getDepartmentNames(item.target_departments)}
                              </Badge>
                            </>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {item.source === "company" ? t("hrHub.companyComms.sourceCompany") : t("hrHub.companyComms.sourceIntranet")}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDateForDisplay(item.created_at, "MMM d, yyyy")}
                          </span>
                        </div>
                        <h3 className="font-medium">{item.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => editAnnouncement(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => confirmDelete("announcement", item.id, item.source)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={galleryDialogOpen} onOpenChange={(open) => {
                setGalleryDialogOpen(open);
                if (!open) resetGalleryForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("hrHub.companyComms.addPhoto")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingGallery ? t("common.edit") : t("common.add")} {t("hrHub.companyComms.photo")}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("common.name")}</Label>
                      <Input
                        value={galleryForm.title}
                        onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                        placeholder={t("hrHub.companyComms.photoTitle")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("hrHub.companyComms.imageUrl")}</Label>
                      <Input
                        value={galleryForm.image_url}
                        onChange={(e) => setGalleryForm({ ...galleryForm, image_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("hrHub.companyComms.albumName")}</Label>
                      <Input
                        value={galleryForm.album_name}
                        onChange={(e) => setGalleryForm({ ...galleryForm, album_name: e.target.value })}
                        placeholder={t("hrHub.companyComms.albumNamePlaceholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.description")}</Label>
                      <Textarea
                        value={galleryForm.description}
                        onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                        placeholder={t("hrHub.companyComms.photoDescription")}
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={galleryForm.is_published}
                        onCheckedChange={(val) => setGalleryForm({ ...galleryForm, is_published: val })}
                      />
                      <Label>{t("hrHub.companyComms.published")}</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setGalleryDialogOpen(false)}>
                      {t("common.cancel")}
                    </Button>
                    <Button onClick={handleSaveGallery}>
                      {editingGallery ? t("common.update") : t("common.add")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {!item.is_published && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary">{t("hrHub.companyComms.draft")}</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <div className="flex justify-end gap-1 mt-2">
                      <Button variant="ghost" size="sm" onClick={() => editGalleryItem(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => confirmDelete("gallery", item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={blogDialogOpen} onOpenChange={(open) => {
                setBlogDialogOpen(open);
                if (!open) resetBlogForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("hrHub.companyComms.newPost")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingBlog ? t("common.edit") : t("common.create")} {t("hrHub.companyComms.blogPost")}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="space-y-2">
                      <Label>{t("common.name")}</Label>
                      <Input
                        value={blogForm.title}
                        onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                        placeholder={t("hrHub.companyComms.postTitle")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("hrHub.companyComms.slug")}</Label>
                      <Input
                        value={blogForm.slug}
                        onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                        placeholder="post-url-slug"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("hrHub.companyComms.featuredImage")}</Label>
                      <Input
                        value={blogForm.featured_image_url}
                        onChange={(e) => setBlogForm({ ...blogForm, featured_image_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("hrHub.companyComms.excerpt")}</Label>
                      <Textarea
                        value={blogForm.excerpt}
                        onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                        placeholder={t("hrHub.companyComms.excerptPlaceholder")}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("hrHub.companyComms.content")}</Label>
                      <Textarea
                        value={blogForm.content}
                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                        placeholder={t("hrHub.companyComms.contentPlaceholder")}
                        rows={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("hrHub.companyComms.tags")}</Label>
                      <Input
                        value={blogForm.tags}
                        onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                        placeholder={t("hrHub.companyComms.tagsPlaceholder")}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={blogForm.is_published}
                        onCheckedChange={(val) => setBlogForm({ ...blogForm, is_published: val })}
                      />
                      <Label>{t("hrHub.companyComms.publishImmediately")}</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBlogDialogOpen(false)}>
                      {t("common.cancel")}
                    </Button>
                    <Button onClick={handleSaveBlog}>
                      {editingBlog ? t("common.update") : t("common.create")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {blogPosts.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={item.is_published ? "default" : "secondary"}>
                          {item.is_published ? t("hrHub.companyComms.published") : t("hrHub.companyComms.draft")}
                        </Badge>
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                        <span className="text-sm text-muted-foreground">
                          {item.view_count} {t("hrHub.companyComms.views")}
                        </span>
                      </div>
                      <h3 className="font-medium">{item.title}</h3>
                      {item.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{item.excerpt}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => editBlogPost(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => confirmDelete("blog", item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete confirmation dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("common.confirm")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("hrHub.companyComms.deleteConfirmation")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>{t("common.delete")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
