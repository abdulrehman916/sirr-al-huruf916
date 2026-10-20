import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

// Account forms remain free; signed-in identity is required for private requests/files.
export default function AccountRoute({ children }) {
  const { authResolved, isAuthenticated, authError, checkUserAuth } = useAuth();
  const location = useLocation();
  if (!authResolved) return <div role="status" className="p-8 text-center">Login പരിശോധിക്കുന്നു…</div>;
  if (authError) return <div role="alert" className="p-8 text-center text-white"><p>{authError}</p><button type="button" onClick={checkUserAuth} className="mt-4 underline">വീണ്ടും ശ്രമിക്കുക</button></div>;
  if (!isAuthenticated) return <Navigate replace to={'/login?redirect=' + encodeURIComponent(location.pathname + location.search)} />;
  return children;
}
