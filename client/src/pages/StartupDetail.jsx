import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getStartupById } from '../services/startupService.js';

const StartupDetail = () => {
  const { startupId } = useParams();
  const [state, setState] = useState({
    loading: true,
    error: '',
    startup: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadStartup = async () => {
      try {
        const data = await getStartupById(startupId);

        if (!isMounted) {
          return;
        }

        setState({
          loading: false,
          error: '',
          startup: data.data,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState({
          loading: false,
          error: error.response?.data?.message || 'Unable to load the startup details.',
          startup: null,
        });
      }
    };

    loadStartup();

    return () => {
      isMounted = false;
    };
  }, [startupId]);

  if (state.loading) {
    return (
      <div className="container page-stack">
        <p>Loading startup details...</p>
      </div>
    );
  }

  if (state.error || !state.startup) {
    return (
      <div className="container page-stack">
        <p className="error-text">{state.error || 'Startup not found.'}</p>
        <Link className="inline-link" to="/startups">
          Back to explore
        </Link>
      </div>
    );
  }

  return (
    <div className="container page-stack">
      <section className="detail-hero">
        <div>
          <span className="eyebrow">{state.startup.category}</span>
          <h1>{state.startup.title}</h1>
          <p className="hero-copy">{state.startup.tagline}</p>
        </div>
        <div className="detail-sidecard">
          <span className="pill">{state.startup.stage}</span>
          <strong>{state.startup.location}</strong>
          <p>Accepting collaborators for the roles listed below.</p>
        </div>
      </section>

      <section className="detail-grid">
        <article className="info-card">
          <h2>Overview</h2>
          <p>{state.startup.description}</p>
        </article>
        <article className="info-card">
          <h2>Needed roles</h2>
          <div className="tag-list">
            {state.startup.neededRoles.map((role) => (
              <span key={role} className="tag">
                {role}
              </span>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

export default StartupDetail;

