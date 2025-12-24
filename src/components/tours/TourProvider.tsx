import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTour } from '@/hooks/useTour';
import { TourContextType, TourState, TourWithSteps, TourVideo } from '@/types/tours';

const initialState: TourState = {
  activeTour: null,
  currentStepIndex: 0,
  isRunning: false,
  isPaused: false,
  isHelpPanelOpen: false,
  currentVideo: null,
};

const TourContext = createContext<TourContextType | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const tourHook = useTour();
  const [state, setState] = useState<TourState>(initialState);

  const startTour = useCallback(async (tourCode: string) => {
    const tour = await tourHook.fetchTourWithSteps(tourCode);
    if (!tour || tour.steps.length === 0) {
      console.warn(`Tour "${tourCode}" not found or has no steps`);
      return;
    }

    // Start completion tracking
    await tourHook.startTourCompletion(tour.id, tour.steps.length);
    
    // Track start event
    tourHook.trackEvent({
      tour_id: tour.id,
      event_type: 'start',
    });

    setState(prev => ({
      ...prev,
      activeTour: tour,
      currentStepIndex: 0,
      isRunning: true,
      isPaused: false,
    }));
  }, [tourHook]);

  const pauseTour = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeTour = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const skipTour = useCallback(() => {
    if (state.activeTour) {
      tourHook.skipTour(state.activeTour.id);
      tourHook.trackEvent({
        tour_id: state.activeTour.id,
        event_type: 'skip',
        step_id: state.activeTour.steps[state.currentStepIndex]?.id,
      });
    }
    setState(initialState);
  }, [state.activeTour, state.currentStepIndex, tourHook]);

  const completeTour = useCallback(() => {
    if (state.activeTour) {
      tourHook.updateTourProgress(state.activeTour.id, state.currentStepIndex + 1, true);
      tourHook.trackEvent({
        tour_id: state.activeTour.id,
        event_type: 'finish',
      });
    }
    setState(initialState);
  }, [state.activeTour, state.currentStepIndex, tourHook]);

  const goToStep = useCallback((stepIndex: number) => {
    if (!state.activeTour) return;
    
    const clampedIndex = Math.max(0, Math.min(stepIndex, state.activeTour.steps.length - 1));
    
    tourHook.trackEvent({
      tour_id: state.activeTour.id,
      event_type: 'step_view',
      step_id: state.activeTour.steps[clampedIndex]?.id,
    });

    setState(prev => ({ ...prev, currentStepIndex: clampedIndex }));
  }, [state.activeTour, tourHook]);

  const nextStep = useCallback(() => {
    if (!state.activeTour) return;
    
    const nextIndex = state.currentStepIndex + 1;
    
    // Track step completion
    tourHook.trackEvent({
      tour_id: state.activeTour.id,
      event_type: 'step_complete',
      step_id: state.activeTour.steps[state.currentStepIndex]?.id,
    });

    if (nextIndex >= state.activeTour.steps.length) {
      completeTour();
    } else {
      tourHook.updateTourProgress(state.activeTour.id, nextIndex);
      goToStep(nextIndex);
    }
  }, [state.activeTour, state.currentStepIndex, tourHook, completeTour, goToStep]);

  const prevStep = useCallback(() => {
    goToStep(state.currentStepIndex - 1);
  }, [state.currentStepIndex, goToStep]);

  const openHelpPanel = useCallback(() => {
    setState(prev => ({ ...prev, isHelpPanelOpen: true }));
  }, []);

  const closeHelpPanel = useCallback(() => {
    setState(prev => ({ ...prev, isHelpPanelOpen: false }));
  }, []);

  const playVideo = useCallback((video: TourVideo) => {
    tourHook.trackEvent({
      tour_id: state.activeTour?.id || null,
      event_type: 'video_play',
      video_id: video.id,
    });
    setState(prev => ({ ...prev, currentVideo: video }));
  }, [state.activeTour, tourHook]);

  const closeVideo = useCallback(() => {
    if (state.currentVideo) {
      tourHook.trackEvent({
        tour_id: state.activeTour?.id || null,
        event_type: 'video_complete',
        video_id: state.currentVideo.id,
      });
    }
    setState(prev => ({ ...prev, currentVideo: null }));
  }, [state.activeTour, state.currentVideo, tourHook]);

  const trackEvent = useCallback((event: Parameters<typeof tourHook.trackEvent>[0]) => {
    tourHook.trackEvent(event);
  }, [tourHook]);

  const hasCompletedTour = useCallback((tourCode: string): boolean => {
    return tourHook.hasCompletedTour(tourCode);
  }, [tourHook]);

  const resetTourCompletion = useCallback(async (tourCode: string) => {
    await tourHook.resetTourCompletion(tourCode);
  }, [tourHook]);

  const value: TourContextType = {
    ...state,
    startTour,
    pauseTour,
    resumeTour,
    skipTour,
    completeTour,
    goToStep,
    nextStep,
    prevStep,
    openHelpPanel,
    closeHelpPanel,
    playVideo,
    closeVideo,
    trackEvent,
    hasCompletedTour,
    resetTourCompletion,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
}

export function useTourContext() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourContext must be used within a TourProvider');
  }
  return context;
}
