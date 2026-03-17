import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
    ArrowLeft, MessageSquare, ExternalLink,
    Github, Linkedin, Globe, CheckCircle,
    Clock, XCircle, Star, Briefcase, GraduationCap
} from 'lucide-react';
import api from '../../api/axios.js';
import { StatusBadge } from '../../components/ui/index.jsx';
import toast from 'react-hot-toast';

const STATUS_FLOW = [
    { id: 'applied', label: 'Applied', icon: Clock, color: 'text-muted2', bg: 'bg-white/5' },
    { id: 'reviewing', label: 'Reviewing', icon: Star, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'interview', label: 'Interview', icon: Briefcase, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { id: 'offer', label: 'Offer', icon: CheckCircle, color: 'text-accent', bg: 'bg-accent/10' },
    { id: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
];

const STATUS_MESSAGES = {
    reviewing: "Hi {name}, I've reviewed your application for {job} and I'm interested! Let me know if you have any questions.",
    interview: "Hi {name}, I'd love to schedule an interview for the {job} position. Are you available this week?",
    offer: "Hi {name}, congratulations! We'd like to offer you the {job} position. Let's discuss the details.",
    rejected: "Hi {name}, thank you for applying for {job}. After careful consideration, we've decided to move forward with other candidates. Best of luck!",
};

export default function ApplicationDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [notes, setNotes] = useState('');
    const [msgText, setMsgText] = useState('');
    const [showMsgBox, setShowMsgBox] = useState(false);

    const { data, isLoading, isError } = useQuery(
        ['application', id],
        () => api.get(`/jobs/applications/${id}`).then(r => r.data),
        { staleTime: 60000 }
    );

    const application = data?.application;
    const candidate = application?.candidate;
    const job = application?.job;
    const currentStatus = application?.status;

    const statusMutation = useMutation(
        (status) => api.patch(`/jobs/applications/${id}/status`, { status }),
        {
            onSuccess: (_, status) => {
                toast.success(`Status updated to ${status}`);
                qc.invalidateQueries(['application', id]);
                // Auto-fill message box with template
                if (STATUS_MESSAGES[status] && application) {
                    const name = application.candidate?.name?.split(' ')[0] || 'there';
                    const jobTitle = application.job?.title || 'the position';
                    setMsgText(STATUS_MESSAGES[status]
                        .replace('{name}', name)
                        .replace('{job}', jobTitle));
                    setShowMsgBox(true);
                }
            },
            onError: () => toast.error('Failed to update status'),
        }
    );

    const notesMutation = useMutation(
        () => api.patch(`/jobs/applications/${id}/notes`, { notes }),
        { onSuccess: () => toast.success('Notes saved!') }
    );

    const sendMessage = async () => {
        if (!msgText.trim()) return;
        try {
            const candidateId = application?.candidate?._id;
            // Navigate to messages page with pre-filled message
            navigate(`/messages/${candidateId}?msg=${encodeURIComponent(msgText)}`);
        } catch {
            toast.error('Failed to open messages');
        }
    };

    if (isLoading) return (
        <div className="page-container py-8 space-y-4 max-w-4xl">
            <div className="skeleton h-10 w-32 rounded-lg" />
            <div className="skeleton h-48 rounded-xl" />
            <div className="skeleton h-64 rounded-xl" />
        </div>
    );

    if (isError) return (
        <div className="page-container py-16 text-center">
            <p className="text-muted mb-4">Application not found.</p>
            <Link to="/recruiter/dashboard" className="btn-primary px-5 py-2.5 text-sm">
                ← Back to Dashboard
            </Link>
        </div>
    );

    if (!application) return (
        <div className="page-container py-16 text-center">
            <p className="text-muted">Loading application…</p>
        </div>
    );



    return (
        <div className="page-container py-8 max-w-4xl">

            {/* Back button */}
            <button onClick={() => navigate('/recruiter/dashboard')}
                className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors mb-6">
                <ArrowLeft size={15} /> Back to Dashboard
            </button>

            {/* Header */}
            <div className="card mb-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center
              justify-center font-display font-black text-2xl text-accent flex-shrink-0">
                            {candidate?.name?.[0]}
                        </div>
                        <div>
                            <h1 className="font-display font-black text-xl">{candidate?.name}</h1>
                            <p className="text-sm text-muted">{candidate?.email}</p>
                            <p className="text-xs text-muted mt-0.5">
                                Applied for <span className="text-ink font-medium">{job?.title}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={currentStatus} />
                        <button
                            onClick={() => setShowMsgBox(p => !p)}
                            className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
                            <MessageSquare size={14} /> Message Candidate
                        </button>
                    </div>
                </div>

                {/* Social links */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-white/[0.08]">
                    {candidate?.resumeUrl && (
                        <a href={candidate.resumeUrl} target="_blank" rel="noreferrer"
                            className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-2">
                            <ExternalLink size={12} /> View Resume
                        </a>
                    )}
                    {candidate?.linkedinUrl && (
                        <a href={candidate.linkedinUrl} target="_blank" rel="noreferrer"
                            className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-2">
                            <Linkedin size={12} /> LinkedIn
                        </a>
                    )}
                    {candidate?.githubUrl && (
                        <a href={candidate.githubUrl} target="_blank" rel="noreferrer"
                            className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-2">
                            <Github size={12} /> GitHub
                        </a>
                    )}
                    {candidate?.portfolioUrl && (
                        <a href={candidate.portfolioUrl} target="_blank" rel="noreferrer"
                            className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-2">
                            <Globe size={12} /> Portfolio
                        </a>
                    )}
                </div>
            </div>

            {/* Message box */}
            {showMsgBox && (
                <div className="card mb-5 border-accent/30 bg-accent/5 animate-fade-in-up">
                    <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                        <MessageSquare size={14} className="text-accent" />
                        Send Message to {candidate?.name?.split(' ')[0]}
                    </h3>
                    <textarea
                        value={msgText}
                        onChange={e => setMsgText(e.target.value)}
                        rows={4}
                        className="input resize-none text-sm mb-3"
                        placeholder="Type your message here…"
                    />
                    <div className="flex gap-2">
                        <button onClick={sendMessage} disabled={!msgText.trim()}
                            className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5">
                            <MessageSquare size={14} /> Open in Messages →
                        </button>
                        <button onClick={() => setShowMsgBox(false)}
                            className="btn-ghost text-sm px-4 py-2.5">
                            Cancel
                        </button>
                    </div>
                    <p className="text-xs text-muted mt-2">
                        This will open the messages page with your message pre-filled.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Left — Status + Notes */}
                <div className="space-y-5">

                    {/* Status updater */}
                    <div className="card">
                        <h3 className="font-display font-bold text-sm mb-4">Update Status</h3>
                        <div className="space-y-2">
                            {STATUS_FLOW.map(s => {
                                const Icon = s.icon;
                                const isActive = currentStatus === s.id;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => !isActive && statusMutation.mutate(s.id)}
                                        disabled={isActive || statusMutation.isLoading}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl
                      border transition-all text-left
                      ${isActive
                                                ? `${s.bg} border-current ${s.color} cursor-default`
                                                : 'border-white/10 text-muted2 hover:border-white/25 hover:text-ink'
                                            }`}
                                    >
                                        <Icon size={15} className={isActive ? s.color : 'text-muted'} />
                                        <span className={`text-sm font-medium ${isActive ? s.color : ''}`}>
                                            {s.label}
                                        </span>
                                        {isActive && (
                                            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider opacity-60">
                                                Current
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {statusMutation.isLoading && (
                            <p className="text-xs text-muted mt-2 text-center">Updating…</p>
                        )}
                    </div>

                    {/* Recruiter notes */}
                    <div className="card">
                        <h3 className="font-display font-bold text-sm mb-3">Private Notes</h3>
                        <textarea
                            value={notes || application.recruiterNotes || ''}
                            onChange={e => setNotes(e.target.value)}
                            rows={5}
                            className="input resize-none text-sm mb-3"
                            placeholder="Add private notes about this candidate…"
                        />
                        <button
                            onClick={() => notesMutation.mutate()}
                            disabled={notesMutation.isLoading}
                            className="btn-primary w-full py-2 text-sm">
                            {notesMutation.isLoading ? 'Saving…' : 'Save Notes'}
                        </button>
                    </div>
                </div>

                {/* Right — Candidate profile */}
                <div className="lg:col-span-2 space-y-5">

                    {/* About */}
                    {candidate?.bio && (
                        <div className="card">
                            <h3 className="font-display font-bold text-sm mb-3">About</h3>
                            <p className="text-sm text-muted2 leading-relaxed">{candidate.bio}</p>
                        </div>
                    )}

                    {/* Skills */}
                    {candidate?.skills?.length > 0 && (
                        <div className="card">
                            <h3 className="font-display font-bold text-sm mb-3">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {candidate.skills.map(s => (
                                    <span key={s} className="bg-accent/10 text-accent text-xs font-medium px-3 py-1.5 rounded-lg">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {candidate?.experience?.length > 0 && (
                        <div className="card">
                            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                                <Briefcase size={13} className="text-accent" /> Experience
                            </h3>
                            <div className="space-y-4">
                                {candidate.experience.map((exp, i) => (
                                    <div key={i} className="relative pl-4 border-l-2 border-white/10">
                                        <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-accent" />
                                        <p className="font-medium text-sm text-ink">{exp.title}</p>
                                        <p className="text-xs text-muted">{exp.company}</p>
                                        <p className="text-xs text-muted mt-0.5">
                                            {exp.startDate?.slice(0, 7)} →{' '}
                                            {exp.current ? 'Present' : exp.endDate?.slice(0, 7)}
                                        </p>
                                        {exp.description && (
                                            <p className="text-xs text-muted2 mt-1.5 leading-relaxed">
                                                {exp.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {candidate?.education?.length > 0 && (
                        <div className="card">
                            <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                                <GraduationCap size={13} className="text-accent" /> Education
                            </h3>
                            {candidate.education.map((edu, i) => (
                                <div key={i} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-ink">{edu.degree}</p>
                                        <p className="text-xs text-muted">{edu.school}</p>
                                    </div>
                                    {edu.year && <span className="text-xs text-muted">{edu.year}</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Preferences */}
                    <div className="card">
                        <h3 className="font-display font-bold text-sm mb-3">What they're looking for</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {candidate?.desiredSalaryMin && (
                                <div className="bg-surface2 rounded-lg p-3">
                                    <p className="text-xs text-muted mb-0.5">Expected Salary</p>
                                    <p className="font-medium text-ink">
                                        ₹{candidate.desiredSalaryMin}–{candidate.desiredSalaryMax} LPA
                                    </p>
                                </div>
                            )}
                            {candidate?.workMode && (
                                <div className="bg-surface2 rounded-lg p-3">
                                    <p className="text-xs text-muted mb-0.5">Work Mode</p>
                                    <p className="font-medium text-ink capitalize">{candidate.workMode}</p>
                                </div>
                            )}
                            {candidate?.experienceYears && (
                                <div className="bg-surface2 rounded-lg p-3">
                                    <p className="text-xs text-muted mb-0.5">Experience</p>
                                    <p className="font-medium text-ink">{candidate.experienceYears} years</p>
                                </div>
                            )}
                            {candidate?.location && (
                                <div className="bg-surface2 rounded-lg p-3">
                                    <p className="text-xs text-muted mb-0.5">Location</p>
                                    <p className="font-medium text-ink">{candidate.location}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}