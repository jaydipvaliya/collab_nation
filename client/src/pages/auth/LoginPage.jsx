import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Chrome } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm();

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const dest = from || (user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError('root', { message: msg });
    } finally { setLoading(false); }
  };

  return (
    <div className="card animate-fade-in-up">
      <h1 className="font-display font-black text-2xl mb-1">Welcome back</h1>
      <p className="text-sm text-muted mb-6">Log in to your Collab Nation account</p>

      {/* Google */}
      <button onClick={loginWithGoogle}
        className="w-full flex items-center justify-center gap-2.5 btn-secondary mb-4 py-2.5">
        <Chrome size={16} className="text-accent" />
        <span className="text-sm">Continue with Google</span>
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-muted">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Email address</label>
          <input {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
            className="input" type="email" placeholder="you@example.com" autoComplete="email" />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex justify-between mb-1.5">
            <label className="label mb-0">Password</label>
            <Link to="/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <input {...register('password', { required: 'Password is required' })}
              className="input pr-10" type={showPass ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password" />
            <button type="button" onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        {errors.root && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm text-red-400">
            {errors.root.message}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />Signing in…</span> : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-muted mt-5">
        Don't have an account?{' '}
        <Link to="/register" className="text-accent hover:underline">Sign up free</Link>
      </p>
    </div>
  );
}
