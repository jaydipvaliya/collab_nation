import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Send, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../api/axios.js';
import { StatusBadge, EmptyState } from '../../components/ui/index.jsx';

const STATUSES = ['all', 'applied', 'reviewing', 'interview', 'offer', 'rejected'];

export default function ApplicationsPage() {
  const [filter, setFilter] = useState('all');

  const { data, isLoading } = useQuery('my-applications', () =>
    api.get('/candidate/dashboard').then(r => r.data)
  );

  const all = data?.applications || [];
  const filtered = filter === 'all' ? all : all.filter(a => a.status === filter);

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === 'all' ? all.length : all.filter(a => a.status === s).length;
    return acc;
  }, {});

  return (
    <div className="page-container py-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-display font-black text-2xl">My Applications</h1>
          <p className="text-sm text-muted mt-1">{all.length} total applications</p>
        </div>
        <Link to="/" className="btn-primary text-sm px-4 py-2.5">Browse Jobs</Link>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize
              ${filter === s ? 'bg-ink text-bg border-ink' : 'bg-surface border-white/10 text-muted2 hover:border-white/20'}`}>
            {s}
            {counts[s] > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${filter === s ? 'bg-bg/20 text-bg' : 'bg-white/10 text-muted'}`}>
                {counts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Send} title="No applications yet"
          description={filter === 'all' ? 'Start applying to jobs on Collab Nation.' : `No applications with status "${filter}".`}
          action={<Link to="/" className="btn-primary text-sm px-4 py-2">Browse Jobs</Link>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <div key={app._id} className="card flex items-center gap-4 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center font-display font-bold text-accent flex-shrink-0">
                {app.company?.name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-ink truncate">{app.job?.title}</p>
                    <p className="text-xs text-muted">{app.company?.name}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted">{formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
