import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Award, ExternalLink, Calendar, Clock, Download, Filter } from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface TrainingHistoryTabProps {
  employeeId?: string;
  companyId: string;
}

interface LMSEnrollment {
  id: string;
  course_id: string;
  status: string;
  progress: number;
  completed_at: string | null;
  enrolled_at: string;
  course: {
    title: string;
    duration_hours: number;
    category: string;
  } | null;
}

interface ExternalTraining {
  id: string;
  training_name: string;
  provider_name: string | null;
  end_date: string | null;
  duration_hours: number | null;
  certificate_url: string | null;
}

interface Certificate {
  id: string;
  certificate_number: string;
  issued_at: string;
  course: {
    title: string;
  } | null;
}

interface TrainingRequest {
  id: string;
  training_name: string;
  request_type: string;
  status: string;
  source_type: string | null;
  source_module: string | null;
  created_at: string;
  approved_at: string | null;
}

export function TrainingHistoryTab({ employeeId, companyId }: TrainingHistoryTabProps) {
  const [lmsEnrollments, setLmsEnrollments] = useState<LMSEnrollment[]>([]);
  const [externalTraining, setExternalTraining] = useState<ExternalTraining[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (employeeId || companyId) {
      loadData();
    }
  }, [employeeId, companyId]);

  const loadData = async () => {
    setLoading(true);
    
    const baseFilter = employeeId 
      ? { column: 'user_id', value: employeeId }
      : null;

    const [enrollmentsRes, externalRes, certsRes, requestsRes] = await Promise.all([
      // LMS Enrollments
      supabase
        .from('lms_enrollments')
        .select(`
          id, status, progress, completed_at, enrolled_at,
          course:lms_courses(title, duration_hours, category)
        `)
        .eq(baseFilter ? 'user_id' : 'id', baseFilter?.value || '')
        .order('enrolled_at', { ascending: false }),
      
      // External Training
      supabase
        .from('external_training_records')
        .select('id, training_name, provider_name, end_date, duration_hours, certificate_url')
        .eq(employeeId ? 'employee_id' : 'company_id', employeeId || companyId)
        .order('end_date', { ascending: false }),
      
      // Certificates
      supabase
        .from('lms_certificates')
        .select(`
          id, certificate_number, issued_at,
          course:lms_courses(title)
        `)
        .eq(baseFilter ? 'user_id' : 'id', baseFilter?.value || '')
        .order('issued_at', { ascending: false }),
      
      // Training Requests
      supabase
        .from('training_requests')
        .select('id, training_name, request_type, status, source_type, source_module, created_at, approved_at')
        .eq(employeeId ? 'employee_id' : 'company_id', employeeId || companyId)
        .in('status', ['completed', 'approved'])
        .order('created_at', { ascending: false })
    ]);

    if (enrollmentsRes.data) setLmsEnrollments(enrollmentsRes.data as unknown as LMSEnrollment[]);
    if (externalRes.data) setExternalTraining(externalRes.data as ExternalTraining[]);
    if (certsRes.data) setCertificates(certsRes.data as unknown as Certificate[]);
    if (requestsRes.data) setRequests(requestsRes.data as TrainingRequest[]);
    
    setLoading(false);
  };

  const getYears = () => {
    const allDates = [
      ...lmsEnrollments.map(e => e.completed_at || e.enrolled_at),
      ...externalTraining.map(e => e.end_date),
      ...certificates.map(c => c.issued_at),
      ...requests.map(r => r.approved_at || r.created_at)
    ].filter(Boolean);
    
    const years = [...new Set(allDates.map(d => new Date(d!).getFullYear()))];
    return years.sort((a, b) => b - a);
  };

  const filterByYear = <T extends { [key: string]: any }>(items: T[], dateField: string): T[] => {
    if (yearFilter === "all") return items;
    return items.filter(item => {
      const date = item[dateField];
      if (!date) return false;
      return new Date(date).getFullYear().toString() === yearFilter;
    });
  };

  const completedEnrollments = lmsEnrollments.filter(e => e.status === 'completed');
  const totalHours = 
    completedEnrollments.reduce((sum, e) => sum + (e.course?.duration_hours || 0), 0) +
    externalTraining.reduce((sum, e) => sum + (e.duration_hours || 0), 0);

  const getSourceBadge = (sourceType: string | null) => {
    if (!sourceType) return null;
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      onboarding: { label: "Onboarding", variant: "secondary" },
      appraisal: { label: "Appraisal", variant: "default" },
      recertification: { label: "Recertification", variant: "outline" },
      competency_gap: { label: "Gap Analysis", variant: "secondary" },
      manual: { label: "Manual", variant: "outline" }
    };
    const config = variants[sourceType] || { label: sourceType, variant: "outline" };
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  if (loading) {
    return <div className="p-4">Loading training history...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{completedEnrollments.length}</p>
                <p className="text-sm text-muted-foreground">Courses Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalHours}</p>
                <p className="text-sm text-muted-foreground">Training Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{certificates.length}</p>
                <p className="text-sm text-muted-foreground">Certificates Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{externalTraining.length}</p>
                <p className="text-sm text-muted-foreground">External Training</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {getYears().map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export History
        </Button>
      </div>

      {/* Training History Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Training</TabsTrigger>
          <TabsTrigger value="lms">LMS Courses ({completedEnrollments.length})</TabsTrigger>
          <TabsTrigger value="external">External ({externalTraining.length})</TabsTrigger>
          <TabsTrigger value="certs">Certificates ({certificates.length})</TabsTrigger>
          <TabsTrigger value="requests">Requests ({requests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Complete Training Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {/* Combine and sort all items by date */}
                  {[
                    ...filterByYear(completedEnrollments, 'completed_at').map(e => ({
                      type: 'lms',
                      date: e.completed_at || e.enrolled_at,
                      title: e.course?.title || 'Unknown Course',
                      subtitle: `${e.course?.duration_hours || 0}h • ${e.course?.category || 'General'}`,
                      id: e.id
                    })),
                    ...filterByYear(externalTraining, 'end_date').map(e => ({
                      type: 'external',
                      date: e.end_date || '',
                      title: e.training_name,
                      subtitle: `${e.provider_name || 'External'} • ${e.duration_hours || 0}h`,
                      id: e.id
                    })),
                    ...filterByYear(certificates, 'issued_at').map(c => ({
                      type: 'cert',
                      date: c.issued_at,
                      title: c.course?.title || 'Certificate',
                      subtitle: `Certificate #${c.certificate_number}`,
                      id: c.id
                    }))
                  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(item => (
                    <div key={`${item.type}-${item.id}`} className="flex items-start gap-4 p-3 rounded-lg border">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {item.type === 'lms' && <BookOpen className="h-5 w-5" />}
                        {item.type === 'external' && <ExternalLink className="h-5 w-5" />}
                        {item.type === 'cert' && <Award className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDateForDisplay(item.date, "MMM d, yyyy")}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lms">
          <Card>
            <CardHeader>
              <CardTitle>LMS Course Completions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filterByYear(completedEnrollments, 'completed_at').map(enrollment => (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{enrollment.course?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.course?.category} • {enrollment.course?.duration_hours}h
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">Completed</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {enrollment.completed_at && formatDateForDisplay(enrollment.completed_at, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="external">
          <Card>
            <CardHeader>
              <CardTitle>External Training Records</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filterByYear(externalTraining, 'end_date').map(training => (
                    <div key={training.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <ExternalLink className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{training.training_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {training.provider_name || 'External Provider'} • {training.duration_hours || 0}h
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {training.end_date && formatDateForDisplay(training.end_date, "MMM d, yyyy")}
                        </p>
                        {training.certificate_url && (
                          <Button variant="link" size="sm" asChild>
                            <a href={training.certificate_url} target="_blank" rel="noopener noreferrer">
                              View Certificate
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certs">
          <Card>
            <CardHeader>
              <CardTitle>Certificates Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filterByYear(certificates, 'issued_at').map(cert => (
                    <div key={cert.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">{cert.course?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Certificate #{cert.certificate_number}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Issued {formatDateForDisplay(cert.issued_at, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Training Requests History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filterByYear(requests, 'created_at').map(request => (
                    <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{request.training_name}</p>
                            {getSourceBadge(request.source_type)}
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">
                            {request.request_type} • {request.source_module || 'Manual Request'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                          {request.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDateForDisplay(request.approved_at || request.created_at, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
