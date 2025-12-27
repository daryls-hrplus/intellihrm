import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Megaphone, 
  Image, 
  FileText, 
  Pin, 
  Calendar,
  ChevronRight,
  Eye,
  Maximize2,
  Newspaper,
  Loader2
} from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface IntranetOverlayPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export function IntranetOverlayPanel({ isOpen, onClose }: IntranetOverlayPanelProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("announcements");

  useEffect(() => {
    if (isOpen) {
      fetchIntranetData();
    }
  }, [isOpen]);

  const fetchIntranetData = async () => {
    setLoading(true);
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

  const handleOpenFullPage = () => {
    onClose();
    navigate("/intranet");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-4 border-b space-y-1">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              HR Intranet
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={handleOpenFullPage}>
              <Maximize2 className="h-4 w-4 mr-1" />
              Full Page
            </Button>
          </div>
          <SheetDescription>
            Company news, announcements, and updates
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col overflow-hidden p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="announcements" className="gap-1 text-xs">
                <Megaphone className="h-3 w-3" />
                News
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-1 text-xs">
                <Image className="h-3 w-3" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="blog" className="gap-1 text-xs">
                <FileText className="h-3 w-3" />
                Blog
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <TabsContent value="announcements" className="space-y-3 mt-0">
                    {announcements.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                          <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No announcements at this time</p>
                        </CardContent>
                      </Card>
                    ) : (
                      announcements.map((announcement) => (
                        <Card key={announcement.id} className={announcement.is_pinned ? "border-primary" : ""}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-2 mb-2">
                              {announcement.is_pinned && (
                                <Pin className="h-4 w-4 text-primary shrink-0" />
                              )}
                              {getAnnouncementTypeBadge(announcement.announcement_type)}
                              <span className="text-xs text-muted-foreground ml-auto">
                                {formatDateForDisplay(announcement.published_at, "MMM d")}
                              </span>
                            </div>
                            <h3 className="font-semibold text-sm mb-1">{announcement.title}</h3>
                            <div 
                              className="text-xs text-muted-foreground line-clamp-2"
                              dangerouslySetInnerHTML={{ __html: announcement.content }}
                            />
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="gallery" className="mt-0">
                    {gallery.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                          <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No photos available</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {gallery.map((item) => (
                          <Card key={item.id} className="overflow-hidden group cursor-pointer">
                            <div className="aspect-square relative">
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                <p className="text-white text-xs font-medium truncate">{item.title}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="blog" className="space-y-3 mt-0">
                    {blogPosts.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No blog posts available</p>
                        </CardContent>
                      </Card>
                    ) : (
                      blogPosts.map((post) => (
                        <Card key={post.id} className="overflow-hidden">
                          <CardContent className="p-4 flex gap-3">
                            {post.featured_image_url && (
                              <div className="w-16 h-12 flex-shrink-0">
                                <img
                                  src={post.featured_image_url}
                                  alt={post.title}
                                  className="w-full h-full object-cover rounded"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {post.published_at && formatDateForDisplay(post.published_at, "MMM d")}
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {post.view_count}
                                </span>
                              </div>
                              <h3 className="text-sm font-semibold line-clamp-1">{post.title}</h3>
                              {post.excerpt && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {post.excerpt}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </>
              )}
            </ScrollArea>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
