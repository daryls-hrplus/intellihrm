import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TimeClockEntry {
  id: string;
  employee_id: string;
  company_id: string;
  clock_in: string;
  clock_out: string | null;
  total_hours: number | null;
  clock_in_photo_url: string | null;
  clock_out_photo_url: string | null;
  clock_in_latitude: number | null;
  clock_in_longitude: number | null;
  clock_out_latitude: number | null;
  clock_out_longitude: number | null;
}

// Helper function to upload base64 photo to storage
async function uploadPhotoToStorage(
  userId: string,
  base64DataUrl: string,
  type: 'clock_in' | 'clock_out'
): Promise<string | null> {
  try {
    // Convert base64 to blob
    const response = await fetch(base64DataUrl);
    const blob = await response.blob();
    
    // Create unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${userId}/${type}_${timestamp}.jpg`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('timeclock-photos')
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      return null;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('timeclock-photos')
      .getPublicUrl(filename);
    
    return publicUrl;
  } catch (error) {
    console.error('Error processing photo upload:', error);
    return null;
  }
}

export function useVirtualClock() {
  const { user, profile } = useAuth();
  const [currentEntry, setCurrentEntry] = useState<TimeClockEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workDuration, setWorkDuration] = useState<string>('00:00:00');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isClockedIn = currentEntry !== null && currentEntry.clock_out === null;

  // Format duration from milliseconds
  const formatDuration = useCallback((ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Update work duration
  const updateDuration = useCallback(() => {
    if (currentEntry?.clock_in && !currentEntry.clock_out) {
      const clockInTime = new Date(currentEntry.clock_in).getTime();
      const now = Date.now();
      setWorkDuration(formatDuration(now - clockInTime));
    } else {
      setWorkDuration('00:00:00');
    }
  }, [currentEntry, formatDuration]);

  // Fetch current open entry
  const fetchCurrentEntry = useCallback(async () => {
    if (!user) {
      setCurrentEntry(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('time_clock_entries')
        .select('*')
        .eq('employee_id', user.id)
        .is('clock_out', null)
        .order('clock_in', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setCurrentEntry(data);
    } catch (error) {
      console.error('Error fetching clock entry:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Clock in
  const clockIn = useCallback(async (
    photoDataUrl?: string | null,
    latitude?: number | null,
    longitude?: number | null
  ) => {
    if (!user || !profile?.company_id) {
      toast.error('Unable to clock in - no company assigned');
      return false;
    }

    try {
      setIsLoading(true);
      
      // Upload photo to storage if provided
      let photoUrl: string | null = null;
      if (photoDataUrl && photoDataUrl.startsWith('data:')) {
        photoUrl = await uploadPhotoToStorage(user.id, photoDataUrl, 'clock_in');
      } else if (photoDataUrl) {
        photoUrl = photoDataUrl; // Already a URL
      }
      
      const { data, error } = await supabase
        .from('time_clock_entries')
        .insert({
          employee_id: user.id,
          company_id: profile.company_id,
          clock_in: new Date().toISOString(),
          clock_in_photo_url: photoUrl,
          clock_in_latitude: latitude || null,
          clock_in_longitude: longitude || null,
          clock_in_method: 'virtual',
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentEntry(data);
      toast.success('Clocked in successfully');
      return true;
    } catch (error: any) {
      console.error('Error clocking in:', error);
      toast.error(error.message || 'Failed to clock in');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);

  // Clock out
  const clockOut = useCallback(async (
    photoDataUrl?: string | null,
    latitude?: number | null,
    longitude?: number | null
  ) => {
    if (!user || !currentEntry) return false;

    try {
      setIsLoading(true);
      
      // Upload photo to storage if provided
      let photoUrl: string | null = null;
      if (photoDataUrl && photoDataUrl.startsWith('data:')) {
        photoUrl = await uploadPhotoToStorage(user.id, photoDataUrl, 'clock_out');
      } else if (photoDataUrl) {
        photoUrl = photoDataUrl; // Already a URL
      }
      
      const clockOutTime = new Date();
      const clockInTime = new Date(currentEntry.clock_in);
      const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from('time_clock_entries')
        .update({
          clock_out: clockOutTime.toISOString(),
          clock_out_photo_url: photoUrl,
          clock_out_latitude: latitude || null,
          clock_out_longitude: longitude || null,
          clock_out_method: 'virtual',
          total_hours: Math.round(totalHours * 100) / 100,
        })
        .eq('id', currentEntry.id);

      if (error) throw error;
      setCurrentEntry(null);
      toast.success('Clocked out successfully');
      return true;
    } catch (error: any) {
      console.error('Error clocking out:', error);
      toast.error(error.message || 'Failed to clock out');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, currentEntry]);

  // Initial fetch
  useEffect(() => {
    fetchCurrentEntry();
  }, [fetchCurrentEntry]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('virtual-clock-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_clock_entries',
          filter: `employee_id=eq.${user.id}`,
        },
        () => {
          fetchCurrentEntry();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchCurrentEntry]);

  // Update duration every second when clocked in
  useEffect(() => {
    if (isClockedIn) {
      updateDuration();
      intervalRef.current = setInterval(updateDuration, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setWorkDuration('00:00:00');
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isClockedIn, updateDuration]);

  return {
    currentEntry,
    isClockedIn,
    isLoading,
    workDuration,
    clockIn,
    clockOut,
    refresh: fetchCurrentEntry,
  };
}
