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


      </div>

      <style>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: clamp(20px, 4vw, 60px) 16px;
          min-height: calc(100vh - 150px);
          background: linear-gradient(135deg, #fdf8f5 0%, #fffbeb 100%);
          width: 100%;
        }

        .auth-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: clamp(20px, 4vw, 40px);
          width: 100%;
          max-width: 460px;
          box-shadow: var(--shadow-xl);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .auth-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 12px;
        }

        .auth-logo .logo-icon {
          width: 28px;
          height: 28px;
        }

        .auth-header h2 {
          font-size: clamp(1.4rem, 2.5vw, 1.75rem);
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 6px;
        }

        .auth-header p {
          color: var(--text-muted);
          font-size: 0.875rem;
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
          pointer-events: none;
        }

        .input-with-icon .form-control {
          padding-left: 44px;
          min-height: 44px;
        }

        .auth-submit {
          padding: 12px;
          font-size: 1rem;
          margin-top: 10px;
          min-height: 46px;
        }

        .w-100 {
          width: 100%;
        }

        .auth-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .auth-footer a {
          color: var(--primary);
          font-weight: 600;
        }



        @media (max-width: 480px) {
          .auth-card {
            padding: 20px 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
