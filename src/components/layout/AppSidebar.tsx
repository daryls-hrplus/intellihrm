import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
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
  ChevronDown,
  ChevronRight,
  Building2,
  Globe,
  Languages,
  Menu,
  X,
  LogOut,
} from "lucide-react";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  children?: { title: string; href: string }[];
  adminOnly?: boolean;
  hrOnly?: boolean;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    title: "Admin & Security",
    icon: Settings,
    adminOnly: true,
    children: [
      { title: "Companies", href: "/admin/companies" },
      { title: "Users", href: "/admin/users" },
      { title: "Roles & Permissions", href: "/admin/roles" },
      { title: "Territories", href: "/admin/territories" },
      { title: "Languages", href: "/admin/languages" },
    ],
  },
  {
    title: "Workforce",
    icon: Users,
    children: [
      { title: "Employees", href: "/workforce/employees" },
      { title: "Positions", href: "/workforce/positions" },
      { title: "Org Structure", href: "/workforce/org-structure" },
      { title: "Departments", href: "/workforce/departments" },
    ],
  },
  { title: "Leave Management", href: "/leave", icon: Calendar },
  { title: "Compensation", href: "/compensation", icon: DollarSign, hrOnly: true },
  { title: "Benefits", href: "/benefits", icon: Gift },
  {
    title: "Performance",
    icon: Target,
    children: [
      { title: "Appraisals", href: "/performance/appraisals" },
      { title: "360 Feedback", href: "/performance/360-feedback" },
      { title: "Goals", href: "/performance/goals" },
    ],
  },
  { title: "Training", href: "/training", icon: GraduationCap },
  { title: "Succession", href: "/succession", icon: TrendingUp, hrOnly: true },
  { title: "Recruitment", href: "/recruitment", icon: UserPlus, hrOnly: true },
  { title: "Health & Safety", href: "/hse", icon: Shield },
  { title: "Employee Relations", href: "/employee-relations", icon: Heart, hrOnly: true },
  { title: "Company Property", href: "/property", icon: Package },
];

interface NavItemComponentProps {
  item: NavItem;
  isCollapsed: boolean;
}

function NavItemComponent({ item, isCollapsed }: NavItemComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;

  if (item.children) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
            "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isOpen && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </>
          )}
        </button>
        {!isCollapsed && isOpen && (
          <div className="ml-8 space-y-1 animate-slide-up">
            {item.children.map((child) => (
              <NavLink
                key={child.href}
                to={child.href}
                className={({ isActive }) =>
                  cn(
                    "block rounded-lg px-3 py-2 text-sm transition-all",
                    "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
                  )
                }
              >
                {child.title}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href!}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
          "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive && "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
        )
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span>{item.title}</span>}
    </NavLink>
  );
}

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { profile, roles, company, signOut, isAdmin, isHRManager } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.hrOnly && !isHRManager) return false;
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
              <span className="text-lg font-semibold text-sidebar-foreground">HRIS Pro</span>
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
          {filteredNavItems.map((item) => (
            <NavItemComponent key={item.title} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          {!isCollapsed ? (
            <div className="space-y-3">
              <NavLink
                to="/profile"
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
