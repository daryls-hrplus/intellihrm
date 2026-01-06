import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { 
  Clock, MapPin, Camera, CheckCircle, XCircle, AlertTriangle,
  ArrowRight, Timer, CalendarClock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PunchDetails {
  id: string;
  employee_id: string;
  clock_in: string;
  clock_out: string | null;
  rounded_clock_in: string | null;
  rounded_clock_out: string | null;
  override_clock_in?: string | null;
  override_clock_out?: string | null;
  override_reason?: string | null;
  clock_in_location: string | null;
  clock_out_location: string | null;
  clock_in_latitude: number | null;
  clock_in_longitude: number | null;
  clock_out_latitude: number | null;
  clock_out_longitude: number | null;
  clock_in_photo_url: string | null;
  clock_out_photo_url: string | null;
  clock_in_within_geofence: boolean | null;
  clock_out_within_geofence: boolean | null;
  clock_in_face_verified: boolean | null;
  clock_out_face_verified: boolean | null;
  clock_in_method: string | null;
  clock_out_method: string | null;
  total_hours: number | null;
  regular_hours: number | null;
  overtime_hours: number | null;
  payable_hours?: number | null;
  payable_regular_hours?: number | null;
  payable_overtime_hours?: number | null;
  status: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  break_duration_minutes: number | null;
  rounding_rule_applied: string | null;
  employee?: { full_name: string };
}

interface PunchDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  punch: PunchDetails | null;
}

export function PunchDetailDialog({ open, onOpenChange, punch }: PunchDetailDialogProps) {
  if (!punch) return null;

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return format(new Date(dateStr), "h:mm:ss a");
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return format(new Date(dateStr), "EEE, MMM d 'at' h:mm a");
  };

  const hasRounding = punch.rounded_clock_in || punch.rounded_clock_out;
  const hasOverride = punch.override_clock_in || punch.override_clock_out;
  const clockInDiff = punch.rounded_clock_in && punch.clock_in 
    ? Math.round((new Date(punch.rounded_clock_in).getTime() - new Date(punch.clock_in).getTime()) / 60000)
    : 0;
  const clockOutDiff = punch.rounded_clock_out && punch.clock_out
    ? Math.round((new Date(punch.rounded_clock_out).getTime() - new Date(punch.clock_out).getTime()) / 60000)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Punch Details - {punch.employee?.full_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Summary */}
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={cn(
                punch.status === 'completed' && "bg-green-500/20 text-green-700 border-green-500/30",
                punch.status === 'in_progress' && "bg-blue-500/20 text-blue-700 border-blue-500/30",
                punch.status === 'pending' && "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
              )}
            >
              {punch.status}
            </Badge>
            <div className="text-sm text-muted-foreground">
              {format(new Date(punch.clock_in), "EEEE, MMMM d, yyyy")}
            </div>
          </div>

          {/* Clock In/Out Times */}
          <div className="grid grid-cols-2 gap-4">
            {/* Clock In Card */}
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <Clock className="h-4 w-4" />
                  Clock In
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Actual Time</span>
                    <p className="font-semibold">{formatTime(punch.clock_in)}</p>
                  </div>
                  
                  {punch.rounded_clock_in && (
                    <div>
                      <span className="text-xs text-muted-foreground">Rounded Time</span>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-primary">{formatTime(punch.rounded_clock_in)}</p>
                        {clockInDiff !== 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {clockInDiff > 0 ? '+' : ''}{clockInDiff} min
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {punch.scheduled_start && (
                    <div>
                      <span className="text-xs text-muted-foreground">Scheduled</span>
                      <p className="text-sm">{formatTime(punch.scheduled_start)}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t space-y-2">
                  {punch.clock_in_method && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Timer className="h-3 w-3" />
                      Method: {punch.clock_in_method}
                    </div>
                  )}
                  
                  {punch.clock_in_location && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {punch.clock_in_location}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {punch.clock_in_within_geofence === true && (
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        In Geofence
                      </Badge>
                    )}
                    {punch.clock_in_within_geofence === false && (
                      <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600">
                        <XCircle className="h-3 w-3 mr-1" />
                        Outside Geofence
                      </Badge>
                    )}
                    {punch.clock_in_face_verified && (
                      <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600">
                        <Camera className="h-3 w-3 mr-1" />
                        Face Verified
                      </Badge>
                    )}
                  </div>
                </div>

                {punch.clock_in_photo_url && (
                  <div className="pt-2">
                    <img 
                      src={punch.clock_in_photo_url} 
                      alt="Clock in photo" 
                      className="w-full h-24 object-cover rounded-md"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Clock Out Card */}
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                  <Clock className="h-4 w-4" />
                  Clock Out
                </div>
                
                {punch.clock_out ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Actual Time</span>
                      <p className="font-semibold">{formatTime(punch.clock_out)}</p>
                    </div>
                    
                    {punch.rounded_clock_out && (
                      <div>
                        <span className="text-xs text-muted-foreground">Rounded Time</span>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-primary">{formatTime(punch.rounded_clock_out)}</p>
                          {clockOutDiff !== 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {clockOutDiff > 0 ? '+' : ''}{clockOutDiff} min
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {punch.scheduled_end && (
                      <div>
                        <span className="text-xs text-muted-foreground">Scheduled</span>
                        <p className="text-sm">{formatTime(punch.scheduled_end)}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-600 py-4">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Still clocked in</span>
                  </div>
                )}

                {punch.clock_out && (
                  <div className="pt-2 border-t space-y-2">
                    {punch.clock_out_method && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Timer className="h-3 w-3" />
                        Method: {punch.clock_out_method}
                      </div>
                    )}
                    
                    {punch.clock_out_location && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {punch.clock_out_location}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      {punch.clock_out_within_geofence === true && (
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          In Geofence
                        </Badge>
                      )}
                      {punch.clock_out_within_geofence === false && (
                        <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600">
                          <XCircle className="h-3 w-3 mr-1" />
                          Outside Geofence
                        </Badge>
                      )}
                      {punch.clock_out_face_verified && (
                        <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600">
                          <Camera className="h-3 w-3 mr-1" />
                          Face Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {punch.clock_out_photo_url && (
                  <div className="pt-2">
                    <img 
                      src={punch.clock_out_photo_url} 
                      alt="Clock out photo" 
                      className="w-full h-24 object-cover rounded-md"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Override Info (if present) */}
          {hasOverride && (
            <Card className="border-orange-500/30 bg-orange-500/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  Timekeeper Override Applied
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {punch.override_clock_in && (
                    <div>
                      <span className="text-muted-foreground">Override Clock In:</span>
                      <p className="font-semibold text-orange-600">{formatTime(punch.override_clock_in)}</p>
                    </div>
                  )}
                  {punch.override_clock_out && (
                    <div>
                      <span className="text-muted-foreground">Override Clock Out:</span>
                      <p className="font-semibold text-orange-600">{formatTime(punch.override_clock_out)}</p>
                    </div>
                  )}
                </div>
                
                {punch.override_reason && (
                  <div className="mt-3 pt-3 border-t border-orange-500/20">
                    <span className="text-xs text-muted-foreground">Reason:</span>
                    <p className="text-sm">{punch.override_reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Hours Summary */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3 text-sm font-medium">
                <CalendarClock className="h-4 w-4" />
                Hours Summary
                {hasRounding && (
                  <Badge variant="secondary" className="text-xs">
                    Rounding Applied
                  </Badge>
                )}
                {hasOverride && (
                  <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 ml-auto">
                    Override Applied
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className={`text-2xl font-bold ${hasOverride ? 'text-orange-600' : ''}`}>
                    {(punch.payable_hours || punch.total_hours)?.toFixed(2) || '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">Payable Hours</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {(punch.payable_regular_hours || punch.regular_hours)?.toFixed(2) || '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">Regular</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {(punch.payable_overtime_hours || punch.overtime_hours)?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-xs text-muted-foreground">Overtime</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{punch.break_duration_minutes || 0}</p>
                  <p className="text-xs text-muted-foreground">Break (min)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GPS Coordinates (if available) */}
          {(punch.clock_in_latitude || punch.clock_out_latitude) && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3 text-sm font-medium">
                  <MapPin className="h-4 w-4" />
                  GPS Coordinates
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  {punch.clock_in_latitude && (
                    <div>
                      <span className="text-muted-foreground">Clock In:</span>
                      <p className="font-mono">{punch.clock_in_latitude.toFixed(6)}, {punch.clock_in_longitude?.toFixed(6)}</p>
                    </div>
                  )}
                  {punch.clock_out_latitude && (
                    <div>
                      <span className="text-muted-foreground">Clock Out:</span>
                      <p className="font-mono">{punch.clock_out_latitude.toFixed(6)}, {punch.clock_out_longitude?.toFixed(6)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
