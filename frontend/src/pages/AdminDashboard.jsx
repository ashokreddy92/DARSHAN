import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Shield, LayoutDashboard, Landmark, CalendarRange, Ticket, HelpCircle, Heart, Plus, Trash2, Edit } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Database Data States
  const [temples, setTemples] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [donations, setDonations] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(true);

  // Selected Temple for Slots View
  const [selectedTempleForSlots, setSelectedTempleForSlots] = useState('');

  // Temple Create Form State
  const [templeForm, setTempleForm] = useState({
    name: '', city: '', state: '', description: '', deity: '', imageUrl: '', openingHours: '', speciality: ''
  });
  const [showTempleForm, setShowTempleForm] = useState(false);

  // Slot Create Form State
  const [slotForm, setSlotForm] = useState({
    temple: '', date: '', timeSlot: '06:00 AM - 08:00 AM', maxCapacity: 50, price: 0, slotType: 'General'
  });
  const [showSlotForm, setShowSlotForm] = useState(false);

  // Editing States
  const [editingTempleId, setEditingTempleId] = useState(null);
  const [editingSlotId, setEditingSlotId] = useState(null);

  // Fetch Stats Overview Data
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Temples
      const templesRes = await axios.get('http://localhost:5000/api/temples');
      if (templesRes.data.success) {
        setTemples(templesRes.data.data);
        if (templesRes.data.data.length > 0) {
          setSelectedTempleForSlots(templesRes.data.data[0]._id);
          setSlotForm((prev) => ({ ...prev, temple: templesRes.data.data[0]._id }));
        }
      }

      // Fetch Bookings
      const bookingsRes = await axios.get('http://localhost:5000/api/bookings');
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.data);
      }

      // Fetch Donations
      const donationsRes = await axios.get('http://localhost:5000/api/donations');
      if (donationsRes.data.success) {
        setDonations(donationsRes.data.data);
      }

    } catch (err) {
      toast.error('Error fetching admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Slots for Selected Temple
  const fetchSlotsForTemple = async (templeId) => {
    if (!templeId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/slots/temple/${templeId}`);
      if (res.data.success) {
        setSlots(res.data.data);
      }
    } catch (err) {
      toast.error('Error fetching slots');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTempleForSlots) {
      fetchSlotsForTemple(selectedTempleForSlots);
    }
  }, [selectedTempleForSlots]);

  // CREATE or UPDATE Temple
  const handleTempleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTempleId) {
        // UPDATE
        const res = await axios.put(`http://localhost:5000/api/temples/${editingTempleId}`, templeForm);
        if (res.data.success) {
          toast.success('Temple updated successfully!');
          setTempleForm({ name: '', city: '', state: '', description: '', deity: '', imageUrl: '', openingHours: '', speciality: '' });
          setEditingTempleId(null);
          setShowTempleForm(false);
          fetchData();
        }
      } else {
        // CREATE
        const res = await axios.post('http://localhost:5000/api/temples', templeForm);
        if (res.data.success) {
          toast.success('Temple created successfully!');
          setTempleForm({ name: '', city: '', state: '', description: '', deity: '', imageUrl: '', openingHours: '', speciality: '' });
          setShowTempleForm(false);
          fetchData();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${editingTempleId ? 'update' : 'create'} temple`);
    }
  };

  // Populate Temple edit form
  const handleTempleEditClick = (temple) => {
    setEditingTempleId(temple._id);
    setTempleForm({
      name: temple.name,
      city: temple.location.city,
      state: temple.location.state,
      description: temple.description,
      deity: temple.deity,
      imageUrl: temple.imageUrl || '',
      openingHours: temple.openingHours || '',
      speciality: temple.speciality || ''
    });
    setShowTempleForm(true);
  };

  // DELETE Temple
  const handleDeleteTemple = async (id) => {
    if (!window.confirm('Are you sure you want to delete this temple? This will not cascade deletion of bookings, delete with care.')) {
      return;
    }
    try {
      const res = await axios.delete(`http://localhost:5000/api/temples/${id}`);
      if (res.data.success) {
        toast.success('Temple deleted successfully');
        fetchData();
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  // CREATE or UPDATE Slot
  const handleSlotSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSlotId) {
        // UPDATE
        const res = await axios.put(`http://localhost:5000/api/slots/${editingSlotId}`, slotForm);
        if (res.data.success) {
          toast.success('Darshan slot updated successfully!');
          setSlotForm({
            temple: selectedTempleForSlots, date: '', timeSlot: '06:00 AM - 08:00 AM', maxCapacity: 50, price: 0, slotType: 'General'
          });
          setEditingSlotId(null);
          setShowSlotForm(false);
          fetchSlotsForTemple(selectedTempleForSlots);
        }
      } else {
        // CREATE
        const res = await axios.post('http://localhost:5000/api/slots', slotForm);
        if (res.data.success) {
          toast.success('Darshan slot scheduled successfully!');
          setSlotForm({
            temple: selectedTempleForSlots, date: '', timeSlot: '06:00 AM - 08:00 AM', maxCapacity: 50, price: 0, slotType: 'General'
          });
          setShowSlotForm(false);
          fetchSlotsForTemple(selectedTempleForSlots);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${editingSlotId ? 'update' : 'schedule'} slot`);
    }
  };

  // Populate Slot edit form
  const handleSlotEditClick = (slot) => {
    setEditingSlotId(slot._id);
    setSlotForm({
      temple: slot.temple,
      date: slot.date,
      timeSlot: slot.timeSlot,
      maxCapacity: slot.maxCapacity,
      price: slot.price,
      slotType: slot.slotType
    });
    setShowSlotForm(true);
  };

  // DELETE Slot
  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/slots/${id}`);
      if (res.data.success) {
        toast.success('Slot removed');
        fetchSlotsForTemple(selectedTempleForSlots);
      }
    } catch (err) {
      toast.error('Failed to remove slot');
    }
  };

  // CANCEL Booking
  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/bookings/${id}/cancel`);
      if (res.data.success) {
        toast.success('Booking cancelled');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  // Stats Calculations
  const activeSlotsCount = slots.length; // for currently selected temple, or total in seeded DB
  const totalDonations = donations.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="admin-container container">
      {/* Page Header */}
      <div className="admin-header">
        <div className="title-section">
          <Shield className="admin-shield" />
          <h1>Admin Control Panel</h1>
        </div>
        <p>Global system management for temples, slot capacity, devotee bookings, and donations ledger logs.</p>
      </div>

      {/* Tabs Row */}
      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <LayoutDashboard size={18} /> Overview
        </button>
        <button className={`tab-btn ${activeTab === 'temples' ? 'active' : ''}`} onClick={() => setActiveTab('temples')}>
          <Landmark size={18} /> Temples
        </button>
        <button className={`tab-btn ${activeTab === 'slots' ? 'active' : ''}`} onClick={() => setActiveTab('slots')}>
          <CalendarRange size={18} /> Darshan Slots
        </button>
        <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
          <Ticket size={18} /> Bookings Logs
        </button>
        <button className={`tab-btn ${activeTab === 'donations' ? 'active' : ''}`} onClick={() => setActiveTab('donations')}>
          <Heart size={18} /> Donations
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Syncing records...</div>
      ) : (
        <div className="tab-content-panel">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="stats-cards-grid">
                <div className="stat-card">
                  <span className="stat-title">Total Temples</span>
                  <span className="stat-value">{temples.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-title">Total Bookings</span>
                  <span className="stat-value">{bookings.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-title">Confirmed Bookings</span>
                  <span className="stat-value text-success">
                    {bookings.filter((b) => b.status === 'Confirmed').length}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-title">Donations Raised</span>
                  <span className="stat-value text-primary">₹{totalDonations}</span>
                </div>
              </div>

              <div className="recent-activity-layout grid-2">
                {/* Recent Bookings */}
                <div className="activity-card card">
                  <h3>Recent Bookings</h3>
                  <div className="activity-list">
                    {bookings.slice(0, 5).map((b) => (
                      <div key={b._id} className="activity-item">
                        <div>
                          <strong>{b.user?.name || 'Devotee'}</strong> booked {b.devotees.length} pilgrim ticket(s)
                          <div className="activity-sub">{b.temple?.name}</div>
                        </div>
                        <span className={`badge ${b.status.toLowerCase()}`}>{b.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Donations */}
                <div className="activity-card card">
                  <h3>Recent Donations</h3>
                  <div className="activity-list">
                    {donations.slice(0, 5).map((d) => (
                      <div key={d._id} className="activity-item">
                        <div>
                          <strong>{d.donorName}</strong> donated for {d.purpose}
                          <div className="activity-sub">{d.temple?.name || 'General Fund'}</div>
                        </div>
                        <span className="amount-txt font-bold">₹{d.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TEMPLES TAB */}
          {activeTab === 'temples' && (
            <div className="temples-tab">
              <div className="section-actions">
                <h2>Manage Temples</h2>
                <button className="btn btn-primary" onClick={() => setShowTempleForm(!showTempleForm)}>
                  <Plus size={16} /> Add New Temple
                </button>
              </div>

              {/* Temple Form Drawer/Box */}
              {showTempleForm && (
                <form onSubmit={handleTempleSubmit} className="admin-form card">
                  <h3>{editingTempleId ? 'Edit Temple' : 'Register New Temple'}</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Temple Name *</label>
                      <input type="text" className="form-control" value={templeForm.name} onChange={(e) => setTempleForm({ ...templeForm, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Deity *</label>
                      <input type="text" className="form-control" value={templeForm.deity} onChange={(e) => setTempleForm({ ...templeForm, deity: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>City *</label>
                      <input type="text" className="form-control" value={templeForm.city} onChange={(e) => setTempleForm({ ...templeForm, city: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input type="text" className="form-control" value={templeForm.state} onChange={(e) => setTempleForm({ ...templeForm, state: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Image URL</label>
                      <input type="text" className="form-control" value={templeForm.imageUrl} onChange={(e) => setTempleForm({ ...templeForm, imageUrl: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Opening Hours</label>
                      <input type="text" className="form-control" placeholder="06:00 AM - 09:00 PM" value={templeForm.openingHours} onChange={(e) => setTempleForm({ ...templeForm, openingHours: e.target.value })} />
                    </div>
                    <div className="form-group full-width">
                      <label>Description *</label>
                      <textarea rows="3" className="form-control" value={templeForm.description} onChange={(e) => setTempleForm({ ...templeForm, description: e.target.value })} required></textarea>
                    </div>
                    <div className="form-group full-width">
                      <label>Specialities & Prasadam Details</label>
                      <textarea rows="2" className="form-control" value={templeForm.speciality} onChange={(e) => setTempleForm({ ...templeForm, speciality: e.target.value })}></textarea>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">{editingTempleId ? 'Update Temple' : 'Create Temple'}</button>
                    <button type="button" className="btn btn-outline-dark" onClick={() => {
                      setShowTempleForm(false);
                      setEditingTempleId(null);
                      setTempleForm({ name: '', city: '', state: '', description: '', deity: '', imageUrl: '', openingHours: '', speciality: '' });
                    }}>Cancel</button>
                  </div>
                </form>
              )}

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Temple Name</th>
                      <th>Location</th>
                      <th>Primary Deity</th>
                      <th>Opening Hours</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {temples.map((temple) => (
                      <tr key={temple._id}>
                        <td><strong>{temple.name}</strong></td>
                        <td>{temple.location.city}, {temple.location.state}</td>
                        <td>{temple.deity}</td>
                        <td>{temple.openingHours}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="icon-action-btn edit" onClick={() => handleTempleEditClick(temple)} style={{ color: 'var(--primary)' }}>
                              <Edit size={16} />
                            </button>
                            <button className="icon-action-btn delete" onClick={() => handleDeleteTemple(temple._id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SLOTS TAB */}
          {activeTab === 'slots' && (
            <div className="slots-tab">
              <div className="section-actions">
                <div className="selection-picker">
                  <span>Select Temple:</span>
                  <select 
                    value={selectedTempleForSlots} 
                    onChange={(e) => {
                      setSelectedTempleForSlots(e.target.value);
                      setSlotForm((prev) => ({ ...prev, temple: e.target.value }));
                    }}
                    className="form-control inline-select"
                  >
                    {temples.map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <button className="btn btn-primary" onClick={() => setShowSlotForm(!showSlotForm)}>
                  <Plus size={16} /> Create Darshan Slot
                </button>
              </div>

              {/* Slot creation form */}
              {showSlotForm && (
                <form onSubmit={handleSlotSubmit} className="admin-form card">
                  <h3>{editingSlotId ? 'Edit Darshan Slot' : 'Schedule Darshan Slot'}</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Date *</label>
                      <input type="date" className="form-control" value={slotForm.date} onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Time Slot *</label>
                      <select className="form-control" value={slotForm.timeSlot} onChange={(e) => setSlotForm({ ...slotForm, timeSlot: e.target.value })}>
                        <option value="06:00 AM - 08:00 AM">06:00 AM - 08:00 AM</option>
                        <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                        <option value="03:00 PM - 05:00 PM">03:00 PM - 05:00 PM</option>
                        <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Slot Type *</label>
                      <select className="form-control" value={slotForm.slotType} onChange={(e) => setSlotForm({ ...slotForm, slotType: e.target.value })}>
                        <option value="General">General</option>
                        <option value="VIP">VIP</option>
                        <option value="Special Pooja">Special Pooja</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Max Ticket Capacity *</label>
                      <input type="number" className="form-control" value={slotForm.maxCapacity} onChange={(e) => setSlotForm({ ...slotForm, maxCapacity: parseInt(e.target.value) })} required />
                    </div>
                    <div className="form-group">
                      <label>Ticket Price (INR) *</label>
                      <input type="number" className="form-control" value={slotForm.price} onChange={(e) => setSlotForm({ ...slotForm, price: parseInt(e.target.value) })} required />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">{editingSlotId ? 'Update Slot' : 'Schedule Slot'}</button>
                    <button type="button" className="btn btn-outline-dark" onClick={() => {
                      setShowSlotForm(false);
                      setEditingSlotId(null);
                      setSlotForm({
                        temple: selectedTempleForSlots, date: '', timeSlot: '06:00 AM - 08:00 AM', maxCapacity: 50, price: 0, slotType: 'General'
                      });
                    }}>Cancel</button>
                  </div>
                </form>
              )}

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>Slot Type</th>
                      <th>Price</th>
                      <th>Capacity Stats</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((slot) => {
                      const available = slot.maxCapacity - slot.bookedCount;
                      return (
                        <tr key={slot._id}>
                          <td>{slot.date}</td>
                          <td>{slot.timeSlot}</td>
                          <td>
                            <span className={`tag-badge ${slot.slotType.toLowerCase().replace(' ', '-')}`}>
                              {slot.slotType}
                            </span>
                          </td>
                          <td>{slot.price === 0 ? 'Free' : `₹${slot.price}`}</td>
                          <td>
                            <strong>{slot.bookedCount}</strong> / {slot.maxCapacity} booked ({available} left)
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="icon-action-btn edit" onClick={() => handleSlotEditClick(slot)} style={{ color: 'var(--primary)' }}>
                                <Edit size={16} />
                              </button>
                              <button className="icon-action-btn delete" onClick={() => handleDeleteSlot(slot._id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="bookings-tab">
              <h2>User Booking Registrations</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Reference No</th>
                      <th>Devotee Name</th>
                      <th>Temple</th>
                      <th>Slot Info</th>
                      <th>Pilgrims</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td><strong>{booking.bookingReference}</strong></td>
                        <td>{booking.user?.name || 'Unknown'}</td>
                        <td>{booking.temple?.name}</td>
                        <td>
                          {booking.slot?.date} <br />
                          <small>{booking.slot?.timeSlot} ({booking.slot?.slotType})</small>
                        </td>
                        <td>{booking.devotees.length} pilgrim(s)</td>
                        <td>
                          <span className={`status-pill ${booking.status.toLowerCase()}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          {booking.status === 'Confirmed' && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleCancelBooking(booking._id)}>
                              Cancel Booking
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DONATIONS TAB */}
          {activeTab === 'donations' && (
            <div className="donations-tab">
              <h2>System Donations Audit</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Donor Name</th>
                      <th>Temple Destination</th>
                      <th>Purpose</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((donation) => (
                      <tr key={donation._id}>
                        <td><code>{donation.transactionId}</code></td>
                        <td>{donation.donorName}</td>
                        <td>{donation.temple?.name || 'General Fund'}</td>
                        <td>{donation.purpose}</td>
                        <td><strong>₹{donation.amount}</strong></td>
                        <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .admin-container {
          padding-top: 40px;
          padding-bottom: 80px;
          min-height: calc(100vh - 200px);
        }

        .admin-header {
          margin-bottom: 30px;
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }

        .admin-shield {
          color: var(--primary);
          width: 32px;
          height: 32px;
        }

        .admin-header h1 {
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--secondary);
        }

        .admin-header p {
          color: var(--text-muted);
          font-size: 1.05rem;
        }

        /* Tabs Bar */
        .admin-tabs {
          display: flex;
          gap: 10px;
          border-bottom: 1.5px solid var(--border);
          margin-bottom: 30px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-weight: 600;
          color: var(--text-muted);
          transition: var(--transition);
          white-space: nowrap;
        }

        .tab-btn:hover {
          color: var(--primary);
        }

        .tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        /* Overview stats */
        .stats-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
        }

        .stat-title {
          font-size: 0.85rem;
          color: var(--text-light);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--secondary);
        }

        .text-success { color: var(--success); }
        .text-primary { color: var(--primary); }

        .recent-activity-layout {
          margin-top: 20px;
        }

        .activity-card h3 {
          font-size: 1.15rem;
          margin-bottom: 20px;
          color: var(--secondary);
          border-bottom: 1px solid var(--border);
          padding-bottom: 10px;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          border-bottom: 1px dashed var(--border);
          padding-bottom: 10px;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-sub {
          font-size: 0.75rem;
          color: var(--text-light);
          margin-top: 2px;
        }

        .font-bold { font-weight: 700; }
        
        .badge {
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
        }
        .badge.confirmed { background-color: #ecfdf5; color: var(--success); }
        .badge.cancelled { background-color: #fef2f2; color: var(--danger); }

        /* Actions Section */
        .section-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .selection-picker {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .selection-picker span {
          font-weight: 600;
          color: var(--text-muted);
        }

        .inline-select {
          width: 250px;
          padding: 8px 12px;
        }

        /* Forms in Dashboard */
        .admin-form {
          margin-bottom: 30px;
          border-color: var(--primary);
        }

        .admin-form h3 {
          font-size: 1.25rem;
          margin-bottom: 20px;
          color: var(--secondary);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .form-group.full-width {
          grid-column: 1 / 3;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        /* Table Badges & Tags */
        .tag-badge {
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
        }

        .tag-badge.general { background-color: #f1f5f9; color: var(--text-muted); }
        .tag-badge.vip { background-color: #fef3c7; color: var(--primary-hover); }
        .tag-badge.special-pooja { background-color: #dbeafe; color: #1d4ed8; }

        .status-pill {
          font-size: 0.75rem;
          padding: 4px 10px;
          border-radius: 50px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-pill.confirmed { background-color: #ecfdf5; color: var(--success); }
        .status-pill.cancelled { background-color: #fef2f2; color: var(--danger); }

        .icon-action-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          transition: var(--transition);
        }

        .icon-action-btn.delete { color: var(--danger); }
        .icon-action-btn.delete:hover { background-color: #fef2f2; }

        .admin-loading {
          text-align: center;
          padding: 80px;
          font-size: 1.1rem;
          color: var(--text-muted);
        }

        @media (max-width: 900px) {
          .stats-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .form-group.full-width {
            grid-column: auto;
          }
          .section-actions {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
        }

        @media (max-width: 576px) {
          .stats-cards-grid {
            grid-template-columns: 1fr;
          }
          .admin-tabs {
            gap: 5px;
          }
          .tab-btn {
            padding: 10px 12px;
            font-size: 0.85rem;
          }
          .inline-select {
            width: 100%;
          }
          .selection-picker {
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
