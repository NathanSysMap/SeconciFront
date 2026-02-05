import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { canAccessScope, hasAnyPermission } from '../../core/rbac/rbac';
import { Scope } from '../../core/rbac/types';
import { AppShell } from '../layout/AppShell';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C92] mx-auto mb-4"></div>
          <p className="text-neutral-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <AppShell>{children}</AppShell>;
}

interface ScopeRouteProps {
  scope: Scope;
  children: ReactNode;
}

export function ScopeRoute({ scope, children }: ScopeRouteProps) {
  const { session } = useAuth();

  if (!session || !canAccessScope(session, scope)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}

interface PermissionRouteProps {
  permissions: string[];
  children: ReactNode;
}

export function PermissionRoute({ permissions, children }: PermissionRouteProps) {
  const { session } = useAuth();

  if (!session || !hasAnyPermission(session, permissions)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
