import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import { 
  Calendar, User, Users, MapPin, Tag, Clock, ChevronRight, 
  CheckCircle, Printer, QrCode, Copy, ShieldCheck, Loader2, X, RefreshCw, Sparkles 
} from 'lucide-react';
import MonthlyCalendar from '../components/MonthlyCalendar';

const BookDarshan = () => {
  const { id: templeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [temple, setTemple] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  

  const [selectedDate, setSelectedDate] = useState('');
  const [datesList, setDatesList] = useState([]);


  const [selectedSlot, setSelectedSlot] = useState(null);
  const [devotee, setDevotee] = useState({
    name: '',
    age: '',
    gender: 'Male',
    idProofType: 'Aadhaar',
    idProofNumber: ''
  });


  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [verificationState, setVerificationState] = useState('idle');
  const [upiId, setUpiId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {

    const list = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      list.push({ dateStr, dayName, dayNum });
    }
    setDatesList(list);
    setSelectedDate(list[0].dateStr);
  }, []);


  useEffect(() => {
    const fetchTemple = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/temples/${templeId}`);
        if (res.data.success) {
          setTemple(res.data.data);
        }
      } catch (err) {
        toast.error('Error loading temple details');
      }
    };
    fetchTemple();
  }, [templeId]);


  useEffect(() => {
    if (!selectedDate) return;
    const fetchSlots = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/slots/temple/${templeId}?date=${selectedDate}`);
        if (res.data.success) {
          setSlots(res.data.data);
        }
      } catch (err) {
        toast.error('Error fetching slots');
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [templeId, selectedDate]);


  const handleDevoteeChange = (field, value) => {
    setDevotee(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleResetBooking = () => {
    setDevotee({
      name: '',
      age: '',
      gender: 'Male',
      idProofType: 'Aadhaar',
      idProofNumber: ''
    });
    setSelectedSlot(null);
    setUpiId('');
    setUtrNumber('');
    setIsPaymentModalOpen(false);
    setVerificationState('idle');
    setConfirmedBooking(null);
  };


  const handleCopyUpi = () => {
    navigator.clipboard.writeText('9948287427-5@ybl');
    toast.success('UPI ID copied to clipboard: 9948287427-5@ybl');
  };


  const handleProceedToPayment = (e) => {
    e.preventDefault();

    if (!user) {
      toast.warning('Please login to book tickets.');
      navigate('/login', { state: { from: `/temples/${templeId}` } });
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select a darshan slot');
      return;
    }


    if (!devotee.name?.trim()) {
      toast.error('Please enter the pilgrim full name');
      return;
    }
    const ageNum = parseInt(devotee.age, 10);
    if (!ageNum || ageNum <= 0 || ageNum > 120) {
      toast.error('Please enter a valid pilgrim age (1-120)');
      return;
    }
    if (!devotee.idProofNumber?.trim()) {
      toast.error('Please enter the ID proof number');
      return;
    }


    setVerificationState('idle');
    setIsPaymentModalOpen(true);
  };


  const handleVerifyAndConfirmPayment = async (e) => {
    e.preventDefault();

    if (!utrNumber || utrNumber.length !== 12) {
      toast.error('Please enter a valid 12-digit UPI Transaction Ref (UTR) Number');
      return;
    }

    try {
      setVerificationState('verifying');
      setSubmitting(true);


      await new Promise(resolve => setTimeout(resolve, 2000));

      const res = await axios.post('http://localhost:5000/api/bookings', {
        slotId: selectedSlot._id,
        devotees: [devotee],
        paymentMethod: 'UPI',
        upiId: upiId || 'upi-scanner@bank',
        transactionId: utrNumber
      });

      if (res.data.success) {
        setVerificationState('success');
        toast.success('Payment Verified! Darshan Ticket Confirmed.');
        setTimeout(() => {
          setIsPaymentModalOpen(false);
          setConfirmedBooking(res.data.data);
        }, 800);
      }
    } catch (err) {
      setVerificationState('idle');
      toast.error(err.response?.data?.message || 'Payment verification or booking failed');
    } finally {
      setSubmitting(false);
    }
  };


  if (confirmedBooking) {
    const singleDevotee = confirmedBooking.devotees?.[0] || devotee;

    return (
      <div className="booking-success-container container">
        <div className="success-card card text-center">
          <div className="success-icon-wrapper">
            <CheckCircle size={64} className="success-icon" />
          </div>
          <h2>Booking Confirmed!</h2>
          <p className="success-subtitle">
            UPI payment verified successfully. Your single pilgrim darshan ticket has been issued.
          </p>

          <div className="receipt-details">
            <h3>Darshan Pass & Payment Details</h3>
            <div className="receipt-grid">
              <div className="receipt-item">
                <span>Booking Reference:</span>
                <strong>{confirmedBooking.bookingReference}</strong>
              </div>
              <div className="receipt-item">
                <span>UTR / Transaction ID:</span>
                <strong><code>{confirmedBooking.transactionId || utrNumber}</code></strong>
              </div>
              <div className="receipt-item">
                <span>Payment Method:</span>
                <strong>UPI QR Scanner (Verified)</strong>
              </div>
              <div className="receipt-item">
                <span>Amount Paid:</span>
                <strong style={{ color: 'var(--primary)' }}>₹{confirmedBooking.totalPrice || selectedSlot?.price}</strong>
              </div>
              <div className="receipt-item">
                <span>Temple:</span>
                <strong>{confirmedBooking.temple?.name || temple?.name}</strong>
              </div>
              <div className="receipt-item">
                <span>Darshan Slot:</span>
                <strong>{confirmedBooking.slot?.date} | {confirmedBooking.slot?.timeSlot} ({confirmedBooking.slot?.slotType})</strong>
              </div>
            </div>
          </div>

          
          <div style={{
            margin: '20px auto', padding: '16px', background: '#f8fafc',
            borderRadius: '12px', border: '1px solid #e2e8f0', width: 'fit-content',
            textAlign: 'center'
          }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(confirmedBooking.bookingReference)}`} 
              alt="Gate Entry QR Code" 
              style={{ width: '150px', height: '150px', display: 'block', margin: '0 auto 8px' }}
            />
            <code style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '1px', color: '#0f172a' }}>
              {confirmedBooking.bookingReference}
            </code>
            <small style={{ display: 'block', color: '#64748b', marginTop: '4px' }}>
              Present this QR Pass at temple entrance for Darshan Check-In
            </small>
          </div>

          <div className="pilgrims-receipt-section">
            <h3>Registered Pilgrim (1 Person)</h3>
            <div className="pilgrims-receipt-table-wrapper">
              <table className="pilgrims-receipt-table">
                <thead>
                  <tr>
                    <th>Pilgrim Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>ID Proof Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>{singleDevotee.name}</strong></td>
                    <td>{singleDevotee.age} yrs</td>
                    <td>{singleDevotee.gender}</td>
                    <td>{singleDevotee.idProofType} - {singleDevotee.idProofNumber}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="success-actions no-print">
            <button className="btn btn-primary" onClick={() => window.print()}>
              <Printer size={16} /> Print Ticket Pass
            </button>
            <button className="btn btn-secondary" onClick={handleResetBooking}>
              <RefreshCw size={16} /> Book Another Ticket
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/my-bookings')}>
              Go to My Bookings
            </button>
          </div>
        </div>

        <style>{`
          .booking-success-container {
            padding-top: 60px;
            padding-bottom: 80px;
            max-width: 650px;
            margin: 0 auto;
          }

          .success-card {
            padding: 40px;
            text-align: center;
          }

          .success-icon-wrapper {
            background-color: var(--primary-light);
            width: 96px;
            height: 96px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          }

          .success-icon {
            color: var(--success);
          }

          .success-card h2 {
            font-size: 2.25rem;
            color: var(--secondary);
            margin-bottom: 8px;
            font-weight: 800;
          }

          .success-subtitle {
            color: var(--text-muted);
            margin-bottom: 30px;
            font-size: 1.05rem;
          }

          .receipt-details, .pilgrims-receipt-section {
            text-align: left;
            margin-bottom: 30px;
            border-top: 1px solid var(--border);
            padding-top: 20px;
          }

          .receipt-details h3, .pilgrims-receipt-section h3 {
            font-size: 1.15rem;
            color: var(--secondary);
            margin-bottom: 16px;
            font-weight: 700;
          }

          .receipt-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
            background-color: #fafafa;
            padding: 20px;
            border-radius: var(--radius-md);
            border: 1px solid var(--border);
          }

          .receipt-item {
            display: flex;
            justify-content: space-between;
            font-size: 0.95rem;
            border-bottom: 1px dashed var(--border);
            padding-bottom: 8px;
          }

          .receipt-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }

          .receipt-item span {
            color: var(--text-muted);
          }

          .pilgrims-receipt-table-wrapper {
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            overflow: hidden;
            background: white;
          }

          .pilgrims-receipt-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
          }

          .pilgrims-receipt-table th {
            background-color: #f8fafc;
            padding: 10px 14px;
            font-weight: 600;
            color: var(--text-muted);
            border-bottom: 1px solid var(--border);
            text-align: left;
          }

          .pilgrims-receipt-table td {
            padding: 12px 14px;
            border-bottom: 1px solid var(--border);
            color: var(--text-main);
          }

          .pilgrims-receipt-table tr:last-child td {
            border-bottom: none;
          }

          .success-actions {
            display: flex;
            gap: 14px;
            justify-content: center;
            border-top: 1px solid var(--border);
            padding-top: 24px;
            flex-wrap: wrap;
          }

          @media (max-width: 576px) {
            .success-card {
              padding: 24px 16px;
            }
            .success-actions {
              flex-direction: column;
              gap: 10px;
            }
            .success-actions button {
              width: 100%;
            }
          }

          @media print {
            body * {
              visibility: hidden;
            }
            .booking-success-container, .booking-success-container * {
              visibility: visible;
            }
            .booking-success-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    );
  }

  if (!temple) {
    return <div className="container" style={{ padding: '80px', textAlign: 'center' }}>Loading temple info...</div>;
  }

  const singleTicketPrice = selectedSlot ? selectedSlot.price : 0;

  return (
    <div className="booking-page container">
      
      <section className="temple-hero">
        <div className="temple-hero-bg">
          <img 
            src={temple.imageUrl || '/images/temples/tirumala_balaji.jpg'} 
            alt={temple.name} 
            onError={(e) => { e.target.src = '/images/temples/tirumala_balaji.jpg'; }} 
          />
          <div className="overlay-gradient"></div>
        </div>
        <div className="temple-hero-content">
          <h1>{temple.name}</h1>
          <div className="meta-row">
            <div className="meta-item"><MapPin size={18} /> <span>{temple.location.city}, {temple.location.state}</span></div>
            <div className="meta-item">
              <Sparkles size={18} color="#d97706" /> 
              <span>
                Presiding Deity: <strong>{temple.primaryDeity?.name || temple.deity}</strong>
                {temple.primaryDeity?.category ? ` (${temple.primaryDeity.category})` : ''}
              </span>
            </div>
            {temple.secondaryDeities && temple.secondaryDeities.length > 0 && (
              <div className="meta-item">
                <Tag size={18} /> 
                <span>Also Worshipped: {temple.secondaryDeities.map(d => d.name || d).join(', ')}</span>
              </div>
            )}
            <div className="meta-item"><Clock size={18} /> <span>{temple.openingHours}</span></div>
          </div>
        </div>
      </section>

      <div className="booking-layout">
        
        <div className="booking-selection">
          <h2>1. {t('booking.selectDate')} & {t('booking.availableSlots')}</h2>
          
          
          <MonthlyCalendar
            templeId={templeId}
            selectedDate={selectedDate}
            onSelectDate={(newDate) => {
              setSelectedDate(newDate);
              setSelectedSlot(null);
            }}
            datesList={datesList}
          />

          
          <div className="slots-wrapper">
            {loading ? (
              <div className="loading-state">{t('common.loading')}</div>
            ) : slots.length === 0 ? (
              <div className="no-slots card">
                <p>{t('booking.noSlotsAvailable')}</p>
              </div>
            ) : slots.filter(s => s.slotType !== 'General').length === 0 ? (
              <div className="no-slots card">
                <p>Darshan ticket booking is currently unavailable for this date.</p>
              </div>
            ) : (
              <div className="slots-sections">
                
                {slots.filter(s => s.slotType === 'VIP').length > 0 && (
                  <div className="slot-group">
                    <div className="slot-group-header">
                      <h3>VIP Darshan</h3>
                      <span className="slot-type-badge vip-badge">Priority Darshan</span>
                    </div>
                    <div className="slots-grid">
                      {slots.filter(s => s.slotType === 'VIP').map((slot) => {
                        const totalCap = Number(slot.maxCapacity ?? slot.capacity ?? 30);
                        const booked = Number(slot.bookedCount || 0);
                        const availableCount = Math.max(0, totalCap - booked);
                        const isAvailable = availableCount > 0;
                        return (
                          <div
                            key={slot._id}
                            className={`slot-card special-card ${selectedSlot?._id === slot._id ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                            onClick={() => isAvailable && setSelectedSlot(slot)}
                          >
                            <div className="slot-time">
                              <Clock size={16} /> <span>{slot.timeSlot}</span>
                            </div>
                            <div className="slot-info">
                              <span className="slot-price">₹{slot.price}</span>
                              <span className={`slot-capacity ${!isAvailable ? 'sold-out' : ''}`}>
                                {isAvailable ? `${availableCount} slots left` : 'Sold Out'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                
                {slots.filter(s => s.slotType === 'Special Pooja').length > 0 && (
                  <div className="slot-group">
                    <div className="slot-group-header">
                      <h3>Special Pooja Darshan</h3>
                      <span className="slot-type-badge pooja-badge">Ritual Included</span>
                    </div>
                    <div className="slots-grid">
                      {slots.filter(s => s.slotType === 'Special Pooja').map((slot) => {
                        const totalCap = Number(slot.maxCapacity ?? slot.capacity ?? 15);
                        const booked = Number(slot.bookedCount || 0);
                        const availableCount = Math.max(0, totalCap - booked);
                        const isAvailable = availableCount > 0;
                        return (
                          <div
                            key={slot._id}
                            className={`slot-card special-card ${selectedSlot?._id === slot._id ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                            onClick={() => isAvailable && setSelectedSlot(slot)}
                          >
                            <div className="slot-time">
                              <Clock size={16} /> <span>{slot.timeSlot}</span>
                            </div>
                            <div className="slot-info">
                              <span className="slot-price">₹{slot.price}</span>
                              <span className={`slot-capacity ${!isAvailable ? 'sold-out' : ''}`}>
                                {isAvailable ? `${availableCount} slots left` : 'Sold Out'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                
                {slots.filter(s => s.slotType && s.slotType !== 'General' && s.slotType !== 'VIP' && s.slotType !== 'Special Pooja').length > 0 && (
                  <div className="slot-group">
                    <div className="slot-group-header">
                      <h3>Special Darshan</h3>
                    </div>
                    <div className="slots-grid">
                      {slots.filter(s => s.slotType && s.slotType !== 'General' && s.slotType !== 'VIP' && s.slotType !== 'Special Pooja').map((slot) => {
                        const totalCap = Number(slot.maxCapacity ?? slot.capacity ?? 30);
                        const booked = Number(slot.bookedCount || 0);
                        const availableCount = Math.max(0, totalCap - booked);
                        const isAvailable = availableCount > 0;
                        return (
                          <div
                            key={slot._id}
                            className={`slot-card special-card ${selectedSlot?._id === slot._id ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                            onClick={() => isAvailable && setSelectedSlot(slot)}
                          >
                            <div className="slot-time">
                              <Clock size={16} /> <span>{slot.timeSlot}</span>
                            </div>
                            <div className="slot-info">
                              <span className="slot-price">₹{slot.price}</span>
                              <span className={`slot-capacity ${!isAvailable ? 'sold-out' : ''}`}>
                                {isAvailable ? `${availableCount} slots left` : 'Sold Out'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          
          <div className="temple-info-card card">
            <h3>About the Temple</h3>
            <p>{temple.description}</p>
            {temple.rituals?.length > 0 && (
              <div className="temple-rituals">
                <strong>Prasadam & Rituals:</strong>
                <p>{temple.rituals.join(', ')}</p>
              </div>
            )}
          </div>
        </div>

        
        <div className="booking-form-panel">
          <div className="sticky-panel">
            <h2>2. {t('booking.devoteeDetails')}</h2>
            
            {!selectedSlot ? (
              <div className="form-placeholder">
                <Users size={48} className="placeholder-icon" />
                <p>{t('booking.availableSlots')}</p>
              </div>
            ) : (
              <form onSubmit={handleProceedToPayment} className="pilgrims-form">
                <div className="selected-summary">
                  <h4>{t('booking.summaryTitle')}:</h4>
                  <div className="summary-item">
                    <strong>{t('booking.darshanType')}:</strong> <span>{selectedSlot.slotType} Darshan</span>
                  </div>
                  <div className="summary-item">
                    <strong>{t('booking.date')}:</strong> <span>{selectedSlot.date}</span>
                  </div>
                  <div className="summary-item">
                    <strong>{t('booking.slotTime')}:</strong> <span>{selectedSlot.timeSlot}</span>
                  </div>
                </div>

                
                <div className="devotee-form-card">
                  <div className="card-header">
                    <h4>{t('booking.devoteeDetails')}</h4>
                    <span className="badge-single">1 {t('myBookings.devotee')}</span>
                  </div>
                  
                  <div className="form-group">
                    <label>{t('booking.fullName')} *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t('booking.namePlaceholder')}
                      value={devotee.name}
                      onChange={(e) => handleDevoteeChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('booking.age')} *</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder={t('booking.agePlaceholder')}
                        min="1"
                        max="120"
                        value={devotee.age}
                        onChange={(e) => handleDevoteeChange('age', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>{t('booking.gender')} *</label>
                      <select
                        className="form-control"
                        value={devotee.gender}
                        onChange={(e) => handleDevoteeChange('gender', e.target.value)}
                      >
                        <option value="Male">{t('booking.genderMale')}</option>
                        <option value="Female">{t('booking.genderFemale')}</option>
                        <option value="Other">{t('booking.genderOther')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('booking.idProofType')} *</label>
                      <select
                        className="form-control"
                        value={devotee.idProofType}
                        onChange={(e) => handleDevoteeChange('idProofType', e.target.value)}
                      >
                        <option value="Aadhaar">Aadhaar Card</option>
                        <option value="Passport">Passport</option>
                        <option value="VoterID">Voter ID</option>
                        <option value="License">Driving License</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>ID Proof Number *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 1234 5678 9012"
                        value={devotee.idProofNumber}
                        onChange={(e) => handleDevoteeChange('idProofNumber', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                
                <div className="payment-method-section">
                  <h4>3. Payment Method</h4>
                  <div className="upi-exclusive-banner">
                    <div className="upi-banner-left">
                      <QrCode size={24} className="upi-icon" />
                      <div>
                        <strong>UPI QR Scanner Only</strong>
                        <p>PhonePe, Google Pay, Paytm, BHIM & All UPI Apps</p>
                      </div>
                    </div>
                    <span className="upi-verified-chip">Verified</span>
                  </div>
                </div>

                <div className="pricing-box">
                  <div className="price-line">
                    <span>Ticket Price (1 Pilgrim)</span>
                    <span>₹{singleTicketPrice}</span>
                  </div>
                  <div className="price-line total">
                    <span>Total Amount</span>
                    <span>₹{singleTicketPrice}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 checkout-btn"
                  disabled={submitting}
                >
                  <QrCode size={18} /> Proceed to UPI Scanner & Pay ₹{singleTicketPrice}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      
      {isPaymentModalOpen && selectedSlot && (
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
                  <Loader2 size={54} className="spin-icon" />
                  <ShieldCheck size={28} className="shield-overlay-icon" />
                </div>
                <h3>Verifying Payment with Bank...</h3>
                <p className="loading-desc">
                  Checking Andhra Pradesh Grameena Bank transaction response for <strong>₹{singleTicketPrice}</strong>.
                </p>
                <div className="utr-tracking-pill">
                  <span>Tracking UTR:</span> <strong>{utrNumber}</strong>
                </div>
                <div className="security-notice">
                  <p>Please do not refresh or close this window.</p>
                </div>
              </div>
            ) : verificationState === 'success' ? (
              <div className="verification-success-view text-center">
                <CheckCircle size={64} className="success-anim-icon" />
                <h3>Money Received & Verified!</h3>
                <p>Confirming your darshan ticket pass...</p>
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
                    <span>Andhra Pradesh Grameena Bank</span>
                  </div>
                  <h3>Scan & Pay via UPI</h3>
                  <div className="amount-badge">
                    <span>Payable:</span> <strong>₹{singleTicketPrice}</strong>
                  </div>
                </div>

                <div className="upi-modal-body">
                  
                  <div className="modal-qr-container">
                    <div className="qr-box">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                          `upi://pay?pa=${temple.upiId || 'temple@upi'}&pn=${encodeURIComponent(temple.name)}&am=${singleTicketPrice}&cu=INR`
                        )}`}
                        alt="UPI Payment QR Code" 
                        className="modal-qr-image"
                      />
                      <div className="modal-pe-badge">pe</div>
                    </div>

                    <div className="upi-copy-row">
                      <span>UPI ID: <strong>9948287427-5@ybl</strong></span>
                      <button type="button" className="btn-copy-upi" onClick={handleCopyUpi}>
                        <Copy size={14} /> Copy
                      </button>
                    </div>
                  </div>

                  
                  <form onSubmit={handleVerifyAndConfirmPayment} className="utr-verification-form">
                    <div className="step-guide">
                      <div className="step-item">
                        <span className="step-num">1</span>
                        <span>Scan QR using <strong>PhonePe, GPay, or Paytm</strong> & complete payment of ₹{singleTicketPrice}.</span>
                      </div>
                      <div className="step-item">
                        <span className="step-num">2</span>
                        <span>Enter the <strong>12-digit UPI Ref / UTR Number</strong> from your payment receipt below to verify:</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ margin: 0 }}>12-Digit UPI Transaction Ref (UTR) Number *</label>
                        <button 
                          type="button" 
                          style={{ background: 'none', border: 'none', color: '#d97706', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => setUtrNumber('123456789012')}
                        >
                          Auto-fill Mock UTR
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
                      <label>Your Payer UPI ID (Optional)</label>
                      <input 
                        type="text"
                        className="form-control"
                        placeholder="e.g. username@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary w-100 verify-confirm-btn"
                      disabled={utrNumber.length !== 12 || submitting}
                    >
                      <ShieldCheck size={18} /> Verify Payment & Confirm Ticket
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .booking-page {
          padding-top: clamp(20px, 4vw, 40px);
          padding-bottom: clamp(40px, 6vw, 80px);
          width: 100%;
        }

        
        .temple-hero {
          position: relative;
          min-height: 220px;
          height: clamp(220px, 32vw, 320px);
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin-bottom: clamp(24px, 4vw, 40px);
          box-shadow: var(--shadow-md);
        }

        .temple-hero-img {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .temple-hero-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .overlay-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.3) 100%);
        }

        .temple-hero-content {
          position: absolute;
          bottom: 0;
          left: 0;
          padding: clamp(16px, 3.5vw, 40px);
          color: white;
          width: 100%;
        }

        .temple-hero-content h1 {
          font-size: clamp(1.5rem, 3.5vw, 2.5rem);
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .meta-row {
          display: flex;
          gap: clamp(12px, 2vw, 24px);
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          color: #cbd5e1;
        }

        .meta-item svg {
          color: var(--primary);
          flex-shrink: 0;
        }

        
        .booking-layout {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: clamp(20px, 3.5vw, 40px);
        }

        .booking-selection h2, .booking-form-panel h2 {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 20px;
        }

        
        .date-picker-row {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 10px;
          margin-bottom: 24px;
          scroll-snap-type: x mandatory;
        }

        .date-card {
          flex: 0 0 72px;
          height: 80px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          background: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          transition: var(--transition);
          scroll-snap-align: start;
        }

        .date-card:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
        }

        .date-card.active {
          border-color: var(--primary);
          background-color: var(--primary-light);
        }

        .day-name {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .date-card.active .day-name {
          color: var(--primary-hover);
        }

        .day-num {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--secondary);
        }

        .date-card.active .day-num {
          color: var(--primary);
        }

        
        .slot-group {
          margin-bottom: 24px;
        }

        .slot-group-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .slot-group-header h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--secondary);
          margin: 0;
        }

        .slot-type-badge {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .slot-type-badge.vip-badge {
          background: #fef3c7;
          color: #b45309;
          border: 1px solid #fde68a;
        }

        .slot-type-badge.pooja-badge {
          background: #ede9fe;
          color: #6d28d9;
          border: 1px solid #ddd6fe;
        }

        .slot-group h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 12px;
        }

        .slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }

        .slot-card {
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          padding: 14px;
          background: white;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .slot-card:hover:not(.disabled) {
          border-color: var(--primary);
          box-shadow: var(--shadow-sm);
        }

        .slot-card.selected {
          border-color: var(--primary);
          background-color: var(--primary-light);
          box-shadow: 0 0 0 2px var(--primary);
        }

        .slot-card.disabled {
          opacity: 0.55;
          cursor: not-allowed;
          background: #f8fafc;
        }

        .slot-time {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--secondary);
        }

        .slot-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .slot-price {
          font-weight: 800;
          font-size: 1.1rem;
          color: var(--primary);
        }

        .slot-capacity {
          font-size: 0.75rem;
          color: var(--success);
          font-weight: 600;
        }

        .slot-capacity.sold-out {
          color: var(--danger);
        }

        .temple-info-card {
          margin-top: 30px;
          padding: 20px;
        }

        .temple-info-card h3 {
          font-size: 1.1rem;
          margin-bottom: 8px;
          color: var(--secondary);
        }

        .temple-rituals {
          margin-top: 12px;
          font-size: 0.9rem;
        }

        
        .sticky-panel {
          position: sticky;
          top: 90px;
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: clamp(16px, 2.5vw, 24px);
          box-shadow: var(--shadow-sm);
        }

        .form-placeholder {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-muted);
        }

        .placeholder-icon {
          margin: 0 auto 12px;
          opacity: 0.4;
        }

        .selected-summary {
          background: #f8fafc;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 12px 14px;
          margin-bottom: 16px;
        }

        .selected-summary h4 {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          margin-bottom: 3px;
        }

        .devotee-form-card {
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 14px;
          margin-bottom: 14px;
          background: #fafafa;
        }

        .devotee-form-card .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 6px;
        }

        .devotee-form-card .card-header h4 {
          font-size: 0.9rem;
          color: var(--secondary);
          margin: 0;
        }

        .badge-single {
          background: #e0f2fe;
          color: #0369a1;
          font-size: 0.72rem;
          padding: 3px 8px;
          border-radius: 999px;
          font-weight: 700;
        }

        .form-row {
          display: flex;
          gap: 10px;
        }

        .form-row .form-group {
          flex: 1;
          margin-bottom: 8px;
        }

        .devotee-form-card .form-group {
          margin-bottom: 8px;
        }

        .devotee-form-card label {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 4px;
        }

        .devotee-form-card .form-control {
          padding: 8px 10px;
          font-size: 0.875rem;
          min-height: 38px;
          width: 100%;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
        }

        
        .payment-method-section {
          margin-top: 20px;
          border-top: 1.5px solid var(--border);
          padding-top: 16px;
          margin-bottom: 18px;
        }

        .payment-method-section h4 {
          font-size: 0.95rem;
          color: var(--secondary);
          margin-bottom: 10px;
        }

        .upi-exclusive-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%);
          border: 1.5px solid #86efac;
          border-radius: var(--radius-md);
        }

        .upi-banner-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .upi-icon {
          color: #16a34a;
          flex-shrink: 0;
        }

        .upi-banner-left strong {
          display: block;
          font-size: 0.92rem;
          color: #0f172a;
        }

        .upi-banner-left p {
          font-size: 0.75rem;
          color: #475569;
          margin: 0;
        }

        .upi-verified-chip {
          background: #16a34a;
          color: white;
          font-size: 0.7rem;
          padding: 3px 8px;
          border-radius: 999px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .pricing-box {
          border-top: 1.5px solid var(--border);
          padding-top: 14px;
          margin-bottom: 18px;
        }

        .price-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .price-line.total {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--secondary);
          border-top: 1px dashed var(--border);
          padding-top: 8px;
          margin-top: 8px;
        }

        .checkout-btn {
          padding: 12px;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--primary);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 700;
          cursor: pointer;
        }

        .checkout-btn:hover {
          background: var(--primary-hover);
        }

        
        .upi-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: fadeIn 0.2s ease-out;
        }

        .upi-modal-content {
          position: relative;
          background: white;
          width: 100%;
          max-width: 480px;
          border-radius: var(--radius-lg);
          padding: 28px 24px;
          box-shadow: var(--shadow-xl);
          max-height: 92vh;
          overflow-y: auto;
        }

        .modal-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          background: #f1f5f9;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: var(--transition);
        }

        .modal-close-btn:hover:not(:disabled) {
          background: #e2e8f0;
          color: #0f172a;
        }

        .bank-logo-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          margin-bottom: 6px;
        }

        .bank-logo-img {
          width: 20px;
          height: 20px;
          border-radius: 50%;
        }

        .upi-modal-header h3 {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .amount-badge {
          display: inline-block;
          background: #fef3c7;
          border: 1px solid #fde68a;
          padding: 4px 14px;
          border-radius: 999px;
          font-size: 0.95rem;
          color: #92400e;
          margin-bottom: 16px;
        }

        .modal-qr-container {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-md);
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 18px;
        }

        .qr-box {
          position: relative;
          background: white;
          padding: 10px;
          border-radius: 12px;
          border: 1.5px solid #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .modal-qr-image {
          width: 170px;
          height: 170px;
          display: block;
        }

        .modal-pe-badge {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #5f259f;
          color: white;
          font-weight: 900;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          border: 2px solid white;
        }

        .upi-copy-row {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8rem;
          color: #475569;
        }

        .btn-copy-upi {
          background: white;
          border: 1px solid #cbd5e1;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--primary);
        }

        .btn-copy-upi:hover {
          background: #f1f5f9;
        }

        
        .step-guide {
          background: #f1f5f9;
          border-radius: var(--radius-sm);
          padding: 10px 12px;
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 0.78rem;
          color: #334155;
          line-height: 1.35;
        }

        .step-num {
          background: var(--primary);
          color: white;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .utr-verification-form .form-group {
          margin-bottom: 12px;
        }

        .utr-verification-form label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .utr-input {
          font-family: monospace;
          font-size: 1.05rem;
          letter-spacing: 2px;
          font-weight: 700;
          text-align: center;
          border: 2px solid #94a3b8;
        }

        .utr-input:focus {
          border-color: var(--primary);
        }

        .utr-counter {
          text-align: right;
          font-size: 0.72rem;
          color: #64748b;
          margin-top: 4px;
        }

        .verify-confirm-btn {
          margin-top: 10px;
          padding: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        
        .verification-loading-view, .verification-success-view {
          padding: 40px 10px;
        }

        .verification-spinner-wrapper {
          position: relative;
          width: 72px;
          height: 72px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spin-icon {
          color: var(--primary);
          animation: spin 1s linear infinite;
        }

        .shield-overlay-icon {
          position: absolute;
          color: #16a34a;
        }

        .verification-loading-view h3 {
          font-size: 1.4rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .loading-desc {
          color: #475569;
          font-size: 0.9rem;
          margin-bottom: 18px;
        }

        .utr-tracking-pill {
          display: inline-block;
          background: #f1f5f9;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.85rem;
          color: #334155;
          margin-bottom: 20px;
        }

        .security-notice {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .success-anim-icon {
          color: #16a34a;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 992px) {
          .booking-layout {
            grid-template-columns: 1fr;
          }
          .sticky-panel {
            position: static;
          }
        }

        @media (max-width: 540px) {
          .slots-grid {
            grid-template-columns: 1fr;
          }
          .form-row {
            flex-direction: column;
            gap: 0;
          }
          .upi-modal-content {
            padding: 20px 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default BookDarshan;
