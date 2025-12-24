import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EnablementVideo } from '@/types/enablement';

interface UseFeatureVideosOptions {
  moduleCode?: string;
  featureCode?: string;
  enabled?: boolean;
}

export function useFeatureVideos(options: UseFeatureVideosOptions = {}) {
  const { moduleCode, featureCode, enabled = true } = options;
  const [videos, setVideos] = useState<EnablementVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVideos = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('enablement_video_library')
        .select('*')
        .eq('is_active', true);

      if (moduleCode) {
        query = query.eq('module_code', moduleCode);
      }

      if (featureCode) {
        query = query.eq('feature_code', featureCode);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setVideos((data as EnablementVideo[]) || []);
    } catch (error) {
      console.error('Error fetching feature videos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [moduleCode, featureCode, enabled]);

  const getVideosByFeature = useCallback((code: string): EnablementVideo[] => {
    return videos.filter(v => v.feature_code === code);
  }, [videos]);

  const getVideosByModule = useCallback((code: string): EnablementVideo[] => {
    return videos.filter(v => v.module_code === code);
  }, [videos]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return {
    videos,
    isLoading,
    fetchVideos,
    getVideosByFeature,
    getVideosByModule,
  };
}
