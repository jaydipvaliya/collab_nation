import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { MapPin, Users, Globe, Linkedin, Twitter, Star, ExternalLink, Briefcase, Heart } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios.js';
import { JobCard, CompanyLogo } from '../../components/ui/index.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const StarRating = ({ value, onChange, size = 5 }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(i => (
      <button key={i} type={onChange ? 'button' : undefined} onClick={() => onChange?.(i)}
        className={`transition-colors ${onChange ? 'cursor-pointer hover:text-yellow-400' : 'cursor-default'} ${i <= value ? 'text-yellow-400' : 'text-white/20'}`}>
        <Star size={size} fill={i <= value ? 'currentColor' : 'none'} />
      </button>
    ))}
  </div>
);

const ReviewModal = ({ companyId, onClose }) => {
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const mutation = useMutation(
    (data) => api.post(`/companies/${companyId}/reviews`, { ...data, rating }),
    {
      onSuccess: () => {
        toast.success('Review submitted!');
        qc.invalidateQueries(['company']);
        onClose();
      },
      onError: () => toast.error('Failed to submit review'),
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-md bg-surface border border-white/10 rounded-2xl p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <h3 className="font-display font-bold text-lg mb-5">Write a Review</h3>
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Overall Rating *</label>
            <StarRating value={rating} onChange={setRating} size={22} />
            {rating === 0 && <p className="text-xs text-muted mt-1">Click to rate</p>}
          </div>
          <div>
            <label className="label">Review Title</label>
            <input {...register('title')} className="input" placeholder="e.g. Great place to grow as an engineer" />
          </div>
          <div>
            <label className="label">Pros</label>
            <textarea {...register('pros')} rows={2} className="input resize-none" placeholder="What did you like?" />
          </div>
          <div>
            <label className="label">Cons</label>
            <textarea {...register('cons')} rows={2} className="input resize-none" placeholder="What could be improved?" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('isAnonymous')} className="accent-accent w-4 h-4" />
            <span className="text-sm text-muted2">Post anonymously</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={rating === 0 || mutation.isLoading} className="btn-primary flex-1 py-2.5">
              {mutation.isLoading ? 'Submitting…' : 'Submit Review'}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost px-5 py-2.5">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function CompanyProfilePage() {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showReviewModal, setReviewModal] = useState(false);
  const [followed, setFollowed] = useState(false);

  const { data, isLoading, isError } = useQuery(
    ['company', slug],
    () => api.get(`/companies/${slug}`).then(r => r.data),
    { staleTime: 5 * 60 * 1000 }
  );

  if (isLoading) return (
    <div className="page-container py-8 space-y-4">
      <div className="skeleton h-48 rounded-2xl" />
      <div className="skeleton h-32 rounded-xl" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
      </div>
    </div>
  );

  if (isError) return (
    <div className="page-container py-16 text-center">
      <p className="text-muted">Company not found.</p>
      <Link to="/startups" className="btn-primary mt-4 inline-block px-5 py-2.5 text-sm">Browse Startups</Link>
    </div>
  );

  const { company, openJobs = [], reviews = [] } = data;

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  return (
    <div className="min-h-screen">
      {/* Cover */}
      <div className="h-40 bg-gradient-to-r from-surface2 to-surface relative overflow-hidden">
        {company.coverImage && <img src={company.coverImage} alt="" className="w-full h-full object-cover opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-t from-bg/60 to-transparent" />
      </div>

      <div className="page-container">
        {/* Header */}
        <div className="flex items-end gap-5 -mt-10 mb-7 relative z-10">
          <div className="border-4 border-bg rounded-2xl flex-shrink-0">
            <CompanyLogo company={company} size={20} />
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-display font-black text-2xl text-ink">{company.name}</h1>
                <p className="text-sm text-muted mt-0.5">{company.description?.slice(0, 80)}{company.description?.length > 80 ? '…' : ''}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => { setFollowed(p => !p); toast.success(followed ? 'Unfollowed' : 'Following!'); }}
                  className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-all ${followed ? 'border-accent/50 bg-accent/10 text-accent' : 'border-white/10 text-muted2 hover:border-white/20'}`}>
                  <Heart size={13} fill={followed ? 'currentColor' : 'none'} />
                  {followed ? 'Following' : 'Follow'}
                </button>
                <button onClick={copyLink} className="btn-ghost text-sm px-4 py-2">Share</button>
              </div>
            </div>
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-2 mb-8">
          {company.stage       && <span className="badge-blue capitalize">{company.stage}</span>}
          {company.teamSize    && <span className="badge-gray flex items-center gap-1"><Users size={10} />{company.teamSize} people</span>}
          {company.hqLocation  && <span className="badge-gray flex items-center gap-1"><MapPin size={10} />{company.hqLocation}</span>}
          {company.remotePolicy && <span className={company.remotePolicy === 'remote' ? 'badge-green' : 'badge-gray'} >{company.remotePolicy}</span>}
          {company.foundedYear && <span className="badge-gray">Founded {company.foundedYear}</span>}
          {company.averageRating > 0 && (
            <span className="badge-gray flex items-center gap-1"><Star size={10} className="text-yellow-400" />{Number(company.averageRating).toFixed(1)}</span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-7">
            {/* About */}
            <div className="card">
              <h2 className="font-display font-bold text-base mb-3">About {company.name}</h2>
              <p className="text-sm text-muted2 leading-relaxed">{company.description || 'No description available.'}</p>
              {company.mission && (
                <div className="mt-4 border-l-2 border-accent pl-4">
                  <p className="text-xs text-accent font-bold mb-1 uppercase tracking-wider">Mission</p>
                  <p className="text-sm text-muted2 italic">{company.mission}</p>
                </div>
              )}
            </div>

            {/* Tech Stack */}
            {company.techStack?.length > 0 && (
              <div className="card">
                <h2 className="font-display font-bold text-base mb-3">Tech Stack</h2>
                <div className="flex flex-wrap gap-2">
                  {company.techStack.map(t => (
                    <span key={t} className="bg-accent/10 text-accent text-xs font-medium px-3 py-1.5 rounded-lg">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Perks */}
            {company.perks?.length > 0 && (
              <div className="card">
                <h2 className="font-display font-bold text-base mb-3">Perks & Benefits</h2>
                <div className="grid grid-cols-2 gap-2">
                  {company.perks.map(p => (
                    <div key={p} className="flex items-center gap-2 text-sm text-muted2">
                      <span className="w-5 h-5 rounded-md bg-accent/10 flex items-center justify-center text-accent text-[10px]">✓</span>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Open Roles */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-base">Open Roles ({openJobs.length})</h2>
                {openJobs.length > 3 && (
                  <Link to={`/jobs?company=${company._id}`} className="text-xs text-accent hover:underline">
                    View all {openJobs.length} →
                  </Link>
                )}
              </div>
              {openJobs.length === 0 ? (
                <div className="card text-center py-8 text-muted text-sm">No open roles right now. Follow to get notified.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {openJobs.slice(0, 4).map(job => <JobCard key={job._id} job={job} />)}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-base">
                  Reviews
                  {company.totalReviews > 0 && (
                    <span className="text-muted text-sm font-normal ml-2">({company.totalReviews})</span>
                  )}
                </h2>
                {isAuthenticated && user?.role === 'candidate' && (
                  <button onClick={() => setReviewModal(true)} className="btn-secondary text-xs px-3 py-2">
                    Write a Review
                  </button>
                )}
              </div>

              {company.averageRating > 0 && (
                <div className="card mb-4 flex items-center gap-5">
                  <div className="text-center">
                    <div className="font-display font-black text-4xl text-ink">{Number(company.averageRating).toFixed(1)}</div>
                    <StarRating value={Math.round(company.averageRating)} size={14} />
                    <p className="text-xs text-muted mt-1">{company.totalReviews} review{company.totalReviews !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex-1 text-sm text-muted">Based on employee and applicant reviews.</div>
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="card text-center py-8 text-muted text-sm">
                  No reviews yet.
                  {isAuthenticated && user?.role === 'candidate' && (
                    <button onClick={() => setReviewModal(true)} className="text-accent hover:underline ml-1">Be the first to review.</button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map(r => (
                    <div key={r._id} className="card">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{r.title || 'Review'}</p>
                          <p className="text-xs text-muted">{r.isAnonymous ? 'Anonymous' : r.reviewer?.name || 'Employee'}</p>
                        </div>
                        <StarRating value={r.rating} size={12} />
                      </div>
                      {r.pros && <p className="text-sm text-muted2 mb-1"><span className="text-accent font-medium">Pros: </span>{r.pros}</p>}
                      {r.cons && <p className="text-sm text-muted2"><span className="text-red-400 font-medium">Cons: </span>{r.cons}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="card">
              <h3 className="font-display font-bold text-sm mb-4">Company Info</h3>
              <div className="space-y-3">
                {[
                  [Globe, 'Website', company.website, company.website],
                  [Linkedin, 'LinkedIn', company.linkedinUrl ? 'View Profile' : null, company.linkedinUrl],
                  [Twitter, 'Twitter', company.twitterUrl ? '@handle' : null, company.twitterUrl],
                  [Briefcase, 'Industry', company.industry, null],
                  [Users, 'Team Size', company.teamSize, null],
                  [MapPin, 'Location', company.hqLocation, null],
                ].filter(([,, val]) => val).map(([Icon, label, val, href]) => (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    <Icon size={13} className="text-muted flex-shrink-0" />
                    <span className="text-muted w-16 text-xs">{label}</span>
                    {href ? (
                      <a href={href} target="_blank" rel="noreferrer"
                        className="text-accent hover:underline truncate flex items-center gap-1 text-xs">
                        {val} <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-muted2 text-xs">{val}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {openJobs.length > 0 && (
              <div className="card bg-accent/5 border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs font-bold text-accent">Actively Hiring</span>
                </div>
                <p className="text-sm text-ink font-medium">{openJobs.length} open role{openJobs.length !== 1 ? 's' : ''}</p>
                <button onClick={() => document.getElementById('open-roles')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-primary w-full py-2.5 text-sm mt-3">
                  View Openings →
                </button>
              </div>
            )}

            <div className="card">
              <h3 className="font-display font-bold text-sm mb-3">Share this company</h3>
              <button onClick={copyLink} className="btn-secondary w-full text-sm py-2.5">
                Copy link
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReviewModal && <ReviewModal companyId={company._id} onClose={() => setReviewModal(false)} />}
    </div>
  );
}
