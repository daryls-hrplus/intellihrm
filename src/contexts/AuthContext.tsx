import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type AppRole = "admin" | "hr_manager" | "employee";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  company_id: string | null;
}

interface CompanyGroup {
  id: string;
  name: string;
  logo_url: string | null;
}

interface Company {
  id: string;
  name: string;
  code: string;
  territory_id: string | null;
  logo_url: string | null;
  group_id: string | null;
  company_group: CompanyGroup | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  company: Company | null;
  isLoading: boolean;
  requiresMFA: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; requiresMFA?: boolean }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  isAdmin: boolean;
  isHRManager: boolean;
  refreshProfile: () => Promise<void>;
  setMFAVerified: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresMFA, setRequiresMFA] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer fetching additional data to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
          setCompany(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (rolesData) {
        setRoles(rolesData.map((r) => r.role as AppRole));
      }

      // Fetch company if assigned (with company group)
      if (profileData?.company_id) {
        const { data: companyData } = await supabase
          .from("companies")
          .select(`
            id, name, code, territory_id, logo_url, group_id,
            company_groups!companies_group_id_fkey(id, name, logo_url)
          `)
          .eq("id", profileData.company_id)
          .maybeSingle();

        if (companyData) {
          setCompany({
            id: companyData.id,
            name: companyData.name,
            code: companyData.code,
            territory_id: companyData.territory_id,
            logo_url: companyData.logo_url,
            group_id: companyData.group_id,
            company_group: companyData.company_groups as CompanyGroup | null,
          });

          // Ensure company has a subscription record (creates trial if missing)
          // Use upsert with onConflict to prevent duplicates from race conditions
          await supabase
            .from("company_subscriptions")
            .upsert({
              company_id: companyData.id,
              status: 'trial',
              billing_cycle: 'monthly',
              active_employee_count: 1,
              selected_modules: [],
            }, { 
              onConflict: 'company_id',
              ignoreDuplicates: true 
            });
        }
      } else {
        setCompany(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Check if MFA is required
    if (!error && data.session) {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const hasEnrolledFactors = (factorsData?.totp?.length ?? 0) > 0;
      
      if (hasEnrolledFactors) {
        // Check if MFA is verified in this session
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData?.currentLevel !== aalData?.nextLevel) {
          setRequiresMFA(true);
          return { error: null, requiresMFA: true };
        }
      }
    }
    
    // Log login event if successful
    if (!error && data.user) {
      try {
        await supabase.from('audit_logs').insert([{
          user_id: data.user.id,
          action: 'LOGIN' as const,
          entity_type: 'session',
          metadata: { source: 'frontend', user_agent: navigator.userAgent },
        }]);
      } catch (e) {
        console.error('Failed to log login event:', e);
      }
    }
    
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Log logout event before signing out
    if (user) {
      try {
        await supabase.from('audit_logs').insert([{
          user_id: user.id,
          action: 'LOGOUT' as const,
          entity_type: 'session',
          metadata: { source: 'frontend', user_agent: navigator.userAgent },
        }]);
      } catch (e) {
        console.error('Failed to log logout event:', e);
      }
    }
    
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    setCompany(null);
    setRequiresMFA(false);
  };

  const setMFAVerified = () => {
    setRequiresMFA(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  const hasRole = (role: AppRole) => roles.includes(role);
  const isAdmin = hasRole("admin");
  const isHRManager = hasRole("hr_manager") || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        company,
        isLoading,
        requiresMFA,
        signIn,
        signUp,
        signOut,
        hasRole,
        isAdmin,
        isHRManager,
        refreshProfile,
        setMFAVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
