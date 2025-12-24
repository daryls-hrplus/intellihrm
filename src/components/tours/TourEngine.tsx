import { useCallback, useMemo } from 'react';
import Joyride, { CallBackProps, STATUS, EVENTS, ACTIONS, Step } from 'react-joyride';
import { useTourContext } from './TourProvider';
import { TourTooltip } from './TourTooltip';

export function TourEngine() {
  const { 
    activeTour, 
    currentStepIndex, 
    isRunning, 
    isPaused,
    nextStep,
    prevStep,
    skipTour,
    goToStep,
  } = useTourContext();

  // Convert our steps to Joyride format
  const joyrideSteps: Step[] = useMemo(() => {
    if (!activeTour) return [];
    
    return activeTour.steps.map((step, index) => ({
      target: step.target_selector,
      content: step.content,
      title: step.title,
      placement: step.placement as Step['placement'],
      disableBeacon: true,
      disableOverlay: step.disable_overlay,
      disableScrolling: step.disable_scroll,
      spotlightPadding: step.spot_light_padding,
      data: {
        stepId: step.id,
        videoId: step.video_id,
        video: step.video,
        stepIndex: index,
        totalSteps: activeTour.steps.length,
      },
    }));
  }, [activeTour]);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { action, index, status, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      if (status === STATUS.SKIPPED) {
        skipTour();
      }
      return;
    }

    if (type === EVENTS.STEP_AFTER) {
      if (action === ACTIONS.NEXT) {
        nextStep();
      } else if (action === ACTIONS.PREV) {
        prevStep();
      }
    }

    if (type === EVENTS.TARGET_NOT_FOUND) {
      // Skip missing elements if configured
      const currentStep = activeTour?.steps[index];
      if (currentStep?.skip_if_missing) {
        nextStep();
      }
    }
  }, [activeTour, nextStep, prevStep, skipTour]);

  if (!activeTour || !isRunning) {
    return null;
  }

  return (
    <Joyride
      steps={joyrideSteps}
      stepIndex={currentStepIndex}
      run={isRunning && !isPaused}
      continuous
      showProgress
      showSkipButton
      hideCloseButton={false}
      disableOverlayClose
      callback={handleJoyrideCallback}
      tooltipComponent={TourTooltip}
      styles={{
        options: {
          zIndex: 10000,
          arrowColor: 'hsl(var(--card))',
          backgroundColor: 'hsl(var(--card))',
          primaryColor: 'hsl(var(--primary))',
          textColor: 'hsl(var(--foreground))',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        },
        spotlight: {
          borderRadius: 8,
        },
      }}
      locale={{
        back: 'Previous',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
}
