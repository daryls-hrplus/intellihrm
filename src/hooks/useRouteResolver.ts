import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FEATURE_REGISTRY } from "@/lib/featureRegistry";

export interface RouteResolution {
  path: string;
  source: 'database' | 'registry' | 'legacy' | 'fallback';
  featureCode?: string;
  featureName?: string;
  isValid: boolean;
  warning?: string;
}

export interface RouteResolverCache {
  dbRoutes: Map<string, { path: string; name: string }>;
  registryRoutes: Map<string, { path: string; name: string }>;
  isLoaded: boolean;
}

/**
 * Hook for centralized route resolution from database (Database-First SSOT)
 * Priority: Database > Feature Registry > Legacy adminRoute > Fallback
 */
export function useRouteResolver() {
  const [cache, setCache] = useState<RouteResolverCache>({
    dbRoutes: new Map(),
    registryRoutes: new Map(),
    isLoaded: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // Build registry routes map (static, built once)
  const registryRoutes = useMemo(() => {
    const routes = new Map<string, { path: string; name: string }>();
    FEATURE_REGISTRY.forEach(module => {
      module.groups.forEach(group => {
        group.features.forEach(feature => {
          routes.set(feature.code, {
            path: feature.routePath,
            name: feature.name
          });
        });
      });
    });
    return routes;
  }, []);

  // Load database routes
  useEffect(() => {
    async function loadDbRoutes() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("application_features")
          .select("feature_code, route_path, feature_name")
          .eq("is_active", true);

        if (error) throw error;

        const dbRoutes = new Map<string, { path: string; name: string }>();
        (data || []).forEach(feature => {
          if (feature.route_path) {
            dbRoutes.set(feature.feature_code, {
              path: feature.route_path,
              name: feature.feature_name
            });
          }
        });

        setCache({
          dbRoutes,
          registryRoutes,
          isLoaded: true
        });
      } catch (error) {
        console.error("Error loading routes from database:", error);
        // Still mark as loaded, will fallback to registry
        setCache({
          dbRoutes: new Map(),
          registryRoutes,
          isLoaded: true
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadDbRoutes();
  }, [registryRoutes]);

  /**
   * Resolve a route by feature code
   * Priority: Database > Registry > Fallback
   */
  const resolveByFeatureCode = useCallback((featureCode: string): RouteResolution => {
    // 1. Try database first (authoritative source)
    const dbRoute = cache.dbRoutes.get(featureCode);
    if (dbRoute) {
      return {
        path: dbRoute.path,
        source: 'database',
        featureCode,
        featureName: dbRoute.name,
        isValid: true
      };
    }

    // 2. Fallback to registry (code source for unsynced features)
    const registryRoute = cache.registryRoutes.get(featureCode);
    if (registryRoute) {
      return {
        path: registryRoute.path,
        source: 'registry',
        featureCode,
        featureName: registryRoute.name,
        isValid: true,
        warning: `Feature "${featureCode}" not synced to database`
      };
    }

    // 3. Not found in either source
    return {
      path: '#',
      source: 'fallback',
      featureCode,
      isValid: false,
      warning: `Feature code "${featureCode}" not found in database or registry`
    };
  }, [cache]);

  /**
   * Resolve using legacy adminRoute path (for backward compatibility)
   * This allows gradual migration from hardcoded routes to feature codes
   */
  const resolveByLegacyRoute = useCallback((adminRoute: string): RouteResolution => {
    // Check if this route exists in database
    for (const [code, route] of cache.dbRoutes.entries()) {
      if (route.path === adminRoute) {
        return {
          path: route.path,
          source: 'database',
          featureCode: code,
          featureName: route.name,
          isValid: true
        };
      }
    }

    // Check if exists in registry
    for (const [code, route] of cache.registryRoutes.entries()) {
      if (route.path === adminRoute) {
        return {
          path: route.path,
          source: 'registry',
          featureCode: code,
          featureName: route.name,
          isValid: true,
          warning: `Route found in registry but not synced to database`
        };
      }
    }

    // Use the legacy route as-is
    return {
      path: adminRoute,
      source: 'legacy',
      isValid: true, // Assume valid since it was explicitly provided
      warning: 'Using legacy hardcoded route - consider migrating to feature code'
    };
  }, [cache]);

  /**
   * Resolve route using either featureCode or legacy adminRoute
   * Prioritizes featureCode if provided
   */
  const resolve = useCallback((options: {
    featureCode?: string;
    adminRoute?: string;
  }): RouteResolution => {
    if (options.featureCode) {
      return resolveByFeatureCode(options.featureCode);
    }
    if (options.adminRoute) {
      return resolveByLegacyRoute(options.adminRoute);
    }
    return {
      path: '#',
      source: 'fallback',
      isValid: false,
      warning: 'No featureCode or adminRoute provided'
    };
  }, [resolveByFeatureCode, resolveByLegacyRoute]);

  /**
   * Resolve multiple feature codes at once
   */
  const resolveMultiple = useCallback((featureCodes: string[]): Map<string, RouteResolution> => {
    const results = new Map<string, RouteResolution>();
    featureCodes.forEach(code => {
      results.set(code, resolveByFeatureCode(code));
    });
    return results;
  }, [resolveByFeatureCode]);

  /**
   * Get all routes from database for validation purposes
   */
  const getAllDbRoutes = useCallback((): Array<{ featureCode: string; path: string; name: string }> => {
    return Array.from(cache.dbRoutes.entries()).map(([code, route]) => ({
      featureCode: code,
      path: route.path,
      name: route.name
    }));
  }, [cache]);

  /**
   * Get all routes from registry for comparison
   */
  const getAllRegistryRoutes = useCallback((): Array<{ featureCode: string; path: string; name: string }> => {
    return Array.from(cache.registryRoutes.entries()).map(([code, route]) => ({
      featureCode: code,
      path: route.path,
      name: route.name
    }));
  }, [cache]);

  /**
   * Find routes in registry but not in database (unsynced)
   */
  const getUnsyncedRoutes = useCallback((): Array<{ featureCode: string; path: string; name: string }> => {
    const unsynced: Array<{ featureCode: string; path: string; name: string }> = [];
    cache.registryRoutes.forEach((route, code) => {
      if (!cache.dbRoutes.has(code)) {
        unsynced.push({ featureCode: code, ...route });
      }
    });
    return unsynced;
  }, [cache]);

  /**
   * Refresh routes from database
   */
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("application_features")
        .select("feature_code, route_path, feature_name")
        .eq("is_active", true);

      if (error) throw error;

      const dbRoutes = new Map<string, { path: string; name: string }>();
      (data || []).forEach(feature => {
        if (feature.route_path) {
          dbRoutes.set(feature.feature_code, {
            path: feature.route_path,
            name: feature.feature_name
          });
        }
      });

      setCache(prev => ({
        ...prev,
        dbRoutes,
        isLoaded: true
      }));
    } catch (error) {
      console.error("Error refreshing routes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    resolve,
    resolveByFeatureCode,
    resolveByLegacyRoute,
    resolveMultiple,
    getAllDbRoutes,
    getAllRegistryRoutes,
    getUnsyncedRoutes,
    refresh,
    isLoading,
    isLoaded: cache.isLoaded,
    dbRouteCount: cache.dbRoutes.size,
    registryRouteCount: cache.registryRoutes.size
  };
}
