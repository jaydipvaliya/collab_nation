import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, CheckCircle, Briefcase, User } from 'lucide-react';
import api, { setToken } from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

// ── Forgot Password ───────────────────────────────────────
export function ForgotPasswordPage() {
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch { toast.error('Something went wrong.'); }
    finally { setLoading(false); }
  };

  if (sent) return (
    <div className="card text-center animate-fade-in-up">
      <Mail size={36} className="text-accent mx-auto mb-4" />
      <h2 className="font-display font-black text-xl mb-2">Check your inbox</h2>
      <p className="text-sm text-muted mb-5">If that email exists, we've sent a reset link. Check your spam folder too.</p>
      <Link to="/login" className="btn-primary w-full py-2.5 block text-center">Back to login</Link>
    </div>
  );

  return (
    <div className="card animate-fade-in-up">
      <h1 className="font-display font-black text-2xl mb-1">Reset password</h1>
      <p className="text-sm text-muted mb-6">Enter your email and we'll send a reset link.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Email address</label>
          <input {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
            className="input" type="email" placeholder="you@example.com" />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <p className="text-center text-sm text-muted mt-5">
        <Link to="/login" className="text-accent hover:underline">Back to login</Link>
      </p>
    </div>
  );
}

// ── Reset Password ────────────────────────────────────────
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors }, setError } = useForm();
  const token = searchParams.get('token');

  const onSubmit = async ({ password, confirmPassword }) => {
    if (password !== confirmPassword) return setError('confirmPassword', { message: 'Passwords do not match' });
    setLoading(true);
    try {
      await api.post(`/auth/reset-password?token=${token}`, { password });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      setError('root', { message: err.response?.data?.message || 'Reset failed.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="card animate-fade-in-up">
      <h1 className="font-display font-black text-2xl mb-1">New password</h1>
      <p className="text-sm text-muted mb-6">Choose a strong password for your account.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">New password</label>
          <input {...register('password', { required: true, minLength: { value: 8, message: 'Min 8 characters' } })} className="input" type="password" placeholder="Min. 8 characters" />
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="label">Confirm password</label>
          <input {...register('confirmPassword', { required: true })} className="input" type="password" placeholder="••••••••" />
          {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>}
        </div>
        {errors.root && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm text-red-400">{errors.root.message}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
    </div>
  );
}

// ── Verify Email ──────────────────────────────────────────
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => { setStatus('success'); setTimeout(() => navigate('/login'), 3000); })
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="card text-center animate-fade-in-up">
      {status === 'verifying' && (
        <>
          <div className="w-10 h-10 border-2 border-white/10 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="font-display font-bold text-lg">Verifying your email…</h2>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle size={40} className="text-accent mx-auto mb-4" />
          <h2 className="font-display font-black text-xl mb-2">Email verified!</h2>
          <p className="text-sm text-muted">Redirecting you to login…</p>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="text-4xl mb-4">❌</div>
          <h2 className="font-display font-black text-xl mb-2">Invalid link</h2>
          <p className="text-sm text-muted mb-5">This verification link is invalid or has expired.</p>
          <Link to="/login" className="btn-primary w-full py-2.5 block text-center">Go to login</Link>
        </>
      )}
    </div>
  );
}

// ── Check Email page ──────────────────────────────────────
export function CheckEmailPage() {
  return (
    <div className="card text-center animate-fade-in-up">
      <Mail size={40} className="text-accent mx-auto mb-4" />
      <h2 className="font-display font-black text-xl mb-2">Check your email</h2>
      <p className="text-sm text-muted mb-5">We sent a verification link to your email. Click it to activate your account.</p>
      <Link to="/login" className="btn-primary w-full py-2.5 block text-center">Back to login</Link>
    </div>
  );
}

// ── Onboarding (Google new users) ────────────────────────
export function OnboardingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);
  const token = searchParams.get('token');

  useEffect(() => { if (token) setToken(token); }, [token]);

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const { data } = await api.patch('/auth/set-role', { role: selected });
      setToken(data.accessToken);
      updateUser(data.user);
      toast.success('Welcome to Collab Nation!');
      navigate(selected === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard');
    } catch { toast.error('Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="card animate-fade-in-up">
      <h1 className="font-display font-black text-2xl mb-1">One last step 👋</h1>
      <p className="text-sm text-muted mb-6">Tell us how you'll be using Collab Nation.</p>
      <div className="space-y-3 mb-6">
        {[
  ['candidate', "I'm looking for a job", "Browse startup jobs, apply in one click, track applications.", User],
  ['recruiter', "I'm hiring talent", "Post jobs, review candidates, manage your pipeline.", Briefcase]
].map(([val, title, desc, Icon]) => (
          <button key={val} onClick={() => setSelected(val)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${selected === val ? 'border-accent/50 bg-accent/5' : 'border-white/10 hover:border-white/20'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${selected === val ? 'bg-accent/20' : 'bg-surface2'}`}>
                <Icon size={16} className={selected === val ? 'text-accent' : 'text-muted'} />
              </div>
              <div>
                <p className="font-medium text-sm text-ink">{title}</p>
                <p className="text-xs text-muted">{desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <button onClick={handleSubmit} disabled={!selected || loading} className="btn-primary w-full py-2.5">
        {loading ? 'Setting up…' : 'Get started →'}
      </button>
    </div>
  );
}

// ── OAuth Callback ────────────────────────────────────────
export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const isNew = searchParams.get('newUser');
    if (!token) { navigate('/login?error=oauth_failed'); return; }
    setToken(token);
    api.post('/auth/refresh').then(({ data }) => {
      updateUser(data.user);
      navigate(isNew ? '/onboarding' : (data.user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'));
    }).catch(() => navigate('/login'));
  }, []);

  return (
    <div className="card text-center">
      <div className="w-10 h-10 border-2 border-white/10 border-t-accent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm text-muted">Completing sign in…</p>
    </div>
  );
}
