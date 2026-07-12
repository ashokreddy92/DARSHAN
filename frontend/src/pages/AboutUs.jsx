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
            <img src="https://images.unsplash.com/photo-1705723116788-d11fa6e3f415?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dGlydXBhdGl8ZW58MHx8MHx8fDA%3D" alt="Tirupati Temple" />
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
          padding-top: 40px;
          padding-bottom: 80px;
        }

        .text-center {
          text-align: center;
        }

        .about-content {
          padding: 40px;
          margin-top: 30px;
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          margin-bottom: 50px;
          align-items: center;
        }

        .about-text h2 {
          font-size: 1.75rem;
          color: var(--secondary);
          margin-bottom: 16px;
        }

        .about-text p {
          color: var(--text-muted);
          line-height: 1.7;
          margin-bottom: 16px;
          font-size: 1rem;
        }

        .about-img {
          display: flex;
          justify-content: center;
        }

        .about-img img {
          width: 100%;
          max-width: 320px;
          height: 220px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          object-fit: cover;
        }

        .values-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          border-top: 1px solid var(--border);
          padding-top: 40px;
        }

        .value-box {
          text-align: center;
          padding: 10px;
        }

        .val-icon {
          color: var(--primary);
          width: 36px;
          height: 36px;
          margin-bottom: 14px;
        }

        .value-box h3 {
          font-size: 1.15rem;
          color: var(--secondary);
          margin-bottom: 10px;
        }

        .value-box p {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr;
          }
          .values-row {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutUs;
