import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { owner, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-sm text-slate-500"
        style={{ minHeight: "100vh", backgroundColor: "#f8fafc", color: "#64748b" }}
      >
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
          Loading…
        </span>
      </div>
    );
  }

  if (!owner) return <Navigate to="/dashboard/login" replace state={{ from: location }} />;

  if (!owner.onboarded && !location.pathname.includes('/onboarding')) {
    return <Navigate to="/dashboard/onboarding" replace />;
  }

  return children;
}
