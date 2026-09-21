import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import { Heart, Coins, Gift, Calendar, User, ClipboardList, Info } from 'lucide-react';

const Donate = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [donorName, setDonorName] = useState(user ? user.name : '');
  const [temples, setTemples] = useState([]);
  const [selectedTemple, setSelectedTemple] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('General Maintenance');
  const [myDonations, setMyDonations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Sync donor name with logged-in user name
    if (user) {
      setDonorName(user.name);
    }
  }, [user]);

  // Fetch Temples
  useEffect(() => {
    const fetchTemples = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/temples');
        if (res.data.success) {
          setTemples(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching temples:', err.message);
      }
    };
    fetchTemples();
  }, []);

  // Fetch Donation History
  const fetchDonations = async () => {
    if (!user) return;
    try {
      setLoadingHistory(true);
      const res = await axios.get('http://localhost:5000/api/donations/my-donations');
      if (res.data.success) {
        setMyDonations(res.data.data);
      }
    } catch (err) {
      console.error('Error loading donations:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [user]);

  const handleAmountClick = (value) => {
    setAmount(value);
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();

    if (!donorName || !amount) {
      toast.error('Please enter donor name and amount');
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        donorName,
        amount: parseFloat(amount),
        purpose,
        templeId: selectedTemple || null
      };

      const res = await axios.post('http://localhost:5000/api/donations', payload);
      if (res.data.success) {
        toast.success(`Thank you, ${donorName}! Donation received successfully.`);
        setAmount('');
        // Reload list
        fetchDonations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing donation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="donation-page container">
      <div className="page-header">
        <h1>{t('donate.title')}</h1>
        <p>{t('donate.subtitle')}</p>
      </div>

      <div className="donation-layout">
        {/* Left: Donation Form */}
        <div className="donation-form-card card">
          <div className="card-heading">
            <Heart className="heart-icon" size={24} />
            <h2>Contributions Form</h2>
          </div>
          
          <form onSubmit={handleDonationSubmit} className="donation-form">
            <div className="form-group">
              <label htmlFor="donorName">Donor Name *</label>
              <input
                type="text"
                id="donorName"
                className="form-control"
                placeholder="Enter full name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="temple">Select Destination Temple</label>
              <select
                id="temple"
                className="form-control"
                value={selectedTemple}
                onChange={(e) => setSelectedTemple(e.target.value)}
              >
                <option value="">General Fund (All Temples Support)</option>
                {temples.map((temple) => (
                  <option key={temple._id} value={temple._id}>
                    {temple.name} - {temple.location.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="purpose">Contribution Purpose</label>
              <select
                id="purpose"
                className="form-control"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              >
                <option value="General Maintenance">General Maintenance</option>
                <option value="Annadanam (Prasadam Distribution)">Annadanam (Prasadam Distribution)</option>
                <option value="Temple Renovation & Development">Temple Renovation & Development</option>
                <option value="Veda Pathshala (Educational Services)">Veda Pathshala (Educational Services)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Donation Amount (INR) *</label>
              <input
                type="number"
                id="amount"
                className="form-control"
                placeholder="Enter amount in ₹"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              
              {/* Quick Select Buttons */}
              <div className="quick-amounts">
                {[500, 1000, 2500, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`amt-btn ${amount === String(val) ? 'active' : ''}`}
                    onClick={() => handleAmountClick(String(val))}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 submit-donation-btn" disabled={submitting}>
              {submitting ? 'Processing Payment...' : <><Coins size={18} /> Make Donation</>}
            </button>
          </form>
        </div>

        {/* Right: Donation History List */}
        <div className="donation-history">
          <h2>My Past Contributions</h2>

          {!user ? (
            <div className="history-placeholder">
              <Info size={36} className="info-icon" />
              <p>Please <a href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login</a> to view your past donation receipts and transaction history.</p>
            </div>
          ) : loadingHistory ? (
            <div className="history-loading">Fetching donation ledger...</div>
          ) : myDonations.length === 0 ? (
            <div className="history-empty">
              <ClipboardList size={36} className="info-icon" />
              <p>You haven't recorded any contributions yet.</p>
            </div>
          ) : (
            <div className="history-list">
              {myDonations.map((donation) => (
                <div key={donation._id} className="history-card">
                  <div className="history-header">
                    <strong>Transaction ID:</strong> <span>{donation.transactionId}</span>
                  </div>
                  <div className="history-body">
                    <p>
                      <strong>Destination:</strong>{' '}
                      {donation.temple ? donation.temple.name : 'General Fund'}
                    </p>
                    <p>
                      <strong>Purpose:</strong> {donation.purpose}
                    </p>
                    <p className="history-date">
                      <Calendar size={14} />{' '}
                      {new Date(donation.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="history-amount">₹{donation.amount}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .donation-page {
          padding-top: clamp(24px, 4vw, 40px);
          padding-bottom: clamp(40px, 6vw, 80px);
          width: 100%;
        }

        .page-header {
          margin-bottom: clamp(20px, 3.5vw, 35px);
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

        /* Layout Grid */
        .donation-layout {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: clamp(20px, 3.5vw, 40px);
        }

        .donation-form-card {
          padding: clamp(16px, 3vw, 30px);
        }

        .card-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 1.5px solid var(--border);
          padding-bottom: 12px;
        }

        .card-heading h2 {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--secondary);
        }

        .heart-icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        /* Quick Amount Selection */
        .quick-amounts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(68px, 1fr));
          gap: 8px;
          margin-top: 8px;
        }

        .amt-btn {
          padding: 8px 6px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          background: white;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-muted);
          transition: var(--transition);
          min-height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .amt-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          background-color: var(--primary-light);
        }

        .amt-btn.active {
          border-color: var(--primary);
          background-color: var(--primary);
          color: white;
        }

        .submit-donation-btn {
          padding: 12px;
          font-size: 1rem;
          margin-top: 10px;
        }

        /* History Column */
        .donation-history h2 {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 20px;
        }

        .history-placeholder, .history-empty {
          background: white;
          border: 1px dashed var(--border);
          border-radius: var(--radius-md);
          padding: 40px 20px;
          text-align: center;
          color: var(--text-muted);
        }

        .info-icon {
          color: var(--text-light);
          margin-bottom: 12px;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-height: 480px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding-right: 4px;
        }

        .history-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 14px;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 10px;
          align-items: center;
          position: relative;
        }

        .history-header {
          grid-column: 1 / 3;
          font-size: 0.75rem;
          color: var(--text-light);
          border-bottom: 1px solid #f3f4f6;
          padding-bottom: 6px;
          margin-bottom: 4px;
          word-break: break-all;
        }

        .history-body p {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 2px;
        }

        .history-body p strong {
          color: var(--secondary);
        }

        .history-date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--text-light);
          margin-top: 4px;
        }

        .history-amount {
          justify-self: end;
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--primary);
        }

        .history-loading {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
        }

        @media (max-width: 900px) {
          .donation-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .history-card {
            grid-template-columns: 1fr;
          }
          .history-header {
            grid-column: 1 / 2;
          }
          .history-amount {
            justify-self: start;
            margin-top: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default Donate;
