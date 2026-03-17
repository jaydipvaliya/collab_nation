import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from './Navbar.jsx';

// Full-page spinner
export const PageSpinner = () => (
  <div className="min-h-screen bg-bg flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-accent animate-spin" />
      <p className="text-muted text-sm">Loading Collab Nation…</p>
    </div>
  </div>
);

// Protected route wrapper
export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role))
    return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
};

// Main layout with navbar
export const MainLayout = () => (
  <div className="min-h-screen bg-bg flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Auth layout (no navbar)
export const AuthLayout = () => (
  <div className="min-h-screen bg-bg flex items-center justify-center px-4">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <a href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center font-display font-black text-bg">C</div>
          <span className="font-display font-black text-xl">Collab<span className="text-accent">Nation</span></span>
        </a>
      </div>
      <Outlet />
    </div>
  </div>
);

const Footer = () => (
  <footer className="border-t border-white/[0.08] bg-surface py-6">
    <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent to-accent2 flex items-center justify-center font-display font-black text-bg text-xs">C</div>
        <span className="font-display font-bold text-sm">Collab<span className="text-accent">Nation</span></span>
      </div>
      <p className="text-xs text-muted">© 2026 Collab Nation · Connecting India's startup ecosystem</p>
      <div className="flex gap-5 text-xs text-muted">
        {['Privacy', 'Terms', 'Contact'].map(l => <a key={l} href="#" className="hover:text-ink transition-colors">{l}</a>)}
      </div>
    </div>
  </footer>
);
