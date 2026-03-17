import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../context/SocketContext.jsx';
import { useNavigate } from 'react-router-dom';

const ICON_MAP = {
  new_application: { emoji: '📩', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  status_changed: { emoji: '🔄', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  new_message: { emoji: '💬', bg: 'bg-accent/10', text: 'text-accent' },
  job_closing_soon: { emoji: '⏰', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  profile_view: { emoji: '👁', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  system: { emoji: '🔔', bg: 'bg-white/5', text: 'text-muted2' },
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications();
  const navigate = useNavigate();
  return (
    <div className="page-container py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-display font-black text-2xl">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-2 btn-secondary text-sm px-4 py-2">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-16">
          <Bell size={36} className="text-muted mx-auto mb-4" />
          <h3 className="font-display font-bold text-base mb-1">No notifications yet</h3>
          <p className="text-sm text-muted">You'll see updates about your applications, messages, and more here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const style = ICON_MAP[n.type] || ICON_MAP.system;
            return (
              <div key={n._id}
                className={`card flex items-start gap-4 cursor-pointer transition-all hover:border-white/20 ${!n.isRead ? 'border-accent/20 bg-accent/[0.03]' : ''}`}
                onClick={() => {
                  markOneRead(n._id);
                  if (n.link?.includes('/recruiter/jobs/') && n.link?.includes('/applicants')) {
                    navigate('/recruiter/dashboard');
                  } else if (n.link) {
                    navigate(n.link);
                  }
                }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                  <span className="text-lg">{style.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${!n.isRead ? 'text-ink' : 'text-muted2'}`}>{n.title}</p>
                      <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-accent" />}
                      <span className="text-[10px] text-muted whitespace-nowrap">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  {n.link && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        markOneRead(n._id);
                        if (n.link?.includes('/recruiter/jobs/') && n.link?.includes('/applicants')) {
                          navigate('/recruiter/dashboard');
                        } else {
                          navigate(n.link);
                        }
                      }}
                      className="text-xs text-accent hover:underline mt-1.5 inline-block">
                      View details →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
