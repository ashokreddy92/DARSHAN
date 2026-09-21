import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="app-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 9h20L12 2zM4 9v11h16V9M12 9v11M8 12h2v4H8zM14 12h2v4h-2z" />
            </svg>
            <span>DarshanEase</span>
          </div>
          <p className="brand-description">
            {t('footer.brandDesc')}
          </p>
          <div style={{ marginTop: '16px' }}>
            <LanguageSelector variant="footer" />
          </div>
        </div>
        
        <div className="footer-links-col">
          <h3>{t('footer.quickLinks')}</h3>
          <ul>
            <li><Link to="/">{t('nav.home')}</Link></li>
            <li><Link to="/temples">{t('nav.temples')}</Link></li>
            <li><Link to="/donate">{t('nav.donate')}</Link></li>
            <li><Link to="/about">{t('nav.aboutUs')}</Link></li>
            <li><Link to="/contact">{t('nav.contactUs')}</Link></li>
          </ul>
        </div>
        
        <div className="footer-links-col">
          <h3>{t('footer.templeServices')}</h3>
          <ul>
            <li>{t('footer.vipDarshan')}</li>
            <li>Special Pooja Booking</li>
            <li>{t('footer.prasadamBooking')}</li>
            <li>{t('footer.donationReceipts')}</li>
          </ul>
        </div>

        <div className="footer-links-col contact-col">
          <h3>{t('footer.contactSupport')}</h3>
          <p className="contact-info">Email: <a href="mailto:vennapusashok8@gmail.com">vennapusashok8@gmail.com</a></p>
          <p className="contact-info">Phone: <a href="tel:+919948287427">+91 9948287427</a></p>
          <p className="contact-info">{t('contact.timings')}: {t('contact.timingsValue')}</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container footer-bottom-flex">
          <p>&copy; {new Date().getFullYear()} DarshanEase. {t('footer.copyright')}</p>
          <div className="footer-socials">
            <span>{t('footer.privacyPolicy')}</span>
            <span>{t('footer.termsOfService')}</span>
          </div>
        </div>
      </div>

      <style>{`
        .app-footer {
          background-color: var(--secondary);
          color: #94a3b8;
          padding: clamp(40px, 6vw, 60px) 0 20px;
          margin-top: auto;
          border-top: 1px solid #334155;
          width: 100%;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: clamp(24px, 4vw, 40px);
          margin-bottom: 40px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .footer-logo .logo-icon {
          width: 28px;
          height: 28px;
          color: var(--primary);
        }

        .brand-description {
          line-height: 1.6;
          font-size: 0.925rem;
          max-width: 360px;
        }

        .footer-links-col h3 {
          color: white;
          font-size: 1.05rem;
          margin-bottom: 18px;
          font-weight: 600;
        }

        .footer-links-col ul {
          list-style: none;
        }

        .footer-links-col ul li {
          margin-bottom: 12px;
          font-size: 0.925rem;
        }

        .footer-links-col ul li a {
          display: inline-block;
          padding: 2px 0;
          transition: var(--transition);
        }

        .footer-links-col ul li a:hover {
          color: var(--primary);
          transform: translateX(4px);
        }

        .contact-info {
          font-size: 0.925rem;
          margin-bottom: 10px;
          line-height: 1.5;
        }

        .contact-info a {
          color: #cbd5e1;
        }

        .contact-info a:hover {
          color: var(--primary);
        }

        .footer-bottom {
          border-top: 1px solid #334155;
          padding-top: 20px;
          font-size: 0.875rem;
        }

        .footer-bottom-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-socials {
          display: flex;
          gap: 20px;
          cursor: pointer;
        }

        .footer-socials span:hover {
          color: white;
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }
        }

        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .footer-bottom-flex {
            flex-direction: column;
            text-align: center;
            justify-content: center;
          }
          .footer-socials {
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
