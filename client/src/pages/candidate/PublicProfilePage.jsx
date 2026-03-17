import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { MapPin, Github, Linkedin, Globe, ExternalLink, Briefcase, GraduationCap, Code } from 'lucide-react';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function PublicProfilePage() {
  const { userId } = useParams();
  const { user: me } = useAuth();

  const { data, isLoading, isError } = useQuery(
    ['public-profile', userId],
    () => api.get(`/candidate/${userId}`).then(r => r.data),
    { staleTime: 5 * 60 * 1000 }
  );

  if (isLoading) return (
    <div className="page-container py-8 space-y-4 max-w-3xl">
      <div className="skeleton h-32 rounded-2xl" />
      <div className="skeleton h-48 rounded-xl" />
    </div>
  );

  if (isError) return (
    <div className="page-container py-16 text-center">
      <p className="text-muted">Profile not found or is private.</p>
    </div>
  );

  const { profile } = data;
  const user = profile.user;
  const isOwnProfile = me?._id === user?._id || me?._id === userId;

  return (
    <div className="page-container py-8 max-w-3xl">
      {/* Header card */}
      <div className="card mb-5">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center font-display font-black text-3xl text-accent flex-shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
              : user?.name?.[0]
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="font-display font-black text-xl">{user?.name}</h1>
                <p className="text-sm text-muted2 mt-0.5">{profile.headline}</p>
                {profile.location && (
                  <p className="text-xs text-muted flex items-center gap-1 mt-1">
                    <MapPin size={10} /> {profile.location}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {isOwnProfile && (
                  <Link to="/profile" className="btn-secondary text-xs px-3 py-2">Edit Profile</Link>
                )}
                {!isOwnProfile && me?.role === 'recruiter' && (
                  <Link to={`/messages/${userId}`} className="btn-primary text-xs px-3 py-2">Message →</Link>
                )}
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-3">
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"
                  className="text-muted hover:text-accent transition-colors flex items-center gap-1 text-xs">
                  <Linkedin size={13} /> LinkedIn
                </a>
              )}
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noreferrer"
                  className="text-muted hover:text-accent transition-colors flex items-center gap-1 text-xs">
                  <Github size={13} /> GitHub
                </a>
              )}
              {profile.portfolioUrl && (
                <a href={profile.portfolioUrl} target="_blank" rel="noreferrer"
                  className="text-muted hover:text-accent transition-colors flex items-center gap-1 text-xs">
                  <Globe size={13} /> Portfolio
                </a>
              )}
              {profile.resumeUrl && (
                <a href={profile.resumeUrl} target="_blank" rel="noreferrer"
                  className="text-muted hover:text-accent transition-colors flex items-center gap-1 text-xs">
                  <ExternalLink size={13} /> Resume
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-5 pt-5 border-t border-white/[0.08]">
            <p className="text-sm text-muted2 leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Skills */}
          {profile.skills?.length > 0 && (
            <div className="card">
              <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                <Code size={13} className="text-accent" /> Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map(s => (
                  <span key={s} className="bg-accent/10 text-accent text-xs font-medium px-2.5 py-1 rounded-lg">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          <div className="card space-y-2">
            <h3 className="font-display font-bold text-sm mb-3">Looking for</h3>
            {profile.desiredSalaryMin && profile.desiredSalaryMax && (
              <div className="flex justify-between text-xs">
                <span className="text-muted">Salary</span>
                <span className="text-ink font-medium">₹{profile.desiredSalaryMin}–{profile.desiredSalaryMax} LPA</span>
              </div>
            )}
            {profile.workMode && (
              <div className="flex justify-between text-xs">
                <span className="text-muted">Work mode</span>
                <span className="text-ink font-medium capitalize">{profile.workMode}</span>
              </div>
            )}
            {profile.experienceYears !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-muted">Experience</span>
                <span className="text-ink font-medium">{profile.experienceYears} years</span>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-2 space-y-5">
          {/* Experience */}
          {profile.experience?.length > 0 && (
            <div className="card">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <Briefcase size={13} className="text-accent" /> Experience
              </h3>
              <div className="space-y-5">
                {profile.experience.map((exp, i) => (
                  <div key={i} className="relative pl-4 border-l-2 border-white/10">
                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-accent" />
                    <p className="font-medium text-sm text-ink">{exp.title}</p>
                    <p className="text-xs text-muted">{exp.company}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {exp.startDate?.slice(0, 7)} → {exp.current ? 'Present' : exp.endDate?.slice(0, 7)}
                    </p>
                    {exp.description && <p className="text-xs text-muted2 mt-2 leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {profile.education?.length > 0 && (
            <div className="card">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <GraduationCap size={13} className="text-accent" /> Education
              </h3>
              <div className="space-y-3">
                {profile.education.map((edu, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-ink">{edu.degree}</p>
                      <p className="text-xs text-muted">{edu.school}</p>
                    </div>
                    {edu.year && <span className="text-xs text-muted">{edu.year}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {profile.projects?.length > 0 && (
            <div className="card">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <Code size={13} className="text-accent" /> Projects
              </h3>
              <div className="space-y-4">
                {profile.projects.map((proj, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm text-ink">{proj.name}</p>
                      {proj.url && (
                        <a href={proj.url} target="_blank" rel="noreferrer"
                          className="text-accent hover:underline text-xs flex items-center gap-1">
                          View <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                    {proj.description && <p className="text-xs text-muted2 mb-2">{proj.description}</p>}
                    {proj.techStack?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {proj.techStack.map(t => <span key={t} className="badge-gray">{t}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
