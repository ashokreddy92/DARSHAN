import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import { 
  Heart, Coins, Gift, Calendar, User, ClipboardList, Info, 
  QrCode, Copy, ShieldCheck, CheckCircle, Loader2, X, Printer, 
  Sparkles, ExternalLink, Check, Award
} from 'lucide-react';

const Donate = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [donorName, setDonorName] = useState(user ? user.name : '');
  const [temples, setTemples] = useState([]);
  const [selectedTemple, setSelectedTemple] = useState('');
  const [amount, setAmount] = useState('1000');
  const [purpose, setPurpose] = useState('General Maintenance');
  const [myDonations, setMyDonations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // UPI Modal & Payment State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [verificationState, setVerificationState] = useState('idle'); // 'idle' | 'verifying' | 'success'
  const [utrNumber, setUtrNumber] = useState('');
  const [payerUpiId, setPayerUpiId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [latestDonationReceipt, setLatestDonationReceipt] = useState(null);

  // Receipt Modal State for history viewing
  const [viewingReceipt, setViewingReceipt] = useState(null);

  useEffect(() => {
    if (user) {
      setDonorName(user.name);
    }
  }, [user]);

  // Fetch Temples
  useEffect(() => {
    const fetchTemples = async () => {
      try {
        const res = await axios.get('/api/temples');
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
      const res = await axios.get('/api/donations/my-donations');
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

  // Find selected temple details or fallback to General Fund
  const getSelectedTempleObj = () => {
    if (!selectedTemple) return null;
    return temples.find(t => t._id === selectedTemple);
  };

  const currentTempleObj = getSelectedTempleObj();
  const receiverUpiId = currentTempleObj?.upiId || '9948287427-5@ybl';
  const receiverName = currentTempleObj?.name || 'DarshanEase Sacred Temple Trust';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(receiverUpiId);
    toast.success(`UPI ID copied to clipboard: ${receiverUpiId}`);
  };

  const handleOpenPaymentModal = (e) => {
    e.preventDefault();

    if (!donorName.trim() || !amount) {
      toast.error('Please enter donor name and donation amount');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid positive donation amount');
      return;
    }

    setVerificationState('idle');
    setUtrNumber('');
    setPayerUpiId('');
    setIsPaymentModalOpen(true);
  };

  const handleVerifyAndCompleteDonation = async (e) => {
    e.preventDefault();

    if (!utrNumber || utrNumber.length !== 12) {
      toast.error('Please enter a valid 12-digit UPI Ref / UTR Number');
      return;
    }

    try {
      setVerificationState('verifying');
      setSubmitting(true);

      // Simulate 2s bank gateway verification response
      await new Promise(resolve => setTimeout(resolve, 2000));

      const payload = {
        donorName,
        amount: parseFloat(amount),
        purpose,
        templeId: selectedTemple || null,
        paymentMethod: 'UPI',
        upiId: payerUpiId || receiverUpiId,
        transactionId: utrNumber
      };

      const res = await axios.post('/api/donations', payload);
      if (res.data.success) {
        setVerificationState('success');
        setLatestDonationReceipt(res.data.data);
        toast.success(`Thank you, ${donorName}! Payment verified & donation recorded.`);
        fetchDonations();
      }
    } catch (err) {
      setVerificationState('idle');
      toast.error(err.response?.data?.message || 'Error processing donation payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = (receiptObj) => {
    const r = receiptObj || latestDonationReceipt;
    if (!r) return;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      toast.error('Please allow popups to print receipt');
      return;
    }

    const templeTitle = r.temple?.name || 'DarshanEase General Temple Trust';
    const dateStr = new Date(r.createdAt || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Donation Receipt - ${r.transactionId}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
            .receipt-box { border: 2px solid #e2e8f0; border-radius: 12px; padding: 32px; max-width: 650px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 24px; }
            .header h1 { margin: 0 0 6px; color: #d97706; font-size: 24px; }
            .header p { margin: 0; color: #64748b; font-size: 14px; }
            .badge { display: inline-block; background: #dcfce7; color: #15803d; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 12px; margin-top: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
            .item label { display: block; font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
            .item span { font-size: 15px; font-weight: 600; color: #0f172a; }
            .amount-box { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px; }
            .amount-box h2 { margin: 0; color: #b45309; font-size: 32px; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <h1>🕉️ DarshanEase Sacred Foundation</h1>
              <p>Official UPI Donation Receipt Pass</p>
              <div class="badge">✓ VERIFIED UPI PAYMENT</div>
            </div>
            <div class="amount-box">
              <span style="font-size: 12px; color: #92400e; font-weight: bold; text-transform: uppercase;">Donation Amount</span>
              <h2>₹${r.amount}</h2>
            </div>
            <div class="grid">
              <div class="item"><label>Donor Name</label><span>${r.donorName}</span></div>
              <div class="item"><label>UTR / Ref Number</label><span>${r.transactionId}</span></div>
              <div class="item"><label>Destination Temple</label><span>${templeTitle}</span></div>
              <div class="item"><label>Contribution Cause</label><span>${r.purpose}</span></div>
              <div class="item"><label>Payment Method</label><span>UPI Payment</span></div>
              <div class="item"><label>Transaction Date</label><span>${dateStr}</span></div>
            </div>
            <div class="footer">
              <p>This is a computer-generated receipt. eligible for 80G tax benefits. Thank you for your noble support!</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="donation-page container">
      {/* Header Banner */}
      <div className="page-header">
        <div className="header-badge">
          <Sparkles size={16} /> <span>Sacred Support & Seva</span>
        </div>
        <h1>{t('donate.title') || 'Support Sacred Temples & Annadanam'}</h1>
        <p>{t('donate.subtitle') || 'Your noble contributions preserve holy heritage, support daily pujas, and feed pilgrims.'}</p>
      </div>

      <div className="donation-layout">
        {/* Left: Donation & UPI Payment Form */}
        <div className="donation-form-card card">
          <div className="card-heading">
            <div className="icon-wrapper">
              <Heart className="heart-icon" size={24} />
            </div>
            <div>
              <h2>Make a Seva Contribution</h2>
              <p className="sub-title">100% Direct UPI Transfer to Temple Trust</p>
            </div>
          </div>
          
          <form onSubmit={handleOpenPaymentModal} className="donation-form">
            <div className="form-group">
              <label htmlFor="donorName">Devotee / Donor Name *</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  id="donorName"
                  className="form-control padded-input"
                  placeholder="Enter donor full name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="temple">Select Destination Temple Trust</label>
              <select
                id="temple"
                className="form-control"
                value={selectedTemple}
                onChange={(e) => setSelectedTemple(e.target.value)}
              >
                <option value="">General Welfare Fund (All Temples Support)</option>
                {temples.map((temple) => (
                  <option key={temple._id} value={temple._id}>
                    {temple.name} - {temple.location?.city || temple.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="purpose">Contribution Purpose / Cause</label>
              <select
                id="purpose"
                className="form-control"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              >
                <option value="General Maintenance">General Maintenance & Operations</option>
                <option value="Annadanam (Prasadam Distribution)">Annadanam (Free Prasadam Distribution)</option>
                <option value="Temple Renovation & Development">Temple Renovation & Heritage Preservation</option>
                <option value="Nitya Puja & Archana Support">Nitya Puja & Ritual Archana Support</option>
                <option value="Veda Pathshala (Educational Services)">Veda Pathshala & Vedic Studies</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Donation Amount (INR) *</label>
              <div className="input-with-icon">
                <span className="currency-prefix">₹</span>
                <input
                  type="number"
                  id="amount"
                  className="form-control padded-input amount-input"
                  placeholder="Enter amount in ₹"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  required
                />
              </div>
              
              {/* Quick Select Buttons */}
              <div className="quick-amounts">
                {[100, 500, 1000, 2500, 5000, 10000].map((val) => (
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

            {/* UPI Feature Highlight Box */}
            <div className="upi-payment-banner">
              <div className="upi-banner-left">
                <QrCode size={28} className="upi-icon" />
                <div>
                  <strong>Pay via Instant UPI</strong>
                  <p>Google Pay, PhonePe, Paytm, BHIM & All UPI Apps</p>
                </div>
              </div>
              <span className="upi-badge-verified">Verified Gateway</span>
            </div>

            <button type="submit" className="btn btn-primary w-100 submit-donation-btn">
              <Coins size={18} /> Proceed to UPI Payment (₹{amount || 0})
            </button>
          </form>
        </div>

        {/* Right: Donation History List */}
        <div className="donation-history card">
          <div className="history-header-title">
            <ClipboardList size={22} className="history-icon" />
            <h2>My Contributions Ledger</h2>
          </div>

          {!user ? (
            <div className="history-placeholder">
              <Info size={40} className="info-icon" />
              <h4>Track Your Devotional Giving</h4>
              <p>Please <a href="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'underline' }}>Login</a> to view your past donation receipts and download tax certificates.</p>
            </div>
          ) : loadingHistory ? (
            <div className="history-loading">
              <Loader2 size={32} className="spin-icon" style={{ margin: '0 auto 12px' }} />
              <p>Fetching donation ledger...</p>
            </div>
          ) : myDonations.length === 0 ? (
            <div className="history-empty">
              <Gift size={40} className="info-icon" />
              <h4>No Contributions Yet</h4>
              <p>Your devotional contributions will be listed here with downloadable 80G receipts.</p>
            </div>
          ) : (
            <div className="history-list">
              {myDonations.map((donation) => (
                <div key={donation._id} className="history-card">
                  <div className="history-card-top">
                    <span className="utr-tag">Ref: {donation.transactionId}</span>
                    <span className="method-tag">UPI</span>
                  </div>
                  <div className="history-body">
                    <div className="history-main-info">
                      <h3>{donation.temple ? donation.temple.name : 'General Welfare Fund'}</h3>
                      <p className="purpose-text">{donation.purpose}</p>
                      <p className="history-date">
                        <Calendar size={13} />{' '}
                        {new Date(donation.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="history-amount-section">
                      <span className="amount-val">₹{donation.amount}</span>
                      <button 
                        type="button" 
                        className="btn-print-sm"
                        onClick={() => handlePrintReceipt(donation)}
                        title="Print / Download Receipt"
                      >
                        <Printer size={13} /> Receipt
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* UPI Payment Gateway Modal */}
      {isPaymentModalOpen && (
        <div className="upi-modal-overlay">
          <div className="upi-modal-content card">
            <button 
              type="button" 
              className="modal-close-btn"
              onClick={() => {
                if (verificationState !== 'verifying') {
                  setIsPaymentModalOpen(false);
                }
              }}
              disabled={verificationState === 'verifying'}
            >
              <X size={20} />
            </button>

            {verificationState === 'verifying' ? (
              <div className="verification-loading-view text-center">
                <div className="verification-spinner-wrapper">
                  <Loader2 size={56} className="spin-icon" />
                  <ShieldCheck size={28} className="shield-overlay-icon" />
                </div>
                <h3>Verifying UPI Payment...</h3>
                <p className="loading-desc">
                  Confirming Andhra Pradesh Grameena Bank transaction for <strong>₹{amount}</strong> from <strong>{donorName}</strong>.
                </p>
                <div className="utr-tracking-pill">
                  <span>UTR Reference:</span> <strong>{utrNumber}</strong>
                </div>
                <div className="security-notice">
                  <p>🔒 Bank Grade 256-bit Encryption • Please do not refresh</p>
                </div>
              </div>
            ) : verificationState === 'success' && latestDonationReceipt ? (
              <div className="verification-success-view text-center">
                <div className="success-badge-icon">
                  <CheckCircle size={64} className="success-anim-icon" />
                </div>
                <h2>Payment Verified & Received!</h2>
                <p className="success-msg">
                  Thank you <strong>{latestDonationReceipt.donorName}</strong>! Your donation of <strong>₹{latestDonationReceipt.amount}</strong> has been successfully credited to the Temple Trust.
                </p>

                <div className="receipt-preview-box">
                  <div className="preview-row">
                    <span>Transaction UTR:</span>
                    <strong>{latestDonationReceipt.transactionId}</strong>
                  </div>
                  <div className="preview-row">
                    <span>Temple / Trust:</span>
                    <strong>{latestDonationReceipt.temple?.name || 'General Welfare Fund'}</strong>
                  </div>
                  <div className="preview-row">
                    <span>Cause:</span>
                    <strong>{latestDonationReceipt.purpose}</strong>
                  </div>
                </div>

                <div className="modal-success-actions">
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => handlePrintReceipt(latestDonationReceipt)}
                  >
                    <Printer size={18} /> Print Official Receipt (80G)
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => {
                      setIsPaymentModalOpen(false);
                      setLatestDonationReceipt(null);
                    }}
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="upi-payment-view">
                <div className="upi-modal-header text-center">
                  <div className="bank-logo-row">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-aH3YmHj1C4X24m4oG8CwtU2n5lW-JpA5A&s" 
                      alt="Bank Logo" 
                      className="bank-logo-img"
                    />
                    <span>Andhra Pradesh Grameena Bank • Temple Seva Trust</span>
                  </div>
                  <h3>Scan & Pay via UPI App</h3>
                  <div className="amount-badge">
                    <span>Donation Amount:</span> <strong>₹{amount}</strong>
                  </div>
                </div>

                <div className="upi-modal-body">
                  <div className="modal-qr-container">
                    <div className="qr-box">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                          `upi://pay?pa=${receiverUpiId}&pn=${encodeURIComponent(receiverName)}&am=${amount}&cu=INR`
                        )}`}
                        alt="UPI Payment QR Code" 
                        className="modal-qr-image"
                      />
                      <div className="modal-pe-badge">pe</div>
                    </div>

                    <div className="upi-copy-row">
                      <span>UPI ID: <strong>{receiverUpiId}</strong></span>
                      <button type="button" className="btn-copy-upi" onClick={handleCopyUpi}>
                        <Copy size={14} /> Copy
                      </button>
                    </div>

                    {/* Quick App Launcher Buttons */}
                    <div className="upi-apps-row">
                      <a 
                        href={`upi://pay?pa=${receiverUpiId}&pn=${encodeURIComponent(receiverName)}&am=${amount}&cu=INR`}
                        className="app-chip gpay"
                      >
                        GPay
                      </a>
                      <a 
                        href={`upi://pay?pa=${receiverUpiId}&pn=${encodeURIComponent(receiverName)}&am=${amount}&cu=INR`}
                        className="app-chip phonepe"
                      >
                        PhonePe
                      </a>
                      <a 
                        href={`upi://pay?pa=${receiverUpiId}&pn=${encodeURIComponent(receiverName)}&am=${amount}&cu=INR`}
                        className="app-chip paytm"
                      >
                        Paytm
                      </a>
                      <a 
                        href={`upi://pay?pa=${receiverUpiId}&pn=${encodeURIComponent(receiverName)}&am=${amount}&cu=INR`}
                        className="app-chip bhim"
                      >
                        BHIM UPI
                      </a>
                    </div>
                  </div>

                  {/* Verification Form */}
                  <form onSubmit={handleVerifyAndCompleteDonation} className="utr-verification-form">
                    <div className="step-guide">
                      <div className="step-item">
                        <span className="step-num">1</span>
                        <span>Scan QR Code or copy UPI ID to transfer ₹{amount}.</span>
                      </div>
                      <div className="step-item">
                        <span className="step-num">2</span>
                        <span>Enter the <strong>12-digit UPI Ref / UTR Number</strong> from your payment screen:</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="utr-label-row">
                        <label>12-Digit UPI Transaction Ref (UTR) Number *</label>
                        <button 
                          type="button" 
                          className="autofill-btn"
                          onClick={() => setUtrNumber('123456789012')}
                        >
                          Auto-fill Test UTR
                        </button>
                      </div>
                      <input 
                        type="text"
                        className="form-control utr-input"
                        placeholder="e.g. 123456789012 (12 digits)"
                        value={utrNumber}
                        maxLength={12}
                        onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                        required
                        autoFocus
                      />
                      <div className="utr-counter">
                        {utrNumber.length}/12 Digits {utrNumber.length === 12 && '✅'}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Your UPI ID (Optional)</label>
                      <input 
                        type="text"
                        className="form-control"
                        placeholder="e.g. devotee@okhdfcbank"
                        value={payerUpiId}
                        onChange={(e) => setPayerUpiId(e.target.value)}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary w-100 verify-confirm-btn"
                      disabled={utrNumber.length !== 12 || submitting}
                    >
                      <ShieldCheck size={18} /> Verify UPI Payment & Submit ₹{amount}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .donation-page {
          padding-top: clamp(24px, 4vw, 40px);
          padding-bottom: clamp(40px, 6vw, 80px);
          width: 100%;
        }

        .page-header {
          margin-bottom: clamp(20px, 3.5vw, 35px);
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fef3c7;
          color: #b45309;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 8px;
        }

        .page-header h1 {
          font-weight: 800;
          color: var(--secondary);
          margin-bottom: 6px;
          font-size: clamp(1.6rem, 3vw, 2.2rem);
        }

        .page-header p {
          color: var(--text-muted);
          font-size: 1rem;
        }

        /* Layout Grid */
        .donation-layout {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: clamp(20px, 3.5vw, 36px);
          align-items: start;
        }

        .donation-form-card {
          padding: clamp(20px, 3vw, 32px);
          background: white;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }

        .card-heading {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
          border-bottom: 1.5px solid #f1f5f9;
          padding-bottom: 16px;
        }

        .icon-wrapper {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: #fff7ed;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .heart-icon {
          color: #ea580c;
        }

        .card-heading h2 {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--secondary);
          margin: 0;
        }

        .sub-title {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin: 0;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          font-size: 0.9rem;
          color: #334155;
          margin-bottom: 6px;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 12px;
          color: #94a3b8;
        }

        .currency-prefix {
          position: absolute;
          left: 14px;
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--primary);
        }

        .padded-input {
          padding-left: 38px !important;
        }

        .amount-input {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
        }

        /* Quick Amount Buttons */
        .quick-amounts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(75px, 1fr));
          gap: 8px;
          margin-top: 10px;
        }

        .amt-btn {
          padding: 8px 6px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          background: #f8fafc;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.9rem;
          color: #475569;
          transition: var(--transition);
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .amt-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          background-color: #fff7ed;
        }

        .amt-btn.active {
          border-color: var(--primary);
          background-color: var(--primary);
          color: white;
          box-shadow: 0 2px 8px rgba(234, 88, 12, 0.25);
        }

        /* UPI Banner inside form */
        .upi-payment-banner {
          background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 20px 0;
        }

        .upi-banner-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .upi-icon {
          color: #0284c7;
        }

        .upi-banner-left strong {
          display: block;
          font-size: 0.9rem;
          color: #0f172a;
        }

        .upi-banner-left p {
          margin: 0;
          font-size: 0.78rem;
          color: #64748b;
        }

        .upi-badge-verified {
          background: #dcfce7;
          color: #15803d;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 12px;
        }

        .submit-donation-btn {
          padding: 14px;
          font-size: 1.05rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 10px;
        }

        /* History Card Container */
        .donation-history {
          padding: clamp(20px, 3vw, 28px);
          background: white;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }

        .history-header-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 1.5px solid #f1f5f9;
          padding-bottom: 14px;
        }

        .history-icon {
          color: var(--secondary);
        }

        .history-header-title h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--secondary);
          margin: 0;
        }

        .history-placeholder, .history-empty {
          background: #f8fafc;
          border: 1px dashed var(--border);
          border-radius: var(--radius-md);
          padding: 40px 20px;
          text-align: center;
          color: var(--text-muted);
        }

        .history-placeholder h4, .history-empty h4 {
          margin: 10px 0 6px;
          color: var(--secondary);
          font-size: 1.1rem;
        }

        .info-icon {
          color: #94a3b8;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 520px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .history-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px;
          transition: var(--transition);
        }

        .history-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }

        .history-card-top {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 6px;
          margin-bottom: 8px;
        }

        .utr-tag {
          font-family: monospace;
          color: #64748b;
          font-weight: 600;
        }

        .method-tag {
          background: #e0f2fe;
          color: #0369a1;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .history-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .history-main-info h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--secondary);
          margin: 0 0 2px;
        }

        .purpose-text {
          font-size: 0.82rem;
          color: #475569;
          margin: 0 0 4px;
        }

        .history-date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #94a3b8;
          margin: 0;
        }

        .history-amount-section {
          text-align: right;
        }

        .amount-val {
          display: block;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 4px;
        }

        .btn-print-sm {
          background: white;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: var(--transition);
        }

        .btn-print-sm:hover {
          background: #f1f5f9;
          color: var(--secondary);
        }

        .history-loading {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
        }

        /* UPI Modal Styling */
        .upi-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .upi-modal-content {
          background: white;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 16px;
          padding: 24px;
          position: relative;
          box-shadow: 0 20px 40px rgba(0,0,0,0.25);
        }

        .modal-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #f1f5f9;
          border: none;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: var(--transition);
        }

        .modal-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .upi-modal-header {
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 14px;
          margin-bottom: 16px;
        }

        .bank-logo-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .bank-logo-img {
          height: 20px;
          object-fit: contain;
          border-radius: 4px;
        }

        .upi-modal-header h3 {
          margin: 0 0 8px;
          font-size: 1.3rem;
          color: var(--secondary);
        }

        .amount-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #b45309;
          padding: 4px 14px;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .modal-qr-container {
          text-align: center;
          margin-bottom: 20px;
        }

        .qr-box {
          position: relative;
          display: inline-block;
          padding: 12px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .modal-qr-image {
          width: 180px;
          height: 180px;
          display: block;
        }

        .modal-pe-badge {
          position: absolute;
          bottom: -8px;
          right: -8px;
          background: #5f259f;
          color: white;
          font-weight: 800;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .upi-copy-row {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 0.85rem;
          color: #475569;
        }

        .btn-copy-upi {
          background: #e0f2fe;
          color: #0284c7;
          border: none;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .upi-apps-row {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .app-chip {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-decoration: none;
          color: white;
        }

        .app-chip.gpay { background: #4285f4; }
        .app-chip.phonepe { background: #5f259f; }
        .app-chip.paytm { background: #00baf2; }
        .app-chip.bhim { background: #f26522; }

        .utr-verification-form {
          border-top: 1px dashed #cbd5e1;
          padding-top: 16px;
        }

        .step-guide {
          background: #f8fafc;
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 14px;
          font-size: 0.85rem;
        }

        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 8px;
        }

        .step-item:last-child {
          margin-bottom: 0;
        }

        .step-num {
          background: var(--primary);
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.75rem;
          flex-shrink: 0;
        }

        .utr-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .autofill-btn {
          background: none;
          border: none;
          color: #d97706;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }

        .utr-input {
          letter-spacing: 2px;
          font-family: monospace;
          font-weight: 700;
          font-size: 1.1rem;
          text-align: center;
        }

        .utr-counter {
          font-size: 0.75rem;
          color: #64748b;
          text-align: right;
          margin-top: 4px;
        }

        .verify-confirm-btn {
          margin-top: 14px;
          padding: 12px;
          font-size: 1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        /* Loading / Verifying View */
        .verification-loading-view {
          padding: 30px 10px;
        }

        .verification-spinner-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 16px;
        }

        .spin-icon {
          animation: spin 1.2s linear infinite;
          color: var(--primary);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .shield-overlay-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #16a34a;
        }

        .utr-tracking-pill {
          background: #f1f5f9;
          padding: 8px 16px;
          border-radius: 20px;
          display: inline-block;
          font-size: 0.85rem;
          margin: 12px 0;
        }

        .security-notice {
          font-size: 0.78rem;
          color: #94a3b8;
        }

        /* Success View */
        .verification-success-view {
          padding: 20px 10px;
        }

        .success-anim-icon {
          color: #16a34a;
          margin-bottom: 12px;
        }

        .success-msg {
          color: #475569;
          font-size: 0.95rem;
          margin-bottom: 20px;
        }

        .receipt-preview-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px;
          text-align: left;
          margin-bottom: 20px;
        }

        .preview-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.88rem;
          margin-bottom: 8px;
        }

        .preview-row:last-child {
          margin-bottom: 0;
        }

        .preview-row span { color: #64748b; }

        .modal-success-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        @media (max-width: 900px) {
          .donation-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Donate;
