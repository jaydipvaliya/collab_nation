import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, X, Upload, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';

const STEPS = ['Basic Info','Skills','Experience','Education & Projects','Preferences'];

const TagInput = ({ value = [], onChange, placeholder, suggestions = [] }) => {
  const [input, setInput] = useState('');
  const add = (tag) => {
    const t = (tag || input).trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput('');
  };
  const onKey = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } };
  return (
    <div>
      <div className="input flex flex-wrap gap-1.5 h-auto min-h-[42px] cursor-text" onClick={e => e.currentTarget.querySelector('input')?.focus()}>
        {value.map(t => (
          <span key={t} className="flex items-center gap-1 bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-md">
            {t}<button type="button" onClick={() => onChange(value.filter(v => v !== t))}><X size={10} /></button>
          </span>
        ))}
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
          className="flex-1 min-w-24 bg-transparent outline-none text-sm placeholder-muted"
          placeholder={value.length === 0 ? placeholder : ''} />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {suggestions.filter(s => !value.includes(s)).slice(0, 8).map(s => (
            <button key={s} type="button" onClick={() => add(s)} className="text-[10px] text-muted border border-white/10 px-2 py-0.5 rounded-full hover:border-accent/40 hover:text-accent transition-all">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ProfileBuilderPage() {
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const [step, setStep]         = useState(0);
  const [skills, setSkills]     = useState([]);
  const [experience, setExp]    = useState([{ title: '', company: '', startDate: '', endDate: '', current: false, description: '' }]);
  const [education, setEdu]     = useState([{ degree: '', school: '', year: '' }]);
  const [resumeUploading, setRU] = useState(false);
  const [resumeUrl, setRUrl]    = useState('');

  const { data: profileData } = useQuery('my-profile', () => api.get('/candidate/me').then(r => r.data));

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  useEffect(() => {
    if (profileData?.profile) {
      const p = profileData.profile;
      reset({
        headline: p.headline, bio: p.bio, location: p.location,
        experienceYears: p.experienceYears, linkedinUrl: p.linkedinUrl,
        githubUrl: p.githubUrl, portfolioUrl: p.portfolioUrl,
        desiredSalaryMin: p.desiredSalaryMin, desiredSalaryMax: p.desiredSalaryMax,
        desiredEquity: p.desiredEquity, workMode: p.workMode || 'any',
        visibility: p.visibility || 'public',
      });
      if (p.skills?.length) setSkills(p.skills);
      if (p.experience?.length) setExp(p.experience);
      if (p.education?.length) setEdu(p.education);
      if (p.resumeUrl) setRUrl(p.resumeUrl);
    }
  }, [profileData]);

  const saveMutation = useMutation(
    (data) => api.put('/candidate/me', data),
    { onSuccess: () => { qc.invalidateQueries('my-profile'); toast.success('Profile saved!'); navigate('/candidate/dashboard'); } }
  );

  const onSubmit = (data) => {
    saveMutation.mutate({ ...data, skills, experience, education, resumeUrl });
  };

  const uploadResume = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('Only PDF files are allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return; }
    setRU(true);
    const fd = new FormData(); fd.append('resume', file);
    try {
      const { data } = await api.post('/candidate/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setRUrl(data.resumeUrl);
      toast.success('Resume uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setRU(false); }
  };

  const addExp = () => setExp(p => [...p, { title: '', company: '', startDate: '', endDate: '', current: false, description: '' }]);
  const removeExp = (i) => setExp(p => p.filter((_, j) => j !== i));
  const updateExp = (i, k, v) => setExp(p => { const n = [...p]; n[i] = { ...n[i], [k]: v }; return n; });

  const addEdu = () => setEdu(p => [...p, { degree: '', school: '', year: '' }]);
  const removeEdu = (i) => setEdu(p => p.filter((_, j) => j !== i));
  const updateEdu = (i, k, v) => setEdu(p => { const n = [...p]; n[i] = { ...n[i], [k]: v }; return n; });

  const POPULAR_SKILLS = ['React','Node.js','Python','TypeScript','MongoDB','PostgreSQL','AWS','Docker','Next.js','Go','Java','Kubernetes','GraphQL','Redis'];

  return (
    <div className="page-container py-8 max-w-2xl">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display font-black text-2xl">Build Your Profile</h1>
          <span className="text-xs text-muted">{step + 1} of {STEPS.length}</span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-all ${i <= step ? 'bg-accent' : 'bg-white/10'}`} />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {STEPS.map((s, i) => (
            <span key={s} className={`text-[10px] ${i === step ? 'text-accent' : 'text-muted'}`}>{s}</span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ── Step 0: Basic Info ── */}
        {step === 0 && (
          <div className="card space-y-4 animate-fade-in-up">
            <h2 className="font-display font-bold text-base">Tell us about yourself</h2>
            <div>
              <label className="label">Professional Headline *</label>
              <input {...register('headline', { required: 'Headline is required' })} className="input"
                placeholder="e.g. Senior React Developer · Open to remote" />
              {errors.headline && <p className="text-xs text-red-400 mt-1">{errors.headline.message}</p>}
            </div>
            <div>
              <label className="label">Bio <span className="text-muted">(max 500 chars)</span></label>
              <textarea {...register('bio', { maxLength: { value: 500, message: 'Max 500 characters' } })}
                rows={4} className="input resize-none" placeholder="A brief summary of who you are, what you've built, and what you're looking for…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Location</label>
                <input {...register('location')} className="input" placeholder="e.g. Bengaluru, India" />
              </div>
              <div>
                <label className="label">Years of Experience</label>
                <input {...register('experienceYears', { valueAsNumber: true })} type="number" min={0} max={40} className="input" placeholder="e.g. 4" />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Skills ── */}
        {step === 1 && (
          <div className="card space-y-4 animate-fade-in-up">
            <h2 className="font-display font-bold text-base">What are your key skills?</h2>
            <p className="text-sm text-muted">Add at least 3 skills. Press Enter or comma to add.</p>
            <TagInput value={skills} onChange={setSkills} placeholder="e.g. React, Node.js, MongoDB…" suggestions={POPULAR_SKILLS} />
            {skills.length < 3 && <p className="text-xs text-muted2">Add at least {3 - skills.length} more skill{3 - skills.length > 1 ? 's' : ''}</p>}
          </div>
        )}

        {/* ── Step 2: Experience ── */}
        {step === 2 && (
          <div className="card space-y-5 animate-fade-in-up">
            <h2 className="font-display font-bold text-base">Work Experience</h2>
            {experience.map((exp, i) => (
              <div key={i} className="border border-white/10 rounded-xl p-4 space-y-3 relative">
                {experience.length > 1 && (
                  <button type="button" onClick={() => removeExp(i)} className="absolute top-3 right-3 text-muted hover:text-red-400 transition-colors"><X size={14} /></button>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Job Title</label>
                    <input value={exp.title} onChange={e => updateExp(i, 'title', e.target.value)} className="input" placeholder="e.g. Software Engineer" />
                  </div>
                  <div>
                    <label className="label">Company</label>
                    <input value={exp.company} onChange={e => updateExp(i, 'company', e.target.value)} className="input" placeholder="e.g. Razorpay" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Start Date</label>
                    <input type="month" value={exp.startDate} onChange={e => updateExp(i, 'startDate', e.target.value)} className="input" />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input type="month" value={exp.endDate} onChange={e => updateExp(i, 'endDate', e.target.value)} className="input" disabled={exp.current} />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={exp.current} onChange={e => updateExp(i, 'current', e.target.checked)} className="accent-accent w-4 h-4" />
                  <span className="text-sm text-muted2">Currently working here</span>
                </label>
                <div>
                  <label className="label">Description</label>
                  <textarea value={exp.description} onChange={e => updateExp(i, 'description', e.target.value)} rows={2} className="input resize-none" placeholder="What did you build / achieve?" />
                </div>
              </div>
            ))}
            <button type="button" onClick={addExp} className="flex items-center gap-1.5 text-sm text-accent hover:underline">
              <Plus size={14} /> Add another role
            </button>
          </div>
        )}

        {/* ── Step 3: Education & Projects ── */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="card space-y-4">
              <h2 className="font-display font-bold text-base">Education</h2>
              {education.map((edu, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 items-start relative">
                  {education.length > 1 && (
                    <button type="button" onClick={() => removeEdu(i)} className="absolute -top-1 -right-1 text-muted hover:text-red-400"><X size={12} /></button>
                  )}
                  <div>
                    <label className="label">Degree</label>
                    <input value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} className="input" placeholder="B.Tech CSE" />
                  </div>
                  <div>
                    <label className="label">School</label>
                    <input value={edu.school} onChange={e => updateEdu(i, 'school', e.target.value)} className="input" placeholder="IIT Bombay" />
                  </div>
                  <div>
                    <label className="label">Year</label>
                    <input type="number" value={edu.year} onChange={e => updateEdu(i, 'year', e.target.value)} className="input" placeholder="2022" />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addEdu} className="flex items-center gap-1.5 text-sm text-accent hover:underline">
                <Plus size={14} /> Add education
              </button>
            </div>
            <div className="card space-y-4">
              <h2 className="font-display font-bold text-base">Links</h2>
              <div>
                <label className="label">LinkedIn</label>
                <input {...register('linkedinUrl')} className="input" placeholder="https://linkedin.com/in/yourname" />
              </div>
              <div>
                <label className="label">GitHub</label>
                <input {...register('githubUrl')} className="input" placeholder="https://github.com/yourname" />
              </div>
              <div>
                <label className="label">Portfolio / Website</label>
                <input {...register('portfolioUrl')} className="input" placeholder="https://yoursite.dev" />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Preferences ── */}
        {step === 4 && (
          <div className="card space-y-5 animate-fade-in-up">
            <h2 className="font-display font-bold text-base">Preferences & Resume</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Min Desired Salary (LPA)</label>
                <input {...register('desiredSalaryMin', { valueAsNumber: true })} type="number" className="input" placeholder="15" />
              </div>
              <div>
                <label className="label">Max Desired Salary (LPA)</label>
                <input {...register('desiredSalaryMax', { valueAsNumber: true })} type="number" className="input" placeholder="30" />
              </div>
            </div>
            <div>
              <label className="label">Work Mode Preference</label>
              <div className="grid grid-cols-4 gap-2">
                {['remote','hybrid','onsite','any'].map(m => {
                  const wm = watch('workMode');
                  return (
                    <label key={m} className={`flex items-center justify-center py-2 rounded-lg border cursor-pointer text-xs font-medium capitalize transition-all
                      ${wm === m ? 'border-accent/50 bg-accent/10 text-accent' : 'border-white/10 text-muted hover:border-white/20'}`}>
                      <input type="radio" value={m} {...register('workMode')} className="sr-only" />
                      {m}
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="label">Profile Visibility</label>
              <select {...register('visibility')} className="input">
                <option value="public">Public — anyone can view</option>
                <option value="recruiters">Recruiters only</option>
                <option value="private">Private — only me</option>
              </select>
            </div>
            <div>
              <label className="label">Resume (PDF, max 5MB)</label>
              {resumeUrl ? (
                <div className="flex items-center gap-3 border border-accent/20 bg-accent/5 rounded-xl px-4 py-3">
                  <CheckCircle size={16} className="text-accent flex-shrink-0" />
                  <span className="text-sm text-accent flex-1 truncate">Resume uploaded</span>
                  <button type="button" onClick={() => setRUrl('')} className="text-muted hover:text-red-400"><X size={14} /></button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl py-8 cursor-pointer hover:border-accent/30 transition-colors">
                  <Upload size={22} className="text-muted mb-2" />
                  <span className="text-sm text-muted2">Drag & drop or click to upload PDF</span>
                  <span className="text-xs text-muted mt-1">Max 5MB</span>
                  <input type="file" accept=".pdf" className="sr-only" onChange={e => uploadResume(e.target.files?.[0])} disabled={resumeUploading} />
                  {resumeUploading && <p className="text-xs text-accent mt-2">Uploading…</p>}
                </label>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button type="button" onClick={() => setStep(p => p - 1)} className="btn-ghost px-6 py-3">← Back</button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => { if (step === 1 && skills.length < 3) { toast.error('Add at least 3 skills'); return; } setStep(p => p + 1); }}
              className="btn-primary flex-1 py-3">
              Continue →
            </button>
          ) : (
            <button type="submit" disabled={saveMutation.isLoading} className="btn-primary flex-1 py-3">
              {saveMutation.isLoading ? 'Saving…' : 'Save Profile ✓'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
