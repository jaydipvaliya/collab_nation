import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();

  const getNavLinkClassName = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <NavLink className="brand" to="/">
          <span className="brand-mark">CN</span>
          <div>
            <strong>CollabNation</strong>
            <p>Build startups with the right people.</p>
          </div>
        </NavLink>

        <nav className="nav-links" aria-label="Primary">
          <NavLink className={getNavLinkClassName} to="/">
            Home
          </NavLink>
          <NavLink className={getNavLinkClassName} to="/startups">
            Explore Startups
          </NavLink>
          <NavLink className={getNavLinkClassName} to="/dashboard">
            Dashboard
          </NavLink>
          <NavLink className={getNavLinkClassName} to="/profile">
            Profile
          </NavLink>
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <span className="nav-user">{user?.name}</span>
              <button className="button button--ghost" onClick={logout} type="button">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink className="button button--ghost" to="/login">
                Login
              </NavLink>
              <NavLink className="button" to="/register">
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

