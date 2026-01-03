import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useContextualHelpVideos,
  useHelpVideoCategories,
  useHelpVideosByCategory,
  useSearchHelpVideos,
  useRecentlyWatchedVideos,
  formatDuration,
} from "@/hooks/useHelpVideos";
import { HelpVideoPlayer } from "./HelpVideoPlayer";
import {
  Search,
  Sparkles,
  Clock,
  PlayCircle,
  Folder,
  Loader2,
  X,
} from "lucide-react";

interface HelpVideoPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface HelpVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  difficulty_level: string;
  category: { name: string; icon_name: string | null } | null;
}

export function HelpVideoPanel({ open, onOpenChange }: HelpVideoPanelProps) {
  const [activeTab, setActiveTab] = useState("contextual");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<HelpVideo | null>(null);

  const { data: contextualData, isLoading: contextualLoading } = useContextualHelpVideos();
  const { data: categories } = useHelpVideoCategories();
  const { data: categoryVideos, isLoading: categoryLoading } = useHelpVideosByCategory(selectedCategory);
  const { data: recentVideos } = useRecentlyWatchedVideos();
  const searchMutation = useSearchHelpVideos();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery);
    }
  };

  const renderVideoCard = (video: HelpVideo) => (
    <div
      key={video.id}
      className="group cursor-pointer rounded-lg border border-border bg-card p-3 hover:border-primary/50 hover:bg-muted/50 transition-colors"
      onClick={() => setSelectedVideo(video)}
    >
      <div className="flex gap-3">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="h-16 w-28 rounded object-cover bg-muted"
          />
        ) : (
          <div className="h-16 w-28 rounded bg-muted flex items-center justify-center">
            <PlayCircle className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            {video.category && (
              <Badge variant="outline" className="text-xs">
                {video.category.name}
              </Badge>
            )}
            {video.duration_seconds && (
              <span className="text-xs text-muted-foreground">
                {formatDuration(video.duration_seconds)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-primary" />
              Help Videos
            </SheetTitle>
          </SheetHeader>

          <div className="p-4 border-b">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search help videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-20"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                disabled={searchMutation.isPending}
              >
                {searchMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </form>
          </div>

          {/* Search Results */}
          {searchMutation.data && (
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">
                  Search Results ({searchMutation.data.videos.length})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => searchMutation.reset()}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchMutation.data.videos.length > 0 ? (
                  searchMutation.data.videos.map(renderVideoCard)
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No videos found for "{searchQuery}"
                  </p>
                )}
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="contextual"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                For You
              </TabsTrigger>
              <TabsTrigger
                value="browse"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Folder className="h-4 w-4 mr-1" />
                Browse
              </TabsTrigger>
              <TabsTrigger
                value="recent"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Clock className="h-4 w-4 mr-1" />
                Recent
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(100vh-280px)]">
              {/* Contextual Tab */}
              <TabsContent value="contextual" className="p-4 space-y-3 mt-0">
                {contextualLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : contextualData?.videos && contextualData.videos.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Recommended based on your current page
                    </p>
                    {contextualData.videos.map(renderVideoCard)}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No specific recommendations for this page.
                      <br />
                      Try browsing categories or searching.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Browse Tab */}
              <TabsContent value="browse" className="p-4 mt-0">
                {!selectedCategory ? (
                  <div className="grid grid-cols-2 gap-3">
                    {categories?.map((cat) => (
                      <div
                        key={cat.id}
                        className="cursor-pointer rounded-lg border border-border bg-card p-4 hover:border-primary/50 hover:bg-muted/50 transition-colors text-center"
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        <Folder className="h-8 w-8 mx-auto text-primary mb-2" />
                        <h4 className="font-medium text-sm">{cat.name}</h4>
                        {cat.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                      className="-ml-2"
                    >
                      ← All Categories
                    </Button>
                    {categoryLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : categoryVideos && categoryVideos.length > 0 ? (
                      categoryVideos.map(renderVideoCard)
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No videos in this category yet
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Recent Tab */}
              <TabsContent value="recent" className="p-4 space-y-3 mt-0">
                {recentVideos && recentVideos.length > 0 ? (
                  recentVideos.map(renderVideoCard)
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No recently watched videos
                    </p>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Video Player Modal */}
      {selectedVideo && (
        <HelpVideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  );
}
