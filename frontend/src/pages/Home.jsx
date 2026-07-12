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
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/temples')}>
              <Ticket size={18} /> Book Darshan
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/temples')}>
              Explore Temples
            </button>
          </div>
        </div>
        
        <div className="hero-image-container">
          <img 
            className="hero-image" 
            src="https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=1000" 
            alt="Tirupati Temple" 
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
              <p>100% safe and secure transactions</p>
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
              <p>Contribute and support holy places</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Temples Grid */}
      <section className="popular-temples container">
        <div className="section-header">
          <h2>Popular Temples</h2>
          <p>Explore and book darshan from popular temples</p>
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
              >
                <div className="temple-img-wrapper">
                  <img src={temple.imageUrl || 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800'} alt={temple.name} />
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
          padding-bottom: 80px;
        }

        /* Hero styling */
        .hero-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 60px;
          padding-bottom: 60px;
          gap: 40px;
        }

        .hero-content {
          flex: 1;
          max-width: 580px;
        }

        .hero-badge {
          background-color: var(--primary-light);
          color: var(--primary);
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 20px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.15;
          color: var(--secondary);
          margin-bottom: 24px;
          letter-spacing: -1.5px;
        }

        .hero-title .highlight {
          color: var(--primary);
        }

        .hero-subtitle {
          font-size: 1.125rem;
          color: var(--text-muted);
          margin-bottom: 36px;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
        }

        .btn-lg {
          padding: 14px 28px;
          font-size: 1rem;
          border-radius: var(--radius-sm);
        }

        .hero-image-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-image {
          max-width: 480px;
          width: 100%;
          height: auto;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          border: 4px solid white;
          object-fit: cover;
        }

        /* Features Section */
        .features-section {
          padding-top: 20px;
          padding-bottom: 50px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          background: white;
          padding: 30px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border);
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 10px;
        }

        .feature-icon-wrapper {
          background-color: var(--primary-light);
          padding: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-icon {
          color: var(--primary);
          width: 24px;
          height: 24px;
        }

        .feature-info h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 2px;
        }

        .feature-info p {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        /* Popular Temples */
        .popular-temples {
          padding-top: 60px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .section-header h2 {
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--secondary);
          margin-bottom: 8px;
        }

        .section-header p {
          color: var(--text-muted);
          font-size: 1.05rem;
        }

        .temple-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .temple-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
        }

        .temple-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(217, 119, 6, 0.3);
        }

        .temple-img-wrapper {
          height: 180px;
          overflow: hidden;
        }

        .temple-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition);
        }

        .temple-card:hover .temple-img-wrapper img {
          transform: scale(1.05);
        }

        .temple-details {
          padding: 16px;
        }

        .temple-details h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 8px;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .temple-location {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .loc-icon {
          color: var(--primary);
        }

        .section-footer {
          display: flex;
          justify-content: center;
          margin-top: 40px;
        }

        .btn-all-temples {
          padding: 12px 24px;
        }

        .popular-loading {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
        }

        @media (max-width: 1024px) {
          .temple-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            flex-direction: column-reverse;
            padding-top: 30px;
            padding-bottom: 40px;
          }
          .hero-title {
            font-size: 2.5rem;
          }
          .hero-image {
            max-width: 320px;
            height: auto;
          }
          .features-grid {
            grid-template-columns: 1fr;
            padding: 20px;
          }
          .temple-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
