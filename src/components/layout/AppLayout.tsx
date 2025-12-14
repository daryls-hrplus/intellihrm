import { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

// AppLayout is now a passthrough component since the layout is handled by ProtectedLayout
// This prevents breaking changes across 258+ pages while centralizing the layout
export function AppLayout({ children }: AppLayoutProps) {
  return <>{children}</>;
}
