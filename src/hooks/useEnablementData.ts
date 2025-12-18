import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type {
  EnablementRelease,
  EnablementContentStatus,
  EnablementFeatureChange,
  EnablementVideo,
  EnablementDAPGuide,
  EnablementRiseTemplate,
  WorkflowColumn,
} from "@/types/enablement";

export function useEnablementReleases() {
  const [releases, setReleases] = useState<EnablementRelease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchReleases = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("enablement_releases")
        .select("*")
        .order("release_date", { ascending: false });

      if (error) throw error;
      setReleases((data as EnablementRelease[]) || []);
    } catch (error) {
      console.error("Error fetching releases:", error);
      toast({
        title: "Error",
        description: "Failed to fetch releases",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createRelease = async (release: Partial<EnablementRelease>) => {
    try {
      const { data, error } = await supabase
        .from("enablement_releases")
        .insert(release as any)
        .select()
        .single();

      if (error) throw error;
      setReleases((prev) => [data as EnablementRelease, ...prev]);
      toast({ title: "Release created successfully" });
      return data;
    } catch (error) {
      console.error("Error creating release:", error);
      toast({
        title: "Error",
        description: "Failed to create release",
        variant: "destructive",
      });
    }
  };

  const updateRelease = async (id: string, updates: Partial<EnablementRelease>) => {
    try {
      const { error } = await supabase
        .from("enablement_releases")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      setReleases((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
      toast({ title: "Release updated successfully" });
    } catch (error) {
      console.error("Error updating release:", error);
      toast({
        title: "Error",
        description: "Failed to update release",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  return { releases, isLoading, fetchReleases, createRelease, updateRelease };
}

export function useEnablementContentStatus(releaseId?: string) {
  const [contentItems, setContentItems] = useState<EnablementContentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("enablement_content_status").select("*");

      if (releaseId) {
        query = query.eq("release_id", releaseId);
      }

      const { data, error } = await query.order("priority", { ascending: true });

      if (error) throw error;
      setContentItems((data as EnablementContentStatus[]) || []);
    } catch (error) {
      console.error("Error fetching content status:", error);
      toast({
        title: "Error",
        description: "Failed to fetch content status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [releaseId, toast]);

  const updateContentStatus = async (
    id: string,
    updates: Partial<EnablementContentStatus>
  ) => {
    try {
      const { error } = await supabase
        .from("enablement_content_status")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      setContentItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    } catch (error) {
      console.error("Error updating content status:", error);
      toast({
        title: "Error",
        description: "Failed to update content status",
        variant: "destructive",
      });
    }
  };

  const moveToColumn = async (id: string, column: WorkflowColumn) => {
    const updates: Partial<EnablementContentStatus> = {
      workflow_status: column,
    };

    if (column === "in_progress" && !contentItems.find((i) => i.id === id)?.started_at) {
      updates.started_at = new Date().toISOString();
    }
    if (column === "published") {
      updates.completed_at = new Date().toISOString();
    }

    await updateContentStatus(id, updates);
  };

  const createContentItem = async (item: Partial<EnablementContentStatus>) => {
    try {
      const { data, error } = await supabase
        .from("enablement_content_status")
        .insert(item as any)
        .select()
        .single();

      if (error) throw error;
      setContentItems((prev) => [...prev, data as EnablementContentStatus]);
      return data;
    } catch (error) {
      console.error("Error creating content item:", error);
      toast({
        title: "Error",
        description: "Failed to create content item",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    contentItems,
    isLoading,
    fetchContent,
    updateContentStatus,
    moveToColumn,
    createContentItem,
  };
}

export function useEnablementVideos(featureCode?: string) {
  const [videos, setVideos] = useState<EnablementVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("enablement_video_library").select("*");

      if (featureCode) {
        query = query.eq("feature_code", featureCode);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setVideos((data as EnablementVideo[]) || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [featureCode]);

  const addVideo = async (video: Partial<EnablementVideo>) => {
    try {
      const { data, error } = await supabase
        .from("enablement_video_library")
        .insert(video as any)
        .select()
        .single();

      if (error) throw error;
      setVideos((prev) => [data as EnablementVideo, ...prev]);
      toast({ title: "Video added successfully" });
      return data;
    } catch (error) {
      console.error("Error adding video:", error);
      toast({
        title: "Error",
        description: "Failed to add video",
        variant: "destructive",
      });
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase
        .from("enablement_video_library")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setVideos((prev) => prev.filter((v) => v.id !== id));
      toast({ title: "Video removed" });
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return { videos, isLoading, fetchVideos, addVideo, deleteVideo };
}

export function useEnablementDAPGuides(featureCode?: string) {
  const [guides, setGuides] = useState<EnablementDAPGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchGuides = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("enablement_dap_guides").select("*");

      if (featureCode) {
        query = query.eq("feature_code", featureCode);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setGuides((data as EnablementDAPGuide[]) || []);
    } catch (error) {
      console.error("Error fetching DAP guides:", error);
    } finally {
      setIsLoading(false);
    }
  }, [featureCode]);

  const addGuide = async (guide: Partial<EnablementDAPGuide>) => {
    try {
      const { data, error } = await supabase
        .from("enablement_dap_guides")
        .insert(guide as any)
        .select()
        .single();

      if (error) throw error;
      setGuides((prev) => [data as EnablementDAPGuide, ...prev]);
      toast({ title: "DAP guide linked successfully" });
      return data;
    } catch (error) {
      console.error("Error adding guide:", error);
      toast({
        title: "Error",
        description: "Failed to link DAP guide",
        variant: "destructive",
      });
    }
  };

  const deleteGuide = async (id: string) => {
    try {
      const { error } = await supabase
        .from("enablement_dap_guides")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setGuides((prev) => prev.filter((g) => g.id !== id));
      toast({ title: "DAP guide unlinked" });
    } catch (error) {
      console.error("Error deleting guide:", error);
      toast({
        title: "Error",
        description: "Failed to unlink DAP guide",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  return { guides, isLoading, fetchGuides, addGuide, deleteGuide };
}

export function useEnablementRiseTemplates() {
  const [templates, setTemplates] = useState<EnablementRiseTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("enablement_rise_templates")
        .select("*")
        .order("is_default", { ascending: false });

      if (error) throw error;
      setTemplates((data as EnablementRiseTemplate[]) || []);
    } catch (error) {
      console.error("Error fetching Rise templates:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTemplate = async (template: Partial<EnablementRiseTemplate>) => {
    try {
      const { data, error } = await supabase
        .from("enablement_rise_templates")
        .insert(template as any)
        .select()
        .single();

      if (error) throw error;
      setTemplates((prev) => [data as EnablementRiseTemplate, ...prev]);
      toast({ title: "Rise template added successfully" });
      return data;
    } catch (error) {
      console.error("Error adding template:", error);
      toast({
        title: "Error",
        description: "Failed to add Rise template",
        variant: "destructive",
      });
    }
  };

  const setDefaultTemplate = async (id: string) => {
    try {
      // First, unset all defaults
      await supabase
        .from("enablement_rise_templates")
        .update({ is_default: false })
        .neq("id", id);

      // Then set the new default
      const { error } = await supabase
        .from("enablement_rise_templates")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;

      setTemplates((prev) =>
        prev.map((t) => ({ ...t, is_default: t.id === id }))
      );
      toast({ title: "Default template updated" });
    } catch (error) {
      console.error("Error setting default template:", error);
      toast({
        title: "Error",
        description: "Failed to update default template",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { templates, isLoading, fetchTemplates, addTemplate, setDefaultTemplate };
}
