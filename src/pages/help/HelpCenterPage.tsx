import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Video,
  FileQuestion,
  Lightbulb,
  ClipboardList,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";

interface KBArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category_id: string | null;
  is_featured: boolean;
  view_count: number;
}

export default function HelpCenterPage() {
  const [featuredArticles, setFeaturedArticles] = useState<KBArticle[]>([]);
  const [articleCount, setArticleCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KBArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { navigateToList, navigateToRecord } = useWorkspaceNavigation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [articlesRes, countRes] = await Promise.all([
      // Only get featured articles that are published FROM manuals
      supabase
        .from("kb_articles")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .not("source_manual_id", "is", null)
        .limit(5),
      // Only count articles published FROM manuals
      supabase
        .from("kb_articles")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true)
        .not("source_manual_id", "is", null),
    ]);

    if (articlesRes.data) setFeaturedArticles(articlesRes.data);
    if (countRes.count !== null) setArticleCount(countRes.count);
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
      .not("source_manual_id", "is", null) // Only manual-published content
      .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
      .limit(10);

    setSearchResults(data || []);
    setIsSearching(false);
  };

  const handleNavigate = (route: string, title: string) => {
    navigateToList({
      route,
      title,
      moduleCode: "help",
    });
  };

  const handleArticleClick = (article: KBArticle) => {
    navigateToRecord({
      route: `/help/article/${article.slug}`,
      title: article.title,
      subtitle: "Article",
      moduleCode: "help",
      contextType: "kb_article",
      contextId: article.id,
      icon: FileText,
    });
  };

  const resourceCategories = [
    { 
      title: "Knowledge Base", 
      description: "Browse all help articles", 
      icon: Book, 
      href: "/help/kb",
      badge: articleCount > 0 ? `${articleCount} articles` : undefined,
    },
    { 
      title: "Video Tutorials", 
      description: "Step-by-step video guides", 
      icon: Video, 
      href: "/help/kb?category=training-learning",
    },
    { 
      title: "Getting Started", 
      description: "New user guides and onboarding", 
      icon: Lightbulb, 
      href: "/help/kb?category=getting-started",
    },
    { 
      title: "FAQs", 
      description: "Frequently asked questions", 
      icon: FileQuestion, 
      href: "/help/kb?category=hr-hub",
    },
    { 
      title: "Release Notes", 
      description: "Latest updates and features", 
      icon: ClipboardList, 
      href: "/help/kb?category=admin-security",
    },
    { 
      title: "My Tickets", 
      description: "View your support tickets", 
      icon: MessageSquare, 
      href: "/help/tickets",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-8 md:p-12">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              Find answers, get support, and learn how to make the most of Intelli HRM
            </p>

            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button onClick={handleSearch} size="lg" disabled={isSearching}>
                Search
              </Button>
            </div>
          </div>

          {/* Decorative */}
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
            <div className="absolute inset-0 bg-gradient-to-l from-primary/20 to-transparent" />
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>{searchResults.length} articles found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {searchResults.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => handleArticleClick(article)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{article.title}</p>
                        {article.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{article.excerpt}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Primary Actions - AI Chat + Submit Ticket */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AI Assistant Card */}
          <Card 
            className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => handleNavigate("/help/chat", "AI Assistant")}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">AI Assistant</h3>
                  <p className="text-muted-foreground mt-1">
                    Get instant answers to your questions from our intelligent assistant
                  </p>
                  <Button variant="link" className="px-0 mt-2 group-hover:gap-2 transition-all">
                    Start Chat <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Ticket Card */}
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => handleNavigate("/help/tickets/new", "Submit Ticket")}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary group-hover:bg-secondary/80 transition-colors">
                  <Ticket className="h-7 w-7 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Submit a Ticket</h3>
                  <p className="text-muted-foreground mt-1">
                    Report an issue or request help from our support team
                  </p>
                  <Button variant="link" className="px-0 mt-2 group-hover:gap-2 transition-all">
                    Create Ticket <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Resources */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Help Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resourceCategories.map((resource) => (
              <Card 
                key={resource.title}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleNavigate(resource.href, resource.title)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <resource.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{resource.title}</h3>
                        {resource.badge && (
                          <Badge variant="secondary" className="text-xs">{resource.badge}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Section: Popular Articles + Need More Help */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Popular Articles */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Popular Articles</CardTitle>
              <CardDescription>Most viewed help content</CardDescription>
            </CardHeader>
            <CardContent>
              {featuredArticles.length === 0 ? (
                <div className="text-center py-8">
                  <Book className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No articles published yet. Content will appear here once published from the Enablement Center.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {featuredArticles.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => handleArticleClick(article)}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors w-full text-left"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium hover:text-primary">{article.title}</p>
                          {article.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{article.excerpt}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {article.view_count} views
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Still Need Help */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Still Need Help?</CardTitle>
              <CardDescription>Can't find what you're looking for?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full justify-start gap-2" 
                onClick={() => handleNavigate("/help/chat", "AI Assistant")}
              >
                <Sparkles className="h-4 w-4" />
                Chat with AI
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => handleNavigate("/help/tickets/new", "Submit Ticket")}
              >
                <Ticket className="h-4 w-4" />
                Submit a Ticket
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                onClick={() => handleNavigate("/help/tickets", "My Tickets")}
              >
                <MessageSquare className="h-4 w-4" />
                View My Tickets
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
