import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Clock, Camera, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useVirtualClock } from '@/hooks/useVirtualClock';
import { useGeolocation } from '@/hooks/useGeolocation';
import { FaceCaptureDialog } from '@/components/time-attendance/FaceCaptureDialog';
import { format } from 'date-fns';

export function VirtualClock() {
  const { t } = useTranslation();
  const {
    currentEntry,
    isClockedIn,
    isLoading,
    workDuration,
    clockIn,
    clockOut,
  } = useVirtualClock();

  const { getCurrentPosition, loading: geoLoading } = useGeolocation();

  const [isOpen, setIsOpen] = useState(false);
  const [useFaceCapture, setUseFaceCapture] = useState(false);
  const [useLocation, setUseLocation] = useState(false);
  const [faceCaptureOpen, setFaceCaptureOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'in' | 'out' | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const handleClockAction = async (action: 'in' | 'out') => {
    if (useFaceCapture) {
      setPendingAction(action);
      setFaceCaptureOpen(true);
      return;
    }

    await executeClockAction(action, null);
  };

  const executeClockAction = async (action: 'in' | 'out', photoUrl: string | null) => {
    let latitude: number | null = null;
    let longitude: number | null = null;

    if (useLocation) {
      try {
        const position = await getCurrentPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (error) {
        console.error('Failed to get location:', error);
      }
    }

    if (action === 'in') {
      await clockIn(photoUrl, latitude, longitude);
    } else {
      await clockOut(photoUrl, latitude, longitude);
    }

    setCapturedPhoto(null);
    setPendingAction(null);
  };

  const handleFaceCapture = async (photoDataUrl: string) => {
    setCapturedPhoto(photoDataUrl);
    setFaceCaptureOpen(false);
    if (pendingAction) {
      await executeClockAction(pendingAction, photoDataUrl);
    }
  };

  const clockInTime = currentEntry?.clock_in
    ? format(new Date(currentEntry.clock_in), 'HH:mm')
    : null;

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Clock className={`h-5 w-5 ${isClockedIn ? 'text-primary' : ''}`} />
            {isClockedIn && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">{t('virtualClock.title')}</h4>
              <Badge variant={isClockedIn ? 'default' : 'secondary'}>
                {isClockedIn ? t('virtualClock.clockedIn') : t('virtualClock.clockedOut')}
              </Badge>
            </div>

            {/* Status Display */}
            {isClockedIn && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('virtualClock.clockedInSince')}</span>
                  <span className="font-medium">{clockInTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('virtualClock.workingFor')}</span>
                  <span className="font-mono text-lg font-bold text-primary">{workDuration}</span>
                </div>
              </div>
            )}

            <Separator />

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="face-capture" className="text-sm cursor-pointer">
                    {t('virtualClock.capturePhoto')}
                  </Label>
                </div>
                <Switch
                  id="face-capture"
                  checked={useFaceCapture}
                  onCheckedChange={setUseFaceCapture}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="location" className="text-sm cursor-pointer">
                    {t('virtualClock.captureLocation')}
                  </Label>
                </div>
                <Switch
                  id="location"
                  checked={useLocation}
                  onCheckedChange={setUseLocation}
                />
              </div>
            </div>

            <Separator />

            {/* Action Button */}
            <Button
              className="w-full"
              variant={isClockedIn ? 'destructive' : 'default'}
              onClick={() => handleClockAction(isClockedIn ? 'out' : 'in')}
              disabled={isLoading || geoLoading}
            >
              {(isLoading || geoLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isClockedIn ? t('virtualClock.clockOut') : t('virtualClock.clockIn')}
            </Button>

            {/* Link to full page */}
            <NavLink
              to="/ess/my-time-attendance"
              onClick={() => setIsOpen(false)}
              className="block"
            >
              <Button variant="outline" size="sm" className="w-full">
                {t('virtualClock.viewDetails')}
              </Button>
            </NavLink>
          </div>
        </PopoverContent>
      </Popover>

      {/* Face Capture Dialog */}
      <FaceCaptureDialog
        open={faceCaptureOpen}
        onOpenChange={(open) => {
          setFaceCaptureOpen(open);
          if (!open) {
            setPendingAction(null);
          }
        }}
        onCapture={handleFaceCapture}
        title={pendingAction === 'in' ? t('virtualClock.clockInPhoto') : t('virtualClock.clockOutPhoto')}
        description={t('virtualClock.capturePhotoDescription')}
      />
    </>
  );
}
