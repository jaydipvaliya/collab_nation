import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useJobs, useDebounce } from '../../hooks/index.js';
import { JobCard, JobCardSkeleton, EmptyState } from '../../components/ui/index.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';

// ── Job Detail Panel ──────────────────────────────────────
const JobDetail = ({ job, onApply }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(job?.userHasApplied || false);

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/jobs/${job.slug}`);
      return;
    }
    setIsApplying(true);
    try {
      await api.post(`/jobs/${job._id}/apply`);
      setHasApplied(true);
      toast.success('Application submitted! 🎉');
      onApply?.();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to apply';
      toast.error(msg);
    } finally {
      setIsApplying(false);
    }
  };

  if (!job) return null;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-surface2 flex items-center justify-center
          font-display font-black text-2xl text-accent flex-shrink-0">
          {job.company?.name?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-black text-xl leading-tight">{job.title}</h2>
          <p className="text-sm text-muted mt-1">
            {job.company?.name} · {job.company?.stage} · {job.location || 'India'}
          </p>
        </div>
      </div>

      {/* Salary + meta */}
      <div className="flex flex-wrap gap-2">
        <span className="badge-green text-sm px-3 py-1">
          ₹{job.salaryMin}–{job.salaryMax} LPA
        </span>
        {job.equity && <span className="badge-orange text-sm px-3 py-1">{job.equity} equity</span>}
        {job.workMode && <span className="badge-gray text-sm px-3 py-1">{job.workMode}</span>}
        {job.jobType && <span className="badge-gray text-sm px-3 py-1">{job.jobType}</span>}
        {job.experienceLevel && <span className="badge-gray text-sm px-3 py-1">{job.experienceLevel}</span>}
      </div>

      {/* Apply button */}
      {user?.role !== 'recruiter' && (
        <button
          onClick={handleApply}
          disabled={hasApplied || isApplying}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all
            ${hasApplied
              ? 'bg-accent/10 text-accent border border-accent/20 cursor-default'
              : 'btn-primary'}`}>
          {hasApplied
            ? '✓ Applied Successfully'
            : isApplying
            ? 'Submitting…'
            : 'Apply Now — One Click'}
        </button>
      )}

      {user?.role === 'recruiter' && (
        <div className="bg-surface2 rounded-xl px-4 py-3 text-sm text-muted text-center">
          You are viewing as a recruiter
        </div>
      )}

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
            Skills Required
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map(s => <span key={s} className="badge-gray">{s}</span>)}
          </div>
        </div>
      )}

      {/* Description */}
      {job.description && (
        <div>
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
            About the Role
          </h4>
          <p className="text-sm text-muted2 leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>
      )}

      {/* Requirements */}
      {job.requirements?.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
            Requirements
          </h4>
          <ul className="space-y-1.5">
            {job.requirements.map((r, i) => (
              <li key={i} className="text-sm text-muted2 flex gap-2">
                <span className="text-accent mt-0.5">·</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Responsibilities */}
      {job.responsibilities?.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
            Responsibilities
          </h4>
          <ul className="space-y-1.5">
            {job.responsibilities.map((r, i) => (
              <li key={i} className="text-sm text-muted2 flex gap-2">
                <span className="text-accent mt-0.5">·</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Company snippet */}
      <div className="card bg-surface2 mt-4">
        <h4 className="font-display font-bold text-sm mb-2">
          About {job.company?.name}
        </h4>
        <p className="text-xs text-muted leading-relaxed">
          {job.company?.description || 'No description available.'}
        </p>
      </div>
    </div>
  );
};

// ── Filter Sidebar ────────────────────────────────────────
const FilterSidebar = ({ filters, onChange, onClear }) => {
  const hasFilters = Object.values(filters).some(Boolean);

  const Field = ({ label, name, options }) => (
    <div className="mb-5">
      <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">{label}</p>
      <div className="space-y-1">
        {options.map(([val, lbl]) => (
          <label key={val} className="flex items-center gap-2 cursor-pointer group">
            <input type="radio" name={name} value={val} checked={filters[name] === val}
              onChange={() => onChange(name, filters[name] === val ? '' : val)} className="sr-only" />
            <div className={`w-3.5 h-3.5 rounded-full border transition-all flex-shrink-0 ${filters[name] === val ? 'border-accent bg-accent' : 'border-white/20 group-hover:border-white/40'}`} />
            <span className={`text-xs transition-colors ${filters[name] === val ? 'text-ink' : 'text-muted group-hover:text-muted2'}`}>{lbl}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-52 flex-shrink-0">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-sm">Filters</h3>
        {hasFilters && <button onClick={onClear} className="text-xs text-accent hover:underline">Clear all</button>}
      </div>
      <Field label="Work Mode" name="workMode" options={[['remote','Remote'],['hybrid','Hybrid'],['onsite','On-site']]} />
      <Field label="Experience" name="experienceLevel" options={[['entry','Entry level'],['mid','Mid level'],['senior','Senior'],['lead','Lead']]} />
      <Field label="Job Type" name="jobType" options={[['full-time','Full-time'],['part-time','Part-time'],['contract','Contract'],['internship','Internship']]} />
    </div>
  );
};

// ── Main Jobs Page ────────────────────────────────────────
export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ]             = useState(searchParams.get('q') || '');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const debouncedQ = useDebounce(q, 400);
  const loadMoreRef = useRef(null);

  const [filters, setFilters] = useState({
    workMode: searchParams.get('workMode') || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    jobType: searchParams.get('jobType') || '',
    sort: 'newest',
  });

  const activeFilters = { ...filters, q: debouncedQ };
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useJobs(activeFilters);

  // Sync filters to URL
  useEffect(() => {
    const p = {};
    if (debouncedQ) p.q = debouncedQ;
    Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'newest') p[k] = v; });
    setSearchParams(p, { replace: true });
  }, [debouncedQ, filters]);

  // Infinite scroll observer
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting && hasNextPage) fetchNextPage(); }, { threshold: 0.1 });
    if (loadMoreRef.current) obs.observe(loadMoreRef.current);
    return () => obs.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const allJobs = data?.pages.flatMap(p => p.jobs) || [];
  const totalCount = data?.pages[0]?.totalCount || 0;

  const handleFilterChange = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
  const clearFilters = () => setFilters({ workMode: '', experienceLevel: '', jobType: '', sort: 'newest' });

  return (
    <div className="min-h-screen">
      {/* Search strip */}
      <div className="border-b border-white/[0.08] bg-surface py-5">
        <div className="page-container">
          <div className="flex gap-3 items-center">
            <div className="flex-1 flex items-center gap-3 bg-surface2 border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-accent/40 transition-colors">
              <Search size={16} className="text-muted flex-shrink-0" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search roles, skills, companies…"
                className="flex-1 bg-transparent outline-none text-sm text-ink placeholder-muted" />
              {q && <button onClick={() => setQ('')}><X size={14} className="text-muted hover:text-ink" /></button>}
            </div>
            <select value={filters.sort} onChange={e => handleFilterChange('sort', e.target.value)}
              className="input w-44 hidden md:block">
              <option value="newest">Newest first</option>
              <option value="salary-high">Salary: High to Low</option>
              <option value="salary-low">Salary: Low to High</option>
              <option value="most-applied">Most applied</option>
            </select>
            <button onClick={() => setShowFilters(p => !p)}
              className="md:hidden btn-secondary flex items-center gap-2 px-3 py-2.5 text-sm">
              <SlidersHorizontal size={15} /> Filters
            </button>
          </div>
          <p className="text-xs text-muted mt-2.5">{isLoading ? 'Searching…' : `${totalCount.toLocaleString()} jobs found`}</p>
        </div>
      </div>

      {/* Body */}
      <div className="page-container py-6">
        <div className="flex gap-6">
          {/* Sidebar filters (desktop) */}
          <div className="hidden md:block"><FilterSidebar filters={filters} onChange={handleFilterChange} onClear={clearFilters} /></div>

          {/* Jobs list */}
          <div className={`flex-1 min-w-0 ${selectedJob ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
            {/* Job cards column */}
            <div className={selectedJob ? 'space-y-3 overflow-y-auto max-h-[calc(100vh-180px)] pr-1' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 col-span-full'}>
              {isLoading
                ? Array(6).fill(0).map((_, i) => <JobCardSkeleton key={i} />)
                : allJobs.length === 0
                  ? <div className="col-span-full"><EmptyState title="No jobs found" description="Try adjusting your filters or search terms." /></div>
                  : allJobs.map(job => (
                    <JobCard key={job._id} job={job} isSelected={selectedJob?._id === job._id} onSelect={j => setSelectedJob(prev => prev?._id === j._id ? null : j)} />
                  ))
              }
              <div ref={loadMoreRef} className="col-span-full py-4 text-center">
                {isFetchingNextPage && <div className="w-6 h-6 border-2 border-white/10 border-t-accent rounded-full animate-spin mx-auto" />}
              </div>
            </div>

            {/* Job detail panel */}
            {selectedJob && (
              <div className="card sticky top-20 max-h-[calc(100vh-100px)] overflow-hidden animate-fade-in">
                <div className="flex justify-end mb-1">
                  <button onClick={() => setSelectedJob(null)} className="text-muted hover:text-ink p-1"><X size={16} /></button>
                </div>
                <JobDetail job={selectedJob} onApply={() => setSelectedJob(p => ({ ...p, userHasApplied: true }))} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
