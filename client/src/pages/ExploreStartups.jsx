import { useEffect, useState } from 'react';
import StartupCard from '../components/StartupCard.jsx';
import { getStartups } from '../services/startupService.js';

const ExploreStartups = () => {
  const [state, setState] = useState({
    loading: true,
    error: '',
    startups: [],
  });

  useEffect(() => {
    let isMounted = true;

    const loadStartups = async () => {
      try {
        const data = await getStartups();

        if (!isMounted) {
          return;
        }

        setState({
          loading: false,
          error: '',
          startups: data.data,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState({
          loading: false,
          error: error.response?.data?.message || 'Unable to load startups.',
          startups: [],
        });
      }
    };

    loadStartups();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="container page-stack">
      <section className="page-heading">
        <span className="eyebrow">Explore</span>
        <h1>Browse startups looking for collaborators.</h1>
        <p>
          This page is already connected to the sample Express API so you can replace the mock
          controller with real MongoDB queries later.
        </p>
      </section>

      {state.loading ? <p>Loading startup opportunities...</p> : null}
      {state.error ? <p className="error-text">{state.error}</p> : null}

      <div className="card-grid">
        {state.startups.map((startup) => (
          <StartupCard key={startup.id} startup={startup} />
        ))}
      </div>
    </div>
  );
};

export default ExploreStartups;

