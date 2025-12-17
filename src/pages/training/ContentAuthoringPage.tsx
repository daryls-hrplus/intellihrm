import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PenTool, 
  Search, 
  Plus,
  FileText,
  Video,
  FileQuestion,
  Image,
  Layout,
  Clock,
  Eye,
  Edit,
  Trash2,
  Copy,
  MoreVertical,
  BookOpen,
  Layers,
  Upload,
  Wand2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContentItem {
  id: string;
  title: string;
  type: "course" | "module" | "quiz" | "video" | "document" | "scorm";
  status: "draft" | "review" | "published" | "archived";
  author: string;
  lastModified: string;
  duration?: string;
  views?: number;
}

const mockContent: ContentItem[] = [
  {
    id: "1",
    title: "Onboarding Essentials Course",
    type: "course",
    status: "published",
    author: "Sarah Johnson",
    lastModified: "2025-01-10",
    duration: "2h 30m",
    views: 1250,
  },
  {
    id: "2",
    title: "Safety Procedures Module",
    type: "module",
    status: "published",
    author: "Michael Chen",
    lastModified: "2025-01-08",
    duration: "45m",
    views: 890,
  },
  {
    id: "3",
    title: "Compliance Assessment Quiz",
    type: "quiz",
    status: "review",
    author: "Emily Davis",
    lastModified: "2025-01-12",
  },
  {
    id: "4",
    title: "Leadership Training Video",
    type: "video",
    status: "draft",
    author: "James Wilson",
    lastModified: "2025-01-14",
    duration: "15m",
  },
  {
    id: "5",
    title: "Employee Handbook",
    type: "document",
    status: "published",
    author: "HR Team",
    lastModified: "2025-01-05",
    views: 2100,
  },
  {
    id: "6",
    title: "Product Training SCORM Package",
    type: "scorm",
    status: "published",
    author: "Training Team",
    lastModified: "2025-01-03",
    duration: "1h",
    views: 560,
  },
];

const templates = [
  { id: "1", name: "Course Template", icon: BookOpen, description: "Multi-module course structure" },
  { id: "2", name: "Quick Lesson", icon: FileText, description: "Single topic lesson" },
  { id: "3", name: "Assessment", icon: FileQuestion, description: "Quiz or test template" },
  { id: "4", name: "Video Lesson", icon: Video, description: "Video-based learning" },
  { id: "5", name: "Interactive Module", icon: Layers, description: "Interactive content with activities" },
  { id: "6", name: "SCORM Import", icon: Upload, description: "Import SCORM package" },
];

export default function ContentAuthoringPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("content");

  const getTypeBadge = (type: ContentItem["type"]) => {
    const typeConfig = {
      course: { label: t("training.contentAuthoring.types.course"), variant: "default" as const },
      module: { label: t("training.contentAuthoring.types.module"), variant: "secondary" as const },
      quiz: { label: t("training.contentAuthoring.types.quiz"), variant: "outline" as const },
      video: { label: t("training.contentAuthoring.types.video"), variant: "secondary" as const },
      document: { label: t("training.contentAuthoring.types.document"), variant: "outline" as const },
      scorm: { label: t("training.contentAuthoring.types.scorm"), variant: "secondary" as const },
    };
    return <Badge variant={typeConfig[type].variant}>{typeConfig[type].label}</Badge>;
  };

  const getStatusBadge = (status: ContentItem["status"]) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">{t("training.contentAuthoring.status.draft")}</Badge>;
      case "review":
        return <Badge className="bg-warning text-warning-foreground">{t("training.contentAuthoring.status.review")}</Badge>;
      case "published":
        return <Badge className="bg-success text-success-foreground">{t("training.contentAuthoring.status.published")}</Badge>;
      case "archived":
        return <Badge variant="outline">{t("training.contentAuthoring.status.archived")}</Badge>;
    }
  };

  const getTypeIcon = (type: ContentItem["type"]) => {
    switch (type) {
      case "course":
        return <BookOpen className="h-5 w-5" />;
      case "module":
        return <Layers className="h-5 w-5" />;
      case "quiz":
        return <FileQuestion className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "document":
        return <FileText className="h-5 w-5" />;
      case "scorm":
        return <Upload className="h-5 w-5" />;
    }
  };

  const filteredContent = mockContent.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: mockContent.length,
    published: mockContent.filter(c => c.status === "published").length,
    draft: mockContent.filter(c => c.status === "draft").length,
    inReview: mockContent.filter(c => c.status === "review").length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("training.dashboard.title"), href: "/training" },
            { label: t("training.modules.contentAuthoring.title") },
          ]}
        />
        
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <PenTool className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t("training.modules.contentAuthoring.title")}
                </h1>
                <p className="text-muted-foreground">
                  {t("training.modules.contentAuthoring.description")}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Wand2 className="h-4 w-4 mr-2" />
                {t("training.contentAuthoring.aiAssist")}
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("training.contentAuthoring.createContent")}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("training.contentAuthoring.stats.totalContent")}</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("training.contentAuthoring.stats.published")}</p>
                  <p className="text-2xl font-bold">{stats.published}</p>
                </div>
                <Eye className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("training.contentAuthoring.stats.drafts")}</p>
                  <p className="text-2xl font-bold">{stats.draft}</p>
                </div>
                <Edit className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("training.contentAuthoring.stats.inReview")}</p>
                  <p className="text-2xl font-bold">{stats.inReview}</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="content">{t("training.contentAuthoring.tabs.myContent")}</TabsTrigger>
            <TabsTrigger value="templates">{t("training.contentAuthoring.tabs.templates")}</TabsTrigger>
            <TabsTrigger value="media">{t("training.contentAuthoring.tabs.mediaLibrary")}</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("training.contentAuthoring.searchContent")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {filteredContent.map((item) => (
                <Card key={item.id} className="animate-slide-up">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <CardDescription>
                            {t("training.contentAuthoring.by")} {item.author} • {t("training.contentAuthoring.modified")} {item.lastModified}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTypeBadge(item.type)}
                        {getStatusBadge(item.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              {t("common.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              {t("training.contentAuthoring.preview")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              {t("training.contentAuthoring.duplicate")}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t("common.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {item.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {item.duration}
                        </div>
                      )}
                      {item.views !== undefined && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {item.views.toLocaleString()} {t("training.contentAuthoring.views")}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredContent.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">{t("training.contentAuthoring.noContent")}</h3>
                    <p className="text-muted-foreground mt-1">
                      {t("training.contentAuthoring.noContentDesc")}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => {
                const Icon = template.icon;
                return (
                  <Card key={template.id} className="cursor-pointer hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        {t("training.contentAuthoring.useTemplate")}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("training.contentAuthoring.searchMedia")}
                  className="pl-10"
                />
              </div>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                {t("training.contentAuthoring.uploadMedia")}
              </Button>
            </div>

            <Card>
              <CardContent className="py-12 text-center">
                <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">{t("training.contentAuthoring.mediaLibrary")}</h3>
                <p className="text-muted-foreground mt-1">
                  {t("training.contentAuthoring.mediaLibraryDesc")}
                </p>
                <Button className="mt-4">
                  <Upload className="h-4 w-4 mr-2" />
                  {t("training.contentAuthoring.uploadFirst")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
