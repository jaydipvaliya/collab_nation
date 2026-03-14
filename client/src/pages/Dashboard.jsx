import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="container page-stack">
      <section className="page-heading">
        <span className="eyebrow">Dashboard</span>
        <h1>{isAuthenticated ? `${user.name}'s workspace` : 'Team workspace overview'}</h1>
        <p>
          Use this page as the future home for founder metrics, pending applications, and team
          updates.
        </p>
      </section>

      <div className="info-grid">
        <article className="info-card">
          <h2>Applications</h2>
          <p>Placeholder for reviewing collaborator applications from the `Applications` collection.</p>
        </article>
        <article className="info-card">
          <h2>Messages</h2>
          <p>Placeholder for real-time chats backed by the `Messages` collection.</p>
        </article>
        <article className="info-card">
          <h2>Notifications</h2>
          <p>Placeholder for product and collaboration updates from the `Notifications` collection.</p>
        </article>
      </div>

      {!isAuthenticated ? (
        <Link className="button" to="/login">
          Sign in to continue
        </Link>
      ) : null}
    </div>
  );
};

export default Dashboard;

