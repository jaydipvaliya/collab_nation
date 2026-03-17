import { useState } from 'react';
import { useQuery } from 'react-query';
import { Search, MapPin, ExternalLink, MessageSquare, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios.js';
import { useDebounce } from '../../hooks/index.js';

const SKILLS_SUGGESTIONS = [
  'React','Node.js','Python','TypeScript','MongoDB',
  'AWS','Flutter','Java','Go','PostgreSQL','DevOps','UI/UX'
];

const WORK_MODES = ['any','remote','hybrid','onsite'];

export default function FindCandidatesPage() {
  const navigate   = useNavigate();
  const [q, setQ]  = useState('');
  const [workMode, setWorkMode] = useState('');
  const [skill, setSkill]       = useState('');
  const debouncedQ = useDebounce(q, 400);

  const { data, isLoading } = useQuery(
    ['candidates', debouncedQ, workMode, skill],
    async () => {
      const params = new URLSearchParams();
      if (debouncedQ) params.set('q', debouncedQ);
      const res = await api.get(`/candidate/search?${params}`);
      return res.data;
    },
    { staleTime: 2 * 60 * 1000, retry: false }
  );

  const candidates = (data?.candidates || []).filter(c => {
    const matchMode  = !workMode || c.workMode === workMode || c.workMode === 'any';
    const matchSkill = !skill    || c.skills?.some(s => s.toLowerCase().includes(skill.toLowerCase()));
    return matchMode && matchSkill;
  });

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-display font-black text-2xl">Find Candidates</h1>
        <p className="text-sm text-muted mt-1">
          Browse job seekers actively looking for startup roles.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="card mb-6 space-y-4">
        {/* Search bar */}
        <div className="flex items-center gap-3 bg-surface2 border border-white/10
          rounded-xl px-4 py-2.5 focus-within:border-accent/40 transition-colors">
          <Search size={15} className="text-muted flex-shrink-0" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by name, skill, headline…"
            className="flex-1 bg-transparent outline-none text-sm placeholder-muted"
          />
        </div>

        {/* Filter row */}
        <div className="flex gap-3 flex-wrap">
          {/* Work mode */}
          <div className="flex gap-2">
            {WORK_MODES.map(m => (
              <button key={m} onClick={() => setWorkMode(prev => prev === m ? '' : m)}
                className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-all
                  ${workMode === m
                    ? 'bg-ink text-bg border-ink'
                    : 'border-white/10 text-muted2 hover:border-white/25'}`}>
                {m === 'any' ? 'Any mode' : m}
              </button>
            ))}
          </div>

          {/* Skill filter */}
          <select
            value={skill}
            onChange={e => setSkill(e.target.value)}
            className="input text-xs py-1.5 w-36">
            <option value="">All skills</option>
            {SKILLS_SUGGESTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Popular skill chips */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted">Popular:</span>
          {SKILLS_SUGGESTIONS.slice(0, 8).map(s => (
            <button key={s} onClick={() => setSkill(prev => prev === s ? '' : s)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all
                ${skill === s
                  ? 'border-accent/50 bg-accent/10 text-accent'
                  : 'border-white/10 text-muted2 hover:border-white/20'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted mb-4">
        {isLoading ? 'Searching…' : `${candidates.length} candidates found`}
      </p>

      {/* Candidate Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-xl" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="font-display font-bold text-base mb-1">No candidates found</h3>
          <p className="text-sm text-muted">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map(candidate => (
            <CandidateCard
              key={candidate._id}
              candidate={candidate}
              onMessage={() => navigate(`/messages/${candidate.user?._id || candidate._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Candidate Card ────────────────────────────────────────
function CandidateCard({ candidate, onMessage }) {
  const userId = candidate.user?._id || candidate._id;

  return (
    <div className="card hover:border-white/20 transition-all hover:-translate-y-0.5 group">
      {/* Top */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center
            justify-center font-display font-black text-lg text-accent flex-shrink-0">
            {candidate.user?.name?.[0] || '?'}
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-sm text-ink truncate">
              {candidate.user?.name || 'Candidate'}
            </p>
            {candidate.location && (
              <p className="text-[10px] text-muted flex items-center gap-1">
                <MapPin size={9} />{candidate.location}
              </p>
            )}
          </div>
        </div>
        {candidate.isFeatured && (
          <span className="badge-green flex items-center gap-1">
            <Star size={9} />Featured
          </span>
        )}
      </div>

      {/* Headline */}
      {candidate.headline && (
        <p className="text-xs text-muted2 mb-3 line-clamp-2 leading-relaxed">
          {candidate.headline}
        </p>
      )}

      {/* Skills */}
      {candidate.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {candidate.skills.slice(0, 4).map(s => (
            <span key={s} className="badge-gray">{s}</span>
          ))}
          {candidate.skills.length > 4 && (
            <span className="badge-gray">+{candidate.skills.length - 4}</span>
          )}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-[10px] text-muted mb-4
        pt-3 border-t border-white/5">
        {candidate.workMode && (
          <span className={candidate.workMode === 'remote' ? 'text-accent' : ''}>
            {candidate.workMode}
          </span>
        )}
        {candidate.experienceYears && (
          <span>{candidate.experienceYears} yrs exp</span>
        )}
        {candidate.desiredSalaryMin && (
          <span>₹{candidate.desiredSalaryMin}–{candidate.desiredSalaryMax} LPA</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onMessage}
          className="flex-1 flex items-center justify-center gap-1.5
            btn-primary text-xs py-2">
          <MessageSquare size={12} /> Message
        </button>
        <Link
          to={`/candidates/${userId}`}
          className="flex items-center justify-center gap-1.5
            btn-secondary text-xs py-2 px-3">
          <ExternalLink size={12} /> Profile
        </Link>
      </div>
    </div>
  );
}