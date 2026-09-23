import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import { Calendar, User, FileText, XCircle, CheckCircle, Printer, Download, MapPin, Clock, ShieldAlert } from 'lucide-react';

const MyBookings = () => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null); // Receipt Modal State

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      toast.error('Error fetching your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    if (!window.confirm(t('myBookings.confirmCancelPrompt'))) {
      return;
    }

    try {
      const res = await axios.put(`/api/bookings/${id}/cancel`);
      if (res.data.success) {
        toast.success('Booking cancelled successfully');
        fetchBookings(); // Refresh listing
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bookings-container container">
      <div className="page-header">
        <h1>{t('myBookings.title')}</h1>
        <p>{t('myBookings.subtitle')}</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{t('myBookings.loading')}</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} className="empty-icon" />
          <p>{t('myBookings.noBookingsTitle')}</p>
          <p className="sub-empty">{t('myBookings.noBookingsSubtitle')}</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => {
            const isConfirmed = booking.status === 'Confirmed';
            const slot = booking.slot;
            const temple = booking.temple;

            return (
              <div key={booking._id} className={`booking-card ${booking.status.toLowerCase()}`}>
                <div className="card-header-row">
                  <div className="ref-number">
                    <span>Reference:</span> <strong>{booking.bookingReference}</strong>
                  </div>
                  <div className={`status-badge ${booking.status.toLowerCase()}`}>
                    {isConfirmed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    <span>{booking.status}</span>
                  </div>
                </div>

                <div className="card-body-row">
                  <div className="temple-info">
                    <h3>{temple.name}</h3>
                    <p className="loc"><MapPin size={16} /> {temple.location.city}, {temple.location.state}</p>
                  </div>

                  <div className="slot-info">
                    <p><Calendar size={16} /> <strong>Date:</strong> {slot.date}</p>
                    <p><Clock size={16} /> <strong>Slot:</strong> {slot.timeSlot} ({slot.slotType})</p>
                  </div>

                  <div className="pilgrims-count">
                    <strong>Pilgrims:</strong> {booking.devotees.length} Devotee(s)
                  </div>

                  <div className="total-cost">
                    <strong>Total Cost:</strong> ₹{booking.totalPrice}
                  </div>
                </div>

                <div className="card-actions-row">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedTicket(booking)}
                  >
                    <Printer size={16} /> View & Print Ticket
                  </button>

                  {isConfirmed && (
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancelBooking(booking._id)}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Receipt Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header no-print">
              <h3>Darshan Entrance Pass</h3>
              <button className="close-btn" onClick={() => setSelectedTicket(null)}>×</button>
            </div>

            <div className="print-ticket-wrapper" id="print-area">
              {/* Actual Printable Ticket */}
              <div className="ticket-header">
                <div className="ticket-logo">
                  <svg className="logo-icon" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2L2 9h20L12 2zM4 9v11h16V9M12 9v11M8 12h2v4H8zM14 12h2v4h-2z" />
                  </svg>
                  <span>DarshanEase Ticket</span>
                </div>
                <div className="booking-ref-box">
                  <span className="label">REFERENCE NO</span>
                  <span className="ref">{selectedTicket.bookingReference}</span>
                </div>
              </div>

              <div className="ticket-divider"></div>

              <div className="ticket-body">
                <div className="ticket-grid">
                  <div>
                    <span className="field-label">TEMPLE</span>
                    <span className="field-value font-large">{selectedTicket.temple.name}</span>
                  </div>
                  <div>
                    <span className="field-label">DEITY</span>
                    <span className="field-value">{selectedTicket.temple.deity}</span>
                  </div>
                  <div>
                    <span className="field-label">DARSHAN DATE</span>
                    <span className="field-value font-large">{selectedTicket.slot.date}</span>
                  </div>
                  <div>
                    <span className="field-label">TIME SLOT</span>
                    <span className="field-value">{selectedTicket.slot.timeSlot}</span>
                  </div>
                  <div>
                    <span className="field-label">SLOT CATEGORY</span>
                    <span className="field-value">{selectedTicket.slot.slotType}</span>
                  </div>
                  <div>
                    <span className="field-label">STATUS</span>
                    <span className={`field-value status-${selectedTicket.status.toLowerCase()}`}>{selectedTicket.status}</span>
                  </div>
                  {selectedTicket.transactionId && (
                    <div>
                      <span className="field-label">TRANSACTION ID</span>
                      <span className="field-value"><code>{selectedTicket.transactionId}</code></span>
                    </div>
                  )}
                  {selectedTicket.paymentMethod && (
                    <div>
                      <span className="field-label">PAYMENT METHOD</span>
                      <span className="field-value">{selectedTicket.paymentMethod} {selectedTicket.upiId ? `(${selectedTicket.upiId})` : ''}</span>
                    </div>
                  )}
                </div>

                <div className="pilgrim-table-title">PILGRIMS REGISTERED</div>
                <div className="ticket-table-wrapper">
                  <table className="ticket-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>ID Proof Type</th>
                        <th>ID Proof Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTicket.devotees.map((dev, idx) => (
                        <tr key={idx}>
                          <td>{dev.name}</td>
                          <td>{dev.age}</td>
                          <td>{dev.gender}</td>
                          <td>{dev.idProofType}</td>
                          <td>{dev.idProofNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="ticket-bottom">
                  <div className="rules">
                    <h5>Important Instructions:</h5>
                    <ul>
                      <li>Please report at the entry queue 30 minutes before your slot timings.</li>
                      <li>Carry the physical ID proof entered during booking. No soft copies.</li>
                      <li>Traditional dress code is mandatory (Dhoti/Kurta for men, Saree/Salwar for women).</li>
                      <li>Mobile phones and electronic items are strictly prohibited inside the sanctum.</li>
                    </ul>
                  </div>

                  <div className="barcode-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(selectedTicket.bookingReference)}`}
                      alt="Gate Entry QR Code"
                      style={{ width: '130px', height: '130px', display: 'block', marginBottom: '6px' }}
                    />
                    <span className="barcode-text" style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '1px' }}>
                      {selectedTicket.bookingReference}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions no-print">
              <button className="btn btn-primary" onClick={handlePrint}>
                <Printer size={16} /> Print Entrance Pass
              </button>
              <button className="btn btn-outline-dark" onClick={() => setSelectedTicket(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .bookings-container {
          padding-top: clamp(24px, 4vw, 40px);
          padding-bottom: clamp(40px, 6vw, 80px);
          min-height: calc(100vh - 200px);
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

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* Booking Cards */
        .booking-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .booking-card.cancelled {
          border-left: 5px solid var(--danger);
        }

        .booking-card.confirmed {
          border-left: 5px solid var(--success);
        }

        .card-header-row {
          background-color: #fafafa;
          padding: 12px 18px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ref-number {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .ref-number strong {
          color: var(--secondary);
          font-size: 0.9rem;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.confirmed {
          background-color: #ecfdf5;
          color: var(--success);
        }

        .status-badge.cancelled {
          background-color: #fef2f2;
          color: var(--danger);
        }

        .card-body-row {
          padding: clamp(14px, 2.5vw, 20px);
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr;
          gap: 16px;
          align-items: center;
        }

        .temple-info h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 4px;
        }

        .temple-info .loc {
          font-size: 0.85rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .slot-info p {
          font-size: 0.875rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .slot-info svg {
          color: var(--primary);
          flex-shrink: 0;
        }

        .pilgrims-count, .total-cost {
          font-size: 0.875rem;
          color: var(--text-main);
        }

        .card-actions-row {
          border-top: 1px solid var(--border);
          padding: 12px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          background: #fafafa;
        }

        .card-actions-row .actions-right {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .empty-icon {
          color: var(--text-light);
          margin-bottom: 16px;
        }
        
        .sub-empty {
          font-size: 0.85rem;
          opacity: 0.8;
          margin-top: 4px;
        }

        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .ticket-modal {
          background: white;
          border-radius: var(--radius-lg);
          max-width: 660px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          box-shadow: var(--shadow-xl);
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .modal-header h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--secondary);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.6rem;
          cursor: pointer;
          color: var(--text-light);
          line-height: 1;
          padding: 4px;
        }

        .close-btn:hover {
          color: var(--text-main);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 20px;
          border-top: 1px solid var(--border);
          background: #fafafa;
          flex-wrap: wrap;
        }

        /* Printable ticket layout */
        .print-ticket-wrapper {
          padding: clamp(16px, 3vw, 28px);
          background: #ffffff;
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .ticket-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary);
        }

        .ticket-logo .logo-icon {
          width: 26px;
          height: 26px;
        }

        .booking-ref-box {
          text-align: right;
        }

        .booking-ref-box .label {
          font-size: 0.65rem;
          color: var(--text-light);
          font-weight: 700;
          letter-spacing: 0.5px;
          display: block;
        }

        .booking-ref-box .ref {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--secondary);
        }

        .ticket-divider {
          border-top: 2px dashed var(--border);
          margin: 16px 0;
          position: relative;
        }

        .ticket-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .field-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-light);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .field-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--secondary);
        }

        .field-value.font-large {
          font-size: 1rem;
          font-weight: 700;
          color: var(--primary);
        }

        .field-value.status-confirmed {
          color: var(--success);
        }

        .field-value.status-cancelled {
          color: var(--danger);
        }

        .pilgrim-table-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .ticket-table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin-bottom: 20px;
        }

        .ticket-table {
          width: 100%;
          min-width: 440px;
          margin-bottom: 0;
        }

        .ticket-table th {
          padding: 8px 10px;
          background-color: #f1f5f9;
          font-size: 0.8rem;
        }

        .ticket-table td {
          padding: 8px 10px;
          font-size: 0.825rem;
        }

        .ticket-bottom {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-end;
          border-top: 1px solid var(--border);
          padding-top: 16px;
          flex-wrap: wrap;
        }

        .rules {
          flex: 1;
          min-width: 220px;
        }

        .rules h5 {
          font-size: 0.825rem;
          color: var(--secondary);
          margin-bottom: 6px;
        }

        .rules ul {
          list-style: disc;
          padding-left: 16px;
          font-size: 0.725rem;
          color: var(--text-muted);
        }

        .rules ul li {
          margin-bottom: 3px;
        }

        /* Barcode graphic */
        .barcode-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 160px;
        }

        .barcode-bars {
          display: flex;
          height: 44px;
          align-items: stretch;
          margin-bottom: 4px;
        }

        .bar {
          background-color: #000;
          margin-right: 2px;
        }

        .bar.w1 { width: 1px; }
        .bar.w2 { width: 2px; }
        .bar.w3 { width: 3px; }
        .bar.w4 { width: 4px; }

        .barcode-text {
          font-family: monospace;
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        @media (max-width: 900px) {
          .card-body-row {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
        }

        @media (max-width: 600px) {
          .card-body-row {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .card-actions-row {
            flex-direction: column;
            align-items: stretch;
          }
          .card-actions-row .actions-right {
            width: 100%;
            justify-content: flex-end;
          }
          .ticket-grid {
            grid-template-columns: 1fr 1fr;
          }
          .ticket-bottom {
            flex-direction: column;
            align-items: center;
            text-align: left;
          }
          .rules {
            width: 100%;
          }
        }

        /* Print Override Styles */
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .modal-overlay {
            background: none;
            position: static;
            padding: 0;
          }
          .ticket-modal {
            max-height: none;
            overflow: visible;
            box-shadow: none;
            width: 100%;
            max-width: 100%;
          }
        }

        /* Print Override Styles */
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .modal-overlay {
            background: none;
            position: static;
            padding: 0;
          }
          .ticket-modal {
            max-height: none;
            overflow: visible;
            box-shadow: none;
            width: 100%;
            max-width: 100%;
          }
          .ticket-divider::before, .ticket-divider::after {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MyBookings;
