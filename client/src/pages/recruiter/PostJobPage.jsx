import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';

const TagInput = ({ value = [], onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const add = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) onChange([...value, input.trim()]);
      setInput('');
    }
  };
  return (
    <div className="input flex flex-wrap gap-1.5 h-auto min-h-[42px] cursor-text" onClick={e => e.currentTarget.querySelector('input').focus()}>
      {value.map(t => (
        <span key={t} className="flex items-center gap-1 bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-md">
          {t}<button type="button" onClick={() => onChange(value.filter(v => v !== t))}><X size={10} /></button>
        </span>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={add}
        className="flex-1 min-w-24 bg-transparent outline-none text-sm placeholder-muted"
        placeholder={value.length === 0 ? placeholder : ''} />
    </div>
  );
};

export default function PostJobPage() {
  const navigate = useNavigate();
  const [skills, setSkills]             = useState([]);
  const [requirements, setRequirements] = useState(['']);
  const [loading, setLoading]           = useState(false);

  const { register, handleSubmit, watch, formState: { errors }, setError } = useForm({
    defaultValues: { jobType: 'full-time', workMode: 'hybrid', experienceLevel: 'mid', status: 'active' }
  });

  const onSubmit = async (data) => {
    if (skills.length === 0) { toast.error('Add at least one skill'); return; }
    setLoading(true);
    try {
      await api.post('/jobs', {
        ...data,
        skills,
        requirements: requirements.filter(Boolean),
        salaryMin: Number(data.salaryMin),
        salaryMax: Number(data.salaryMax),
      });
      toast.success('Job posted successfully!');
      navigate('/recruiter/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to post job.';
      if (msg.includes('company')) {
        toast.error('Please create a company profile first.');
        navigate('/recruiter/company');
      } else {
        setError('root', { message: msg });
      }
    } finally { setLoading(false); }
  };

  const updateRequirement = (i, val) => {
    const next = [...requirements]; next[i] = val; setRequirements(next);
  };

  return (
    <div className="page-container py-8 max-w-2xl">
      <h1 className="font-display font-black text-2xl mb-1">Post a Job</h1>
      <p className="text-sm text-muted mb-7">Fill in the details. Salary and equity are required — it's what candidates love.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basics */}
        <div className="card space-y-4">
          <h3 className="font-display font-bold text-sm text-muted uppercase tracking-wider">Job Basics</h3>
          <div>
            <label className="label">Job Title *</label>
            <input {...register('title', { required: 'Title is required' })} className="input" placeholder="e.g. Senior React Developer" />
            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Job Type</label>
              <select {...register('jobType')} className="input">
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="label">Work Mode</label>
              <select {...register('workMode')} className="input">
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Experience Level</label>
              <select {...register('experienceLevel')} className="input">
                <option value="entry">Entry level</option>
                <option value="mid">Mid level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead / Staff</option>
              </select>
            </div>
            <div>
              <label className="label">Location</label>
              <input {...register('location')} className="input" placeholder="e.g. Bengaluru / Remote" />
            </div>
          </div>
        </div>

        {/* Compensation */}
        <div className="card space-y-4">
          <h3 className="font-display font-bold text-sm text-muted uppercase tracking-wider">Compensation</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Min Salary (LPA) *</label>
              <input {...register('salaryMin', { required: 'Required', min: { value: 1, message: 'Min 1' } })}
                className="input" type="number" placeholder="e.g. 15" />
              {errors.salaryMin && <p className="text-xs text-red-400 mt-1">{errors.salaryMin.message}</p>}
            </div>
            <div>
              <label className="label">Max Salary (LPA) *</label>
              <input {...register('salaryMax', { required: 'Required' })}
                className="input" type="number" placeholder="e.g. 25" />
              {errors.salaryMax && <p className="text-xs text-red-400 mt-1">{errors.salaryMax.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Equity (optional)</label>
            <input {...register('equity')} className="input" placeholder="e.g. 0.1% – 0.5%" />
          </div>
        </div>

        {/* Skills */}
        <div className="card space-y-4">
          <h3 className="font-display font-bold text-sm text-muted uppercase tracking-wider">Skills Required</h3>
          <div>
            <label className="label">Skills * <span className="text-muted">(press Enter or comma to add)</span></label>
            <TagInput value={skills} onChange={setSkills} placeholder="e.g. React, Node.js, MongoDB…" />
          </div>
        </div>

        {/* Description */}
        <div className="card space-y-4">
          <h3 className="font-display font-bold text-sm text-muted uppercase tracking-wider">Job Description</h3>
          <div>
            <label className="label">About the Role *</label>
            <textarea {...register('description', { required: 'Description is required', minLength: { value: 50, message: 'At least 50 characters' } })}
              rows={6} className="input resize-none" placeholder="Describe the role, team, and what the candidate will be working on…" />
            {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <label className="label">Requirements</label>
            {requirements.map((req, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={req} onChange={e => updateRequirement(i, e.target.value)}
                  className="input flex-1" placeholder={`Requirement ${i + 1}`} />
                {requirements.length > 1 && (
                  <button type="button" onClick={() => setRequirements(requirements.filter((_, j) => j !== i))}
                    className="text-muted hover:text-red-400 transition-colors"><X size={16} /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setRequirements([...requirements, ''])}
              className="text-xs text-accent hover:underline flex items-center gap-1 mt-1">
              <Plus size={12} /> Add requirement
            </button>
          </div>
        </div>

        {errors.root && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
            {errors.root.message}
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
            {loading ? 'Posting…' : 'Publish Job →'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost px-5 py-3">Cancel</button>
        </div>
      </form>
    </div>
  );
}
