import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container narrow page-stack">
      <section className="page-heading">
        <span className="eyebrow">404</span>
        <h1>That page is not part of the current build.</h1>
        <p>Use the navigation above or head back to the home page.</p>
      </section>

      <Link className="button" to="/">
        Return home
      </Link>
    </div>
  );
};

export default NotFound;

