/**
 * Protected route component for authentication and subscription-based access
 */
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Shield, Lock } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireVerified?: boolean;
  requiredTier?: "free" | "pro" | "enterprise";
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireVerified = false,
  requiredTier,
  fallback,
}: ProtectedRouteProps) {
  // In development mode, always render children without authentication
  if (import.meta.env.DEV || window.location.hostname === "localhost") {
    console.log("���� ProtectedRoute: Development mode bypass");
    return <>{children}</>;
  }

  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="card-modern bg-black/50 backdrop-blur-xl border-cyber-cyan/30">
          <CardContent className="flex items-center space-x-4 p-8">
            <Loader2 className="h-8 w-8 animate-spin text-cyber-cyan" />
            <span className="text-cyber-cyan font-mono">Authenticating...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if authentication required
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check email verification
  if (requireVerified && user && !user.is_verified) {
    return (
      fallback || (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Card className="card-modern bg-black/50 backdrop-blur-xl border-cyber-cyan/30 max-w-md">
            <CardContent className="text-center p-8">
              <Shield className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-cyber-cyan mb-2">
                Email Verification Required
              </h2>
              <p className="text-cyber-cyan/70 font-mono text-sm">
                Please verify your email address to access this feature.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // Check subscription tier
  if (requiredTier && user) {
    const tierHierarchy = { free: 0, pro: 1, enterprise: 2 };
    const userLevel =
      tierHierarchy[user.subscription_tier as keyof typeof tierHierarchy] ?? -1;
    const requiredLevel = tierHierarchy[requiredTier] ?? 999;

    if (userLevel < requiredLevel) {
      return (
        fallback || (
          <div className="min-h-screen bg-black flex items-center justify-center">
            <Card className="card-modern bg-black/50 backdrop-blur-xl border-cyber-cyan/30 max-w-md">
              <CardContent className="text-center p-8">
                <Lock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-cyber-cyan mb-2">
                  Upgrade Required
                </h2>
                <p className="text-cyber-cyan/70 font-mono text-sm mb-4">
                  This feature requires a {requiredTier} subscription or higher.
                </p>
                <p className="text-xs text-cyber-cyan/50">
                  Current plan: {user.subscription_tier}
                </p>
              </CardContent>
            </Card>
          </div>
        )
      );
    }
  }

  return <>{children}</>;
}
