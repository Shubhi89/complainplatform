import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { JSX } from 'react/jsx-runtime';

// 1. Protects specific routes (e.g., /dashboard/consumer)
export const RoleRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If a Consumer tries to access Business page, kick them to their home
    return <Navigate to="/" replace />;
  }

  return children;
};

// 2. The "Traffic Cop" that decides where logged-in users go
export const RootRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  if (user.role === 'CONSUMER') return <Navigate to="/dashboard/consumer" replace />;
  if (user.role === 'BUSINESS') return <Navigate to="/dashboard/business" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;

  return <Navigate to="/login" replace />;
};