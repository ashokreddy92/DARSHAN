import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, User as UserIcon, Calendar, Gift, Settings, Shield, Menu, X, ChevronRight, QrCode } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('modal-backdrop-lock');
    } else {
      document.body.classList.remove('modal-backdrop-lock');
    }
    return () => document.body.classList.remove('modal-backdrop-lock');
  }, [isMobileMenuOpen]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="main-navbar">
      <div className="container nav-flex">
        {/* Left: Mobile Toggle & Logo */}
        <div className="nav-left">
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          <Link to="/" className="nav-logo" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 9h20L12 2zM4 9v11h16V9M12 9v11M8 12h2v4H8zM14 12h2v4h-2z" />
            </svg>
            <span className="logo-text">DarshanEase</span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <div className="nav-links desktop-only">
          <Link to="/" className={`nav-link-item ${isActive('/')}`}>Home</Link>
          <Link to="/temples" className={`nav-link-item ${isActive('/temples')}`}>Temples</Link>
          {user && <Link to="/my-bookings" className={`nav-link-item ${isActive('/my-bookings')}`}>My Bookings</Link>}
          <Link to="/donate" className={`nav-link-item ${isActive('/donate')}`}>Donate</Link>
          <Link to="/about" className={`nav-link-item ${isActive('/about')}`}>About Us</Link>
          <Link to="/contact" className={`nav-link-item ${isActive('/contact')}`}>Contact Us</Link>
        </div>

        {/* Right Menu */}
        <div className="nav-right">
          <button className="icon-btn notification-btn" aria-label="Notifications">
            <Bell size={20} />
            <span className="dot"></span>
          </button>

          {user ? (
            <div className="user-profile-menu" ref={dropdownRef}>
              <div 
                className="profile-trigger"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                role="button"
                tabIndex={0}
              >
                <div className="avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
              </div>
              
              <div className={`dropdown-menu ${isProfileDropdownOpen ? 'show' : ''}`}>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="dropdown-item">
                    <Shield size={16} /> Admin Panel
                  </Link>
                )}
                {user.role === 'TEMPLE_STAFF' && (
                  <Link to="/staff-dashboard" className="dropdown-item">
                    <QrCode size={16} /> Staff Entry Portal
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

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="drawer-backdrop" 
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Menu */}
      <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <Link to="/" className="nav-logo" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 9h20L12 2zM4 9v11h16V9M12 9v11M8 12h2v4H8zM14 12h2v4h-2z" />
            </svg>
            <span className="logo-text">DarshanEase</span>
          </Link>
          <button 
            className="drawer-close-btn" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Card in Mobile Drawer */}
        {user && (
          <div className="drawer-user-card">
            <div className="avatar large">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="drawer-user-info">
              <span className="drawer-user-name">{user.name}</span>
              <span className="drawer-user-email">{user.email}</span>
              <span className="drawer-user-role-tag">{user.role}</span>
            </div>
          </div>
        )}

        <div className="drawer-nav-list">
          <Link to="/" className={`drawer-nav-item ${isActive('/')}`} onClick={() => setIsMobileMenuOpen(false)}>
            <span>Home</span>
            <ChevronRight size={18} className="arrow-icon" />
          </Link>
          <Link to="/temples" className={`drawer-nav-item ${isActive('/temples')}`} onClick={() => setIsMobileMenuOpen(false)}>
            <span>Temples</span>
            <ChevronRight size={18} className="arrow-icon" />
          </Link>
          {user && (
            <Link to="/my-bookings" className={`drawer-nav-item ${isActive('/my-bookings')}`} onClick={() => setIsMobileMenuOpen(false)}>
              <span>My Bookings</span>
              <ChevronRight size={18} className="arrow-icon" />
            </Link>
          )}
          <Link to="/donate" className={`drawer-nav-item ${isActive('/donate')}`} onClick={() => setIsMobileMenuOpen(false)}>
            <span>Donate</span>
            <ChevronRight size={18} className="arrow-icon" />
          </Link>
          <Link to="/about" className={`drawer-nav-item ${isActive('/about')}`} onClick={() => setIsMobileMenuOpen(false)}>
            <span>About Us</span>
            <ChevronRight size={18} className="arrow-icon" />
          </Link>
          <Link to="/contact" className={`drawer-nav-item ${isActive('/contact')}`} onClick={() => setIsMobileMenuOpen(false)}>
            <span>Contact Us</span>
            <ChevronRight size={18} className="arrow-icon" />
          </Link>

          {/* Role specific links for mobile */}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className={`drawer-nav-item special-link ${isActive('/admin')}`} onClick={() => setIsMobileMenuOpen(false)}>
              <span><Shield size={16} /> Admin Control Panel</span>
              <ChevronRight size={18} className="arrow-icon" />
            </Link>
          )}
          {user?.role === 'TEMPLE_STAFF' && (
            <Link to="/staff-dashboard" className={`drawer-nav-item special-link ${isActive('/staff-dashboard')}`} onClick={() => setIsMobileMenuOpen(false)}>
              <span><QrCode size={16} /> Staff Entry Portal</span>
              <ChevronRight size={18} className="arrow-icon" />
            </Link>
          )}
          {user?.role === 'ORGANIZER' && (
            <Link to="/organizer" className={`drawer-nav-item special-link ${isActive('/organizer')}`} onClick={() => setIsMobileMenuOpen(false)}>
              <span><Settings size={16} /> Organizer Panel</span>
              <ChevronRight size={18} className="arrow-icon" />
            </Link>
          )}
        </div>

        {/* Drawer Bottom Actions */}
        <div className="drawer-footer">
          {user ? (
            <button onClick={logout} className="btn btn-danger btn-block logout-drawer-btn">
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <div className="drawer-auth-grid">
              <Link to="/login" className="btn btn-secondary w-100" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary w-100" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
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
          width: 100%;
        }

        .nav-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 12px;
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
          flex-shrink: 0;
        }

        .logo-text {
          font-size: clamp(1.2rem, 2vw, 1.5rem);
          font-weight: 700;
          color: var(--primary);
          letter-spacing: -0.5px;
          white-space: nowrap;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .nav-link-item {
          font-weight: 500;
          color: var(--text-muted);
          position: relative;
          padding: 24px 0;
          font-size: 0.95rem;
          transition: var(--transition);
          white-space: nowrap;
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
          gap: 16px;
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
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          min-height: 40px;
        }

        .icon-btn:hover {
          background-color: rgba(0, 0, 0, 0.05);
          color: var(--text-main);
        }

        .notification-btn .dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background-color: var(--primary);
          border-radius: 50%;
          border: 1.5px solid white;
        }

        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav-btn {
          padding: 8px 16px;
          font-size: 0.9rem;
          min-height: 38px;
        }

        .user-profile-menu {
          position: relative;
          cursor: pointer;
        }

        .profile-trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          transition: var(--transition);
          user-select: none;
        }

        .profile-trigger:hover {
          background-color: rgba(217, 119, 6, 0.08);
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
          font-weight: 700;
          border: 1.5px solid var(--primary);
          flex-shrink: 0;
        }

        .avatar.large {
          width: 48px;
          height: 48px;
          font-size: 1.25rem;
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
          max-width: 120px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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
          top: calc(100% + 8px);
          right: 0;
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-xl);
          width: 220px;
          display: none;
          flex-direction: column;
          overflow: hidden;
          animation: slideDown 0.2s ease-out;
          z-index: 110;
        }

        .dropdown-menu.show {
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
          font-weight: 500;
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
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: var(--radius-sm);
          transition: var(--transition);
          align-items: center;
          justify-content: center;
          min-height: 44px;
          min-width: 44px;
        }

        .mobile-menu-toggle:hover {
          background-color: rgba(217, 119, 6, 0.08);
          color: var(--primary);
        }

        /* Mobile Drawer */
        .drawer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          z-index: 200;
          animation: fadeIn 0.25s ease-out;
        }

        .mobile-drawer {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: min(340px, 85vw);
          background: white;
          z-index: 210;
          box-shadow: var(--shadow-xl);
          display: flex;
          flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
        }

        .mobile-drawer.open {
          transform: translateX(0);
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .drawer-close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          min-height: 40px;
        }

        .drawer-user-card {
          padding: 18px 20px;
          background: #fdfaf7;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .drawer-user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .drawer-user-name {
          font-weight: 700;
          color: var(--secondary);
          font-size: 1rem;
        }

        .drawer-user-email {
          font-size: 0.8rem;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .drawer-user-role-tag {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--primary);
          background: var(--primary-light);
          padding: 2px 8px;
          border-radius: 20px;
          display: inline-block;
          margin-top: 4px;
          width: fit-content;
        }

        .drawer-nav-list {
          display: flex;
          flex-direction: column;
          padding: 12px 0;
          flex-grow: 1;
        }

        .drawer-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          font-weight: 500;
          color: var(--text-main);
          border-bottom: 1px solid #f8fafc;
          transition: var(--transition);
        }

        .drawer-nav-item:hover, .drawer-nav-item.active {
          background-color: #fdfaf7;
          color: var(--primary);
          font-weight: 600;
        }

        .drawer-nav-item .arrow-icon {
          color: var(--text-light);
        }

        .drawer-nav-item.special-link {
          color: var(--primary);
          background-color: #fffbeb;
          margin: 6px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid #fef3c7;
        }

        .drawer-nav-item.special-link span {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .drawer-footer {
          padding: 20px;
          border-top: 1px solid var(--border);
          background: #fafafa;
        }

        .drawer-auth-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .desktop-only {
            display: none !important;
          }

          .mobile-menu-toggle {
            display: flex;
          }

          .profile-info {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .nav-right {
            gap: 8px;
          }
          .auth-buttons {
            gap: 6px;
          }
          .nav-btn {
            padding: 6px 10px;
            font-size: 0.8rem;
          }
          .main-navbar {
            height: 64px;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
