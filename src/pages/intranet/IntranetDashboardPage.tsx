import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Megaphone, 
  Image, 
  FileText, 
  Pin, 
  Calendar,
  User,
  ChevronRight,
  Eye
} from "lucide-react";
import { format } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  content: string;
  announcement_type: string;
  is_pinned: boolean;
  published_at: string;
  created_by: string;
}

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  album_name: string | null;
  created_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string;
  author_id: string;
  view_count: number;
}

export default function IntranetDashboardPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntranetData();
  }, []);

  const fetchIntranetData = async () => {
    try {
      const [announcementsRes, galleryRes, blogRes] = await Promise.all([
        supabase
          .from("intranet_announcements")
          .select("*")
          .eq("is_published", true)
          .order("is_pinned", { ascending: false })
          .order("published_at", { ascending: false })
          .limit(10),
        supabase
          .from("intranet_gallery")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("intranet_blog_posts")
          .select("*")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(5),
      ]);

      if (announcementsRes.data) setAnnouncements(announcementsRes.data);
      if (galleryRes.data) setGallery(galleryRes.data);
      if (blogRes.data) setBlogPosts(blogRes.data);
    } catch (error) {
      console.error("Error fetching intranet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAnnouncementTypeBadge = (type: string) => {
    const types: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      general: { label: "General", variant: "default" },
      birthday: { label: "Birthday", variant: "secondary" },
      anniversary: { label: "Anniversary", variant: "secondary" },
      new_child: { label: "New Baby", variant: "secondary" },
      marriage: { label: "Marriage", variant: "secondary" },
      promotion: { label: "Promotion", variant: "default" },
      event: { label: "Event", variant: "outline" },
      urgent: { label: "Urgent", variant: "destructive" },
    };
    const config = types[type] || types.general;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "HR Intranet", href: "/intranet" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">HR Intranet</h1>
            <p className="text-muted-foreground">
              Company news, announcements, and updates
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
              Blog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-4">
            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                      <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                      <div className="h-4 bg-muted rounded w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Announcements</h3>
                  <p className="text-muted-foreground">
                    There are no announcements at this time.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {announcements.map((announcement) => (
                  <Card key={announcement.id} className={announcement.is_pinned ? "border-primary" : ""}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {announcement.is_pinned && (
                              <Pin className="h-4 w-4 text-primary" />
                            )}
                            {getAnnouncementTypeBadge(announcement.announcement_type)}
                            <span className="text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {format(new Date(announcement.published_at), "MMM d, yyyy")}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{announcement.title}</h3>
                          <p className="text-muted-foreground line-clamp-3">
                            {announcement.content}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Read More
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : gallery.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Photos</h3>
                  <p className="text-muted-foreground">
                    The photo gallery is empty.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gallery.map((item) => (
                  <Card key={item.id} className="overflow-hidden group cursor-pointer">
                    <div className="aspect-square relative">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <div className="text-white">
                          <p className="font-medium text-sm">{item.title}</p>
                          {item.album_name && (
                            <p className="text-xs text-white/70">{item.album_name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="blog" className="space-y-4">
            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6 flex gap-4">
                      <div className="w-32 h-24 bg-muted rounded" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                        <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-4 bg-muted rounded w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : blogPosts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Blog Posts</h3>
                  <p className="text-muted-foreground">
                    There are no blog posts published yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {blogPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardContent className="p-6 flex gap-4">
                      {post.featured_image_url && (
                        <div className="w-32 h-24 flex-shrink-0">
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {post.published_at && format(new Date(post.published_at), "MMM d, yyyy")}
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.view_count} views
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{post.title}</h3>
                        {post.excerpt && (
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="self-center">
                        Read
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
