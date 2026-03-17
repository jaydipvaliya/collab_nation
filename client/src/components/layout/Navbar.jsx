import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, MessageSquare, ChevronDown, LogOut, User, Settings, LayoutDashboard, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/SocketContext.jsx';
import { formatDistanceToNow } from 'date-fns';

const Avatar = ({ user, size = 8 }) => {
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
  if (user?.avatar) return <img src={user.avatar} alt={user.name} className={`w-${size} h-${size} rounded-full object-cover`} />;
  return (
    <div className={`w-${size} h-${size} rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs`}>
      {initials}
    </div>
  );
};

const NotifDropdown = ({ onClose }) => {
  const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications();
  const navigate = useNavigate();

  const handleClick = (n) => {
    markOneRead(n._id);
    const dest = n.link ||
      (n.type === 'status_changed' ? '/candidate/dashboard' :
        n.type === 'new_message' ? '/messages' :
          '/');
    navigate(dest);
    onClose();
  };

  return (
    <div className="absolute right-0 top-12 w-80 bg-surface border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="font-display font-bold text-sm">Notifications</span>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-accent hover:underline">Mark all read</button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-muted text-sm">No notifications yet</div>
        ) : notifications.slice(0, 10).map(n => (
          <button key={n._id} onClick={() => handleClick(n)}
            className={`w-full text-left px-4 py-3 hover:bg-surface2 border-b border-white/5 transition-colors ${!n.isRead ? 'bg-accent/5' : ''}`}>
            <div className="flex gap-3 items-start">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.isRead ? 'bg-transparent' : 'bg-accent'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{n.title}</p>
                <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-muted mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <Link to="/notifications" onClick={onClose} className="block text-center py-2.5 text-xs text-accent border-t border-white/10 hover:bg-surface2 transition-colors">
        See all notifications
      </Link>
    </div>
  );
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const dashLink = user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard';

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-bg/90 backdrop-blur-md">
      <div className="page-container flex items-center justify-between h-14">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent2 flex items-center justify-center font-display font-black text-bg text-sm">C</div>
          <span className="font-display font-black text-base hidden sm:block">
            Collab<span className="text-accent">Nation</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            ['/', 'Jobs'],
            ['/startups', 'Startups'],
            ['/salaries', 'Salaries'],
            ...(user?.role === 'recruiter' ? [['/recruiter/candidates', 'Find Talent']] : []),
          ].map(([path, label]) => (
            <Link key={path} to={path}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive(path) ? 'bg-surface2 text-ink' : 'text-muted2 hover:text-ink hover:bg-surface2'}`}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Messages */}
              <Link to="/messages" className="relative p-2 rounded-lg hover:bg-surface2 transition-colors text-muted2 hover:text-ink">
                <MessageSquare size={18} />
              </Link>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => { setShowNotif(p => !p); setShowUser(false); }}
                  className="relative p-2 rounded-lg hover:bg-surface2 transition-colors text-muted2 hover:text-ink">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-bg text-[9px] font-black rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotif && <NotifDropdown onClose={() => setShowNotif(false)} />}
              </div>

              {/* Post Job (recruiter) */}
              {user?.role === 'recruiter' && (
                <button onClick={() => navigate('/recruiter/post-job')}
                  className="hidden sm:flex items-center gap-1.5 btn-primary text-xs px-3 py-2">
                  <Plus size={14} /> Post Job
                </button>
              )}

              {/* User menu */}
              <div className="relative" ref={userRef}>
                <button onClick={() => { setShowUser(p => !p); setShowNotif(false); }}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface2 transition-colors">
                  <Avatar user={user} size={7} />
                  <ChevronDown size={14} className="text-muted hidden sm:block" />
                </button>
                {showUser && (
                  <div className="absolute right-0 top-12 w-52 bg-surface border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
                      <p className="text-xs text-muted truncate">{user?.email}</p>
                    </div>
                    {[
                      [dashLink, 'Dashboard', <LayoutDashboard size={14} />],
                      [user?.role === 'recruiter' ? '/recruiter/company' : '/profile', 'My Profile', <User size={14} />],
                      ['/settings', 'Settings', <Settings size={14} />],
                    ].map(([path, label, icon]) => (
                      <Link key={path} to={path} onClick={() => setShowUser(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted2 hover:text-ink hover:bg-surface2 transition-colors">
                        {icon}{label}
                      </Link>
                    ))}
                    <button onClick={() => { logout(); setShowUser(false); navigate('/'); }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-surface2 transition-colors border-t border-white/10">
                      <LogOut size={14} /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm px-4 py-2">Log in</Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
