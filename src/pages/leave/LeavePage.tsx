import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ChevronRight,
} from "lucide-react";

const leaveBalances = [
  { type: "Annual Leave", used: 8, total: 20, color: "bg-primary" },
  { type: "Sick Leave", used: 2, total: 10, color: "bg-info" },
  { type: "Personal Leave", used: 1, total: 5, color: "bg-warning" },
  { type: "Parental Leave", used: 0, total: 90, color: "bg-success" },
];

const leaveRequests = [
  {
    id: 1,
    employee: "Sarah Chen",
    type: "Annual Leave",
    startDate: "Dec 20, 2024",
    endDate: "Dec 27, 2024",
    days: 5,
    status: "pending",
    reason: "Family vacation",
  },
  {
    id: 2,
    employee: "Michael Brown",
    type: "Sick Leave",
    startDate: "Dec 10, 2024",
    endDate: "Dec 11, 2024",
    days: 2,
    status: "approved",
    reason: "Medical appointment",
  },
  {
    id: 3,
    employee: "Emily Rodriguez",
    type: "Personal Leave",
    startDate: "Dec 15, 2024",
    endDate: "Dec 15, 2024",
    days: 1,
    status: "approved",
    reason: "Personal matters",
  },
  {
    id: 4,
    employee: "James Wilson",
    type: "Annual Leave",
    startDate: "Dec 23, 2024",
    endDate: "Jan 3, 2025",
    days: 8,
    status: "rejected",
    reason: "Holiday travel",
  },
];

export default function LeavePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Leave Management
            </h1>
            <p className="mt-1 text-muted-foreground">
              Track and manage employee time off
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Request Leave
          </button>
        </div>

        {/* Leave Balances */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up">
          {leaveBalances.map((balance, index) => (
            <div
              key={balance.type}
              className="rounded-xl border border-border bg-card p-5 shadow-card"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {balance.type}
                </p>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-card-foreground">
                    {balance.total - balance.used}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {balance.total} days
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all", balance.color)}
                    style={{
                      width: `${(balance.used / balance.total) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {balance.used} days used
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Leave Requests */}
        <div className="rounded-xl border border-border bg-card shadow-card animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="text-lg font-semibold text-card-foreground">
              Recent Leave Requests
            </h2>
            <button className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {leaveRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-4 p-5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {request.employee
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">
                      {request.employee}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {request.type} • {request.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:gap-8">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {request.startDate} - {request.endDate}
                    </span>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {request.days} days
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      request.status === "approved" &&
                        "bg-success/10 text-success",
                      request.status === "pending" &&
                        "bg-warning/10 text-warning",
                      request.status === "rejected" &&
                        "bg-destructive/10 text-destructive"
                    )}
                  >
                    {request.status === "approved" && (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    {request.status === "rejected" && (
                      <XCircle className="h-3 w-3" />
                    )}
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
