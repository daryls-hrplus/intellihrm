import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Megaphone, 
  Image, 
  FileText, 
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Pin,
  PinOff,
  Building2
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { format } from "date-fns";
import { RichTextEditor } from "@/components/intranet/RichTextEditor";

interface Announcement {
  id: string;
  title: string;
  content: string;
  announcement_type: string;
  is_pinned: boolean;
  is_published: boolean;
  published_at: string;
  created_at: string;
  target_departments: string[] | null;
}

interface Department {
  id: string;
  name: string;
  code: string;
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

export default function IntranetAdminPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Announcement form state
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    announcement_type: "general",
    is_pinned: false,
    is_published: true,
    target_departments: [] as string[],
    visibility: "company" as "company" | "departments",
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
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [announcementsRes, galleryRes, blogRes, departmentsRes] = await Promise.all([
        supabase
          .from("intranet_announcements")
          .select("*")
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
          .from("departments")
          .select("id, name, code")
          .eq("is_active", true)
          .order("name"),
      ]);

      if (announcementsRes.data) setAnnouncements(announcementsRes.data);
      if (galleryRes.data) setGallery(galleryRes.data);
      if (blogRes.data) setBlogPosts(blogRes.data);
      if (departmentsRes.data) setDepartments(departmentsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Announcement handlers
  const handleSaveAnnouncement = async () => {
    if (!user) return;
    
    try {
      const targetDepts = announcementForm.visibility === "company" 
        ? null 
        : announcementForm.target_departments.length > 0 
          ? announcementForm.target_departments 
          : null;

      if (editingAnnouncement) {
        const { error } = await supabase
          .from("intranet_announcements")
          .update({
            title: announcementForm.title,
            content: announcementForm.content,
            announcement_type: announcementForm.announcement_type,
            is_pinned: announcementForm.is_pinned,
            is_published: announcementForm.is_published,
            target_departments: targetDepts,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingAnnouncement.id);
        
        if (error) throw error;
        toast.success("Announcement updated");
      } else {
        const { error } = await supabase
          .from("intranet_announcements")
          .insert({
            title: announcementForm.title,
            content: announcementForm.content,
            announcement_type: announcementForm.announcement_type,
            is_pinned: announcementForm.is_pinned,
            is_published: announcementForm.is_published,
            target_departments: targetDepts,
            created_by: user.id,
            published_at: announcementForm.is_published ? new Date().toISOString() : null,
          });
        
        if (error) throw error;
        toast.success("Announcement created");
      }
      
      setAnnouncementDialogOpen(false);
      resetAnnouncementForm();
      fetchAllData();
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast.error("Failed to save announcement");
    }
  };

  const resetAnnouncementForm = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({
      title: "",
      content: "",
      announcement_type: "general",
      is_pinned: false,
      is_published: true,
      target_departments: [],
      visibility: "company",
    });
  };

  const editAnnouncement = (item: Announcement) => {
    setEditingAnnouncement(item);
    setAnnouncementForm({
      title: item.title,
      content: item.content,
      announcement_type: item.announcement_type,
      is_pinned: item.is_pinned,
      is_published: item.is_published,
      target_departments: item.target_departments || [],
      visibility: item.target_departments && item.target_departments.length > 0 ? "departments" : "company",
    });
    setAnnouncementDialogOpen(true);
  };

  const getDepartmentNames = (deptIds: string[] | null): string => {
    if (!deptIds || deptIds.length === 0) return "Company-wide";
    const names = deptIds.map(id => departments.find(d => d.id === id)?.name).filter(Boolean);
    return names.length > 0 ? names.join(", ") : "Company-wide";
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
        toast.success("Gallery item updated");
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
        toast.success("Gallery item added");
      }
      
      setGalleryDialogOpen(false);
      resetGalleryForm();
      fetchAllData();
    } catch (error) {
      console.error("Error saving gallery item:", error);
      toast.error("Failed to save gallery item");
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
        toast.success("Blog post updated");
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
        toast.success("Blog post created");
      }
      
      setBlogDialogOpen(false);
      resetBlogForm();
      fetchAllData();
    } catch (error) {
      console.error("Error saving blog post:", error);
      toast.error("Failed to save blog post");
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
        ({ error } = await supabase
          .from("intranet_announcements")
          .delete()
          .eq("id", itemToDelete.id));
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
      toast.success("Item deleted");
      fetchAllData();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const confirmDelete = (type: string, id: string) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Workforce", href: "/workforce" },
            { label: "Intranet Admin", href: "/workforce/intranet-admin" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Intranet Administration</h1>
            <p className="text-muted-foreground">
              Manage announcements, photo gallery, and blog posts
            </p>
          </div>
        </div>

        <Tabs defaultValue="announcements" className="space-y-4">
          <TabsList>
            <TabsTrigger value="announcements" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <Image className="h-4 w-4" />
              Photo Gallery
            </TabsTrigger>
            <TabsTrigger value="blog" className="gap-2">
              <FileText className="h-4 w-4" />
              Blog Posts
            </TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={announcementDialogOpen} onOpenChange={(open) => {
                setAnnouncementDialogOpen(open);
                if (!open) resetAnnouncementForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                        placeholder="Announcement title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={announcementForm.announcement_type}
                        onValueChange={(val) => setAnnouncementForm({ ...announcementForm, announcement_type: val })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="birthday">Birthday</SelectItem>
                          <SelectItem value="anniversary">Work Anniversary</SelectItem>
                          <SelectItem value="new_child">New Baby</SelectItem>
                          <SelectItem value="marriage">Marriage</SelectItem>
                          <SelectItem value="promotion">Promotion</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <RichTextEditor
                        value={announcementForm.content}
                        onChange={(val) => setAnnouncementForm({ ...announcementForm, content: val })}
                        placeholder="Write your announcement content here..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Visibility</Label>
                      <Select
                        value={announcementForm.visibility}
                        onValueChange={(val: "company" | "departments") => setAnnouncementForm({ ...announcementForm, visibility: val })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="company">Company-wide (Everyone)</SelectItem>
                          <SelectItem value="departments">Specific Departments</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {announcementForm.visibility === "departments" && (
                      <div className="space-y-2">
                        <Label>Select Departments</Label>
                        <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                          {departments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No departments available</p>
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
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {dept.name} ({dept.code})
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                        {announcementForm.target_departments.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {announcementForm.target_departments.length} department(s) selected
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={announcementForm.is_pinned}
                          onCheckedChange={(val) => setAnnouncementForm({ ...announcementForm, is_pinned: val })}
                        />
                        <Label>Pin to top</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={announcementForm.is_published}
                          onCheckedChange={(val) => setAnnouncementForm({ ...announcementForm, is_published: val })}
                        />
                        <Label>Published</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setAnnouncementDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveAnnouncement}>
                        {editingAnnouncement ? "Update" : "Create"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {announcements.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {item.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                        <Badge variant={item.is_published ? "default" : "secondary"}>
                          {item.is_published ? "Published" : "Draft"}
                        </Badge>
                        <Badge variant="outline">{item.announcement_type}</Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {getDepartmentNames(item.target_departments)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(item.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                      <h3 className="font-medium">{item.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => editAnnouncement(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => confirmDelete("announcement", item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                    Add Photo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingGallery ? "Edit Photo" : "Add Photo"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={galleryForm.title}
                        onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                        placeholder="Photo title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        value={galleryForm.image_url}
                        onChange={(e) => setGalleryForm({ ...galleryForm, image_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Album Name (optional)</Label>
                      <Input
                        value={galleryForm.album_name}
                        onChange={(e) => setGalleryForm({ ...galleryForm, album_name: e.target.value })}
                        placeholder="Album name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (optional)</Label>
                      <Textarea
                        value={galleryForm.description}
                        onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                        placeholder="Photo description"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={galleryForm.is_published}
                        onCheckedChange={(val) => setGalleryForm({ ...galleryForm, is_published: val })}
                      />
                      <Label>Published</Label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setGalleryDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveGallery}>
                        {editingGallery ? "Update" : "Add"}
                      </Button>
                    </div>
                  </div>
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
                        <Badge variant="secondary">Draft</Badge>
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
                    New Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingBlog ? "Edit Blog Post" : "New Blog Post"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={blogForm.title}
                        onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                        placeholder="Post title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <Input
                        value={blogForm.slug}
                        onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                        placeholder="post-url-slug"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Featured Image URL (optional)</Label>
                      <Input
                        value={blogForm.featured_image_url}
                        onChange={(e) => setBlogForm({ ...blogForm, featured_image_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Excerpt (optional)</Label>
                      <Textarea
                        value={blogForm.excerpt}
                        onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                        placeholder="Brief summary"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea
                        value={blogForm.content}
                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                        placeholder="Full post content"
                        rows={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tags (comma-separated)</Label>
                      <Input
                        value={blogForm.tags}
                        onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                        placeholder="news, updates, events"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={blogForm.is_published}
                        onCheckedChange={(val) => setBlogForm({ ...blogForm, is_published: val })}
                      />
                      <Label>Publish immediately</Label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setBlogDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveBlog}>
                        {editingBlog ? "Update" : "Create"}
                      </Button>
                    </div>
                  </div>
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
                          {item.is_published ? "Published" : "Draft"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(item.created_at), "MMM d, yyyy")}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          <Eye className="h-3 w-3 inline mr-1" />
                          {item.view_count} views
                        </span>
                      </div>
                      <h3 className="font-medium">{item.title}</h3>
                      {item.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
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

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this item.
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
      </div>
    </AppLayout>
  );
}
