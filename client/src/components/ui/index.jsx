import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, MapPin, Users, Briefcase, Clock, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';

// ── Company Logo / Avatar ─────────────────────────────────
const LOGO_COLORS = ['#00E5A0','#0066FF','#FF6B35','#A855F7','#F59E0B','#EF4444','#06B6D4'];
export const CompanyLogo = ({ company, size = 10 }) => {
  const color = LOGO_COLORS[(company?.name?.charCodeAt(0) || 0) % LOGO_COLORS.length];
  const letter = company?.name?.[0]?.toUpperCase() || '?';
  if (company?.logo) return (
    <img src={company.logo} alt={company.name}
      className={`w-${size} h-${size} rounded-lg object-contain bg-surface2 p-1 flex-shrink-0`} />
  );
  return (
    <div className={`w-${size} h-${size} rounded-lg flex items-center justify-center font-display font-black text-bg flex-shrink-0`}
      style={{ background: color, fontSize: size * 1.6 }}>
      {letter}
    </div>
  );
};

// ── Status Badge ──────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = {
    applied:   'status-applied',
    reviewing: 'status-reviewing',
    interview: 'status-interview',
    offer:     'status-offer',
    rejected:  'status-rejected',
  };
  return <span className={map[status] || 'badge-gray'}>{status}</span>;
};

// ── Job Card ──────────────────────────────────────────────
export const JobCard = ({ job, onSelect, isSelected, savedJobIds = [] }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(savedJobIds.includes(job._id));
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    setSaving(true);
    try {
      const { data } = await api.post(`/candidate/save-job/${job._id}`);
      setSaved(data.saved);
      toast.success(data.saved ? 'Job saved!' : 'Job removed');
    } catch { toast.error('Failed to save job'); }
    finally { setSaving(false); }
  };

  return (
    <div onClick={() => onSelect?.(job)}
      className={`card cursor-pointer transition-all hover:-translate-y-0.5 hover:border-accent/30 group
        ${isSelected ? 'border-accent/50 bg-accent/5' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <CompanyLogo company={job.company} size={10} />
        <button onClick={handleSave} disabled={saving}
          className="text-muted hover:text-accent transition-colors p-1 -mr-1">
          {saved ? <BookmarkCheck size={16} className="text-accent" /> : <Bookmark size={16} />}
        </button>
      </div>

      <h3 className="font-display font-bold text-sm text-ink mb-0.5 line-clamp-1 group-hover:text-accent transition-colors">
        {job.title}
      </h3>
      <p className="text-xs text-muted mb-3 line-clamp-1">{job.company?.name} · {job.company?.stage}</p>

      <p className="text-xs font-bold text-accent mb-3">
        ₹{job.salaryMin}–{job.salaryMax} LPA {job.equity && <span className="text-muted2 font-normal ml-1">+ {job.equity} equity</span>}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.workMode && <span className={job.workMode === 'remote' ? 'badge-green' : 'badge-gray'}>{job.workMode}</span>}
        {job.experienceLevel && <span className="badge-gray">{job.experienceLevel}</span>}
        {job.jobType && <span className="badge-gray">{job.jobType}</span>}
        {job.skills?.slice(0, 2).map(s => <span key={s} className="badge-gray">{s}</span>)}
        {job.skills?.length > 2 && <span className="badge-gray">+{job.skills.length - 2}</span>}
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted pt-2 border-t border-white/5">
        <span className="flex items-center gap-1">
          <Clock size={10} />{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </span>
        <span className="flex items-center gap-1">
          <Users size={10} />{job.applicantCount} applied
        </span>
      </div>
    </div>
  );
};

// ── Company Card ──────────────────────────────────────────
export const CompanyCard = ({ company }) => (
  <Link to={`/startups/${company.slug}`} className="card-hover block group">
    <div className="flex justify-between items-start mb-3">
      <CompanyLogo company={company} size={11} />
      {company.openJobsCount > 0 && (
        <span className="badge-green">{company.openJobsCount} jobs</span>
      )}
    </div>
    <h3 className="font-display font-bold text-sm text-ink mb-1 group-hover:text-accent transition-colors">
      {company.name}
    </h3>
    <p className="text-xs text-muted mb-3 line-clamp-2 font-light leading-relaxed">{company.description}</p>
    <div className="flex flex-wrap gap-1.5 mb-3">
      {company.industry && <span className="badge-blue">{company.industry}</span>}
      {company.stage && <span className="badge-gray">{company.stage}</span>}
      {company.remotePolicy && <span className={company.remotePolicy === 'remote' ? 'badge-green' : 'badge-gray'}>{company.remotePolicy}</span>}
    </div>
    <div className="flex items-center justify-between text-[10px] text-muted pt-2 border-t border-white/5">
      <span className="flex items-center gap-1"><Users size={10} />{company.teamSize}</span>
      {company.averageRating > 0 && (
        <span className="flex items-center gap-1"><Star size={10} className="text-yellow-400" />{Number(company.averageRating).toFixed(1)}</span>
      )}
    </div>
  </Link>
);

// ── Skeleton Cards ────────────────────────────────────────
export const JobCardSkeleton = () => (
  <div className="card space-y-3">
    <div className="skeleton w-10 h-10 rounded-lg" />
    <div className="skeleton h-4 w-3/4 rounded" />
    <div className="skeleton h-3 w-1/2 rounded" />
    <div className="skeleton h-3 w-1/3 rounded" />
    <div className="flex gap-1.5">
      <div className="skeleton h-4 w-14 rounded" />
      <div className="skeleton h-4 w-14 rounded" />
    </div>
  </div>
);

export const CompanyCardSkeleton = () => (
  <div className="card space-y-3">
    <div className="skeleton w-11 h-11 rounded-lg" />
    <div className="skeleton h-4 w-2/3 rounded" />
    <div className="skeleton h-3 w-full rounded" />
    <div className="skeleton h-3 w-3/4 rounded" />
  </div>
);

// ── Stat Card ─────────────────────────────────────────────
export const StatCard = ({ label, value, sub, color = 'text-ink' }) => (
  <div className="card">
    <p className="text-xs text-muted mb-1">{label}</p>
    <p className={`font-display font-black text-2xl ${color}`}>{value}</p>
    {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
  </div>
);

// ── Empty State ───────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && <div className="w-14 h-14 rounded-xl bg-surface2 flex items-center justify-center mb-4"><Icon size={24} className="text-muted" /></div>}
    <h3 className="font-display font-bold text-base mb-1">{title}</h3>
    <p className="text-sm text-muted max-w-sm mb-4">{description}</p>
    {action}
  </div>
);
