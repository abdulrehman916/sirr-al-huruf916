import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { platform } from '@/api/platformClient';

export default function MaintenanceGate({ children }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [maintenance, setMaintenance] = useState(false);
  useEffect(() => {
    let active = true;
    const refresh = () => platform.functions.invoke('getRuntimeStatus')
      .then(({ data }) => { if (active) setMaintenance(data?.maintenance_mode === true); })
      .catch(() => {});
    refresh();
    const timer = setInterval(refresh, 60000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  if (!maintenance || user?.role === 'owner' || ['/login', '/owner-login', '/auth/callback'].includes(pathname)) return children;
  return <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-white bg-[#020710]">
    <h1 className="text-2xl">Maintenance in progress</h1>
    <p>Please return shortly.</p>
    <Link to="/owner-login" className="underline">Owner sign in</Link>
  </main>;
}
