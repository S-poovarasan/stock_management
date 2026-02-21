import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUser, logout } from '../api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <div className="nav-brand-icon">SM</div>
          <h1>Stock Management</h1>
        </div>
        <div className="nav-links">
          <Link to="/stock" className={location.pathname === '/stock' ? 'active' : ''}>
            📦 Stock
          </Link>
          <Link to="/billing" className={location.pathname === '/billing' ? 'active' : ''}>
            🧾 Billing
          </Link>
          <button onClick={handleLogout} className="nav-logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
