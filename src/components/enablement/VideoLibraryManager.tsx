import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Video,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Edit,
  Play,
  Search,
  Clock,
} from "lucide-react";
import { useEnablementVideos } from "@/hooks/useEnablementData";
import { FEATURE_REGISTRY } from "@/lib/featureRegistry";
import type { EnablementVideo } from "@/types/enablement";

const VIDEO_PROVIDERS = [
  { value: "trupeer", label: "Trupeer" },
  { value: "guidde", label: "Guidde" },
  { value: "youtube", label: "YouTube" },
  { value: "vimeo", label: "Vimeo" },
  { value: "other", label: "Other" },
];

export function VideoLibraryManager() {
  const { t } = useTranslation();
  const { videos, isLoading, addVideo, deleteVideo } = useEnablementVideos();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    feature_code: "",
    module_code: "",
    video_provider: "trupeer" as EnablementVideo["video_provider"],
    video_url: "",
    title: "",
    description: "",
    duration_seconds: "",
  });

  // Get all features for dropdown
  const featureOptions = Object.entries(FEATURE_REGISTRY).flatMap(([moduleCode, moduleData]) =>
    Object.entries(moduleData.features).map(([featureCode, featureData]) => ({
      value: `${moduleCode}:${featureCode}`,
      label: `${moduleData.name} - ${featureData.name}`,
      module_code: moduleCode,
      feature_code: featureCode,
    }))
  );

  const handleFeatureSelect = (value: string) => {
    const [module_code, feature_code] = value.split(":");
    setFormData({ ...formData, module_code, feature_code });
  };

  const handleAdd = async () => {
    if (!formData.feature_code || !formData.video_url || !formData.title) return;

    await addVideo({
      ...formData,
      duration_seconds: formData.duration_seconds
        ? parseInt(formData.duration_seconds)
        : null,
    });

    setFormData({
      feature_code: "",
      module_code: "",
      video_provider: "trupeer",
      video_url: "",
      title: "",
      description: "",
      duration_seconds: "",
    });
    setIsAddOpen(false);
  };

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.feature_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.module_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Library
            </CardTitle>
            <CardDescription>
              Link Trupeer, Guidde, and other video content to features
            </CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Video</DialogTitle>
                <DialogDescription>
                  Link a video from Trupeer, Guidde, or another provider
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="feature">Feature *</Label>
                  <Select
                    value={
                      formData.module_code && formData.feature_code
                        ? `${formData.module_code}:${formData.feature_code}`
                        : ""
                    }
                    onValueChange={handleFeatureSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a feature" />
                    </SelectTrigger>
                    <SelectContent>
                      {featureOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider *</Label>
                    <Select
                      value={formData.video_provider}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          video_provider: v as EnablementVideo["video_provider"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VIDEO_PROVIDERS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="e.g., 180"
                      value={formData.duration_seconds}
                      onChange={(e) =>
                        setFormData({ ...formData, duration_seconds: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Video title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Video URL *</Label>
                  <Input
                    id="url"
                    placeholder="https://..."
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={!formData.feature_code || !formData.video_url || !formData.title}
                >
                  Add Video
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Feature</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVideos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No videos linked yet. Add your first video to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredVideos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{video.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{video.feature_code.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">{video.module_code}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{video.video_provider}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="text-sm">
                        {formatDuration(video.duration_seconds)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => window.open(video.video_url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Video
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteVideo(video.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
