import React, { useState, useEffect } from 'react';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactUs = () => {
  const { user, token, apiUrl } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-fill details if user is authenticated with JWT
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !msg.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      let emailSent = false;

      // 1. Send via EmailJS directly if configured
      if (serviceId && templateId && publicKey) {
        try {
          const templateParams = {
            from_name: name.trim(),
            name: name.trim(),
            user_name: name.trim(),
            from_email: email.trim(),
            email: email.trim(),
            user_email: email.trim(),
            reply_to: email.trim(),
            message: msg.trim(),
            subject: `New Contact Support Request from ${name.trim()}`,
          };

          await emailjs.send(serviceId, templateId, templateParams, publicKey);
          emailSent = true;
        } catch (emailjsErr) {
          console.warn('EmailJS delivery error, trying backend API:', emailjsErr);
        }
      }

      // 2. Also notify backend API
      try {
        const endpoint = '/api/contact';
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await axios.post(
          endpoint,
          {
            name: name.trim(),
            email: email.trim(),
            message: msg.trim(),
          },
          { headers }
        );

        if (res.data.success) {
          emailSent = true;
        }
      } catch (backendErr) {
        console.warn('Backend contact route error:', backendErr);
      }

      if (emailSent) {
        toast.success('Your message has been sent successfully! We will get back to you soon.');
        if (!user) {
          setName('');
          setEmail('');
        }
        setMsg('');
      } else {
        toast.error('Failed to send message. Please try again or reach us via phone.');
      }
    } catch (err) {
      console.error('Contact Form Error:', err);
      const errorMsg =
        err.response?.data?.message || err.message || 'Error sending message. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container container">
      <div className="page-header text-center">
        <h1>{t('contact.title')}</h1>
        <p>{t('contact.subtitle')}</p>
      </div>

      <div className="contact-grid">
        <div className="contact-info-card card">
          <h2>{t('contact.getInTouch')}</h2>
          <p className="card-subtitle">{t('contact.subtitle')}</p>

          <div className="info-items">
            <div className="info-item">
              <Mail className="contact-icon" />
              <div>
                <h4>{t('contact.emailSupport')}</h4>
                <p>vennapusaashok8@gmail.com</p>
              </div>
            </div>

            <div className="info-item">
              <Phone className="contact-icon" />
              <div>
                <h4>{t('contact.phoneSupport')}</h4>
                <p>+91 9948287427</p>
              </div>
            </div>

            <div className="info-item">
              <MapPin className="contact-icon" />
              <div>
                <h4>Administrative Office</h4>
                <p>Kammavaripalem, Mudlamuru Mandal, Prakasam District, Andhra Pradesh, India</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-card card">
          <h2>{t('contact.title')}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('contact.fullName')} *</label>
              <input
                type="text"
                className="form-control"
                placeholder={t('contact.fullName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('contact.email')} *</label>
              <input
                type="email"
                className="form-control"
                placeholder={t('contact.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('contact.message')} *</label>
              <textarea
                rows="4"
                className="form-control"
                placeholder={t('contact.messagePlaceholder')}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary w-100 send-msg-btn" disabled={loading}>
              <Send size={16} /> {loading ? t('contact.sendingBtn') : t('contact.sendBtn')}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .contact-container {
          padding-top: clamp(24px, 4vw, 40px);
          padding-bottom: clamp(40px, 6vw, 80px);
          min-height: calc(100vh - 200px);
          width: 100%;
        }

        .text-center {
          text-align: center;
        }

        .page-header h1 {
          font-weight: 800;
          color: var(--secondary);
          margin-bottom: 6px;
        }

        .page-header p {
          color: var(--text-muted);
          font-size: 1rem;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: clamp(20px, 4vw, 40px);
          margin-top: 24px;
        }

        .contact-info-card, .contact-form-card {
          padding: clamp(18px, 3vw, 32px);
        }

        .contact-info-card h2, .contact-form-card h2 {
          font-size: clamp(1.25rem, 2.5vw, 1.5rem);
          color: var(--secondary);
          margin-bottom: 8px;
          font-weight: 700;
        }

        .card-subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 24px;
        }

        .info-items {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .contact-icon {
          color: var(--primary);
          flex-shrink: 0;
          margin-top: 3px;
          width: 22px;
          height: 22px;
        }

        .info-item h4 {
          font-size: 0.95rem;
          color: var(--secondary);
          margin-bottom: 2px;
          font-weight: 600;
        }

        .info-item p {
          font-size: 0.875rem;
          color: var(--text-muted);
          word-break: break-word;
        }

        .send-msg-btn {
          padding: 12px;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 46px;
        }

        @media (max-width: 850px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default ContactUs;
