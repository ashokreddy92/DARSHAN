import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, User as UserIcon, Calendar, Gift, Settings, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="main-navbar">
      <div className="container nav-flex">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 9h20L12 2zM4 9v11h16V9M12 9v11M8 12h2v4H8zM14 12h2v4h-2z" />
          </svg>
          <span className="logo-text">DarshanEase</span>
        </Link>

        {/* Links */}
        <div className="nav-links">
          <Link to="/" className={`nav-link-item ${isActive('/')}`}>Home</Link>
          <Link to="/temples" className={`nav-link-item ${isActive('/temples')}`}>Temples</Link>
          {user && <Link to="/my-bookings" className={`nav-link-item ${isActive('/my-bookings')}`}>My Bookings</Link>}
          <Link to="/donate" className={`nav-link-item ${isActive('/donate')}`}>Donate</Link>
          <Link to="/about" className={`nav-link-item ${isActive('/about')}`}>About Us</Link>
          <Link to="/contact" className={`nav-link-item ${isActive('/contact')}`}>Contact Us</Link>
        </div>

        {/* Right Menu */}
        <div className="nav-right">
          <button className="icon-btn notification-btn">
            <Bell size={20} />
            <span className="dot"></span>
          </button>

          {user ? (
            <div className="user-profile-menu">
              <div className="profile-trigger">
                <div className="avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
              </div>
              
              <div className="dropdown-menu">
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="dropdown-item">
                    <Shield size={16} /> Admin Panel
                  </Link>
                )}
                {user.role === 'ORGANIZER' && (
                  <Link to="/organizer" className="dropdown-item">
                    <Settings size={16} /> Organizer Panel
                  </Link>
                )}
                <Link to="/my-bookings" className="dropdown-item">
                  <Calendar size={16} /> My Bookings
                </Link>
                <button onClick={logout} className="dropdown-item logout-btn">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary nav-btn">Login</Link>
              <Link to="/register" className="btn btn-primary nav-btn">Register</Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .main-navbar {
          background-color: var(--surface);
          border-bottom: 1.5px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: var(--shadow-sm);
          height: 72px;
          display: flex;
          align-items: center;
        }

        .nav-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          color: var(--primary);
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: -0.5px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-link-item {
          font-weight: 500;
          color: var(--text-muted);
          position: relative;
          padding: 24px 0;
          font-size: 0.95rem;
          transition: var(--transition);
        }

        .nav-link-item:hover, .nav-link-item.active {
          color: var(--primary);
        }

        .nav-link-item::after {
          content: '';
          position: absolute;
          bottom: -1.5px;
          left: 0;
          width: 0;
          height: 3px;
          background-color: var(--primary);
          transition: var(--transition);
          border-radius: 4px;
        }

        .nav-link-item.active::after, .nav-link-item:hover::after {
          width: 100%;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .icon-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          position: relative;
          padding: 8px;
          border-radius: 50%;
          transition: var(--transition);
        }

        .icon-btn:hover {
          background-color: rgba(0, 0, 0, 0.05);
          color: var(--text-main);
        }

        .notification-btn .dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          background-color: var(--primary);
          border-radius: 50%;
          border: 1.5px solid white;
        }

        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-btn {
          padding: 8px 18px;
          font-size: 0.9rem;
        }

        .user-profile-menu {
          position: relative;
          cursor: pointer;
        }

        .profile-trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          transition: var(--transition);
        }

        .profile-trigger:hover {
          background-color: rgba(217, 119, 6, 0.05);
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          border: 1.5px solid var(--primary);
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .user-role {
          font-size: 0.7rem;
          color: var(--primary);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          width: 200px;
          display: none;
          flex-direction: column;
          overflow: hidden;
          animation: slideDown 0.2s ease-out;
        }

        .user-profile-menu:hover .dropdown-menu {
          display: flex;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          font-size: 0.9rem;
          color: var(--text-muted);
          transition: var(--transition);
          background: none;
          border: none;
          text-align: left;
          width: 100%;
          cursor: pointer;
        }

        .dropdown-item:hover {
          background-color: #fafafa;
          color: var(--primary);
        }

        .logout-btn:hover {
          color: var(--danger);
          background-color: #fef2f2;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 900px) {
          .nav-links {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
