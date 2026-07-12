import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Calendar, Plus, Trash2, ShieldAlert, Landmark, Ticket } from 'lucide-react';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  
  const [temples, setTemples] = useState([]);
  const [selectedTemple, setSelectedTemple] = useState('');
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Slot scheduling form state
  const [slotForm, setSlotForm] = useState({
    date: '', timeSlot: '06:00 AM - 08:00 AM', maxCapacity: 50, price: 0, slotType: 'General'
  });
  const [showSlotForm, setShowSlotForm] = useState(false);

  // Fetch organizer's temples and details
  const fetchOrganizerData = async () => {
    try {
      setLoading(true);
      const templesRes = await axios.get('http://localhost:5000/api/temples');
      if (templesRes.data.success) {
        // Filter temples created by this organizer
        const ownedTemples = templesRes.data.data.filter(
          (t) => t.createdBy.toString() === user._id.toString() || user.role === 'ADMIN'
        );
        setTemples(ownedTemples);
        if (ownedTemples.length > 0) {
          setSelectedTemple(ownedTemples[0]._id);
        }
      }
    } catch (err) {
      toast.error('Error fetching organizer details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerData();
  }, [user]);

  // Fetch Slots and Bookings when Selected Temple changes
  const fetchTempleDetails = async () => {
    if (!selectedTemple) return;
    try {
      // Fetch Slots
      const slotsRes = await axios.get(`http://localhost:5000/api/slots/temple/${selectedTemple}`);
      if (slotsRes.data.success) {
        setSlots(slotsRes.data.data);
      }

      // Fetch Bookings for Temple
      const bookingsRes = await axios.get(`http://localhost:5000/api/bookings/temple/${selectedTemple}`);
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching temple slots/bookings:', err.message);
    }
  };

  useEffect(() => {
    if (selectedTemple) {
      fetchTempleDetails();
    }
  }, [selectedTemple]);

  // Create Darshan Slot
  const handleSlotSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/slots', {
        ...slotForm,
        temple: selectedTemple
      });
      if (res.data.success) {
        toast.success('Darshan slot scheduled successfully!');
        setShowSlotForm(false);
        setSlotForm({ date: '', timeSlot: '06:00 AM - 08:00 AM', maxCapacity: 50, price: 0, slotType: 'General' });
        fetchTempleDetails(); // Reload slots
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule slot');
    }
  };

  // Delete Slot
  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/slots/${id}`);
      if (res.data.success) {
        toast.success('Slot removed');
        fetchTempleDetails();
      }
    } catch (err) {
      toast.error('Failed to delete slot');
    }
  };

  const handleVerifyPayment = async (bookingId) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/bookings/${bookingId}/verify`);
      if (res.data.success) {
        toast.success('Payment verified and booking confirmed!');
        fetchTempleDetails(); // Reload bookings
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleRejectPayment = async (bookingId) => {
    if (!window.confirm('Reject this payment and cancel the booking?')) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/bookings/${bookingId}/reject`);
      if (res.data.success) {
        toast.warning('Payment rejected and booking cancelled');
        fetchTempleDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '80px', textAlign: 'center' }}>Syncing dashboard logs...</div>;
  }

  if (temples.length === 0) {
    return (
      <div className="container error-panel card text-center" style={{ margin: '80px auto', maxWidth: '600px' }}>
        <ShieldAlert size={48} className="warn-icon" />
        <h2>No Temples Assigned</h2>
        <p>You currently do not manage any temples. Please contact administrators to list your temple.</p>
        <style>{`
          .error-panel { padding: 40px; }
          .warn-icon { color: var(--warning); margin-bottom: 20px; }
          .text-center { text-align: center; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="organizer-container container">
      {/* Page Header */}
      <div className="org-header">
        <div className="title-row">
          <Landmark className="org-icon" />
          <h1>Organizer Dashboard</h1>
        </div>
        <p>Schedule darshan calendars and manage devotees visiting your temples.</p>
      </div>

      {/* Select active temple */}
      <div className="temple-selector-card card">
        <label>Active Temple Management:</label>
        <select
          value={selectedTemple}
          onChange={(e) => setSelectedTemple(e.target.value)}
          className="form-control"
        >
          {temples.map((t) => (
            <option key={t._id} value={t._id}>{t.name} - {t.location.city}</option>
          ))}
        </select>
      </div>

      {/* Dashboard Sections */}
      <div className="dashboard-sections">
        {/* Left: Manage slots list */}
        <div className="slots-management">
          <div className="section-header">
            <h2>Darshan Schedules</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowSlotForm(!showSlotForm)}>
              <Plus size={16} /> Add Slot
            </button>
          </div>

          {showSlotForm && (
            <form onSubmit={handleSlotSubmit} className="slot-form card">
              <h3>Create New Slot</h3>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={slotForm.date}
                  onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Time Slot *</label>
                <select
                  className="form-control"
                  value={slotForm.timeSlot}
                  onChange={(e) => setSlotForm({ ...slotForm, timeSlot: e.target.value })}
                >
                  <option value="06:00 AM - 08:00 AM">06:00 AM - 08:00 AM</option>
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                  <option value="03:00 PM - 05:00 PM">03:00 PM - 05:00 PM</option>
                  <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                </select>
              </div>

              <div className="form-group">
                <label>Darshan Category</label>
                <select
                  className="form-control"
                  value={slotForm.slotType}
                  onChange={(e) => setSlotForm({ ...slotForm, slotType: e.target.value })}
                >
                  <option value="General">General</option>
                  <option value="VIP">VIP</option>
                  <option value="Special Pooja">Special Pooja</option>
                </select>
              </div>

              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={slotForm.price}
                  onChange={(e) => setSlotForm({ ...slotForm, price: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Devotee Capacity</label>
                <input
                  type="number"
                  className="form-control"
                  value={slotForm.maxCapacity}
                  onChange={(e) => setSlotForm({ ...slotForm, maxCapacity: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-sm">Schedule Slot</button>
                <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setShowSlotForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Timings</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((s) => (
                  <tr key={s._id}>
                    <td>{s.date}</td>
                    <td>{s.timeSlot}</td>
                    <td>{s.slotType}</td>
                    <td>{s.price === 0 ? 'Free' : `₹${s.price}`}</td>
                    <td>{s.bookedCount} / {s.maxCapacity} booked</td>
                    <td>
                      <button className="icon-delete-btn" onClick={() => handleDeleteSlot(s._id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Bookings list */}
        <div className="bookings-overview">
          <div className="section-header">
            <h2>Devotee Bookings</h2>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Devotee</th>
                  <th>Pilgrims</th>
                  <th>Slot Info</th>
                  <th>Payment Info</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td><strong>{b.bookingReference}</strong></td>
                    <td>{b.user?.name}</td>
                    <td>{b.devotees.length} pilgrim(s)</td>
                    <td>{b.slot?.date} <br /><small>{b.slot?.timeSlot} ({b.slot?.slotType})</small></td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>
                        <strong>Method:</strong> {b.paymentMethod || 'Card'} <br />
                        {b.transactionId && <><strong>UTR:</strong> <code>{b.transactionId}</code> <br /></>}
                        {b.upiId && <><strong>UPI ID:</strong> <code>{b.upiId}</code></>}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${b.status.toLowerCase().replace(' ', '-')}`}>{b.status}</span>
                    </td>
                    <td>
                      {b.status === 'Pending Verification' && (
                        <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
                          <button 
                            className="btn btn-success btn-sm" 
                            onClick={() => handleVerifyPayment(b._id)}
                            style={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                          >
                            Verify
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm" 
                            onClick={() => handleRejectPayment(b._id)}
                            style={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .organizer-container {
          padding-top: 40px;
          padding-bottom: 80px;
          min-height: calc(100vh - 200px);
        }

        .org-header {
          margin-bottom: 30px;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }

        .org-icon {
          color: var(--primary);
          width: 32px;
          height: 32px;
        }

        .org-header h1 {
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--secondary);
        }

        .org-header p {
          color: var(--text-muted);
          font-size: 1.05rem;
        }

        .temple-selector-card {
          padding: 20px;
          margin-bottom: 40px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .temple-selector-card label {
          font-weight: 700;
          color: var(--secondary);
          white-space: nowrap;
        }

        .temple-selector-card select {
          max-width: 400px;
        }

        /* Layout Columns */
        .dashboard-sections {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h2 {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--secondary);
        }

        /* Inline Forms */
        .slot-form {
          margin-bottom: 24px;
          border-color: var(--primary);
        }

        .slot-form h3 {
          font-size: 1.1rem;
          margin-bottom: 16px;
          color: var(--secondary);
        }

        .slot-form .form-group {
          margin-bottom: 12px;
        }

        .slot-form .form-control {
          padding: 8px 12px;
          font-size: 0.9rem;
        }

        .slot-form .form-actions {
          margin-top: 16px;
          display: flex;
          gap: 10px;
        }

        .icon-delete-btn {
          background: none;
          border: none;
          color: var(--danger);
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          transition: var(--transition);
        }

        .icon-delete-btn:hover {
          background-color: #fef2f2;
        }

        .status-pill {
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: 50px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-pill.confirmed { background-color: #ecfdf5; color: var(--success); }
        .status-pill.cancelled { background-color: #fef2f2; color: var(--danger); }

        @media (max-width: 992px) {
          .dashboard-sections {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 576px) {
          .temple-selector-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .temple-selector-card select {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default OrganizerDashboard;
