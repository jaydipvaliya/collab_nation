import { useAuth } from '../context/AuthContext.jsx';

const Profile = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="container page-stack">
      <section className="page-heading">
        <span className="eyebrow">Profile</span>
        <h1>Your collaborator profile</h1>
        <p>
          This starter view is ready for future Mongo-backed profile data, skills, and startup
          history.
        </p>
      </section>

      <article className="info-card">
        <h2>{isAuthenticated ? user.name : 'Guest User'}</h2>
        <p>{isAuthenticated ? user.email : 'Sign in to personalize your profile.'}</p>
        <div className="tag-list">
          <span className="tag">Founder friendly</span>
          <span className="tag">Remote collaboration</span>
          <span className="tag">MERN starter</span>
        </div>
      </article>
    </div>
  );
};

export default Profile;

