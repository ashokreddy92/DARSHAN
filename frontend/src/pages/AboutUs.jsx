import React from 'react';
import { Heart, ShieldCheck, MapPin } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="about-container container">
      <div className="page-header text-center">
        <h1>About DarshanEase</h1>
        <p>Connecting devotees to temples and simplifying spiritual journeys globally.</p>
      </div>

      <div className="about-content card">
        <div className="about-grid">
          <div className="about-text">
            <h2>Our Mission</h2>
            <p>
              DarshanEase is designed to make holy pilgrimage reservation accessible, transparent, and hassle-free. By leveraging modern MERN-stack architecture, we coordinate with major temple administrative committees to establish real-time slots and reduce hours in crowded physical queues.
            </p>
            <p>
              Devotees can explore verified temples, review history, select available slots, book entry passes, and directly support operations through online donations.
            </p>
          </div>
          <div className="about-img">
            <img src="/about-temple.jpg" alt="Grand Temple Gopuram" />
          </div>
        </div>

        <div className="values-row">
          <div className="value-box">
            <ShieldCheck className="val-icon" />
            <h3>Trust & Safety</h3>
            <p>Secure authentication and role validation guarantees verified booking reference codes.</p>
          </div>
          <div className="value-box">
            <Heart className="val-icon" />
            <h3>Devotion Focused</h3>
            <p>We handle booking logistics so that you can focus entirely on your spiritual devotion.</p>
          </div>
          <div className="value-box">
            <MapPin className="val-icon" />
            <h3>Statewide Coverage</h3>
            <p>Our platform indexes major temple historical centers across India for pilgrims.</p>
          </div>
        </div>
      </div>

      <style>{`
        .about-container {
          padding-top: clamp(24px, 4vw, 40px);
          padding-bottom: clamp(40px, 6vw, 80px);
          width: 100%;
        }

        .text-center {
          text-align: center;
        }

        .about-content {
          padding: clamp(20px, 4vw, 40px);
          margin-top: 24px;
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: clamp(24px, 4vw, 44px);
          margin-bottom: clamp(30px, 4vw, 50px);
          align-items: center;
        }

        .about-text h2 {
          font-size: clamp(1.4rem, 2.5vw, 1.75rem);
          color: var(--secondary);
          margin-bottom: 14px;
          font-weight: 700;
        }

        .about-text p {
          color: var(--text-muted);
          line-height: 1.7;
          margin-bottom: 14px;
          font-size: 0.95rem;
        }

        .about-img {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        .about-img img {
          width: 100%;
          max-width: 580px;
          height: auto;
          aspect-ratio: 4 / 3;
          border-radius: var(--radius-lg);
          box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.14), 0 8px 18px -4px rgba(217, 119, 6, 0.12);
          border: 4px solid white;
          object-fit: cover;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .about-img img:hover {
          transform: translateY(-4px);
          box-shadow: 0 22px 42px -8px rgba(0, 0, 0, 0.18), 0 10px 22px -3px rgba(217, 119, 6, 0.16);
        }

        .values-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(20px, 3vw, 30px);
          border-top: 1px solid var(--border);
          padding-top: clamp(24px, 3.5vw, 40px);
        }

        .value-box {
          text-align: center;
          padding: 8px;
        }

        .val-icon {
          color: var(--primary);
          width: 36px;
          height: 36px;
          margin-bottom: 12px;
        }

        .value-box h3 {
          font-size: 1.1rem;
          color: var(--secondary);
          margin-bottom: 8px;
          font-weight: 700;
        }

        .value-box p {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        @media (max-width: 850px) {
          .about-grid {
            grid-template-columns: 1fr;
          }
          .values-row {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutUs;
