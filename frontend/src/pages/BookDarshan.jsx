import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Calendar, User, Users, MapPin, Tag, Clock, CreditCard, ChevronRight, Plus, Trash } from 'lucide-react';

const BookDarshan = () => {
  const { id: templeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [temple, setTemple] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date Selector (Next 7 days)
  const [selectedDate, setSelectedDate] = useState('');
  const [datesList, setDatesList] = useState([]);

  // Booking Flow States
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [devotees, setDevotees] = useState([
    { name: '', age: '', gender: 'Male', idProofType: 'Aadhaar', idProofNumber: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    // Generate dates list
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
    setSelectedDate(list[0].dateStr); // Default to today
  }, []);

  // Fetch Temple Details
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

  // Fetch Slots when Date changes
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

  // Devotee Input Handlers
  const handleDevoteeChange = (index, field, value) => {
    const updated = [...devotees];
    updated[index][field] = value;
    setDevotees(updated);
  };

  const addDevotee = () => {
    if (devotees.length >= 6) {
      toast.warning('Maximum 6 pilgrims can be booked at once.');
      return;
    }
    setDevotees([...devotees, { name: '', age: '', gender: 'Male', idProofType: 'Aadhaar', idProofNumber: '' }]);
  };

  const removeDevotee = (index) => {
    if (devotees.length === 1) return;
    const updated = devotees.filter((_, i) => i !== index);
    setDevotees(updated);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.warning('Please login to book tickets.');
      navigate('/login');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select a darshan slot');
      return;
    }

    // Validate devotees
    for (const dev of devotees) {
      if (!dev.name || !dev.age || !dev.idProofNumber) {
        toast.error('Please fill in all pilgrim details');
        return;
      }
      if (parseInt(dev.age) <= 0 || parseInt(dev.age) > 120) {
        toast.error('Please specify a valid age');
        return;
      }
    }

    // Validate UPI ID
    if (paymentMethod === 'UPI') {
      if (!upiId) {
        toast.error('Please enter your UPI ID');
        return;
      }
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!upiRegex.test(upiId)) {
        toast.error('Invalid UPI ID format. Please use: username@bank');
        return;
      }
    }

    try {
      setSubmitting(true);
      const res = await axios.post('http://localhost:5000/api/bookings', {
        slotId: selectedSlot._id,
        devotees,
        paymentMethod,
        upiId: paymentMethod === 'UPI' ? upiId : undefined
      });

      if (res.data.success) {
        toast.success('Darshan booked successfully!');
        navigate('/my-bookings');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!temple) {
    return <div className="container" style={{ padding: '80px', textAlign: 'center' }}>Loading temple info...</div>;
  }

  return (
    <div className="booking-page container">
      {/* Temple Banner Header */}
      <section className="temple-hero">
        <div className="temple-hero-img">
          <img src={temple.imageUrl || 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800'} alt={temple.name} />
          <div className="overlay-gradient"></div>
        </div>
        <div className="temple-hero-content">
          <h1>{temple.name}</h1>
          <div className="meta-row">
            <div className="meta-item"><MapPin size={18} /> <span>{temple.location.city}, {temple.location.state}</span></div>
            <div className="meta-item"><Tag size={18} /> <span>Deity: {temple.deity}</span></div>
            <div className="meta-item"><Clock size={18} /> <span>{temple.openingHours}</span></div>
          </div>
        </div>
      </section>

      <div className="booking-layout">
        {/* Left Side: Slots and Dates */}
        <div className="booking-selection">
          <h2>1. Select Date & Time Slot</h2>
          
          {/* Horizontal Date Picker */}
          <div className="date-picker-row">
            {datesList.map((item) => (
              <button
                key={item.dateStr}
                type="button"
                className={`date-card ${selectedDate === item.dateStr ? 'active' : ''}`}
                onClick={() => {
                  setSelectedDate(item.dateStr);
                  setSelectedSlot(null); // Reset selected slot on date change
                }}
              >
                <span className="day-name">{item.dayName}</span>
                <span className="day-num">{item.dayNum}</span>
              </button>
            ))}
          </div>

          {/* Slots List */}
          {loading ? (
            <div className="loading-slots">Fetching live slot status...</div>
          ) : slots.length === 0 ? (
            <div className="empty-slots">No slots scheduled for this date. Check another day.</div>
          ) : (
            <div className="slots-wrapper">
              {['General', 'VIP', 'Special Pooja'].map((type) => {
                const typeSlots = slots.filter((s) => s.slotType === type);
                if (typeSlots.length === 0) return null;

                return (
                  <div key={type} className="slot-type-group">
                    <h3 className="slot-group-title">{type} Darshan</h3>
                    <div className="slots-grid">
                      {typeSlots.map((slot) => {
                        const available = slot.maxCapacity - slot.bookedCount;
                        const isSoldOut = available <= 0;
                        const isSelected = selectedSlot?._id === slot._id;

                        return (
                          <div
                            key={slot._id}
                            className={`slot-card ${isSelected ? 'selected' : ''} ${isSoldOut ? 'sold-out' : ''}`}
                            onClick={() => !isSoldOut && setSelectedSlot(slot)}
                          >
                            <div className="slot-time">
                              <Clock size={16} />
                              <span>{slot.timeSlot}</span>
                            </div>
                            <div className="slot-price">
                              {slot.price === 0 ? 'Free' : `₹${slot.price}`}
                            </div>
                            <div className="slot-availability">
                              {isSoldOut ? (
                                <span className="sold-out-txt">Sold Out</span>
                              ) : (
                                <span className="spots-txt">{available} slots left</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Temple Speciality Info */}
          <div className="temple-info-card">
            <h3>About the Temple</h3>
            <p>{temple.description}</p>
            {temple.speciality && (
              <div className="speciality">
                <strong>Prasadam & Rituals:</strong>
                <p>{temple.speciality}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Devotee Registration Form */}
        <div className="booking-form-panel">
          <div className="sticky-panel">
            <h2>2. Pilgrim Details</h2>
            
            {!selectedSlot ? (
              <div className="form-placeholder">
                <Users size={48} className="placeholder-icon" />
                <p>Please select a date and darshan slot to enter devotee details.</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="pilgrims-form">
                <div className="selected-summary">
                  <h4>Selected Slot:</h4>
                  <div className="summary-item">
                    <strong>Type:</strong> <span>{selectedSlot.slotType} Darshan</span>
                  </div>
                  <div className="summary-item">
                    <strong>Date:</strong> <span>{selectedSlot.date}</span>
                  </div>
                  <div className="summary-item">
                    <strong>Time:</strong> <span>{selectedSlot.timeSlot}</span>
                  </div>
                </div>

                <div className="devotees-list">
                  {devotees.map((devotee, index) => (
                    <div key={index} className="devotee-form-card">
                      <div className="card-header">
                        <h4>Pilgrim #{index + 1}</h4>
                        {devotees.length > 1 && (
                          <button
                            type="button"
                            className="remove-dev-btn"
                            onClick={() => removeDevotee(index)}
                          >
                            <Trash size={16} />
                          </button>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Full Name"
                          value={devotee.name}
                          onChange={(e) => handleDevoteeChange(index, 'name', e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Age"
                            value={devotee.age}
                            onChange={(e) => handleDevoteeChange(index, 'age', e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <select
                            className="form-control"
                            value={devotee.gender}
                            onChange={(e) => handleDevoteeChange(index, 'gender', e.target.value)}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <select
                            className="form-control"
                            value={devotee.idProofType}
                            onChange={(e) => handleDevoteeChange(index, 'idProofType', e.target.value)}
                          >
                            <option value="Aadhaar">Aadhaar Card</option>
                            <option value="Passport">Passport</option>
                            <option value="VoterID">Voter ID</option>
                            <option value="License">Driving License</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="ID Proof Number"
                            value={devotee.idProofNumber}
                            onChange={(e) => handleDevoteeChange(index, 'idProofNumber', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn-secondary w-100 add-dev-btn-trigger"
                  onClick={addDevotee}
                >
                  <Plus size={16} /> Add Another Pilgrim
                </button>

                <div className="payment-method-section">
                  <h4>3. Payment Method</h4>
                  <div className="payment-options">
                    <label className={`payment-option-card ${paymentMethod === 'Card' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="Card" 
                        checked={paymentMethod === 'Card'} 
                        onChange={() => setPaymentMethod('Card')} 
                      />
                      <span>Debit/Credit Card</span>
                    </label>
                    <label className={`payment-option-card ${paymentMethod === 'UPI' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="UPI" 
                        checked={paymentMethod === 'UPI'} 
                        onChange={() => setPaymentMethod('UPI')} 
                      />
                      <span>UPI (PhonePe, GPay, PayTM)</span>
                    </label>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="upi-details-box">
                      <div className="qr-container">
                        <p style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-muted)' }}>
                          Scan the QR code to pay using any UPI App, or enter your UPI ID below.
                        </p>
                        
                        <div className="upi-qr-card">
                          <div className="bank-header">
                            <img 
                              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-aH3YmHj1C4X24m4oG8CwtU2n5lW-JpA5A&s" 
                              alt="Bank Logo" 
                              className="bank-logo"
                              style={{ width: '18px', height: '18px', borderRadius: '50%' }}
                            />
                            <span>Andhra Pradesh Grameena Bank</span>
                          </div>
                          
                          <div className="qr-img-wrapper">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                                `upi://pay?pa=9948287427-5@ybl&pn=Andhra%20Pradesh%20Grameena%20Bank&am=${selectedSlot.price * devotees.length}&cu=INR`
                              )}`}
                              alt="UPI QR Code" 
                              className="upi-qr"
                            />
                            <div className="pe-badge">pe</div>
                          </div>
                          
                          <div className="upi-id-label">
                            <span>UPI ID: </span><strong>9948287427-5@ybl</strong>
                          </div>
                        </div>
                      </div>

                      <div className="form-group upi-input-group">
                        <label>Your UPI ID *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. username@bank"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          required={paymentMethod === 'UPI'}
                        />
                        <span className="upi-hint">Must be in the format: username@bank</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pricing-box">
                  <div className="price-line">
                    <span>Tickets (₹{selectedSlot.price} x {devotees.length})</span>
                    <span>₹{selectedSlot.price * devotees.length}</span>
                  </div>
                  <div className="price-line total">
                    <span>Total Amount</span>
                    <span>₹{selectedSlot.price * devotees.length}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 checkout-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Confirming Ticket...' : <><CreditCard size={18} /> Confirm & Book Darshan</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .booking-page {
          padding-top: 40px;
          padding-bottom: 80px;
        }

        /* Temple Hero Banner */
        .temple-hero {
          position: relative;
          height: 320px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin-bottom: 40px;
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
          background: linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.3) 100%);
        }

        .temple-hero-content {
          position: absolute;
          bottom: 0;
          left: 0;
          padding: 40px;
          color: white;
          width: 100%;
        }

        .temple-hero-content h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 12px;
          letter-spacing: -1px;
        }

        .meta-row {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
          color: #cbd5e1;
        }

        .meta-item svg {
          color: var(--primary);
        }

        /* Layout */
        .booking-layout {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 40px;
        }

        .booking-selection h2, .booking-form-panel h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 24px;
        }

        /* Horizontal Date Picker */
        .date-picker-row {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 10px;
          margin-bottom: 30px;
        }

        .date-card {
          flex: 0 0 76px;
          height: 84px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          background: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }

        .date-card:hover {
          border-color: var(--primary);
          background-color: var(--primary-light);
        }

        .date-card.active {
          border-color: var(--primary);
          background-color: var(--primary);
          color: white;
          box-shadow: var(--shadow-md);
        }

        .day-name {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
          opacity: 0.8;
          margin-bottom: 4px;
        }

        .day-num {
          font-size: 1.4rem;
          font-weight: 800;
        }

        /* Slots Grid */
        .slot-type-group {
          margin-bottom: 30px;
        }

        .slot-group-title {
          font-size: 1.1rem;
          color: var(--secondary);
          margin-bottom: 14px;
          font-weight: 700;
          border-left: 4px solid var(--primary);
          padding-left: 10px;
        }

        .slots-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .slot-card {
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 16px;
          background: white;
          cursor: pointer;
          transition: var(--transition);
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 8px;
        }

        .slot-card:hover {
          border-color: var(--primary);
        }

        .slot-card.selected {
          border-color: var(--primary);
          background-color: #fdfaf7;
          box-shadow: 0 0 0 2px var(--primary);
        }

        .slot-card.sold-out {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: #f3f4f6;
        }

        .slot-time {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          color: var(--secondary);
          grid-column: 1 / 3;
        }

        .slot-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--primary);
        }

        .slot-availability {
          text-align: right;
          font-size: 0.85rem;
          font-weight: 500;
          align-self: center;
        }

        .spots-txt {
          color: var(--success);
        }

        .sold-out-txt {
          color: var(--danger);
          font-weight: 600;
        }

        .loading-slots, .empty-slots {
          padding: 40px;
          text-align: center;
          color: var(--text-muted);
          border: 1px dashed var(--border);
          border-radius: var(--radius-sm);
          background: white;
        }

        /* Temple Info Card */
        .temple-info-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 24px;
          margin-top: 40px;
        }

        .temple-info-card h3 {
          margin-bottom: 12px;
          color: var(--secondary);
        }

        .temple-info-card p {
          color: var(--text-muted);
          line-height: 1.6;
        }

        .speciality {
          margin-top: 16px;
          border-top: 1px solid var(--border);
          padding-top: 16px;
        }

        .speciality strong {
          display: block;
          margin-bottom: 4px;
          color: var(--secondary);
        }

        /* Right Side: Form Panel */
        .sticky-panel {
          position: sticky;
          top: 96px;
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 24px;
          box-shadow: var(--shadow-sm);
        }

        .form-placeholder {
          text-align: center;
          padding: 80px 20px;
          color: var(--text-light);
        }

        .placeholder-icon {
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .selected-summary {
          background-color: var(--background);
          padding: 16px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          margin-bottom: 20px;
        }

        .selected-summary h4 {
          margin-bottom: 8px;
          font-size: 0.95rem;
          color: var(--secondary);
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          margin-bottom: 4px;
        }

        .summary-item strong {
          color: var(--text-muted);
        }

        .devotees-list {
          max-height: 380px;
          overflow-y: auto;
          margin-bottom: 20px;
          padding-right: 4px;
        }

        .devotee-form-card {
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 16px;
          margin-bottom: 16px;
          background: #fafafa;
        }

        .devotee-form-card .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 8px;
        }

        .devotee-form-card .card-header h4 {
          font-size: 0.95rem;
          color: var(--secondary);
        }

        .remove-dev-btn {
          background: none;
          border: none;
          color: var(--danger);
          cursor: pointer;
        }

        .form-row {
          display: flex;
          gap: 12px;
        }

        .form-row .form-group {
          flex: 1;
        }

        .devotee-form-card .form-group {
          margin-bottom: 10px;
        }

        .devotee-form-card .form-control {
          padding: 8px 12px;
          font-size: 0.9rem;
        }

        .add-dev-btn-trigger {
          margin-bottom: 20px;
        }

        .pricing-box {
          border-top: 1.5px solid var(--border);
          padding-top: 16px;
          margin-bottom: 20px;
        }

        .price-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .price-line.total {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--secondary);
          border-top: 1px dashed var(--border);
          padding-top: 8px;
          margin-top: 8px;
        }

        .checkout-btn {
          padding: 14px;
          font-size: 1.05rem;
        }

        /* Payment Method CSS */
        .payment-method-section {
          margin-top: 24px;
          border-top: 1.5px solid var(--border);
          padding-top: 20px;
          margin-bottom: 20px;
        }

        .payment-method-section h4 {
          font-size: 1rem;
          color: var(--secondary);
          margin-bottom: 12px;
        }

        .payment-options {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .payment-option-card {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-muted);
          transition: var(--transition);
        }

        .payment-option-card.active {
          border-color: var(--primary);
          background-color: var(--primary-light);
          color: var(--primary-hover);
        }

        .payment-option-card input {
          margin: 0;
        }

        .upi-details-box {
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 16px;
          background-color: #fafafa;
          margin-bottom: 16px;
          animation: slideDown 0.2s ease-out;
        }

        .upi-qr-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-md);
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 240px;
          margin: 10px auto 20px;
          box-shadow: var(--shadow-sm);
        }

        .bank-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #475569;
          margin-bottom: 12px;
          text-align: center;
        }

        .qr-img-wrapper {
          position: relative;
          padding: 8px;
          background: white;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
        }

        .upi-qr {
          width: 140px;
          height: 140px;
          display: block;
        }

        .pe-badge {
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

        .upi-id-label {
          margin-top: 12px;
          font-size: 0.75rem;
          color: #64748b;
        }

        .upi-input-group {
          text-align: left;
        }

        .upi-hint {
          display: block;
          font-size: 0.75rem;
          color: var(--text-light);
          margin-top: 4px;
        }

        @media (max-width: 992px) {
          .booking-layout {
            grid-template-columns: 1fr;
          }
          .sticky-panel {
            position: static;
          }
        }

        @media (max-width: 480px) {
          .slots-grid {
            grid-template-columns: 1fr;
          }
          .form-row {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default BookDarshan;
