import { Link } from 'react-router-dom';
import { BarChart2, Eye, BookmarkCheck, Send, Clock, CheckCircle2, TrendingUp, User } from 'lucide-react';
import { useDashboard } from '../../hooks/index.js';
import { StatCard, JobCard, StatusBadge, EmptyState } from '../../components/ui/index.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDistanceToNow } from 'date-fns';

const CompletionRing = ({ pct }) => {
  const r = 36, circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
        <circle cx="44" cy="44" r={r} fill="none" stroke="#00E5A0" strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display font-black text-xl text-accent">{pct}%</span>
      </div>
    </div>
  );
};

const ApplicationRow = ({ app }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center font-display font-bold text-accent text-sm flex-shrink-0">
        {app.company?.name?.[0] || '?'}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink truncate">{app.job?.title}</p>
        <p className="text-xs text-muted">{app.company?.name} · {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}</p>
      </div>
    </div>
    <StatusBadge status={app.status} />
  </div>
);

export default function CandidateDashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) return (
    <div className="page-container py-8 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
    </div>
  );

  if (isError) return (
    <div className="page-container py-8 text-center text-muted">Failed to load dashboard. Please refresh.</div>
  );

  const { stats = {}, applications = [], recommendedJobs = [], profileCompletion = 0 } = data || {};

  const completionItems = [
    { label: 'Headline', done: profileCompletion >= 10 },
    { label: 'Bio', done: profileCompletion >= 20 },
    { label: 'Skills (3+)', done: profileCompletion >= 35 },
    { label: 'Experience', done: profileCompletion >= 50 },
    { label: 'Resume uploaded', done: profileCompletion >= 70 },
    { label: 'LinkedIn URL', done: profileCompletion >= 80 },
  ];

  return (
    <div className="page-container py-8">
      {/* Welcome */}
      <div className="mb-7">
        <h1 className="font-display font-black text-2xl">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-muted mt-1">Here's what's happening with your job search.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Applications sent" value={stats.totalApplied || 0} color="text-accent" />
        <StatCard label="Being reviewed" value={stats.reviewing || 0} color="text-blue-400" />
        <StatCard label="Interviews" value={stats.interviews || 0} color="text-yellow-400" />
        <StatCard label="Profile views" value={stats.profileViews || 0} color="text-muted2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Profile completion */}
        <div className="card flex items-center gap-5">
          <CompletionRing pct={profileCompletion} />
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-sm mb-3">Profile completion</h3>
            <div className="space-y-1.5">
              {completionItems.map(item => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-accent' : 'border border-white/20'}`}>
                    {item.done && <span className="text-bg text-[8px] font-black">✓</span>}
                  </div>
                  <span className={item.done ? 'text-muted line-through' : 'text-muted2'}>{item.label}</span>
                </div>
              ))}
            </div>
            {profileCompletion < 100 && (
              <Link to="/profile" className="text-xs text-accent hover:underline mt-3 block">Complete profile →</Link>
            )}
          </div>
        </div>

        {/* Recent applications */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-sm">Recent applications</h3>
            <Link to="/candidate/applications" className="text-xs text-accent hover:underline">View all</Link>
          </div>
          {applications.length === 0
            ? <EmptyState icon={Send} title="No applications yet" description="Start applying to jobs on Collab Nation." action={<Link to="/" className="btn-primary text-sm px-4 py-2">Browse jobs</Link>} />
            : applications.slice(0, 5).map(app => <ApplicationRow key={app._id} app={app} />)
          }
        </div>
      </div>

      {/* Recommended jobs */}
      {recommendedJobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-lg">Recommended for you</h2>
              <p className="text-xs text-muted mt-0.5">Based on your skills</p>
            </div>
            <Link to="/" className="text-xs text-accent hover:underline">See all jobs</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedJobs.map(job => <JobCard key={job._id} job={job} />)}
          </div>
        </div>
      )}
    </div>
  );
}
