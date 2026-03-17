import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, X, Upload } from 'lucide-react';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';

const TagInput = ({ value = [], onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const add = () => {
    if (input.trim() && !value.includes(input.trim())) onChange([...value, input.trim()]);
    setInput('');
  };
  return (
    <div className="input flex flex-wrap gap-1.5 h-auto min-h-[42px]">
      {value.map(t => (
        <span key={t} className="flex items-center gap-1 bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-md">
          {t}<button type="button" onClick={() => onChange(value.filter(v => v !== t))}><X size={10} /></button>
        </span>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
        className="flex-1 min-w-24 bg-transparent outline-none text-sm placeholder-muted"
        placeholder={value.length === 0 ? placeholder : ''} />
    </div>
  );
};

const PERKS_LIST = ['Remote work','Equity / ESOP','Health insurance','Flexible hours','Learning budget','Home office stipend','Parental leave','Unlimited PTO','Free meals','Team retreats'];

export default function CompanySetupPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [techStack, setTechStack] = useState([]);
  const [perks, setPerks]         = useState([]);
  const [logoUploading, setLogoUploading] = useState(false);
  const [isEdit, setIsEdit]       = useState(false);

  const { data } = useQuery('my-company', () => api.get('/companies/mine').then(r => r.data), {
    onError: () => {}
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (data?.company) {
      const c = data.company;
      reset({
        name: c.name, website: c.website, description: c.description,
        mission: c.mission, industry: c.industry, stage: c.stage,
        teamSize: c.teamSize, hqLocation: c.hqLocation, remotePolicy: c.remotePolicy,
        linkedinUrl: c.linkedinUrl, twitterUrl: c.twitterUrl, foundedYear: c.foundedYear,
      });
      if (c.techStack?.length) setTechStack(c.techStack);
      if (c.perks?.length) setPerks(c.perks);
      setIsEdit(true);
    }
  }, [data]);

  const saveMutation = useMutation(
    (body) => isEdit ? api.patch('/companies/mine', body) : api.post('/companies', body),
    {
      onSuccess: () => {
        toast.success(isEdit ? 'Company updated!' : 'Company created!');
        qc.invalidateQueries('my-company');
        navigate('/recruiter/dashboard');
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
    }
  );

  const onSubmit = (data) => saveMutation.mutate({ ...data, techStack, perks });

const uploadLogo = async (file) => {
  if (!file) return;

  // Validate file type
  const allowed = ['image/jpeg','image/png','image/webp','image/svg+xml'];
  if (!allowed.includes(file.type)) {
    toast.error('Only JPG, PNG, WebP or SVG allowed');
    return;
  }

  // Validate file size (2MB)
  if (file.size > 2 * 1024 * 1024) {
    toast.error('Logo must be under 2MB');
    return;
  }

  setLogoUploading(true);
  try {
    const fd = new FormData();
    fd.append('logo', file);
    const { data } = await api.post('/companies/mine/logo', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.success('Logo uploaded successfully!');
    qc.invalidateQueries('my-company');
  } catch (err) {
    const msg = err.response?.data?.message || 'Logo upload failed';
    toast.error(msg);
    console.error('Logo upload error:', err.response?.data);
  } finally {
    setLogoUploading(false);
  }
};

  return (
    <div className="page-container py-8 max-w-2xl">
      <h1 className="font-display font-black text-2xl mb-1">{isEdit ? 'Edit Company Profile' : 'Set Up Your Company'}</h1>
      <p className="text-sm text-muted mb-7">A complete company profile attracts better candidates.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo */}
        <div className="card flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-surface2 flex items-center justify-center overflow-hidden flex-shrink-0">
            {data?.company?.logo
              ? <img src={data.company.logo} alt="logo" className="w-full h-full object-contain p-1" />
              : <span className="font-display font-black text-2xl text-accent">{data?.company?.name?.[0] || 'C'}</span>
            }
          </div>
          <div>
            <p className="text-sm font-medium text-ink mb-1">Company Logo</p>
            <label className={`text-xs px-3 py-2 cursor-pointer inline-flex items-center gap-1.5 rounded-lg border transition-all
  ${logoUploading || !isEdit
    ? 'border-white/5 text-muted cursor-not-allowed opacity-50'
    : 'border-white/10 text-muted2 hover:border-white/25 hover:text-ink cursor-pointer'}`}>
  {logoUploading
    ? <><div className="w-3 h-3 border border-white/20 border-t-accent rounded-full animate-spin" /> Uploading…</>
    : <><Upload size={12} /> Upload Logo</>
  }
  <input
    type="file"
    accept="image/jpeg,image/png,image/webp,image/svg+xml"
    className="sr-only"
    onChange={e => uploadLogo(e.target.files?.[0])}
    disabled={logoUploading || !isEdit}
  />
</label>
{!isEdit && (
  <p className="text-xs text-muted mt-1">
    ⚠️ Save your company profile first, then you can upload a logo
  </p>
)}
          </div>
        </div>

        {/* Basics */}
        <div className="card space-y-4">
          <h3 className="font-display font-bold text-sm text-muted uppercase tracking-wider">Company Basics</h3>
          <div>
            <label className="label">Company Name *</label>
            <input {...register('name', { required: 'Company name is required' })} className="input" placeholder="e.g. Acme AI" />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Industry</label>
              <input {...register('industry')} className="input" placeholder="e.g. Fintech, SaaS, AI" />
            </div>
            <div>
              <label className="label">Founded Year</label>
              <input {...register('foundedYear', { valueAsNumber: true })} type="number" className="input" placeholder="2021" />
            </div>
          </div>
          <div>
            <label className="label">Website</label>
            <input {...register('website')} className="input" placeholder="https://yourcompany.com" />
          </div>
        </div>

        {/* Description */}
        <div className="card space-y-4">
          <h3 className="font-display font-bold text-sm text-muted uppercase tracking-wider">About the Company</h3>
          <div>
            <label className="label">Description *</label>
            <textarea {...register('description', { required: 'Description is required', minLength: { value: 30, message: 'At least 30 characters' } })}
              rows={4} className="input resize-none" placeholder="What does your company do? What problem are you solving?" />
            {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <label className="label">Mission Statement</label>
            <textarea {...register('mission')} rows={2} className="input resize-none" placeholder="What is your company's mission?" />
          </div>
        </div>

        {/* Scale */}
        <div className="card space-y-4">
          <h3 className="font-display font-bold text-sm text-muted uppercase tracking-wider">Scale & Stage</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Funding Stage</label>
              <select {...register('stage')} className="input">
                <option value="">Select stage</option>
                {['pre-seed','seed','series-a','series-b','series-c','series-d+','unicorn','bootstrapped'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Team Size</label>
              <select {...register('teamSize')} className="input">
                <option value="">Select size</option>
                {['1-10','11-50','51-200','201-500','500+'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">HQ Location</label>
              <input {...register('hqLocation')} className="input" placeholder="e.g. Bengaluru, India" />
            </div>
            <div>
              <label className="label">Remote Policy</label>
              <select {...register('remotePolicy')} className="input">
                <option value="">Select policy</option>
                <option value="remote">Fully Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tech & Perks */}
        <div className="card space-y-4">
          <h3 className="font-display font-bold text-sm text-muted uppercase tracking-wider">Tech Stack & Perks</h3>
          <div>
            <label className="label">Tech Stack <span className="text-muted">(press Enter to add)</span></label>
            <TagInput value={techStack} onChange={setTechStack} placeholder="e.g. React, Node.js, AWS…" />
          </div>
          <div>
            <label className="label">Perks & Benefits</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PERKS_LIST.map(p => (
                <button key={p} type="button" onClick={() => setPerks(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${perks.includes(p) ? 'border-accent/50 bg-accent/10 text-accent' : 'border-white/10 text-muted2 hover:border-white/20'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="card space-y-4">
          <h3 className="font-display font-bold text-sm text-muted uppercase tracking-wider">Social Links</h3>
          <div>
            <label className="label">LinkedIn</label>
            <input {...register('linkedinUrl')} className="input" placeholder="https://linkedin.com/company/yourcompany" />
          </div>
          <div>
            <label className="label">Twitter / X</label>
            <input {...register('twitterUrl')} className="input" placeholder="https://twitter.com/yourcompany" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saveMutation.isLoading} className="btn-primary flex-1 py-3">
            {saveMutation.isLoading ? 'Saving…' : isEdit ? 'Update Company →' : 'Create Company →'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost px-5 py-3">Cancel</button>
        </div>
      </form>
    </div>
  );
}
