import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { Shield, Bell, User, Trash2, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'account',  label: 'Account',       icon: User },
  { id: 'password', label: 'Password',      icon: Shield },
  { id: 'notifs',   label: 'Notifications', icon: Bell },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('account');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [delConfirm, setDelConfirm] = useState('');

  const { register: regAcc, handleSubmit: hsAcc, formState: { errors: errAcc } } = useForm({
    defaultValues: { name: user?.name, email: user?.email }
  });
  const { register: regPw, handleSubmit: hsPw, reset: resetPw, formState: { errors: errPw }, setError: setErrPw } = useForm();
  const { register: regNot, handleSubmit: hsNot } = useForm({
    defaultValues: { emailOnApply: true, emailOnStatusChange: true, emailOnMessage: true }
  });

  const accMutation = useMutation(
    (d) => api.patch('/candidate/me', { headline: d.name }),
    { onSuccess: () => toast.success('Account updated!'), onError: () => toast.error('Update failed') }
  );

  const pwMutation = useMutation(
    async (d) => {
      if (d.newPassword !== d.confirmPassword) throw new Error('Passwords do not match');
      return api.post('/auth/change-password', { oldPassword: d.oldPassword, newPassword: d.newPassword });
    },
    {
      onSuccess: () => { toast.success('Password changed!'); resetPw(); },
      onError: (err) => {
        const msg = err.message || err.response?.data?.message || 'Failed to change password';
        setErrPw('root', { message: msg });
      }
    }
  );

  const notifMutation = useMutation(
    (d) => api.patch('/candidate/me', { notificationPrefs: d }),
    { onSuccess: () => toast.success('Notification preferences saved!') }
  );

  return (
    <div className="page-container py-8 max-w-2xl">
      <h1 className="font-display font-black text-2xl mb-7">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.08] mb-7">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all
              ${tab === id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Account tab */}
      {tab === 'account' && (
        <div className="space-y-5 animate-fade-in">
          <div className="card">
            <h3 className="font-display font-bold text-base mb-5">Account Details</h3>
            <form onSubmit={hsAcc(d => accMutation.mutate(d))} className="space-y-4">
              <div>
                <label className="label">Display Name</label>
                <input {...regAcc('name', { required: 'Name is required' })} className="input" />
                {errAcc.name && <p className="text-xs text-red-400 mt-1">{errAcc.name.message}</p>}
              </div>
              <div>
                <label className="label">Email Address</label>
                <input value={user?.email} disabled className="input opacity-50 cursor-not-allowed" />
                <p className="text-xs text-muted mt-1">Email cannot be changed. Contact support if needed.</p>
              </div>
              <div>
                <label className="label">Role</label>
                <div className="input opacity-50 cursor-not-allowed capitalize">{user?.role}</div>
              </div>
              <button type="submit" disabled={accMutation.isLoading} className="btn-primary px-5 py-2.5 text-sm">
                {accMutation.isLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Danger zone */}
          <div className="card border-red-500/20">
            <h3 className="font-display font-bold text-base text-red-400 mb-3 flex items-center gap-2">
              <Trash2 size={15} /> Danger Zone
            </h3>
            <p className="text-sm text-muted mb-4">Deleting your account is permanent and cannot be undone.</p>
            <input value={delConfirm} onChange={e => setDelConfirm(e.target.value)}
              className="input mb-3" placeholder={`Type "DELETE" to confirm`} />
            <button disabled={delConfirm !== 'DELETE'}
              className="btn-danger w-full py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed">
              Delete My Account
            </button>
          </div>
        </div>
      )}

      {/* Password tab */}
      {tab === 'password' && (
        <div className="card animate-fade-in">
          <h3 className="font-display font-bold text-base mb-5">Change Password</h3>
          {user?.authProvider === 'google' ? (
            <div className="bg-surface2 rounded-xl p-4 text-sm text-muted">
              You signed up with Google. Password change is not available for Google accounts.
            </div>
          ) : (
            <form onSubmit={hsPw(d => pwMutation.mutate(d))} className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <div className="relative">
                  <input {...regPw('oldPassword', { required: 'Current password is required' })}
                    type={showOld ? 'text' : 'password'} className="input pr-10" />
                  <button type="button" onClick={() => setShowOld(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
                    {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errPw.oldPassword && <p className="text-xs text-red-400 mt-1">{errPw.oldPassword.message}</p>}
              </div>
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <input {...regPw('newPassword', { required: 'New password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
                    type={showNew ? 'text' : 'password'} className="input pr-10" />
                  <button type="button" onClick={() => setShowNew(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errPw.newPassword && <p className="text-xs text-red-400 mt-1">{errPw.newPassword.message}</p>}
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input {...regPw('confirmPassword', { required: 'Please confirm your password' })}
                  type="password" className="input" />
                {errPw.confirmPassword && <p className="text-xs text-red-400 mt-1">{errPw.confirmPassword.message}</p>}
              </div>
              {errPw.root && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm text-red-400">
                  {errPw.root.message}
                </div>
              )}
              <button type="submit" disabled={pwMutation.isLoading} className="btn-primary px-5 py-2.5 text-sm">
                {pwMutation.isLoading ? 'Changing…' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Notifications tab */}
      {tab === 'notifs' && (
        <div className="card animate-fade-in">
          <h3 className="font-display font-bold text-base mb-5">Email Notifications</h3>
          <form onSubmit={hsNot(d => notifMutation.mutate(d))} className="space-y-4">
            {[
              ['emailOnApply',        'New application received',    'Get notified when someone applies to your job'],
              ['emailOnStatusChange', 'Application status updates',  'Get notified when your application status changes'],
              ['emailOnMessage',      'New direct messages',         'Get notified when you receive a message'],
            ].map(([name, label, desc]) => (
              <div key={name} className="flex items-start justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium text-ink">{label}</p>
                  <p className="text-xs text-muted mt-0.5">{desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                  <input type="checkbox" {...regNot(name)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-white/10 peer-checked:bg-accent rounded-full transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                </label>
              </div>
            ))}
            <button type="submit" disabled={notifMutation.isLoading} className="btn-primary px-5 py-2.5 text-sm mt-2">
              {notifMutation.isLoading ? 'Saving…' : 'Save Preferences'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
