import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

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

export default function HelpCenterPage() {
  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<KBArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KBArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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

  const quickLinks = [
    { title: "Getting Started", description: "Learn the basics of the HRIS", icon: Book, href: "/help/knowledge-base" },
    { title: "AI Assistant", description: "Get instant help from our AI", icon: Sparkles, href: "/help/chat" },
    { title: "Submit a Ticket", description: "Report an issue or request", icon: Ticket, href: "/help/tickets/new" },
    { title: "My Tickets", description: "View your support tickets", icon: MessageSquare, href: "/help/tickets" },
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
              Find answers, get support, and learn how to make the most of your HRIS
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
                  <Link
                    key={article.id}
                    to={`/help/article/${article.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
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
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <link.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{link.title}</h3>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Browse by Category</CardTitle>
                <CardDescription>Find help articles organized by topic</CardDescription>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No categories available yet. Check back soon!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/help/knowledge-base?category=${category.slug}`}
                        className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Book className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{category.name}</p>
                          {category.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{category.description}</p>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Featured Articles */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Popular Articles</CardTitle>
                <CardDescription>Most viewed help content</CardDescription>
              </CardHeader>
              <CardContent>
                {featuredArticles.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground text-sm">
                    No featured articles yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {featuredArticles.map((article) => (
                      <Link
                        key={article.id}
                        to={`/help/article/${article.slug}`}
                        className="block p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <p className="font-medium text-sm hover:text-primary">{article.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {article.view_count} views
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Chat CTA */}
            <Card className="mt-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Need Quick Help?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Chat with our AI assistant for instant answers
                    </p>
                    <Link to="/help/chat">
                      <Button variant="link" className="px-0 mt-2">
                        Start Chat <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
