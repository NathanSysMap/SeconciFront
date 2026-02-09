import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../core/auth/AuthContext';
import { canAccessScope, hasAnyPermission } from '../../core/rbac/rbac';
import { getRouteAccess } from '../../core/rbac/routePermissions';
import { AppShell } from '../layout/AppShell';

interface RouteAccessGuardProps {
  children: ReactNode;
}

export function RouteAccessGuard({ children }: RouteAccessGuardProps) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C92]" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const routeAccess = getRouteAccess(location.pathname);

  if (routeAccess.allowLoggedOnly) {
    return <AppShell>{children}</AppShell>;
  }

  if (routeAccess.scope && !canAccessScope(session, routeAccess.scope)) {
    toast.error('Você não tem acesso a esta área do sistema');
    return <Navigate to="/dashboard" replace />;
  }

  if (routeAccess.permissions && routeAccess.permissions.length > 0) {
    if (!hasAnyPermission(session, routeAccess.permissions)) {
      toast.error('Você não tem permissão para acessar esta página');
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <AppShell>{children}</AppShell>;
}
