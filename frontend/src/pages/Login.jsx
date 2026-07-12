import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { LogIn, Key, Mail, Info } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter all fields');
      return;
    }
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      toast.success('Successfully logged in!');
      navigate('/');
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
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 9h20L12 2zM4 9v11h16V9M12 9v11M8 12h2v4H8zM14 12h2v4h-2z" />
            </svg>
            <span>DarshanEase</span>
          </div>
          <h2>Welcome Back</h2>
          <p>Login to book and manage your temple darshan tickets.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="enter your email"
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
                placeholder="enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 auth-submit" disabled={submitting}>
            {submitting ? 'Signing In...' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>

        {/* Demo Credentials Box */}
        <div className="demo-credentials">

          <div className="demo-buttons">


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
          background: linear-gradient(135deg, #fdf8f5 0%, #fffbeb 100%);
        }

        .auth-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 40px;
          width: 100%;
          max-width: 480px;
          box-shadow: var(--shadow-xl);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .auth-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 16px;
        }

        .auth-logo .logo-icon {
          width: 30px;
          height: 30px;
        }

        .auth-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 8px;
        }

        .auth-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
        }

        .input-with-icon .form-control {
          padding-left: 44px;
        }

        .auth-submit {
          padding: 12px;
          font-size: 1rem;
          margin-top: 10px;
        }

        .w-100 {
          width: 100%;
        }

        .auth-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .auth-footer a {
          color: var(--primary);
          font-weight: 600;
        }

        /* Demo Box styling */
        .demo-credentials {
          margin-top: 30px;
          padding: 16px;
          background-color: var(--background);
          border-radius: var(--radius-md);
          border: 1.5px dashed var(--border);
        }

        .demo-credentials h4 {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.95rem;
          color: var(--secondary);
          margin-bottom: 8px;
        }

        .demo-credentials p {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .demo-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .demo-btn {
          flex: 1;
          min-width: 80px;
          padding: 6px 10px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: white;
          cursor: pointer;
          transition: var(--transition);
        }

        .demo-btn.admin {
          color: #ef4444;
          border-color: #fecaca;
        }
        .demo-btn.admin:hover {
          background-color: #fef2f2;
        }

        .demo-btn.organizer {
          color: #3b82f6;
          border-color: #bfdbfe;
        }
        .demo-btn.organizer:hover {
          background-color: #eff6ff;
        }

        .demo-btn.user {
          color: #10b981;
          border-color: #a7f3d0;
        }
        .demo-btn.user:hover {
          background-color: #ecfdf5;
        }

        @media (max-width: 576px) {
          .login-container {
            padding: 12px;
            min-height: calc(100vh - 72px);
          }
          .auth-card {
            padding: 24px 16px;
            border-radius: var(--radius-md);
          }
          .auth-header {
            margin-bottom: 20px;
          }
          .auth-header h2 {
            font-size: 1.5rem;
          }
          .demo-credentials {
            padding: 12px;
          }
          .demo-btn {
            font-size: 0.7rem;
            padding: 4px 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
