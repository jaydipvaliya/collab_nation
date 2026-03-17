import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Eye, Users, TrendingUp, X, ExternalLink } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../api/axios.js';
import { CompanyLogo, StatusBadge, EmptyState } from '../../components/ui/index.jsx';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'applied',   label: 'Applied',   color: 'text-muted2' },
  { id: 'reviewing', label: 'Reviewing', color: 'text-blue-400' },
  { id: 'interview', label: 'Interview', color: 'text-yellow-400' },
  { id: 'offer',     label: 'Offer',     color: 'text-accent' },
  { id: 'rejected',  label: 'Rejected',  color: 'text-red-400' },
];

const CandidateDrawer = ({ application, onClose }) => {
  const [notes, setNotes] = useState(application?.recruiterNotes || '');
  const qc = useQueryClient();

  const saveNotes = async () => {
    try {
      await api.patch(`/jobs/applications/${application._id}/notes`, { notes });
      toast.success('Notes saved');
      qc.invalidateQueries('recruiter-applicants');
    } catch { toast.error('Failed to save notes'); }
  };

  if (!application) return null;
  const c = application.candidate;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-md bg-surface border-l border-white/10 h-full overflow-y-auto animate-fade-in"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="font-display font-bold text-base">Candidate Profile</h3>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-5">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center font-display font-black text-xl text-accent">
              {c?.name?.[0]}
            </div>
            <div>
              <h4 className="font-display font-bold text-base">{c?.name}</h4>
              <p className="text-xs text-muted">{c?.email}</p>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Status:</span>
            <StatusBadge status={application.status} />
          </div>

          {/* Skills */}
          {c?.skills?.length > 0 && (
            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {c.skills.map(s => <span key={s} className="badge-gray">{s}</span>)}
              </div>
            </div>
          )}

          {/* Experience */}
          {c?.experience?.length > 0 && (
            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-2">Experience</p>
              {c.experience.slice(0, 2).map((exp, i) => (
                <div key={i} className="mb-2">
                  <p className="text-sm font-medium text-ink">{exp.title} @ {exp.company}</p>
                  <p className="text-xs text-muted">{exp.current ? 'Current' : exp.endDate?.slice(0, 7)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Links */}
          <div className="flex gap-2 flex-wrap">
            {c?.resumeUrl && (
              <a href={c.resumeUrl} target="_blank" rel="noreferrer"
                className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-2">
                <ExternalLink size={12} /> View Resume
              </a>
            )}
            {c?.linkedinUrl && (
              <a href={c.linkedinUrl} target="_blank" rel="noreferrer"
                className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-2">
                LinkedIn
              </a>
            )}
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-2">Recruiter Notes</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={saveNotes}
              rows={4} placeholder="Add private notes about this candidate…"
              className="input text-sm resize-none" />
            <p className="text-[10px] text-muted mt-1">Auto-saves on blur</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [selectedApp, setSelectedApp] = useState(null);
  const [kanban, setKanban] = useState({});

  const { data: jobsData, isLoading: jobsLoading } = useQuery('my-jobs',
    () => api.get('/jobs/my-jobs').then(r => r.data), { staleTime: 60000 });

  const [activeJobId, setActiveJobId] = useState(null);

  const { data: appsData, isLoading: appsLoading } = useQuery(
    ['recruiter-applicants', activeJobId],
    () => api.get(`/jobs/${activeJobId}/applicants`).then(r => r.data),
    { enabled: !!activeJobId }
  );

  useEffect(() => {
    if (jobsData?.jobs?.length && !activeJobId) setActiveJobId(jobsData.jobs[0]._id);
  }, [jobsData]);

  useEffect(() => {
    if (!appsData?.applications) return;
    const grouped = {};
    COLUMNS.forEach(c => { grouped[c.id] = []; });
    appsData.applications.forEach(a => { (grouped[a.status] ||= []).push(a); });
    setKanban(grouped);
  }, [appsData]);

  const statusMutation = useMutation(
    ({ id, status }) => api.patch(`/jobs/applications/${id}/status`, { status }),
    { onSuccess: () => qc.invalidateQueries(['recruiter-applicants', activeJobId]) }
  );

  const onDragEnd = ({ source, destination, draggableId }) => {
    if (!destination || source.droppableId === destination.droppableId) return;
    const newStatus = destination.droppableId;

    // Optimistic update
    setKanban(prev => {
      const next = { ...prev };
      const item = next[source.droppableId].find(a => a._id === draggableId);
      next[source.droppableId] = next[source.droppableId].filter(a => a._id !== draggableId);
      next[newStatus] = [...(next[newStatus] || []), { ...item, status: newStatus }];
      return next;
    });

    statusMutation.mutate({ id: draggableId, status: newStatus });
  };

  const jobs = jobsData?.jobs || [];
  const activeJob = jobs.find(j => j._id === activeJobId);

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-display font-black text-2xl">Recruiter Dashboard</h1>
          <p className="text-sm text-muted mt-1">Manage your jobs and applicant pipeline</p>
        </div>
        <button onClick={() => navigate('/recruiter/post-job')} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Post a Job
        </button>
      </div>

      {/* Jobs overview */}
      {jobsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card mb-6">
          <EmptyState icon={Plus} title="No jobs posted yet"
            description="Post your first job to start receiving applications."
            action={<button onClick={() => navigate('/recruiter/post-job')} className="btn-primary px-4 py-2 text-sm">Post a Job</button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {jobs.slice(0, 6).map(job => (
            <button key={job._id} onClick={() => setActiveJobId(job._id)}
              className={`card text-left transition-all hover:-translate-y-0.5 ${activeJobId === job._id ? 'border-accent/50 bg-accent/5' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-display font-bold text-sm line-clamp-1">{job.title}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${job.status === 'active' ? 'bg-accent/10 text-accent' : 'bg-white/5 text-muted'}`}>{job.status}</span>
              </div>
              <div className="flex gap-3 text-xs text-muted">
                <span className="flex items-center gap-1"><Eye size={10} />{job.views}</span>
                <span className="flex items-center gap-1"><Users size={10} />{job.applicantCount}</span>
                <span className="flex items-center gap-1"><TrendingUp size={10} />
                  {job.views ? Math.round((job.applicantCount / job.views) * 100) : 0}%
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Kanban ATS */}
      {activeJob && (
        <div>
          <h2 className="font-display font-bold text-base mb-4">
            Applicants for <span className="text-accent">{activeJob.title}</span>
          </h2>
          {appsLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-4">
              {COLUMNS.map(c => <div key={c.id} className="skeleton w-56 h-64 rounded-xl flex-shrink-0" />)}
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-3 overflow-x-auto pb-4">
                {COLUMNS.map(col => (
                  <Droppable key={col.id} droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}
                        className={`flex-shrink-0 w-56 rounded-xl p-3 transition-colors ${snapshot.isDraggingOver ? 'bg-accent/5 border border-accent/20' : 'bg-surface border border-white/[0.08]'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>{col.label}</span>
                          <span className="text-xs text-muted bg-surface2 px-1.5 py-0.5 rounded-full">
                            {(kanban[col.id] || []).length}
                          </span>
                        </div>
                        <div className="space-y-2 min-h-[60px]">
                          {(kanban[col.id] || []).map((app, idx) => (
                            <Draggable key={app._id} draggableId={app._id} index={idx}>
                              {(prov, snap) => (
                                <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                                  onClick={() => navigate(`/recruiter/applications/${app._id}`)}
                                  className={`bg-surface2 rounded-lg p-3 cursor-pointer hover:border-white/20 border transition-all
                                    ${snap.isDragging ? 'rotate-1 shadow-xl border-accent/30' : 'border-white/5'}`}>
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs flex-shrink-0">
                                      {app.candidate?.name?.[0]}
                                    </div>
                                    <p className="text-xs font-medium text-ink truncate">{app.candidate?.name}</p>
                                  </div>
                                  {app.candidate?.skills?.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {app.candidate.skills.slice(0, 2).map(s => <span key={s} className="text-[9px] bg-white/5 text-muted px-1.5 py-0.5 rounded">{s}</span>)}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          )}
        </div>
      )}
  
    </div>
  );
}