import { useState } from 'react';
import { useQuery } from 'react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Search, TrendingUp, DollarSign, Info } from 'lucide-react';
import api from "../api/axios.js";
import { useDebounce } from "../hooks/index.js";

const POPULAR = [
  { title: 'Software Engineer', level: 'mid' },
  { title: 'Product Manager', level: 'mid' },
  { title: 'Data Scientist', level: 'mid' },
  { title: 'Frontend Developer', level: 'senior' },
  { title: 'DevOps Engineer', level: 'mid' },
  { title: 'UX Designer', level: 'mid' },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm shadow-xl">
      <p className="font-bold text-ink mb-1">{payload[0].payload.label}</p>
      <p className="text-accent">₹{payload[0].value} LPA avg</p>
      <p className="text-xs text-muted">{payload[0].payload.count} listings</p>
    </div>
  );
};

export default function SalariesPage() {
  const [search, setSearch]     = useState('Software Engineer');
  const [level, setLevel]       = useState('');
  const debouncedSearch = useDebounce(search, 600);

  const { data, isLoading } = useQuery(
    ['salaries', debouncedSearch, level],
    async () => {
      const params = new URLSearchParams({ limit: 200 });
      if (debouncedSearch) params.set('q', debouncedSearch);
      if (level) params.set('experienceLevel', level);
      const { data } = await api.get(`/jobs?${params}`);
      return data;
    },
    { staleTime: 5 * 60 * 1000, enabled: !!debouncedSearch }
  );

  // Compute salary stats from raw job data
  const jobs = data?.jobs || [];
  const salaries = jobs.map(j => (j.salaryMin + j.salaryMax) / 2).filter(Boolean);
  const avg  = salaries.length ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length) : 0;
  const min  = salaries.length ? Math.round(Math.min(...salaries)) : 0;
  const max  = salaries.length ? Math.round(Math.max(...salaries)) : 0;

  // Bucket into ranges for histogram
  const buckets = [
    { label: '0–10', range: [0, 10], count: 0, avg: 0 },
    { label: '10–20', range: [10, 20], count: 0, avg: 0 },
    { label: '20–30', range: [20, 30], count: 0, avg: 0 },
    { label: '30–50', range: [30, 50], count: 0, avg: 0 },
    { label: '50–80', range: [50, 80], count: 0, avg: 0 },
    { label: '80+',   range: [80, 999], count: 0, avg: 0 },
  ];
  salaries.forEach(s => {
    const b = buckets.find(b => s >= b.range[0] && s < b.range[1]);
    if (b) { b.count++; b.avg = Math.round((b.avg * (b.count - 1) + s) / b.count); }
  });
  const chartData = buckets.filter(b => b.count > 0).map(b => ({ ...b, value: b.avg }));

  return (
    <div className="page-container py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-3 py-1.5 mb-4">
          <TrendingUp size={12} className="text-accent" />
          <span className="text-xs text-accent font-medium">Real data from Collab Nation listings</span>
        </div>
        <h1 className="font-display font-black text-4xl mb-3">Salary Research</h1>
        <p className="text-muted text-sm max-w-md mx-auto font-light">
          Explore salary ranges for any role based on real job listings. Know your worth before you negotiate.
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-3 max-w-xl mx-auto mb-8">
        <div className="flex-1 flex items-center bg-surface border border-white/10 rounded-xl px-4 py-2.5 gap-3 focus-within:border-accent/40 transition-colors">
          <Search size={15} className="text-muted flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder-muted"
            placeholder="Search by role title…" />
        </div>
        <select value={level} onChange={e => setLevel(e.target.value)} className="input w-36">
          <option value="">All levels</option>
          <option value="entry">Entry</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
          <option value="lead">Lead</option>
        </select>
      </div>

      {/* Popular searches */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {POPULAR.map(({ title, level: l }) => (
          <button key={title} onClick={() => { setSearch(title); setLevel(l); }}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${search === title ? 'bg-ink text-bg border-ink' : 'bg-surface border-white/10 text-muted2 hover:border-white/20'}`}>
            {title}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-white/10 border-t-accent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && salaries.length > 0 && (
        <div className="space-y-6 max-w-3xl mx-auto animate-fade-in-up">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              ['Avg Salary', `₹${avg} LPA`, 'text-accent', 'Based on ' + salaries.length + ' listings'],
              ['Min Range',  `₹${min} LPA`, 'text-blue-400', 'Lowest in results'],
              ['Max Range',  `₹${max} LPA`, 'text-yellow-400', 'Highest in results'],
            ].map(([label, value, color, sub]) => (
              <div key={label} className="card text-center">
                <p className="text-xs text-muted mb-2">{label}</p>
                <p className={`font-display font-black text-2xl ${color}`}>{value}</p>
                <p className="text-xs text-muted mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          {chartData.length > 1 && (
            <div className="card">
              <h3 className="font-display font-bold text-sm mb-5">Salary Distribution for "{debouncedSearch}"</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={32}>
                  <XAxis dataKey="label" tick={{ fill: '#6B6D75', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#6B6D75', fontSize: 11 }} tickLine={false} axisLine={false} unit=" L" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="value" radius={[6,6,0,0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.avg === avg ? '#00E5A0' : 'rgba(0,229,160,0.25)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted flex items-center gap-1 mt-3">
                <Info size={11} /> Average salary per bracket (LPA = Lakhs Per Annum)
              </p>
            </div>
          )}

          {/* Sample jobs */}
          <div className="card">
            <h3 className="font-display font-bold text-sm mb-4">Jobs matching "{debouncedSearch}"</h3>
            <div className="space-y-2">
              {jobs.slice(0, 8).map(job => (
                <div key={job._id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold text-xs flex-shrink-0">
                      {job.company?.name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{job.title}</p>
                      <p className="text-xs text-muted">{job.company?.name} · {job.workMode}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-accent flex-shrink-0 ml-3">
                    ₹{job.salaryMin}–{job.salaryMax} LPA
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isLoading && debouncedSearch && salaries.length === 0 && (
        <div className="text-center py-16">
          <DollarSign size={36} className="text-muted mx-auto mb-4" />
          <p className="font-display font-bold text-base mb-1">No salary data found</p>
          <p className="text-sm text-muted">Try a different role title or remove level filter.</p>
        </div>
      )}
    </div>
  );
}
