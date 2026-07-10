import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Calendar, User, FileText, XCircle, CheckCircle, Printer, Download, MapPin, Clock, ShieldAlert } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null); // Receipt Modal State

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/bookings/my-bookings');
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
    if (!window.confirm('Are you sure you want to cancel this darshan booking?')) {
      return;
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/bookings/${id}/cancel`);
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
        <h1>My Darshan Bookings</h1>
        <p>View your upcoming spiritual visits, print entrance passes, or cancel bookings.</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your reservations...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} className="empty-icon" />
          <p>You haven't booked any darshan tickets yet.</p>
          <p className="sub-empty">Head over to the Temples tab to book slot timings.</p>
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
                </div>

                <div className="pilgrim-table-title">PILGRIMS REGISTERED</div>
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

                  <div className="barcode-box">
                    {/* Simulated barcode graphic */}
                    <div className="barcode-bars">
                      <div className="bar w1"></div><div className="bar w3"></div><div className="bar w2"></div><div className="bar w1"></div>
                      <div className="bar w2"></div><div className="bar w1"></div><div className="bar w4"></div><div className="bar w2"></div>
                      <div className="bar w1"></div><div className="bar w3"></div><div className="bar w1"></div><div className="bar w2"></div>
                      <div className="bar w3"></div><div className="bar w2"></div><div className="bar w1"></div><div className="bar w4"></div>
                    </div>
                    <span className="barcode-text">{selectedTicket._id}</span>
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
          padding-top: 40px;
          padding-bottom: 80px;
          min-height: calc(100vh - 200px);
        }

        .page-header {
          margin-bottom: 35px;
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

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
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
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ref-number {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .ref-number strong {
          color: var(--secondary);
          font-size: 0.95rem;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.8rem;
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
          padding: 20px;
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr;
          gap: 20px;
          align-items: center;
        }

        .temple-info h3 {
          font-size: 1.15rem;
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
          font-size: 0.9rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .slot-info svg {
          color: var(--primary);
        }

        .pilgrims-count, .total-cost {
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .card-actions-row {
          border-top: 1px solid var(--border);
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
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
          padding: 20px;
        }

        .ticket-modal {
          background: white;
          border-radius: var(--radius-lg);
          max-width: 680px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-xl);
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }

        .modal-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--secondary);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.8rem;
          cursor: pointer;
          color: var(--text-light);
          line-height: 1;
        }

        .close-btn:hover {
          color: var(--text-main);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid var(--border);
          background: #fafafa;
        }

        /* Printable ticket layout */
        .print-ticket-wrapper {
          padding: 30px;
          background: #ffffff;
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ticket-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--primary);
        }

        .ticket-logo .logo-icon {
          width: 28px;
          height: 28px;
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
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--secondary);
        }

        .ticket-divider {
          border-top: 2px dashed var(--border);
          margin: 20px 0;
          position: relative;
        }

        .ticket-divider::before, .ticket-divider::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          background-color: var(--background); /* Match backdrop background */
          border-radius: 50%;
          top: -8px;
        }

        .ticket-divider::before {
          left: -38px;
        }

        .ticket-divider::after {
          right: -38px;
        }

        .ticket-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 24px;
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
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--secondary);
        }

        .field-value.font-large {
          font-size: 1.05rem;
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

        .ticket-table {
          width: 100%;
          margin-bottom: 24px;
        }

        .ticket-table th {
          padding: 8px 12px;
          background-color: #f1f5f9;
        }

        .ticket-table td {
          padding: 8px 12px;
          font-size: 0.85rem;
        }

        .ticket-bottom {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-end;
          border-top: 1px solid var(--border);
          padding-top: 20px;
        }

        .rules {
          flex: 1;
        }

        .rules h5 {
          font-size: 0.85rem;
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
          margin-bottom: 4px;
        }

        /* Barcode graphic */
        .barcode-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 180px;
        }

        .barcode-bars {
          display: flex;
          height: 50px;
          align-items: stretch;
          margin-bottom: 6px;
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

        @media (max-width: 768px) {
          .card-body-row {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .ticket-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .ticket-bottom {
            flex-direction: column;
            align-items: center;
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
