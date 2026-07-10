import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Sparkles, Filter } from 'lucide-react';

const Temples = () => {
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDeity, setSelectedDeity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemples = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/temples');
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

  // Filter logic
  const filteredTemples = temples.filter((temple) => {
    const matchSearch = 
      temple.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      temple.deity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      temple.location.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchState = selectedState ? temple.location.state === selectedState : true;
    const matchDeity = selectedDeity ? temple.deity.toLowerCase().includes(selectedDeity.toLowerCase()) : true;

    return matchSearch && matchState && matchDeity;
  });

  // Extract unique states for dropdown list
  const uniqueStates = [...new Set(temples.map((t) => t.location.state))];
  // Extract common unique deities
  const uniqueDeities = [...new Set(temples.map((t) => t.deity.split('(')[0].trim()))];

  return (
    <div className="temples-container container">
      <div className="page-header">
        <h1>Sacred Temples Directory</h1>
        <p>Explore prominent pilgrimage locations and reserve darshan slots online.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="search-filter-box">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by temple name, deity or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <div className="filter-select-wrapper">
            <MapPin size={18} className="select-icon" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="">All States</option>
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
            >
              <option value="">All Deities</option>
              {uniqueDeities.map((deity) => (
                <option key={deity} value={deity}>{deity}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Temples List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading temple directory...</p>
        </div>
      ) : filteredTemples.length === 0 ? (
        <div className="empty-state">
          <p>No temples found matching your criteria. Try widening your search.</p>
        </div>
      ) : (
        <div className="temples-grid">
          {filteredTemples.map((temple) => (
            <div
              key={temple._id}
              className="temple-item-card"
              onClick={() => navigate(`/temples/${temple._id}`)}
            >
              <div className="card-image">
                <img src={temple.imageUrl || 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800'} alt={temple.name} />
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
                  <button className="btn btn-primary btn-sm">Book Ticket</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .temples-container {
          padding-top: 40px;
          padding-bottom: 80px;
          min-height: calc(100vh - 200px);
        }

        .page-header {
          margin-bottom: 30px;
        }

        .page-header h1 {
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--secondary);
          margin-bottom: 8px;
        }

        .page-header p {
          color: var(--text-muted);
          font-size: 1.05rem;
        }

        /* Search Filter Box */
        .search-filter-box {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 40px;
          box-shadow: var(--shadow-sm);
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          color: var(--text-light);
        }

        .search-input-wrapper input {
          width: 100%;
          padding: 14px 16px 14px 50px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          outline: none;
          font-size: 1rem;
          transition: var(--transition);
        }

        .search-input-wrapper input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
        }

        .filters-row {
          display: flex;
          gap: 16px;
        }

        .filter-select-wrapper {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .select-icon {
          position: absolute;
          left: 14px;
          color: var(--text-light);
          pointer-events: none;
        }

        .filter-select-wrapper select {
          width: 100%;
          padding: 10px 16px 10px 42px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          outline: none;
          color: var(--text-main);
          background-color: white;
          appearance: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml;utf8,<svg fill='gray' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 20px;
        }

        .filter-select-wrapper select:focus {
          border-color: var(--primary);
        }

        /* Temples Grid */
        .temples-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
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
          height: 220px;
          position: relative;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .deity-tag {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background-color: var(--secondary);
          color: white;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .card-body h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 8px;
        }

        .card-location {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .card-location .pin {
          color: var(--primary);
        }

        .card-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 20px;
          flex-grow: 1;
        }

        .card-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border);
          padding-top: 14px;
        }

        .card-actions .timing {
          font-size: 0.8rem;
          color: var(--text-light);
          font-weight: 500;
        }

        /* Loading Spinner */
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
          padding: 80px 0;
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
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Temples;
