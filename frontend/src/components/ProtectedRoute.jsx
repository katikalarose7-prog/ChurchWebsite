import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

export default function ProtectedRoute({ children, roles, requireOwner, ownerOrRoles }) {
  const { admin, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <Loader label="Checking session..." />;

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(admin.role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // requireOwner: only the designated owner account may pass, even if their
  // role is super_admin — used for Offerings, Giving/UPI Settings, Manage Admins.
  if (requireOwner && !(admin.role === 'super_admin' && admin.isOwner)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // ownerOrRoles: the listed roles always pass; a super_admin only passes if
  // they're the owner — used for full Sunday School management, where a
  // sunday_school_admin always has access but a non-owner super_admin doesn't.
  if (ownerOrRoles) {
    const allowed = ownerOrRoles.includes(admin.role) || (admin.role === 'super_admin' && admin.isOwner);
    if (!allowed) return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
