import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { Eye, Mail, Search, Flame, ThermometerSun, Snowflake, Star, User } from "lucide-react";

interface ProspectWithScore {
  id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  job_title: string | null;
  industry: string | null;
  started_at: string;
  last_activity_at: string;
  lead_score: {
    engagement_score: number;
    lead_temperature: string;
  } | null;
  events_count: number;
  total_time_spent: number;
}

interface ProspectTableProps {
  prospects: ProspectWithScore[];
}

const temperatureConfig = {
  qualified: { icon: Star, color: "bg-emerald-100 text-emerald-700", label: "Qualified" },
  hot: { icon: Flame, color: "bg-orange-100 text-orange-700", label: "Hot" },
  warm: { icon: ThermometerSun, color: "bg-amber-100 text-amber-700", label: "Warm" },
  cold: { icon: Snowflake, color: "bg-blue-100 text-blue-700", label: "Cold" },
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function ProspectTable({ prospects }: ProspectTableProps) {
  const [search, setSearch] = useState("");
  const [temperatureFilter, setTemperatureFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"score" | "recent" | "time">("recent");

  const filteredProspects = prospects
    .filter((p) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        p.email?.toLowerCase().includes(searchLower) ||
        p.full_name?.toLowerCase().includes(searchLower) ||
        p.company_name?.toLowerCase().includes(searchLower) ||
        p.industry?.toLowerCase().includes(searchLower);

      const matchesTemp =
        temperatureFilter === "all" ||
        p.lead_score?.lead_temperature === temperatureFilter ||
        (temperatureFilter === "unscored" && !p.lead_score);

      return matchesSearch && matchesTemp;
    })
    .sort((a, b) => {
      if (sortBy === "score") {
        return (b.lead_score?.engagement_score || 0) - (a.lead_score?.engagement_score || 0);
      }
      if (sortBy === "time") {
        return b.total_time_spent - a.total_time_spent;
      }
      return new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime();
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, name, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={temperatureFilter} onValueChange={setTemperatureFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leads</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
            <SelectItem value="unscored">Unscored</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="score">Highest Score</SelectItem>
            <SelectItem value="time">Most Engaged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prospect</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead className="text-center">Events</TableHead>
              <TableHead className="text-center">Time Spent</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProspects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No prospects found
                </TableCell>
              </TableRow>
            ) : (
              filteredProspects.map((prospect) => {
                const temp = prospect.lead_score?.lead_temperature as keyof typeof temperatureConfig;
                const tempConfig = temp ? temperatureConfig[temp] : null;
                const TempIcon = tempConfig?.icon || User;

                return (
                  <TableRow key={prospect.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {prospect.full_name || prospect.email || "Anonymous"}
                        </span>
                        {prospect.email && prospect.full_name && (
                          <span className="text-sm text-muted-foreground">{prospect.email}</span>
                        )}
                        {prospect.job_title && (
                          <span className="text-xs text-muted-foreground">{prospect.job_title}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{prospect.company_name || "-"}</TableCell>
                    <TableCell>{prospect.industry || "-"}</TableCell>
                    <TableCell className="text-center">
                      {prospect.lead_score ? (
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant="outline" className={tempConfig?.color || ""}>
                            <TempIcon className="h-3 w-3 mr-1" />
                            {prospect.lead_score.engagement_score}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{prospect.events_count}</TableCell>
                    <TableCell className="text-center">
                      {formatDuration(prospect.total_time_spent)}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(prospect.last_activity_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/demo-analytics/prospect/${prospect.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {prospect.email && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`mailto:${prospect.email}`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
