import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { Search, MapPin, Sparkles, Filter } from 'lucide-react';

const Temples = () => {
  const { t } = useLanguage();
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDeity, setSelectedDeity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemples = async () => {
      try {
        const res = await axios.get('/api/temples');
        if (res.data.success) {
          setTemples(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching temples:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTemples();
  }, []);


  const filteredTemples = temples.filter((temple) => {
    const matchSearch = 
      temple.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      temple.deity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      temple.location.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchState = selectedState ? temple.location.state === selectedState : true;
    const matchDeity = selectedDeity ? temple.deity.toLowerCase().includes(selectedDeity.toLowerCase()) : true;

    return matchSearch && matchState && matchDeity;
  });


  const uniqueStates = [...new Set(temples.map((t) => t.location.state))];

  const uniqueDeities = [...new Set(temples.map((t) => t.deity.split('(')[0].trim()))];

  const getFallbackImage = (templeName = '', deity = '') => {
    const lowerName = (templeName + ' ' + deity).toLowerCase();
    if (lowerName.includes('durga') || lowerName.includes('amman') || lowerName.includes('devi') || lowerName.includes('shakti') || lowerName.includes('bhavani') || lowerName.includes('kali') || lowerName.includes('saraswati') || lowerName.includes('lakshmi')) {
      return '/images/temples/kanaka_durga.jpg';
    }
    if (lowerName.includes('kalahasti') || lowerName.includes('vayu')) {
      return '/images/temples/srikalahasti.jpg';
    }
    if (lowerName.includes('shiva') || lowerName.includes('linga') || lowerName.includes('nath') || lowerName.includes('eeswara') || lowerName.includes('iswara') || lowerName.includes('srisailam') || lowerName.includes('somnath')) {
      return '/images/temples/srisailam.jpg';
    }
    return '/images/temples/tirumala_balaji.jpg';
  };

  return (
    <div className="temples-container container">
      <div className="page-header">
        <h1>{t('temples.title')}</h1>
        <p>{t('temples.subtitle')}</p>
      </div>

      
      <div className="search-filter-box">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder={t('temples.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search temples"
          />
        </div>

        <div className="filters-row">
          <div className="filter-select-wrapper">
            <MapPin size={18} className="select-icon" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              aria-label="Filter by state"
            >
              <option value="">{t('temples.allStates')}</option>
              {uniqueStates.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <Sparkles size={18} className="select-icon" />
            <select
              value={selectedDeity}
              onChange={(e) => setSelectedDeity(e.target.value)}
              aria-label="Filter by deity"
            >
              <option value="">{t('temples.allDeities')}</option>
              {uniqueDeities.map((deity) => (
                <option key={deity} value={deity}>{deity}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{t('temples.loading')}</p>
        </div>
      ) : filteredTemples.length === 0 ? (
        <div className="empty-state">
          <p>{t('temples.noTemples')}</p>
        </div>
      ) : (
        <div className="temples-grid">
          {filteredTemples.map((temple) => (
            <div
              key={temple._id}
              className="temple-item-card"
              onClick={() => navigate(`/temples/${temple._id}`)}
              role="button"
              tabIndex={0}
            >
              <div className="card-image">
                <img
                  src={temple.imageUrl || getFallbackImage(temple.name, temple.deity)}
                  alt={temple.name}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getFallbackImage(temple.name, temple.deity);
                  }}
                />
                <span className="deity-tag">{temple.deity}</span>
              </div>
              <div className="card-body">
                <h3>{temple.name}</h3>
                <div className="card-location">
                  <MapPin size={16} className="pin" />
                  <span>{temple.location.city}, {temple.location.state}</span>
                </div>
                <p className="card-desc">
                  {temple.description.length > 140 
                    ? `${temple.description.substring(0, 140)}...`
                    : temple.description}
                </p>
                <div className="card-actions">
                  <span className="timing">Timings: {temple.openingHours}</span>
                  <button className="btn btn-primary btn-sm book-btn">{t('home.bookDarshanBtn')}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .temples-container {
          padding-top: clamp(24px, 4vw, 40px);
          padding-bottom: clamp(40px, 6vw, 80px);
          min-height: calc(100vh - 200px);
          width: 100%;
        }

        .page-header {
          margin-bottom: clamp(20px, 3vw, 30px);
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

        
        .search-filter-box {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: clamp(14px, 2.5vw, 20px);
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: clamp(24px, 4vw, 40px);
          box-shadow: var(--shadow-sm);
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          color: var(--text-light);
          pointer-events: none;
        }

        .search-input-wrapper input {
          width: 100%;
          min-height: 46px;
          padding: 10px 14px 10px 46px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          outline: none;
          font-size: 0.95rem;
          transition: var(--transition);
        }

        .search-input-wrapper input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
        }

        .filters-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .filter-select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .select-icon {
          position: absolute;
          left: 12px;
          color: var(--text-light);
          pointer-events: none;
        }

        .filter-select-wrapper select {
          width: 100%;
          min-height: 44px;
          padding: 10px 36px 10px 38px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          outline: none;
          color: var(--text-main);
          background-color: white;
          appearance: none;
          cursor: pointer;
          font-size: 0.9rem;
          background-image: url("data:image/svg+xml;utf8,<svg fill='gray' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
          background-repeat: no-repeat;
          background-position: right 10px center;
        }

        .filter-select-wrapper select:focus {
          border-color: var(--primary);
        }

        
        .temples-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: clamp(16px, 3vw, 28px);
        }

        .temple-item-card {
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

        .temple-item-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: rgba(217, 119, 6, 0.2);
        }

        .card-image {
          height: 260px;
          position: relative;
          width: 100%;
          overflow: hidden;
          background-color: #f1f5f9;
        }

        .card-image::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.4) 100%);
          pointer-events: none;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          transition: transform 0.35s ease;
        }

        .temple-item-card:hover .card-image img {
          transform: scale(1.04);
        }

        .deity-tag {
          position: absolute;
          bottom: 12px;
          left: 12px;
          z-index: 2;
          background-color: rgba(30, 41, 59, 0.9);
          color: white;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          backdrop-filter: blur(4px);
          max-width: 85%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .card-body {
          padding: clamp(14px, 2.5vw, 20px);
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .card-body h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 6px;
        }

        .card-location {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .card-location .pin {
          color: var(--primary);
          flex-shrink: 0;
        }

        .card-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 16px;
          flex-grow: 1;
        }

        .card-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border);
          padding-top: 12px;
          gap: 10px;
          flex-wrap: wrap;
        }

        .card-actions .timing {
          font-size: 0.8rem;
          color: var(--text-light);
          font-weight: 500;
        }

        .book-btn {
          font-weight: 600;
        }

        
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          color: var(--text-muted);
        }

        .loading-state .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border);
          border-top: 4px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-muted);
          border: 1px dashed var(--border);
          border-radius: var(--radius-md);
          background-color: white;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .temples-grid {
            grid-template-columns: 1fr;
          }
          .filters-row {
            grid-template-columns: 1fr;
          }
          .card-image {
            height: 220px;
          }
        }
      `}</style>
    </div>
  );
};

export default Temples;
