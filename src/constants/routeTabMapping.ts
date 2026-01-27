import {
  LayoutDashboard,
  Briefcase,
  UserCircle,
  UserCog,
  Users,
  Clock,
  Calendar,
  Wallet,
  DollarSign,
  Gift,
  Target,
  GraduationCap,
  UserPlus,
  Shield,
  Heart,
  Package,
  HelpCircle,
  BookOpen,
  Settings,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface RouteTabConfig {
  pathPattern: RegExp;
  title: string;
  moduleCode: string;
  icon?: LucideIcon;
}

export const ROUTE_TAB_MAPPING: RouteTabConfig[] = [
  { pathPattern: /^\/dashboard$/, title: "Dashboard", moduleCode: "dashboard", icon: LayoutDashboard },
  { pathPattern: /^\/hr-hub/, title: "HR Hub", moduleCode: "hr_hub", icon: Briefcase },
  { pathPattern: /^\/ess/, title: "Employee Self-Service", moduleCode: "ess", icon: UserCircle },
  { pathPattern: /^\/mss/, title: "Manager Self-Service", moduleCode: "mss", icon: UserCog },
  { pathPattern: /^\/workforce/, title: "Workforce", moduleCode: "workforce", icon: Users },
  { pathPattern: /^\/time-attendance/, title: "Time & Attendance", moduleCode: "time_attendance", icon: Clock },
  { pathPattern: /^\/leave/, title: "Leave Management", moduleCode: "leave", icon: Calendar },
  { pathPattern: /^\/payroll/, title: "Payroll", moduleCode: "payroll", icon: Wallet },
  { pathPattern: /^\/compensation/, title: "Compensation", moduleCode: "compensation", icon: DollarSign },
  { pathPattern: /^\/benefits/, title: "Benefits", moduleCode: "benefits", icon: Gift },
  { pathPattern: /^\/performance/, title: "Performance", moduleCode: "performance", icon: Target },
  { pathPattern: /^\/training/, title: "Learning & Development", moduleCode: "training", icon: GraduationCap },
  { pathPattern: /^\/recruitment/, title: "Recruitment", moduleCode: "recruitment", icon: UserPlus },
  { pathPattern: /^\/hse/, title: "Health & Safety", moduleCode: "hse", icon: Shield },
  { pathPattern: /^\/employee-relations/, title: "Employee Relations", moduleCode: "employee_relations", icon: Heart },
  { pathPattern: /^\/property/, title: "Company Property", moduleCode: "property", icon: Package },
  { pathPattern: /^\/help/, title: "Help Center", moduleCode: "help", icon: HelpCircle },
  { pathPattern: /^\/enablement/, title: "Enablement", moduleCode: "enablement", icon: BookOpen },
  { pathPattern: /^\/admin/, title: "Administration", moduleCode: "admin", icon: Settings },
  { pathPattern: /^\/system/, title: "System", moduleCode: "system", icon: Settings },
];

export function findRouteTabConfig(pathname: string): RouteTabConfig | null {
  return ROUTE_TAB_MAPPING.find(config => config.pathPattern.test(pathname)) || null;
}
