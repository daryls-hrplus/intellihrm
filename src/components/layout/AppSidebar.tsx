import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useMenuPermissions } from "@/hooks/useMenuPermissions";
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Gift,
  Target,
  GraduationCap,
  TrendingUp,
  UserPlus,
  Shield,
  Heart,
  Package,
  Settings,
  Building2,
  Globe,
  Languages,
  Menu,
  X,
  LogOut,
  ChevronRight,
  HelpCircle,
  UserCircle,
  UserCog,
  Clock,
  Wallet,
  Briefcase,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  moduleCode: string;
  adminOnly?: boolean;
  hrOnly?: boolean;
  managerOnly?: boolean;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard, moduleCode: "dashboard" },
  { title: "Employee Self Service", href: "/ess", icon: UserCircle, moduleCode: "ess" },
  { title: "Manager Self Service", href: "/mss", icon: UserCog, moduleCode: "mss", managerOnly: true },
  { title: "Workforce", href: "/workforce", icon: Users, moduleCode: "workforce" },
  { title: "Time & Attendance", href: "/time-attendance", icon: Clock, moduleCode: "time_attendance" },
  { title: "Leave Management", href: "/leave", icon: Calendar, moduleCode: "leave" },
  { title: "Payroll", href: "/payroll", icon: Wallet, moduleCode: "payroll", hrOnly: true },
  { title: "Compensation", href: "/compensation", icon: DollarSign, moduleCode: "compensation", hrOnly: true },
  { title: "Benefits", href: "/benefits", icon: Gift, moduleCode: "benefits" },
  { title: "Performance", href: "/performance", icon: Target, moduleCode: "performance" },
  { title: "Training", href: "/training", icon: GraduationCap, moduleCode: "training" },
  { title: "Succession", href: "/succession", icon: TrendingUp, moduleCode: "succession", hrOnly: true },
  { title: "Recruitment", href: "/recruitment", icon: UserPlus, moduleCode: "recruitment", hrOnly: true },
  { title: "Health & Safety", href: "/hse", icon: Shield, moduleCode: "hse" },
  { title: "Employee Relations", href: "/employee-relations", icon: Heart, moduleCode: "employee_relations", hrOnly: true },
  { title: "Company Property", href: "/property", icon: Package, moduleCode: "property" },
  { title: "Help Center", href: "/help", icon: HelpCircle, moduleCode: "help" },
  { title: "HR Hub", href: "/hr-hub", icon: Briefcase, moduleCode: "hr_hub", hrOnly: true },
  { title: "Admin & Security", href: "/admin", icon: Settings, moduleCode: "admin", adminOnly: true },
];

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { profile, roles, company, signOut, isAdmin, isHRManager } = useAuth();
  const { hasMenuAccess } = useMenuPermissions();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const filteredNavItems = navItems.filter((item) => {
    // First check role-based access (legacy)
    if (item.adminOnly && !isAdmin) return false;
    if (item.hrOnly && !isHRManager && !isAdmin) return false;
    if (item.managerOnly && !isHRManager && !isAdmin) return false;
    // Then check menu permissions from roles table
    if (!hasMenuAccess(item.moduleCode)) return false;
    return true;
  });

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = () => {
    if (roles.includes("admin")) return "Admin";
    if (roles.includes("hr_manager")) return "HR Manager";
    return "Employee";
  };

  const isActiveRoute = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-sidebar p-2 text-sidebar-foreground lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col gradient-sidebar transition-all duration-300",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <Users className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">HRplus Cerebra</span>
            </div>
          )}
          <button
            onClick={() => {
              if (isMobileOpen) setIsMobileOpen(false);
              else setIsCollapsed(!isCollapsed);
            }}
            className="rounded-lg p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            {isMobileOpen ? (
              <X className="h-5 w-5" />
            ) : isCollapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5 rotate-180" />
            )}
          </button>
        </div>

        {/* Quick selectors */}
        {!isCollapsed && (
          <div className="space-y-2 border-b border-sidebar-border p-4">
            <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2 text-xs text-sidebar-foreground/80">
              <Building2 className="h-4 w-4" />
              <span className="truncate">{company?.name || "No Company Assigned"}</span>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-sidebar-accent px-2 py-1.5 text-xs text-sidebar-foreground/60">
                <Globe className="h-3.5 w-3.5" />
                <span>US East</span>
              </div>
              <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-sidebar-accent px-2 py-1.5 text-xs text-sidebar-foreground/60">
                <Languages className="h-3.5 w-3.5" />
                <span>English</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          {!isCollapsed ? (
            <div className="space-y-3">
              <NavLink
                to="/profile"
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg p-2 transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "hover:bg-sidebar-accent"
                  )
                }
              >
                <div className="h-9 w-9 rounded-full bg-sidebar-primary/20 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-sidebar-primary">
                      {getInitials(profile?.full_name)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">
                    {profile?.full_name || "User"}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60">{getRoleBadge()}</p>
                </div>
              </NavLink>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignOut}
              className="flex w-full items-center justify-center rounded-lg p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}