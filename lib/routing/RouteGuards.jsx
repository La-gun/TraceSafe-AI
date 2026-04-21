import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const authEnforced = () => import.meta.env.VITE_REQUIRE_AUTH === 'true';

/**
 * Client-side route guard for navigation UX only.
 * When auth is enforced, user must be authenticated; then role must be in `allow`.
 */
export function RequireRole({ allow, children }) {
  const { role, isAuthenticated } = useAuth();
  const location = useLocation();
  if (authEnforced() && !isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search + location.hash }}
      />
    );
  }
  const ok = allow.includes(role);
  if (ok) return children;
  const target = role === 'regulator' ? '/login/regulator' : '/login/consumer';
  return (
    <Navigate
      to={target}
      replace
      state={{ from: location.pathname + location.search + location.hash }}
    />
  );
}
