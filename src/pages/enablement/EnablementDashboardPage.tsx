import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Camera, 
  FileText, 
  Video, 
  Download, 
  Sparkles,
  FileCheck,
  Users,
  Building,
  FolderTree
} from "lucide-react";

export default function EnablementDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tools = [
    {
      title: "Feature Catalog",
      description: "Browse all HRplus Cerebra modules, features, and capabilities in one place.",
      icon: FolderTree,
      href: "/enablement/feature-catalog",
      badge: "Registry"
    },
    {
      title: "Application Docs Generator",
      description: "Generate module overviews, feature tutorials, and quick reference guides using AI.",
      icon: BookOpen,
      href: "/enablement/docs-generator",
      badge: "AI-Powered"
    },
    {
      title: "Visual Tutorial Builder",
      description: "Capture screenshots, add annotations, and create step-by-step visual guides.",
      icon: Camera,
      href: "/enablement/visual-builder",
      badge: "Screenshots"
    },
    {
      title: "Video Storyboard Generator",
      description: "Generate video scripts and storyboards for training video production.",
      icon: Video,
      href: "/enablement/video-storyboard",
      badge: "AI-Powered"
    },
    {
      title: "Client Documentation",
      description: "Create customized documentation packages for client implementations.",
      icon: Building,
      href: "/enablement/client-docs",
      badge: "Export"
    },
    {
      title: "Knowledge Base Articles",
      description: "Generate and publish articles directly to the Knowledge Base.",
      icon: FileText,
      href: "/enablement/kb-generator",
      badge: "Publish"
    },
    {
      title: "Training Course Builder",
      description: "Create training courses from generated content and publish to LMS.",
      icon: FileCheck,
      href: "/enablement/course-builder",
      badge: "LMS"
    }
  ];

  const stats = [
    { label: "Modules Documented", value: "12", icon: BookOpen },
    { label: "Tutorials Created", value: "48", icon: FileText },
    { label: "Screenshots Captured", value: "156", icon: Camera },
    { label: "Client Exports", value: "8", icon: Download }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enablement Center</h1>
          <p className="text-muted-foreground">
            AI-powered documentation and training content generation for HRplus Cerebra
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Sparkles className="h-3 w-3" />
          Internal Use Only
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tools Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Documentation Tools</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Card 
              key={tool.title} 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => navigate(tool.href)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <tool.icon className="h-8 w-8 text-primary" />
                  <Badge variant="secondary">{tool.badge}</Badge>
                </div>
                <CardTitle className="mt-4">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Open Tool
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate("/enablement/docs-generator")}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Module Overview
          </Button>
          <Button variant="outline" onClick={() => navigate("/enablement/visual-builder")}>
            <Camera className="h-4 w-4 mr-2" />
            Capture Screenshot
          </Button>
          <Button variant="outline" onClick={() => navigate("/enablement/client-docs")}>
            <Download className="h-4 w-4 mr-2" />
            Create Client Export
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest documentation and content generation activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            No recent activity. Start by generating documentation for a module.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
