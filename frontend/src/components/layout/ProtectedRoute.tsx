import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import type { Role } from "../../features/auth/authSlice";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // Role not authorized, redirect to their default dashboard
    if (user.role === "candidate") return <Navigate to="/dashboard" replace />;
    if (user.role === "recruiter") return <Navigate to="/recruiter" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
