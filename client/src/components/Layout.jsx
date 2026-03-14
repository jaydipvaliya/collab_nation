import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

const Layout = () => {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

