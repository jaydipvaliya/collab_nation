import { Link } from 'react-router-dom';

const StartupCard = ({ startup }) => {
  return (
    <article className="card">
      <div className="card__meta">
        <span className="pill">{startup.stage}</span>
        <span>{startup.category}</span>
      </div>
      <h3>{startup.title}</h3>
      <p className="card__tagline">{startup.tagline}</p>
      <p>{startup.description}</p>
      <div className="card__footer">
        <span>{startup.location}</span>
        <Link className="inline-link" to={`/startups/${startup.id}`}>
          View details
        </Link>
      </div>
    </article>
  );
};

export default StartupCard;

