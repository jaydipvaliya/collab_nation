import { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { useCompanies, useDebounce } from '../../hooks/index.js';
import { CompanyCard, CompanyCardSkeleton, EmptyState } from '../../components/ui/index.jsx';

const INDUSTRIES = ['AI / ML','Fintech','SaaS','Edtech','Healthtech','E-commerce','Logistics','Cleantech','Web3','Developer Tools','Consumer','Deeptech'];
const STAGES     = ['pre-seed','seed','series-a','series-b','series-c','series-d+','unicorn','bootstrapped'];
const SIZES      = ['1-10','11-50','51-200','201-500','500+'];

const TRENDING = [
  { name: 'Krutrim', sector: 'AI / ML' },
  { name: 'Sarvam AI', sector: 'AI / ML' },
  { name: 'Zepto', sector: 'E-commerce' },
  { name: 'Agnikul', sector: 'Aerospace' },
  { name: 'Darwinbox', sector: 'SaaS' },
];

const ARTICLES = [
  { tag: 'AI / ML', tagColor: 'badge-green', title: 'Why Indian language AI is the next frontier', time: '5 min' },
  { tag: 'Fintech', tagColor: 'badge-blue',  title: "India's UPI moment: what comes after payments?", time: '4 min' },
  { tag: 'Deeptech', tagColor: 'badge-orange', title: "Inside India's NewSpace revolution", time: '7 min' },
];

export default function DiscoverPage() {
  const [q, setQ]                   = useState('');
  const [activeIndustry, setIndustry] = useState('');
  const [filters, setFilters]       = useState({ stage: '', teamSize: '', hiring: '' });
  const debouncedQ = useDebounce(q, 400);

  const activeFilters = { q: debouncedQ, industry: activeIndustry, ...filters };
  const { data, isLoading } = useCompanies(activeFilters);
  const companies = data?.companies || [];
  const totalCount = data?.totalCount || 0;

  const setFilter = (k, v) => setFilters(p => ({ ...p, [k]: p[k] === v ? '' : v }));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-surface border-b border-white/[0.08] py-12 px-6 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-accent/5 pointer-events-none" />
        <div className="absolute right-10 top-10 w-32 h-32 rounded-full bg-accent2/5 pointer-events-none" />
        <div className="page-container relative">
          <p className="text-xs font-mono text-accent tracking-widest mb-3 uppercase">Startup Discovery</p>
          <h1 className="font-display font-black text-4xl leading-tight mb-3">
            Find your next <span className="text-accent">adventure</span><br />in the startup world.
          </h1>
          <p className="text-sm text-muted max-w-lg mb-7 font-light leading-relaxed">
            Browse 30,000+ innovative startups — from pre-seed to unicorn. Filter by industry, funding, team size, and more.
          </p>
          <div className="flex items-center bg-surface2 border border-white/10 rounded-xl overflow-hidden max-w-xl focus-within:border-accent/40 transition-colors">
            <div className="pl-4 text-muted"><Search size={16} /></div>
            <input value={q} onChange={e => setQ(e.target.value)}
              className="flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder-muted"
              placeholder="Search by name, industry, or tech stack…" />
            <button className="bg-accent text-bg px-5 py-3 font-bold text-sm hover:bg-emerald-300 transition-colors">
              Explore →
            </button>
          </div>
          <div className="flex gap-5 mt-7">
            {[['30K+','Startups listed'],['18','Industries'],['₹0','To browse'],['9,200+','Actively hiring']].map(([num, lbl]) => (
              <div key={lbl}>
                <div className="font-display font-black text-lg text-ink">{num}</div>
                <div className="text-xs text-muted">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Industry pills */}
      <div className="border-b border-white/[0.08] bg-bg overflow-x-auto">
        <div className="flex gap-2 px-6 py-3 whitespace-nowrap page-container">
          <button onClick={() => setIndustry('')}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${!activeIndustry ? 'bg-ink text-bg border-ink' : 'bg-surface border-white/10 text-muted2 hover:border-white/20'}`}>
            All
          </button>
          {INDUSTRIES.map(ind => (
            <button key={ind} onClick={() => setIndustry(prev => prev === ind ? '' : ind)}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${activeIndustry === ind ? 'bg-ink text-bg border-ink' : 'bg-surface border-white/10 text-muted2 hover:border-white/20'}`}>
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="page-container py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-52 flex-shrink-0 space-y-6">
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Funding Stage</p>
              <div className="space-y-1.5">
                {STAGES.map(s => (
                  <button key={s} onClick={() => setFilter('stage', s)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${filters.stage === s ? 'bg-ink text-bg font-medium' : 'text-muted2 hover:bg-surface2'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Team Size</p>
              <div className="space-y-1.5">
                {SIZES.map(s => (
                  <button key={s} onClick={() => setFilter('teamSize', s)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${filters.teamSize === s ? 'bg-ink text-bg font-medium' : 'text-muted2 hover:bg-surface2'}`}>
                    {s} people
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Status</p>
              <button onClick={() => setFilter('hiring', 'true')}
                className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${filters.hiring === 'true' ? 'bg-ink text-bg font-medium' : 'text-muted2 hover:bg-surface2'}`}>
                Actively hiring
              </button>
            </div>
          </div>

          {/* Main grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-display font-bold text-base">{activeIndustry || 'All Startups'}</p>
                <p className="text-xs text-muted">{isLoading ? 'Loading…' : `${totalCount.toLocaleString()} startups`}</p>
              </div>
              {(activeIndustry || Object.values(filters).some(Boolean)) && (
                <button onClick={() => { setIndustry(''); setFilters({ stage: '', teamSize: '', hiring: '' }); }}
                  className="text-xs text-accent hover:underline">Clear filters</button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {isLoading
                ? Array(9).fill(0).map((_, i) => <CompanyCardSkeleton key={i} />)
                : companies.length === 0
                  ? <div className="col-span-full"><EmptyState icon={Search} title="No startups found" description="Try different filters or search terms." /></div>
                  : companies.map(c => <CompanyCard key={c._id} company={c} />)
              }
            </div>
          </div>

          {/* Trending panel */}
          <div className="hidden xl:block w-52 flex-shrink-0 space-y-6">
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <TrendingUp size={11} className="text-accent" /> Trending
              </p>
              <div className="space-y-1">
                {TRENDING.map((t, i) => (
                  <div key={t.name} className="flex items-center gap-2.5 py-2 border-b border-white/5 last:border-0">
                    <span className="font-display font-black text-lg text-white/10 w-5 text-right">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="text-xs font-medium text-ink">{t.name}</p>
                      <p className="text-[10px] text-muted">{t.sector}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Industry Reads</p>
              <div className="space-y-2">
                {ARTICLES.map(a => (
                  <div key={a.title} className="bg-surface p-3 rounded-xl cursor-pointer hover:bg-surface2 transition-colors">
                    <span className={`${a.tagColor} mb-1.5 inline-block`}>{a.tag}</span>
                    <p className="text-xs font-medium text-ink leading-snug">{a.title}</p>
                    <p className="text-[10px] text-muted mt-1.5">{a.time} read</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-white/10 rounded-xl p-4">
              <p className="font-display font-bold text-sm mb-1">Get notified</p>
              <p className="text-xs text-muted mb-3 leading-relaxed">New startups in your favourite industries, weekly.</p>
              <input type="email" placeholder="your@email.com" className="input text-xs py-2 mb-2" />
              <button className="btn-primary w-full py-2 text-xs">Subscribe →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
