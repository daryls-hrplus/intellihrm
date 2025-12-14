import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isSameMonth, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { Cake, Award, Calendar, PartyPopper } from "lucide-react";

interface Milestone {
  id: string;
  milestone_type: string;
  milestone_date: string;
  years_of_service: number | null;
  title: string | null;
  employee: { full_name: string };
}

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const thisMonth = new Date();
  const nextMonth = addMonths(thisMonth, 1);

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    setIsLoading(true);
    try {
      // Get milestones for this month and next month
      const startDate = startOfMonth(thisMonth);
      const endDate = endOfMonth(nextMonth);

      const { data } = await supabase
        .from("employee_milestones")
        .select(`
          *,
          employee:profiles(full_name)
        `)
        .gte("milestone_date", startDate.toISOString())
        .lte("milestone_date", endDate.toISOString())
        .order("milestone_date");

      setMilestones((data || []) as Milestone[]);
    } catch (error) {
      console.error("Error loading milestones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "birthday":
        return <Cake className="h-5 w-5 text-pink-500" />;
      case "work_anniversary":
        return <Award className="h-5 w-5 text-yellow-500" />;
      default:
        return <PartyPopper className="h-5 w-5 text-purple-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "birthday":
        return "Birthday";
      case "work_anniversary":
        return "Work Anniversary";
      case "promotion":
        return "Promotion";
      default:
        return "Celebration";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "birthday":
        return "bg-pink-500/20 text-pink-700";
      case "work_anniversary":
        return "bg-yellow-500/20 text-yellow-700";
      case "promotion":
        return "bg-green-500/20 text-green-700";
      default:
        return "bg-purple-500/20 text-purple-700";
    }
  };

  const thisMonthMilestones = milestones.filter(m => isSameMonth(new Date(m.milestone_date), thisMonth));
  const nextMonthMilestones = milestones.filter(m => isSameMonth(new Date(m.milestone_date), nextMonth));

  const MilestoneList = ({ items }: { items: Milestone[] }) => (
    items.length === 0 ? (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No milestones this period</p>
      </div>
    ) : (
      <div className="space-y-4">
        {items.map((milestone) => (
          <Card key={milestone.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-muted">
                  {getIcon(milestone.milestone_type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{milestone.employee.full_name}</h3>
                    <Badge className={getTypeColor(milestone.milestone_type)}>
                      {getTypeLabel(milestone.milestone_type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(milestone.milestone_date), "EEEE, MMMM d")}
                    {milestone.years_of_service && ` • ${milestone.years_of_service} years`}
                  </p>
                  {milestone.title && (
                    <p className="text-sm mt-1">{milestone.title}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  );

  const breadcrumbItems = [
    { label: "Employee Self-Service", href: "/ess" },
    { label: "Celebrations" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center gap-3">
          <PartyPopper className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Celebrations</h1>
            <p className="text-muted-foreground">Birthdays, work anniversaries, and milestones</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading celebrations...</div>
        ) : (
          <Tabs defaultValue="this-month" className="space-y-4">
            <TabsList>
              <TabsTrigger value="this-month" className="gap-2">
                <Calendar className="h-4 w-4" />
                This Month ({thisMonthMilestones.length})
              </TabsTrigger>
              <TabsTrigger value="next-month" className="gap-2">
                <Calendar className="h-4 w-4" />
                Next Month ({nextMonthMilestones.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="this-month">
              <Card>
                <CardHeader>
                  <CardTitle>{format(thisMonth, "MMMM yyyy")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <MilestoneList items={thisMonthMilestones} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="next-month">
              <Card>
                <CardHeader>
                  <CardTitle>{format(nextMonth, "MMMM yyyy")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <MilestoneList items={nextMonthMilestones} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
