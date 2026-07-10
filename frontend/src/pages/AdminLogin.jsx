import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { LogIn, Key, Mail, Info, Shield } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter all fields');
      return;
    }
    setSubmitting(true);
    const result = await adminLogin(email, password);
    setSubmitting(false);

    if (result.success) {
      toast.success('Successfully logged in to Admin Panel!');
      navigate('/admin');
    } else {
      toast.error(result.message);
    }
  };

  const fillCredentials = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="login-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Shield size={32} className="logo-icon" />
            <span>DarshanEase Admin</span>
          </div>
          <h2>Control Panel</h2>
          <p>Please enter administrative credentials to authenticate.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="admin@darshanease.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Key size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 auth-submit" disabled={submitting}>
            {submitting ? 'Authenticating...' : <><LogIn size={18} /> Admin Access</>}
          </button>
        </form>

        <div className="auth-footer">
          <p>Devotee or Organizer? <Link to="/login" className="back-link">Go to Devotee Portal</Link></p>
        </div>

        {/* Demo Credentials Box */}
        <div className="demo-credentials">
          <h4>
            <Info size={16} /> Quick Admin Login
          </h4>
          <p>Click below to auto-fill credentials for testing:</p>
          <div className="demo-buttons">
            <button 
              className="demo-btn admin"
              onClick={() => fillCredentials('admin@darshanease.com', 'admin123')}
            >
              Admin credentials
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 80px 20px;
          min-height: calc(100vh - 150px);
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        }

        .auth-card {
          background: #1e293b;
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: var(--radius-lg);
          padding: 40px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .auth-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 1.6rem;
          font-weight: 700;
          color: #818cf8;
          margin-bottom: 16px;
        }

        .auth-logo .logo-icon {
          color: #ef4444;
          filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.4));
        }

        .auth-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 8px;
        }

        .auth-header p {
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 20px;
          text-align: left;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #cbd5e1;
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .input-with-icon .form-control {
          width: 100%;
          padding: 12px 16px 12px 44px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: var(--radius-md);
          color: #f8fafc;
          font-size: 0.95rem;
          transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }

        .input-with-icon .form-control:focus {
          border-color: #6366f1;
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }

        .auth-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          font-size: 1rem;
          margin-top: 10px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border: none;
          color: white;
          font-weight: 600;
          cursor: pointer;
          border-radius: var(--radius-md);
          transition: transform 0.1s ease, filter 0.2s ease;
        }

        .auth-submit:hover:not(:disabled) {
          filter: brightness(1.1);
        }

        .auth-submit:active:not(:disabled) {
          transform: scale(0.98);
        }

        .auth-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .w-100 {
          width: 100%;
        }

        .auth-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 0.9rem;
          color: #94a3b8;
        }

        .auth-footer .back-link {
          color: #818cf8;
          font-weight: 600;
          text-decoration: none;
        }

        .auth-footer .back-link:hover {
          text-decoration: underline;
        }

        /* Demo Box styling */
        .demo-credentials {
          margin-top: 30px;
          padding: 16px;
          background-color: #0f172a;
          border-radius: var(--radius-md);
          border: 1.5px dashed #334155;
        }

        .demo-credentials h4 {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.95rem;
          color: #cbd5e1;
          margin-bottom: 8px;
        }

        .demo-credentials p {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 12px;
        }

        .demo-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .demo-btn {
          flex: 1;
          min-width: 120px;
          padding: 8px 12px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid #334155;
          border-radius: 4px;
          background: #1e293b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .demo-btn.admin {
          color: #f87171;
          border-color: #7f1d1d;
        }
        .demo-btn.admin:hover {
          background-color: #450a0a;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
