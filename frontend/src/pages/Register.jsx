import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { UserPlus, User, Mail, Key, Phone, UserCheck } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('USER');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please enter all required fields');
      return;
    }
    setSubmitting(true);
    const result = await register(name, email, password, role, phone);
    setSubmitting(false);

    if (result.success) {
      toast.success('Registration successful! Logged in.');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="register-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 9h20L12 2zM4 9v11h16V9M12 9v11M8 12h2v4H8zM14 12h2v4h-2z" />
            </svg>
            <span>DarshanEase</span>
          </div>
          <h2>Create Account</h2>
          <p>Join devotees worldwide. Register to book tickets easily.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="name"
                className="form-control"
                placeholder="enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input
                type="text"
                id="phone"
                className="form-control"
                placeholder="enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">I want to register as a:</label>
            <div className="input-with-icon">
              <UserCheck size={18} className="input-icon" />
              <select
                id="role"
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="USER">Devotee (Book Tickets)</option>
                <option value="ORGANIZER">Temple Organizer (Manage Slots/Temples)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <div className="input-with-icon">
              <Key size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="choose password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 auth-submit" disabled={submitting}>
            {submitting ? 'Creating Account...' : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>

      <style>{`
        .register-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px 20px;
          min-height: calc(100vh - 150px);
          background: linear-gradient(135deg, #fdf8f5 0%, #fffbeb 100%);
        }

        .auth-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 40px;
          width: 100%;
          max-width: 500px;
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

        /* select custom dropdown reset */
        select.form-control {
          appearance: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml;utf8,<svg fill='black' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 20px;
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

        @media (max-width: 576px) {
          .register-container {
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
        }
      `}</style>
    </div>
  );
};

export default Register;
