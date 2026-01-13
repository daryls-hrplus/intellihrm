import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TimezoneContextResult {
  companyTimezone: string;
  userTimezone: string;
  isLoading: boolean;
  formatInCompanyTime: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatInUserTime: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  getCompanyToday: () => Date;
  getCompanyNow: () => Date;
  isWithinBusinessHours: (date?: Date | string) => boolean;
  getBusinessDaysUntil: (targetDate: Date | string) => number;
  businessHours: { start: string; end: string };
  businessDays: number[];
  convertToCompanyTimezone: (date: Date | string) => Date;
  convertFromCompanyTimezone: (date: Date | string) => Date;
}

const DEFAULT_TIMEZONE = 'UTC';
const DEFAULT_BUSINESS_START = '08:00';
const DEFAULT_BUSINESS_END = '18:00';
const DEFAULT_BUSINESS_DAYS = [1, 2, 3, 4, 5]; // Monday to Friday

export function useTimezoneContext(): TimezoneContextResult {
  const { user, profile } = useAuth();
  const [companyTimezone, setCompanyTimezone] = useState<string>(DEFAULT_TIMEZONE);
  const [userTimezone, setUserTimezone] = useState<string>(DEFAULT_TIMEZONE);
  const [businessHours, setBusinessHours] = useState({ start: DEFAULT_BUSINESS_START, end: DEFAULT_BUSINESS_END });
  const [businessDays, setBusinessDays] = useState<number[]>(DEFAULT_BUSINESS_DAYS);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch company timezone from the companies table
  useEffect(() => {
    const fetchTimezones = async () => {
      if (!profile?.company_id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch company settings including timezone
        const { data: company, error } = await supabase
          .from('companies')
          .select('timezone, business_hours_start, business_hours_end, business_days')
          .eq('id', profile.company_id)
          .single();

        if (error) {
          console.error('Error fetching company timezone:', error);
        } else if (company) {
          setCompanyTimezone(company.timezone || DEFAULT_TIMEZONE);
          setBusinessHours({
            start: company.business_hours_start || DEFAULT_BUSINESS_START,
            end: company.business_hours_end || DEFAULT_BUSINESS_END,
          });
          setBusinessDays(company.business_days || DEFAULT_BUSINESS_DAYS);
        }

        // Fetch user timezone preference from profile
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('timezone')
          .eq('id', user?.id)
          .single();

        if (userProfile?.timezone) {
          setUserTimezone(userProfile.timezone);
        } else {
          // Fall back to company timezone or browser timezone
          setUserTimezone(company?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
        }
      } catch (error) {
        console.error('Error fetching timezone settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimezones();
  }, [profile?.company_id, user?.id]);

  // Format a date in company timezone
  const formatInCompanyTime = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: companyTimezone,
    };
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
  }, [companyTimezone]);

  // Format a date in user's preferred timezone
  const formatInUserTime = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: userTimezone,
    };
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
  }, [userTimezone]);

  // Get current date/time in company timezone
  const getCompanyToday = useCallback((): Date => {
    const now = new Date();
    const companyTimeStr = now.toLocaleString('en-US', { timeZone: companyTimezone });
    return new Date(companyTimeStr);
  }, [companyTimezone]);

  const getCompanyNow = useCallback((): Date => {
    return getCompanyToday();
  }, [getCompanyToday]);

  // Convert a date to company timezone
  const convertToCompanyTimezone = useCallback((date: Date | string): Date => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const companyTimeStr = dateObj.toLocaleString('en-US', { timeZone: companyTimezone });
    return new Date(companyTimeStr);
  }, [companyTimezone]);

  // Convert from company timezone to UTC
  const convertFromCompanyTimezone = useCallback((date: Date | string): Date => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    // This creates a date in company timezone context
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: companyTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(dateObj);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';
    
    return new Date(
      `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}:${getPart('second')}Z`
    );
  }, [companyTimezone]);

  // Check if a given time is within business hours
  const isWithinBusinessHours = useCallback((date?: Date | string): boolean => {
    const checkDate = date 
      ? (typeof date === 'string' ? new Date(date) : date)
      : new Date();
    
    const companyTime = convertToCompanyTimezone(checkDate);
    const dayOfWeek = companyTime.getDay();
    
    // Convert Sunday=0 to Monday=1 format (1-7 where 1=Monday)
    const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    
    if (!businessDays.includes(adjustedDay)) {
      return false;
    }

    const hours = companyTime.getHours();
    const minutes = companyTime.getMinutes();
    const currentTimeMinutes = hours * 60 + minutes;

    const [startHours, startMinutes] = businessHours.start.split(':').map(Number);
    const [endHours, endMinutes] = businessHours.end.split(':').map(Number);
    
    const startTimeMinutes = startHours * 60 + startMinutes;
    const endTimeMinutes = endHours * 60 + endMinutes;

    return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
  }, [convertToCompanyTimezone, businessDays, businessHours]);

  // Calculate business days until a target date
  const getBusinessDaysUntil = useCallback((targetDate: Date | string): number => {
    const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
    const companyToday = getCompanyToday();
    
    // Set both dates to midnight for comparison
    companyToday.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    if (target <= companyToday) {
      return 0;
    }

    let count = 0;
    const current = new Date(companyToday);
    
    while (current < target) {
      current.setDate(current.getDate() + 1);
      const dayOfWeek = current.getDay();
      const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
      
      if (businessDays.includes(adjustedDay)) {
        count++;
      }
    }

    return count;
  }, [getCompanyToday, businessDays]);

  return useMemo(() => ({
    companyTimezone,
    userTimezone,
    isLoading,
    formatInCompanyTime,
    formatInUserTime,
    getCompanyToday,
    getCompanyNow,
    isWithinBusinessHours,
    getBusinessDaysUntil,
    businessHours,
    businessDays,
    convertToCompanyTimezone,
    convertFromCompanyTimezone,
  }), [
    companyTimezone,
    userTimezone,
    isLoading,
    formatInCompanyTime,
    formatInUserTime,
    getCompanyToday,
    getCompanyNow,
    isWithinBusinessHours,
    getBusinessDaysUntil,
    businessHours,
    businessDays,
    convertToCompanyTimezone,
    convertFromCompanyTimezone,
  ]);
}
