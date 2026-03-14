import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import StartupCard from '../components/StartupCard.jsx';
import { getHealthStatus } from '../services/healthService.js';
import { getStartups } from '../services/startupService.js';

const Home = () => {
  const [status, setStatus] = useState({
    loading: true,
    message: 'Checking API status...',
    timestamp: null,
    error: '',
  });
  const [featuredStartups, setFeaturedStartups] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadPageData = async () => {
      try {
        const [healthData, startupData] = await Promise.all([getHealthStatus(), getStartups()]);

        if (!isMounted) {
          return;
        }

        setStatus({
          loading: false,
          message: healthData.message,
          timestamp: healthData.timestamp,
          error: '',
        });
        setFeaturedStartups(startupData.data.slice(0, 3));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setStatus({
          loading: false,
          message: '',
          timestamp: null,
          error: error.response?.data?.message || 'Unable to reach the backend API.',
        });
      }
    };

    loadPageData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="container page-stack">
      <section className="hero">
        <div>
          <span className="eyebrow">Where startup teams take shape</span>
          <h1>CollabNation helps founders and builders find momentum together.</h1>
          <p className="hero-copy">
            Launch the first version of your collaboration marketplace with a clean MERN
            foundation, starter pages, and API wiring ready for real features.
          </p>
          <div className="hero-actions">
            <Link className="button" to="/startups">
              Explore startups
            </Link>
            <Link className="button button--ghost" to="/register">
              Create account
            </Link>
          </div>
        </div>

        <aside className="status-panel">
          <p className="status-panel__label">Backend connection</p>
          <strong>{status.loading ? 'Loading...' : status.error ? 'Offline' : 'Online'}</strong>
          <p>{status.error || status.message}</p>
          {status.timestamp ? <small>Last checked: {status.timestamp}</small> : null}
        </aside>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <h2>Founders</h2>
          <p>Share your startup idea, define missing roles, and start building your team.</p>
        </article>
        <article className="info-card">
          <h2>Builders</h2>
          <p>Discover startup opportunities aligned with your skills and preferred stage.</p>
        </article>
        <article className="info-card">
          <h2>Operators</h2>
          <p>Keep applications, messaging, and team communication in one shared platform.</p>
        </article>
      </section>

      <section className="section-stack">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Featured opportunities</span>
            <h2>Sample startups from the API</h2>
          </div>
          <Link className="inline-link" to="/startups">
            See all startups
          </Link>
        </div>

        <div className="card-grid">
          {featuredStartups.map((startup) => (
            <StartupCard key={startup.id} startup={startup} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

