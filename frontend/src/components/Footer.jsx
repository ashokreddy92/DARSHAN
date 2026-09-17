import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
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
            Your gateway to seamless travel and spiritual darshan bookings. Plan your pilgrimage, book time slots, and experience divinity hassle-free.
          </p>
        </div>
        
        <div className="footer-links-col">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/temples">Temples</Link></li>
            <li><Link to="/donate">Donate</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
        
        <div className="footer-links-col">
          <h3>Temple Services</h3>
          <ul>
            <li>Special VIP Darshan</li>
            <li>General Darshan Registration</li>
            <li>Prasadam Counter Booking</li>
            <li>Temple Donation Receipts</li>
          </ul>
        </div>

        <div className="footer-links-col contact-col">
          <h3>Contact Support</h3>
          <p className="contact-info">Email: <a href="mailto:vennapusashok8@gmail.com">vennapusashok8@gmail.com</a></p>
          <p className="contact-info">Phone: <a href="tel:+919948287427">+91 9948287427</a></p>
          <p className="contact-info">Hours: 9:00 AM - 6:00 PM (Mon-Sat)</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container footer-bottom-flex">
          <p>&copy; {new Date().getFullYear()} DarshanEase. All Rights Reserved.</p>
          <div className="footer-socials">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
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
