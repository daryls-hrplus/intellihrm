import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { History, ChevronRight, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EssCompensationHistoryPage() {
  const { user } = useAuth();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["my-compensation-history", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("compensation_history")
        .select("*")
        .eq("employee_id", user.id)
        .order("effective_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const getChangeTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      hire: "bg-emerald-500/10 text-emerald-600",
      promotion: "bg-violet-500/10 text-violet-600",
      merit: "bg-sky-500/10 text-sky-600",
      adjustment: "bg-amber-500/10 text-amber-600",
      demotion: "bg-red-500/10 text-red-600",
    };
    return <Badge className={colors[type] || "bg-muted"}>{type}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/ess" className="hover:text-foreground transition-colors">Employee Self Service</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/ess/compensation" className="hover:text-foreground transition-colors">My Compensation</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">History</span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Compensation History</h1>
            <p className="text-muted-foreground">View your salary changes over time</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Salary History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No compensation history found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Change Type</TableHead>
                    <TableHead className="text-right">Previous Salary</TableHead>
                    <TableHead className="text-right">New Salary</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{format(new Date(item.effective_date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{getChangeTypeBadge(item.change_type)}</TableCell>
                      <TableCell className="text-right">
                        ${item.previous_salary?.toLocaleString() || "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${item.new_salary?.toLocaleString() || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.change_amount ? (
                          <span className={item.change_amount > 0 ? "text-emerald-600" : "text-red-600"}>
                            {item.change_amount > 0 ? "+" : ""}${item.change_amount?.toLocaleString()}
                            {item.change_percentage && (
                              <span className="ml-1 text-xs">({item.change_percentage.toFixed(1)}%)</span>
                            )}
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell>{item.reason || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
