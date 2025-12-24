import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Play, 
  RefreshCw, 
  Video, 
  Route, 
  CheckCircle2, 
  Clock,
  BookOpen,
} from 'lucide-react';
import { useTourContext } from './TourProvider';
import { useTour } from '@/hooks/useTour';
import { useFeatureVideos } from '@/hooks/useFeatureVideos';

export function HelpPanel() {
  const location = useLocation();
  const { isHelpPanelOpen, closeHelpPanel, startTour } = useTourContext();
  const { tours, hasCompletedTour, resetTourCompletion } = useTour();
  const { videos } = useFeatureVideos();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tours');

  // Get current module from path
  const currentModule = useMemo(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    return pathParts[0] || 'dashboard';
  }, [location.pathname]);

  // Filter tours relevant to current page
  const relevantTours = useMemo(() => {
    return tours.filter(t => 
      t.module_code === currentModule || 
      t.trigger_route === location.pathname
    );
  }, [tours, currentModule, location.pathname]);

  // Filter videos relevant to current page
  const relevantVideos = useMemo(() => {
    return videos.filter(v => 
      v.module_code === currentModule
    );
  }, [videos, currentModule]);

  // Search filter
  const filteredTours = useMemo(() => {
    if (!searchQuery) return relevantTours;
    const query = searchQuery.toLowerCase();
    return relevantTours.filter(t => 
      t.tour_name.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query)
    );
  }, [relevantTours, searchQuery]);

  const filteredVideos = useMemo(() => {
    if (!searchQuery) return relevantVideos;
    const query = searchQuery.toLowerCase();
    return relevantVideos.filter(v => 
      v.title.toLowerCase().includes(query) ||
      v.description?.toLowerCase().includes(query)
    );
  }, [relevantVideos, searchQuery]);

  const handleStartTour = async (tourCode: string) => {
    closeHelpPanel();
    // Small delay to let panel close animation complete
    setTimeout(() => {
      startTour(tourCode);
    }, 300);
  };

  const handleReplayTour = async (tourCode: string) => {
    await resetTourCompletion(tourCode);
    handleStartTour(tourCode);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <Sheet open={isHelpPanelOpen} onOpenChange={(open) => !open && closeHelpPanel()}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="space-y-1">
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Help Center
          </SheetTitle>
          <SheetDescription>
            Interactive tours, videos, and help for this page
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tours and videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tours" className="gap-2">
                <Route className="h-4 w-4" />
                Tours ({filteredTours.length})
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-2">
                <Video className="h-4 w-4" />
                Videos ({filteredVideos.length})
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(100vh-280px)] mt-4">
              <TabsContent value="tours" className="space-y-3 mt-0">
                {filteredTours.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <Route className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No tours available for this page</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredTours.map((tour) => {
                    const isCompleted = hasCompletedTour(tour.tour_code);
                    return (
                      <Card key={tour.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <CardTitle className="text-sm font-medium flex items-center gap-2">
                                {tour.tour_name}
                                {isCompleted && (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                )}
                              </CardTitle>
                              {tour.description && (
                                <CardDescription className="text-xs mt-1">
                                  {tour.description}
                                </CardDescription>
                              )}
                            </div>
                            {tour.estimated_duration_seconds && (
                              <Badge variant="secondary" className="text-xs gap-1 shrink-0">
                                <Clock className="h-3 w-3" />
                                {formatDuration(tour.estimated_duration_seconds)}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className="flex gap-2">
                            {isCompleted ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 gap-2"
                                onClick={() => handleReplayTour(tour.tour_code)}
                              >
                                <RefreshCw className="h-3 w-3" />
                                Replay Tour
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                className="flex-1 gap-2"
                                onClick={() => handleStartTour(tour.tour_code)}
                              >
                                <Play className="h-3 w-3" />
                                Start Tour
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="videos" className="space-y-3 mt-0">
                {filteredVideos.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <Video className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No videos available for this page</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredVideos.map((video) => (
                    <Card key={video.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-3">
                          {video.thumbnail_url ? (
                            <img 
                              src={video.thumbnail_url} 
                              alt={video.title}
                              className="w-20 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-20 h-12 bg-muted rounded flex items-center justify-center">
                              <Video className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-medium line-clamp-2">
                              {video.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {video.video_provider}
                              </Badge>
                              {video.duration_seconds && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDuration(video.duration_seconds)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full gap-2"
                          onClick={() => window.open(video.video_url, '_blank')}
                        >
                          <Play className="h-3 w-3" />
                          Watch Video
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
