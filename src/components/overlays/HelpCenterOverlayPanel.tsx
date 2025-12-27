import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  HelpCircle,
  Book,
  MessageSquare,
  Ticket,
  Search,
  ChevronRight,
  FileText,
  Sparkles,
  ArrowRight,
  Calendar,
  Users,
  Clock,
  Shield,
  Heart,
  UserPlus,
  DollarSign,
  Target,
  GraduationCap,
  Package,
  Briefcase,
  TrendingUp,
  ClipboardList,
  Video,
  FileQuestion,
  Lightbulb,
  UserCircle,
  UserCog,
  Maximize2,
  X,
} from "lucide-react";

interface HelpCenterOverlayPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface KBCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

interface KBArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category_id: string | null;
  is_featured: boolean;
  view_count: number;
}

const categoryIcons: Record<string, React.ElementType> = {
  "hr-hub": Briefcase,
  "ess": UserCircle,
  "mss": UserCog,
  "workforce": Users,
  "time-attendance": Clock,
  "leave-management": Calendar,
  "payroll-compensation": DollarSign,
  "benefits": Heart,
  "performance-management": Target,
  "training-learning": GraduationCap,
  "succession-planning": TrendingUp,
  "recruitment": UserPlus,
  "health-safety": Shield,
  "employee-relations": Users,
  "company-property": Package,
  "policies-compliance": FileText,
  "admin-security": Shield,
};

export function HelpCenterOverlayPanel({ isOpen, onClose }: HelpCenterOverlayPanelProps) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<KBArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KBArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    const [categoriesRes, articlesRes] = await Promise.all([
      supabase.from("kb_categories").select("*").eq("is_active", true).order("display_order"),
      supabase.from("kb_articles").select("*").eq("is_published", true).eq("is_featured", true).limit(5),
    ]);

    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (articlesRes.data) setFeaturedArticles(articlesRes.data);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const { data } = await supabase
      .from("kb_articles")
      .select("*")
      .eq("is_published", true)
      .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
      .limit(10);

    setSearchResults(data || []);
    setIsSearching(false);
  };

  const handleOpenFullPage = () => {
    onClose();
    navigate("/help");
  };

  const handleLinkClick = (href: string) => {
    onClose();
    navigate(href);
  };

  const quickLinks = [
    { title: "Knowledge Base", description: "Browse all help articles", icon: Book, href: "/help/knowledge-base" },
    { title: "AI Assistant", description: "Get instant help from our AI", icon: Sparkles, href: "/help/chat" },
    { title: "Submit a Ticket", description: "Report an issue or request", icon: Ticket, href: "/help/tickets/new" },
    { title: "My Tickets", description: "View your support tickets", icon: MessageSquare, href: "/help/tickets" },
  ];

  const getCategoryIcon = (slug: string) => {
    return categoryIcons[slug] || Book;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Help Center
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleOpenFullPage}>
                <Maximize2 className="h-4 w-4 mr-1" />
                Full Page
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                Search
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Search Results</CardTitle>
                  <CardDescription>{searchResults.length} articles found</CardDescription>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-1">
                    {searchResults.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => handleLinkClick(`/help/article/${article.slug}`)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors w-full text-left"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{article.title}</p>
                            {article.excerpt && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{article.excerpt}</p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Quick Access</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleLinkClick(link.href)}
                    className="text-left"
                  >
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <link.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{link.title}</h4>
                            <p className="text-xs text-muted-foreground">{link.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Browse by Module</h3>
              {categories.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground text-sm">
                  No categories available yet
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(0, 8).map((category) => {
                    const IconComponent = getCategoryIcon(category.slug);
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleLinkClick(`/help/knowledge-base?category=${category.slug}`)}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <IconComponent className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{category.name}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
              {categories.length > 8 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleLinkClick("/help/knowledge-base")}
                >
                  View all categories
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>

            {/* Popular Articles */}
            {featuredArticles.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Popular Articles</h3>
                <Card>
                  <CardContent className="p-2">
                    <div className="space-y-1">
                      {featuredArticles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => handleLinkClick(`/help/article/${article.slug}`)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors w-full text-left"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium text-sm">{article.title}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {article.view_count} views
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* AI Chat CTA */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Need Quick Help?</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Chat with our AI assistant for instant answers
                    </p>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleLinkClick("/help/chat")}
                  >
                    Start Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
