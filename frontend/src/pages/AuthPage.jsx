import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import { 
  Mail, ArrowRight, ShieldCheck, RefreshCw, Edit3, 
  CheckCircle2, Clock, AlertCircle, Loader2, Lock
} from 'lucide-react';
import OTPInput from '../components/OTPInput';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendOtp, verifyOtp, resendOtp, user } = useAuth();
  const { t } = useLanguage();

  // Redirect target after successful login (preserves devotee booking state)
  const fromPath = location.state?.from || '/';

  // Step state: 1 = Email Input, 2 = OTP Verification
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resendSuccessMsg, setResendSuccessMsg] = useState('');

  // Timers
  const [expirySeconds, setExpirySeconds] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(60);

  const expiryTimerRef = useRef(null);
  const cooldownTimerRef = useRef(null);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (user) {
      navigate(fromPath, { replace: true });
    }
  }, [user, navigate, fromPath]);

  // Handle 5-minute expiry timer
  useEffect(() => {
    if (step === 2 && expirySeconds > 0) {
      expiryTimerRef.current = setInterval(() => {
        setExpirySeconds((prev) => {
          if (prev <= 1) {
            clearInterval(expiryTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
    };
  }, [step, expirySeconds]);

  // Handle 60-second resend cooldown timer
  useEffect(() => {
    if (step === 2 && resendCooldown > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [step, resendCooldown]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const validateEmail = (val) => {
    const trimmed = val.trim().toLowerCase();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(trimmed);
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setResendSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtp(cleanEmail);
      if (res && res.success) {
        toast.success(res.message || '6-digit OTP sent!');
        setStep(2);
        if (res.demoOtp) {
          setOtp(res.demoOtp);
          setResendSuccessMsg(`Demo Mode Active: Use code ${res.demoOtp} or 123456 to log in.`);
        } else {
          setResendSuccessMsg('');
        }
        setExpirySeconds(300);
        setResendCooldown(60);
      } else {
        setErrorMsg(res?.message || 'Failed to send OTP. Please try again.');
        toast.error(res?.message || 'Failed to send OTP.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP. Please try again later.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMsg('');
    setResendSuccessMsg('');

    try {
      setLoading(true);
      const res = await resendOtp(email);
      if (res && res.success) {
        toast.success(res.message || 'New OTP generated!');
        if (res.demoOtp) {
          setOtp(res.demoOtp);
          setResendSuccessMsg(`Demo Mode Active: Use code ${res.demoOtp} or 123456 to log in.`);
        } else {
          setResendSuccessMsg('A new OTP has been dispatched to your email inbox.');
        }
        setExpirySeconds(300);
        setResendCooldown(60);
      } else {
        setErrorMsg(res?.message || 'Failed to resend OTP.');
        toast.error(res?.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend OTP. Please try again later.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (otpValueToVerify) => {
    const finalOtp = (otpValueToVerify || otp).trim();
    setErrorMsg('');
    setResendSuccessMsg('');

    if (!finalOtp || finalOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP');
      return;
    }

    if (expirySeconds <= 0) {
      setErrorMsg('This OTP has expired. Please request a new one.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp(email, finalOtp);
      if (res && res.success) {
        toast.success(res.message || 'Welcome to DarshanEase!');
        navigate(fromPath, { replace: true });
      } else {
        setErrorMsg(res?.message || 'Verification failed. Please check the code.');
        toast.error(res?.message || 'Invalid OTP code.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Verification failed. Please check the code.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setStep(1);
    setOtp('');
    setErrorMsg('');
    setResendSuccessMsg('');
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        
        {/* Authentication Card in Middle */}
        <div className="auth-card-panel">
          <div className="auth-card">
            {/* Brand Header */}
            <div className="auth-brand-header">
              <h2 className="auth-heading">
                {step === 1 ? 'Devotee Login' : 'Verify Email OTP'}
              </h2>

              {step === 2 && (
                <>
                  <p className="auth-subheading">
                    We've sent a 6-digit verification code to:
                  </p>
                  <div className="target-email-pill">
                    <span className="email-text">{email}</span>
                    <button 
                      type="button" 
                      onClick={handleChangeEmail} 
                      className="edit-email-btn"
                      title="Change Email"
                    >
                      <Edit3 size={13} />
                      <span>Change</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Error Feedback */}
            {errorMsg && (
              <div className="auth-alert error">
                <AlertCircle size={18} className="alert-icon" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Feedback */}
            {resendSuccessMsg && (
              <div className="auth-alert success">
                <CheckCircle2 size={18} className="alert-icon" />
                <span>{resendSuccessMsg}</span>
              </div>
            )}

            {/* STEP 1: Email Input Form */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="auth-form-body">
                <div className="form-group">
                  <label htmlFor="devotee-email" className="input-label">
                    Email Address
                  </label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="devotee-email"
                      type="email"
                      required
                      autoFocus
                      autoComplete="email"
                      placeholder="e.g. devotee@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="form-input"
                    />
                  </div>
                  <span className="input-helper">
                    New devotees will automatically have an account created upon verification.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="btn btn-primary auth-submit-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="btn-spinner" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="auth-trust-badges">
                  <div className="trust-item">
                    <ShieldCheck size={15} />
                    <span>Passwordless & Secure</span>
                  </div>
                  <div className="trust-item">
                    <Lock size={15} />
                    <span>Salted Cryptographic OTP</span>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 2: 6-Digit OTP Form */}
            {step === 2 && (
              <div className="auth-form-body">
                <div className="otp-container">
                  <label className="input-label text-center">
                    Enter 6-Digit Verification Code
                  </label>

                  <OTPInput
                    length={6}
                    value={otp}
                    onChange={setOtp}
                    onComplete={handleVerifyOtp}
                    disabled={loading || expirySeconds === 0}
                    hasError={Boolean(errorMsg)}
                    autoFocus={true}
                  />

                  {/* Expiry Countdown */}
                  <div className="timer-row">
                    <div className={`countdown-chip ${expirySeconds < 60 ? 'warning' : ''}`}>
                      <Clock size={14} />
                      <span>
                        {expirySeconds > 0
                          ? `OTP expires in: ${formatTimer(expirySeconds)}`
                          : 'OTP has expired'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Verify Button */}
                <button
                  type="button"
                  onClick={() => handleVerifyOtp(otp)}
                  disabled={loading || otp.length !== 6 || expirySeconds === 0}
                  className="btn btn-primary auth-submit-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="btn-spinner" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </button>

                {/* Resend Cooldown */}
                <div className="resend-row">
                  <span className="resend-prompt">Didn't receive the OTP?</span>
                  {resendCooldown > 0 ? (
                    <span className="cooldown-pill">
                      Resend in {resendCooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="resend-action-btn"
                    >
                      <RefreshCw size={13} className={loading ? 'spinning' : ''} />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Footer portal link */}
            <div className="auth-footer-note">
              <span>Temple Administrator or Staff?</span>
              <Link to="/admin/login" className="admin-link">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .auth-page-wrapper {
          min-height: calc(100vh - 80px);
          background-color: var(--background, #fafafa);
          padding: clamp(24px, 4vw, 56px) 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          box-sizing: border-box;
        }

        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }

        /* Centered Auth Card Panel */
        .auth-card-panel {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }

        .auth-card {
          background: var(--surface, #ffffff);
          border-radius: var(--radius-lg, 20px);
          padding: clamp(24px, 3.5vw, 40px) clamp(18px, 3vw, 32px);
          border: 1px solid var(--border, #e5e7eb);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 4px 10px -2px rgba(0, 0, 0, 0.03);
          width: 100%;
          box-sizing: border-box;
        }

        .auth-brand-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 1.75rem;
        }

        .temple-emblem {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background-color: var(--primary-light, #fef3c7);
          color: var(--primary, #d97706);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .temple-icon {
          width: 26px;
          height: 26px;
        }

        .auth-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          color: var(--primary, #d97706);
          border: 1px solid var(--primary-light, #fde68a);
          padding: 3px 12px;
          border-radius: 50px;
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .sparkle-icon {
          color: var(--primary, #d97706);
        }

        .auth-heading {
          font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
          font-size: clamp(1.65rem, 2.8vw, 2.1rem);
          font-weight: 700;
          color: var(--secondary, #1e293b);
          margin-bottom: 0;
          letter-spacing: 0.5px;
        }

        .auth-subheading {
          font-size: 0.9rem;
          color: var(--text-muted, #4b5563);
          line-height: 1.5;
          max-width: 320px;
          margin: 0 auto;
        }

        .target-email-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--background, #fafafa);
          border: 1px solid var(--border, #e5e7eb);
          padding: 5px 14px;
          border-radius: 50px;
          margin-top: 10px;
          max-width: 100%;
          overflow: hidden;
        }

        .email-text {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--secondary, #1e293b);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .edit-email-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: var(--primary, #d97706);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .edit-email-btn:hover {
          background-color: var(--primary-light, #fef3c7);
        }

        /* Alerts */
        .auth-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.86rem;
          margin-bottom: 1.25rem;
          animation: slideDown 0.25s ease;
        }

        .auth-alert.error {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }

        .auth-alert.success {
          background-color: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Form Controls */
        .auth-form-body {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--secondary, #1e293b);
        }

        .input-label.text-center {
          text-align: center;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-light, #9ca3af);
          pointer-events: none;
        }

        .form-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          border: 1.5px solid var(--border, #e5e7eb);
          border-radius: var(--radius-sm, 8px);
          font-size: 0.95rem;
          color: var(--text-main, #1f2937);
          background-color: #ffffff;
          transition: var(--transition, all 0.2s ease);
          outline: none;
          box-sizing: border-box;
          min-height: 48px;
        }

        .form-input:focus {
          border-color: var(--primary, #d97706);
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
        }

        .input-helper {
          font-size: 0.78rem;
          color: var(--text-muted, #4b5563);
          margin-top: 3px;
          line-height: 1.4;
        }

        .auth-submit-btn {
          width: 100%;
          padding: 12px 20px;
          min-height: 48px;
          font-size: 0.98rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: var(--radius-sm, 8px);
          background-color: var(--primary, #d97706);
          border: none;
          color: #ffffff;
          cursor: pointer;
          transition: var(--transition, all 0.2s ease);
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);
        }

        .auth-submit-btn:hover:not(:disabled) {
          background-color: var(--primary-hover, #b45309);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(217, 119, 6, 0.3);
        }

        .auth-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .btn-spinner {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .auth-trust-badges {
          display: flex;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid var(--border, #e5e7eb);
          margin-top: 4px;
          gap: 8px;
          flex-wrap: wrap;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.76rem;
          color: var(--text-muted, #4b5563);
        }

        .trust-item svg {
          color: var(--primary, #d97706);
          flex-shrink: 0;
        }

        /* OTP Specific */
        .otp-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .timer-row {
          display: flex;
          justify-content: center;
          width: 100%;
          margin-top: -4px;
          margin-bottom: 8px;
        }

        .countdown-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-muted, #4b5563);
          background-color: var(--background, #fafafa);
          border: 1px solid var(--border, #e5e7eb);
          padding: 4px 12px;
          border-radius: 50px;
        }

        .countdown-chip.warning {
          border-color: #fecaca;
          color: #dc2626;
          background-color: #fef2f2;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .resend-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.86rem;
          color: var(--text-muted, #4b5563);
          margin-top: 2px;
          flex-wrap: wrap;
        }

        .cooldown-pill {
          font-weight: 600;
          color: var(--text-light, #9ca3af);
        }

        .resend-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          color: var(--primary, #d97706);
          font-weight: 600;
          cursor: pointer;
          font-size: 0.86rem;
          padding: 2px 4px;
        }

        .resend-action-btn:hover {
          color: var(--primary-hover, #b45309);
          text-decoration: underline;
        }

        .spinning {
          animation: spin 0.8s linear infinite;
        }

        .auth-footer-note {
          margin-top: 1.75rem;
          padding-top: 14px;
          border-top: 1px solid var(--border, #e5e7eb);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--text-muted, #4b5563);
          flex-wrap: wrap;
          text-align: center;
        }

        .admin-link {
          font-weight: 600;
          color: var(--primary, #d97706);
        }

        .admin-link:hover {
          color: var(--primary-hover, #b45309);
          text-decoration: underline;
        }

        /* Responsive Breakpoints */
        @media (max-width: 960px) {
          .auth-card-panel {
            max-width: 440px;
          }
        }

        @media (max-width: 480px) {
          .auth-page-wrapper {
            padding: 16px 12px;
            align-items: flex-start;
          }

          .auth-card-panel {
            max-width: 100%;
          }

          .auth-card {
            padding: 24px 16px;
            border-radius: 16px;
          }

          .auth-heading {
            font-size: 1.45rem;
          }

          .auth-trust-badges {
            flex-direction: column;
            gap: 6px;
          }

          .form-input {
            font-size: 16px; /* Prevents iOS auto-zoom on input focus */
          }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
