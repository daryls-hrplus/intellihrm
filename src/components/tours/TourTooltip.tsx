import { TooltipRenderProps } from 'react-joyride';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, Video, SkipForward } from 'lucide-react';
import { useTourContext } from './TourProvider';
import { TourVideo } from '@/types/tours';

interface StepData {
  stepId: string;
  videoId: string | null;
  video: TourVideo | null;
  stepIndex: number;
  totalSteps: number;
}

export function TourTooltip(props: TooltipRenderProps) {
  const { 
    backProps, 
    closeProps, 
    continuous, 
    index, 
    isLastStep, 
    primaryProps, 
    skipProps, 
    step, 
    tooltipProps,
  } = props;

  const { playVideo, skipTour } = useTourContext();
  
  const stepData = step.data as StepData | undefined;
  const currentStep = stepData?.stepIndex ?? index;
  const totalSteps = stepData?.totalSteps ?? 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const hasVideo = !!stepData?.video;

  const handleWatchVideo = () => {
    if (stepData?.video) {
      playVideo(stepData.video);
    }
  };

  return (
    <Card 
      {...tooltipProps} 
      className="w-[320px] md:w-[400px] shadow-xl border-border/50 z-[10001]"
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                Step {currentStep + 1} of {totalSteps}
              </Badge>
              {hasVideo && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Video className="h-3 w-3" />
                  Video
                </Badge>
              )}
            </div>
            {step.title && (
              <CardTitle className="text-base font-semibold leading-tight">
                {step.title}
              </CardTitle>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            {...closeProps}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={progress} className="h-1 mt-2" />
      </CardHeader>

      <CardContent className="py-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.content}
        </p>
        
        {hasVideo && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3 gap-2 w-full"
            onClick={handleWatchVideo}
          >
            <Video className="h-4 w-4" />
            Watch Tutorial Video
          </Button>
        )}
      </CardContent>

      <CardFooter className="pt-2 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => skipTour()}
        >
          <SkipForward className="h-4 w-4 mr-1" />
          Skip Tour
        </Button>
        
        <div className="flex items-center gap-2">
          {index > 0 && (
            <Button variant="outline" size="sm" {...backProps}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          
          {continuous && (
            <Button size="sm" {...primaryProps}>
              {isLastStep ? (
                'Finish'
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
