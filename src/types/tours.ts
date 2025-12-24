// Tour System Types

export interface Tour {
  id: string;
  tour_code: string;
  tour_name: string;
  description: string | null;
  module_code: string;
  feature_code: string | null;
  target_roles: string[];
  tour_type: 'walkthrough' | 'spotlight' | 'announcement';
  is_active: boolean;
  priority: number;
  estimated_duration_seconds: number | null;
  auto_trigger_on: 'first_visit' | 'first_action' | 'schedule' | 'manual' | null;
  trigger_route: string | null;
  company_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TourStep {
  id: string;
  tour_id: string;
  step_order: number;
  target_selector: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'auto' | 'center';
  video_id: string | null;
  highlight_type: 'spotlight' | 'tooltip' | 'modal' | 'beacon';
  action_type: 'click' | 'input' | 'hover' | 'scroll' | 'wait' | 'none' | null;
  action_target: string | null;
  skip_if_missing: boolean;
  disable_overlay: boolean;
  disable_scroll: boolean;
  spot_light_padding: number;
  created_at: string;
  // Joined data
  video?: TourVideo | null;
}

export interface TourVideo {
  id: string;
  title: string;
  video_url: string;
  video_provider: 'trupeer' | 'guidde' | 'youtube' | 'vimeo' | 'other';
  duration_seconds: number | null;
  thumbnail_url: string | null;
}

export interface TourCompletion {
  id: string;
  user_id: string;
  tour_id: string;
  company_id: string | null;
  started_at: string;
  completed_at: string | null;
  last_step_completed: number;
  total_steps: number | null;
  was_skipped: boolean;
  feedback_rating: number | null;
  feedback_comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface HelpTooltip {
  id: string;
  tooltip_code: string;
  module_code: string;
  feature_code: string | null;
  element_selector: string;
  title: string | null;
  content: string;
  video_id: string | null;
  learn_more_url: string | null;
  target_roles: string[];
  is_active: boolean;
  company_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFeatureVisit {
  id: string;
  user_id: string;
  company_id: string | null;
  module_code: string;
  feature_code: string;
  first_visit_at: string;
  visit_count: number;
  last_visit_at: string;
  tour_triggered: boolean;
  tour_completed: boolean;
}

export interface TourAnalyticsEvent {
  tour_id: string | null;
  user_id: string;
  company_id: string | null;
  event_type: 'start' | 'step_view' | 'step_complete' | 'skip' | 'finish' | 'abandon' | 'video_play' | 'video_complete' | 'feedback';
  step_id?: string | null;
  video_id?: string | null;
  event_data?: Record<string, unknown>;
  session_id?: string;
}

export interface TourAnalyticsSummary {
  tour_id: string;
  tour_code: string;
  tour_name: string;
  module_code: string;
  is_active: boolean;
  total_starts: number;
  total_completions: number;
  total_skips: number;
  total_abandons: number;
  video_plays: number;
  completion_rate: number | null;
  avg_feedback_rating: number | null;
}

export interface TourWithSteps extends Tour {
  steps: TourStep[];
}

// Joyride step format for react-joyride
export interface JoyrideStep {
  target: string;
  content: React.ReactNode;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto' | 'center';
  disableBeacon?: boolean;
  disableOverlay?: boolean;
  disableScrolling?: boolean;
  spotlightPadding?: number;
  styles?: Record<string, unknown>;
  // Custom data
  stepId?: string;
  videoId?: string | null;
}

// Tour context state
export interface TourState {
  activeTour: TourWithSteps | null;
  currentStepIndex: number;
  isRunning: boolean;
  isPaused: boolean;
  isHelpPanelOpen: boolean;
  currentVideo: TourVideo | null;
}

// Tour context actions
export interface TourActions {
  startTour: (tourCode: string) => Promise<void>;
  pauseTour: () => void;
  resumeTour: () => void;
  skipTour: () => void;
  completeTour: () => void;
  goToStep: (stepIndex: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  openHelpPanel: () => void;
  closeHelpPanel: () => void;
  playVideo: (video: TourVideo) => void;
  closeVideo: () => void;
  trackEvent: (event: Omit<TourAnalyticsEvent, 'user_id' | 'company_id'>) => void;
  hasCompletedTour: (tourCode: string) => boolean;
  resetTourCompletion: (tourCode: string) => Promise<void>;
}

export type TourContextType = TourState & TourActions;
