import { Navigate, Outlet } from 'react-router-dom';
import useAuth from './useAuth';
import { isSupportedRole } from './roles';

function AuthLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#dfe8f1]" role="status" aria-label="Verificando sesión">
      <span className="loading loading-spinner loading-lg text-[#15919a]" />
    </main>
  );
}

export function RequireAuth() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <AuthLoading />;
  if (!user || !isSupportedRole(user.rol)) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function RequireRole({ roles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <AuthLoading />;
  if (!user || !roles.includes(String(user.rol ?? '').replace(/^ROLE_/i, '').toUpperCase())) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
