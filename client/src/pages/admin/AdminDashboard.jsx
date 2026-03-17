import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, Building2, BarChart2, CheckCircle, XCircle, Ban, ShieldCheck } from 'lucide-react';
import api from '../../api/axios.js';
import { StatCard } from '../../components/ui/index.jsx';
import toast from 'react-hot-toast';

const TABS = ['Overview', 'Users', 'Jobs', 'Companies'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  const qc = useQueryClient();

  const { data: stats } = useQuery('admin-stats', () => api.get('/admin/stats').then(r => r.data));
  const { data: usersData } = useQuery(['admin-users'], () => api.get('/admin/users').then(r => r.data), { enabled: tab === 'Users' });
  const { data: jobsData }  = useQuery(['admin-jobs'],  () => api.get('/admin/jobs').then(r => r.data),  { enabled: tab === 'Jobs' });
  const { data: pendingCo } = useQuery('pending-companies', () => api.get('/admin/companies/pending').then(r => r.data), { enabled: tab === 'Companies' });

  const banUser = useMutation(({ id, isBanned }) => api.patch(`/admin/users/${id}`, { isBanned }), {
    onSuccess: () => { toast.success('User updated'); qc.invalidateQueries('admin-users'); }
  });
  const updateJobStatus = useMutation(({ id, status }) => api.patch(`/admin/jobs/${id}/status`, { status }), {
    onSuccess: () => { toast.success('Job updated'); qc.invalidateQueries('admin-jobs'); }
  });
  const approveCompany = useMutation((id) => api.patch(`/admin/companies/${id}/approve`), {
    onSuccess: () => { toast.success('Company approved!'); qc.invalidateQueries('pending-companies'); qc.invalidateQueries('admin-stats'); }
  });
  const rejectCompany = useMutation((id) => api.patch(`/admin/companies/${id}/reject`, { reason: 'Does not meet guidelines' }), {
    onSuccess: () => { toast.success('Company rejected'); qc.invalidateQueries('pending-companies'); }
  });

  return (
    <div className="page-container py-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-display font-black text-2xl">Admin Panel</h1>
          <p className="text-sm text-muted mt-1">Manage Collab Nation platform</p>
        </div>
        <span className="badge-orange px-3 py-1 text-xs">Admin Access</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-7 border-b border-white/[0.08]">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px
              ${tab === t ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'}`}>
            {t}
            {t === 'Companies' && stats?.pendingCompanies > 0 && (
              <span className="ml-2 bg-accent/20 text-accent text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pendingCompanies}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Users"      value={stats?.totalUsers || 0}        color="text-accent" />
            <StatCard label="New Today"        value={stats?.newUsersToday || 0}      color="text-blue-400" />
            <StatCard label="Active Jobs"      value={stats?.activeJobs || 0}         color="text-yellow-400" />
            <StatCard label="Pending Approval" value={stats?.pendingCompanies || 0}   color="text-orange-400" />
          </div>
          <div className="card">
            <h3 className="font-display font-bold text-sm mb-5">Signups — Last 30 Days</h3>
            {stats?.signupData?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.signupData}>
                  <XAxis dataKey="_id" tick={{ fill: '#6B6D75', fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fill: '#6B6D75', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#18191D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F0EEE9', fontSize: 12 }} />
                  <Line type="monotone" dataKey="count" stroke="#00E5A0" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted text-center py-8">No signup data yet</p>}
          </div>
        </div>
      )}

      {/* ── Users ── */}
      {tab === 'Users' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-white/5">
                <th className="pb-3 pr-4 font-medium">User</th>
                <th className="pb-3 pr-4 font-medium">Role</th>
                <th className="pb-3 pr-4 font-medium">Verified</th>
                <th className="pb-3 pr-4 font-medium">Joined</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(usersData?.users || []).map(u => (
                <tr key={u._id} className="border-b border-white/5 hover:bg-surface2 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold flex-shrink-0">{u.name?.[0]}</div>
                      <div>
                        <p className="font-medium text-xs">{u.name}</p>
                        <p className="text-muted text-[10px]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4"><span className="badge-gray capitalize">{u.role || 'unset'}</span></td>
                  <td className="py-3 pr-4">{u.isVerified ? <CheckCircle size={14} className="text-accent" /> : <XCircle size={14} className="text-red-400" />}</td>
                  <td className="py-3 pr-4 text-xs text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <button onClick={() => banUser.mutate({ id: u._id, isBanned: !u.isBanned })}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${u.isBanned ? 'text-accent bg-accent/10 hover:bg-accent/20' : 'text-red-400 bg-red-500/10 hover:bg-red-500/20'}`}>
                      {u.isBanned ? <><ShieldCheck size={11} /> Unban</> : <><Ban size={11} /> Ban</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Jobs ── */}
      {tab === 'Jobs' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-white/5">
                <th className="pb-3 pr-4 font-medium">Job</th>
                <th className="pb-3 pr-4 font-medium">Company</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Applicants</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(jobsData?.jobs || []).map(j => (
                <tr key={j._id} className="border-b border-white/5 hover:bg-surface2 transition-colors">
                  <td className="py-3 pr-4 text-xs font-medium max-w-[180px] truncate">{j.title}</td>
                  <td className="py-3 pr-4 text-xs text-muted">{j.company?.name}</td>
                  <td className="py-3 pr-4">
                    <span className={j.status === 'active' ? 'badge-green' : 'badge-gray'}>{j.status}</span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-muted">{j.applicantCount}</td>
                  <td className="py-3">
                    <button onClick={() => updateJobStatus.mutate({ id: j._id, status: j.status === 'active' ? 'closed' : 'active' })}
                      className="text-xs text-muted hover:text-ink border border-white/10 hover:border-white/20 px-2 py-1 rounded-md transition-colors">
                      {j.status === 'active' ? 'Close' : 'Reopen'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Companies ── */}
      {tab === 'Companies' && (
        <div>
          <h3 className="font-display font-bold text-base mb-4">Pending Approval ({pendingCo?.companies?.length || 0})</h3>
          {pendingCo?.companies?.length === 0 ? (
            <div className="card text-center py-10 text-muted text-sm">All companies are approved ✓</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(pendingCo?.companies || []).map(co => (
                <div key={co._id} className="card">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold flex-shrink-0">
                      {co.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm">{co.name}</p>
                      <p className="text-xs text-muted">{co.createdBy?.email}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted line-clamp-2 mb-4">{co.description || 'No description provided.'}</p>
                  <div className="flex gap-2">
                    <button onClick={() => approveCompany.mutate(co._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 btn-primary text-xs py-2">
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button onClick={() => rejectCompany.mutate(co._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 btn-danger text-xs py-2">
                      <XCircle size={12} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
