import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Clock, Ticket, Heart, MapPin, ArrowRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemples = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/temples');
        if (res.data.success) {
          // Take first 4 as popular temples
          setTemples(res.data.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching temples:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTemples();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section container">
        <div className="hero-content">
          <span className="hero-badge">Divine Darshan, Simplified</span>
          <h1 className="hero-title">
            Book Your Darshan, <br />
            Experience <span className="highlight">Divinity</span>
          </h1>
          <p className="hero-subtitle">
            Explore sacred temples, check real-time darshan slots, and book your tickets online. A spiritual journey made easy and secure.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg hero-btn" onClick={() => navigate('/temples')}>
              <Ticket size={18} /> Book Darshan
            </button>
            <button className="btn btn-secondary btn-lg hero-btn" onClick={() => navigate('/temples')}>
              Explore Temples
            </button>
          </div>
        </div>

        <div className="hero-image-container">
          <img
            className="hero-image"
            src="/temple-hero.jpg"
            alt="Sri Venkateswara Swamy Temple Darshan"
            fetchpriority="high"
            decoding="async"
          />
        </div>
      </section>

      {/* Features Ribbon */}
      <section className="features-section container">
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <ShieldCheck className="feature-icon" />
            </div>
            <div className="feature-info">
              <h3>Secure Booking</h3>
              <p>100% safe & verified bookings</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <Clock className="feature-icon" />
            </div>
            <div className="feature-info">
              <h3>Real-time Slots</h3>
              <p>Live darshan slot availability</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <Ticket className="feature-icon" />
            </div>
            <div className="feature-info">
              <h3>Easy Cancellation</h3>
              <p>Hassle-free booking cancellation</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <Heart className="feature-icon" />
            </div>
            <div className="feature-info">
              <h3>Support Temples</h3>
              <p>Contribute & support holy places</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Temples Grid */}
      <section className="popular-temples container">
        <div className="section-header">
          <h2>Popular Temples</h2>
          <p>Explore and book darshan from popular sacred temples</p>
        </div>

        {loading ? (
          <div className="popular-loading">Loading popular temples...</div>
        ) : (
          <div className="temple-grid">
            {temples.map((temple) => (
              <div
                key={temple._id}
                className="temple-card"
                onClick={() => navigate(`/temples/${temple._id}`)}
                role="button"
                tabIndex={0}
              >
                <div className="temple-img-wrapper">
                  <img
                    src={temple.imageUrl || 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800'}
                    alt={temple.name}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="temple-details">
                  <h3>{temple.name}</h3>
                  <div className="temple-location">
                    <MapPin size={16} className="loc-icon" />
                    <span>{temple.location.city}, {temple.location.state}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="section-footer">
          <button className="btn btn-secondary btn-all-temples" onClick={() => navigate('/temples')}>
            View All Temples <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <style>{`
        .home-page {
          padding-bottom: clamp(40px, 6vw, 80px);
          width: 100%;
        }

        /* Hero styling */
        .hero-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: clamp(30px, 5vw, 60px);
          padding-bottom: clamp(30px, 5vw, 60px);
          gap: clamp(24px, 4vw, 48px);
        }

        .hero-content {
          flex: 1;
          max-width: 600px;
        }

        .hero-badge {
          background-color: var(--primary-light);
          color: var(--primary);
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 700;
          display: inline-block;
          margin-bottom: 18px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .hero-title {
          font-size: clamp(2rem, 4.5vw + 0.5rem, 3.5rem);
          font-weight: 800;
          line-height: 1.15;
          color: var(--secondary);
          margin-bottom: 20px;
          letter-spacing: -1px;
        }

        .hero-title .highlight {
          color: var(--primary);
        }

        .hero-subtitle {
          font-size: clamp(0.95rem, 1.5vw, 1.125rem);
          color: var(--text-muted);
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .btn-lg {
          padding: 12px 26px;
          font-size: 1rem;
          min-height: 48px;
        }

        .hero-image-container {
          flex: 1.25;
          display: flex;
          justify-content: center;
          align-items: center;
          max-width: 650px;
          width: 100%;
        }

        .hero-image {
          width: 100%;
          max-width: 620px;
          height: auto;
          aspect-ratio: 4 / 3;
          border-radius: var(--radius-lg);
          box-shadow: 0 20px 45px -12px rgba(217, 119, 6, 0.25), 0 10px 25px -5px rgba(0, 0, 0, 0.12);
          border: 4px solid white;
          object-fit: cover;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-image:hover {
          transform: translateY(-5px) scale(1.01);
          box-shadow: 0 28px 55px -10px rgba(217, 119, 6, 0.3), 0 15px 30px -5px rgba(0, 0, 0, 0.18);
        }

        /* Features Section */
        .features-section {
          padding-top: 10px;
          padding-bottom: clamp(30px, 4vw, 50px);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          background: white;
          padding: clamp(16px, 3vw, 30px);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border);
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 8px;
        }

        .feature-icon-wrapper {
          background-color: var(--primary-light);
          padding: 10px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .feature-icon {
          color: var(--primary);
          width: 22px;
          height: 22px;
        }

        .feature-info h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 2px;
        }

        .feature-info p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Popular Temples */
        .popular-temples {
          padding-top: clamp(30px, 4vw, 50px);
        }

        .section-header {
          text-align: center;
          margin-bottom: clamp(24px, 4vw, 40px);
        }

        .section-header h2 {
          font-size: clamp(1.6rem, 3vw, 2.25rem);
          font-weight: 800;
          color: var(--secondary);
          margin-bottom: 6px;
        }

        .section-header p {
          color: var(--text-muted);
          font-size: 1rem;
        }

        .temple-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .temple-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
        }

        .temple-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(217, 119, 6, 0.3);
        }

        .temple-img-wrapper {
          height: 180px;
          overflow: hidden;
          width: 100%;
        }

        .temple-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          transition: var(--transition);
        }

        .temple-card:hover .temple-img-wrapper img {
          transform: scale(1.05);
        }

        .temple-details {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .temple-details h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 6px;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .temple-location {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .loc-icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        .section-footer {
          display: flex;
          justify-content: center;
          margin-top: 36px;
        }

        .btn-all-temples {
          padding: 12px 24px;
        }

        .popular-loading {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
        }

        /* Breakpoints */
        @media (max-width: 1024px) {
          .temple-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        @media (max-width: 800px) {
          .hero-section {
            flex-direction: column-reverse;
            text-align: center;
          }
          .hero-content {
            max-width: 100%;
          }
          .hero-actions {
            justify-content: center;
          }
          .hero-image-container {
            width: 100%;
            max-width: 500px;
          }
        }

        @media (max-width: 540px) {
          .hero-actions {
            flex-direction: column;
            width: 100%;
          }
          .hero-btn {
            width: 100%;
          }
          .features-grid {
            grid-template-columns: 1fr;
            padding: 16px;
            gap: 14px;
          }
          .temple-grid {
            grid-template-columns: 1fr;
          }
          .temple-img-wrapper {
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
