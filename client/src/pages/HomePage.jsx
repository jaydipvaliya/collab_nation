import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react';
import { useQuery } from 'react-query';
import api from '../api/axios.js';
import { JobCard, CompanyCard, JobCardSkeleton, CompanyCardSkeleton } from '../components/ui/index.jsx';

const QUICK_SEARCHES = ['Remote Engineering','Product Manager','AI / ML','Fintech','Series A','Bengaluru'];

const FloatCard = ({ style, logo, bgColor, title, company, salary, tags, delay }) => (
  <div className={`absolute bg-surface border border-white/10 rounded-xl p-4 w-64 shadow-2xl ${style}`}
    style={{ animation: `floatCard 5s ease-in-out ${delay}s infinite` }}>
    <div className="flex justify-between items-start mb-2.5">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-black text-bg text-base" style={{ background: bgColor }}>{logo}</div>
      <span className="text-[11px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md">{salary}</span>
    </div>
    <p className="font-display font-bold text-[13px] mb-0.5">{title}</p>
    <p className="text-[11px] text-muted mb-2.5">{company}</p>
    <div className="flex gap-1.5 flex-wrap">{tags.map(t => <span key={t} className="badge-gray text-[10px]">{t}</span>)}</div>
  </div>
);

export default function HomePage() {
  const navigate  = useNavigate();
  const [q, setQ] = useState('');

  const { data: jobsData, isLoading: jobsLoading } = useQuery('featured-jobs',
    () => api.get('/jobs?limit=6&sort=newest').then(r => r.data), { staleTime: 5 * 60 * 1000 });

  const { data: companiesData, isLoading: companiesLoading } = useQuery('featured-companies',
    () => api.get('/companies?limit=8&hiring=true').then(r => r.data), { staleTime: 5 * 60 * 1000 });

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  };

  return (
    <div>
      {/* ── HERO ── */}
      <style>{`
        @keyframes floatCard { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        {/* Glow blobs */}
        <div className="absolute -left-32 top-0 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
        <div className="absolute right-0 top-20 w-80 h-80 rounded-full bg-accent2/5 blur-3xl pointer-events-none" />

        <div className="page-container py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-xs text-accent font-medium">130,000+ startup jobs live today</span>
            </div>
            <h1 className="font-display font-black text-5xl lg:text-6xl leading-[1.0] tracking-tight mb-5">
              Build something<br />
              <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">that actually</span><br />
              <span className="text-muted2 font-normal italic text-4xl lg:text-5xl">matters.</span>
            </h1>
            <p className="text-base text-muted2 leading-relaxed mb-8 max-w-lg font-light">
              Collab Nation connects ambitious builders with India's most exciting startups.
              Salary, equity, and culture — transparent on every single listing.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center bg-surface border border-white/10 rounded-xl overflow-hidden mb-5 max-w-lg focus-within:border-accent/40 transition-colors">
              <div className="pl-4 text-muted"><Search size={16} /></div>
              <input value={q} onChange={e => setQ(e.target.value)}
                className="flex-1 bg-transparent px-3 py-3.5 text-sm outline-none placeholder-muted"
                placeholder="Role, skill, or company…" />
              <button type="submit" className="bg-accent text-bg m-1.5 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-300 transition-colors">
                Search →
              </button>
            </form>

            <div className="flex flex-wrap gap-2 mb-10">
              {QUICK_SEARCHES.map(s => (
                <button key={s} onClick={() => navigate(`/jobs?q=${encodeURIComponent(s)}`)}
                  className="text-xs text-muted2 bg-surface border border-white/10 px-3 py-1.5 rounded-full hover:border-white/25 hover:text-ink transition-all">
                  {s}
                </button>
              ))}
            </div>

            {/* Trust + stats */}
            <div className="flex items-center gap-3 mb-8 text-sm text-muted">
              <div className="flex -space-x-2">
                {['#00E5A0','#0066FF','#FF6B35','#A855F7'].map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-bg flex items-center justify-center font-bold text-bg text-[10px]" style={{ background: c }}>
                    {['A','R','P','S'][i]}
                  </div>
                ))}
              </div>
              Joined by <strong className="text-ink ml-1">4.2M+ professionals</strong>
            </div>

            <div className="grid grid-cols-4 gap-0 border border-white/[0.08] rounded-xl bg-surface overflow-hidden max-w-lg">
              {[['14K+','Companies'],['₹0','To apply'],['No','Middlemen'],['48hr','Avg response']].map(([n, l]) => (
                <div key={l} className="px-4 py-3 border-r border-white/[0.08] last:border-0">
                  <p className="font-display font-black text-lg text-ink">{n}</p>
                  <p className="text-[10px] text-muted mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating job cards */}
          <div className="hidden lg:block relative h-96">
            <FloatCard style="top-0 left-4" bgColor="#00E5A0" logo="R" title="Senior Product Designer" company="Razorpay · Series E" salary="₹28–38 LPA" tags={['Remote','Figma','Equity']} delay={0} />
            <FloatCard style="top-32 left-20 z-10" bgColor="#0066FF" logo="Z" title="Backend Engineer — Go" company="Zepto · Series D" salary="₹45–60 LPA" tags={['Golang','Postgres','Equity']} delay={1} />
            <FloatCard style="top-64 left-0" bgColor="#FF6B35" logo="K" title="AI / ML Engineer" company="Krutrim · Series A" salary="₹35–50 LPA" tags={['Remote','Python','PyTorch']} delay={2} />
          </div>
        </div>
      </section>

      {/* ── FEATURED JOBS ── */}
      <section className="py-16 border-b border-white/[0.08]">
        <div className="page-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs text-accent font-mono uppercase tracking-widest mb-2">Latest Opportunities</p>
              <h2 className="font-display font-black text-3xl">Trending right now</h2>
            </div>
            <Link to="/jobs" className="btn-secondary flex items-center gap-2 text-sm px-4 py-2.5">
              All jobs <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobsLoading ? Array(6).fill(0).map((_, i) => <JobCardSkeleton key={i} />) :
              (jobsData?.jobs || []).map(job => <JobCard key={job._id} job={job} onSelect={j => navigate(`/jobs?q=${encodeURIComponent(j.title)}`)} />)
            }
          </div>
        </div>
      </section>

      {/* ── COMPANIES ── */}
      <section className="py-16 bg-surface border-b border-white/[0.08]">
        <div className="page-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs text-accent font-mono uppercase tracking-widest mb-2">Top Companies</p>
              <h2 className="font-display font-black text-3xl">Hiring now</h2>
              <p className="text-sm text-muted mt-1 font-light">Direct access. No middlemen. Talk to founders.</p>
            </div>
            <Link to="/startups" className="btn-secondary flex items-center gap-2 text-sm px-4 py-2.5">
              All startups <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {companiesLoading ? Array(8).fill(0).map((_, i) => <CompanyCardSkeleton key={i} />) :
              (companiesData?.companies || []).map(co => <CompanyCard key={co._id} company={co} />)
            }
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20">
        <div className="page-container">
          <div className="text-center mb-14">
            <p className="text-xs text-accent font-mono uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="font-display font-black text-3xl">Three steps to your dream role</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              [Zap, 'Build your profile once', 'No resumes. No cover letters. Your Collab Nation profile is your application — skills, projects, salary expectations all in one place.'],
              [Shield, 'See salary before you apply', 'Every job shows compensation and equity upfront. No surprises. No wasted interviews. Know exactly what you\'re walking into.'],
              [TrendingUp, 'Apply in one click', 'Click apply and you\'re done. Founders review your profile directly — no recruiter gatekeeping, no automated rejection emails.'],
            ].map(([Icon, title, text], i) => (
              <div key={i} className="card group hover:border-accent/30 transition-all hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-accent2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="font-display font-black text-5xl text-white/5 mb-4 leading-none">0{i + 1}</div>
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-accent" />
                </div>
                <h3 className="font-display font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed font-light">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-surface border-t border-white/[0.08]">
        <div className="page-container text-center">
          <h2 className="font-display font-black text-3xl mb-3">Ready to find your next role?</h2>
          <p className="text-muted text-base mb-8 font-light max-w-md mx-auto">Join 4.2M+ professionals building careers at India's most exciting startups.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/register" className="btn-primary px-7 py-3 text-sm">Create free account →</Link>
            <Link to="/jobs" className="btn-ghost px-7 py-3 text-sm">Browse jobs</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
