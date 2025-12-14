import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Book,
  Search,
  ChevronRight,
  FileText,
  Eye,
  ThumbsUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { markdownToHtml } from "@/lib/utils/markdown";

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
  content: string;
  category_id: string | null;
  view_count: number;
  helpful_count: number;
  is_featured: boolean;
}

export default function KnowledgeBasePage() {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category");

  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<KBCategory | null>(null);
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categorySlug && categories.length > 0) {
      const category = categories.find((c) => c.slug === categorySlug);
      if (category) {
        setSelectedCategory(category);
        fetchArticlesByCategory(category.id);
      }
    } else {
      setSelectedCategory(null);
      setArticles([]);
    }
  }, [categorySlug, categories]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("kb_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    if (data) setCategories(data);
    setLoading(false);
  };

  const fetchArticlesByCategory = async (categoryId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("kb_articles")
      .select("*")
      .eq("is_published", true)
      .eq("category_id", categoryId)
      .order("title");

    if (data) setArticles(data);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    let query = supabase
      .from("kb_articles")
      .select("*")
      .eq("is_published", true)
      .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);

    if (selectedCategory) {
      query = query.eq("category_id", selectedCategory.id);
    }

    const { data } = await query.limit(20);
    if (data) setArticles(data);
    setLoading(false);
  };

  const handleArticleClick = async (article: KBArticle) => {
    setSelectedArticle(article);
    // Increment view count
    await supabase
      .from("kb_articles")
      .update({ view_count: article.view_count + 1 })
      .eq("id", article.id);
  };

  const handleHelpful = async (helpful: boolean) => {
    if (!selectedArticle) return;
    
    if (helpful) {
      await supabase
        .from("kb_articles")
        .update({ helpful_count: selectedArticle.helpful_count + 1 })
        .eq("id", selectedArticle.id);
    } else {
      await supabase
        .from("kb_articles")
        .update({ not_helpful_count: (selectedArticle as any).not_helpful_count + 1 })
        .eq("id", selectedArticle.id);
    }
  };

  // Memoize the HTML content conversion
  const articleHtml = useMemo(() => {
    if (!selectedArticle) return '';
    return markdownToHtml(selectedArticle.content);
  }, [selectedArticle]);

  // Article Detail View
  if (selectedArticle) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedArticle(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedArticle.title}</CardTitle>
                  {selectedArticle.excerpt && (
                    <CardDescription className="mt-2">{selectedArticle.excerpt}</CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {selectedArticle.view_count} views
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {selectedArticle.helpful_count} helpful
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: articleHtml }}
              />

              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-3">Was this article helpful?</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleHelpful(true)}>
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Yes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleHelpful(false)}>
                    No
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/help">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Help Center
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                {selectedCategory ? selectedCategory.name : "Knowledge Base"}
              </h1>
              {selectedCategory?.description && (
                <p className="text-muted-foreground">{selectedCategory.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${selectedCategory ? selectedCategory.name : "articles"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="p-4 pt-0 space-y-1">
                  <Link
                    to="/help/knowledge-base"
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      !categorySlug ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    <Book className="h-4 w-4" />
                    <span className="text-sm">All Categories</span>
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/help/knowledge-base?category=${category.slug}`}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        categorySlug === category.slug
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Book className="h-4 w-4" />
                      <span className="text-sm">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Articles List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedCategory ? `${selectedCategory.name} Articles` : "Browse Categories"}
                </CardTitle>
                <CardDescription>
                  {selectedCategory
                    ? `${articles.length} article${articles.length !== 1 ? "s" : ""} available`
                    : "Select a category to view articles"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : selectedCategory ? (
                  articles.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No articles found in this category
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {articles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => handleArticleClick(article)}
                          className="w-full flex items-center justify-between p-4 rounded-lg border hover:bg-muted transition-colors text-left"
                        >
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">{article.title}</p>
                              {article.excerpt && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {article.excerpt}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {article.view_count}
                                </span>
                                {article.is_featured && (
                                  <Badge variant="secondary" className="text-xs">Featured</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                        </button>
                      ))}
                    </div>
                  )
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
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {category.description}
                            </p>
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
        </div>
      </div>
    </AppLayout>
  );
}
