import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Users, Settings, Play, MoreVertical } from "lucide-react";
import { CalibrationSession, STATUS_CONFIG } from "@/types/calibration";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CalibrationSessionCardProps {
  session: CalibrationSession;
  onOpen: () => void;
  onEdit: () => void;
}

export function CalibrationSessionCard({ session, onOpen, onEdit }: CalibrationSessionCardProps) {
  const statusConfig = STATUS_CONFIG[session.status];
  const participantCount = session.participants?.length || 0;
  
  const hasForceDistribution = session.calibration_rules?.force_distribution;
  const maxTop = session.calibration_rules?.max_rating_5_percent;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{session.name}</CardTitle>
            <Badge variant="secondary" className={`${statusConfig.color} text-white`}>
              {statusConfig.label}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onOpen}>
                <Play className="h-4 w-4 mr-2" />
                Open Workspace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {session.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {session.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {session.scheduled_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(session.scheduled_date), "MMM d, yyyy")}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {participantCount} participants
          </div>
        </div>

        {hasForceDistribution && maxTop && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Force Distribution: Max {maxTop}% top rating
            </Badge>
          </div>
        )}

        {participantCount > 0 && (
          <div className="flex -space-x-2">
            {session.participants.slice(0, 5).map((participantId, idx) => (
              <Avatar key={participantId} className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="text-xs">
                  {String.fromCharCode(65 + idx)}
                </AvatarFallback>
              </Avatar>
            ))}
            {participantCount > 5 && (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                +{participantCount - 5}
              </div>
            )}
          </div>
        )}

        <Button onClick={onOpen} className="w-full">
          <Play className="h-4 w-4 mr-2" />
          {session.status === 'completed' ? 'View Results' : 'Open Workspace'}
        </Button>
      </CardContent>
    </Card>
  );
}
