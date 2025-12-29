import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { 
  useMultiLocationScheduling, 
  ShiftAssignmentWithLocation,
  BranchLocation 
} from "@/hooks/useMultiLocationScheduling";
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Calendar
} from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, getDay } from "date-fns";

interface MultiLocationScheduleTabProps {
  companyId: string | null;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function MultiLocationScheduleTab({ companyId }: MultiLocationScheduleTabProps) {
  const { t } = useTranslation();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [assignments, setAssignments] = useState<ShiftAssignmentWithLocation[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const {
    locations,
    staffingRequirements,
    isLoading,
    fetchAssignmentsByDateRange,
    calculateCoverage
  } = useMultiLocationScheduling(companyId);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Fetch assignments for current week
  useEffect(() => {
    const loadAssignments = async () => {
      if (!companyId) return;
      setLoadingAssignments(true);
      try {
        const data = await fetchAssignmentsByDateRange(
          format(weekStart, 'yyyy-MM-dd'),
          format(weekEnd, 'yyyy-MM-dd')
        );
        setAssignments(data);
      } catch (error) {
        console.error('Error loading assignments:', error);
      } finally {
        setLoadingAssignments(false);
      }
    };
    loadAssignments();
  }, [companyId, weekStart.toISOString()]);

  // Filter locations for display
  const displayLocations = useMemo(() => {
    if (selectedLocation === "all") return locations;
    return locations.filter(l => l.id === selectedLocation);
  }, [locations, selectedLocation]);

  // Get assignments for a specific location and day
  const getLocationDayAssignments = (locationId: string, day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return assignments.filter(a => {
      if (a.location_id !== locationId) return false;
      if (dayStr < a.effective_date) return false;
      if (a.end_date && dayStr > a.end_date) return false;
      return true;
    });
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    let totalStaff = 0;
    let understaffedSlots = 0;
    let optimalSlots = 0;

    locations.forEach(location => {
      weekDays.forEach(day => {
        const dayOfWeek = getDay(day);
        const coverage = calculateCoverage(location.id, dayOfWeek, assignments);
        totalStaff += coverage.current;
        if (coverage.status === 'understaffed') understaffedSlots++;
        if (coverage.status === 'optimal') optimalSlots++;
      });
    });

    return { totalStaff, understaffedSlots, optimalSlots };
  }, [locations, weekDays, assignments, calculateCoverage]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
  };

  const getCoverageColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-success';
      case 'adequate': return 'text-warning';
      case 'understaffed': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getCoverageBg = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-success/10';
      case 'adequate': return 'bg-warning/10';
      case 'understaffed': return 'bg-destructive/10';
      default: return 'bg-muted';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Locations</p>
              <p className="text-xl font-semibold">{locations.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
              <Users className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Staff Assigned</p>
              <p className="text-xl font-semibold">{summaryStats.totalStaff}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Optimal Coverage</p>
              <p className="text-xl font-semibold">{summaryStats.optimalSlots}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Understaffed</p>
              <p className="text-xl font-semibold">{summaryStats.understaffedSlots}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </h2>
              <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentWeek(new Date())}>
                This Week
              </Button>
            </div>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {loc.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Multi-Location Schedule Grid */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          {displayLocations.map((location) => (
            <Card key={location.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{location.name}</CardTitle>
                      <CardDescription>{location.city || location.code}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  {/* Week Days Header */}
                  <div className="grid grid-cols-7 bg-muted">
                    {weekDays.map((day, idx) => (
                      <div key={idx} className="p-3 text-center border-b">
                        <div className="font-medium">{format(day, 'EEE')}</div>
                        <div className="text-sm text-muted-foreground">{format(day, 'MMM d')}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Schedule Grid */}
                  <div className="grid grid-cols-7">
                    {weekDays.map((day, idx) => {
                      const dayOfWeek = getDay(day);
                      const dayAssignments = getLocationDayAssignments(location.id, day);
                      const coverage = calculateCoverage(location.id, dayOfWeek, assignments);
                      
                      return (
                        <div
                          key={idx}
                          className={`min-h-[140px] p-2 border-r border-b ${getCoverageBg(coverage.status)}`}
                        >
                          {/* Coverage indicator */}
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className={`text-xs ${getCoverageColor(coverage.status)}`}>
                              {coverage.current}/{coverage.minimum}
                            </Badge>
                          </div>
                          
                          {/* Assigned staff */}
                          <div className="space-y-1">
                            <TooltipProvider>
                              {dayAssignments.slice(0, 4).map((assignment) => (
                                <Tooltip key={assignment.id}>
                                  <TooltipTrigger asChild>
                                    <div
                                      className="flex items-center gap-1.5 text-xs px-2 py-1 rounded bg-background border cursor-default"
                                    >
                                      <Avatar className="h-4 w-4">
                                        <AvatarImage src={assignment.profile?.avatar_url || undefined} />
                                        <AvatarFallback className="text-[8px]">
                                          {assignment.profile?.full_name?.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="truncate">
                                        {assignment.profile?.full_name?.split(' ')[0]}
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="right">
                                    <div className="space-y-1">
                                      <p className="font-medium">{assignment.profile?.full_name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {assignment.shift?.name}
                                      </p>
                                      <p className="text-xs">
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        {assignment.shift?.start_time} - {assignment.shift?.end_time}
                                      </p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                              {dayAssignments.length > 4 && (
                                <div className="text-xs text-muted-foreground px-2">
                                  +{dayAssignments.length - 4} more
                                </div>
                              )}
                              {dayAssignments.length === 0 && (
                                <div className="text-xs text-muted-foreground italic">
                                  No staff assigned
                                </div>
                              )}
                            </TooltipProvider>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {displayLocations.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Locations Found</h3>
                <p className="text-muted-foreground text-center">
                  No branch locations are configured for this company.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coverage Analysis by Location</CardTitle>
              <CardDescription>
                Weekly staffing coverage compared to requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    {DAYS_OF_WEEK.map(day => (
                      <TableHead key={day} className="text-center">{day.slice(0, 3)}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{location.name}</span>
                        </div>
                      </TableCell>
                      {weekDays.map((day, idx) => {
                        const dayOfWeek = getDay(day);
                        const coverage = calculateCoverage(location.id, dayOfWeek, assignments);
                        const percentage = coverage.optimal > 0 
                          ? Math.min((coverage.current / coverage.optimal) * 100, 100) 
                          : 100;
                        
                        return (
                          <TableCell key={idx} className="text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="space-y-1">
                                    <Badge 
                                      variant={coverage.status === 'optimal' ? 'default' : 
                                               coverage.status === 'adequate' ? 'secondary' : 'destructive'}
                                      className="text-xs"
                                    >
                                      {coverage.current}/{coverage.minimum}
                                    </Badge>
                                    <Progress value={percentage} className="h-1" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Current: {coverage.current}</p>
                                  <p>Minimum: {coverage.minimum}</p>
                                  <p>Optimal: {coverage.optimal}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Coverage Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm">Optimal (meets target)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-sm">Adequate (meets minimum)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-sm">Understaffed (below minimum)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
