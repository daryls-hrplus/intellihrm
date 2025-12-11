import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  Video,
  Award,
  Calendar,
  ChevronRight,
} from "lucide-react";

const trainingModules = [
  {
    title: "Course Catalog",
    description: "Browse available training courses",
    href: "/training/catalog",
    icon: BookOpen,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "My Learning",
    description: "Your enrolled courses and progress",
    href: "/training/my-learning",
    icon: GraduationCap,
    color: "bg-success/10 text-success",
  },
  {
    title: "Live Sessions",
    description: "Upcoming webinars and workshops",
    href: "/training/sessions",
    icon: Video,
    color: "bg-info/10 text-info",
  },
  {
    title: "Certifications",
    description: "Track your certifications",
    href: "/training/certifications",
    icon: Award,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Training Calendar",
    description: "Schedule and upcoming events",
    href: "/training/calendar",
    icon: Calendar,
    color: "bg-destructive/10 text-destructive",
  },
];

export default function TrainingDashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Training
              </h1>
              <p className="text-muted-foreground">
                Learning and development
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trainingModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <NavLink
                key={module.href}
                to={module.href}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:border-primary/20 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg p-3 ${module.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                </div>
                <h3 className="mt-4 font-semibold text-card-foreground">
                  {module.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {module.description}
                </p>
              </NavLink>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}