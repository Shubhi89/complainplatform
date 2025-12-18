import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { JSX } from "react/jsx-runtime";

// 1. Protects specific routes
export const RoleRoute = ({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: string[];
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const RootRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  if (user.role === "CONSUMER")
    return <Navigate to="/dashboard/consumer" replace />;
  if (user.role === "BUSINESS")
    return <Navigate to="/dashboard/business" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;

  return <Navigate to="/login" replace />;
};
