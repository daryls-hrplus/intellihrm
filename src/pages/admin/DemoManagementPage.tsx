import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  Plus, Pencil, Trash2, Play, Video, Layers, 
  Loader2, Eye, ChevronRight, ArrowLeft, Clock, Users, GripVertical
} from "lucide-react";

interface DemoExperience {
  id: string;
  experience_code: string;
  experience_name: string;
  description: string | null;
  target_audience: string;
  target_roles: string[];
  featured_modules: string[];
  estimated_duration_minutes: number;
  thumbnail_url: string | null;
  hero_video_url: string | null;
  is_active: boolean;
  display_order: number;
}

interface DemoChapter {
  id: string;
  experience_id: string;
  chapter_order: number;
  title: string;
  description: string | null;
  chapter_type: string;
  video_url: string | null;
  video_thumbnail_url: string | null;
  duration_seconds: number;
  cta_type: string;
  cta_label: string | null;
  cta_url: string | null;
  feature_preview_route: string | null;
  is_gated: boolean;
  is_active: boolean;
}

export default function DemoManagementPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("experiences");
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [experiences, setExperiences] = useState<DemoExperience[]>([]);
  const [chapters, setChapters] = useState<DemoChapter[]>([]);
  
  // Selected states
  const [selectedExperience, setSelectedExperience] = useState<DemoExperience | null>(null);
  
  // Dialog states
  const [experienceDialog, setExperienceDialog] = useState(false);
  const [chapterDialog, setChapterDialog] = useState(false);
  const [videoPreviewDialog, setVideoPreviewDialog] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  
  // Form states
  const [editingExperience, setEditingExperience] = useState<DemoExperience | null>(null);
  const [editingChapter, setEditingChapter] = useState<DemoChapter | null>(null);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('demo_experiences')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      toast({ title: "Error loading experiences", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async (experienceId: string) => {
    const { data, error } = await supabase
      .from('demo_experience_chapters')
      .select('*')
      .eq('experience_id', experienceId)
      .order('chapter_order');
    
    if (error) {
      toast({ title: "Error loading chapters", variant: "destructive" });
      return;
    }
    setChapters(data || []);
  };

  const saveExperience = async (formData: FormData) => {
    const targetRolesRaw = formData.get('target_roles') as string;
    const featuredModulesRaw = formData.get('featured_modules') as string;
    
    const data = {
      experience_code: formData.get('experience_code') as string,
      experience_name: formData.get('experience_name') as string,
      description: formData.get('description') as string || null,
      target_audience: formData.get('target_audience') as string,
      target_roles: targetRolesRaw ? targetRolesRaw.split(',').map(r => r.trim()).filter(Boolean) : [],
      featured_modules: featuredModulesRaw ? featuredModulesRaw.split(',').map(m => m.trim()).filter(Boolean) : [],
      estimated_duration_minutes: parseInt(formData.get('estimated_duration_minutes') as string) || 10,
      thumbnail_url: formData.get('thumbnail_url') as string || null,
      hero_video_url: formData.get('hero_video_url') as string || null,
      is_active: formData.get('is_active') === 'true',
      display_order: parseInt(formData.get('display_order') as string) || 0,
    };

    try {
      if (editingExperience) {
        const { error } = await supabase
          .from('demo_experiences')
          .update(data)
          .eq('id', editingExperience.id);
        if (error) throw error;
        toast({ title: "Experience updated" });
      } else {
        const { error } = await supabase
          .from('demo_experiences')
          .insert(data);
        if (error) throw error;
        toast({ title: "Experience created" });
      }
      setExperienceDialog(false);
      setEditingExperience(null);
      fetchExperiences();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteExperience = async (id: string) => {
    if (!confirm('Delete this experience and all its chapters?')) return;
    
    const { error } = await supabase
      .from('demo_experiences')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Experience deleted" });
      fetchExperiences();
    }
  };

  const saveChapter = async (formData: FormData) => {
    const data = {
      experience_id: selectedExperience!.id,
      chapter_order: parseInt(formData.get('chapter_order') as string) || 1,
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      chapter_type: formData.get('chapter_type') as "video" | "interactive" | "feature_highlight" | "quiz",
      video_url: formData.get('video_url') as string || null,
      video_thumbnail_url: formData.get('video_thumbnail_url') as string || null,
      duration_seconds: parseInt(formData.get('duration_seconds') as string) || 0,
      cta_type: formData.get('cta_type') as string || 'next_chapter',
      cta_label: formData.get('cta_label') as string || null,
      cta_url: formData.get('cta_url') as string || null,
      feature_preview_route: formData.get('feature_preview_route') as string || null,
      is_gated: formData.get('is_gated') === 'true',
      is_active: formData.get('is_active') === 'true',
    };

    try {
      if (editingChapter) {
        const { error } = await supabase
          .from('demo_experience_chapters')
          .update(data)
          .eq('id', editingChapter.id);
        if (error) throw error;
        toast({ title: "Chapter updated" });
      } else {
        const { error } = await supabase
          .from('demo_experience_chapters')
          .insert(data);
        if (error) throw error;
        toast({ title: "Chapter created" });
      }
      setChapterDialog(false);
      setEditingChapter(null);
      fetchChapters(selectedExperience!.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteChapter = async (id: string) => {
    if (!confirm('Delete this chapter?')) return;
    
    const { error } = await supabase
      .from('demo_experience_chapters')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Chapter deleted" });
      fetchChapters(selectedExperience!.id);
    }
  };

  const openExperienceChapters = (exp: DemoExperience) => {
    setSelectedExperience(exp);
    fetchChapters(exp.id);
    setActiveTab("chapters");
  };

  const getEmbedUrl = (url: string | null): string | null => {
    if (!url) return null;
    
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return url;
  };

  const previewVideo = (url: string | null) => {
    if (!url) return;
    setPreviewVideoUrl(url);
    setVideoPreviewDialog(true);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Demo Management" }
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Demo Management</h1>
            <p className="text-muted-foreground">Manage product tour experiences and video chapters</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="experiences" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Experiences
            </TabsTrigger>
            <TabsTrigger 
              value="chapters" 
              className="flex items-center gap-2"
              disabled={!selectedExperience}
            >
              <Video className="h-4 w-4" />
              Chapters
              {selectedExperience && (
                <Badge variant="secondary" className="ml-1">
                  {selectedExperience.experience_name}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Experiences Tab */}
          <TabsContent value="experiences">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Demo Experiences</CardTitle>
                  <CardDescription>Create and manage product tour experiences for different audiences</CardDescription>
                </div>
                <Button onClick={() => { setEditingExperience(null); setExperienceDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Target Audience</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {experiences.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No demo experiences yet. Click "Add Experience" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      experiences.map((exp) => (
                        <TableRow key={exp.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              {exp.display_order}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {exp.thumbnail_url ? (
                                <img 
                                  src={exp.thumbnail_url} 
                                  alt={exp.experience_name}
                                  className="w-16 h-10 object-cover rounded"
                                />
                              ) : (
                                <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                                  <Video className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{exp.experience_name}</div>
                                <div className="text-sm text-muted-foreground font-mono">{exp.experience_code}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {exp.target_audience}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {exp.estimated_duration_minutes} min
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={exp.is_active ? "default" : "secondary"}>
                              {exp.is_active ? 'Active' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openExperienceChapters(exp)}
                              >
                                <ChevronRight className="h-4 w-4 mr-1" />
                                Chapters
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => { setEditingExperience(exp); setExperienceDialog(true); }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => deleteExperience(exp.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chapters Tab */}
          <TabsContent value="chapters">
            {selectedExperience && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setActiveTab("experiences")}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <CardTitle>Chapters: {selectedExperience.experience_name}</CardTitle>
                      <CardDescription>Manage video chapters and content for this experience</CardDescription>
                    </div>
                  </div>
                  <Button onClick={() => { setEditingChapter(null); setChapterDialog(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Chapter
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Chapter</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Gated</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chapters.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No chapters yet. Click "Add Chapter" to create one.
                          </TableCell>
                        </TableRow>
                      ) : (
                        chapters.map((chapter) => (
                          <TableRow key={chapter.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                {chapter.chapter_order}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {chapter.video_thumbnail_url ? (
                                  <img 
                                    src={chapter.video_thumbnail_url} 
                                    alt={chapter.title}
                                    className="w-16 h-10 object-cover rounded cursor-pointer"
                                    onClick={() => previewVideo(chapter.video_url)}
                                  />
                                ) : (
                                  <div 
                                    className="w-16 h-10 bg-muted rounded flex items-center justify-center cursor-pointer"
                                    onClick={() => previewVideo(chapter.video_url)}
                                  >
                                    <Play className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium">{chapter.title}</div>
                                  {chapter.description && (
                                    <div className="text-sm text-muted-foreground line-clamp-1">
                                      {chapter.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{chapter.chapter_type}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {formatDuration(chapter.duration_seconds)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {chapter.is_gated ? (
                                <Badge variant="secondary">Gated</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={chapter.is_active ? "default" : "secondary"}>
                                {chapter.is_active ? 'Active' : 'Draft'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {chapter.video_url && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => previewVideo(chapter.video_url)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => { setEditingChapter(chapter); setChapterDialog(true); }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => deleteChapter(chapter.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Experience Dialog */}
        <Dialog open={experienceDialog} onOpenChange={setExperienceDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExperience ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
              <DialogDescription>
                Create a product tour experience for a specific audience
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveExperience(new FormData(e.currentTarget)); }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience_code">Experience Code</Label>
                    <Input
                      id="experience_code"
                      name="experience_code"
                      placeholder="e.g., hr-leaders-tour"
                      defaultValue={editingExperience?.experience_code || ''}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience_name">Experience Name</Label>
                    <Input
                      id="experience_name"
                      name="experience_name"
                      placeholder="e.g., HR Leaders Tour"
                      defaultValue={editingExperience?.experience_name || ''}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe what this experience covers..."
                    defaultValue={editingExperience?.description || ''}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target_audience">Target Audience</Label>
                    <Input
                      id="target_audience"
                      name="target_audience"
                      placeholder="e.g., HR Directors"
                      defaultValue={editingExperience?.target_audience || ''}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target_roles">Target Roles (comma-separated)</Label>
                    <Input
                      id="target_roles"
                      name="target_roles"
                      placeholder="hr_director, hr_manager"
                      defaultValue={editingExperience?.target_roles?.join(', ') || ''}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featured_modules">Featured Modules (comma-separated)</Label>
                  <Input
                    id="featured_modules"
                    name="featured_modules"
                    placeholder="core_hr, payroll, recruitment"
                    defaultValue={editingExperience?.featured_modules?.join(', ') || ''}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimated_duration_minutes">Duration (minutes)</Label>
                    <Input
                      id="estimated_duration_minutes"
                      name="estimated_duration_minutes"
                      type="number"
                      min="1"
                      defaultValue={editingExperience?.estimated_duration_minutes || 10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      name="display_order"
                      type="number"
                      min="0"
                      defaultValue={editingExperience?.display_order || 0}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                  <Input
                    id="thumbnail_url"
                    name="thumbnail_url"
                    placeholder="https://..."
                    defaultValue={editingExperience?.thumbnail_url || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero_video_url">Hero Video URL</Label>
                  <Input
                    id="hero_video_url"
                    name="hero_video_url"
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    defaultValue={editingExperience?.hero_video_url || ''}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    name="is_active"
                    defaultChecked={editingExperience?.is_active ?? true}
                    onCheckedChange={(checked) => {
                      const input = document.getElementById('is_active_value') as HTMLInputElement;
                      if (input) input.value = checked.toString();
                    }}
                  />
                  <input type="hidden" id="is_active_value" name="is_active" defaultValue={(editingExperience?.is_active ?? true).toString()} />
                  <Label htmlFor="is_active">Active (visible on product tour page)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setExperienceDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingExperience ? 'Update' : 'Create'} Experience
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Chapter Dialog */}
        <Dialog open={chapterDialog} onOpenChange={setChapterDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingChapter ? 'Edit Chapter' : 'Add Chapter'}</DialogTitle>
              <DialogDescription>
                Add a video chapter to this experience
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveChapter(new FormData(e.currentTarget)); }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chapter_order">Chapter Order</Label>
                    <Input
                      id="chapter_order"
                      name="chapter_order"
                      type="number"
                      min="1"
                      defaultValue={editingChapter?.chapter_order || (chapters.length + 1)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chapter_type">Chapter Type</Label>
                    <Select name="chapter_type" defaultValue={editingChapter?.chapter_type || 'video'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="interactive">Interactive</SelectItem>
                        <SelectItem value="feature_highlight">Feature Highlight</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Introduction to Core HR"
                    defaultValue={editingChapter?.title || ''}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe what this chapter covers..."
                    defaultValue={editingChapter?.description || ''}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video_url">Video URL</Label>
                  <Input
                    id="video_url"
                    name="video_url"
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    defaultValue={editingChapter?.video_url || ''}
                  />
                  <p className="text-sm text-muted-foreground">
                    Supports YouTube, Vimeo, or direct MP4 URLs
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="video_thumbnail_url">Thumbnail URL</Label>
                    <Input
                      id="video_thumbnail_url"
                      name="video_thumbnail_url"
                      placeholder="https://..."
                      defaultValue={editingChapter?.video_thumbnail_url || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_seconds">Duration (seconds)</Label>
                    <Input
                      id="duration_seconds"
                      name="duration_seconds"
                      type="number"
                      min="0"
                      defaultValue={editingChapter?.duration_seconds || 0}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta_type">CTA Type</Label>
                    <Select name="cta_type" defaultValue={editingChapter?.cta_type || 'next_chapter'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="next_chapter">Next Chapter</SelectItem>
                        <SelectItem value="schedule_call">Schedule Call</SelectItem>
                        <SelectItem value="try_feature">Try Feature</SelectItem>
                        <SelectItem value="start_trial">Start Trial</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta_label">CTA Label</Label>
                    <Input
                      id="cta_label"
                      name="cta_label"
                      placeholder="e.g., Continue"
                      defaultValue={editingChapter?.cta_label || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta_url">CTA URL (optional)</Label>
                    <Input
                      id="cta_url"
                      name="cta_url"
                      placeholder="https://..."
                      defaultValue={editingChapter?.cta_url || ''}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feature_preview_route">Feature Preview Route (optional)</Label>
                  <Input
                    id="feature_preview_route"
                    name="feature_preview_route"
                    placeholder="/demo/core-hr"
                    defaultValue={editingChapter?.feature_preview_route || ''}
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_gated"
                      name="is_gated_switch"
                      defaultChecked={editingChapter?.is_gated ?? false}
                      onCheckedChange={(checked) => {
                        const input = document.getElementById('is_gated_value') as HTMLInputElement;
                        if (input) input.value = checked.toString();
                      }}
                    />
                    <input type="hidden" id="is_gated_value" name="is_gated" defaultValue={(editingChapter?.is_gated ?? false).toString()} />
                    <Label htmlFor="is_gated">Gated (requires lead capture)</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active_chapter"
                      name="is_active_switch"
                      defaultChecked={editingChapter?.is_active ?? true}
                      onCheckedChange={(checked) => {
                        const input = document.getElementById('is_active_chapter_value') as HTMLInputElement;
                        if (input) input.value = checked.toString();
                      }}
                    />
                    <input type="hidden" id="is_active_chapter_value" name="is_active" defaultValue={(editingChapter?.is_active ?? true).toString()} />
                    <Label htmlFor="is_active_chapter">Active</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setChapterDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingChapter ? 'Update' : 'Create'} Chapter
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Video Preview Dialog */}
        <Dialog open={videoPreviewDialog} onOpenChange={setVideoPreviewDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Video Preview</DialogTitle>
            </DialogHeader>
            <AspectRatio ratio={16 / 9}>
              {previewVideoUrl && (
                <iframe
                  src={getEmbedUrl(previewVideoUrl) || ''}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </AspectRatio>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
