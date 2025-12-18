import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Calendar,
  MoreHorizontal,
  Edit,
  Archive,
  Rocket,
  Eye,
  FileText,
  Sparkles,
  Loader2,
  Wand2,
} from "lucide-react";
import { useEnablementReleases } from "@/hooks/useEnablementData";
import type { EnablementRelease } from "@/types/enablement";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { marked } from "marked";

const STATUS_BADGES = {
  planning: { label: "Planning", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  preview: { label: "Preview", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  released: { label: "Released", className: "bg-green-500/10 text-green-600 border-green-500/20" },
  archived: { label: "Archived", className: "bg-muted text-muted-foreground" },
};

export function ReleaseManager() {
  const { t } = useTranslation();
  const { releases, isLoading, createRelease, updateRelease, fetchReleases } = useEnablementReleases();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [viewNotesRelease, setViewNotesRelease] = useState<EnablementRelease | null>(null);
  const [formData, setFormData] = useState({
    version_number: "",
    release_name: "",
    release_date: "",
    preview_start_date: "",
    release_notes: "",
    status: "planning" as EnablementRelease["status"],
  });

  const handleCreate = async () => {
    if (!formData.version_number) return;

    await createRelease({
      ...formData,
      release_date: formData.release_date || null,
      preview_start_date: formData.preview_start_date || null,
    });

    setFormData({
      version_number: "",
      release_name: "",
      release_date: "",
      preview_start_date: "",
      release_notes: "",
      status: "planning",
    });
    setIsCreateOpen(false);
  };

  const handleStatusChange = async (id: string, status: EnablementRelease["status"]) => {
    await updateRelease(id, { status });
  };

  const handleGenerateReleaseNotes = async (release: EnablementRelease) => {
    setIsGenerating(release.id);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-release-notes", {
        body: {
          releaseId: release.id,
          releaseName: release.release_name,
          versionNumber: release.version_number,
        },
      });

      if (error) {
        console.error("Error generating release notes:", error);
        toast.error("Failed to generate release notes");
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Release notes generated successfully!");
      
      // Refresh the releases to get the updated notes
      await fetchReleases();
      
      // Show the generated notes
      const updatedRelease = { ...release, release_notes: data.releaseNotes };
      setViewNotesRelease(updatedRelease);
      
    } catch (err) {
      console.error("Error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsGenerating(null);
    }
  };

  const renderMarkdown = (content: string) => {
    const html = marked.parse(content, { breaks: true, async: false }) as string;
    return { __html: html };
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Release Management
              </CardTitle>
              <CardDescription>
                Manage release versions and track content progress
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Release
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Release</DialogTitle>
                  <DialogDescription>
                    Define a new release version for content tracking
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="version">Version Number *</Label>
                      <Input
                        id="version"
                        placeholder="e.g., 2025.1"
                        value={formData.version_number}
                        onChange={(e) =>
                          setFormData({ ...formData, version_number: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Release Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Spring 2025"
                        value={formData.release_name}
                        onChange={(e) =>
                          setFormData({ ...formData, release_name: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preview_date">Preview Start Date</Label>
                      <Input
                        id="preview_date"
                        type="date"
                        value={formData.preview_start_date}
                        onChange={(e) =>
                          setFormData({ ...formData, preview_start_date: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="release_date">Release Date</Label>
                      <Input
                        id="release_date"
                        type="date"
                        value={formData.release_date}
                        onChange={(e) =>
                          setFormData({ ...formData, release_date: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Release Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Describe the key changes in this release..."
                      value={formData.release_notes}
                      onChange={(e) =>
                        setFormData({ ...formData, release_notes: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={!formData.version_number}>
                    Create Release
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Preview Date</TableHead>
                <TableHead>Release Date</TableHead>
                <TableHead>Features</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {releases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No releases created yet. Create your first release to start tracking content.
                  </TableCell>
                </TableRow>
              ) : (
                releases.map((release) => {
                  const statusConfig = STATUS_BADGES[release.status];
                  const isCurrentlyGenerating = isGenerating === release.id;
                  return (
                    <TableRow key={release.id}>
                      <TableCell className="font-medium">{release.version_number}</TableCell>
                      <TableCell>{release.release_name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(statusConfig.className)}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {release.preview_start_date
                          ? format(parseISO(release.preview_start_date), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {release.release_date
                          ? format(parseISO(release.release_date), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{release.feature_count}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isCurrentlyGenerating}>
                              {isCurrentlyGenerating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewNotesRelease(release)}>
                              <FileText className="h-4 w-4 mr-2" />
                              View Release Notes
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleGenerateReleaseNotes(release)}
                              disabled={isCurrentlyGenerating}
                            >
                              <Wand2 className="h-4 w-4 mr-2" />
                              {release.release_notes ? "Regenerate" : "Generate"} Release Notes
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Content
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Scan for Changes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {release.status === "planning" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(release.id, "preview")}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Start Preview
                              </DropdownMenuItem>
                            )}
                            {release.status === "preview" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(release.id, "released")}
                              >
                                <Rocket className="h-4 w-4 mr-2" />
                                Mark Released
                              </DropdownMenuItem>
                            )}
                            {release.status === "released" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(release.id, "archived")}
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Release Notes Dialog */}
      <Dialog open={!!viewNotesRelease} onOpenChange={() => setViewNotesRelease(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Release Notes - {viewNotesRelease?.version_number}
              {viewNotesRelease?.release_name && (
                <span className="text-muted-foreground font-normal">
                  ({viewNotesRelease.release_name})
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {viewNotesRelease?.release_date
                ? `Release Date: ${format(parseISO(viewNotesRelease.release_date), "MMMM d, yyyy")}`
                : "Release date not set"}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {viewNotesRelease?.release_notes ? (
              <div 
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={renderMarkdown(viewNotesRelease.release_notes)}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No release notes available yet.</p>
                <Button 
                  className="mt-4"
                  onClick={() => {
                    if (viewNotesRelease) {
                      setViewNotesRelease(null);
                      handleGenerateReleaseNotes(viewNotesRelease);
                    }
                  }}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Release Notes
                </Button>
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            {viewNotesRelease?.release_notes && (
              <Button 
                variant="outline"
                onClick={() => {
                  if (viewNotesRelease) {
                    setViewNotesRelease(null);
                    handleGenerateReleaseNotes(viewNotesRelease);
                  }
                }}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            )}
            <Button onClick={() => setViewNotesRelease(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
