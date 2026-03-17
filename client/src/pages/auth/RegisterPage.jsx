import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Chrome, Briefcase, User } from 'lucide-react';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';

const strength = (p) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-accent'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors }, setError } = useForm({ defaultValues: { role: 'candidate' } });

  const password = watch('password', '');
  const role = watch('role');
  const pwStr = strength(password);

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword)
      return setError('confirmPassword', { message: 'Passwords do not match' });
    setLoading(true);
    try {
      await api.post('/auth/register', { name: data.name, email: data.email, password: data.password, role: data.role });
      toast.success('Account created! Check your email to verify.');
      navigate('/check-email');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      console.log('Register error:', err.response?.data);
      setError('root', { message: msg });
    } finally { setLoading(false); }
  };

  return (
    <div className="card animate-fade-in-up">
      <h1 className="font-display font-black text-2xl mb-1">Join Collab Nation</h1>
      <p className="text-sm text-muted mb-5">Create your free account</p>

      <button onClick={() => window.location.href = '/api/auth/google'}
        className="w-full flex items-center justify-center gap-2.5 btn-secondary mb-4 py-2.5">
        <Chrome size={16} className="text-accent" />
        <span className="text-sm">Sign up with Google</span>
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-muted">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role */}
        <div>
          <label className="label">I am a…</label>
          <div className="grid grid-cols-2 gap-2">
            {[['candidate', 'Job Seeker', User], ['recruiter', 'Hiring / Recruiter', Briefcase]].map(([val, lbl, Icon]) => (
              <label key={val} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                ${role === val ? 'border-accent/50 bg-accent/5 text-ink' : 'border-white/10 text-muted hover:border-white/20'}`}>
                <input type="radio" value={val} {...register('role')} className="sr-only" />
                <Icon size={15} className={role === val ? 'text-accent' : ''} />
                <span className="text-xs font-medium">{lbl}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="label">Full name</label>
          <input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Too short' } })}
            className="input" placeholder="Priya Sharma" />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="label">Email address</label>
          <input {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
            className="input" type="email" placeholder="priya@example.com" />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
              className="input pr-10" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" />
            <button type="button" onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${pwStr >= i ? strengthColor[pwStr] : 'bg-white/10'}`} />
                ))}
              </div>
              <p className="text-xs text-muted">{strengthLabel[pwStr]}</p>
            </div>
          )}
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        {/* Confirm */}
        <div>
          <label className="label">Confirm password</label>
          <input {...register('confirmPassword', { required: 'Please confirm your password' })}
            className="input" type="password" placeholder="••••••••" />
          {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {errors.root && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm text-red-400">
            {errors.root.message}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />Creating account…</span> : 'Create account'}
        </button>

        <p className="text-xs text-muted text-center">
          By signing up, you agree to our <a href="#" className="text-accent hover:underline">Terms</a> and <a href="#" className="text-accent hover:underline">Privacy Policy</a>.
        </p>
      </form>

      <p className="text-center text-sm text-muted mt-5">
        Already have an account? <Link to="/login" className="text-accent hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
